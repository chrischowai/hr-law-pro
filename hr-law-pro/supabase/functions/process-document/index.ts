import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { RecursiveCharacterTextSplitter } from 'https://esm.sh/langchain@0.0.208/text_splitter'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false }
      }
    )

    const { documentId, filePath, metadata } = await req.json()

    if (!documentId || !filePath) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log(`Processing document ${documentId} from ${filePath}`)

    // Get file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('legal-documents')
      .download(filePath)

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`)
    }

    if (!fileData) {
      throw new Error('File data is empty')
    }

    // Extract text based on file type
    let fullText = ''
    const fileType = metadata?.fileType || 'application/octet-stream'

    try {
      if (fileType === 'application/pdf') {
        // For PDF files, we'll create a placeholder
        // In production, you'd use a PDF parsing library
        fullText = `PDF Document: ${metadata?.fileName || 'Unknown PDF'}\n\nThis is a placeholder for PDF content extraction. In production, this would extract the actual text content from the PDF file.`
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For Word documents, we'll create a placeholder
        fullText = `Word Document: ${metadata?.fileName || 'Unknown Word Document'}\n\nThis is a placeholder for Word content extraction. In production, this would extract the actual text content from the Word file.`
      } else if (fileType === 'text/plain' || fileType === 'text/markdown') {
        // For text files, we can read directly
        fullText = await fileData.text()
      } else {
        throw new Error(`Unsupported file type: ${fileType}`)
      }
    } catch (error) {
      throw new Error(`Failed to extract text: ${error.message}`)
    }

    console.log(`Extracted ${fullText.length} characters of text`)

    // Split text into chunks using LangChain
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', '? ', '! ', ' ', ''],
    })

    const chunks = await textSplitter.createDocuments([fullText])
    console.log(`Split into ${chunks.length} chunks`)

    // Generate embeddings for each chunk
    const embeddings = []
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]

      // Create embedding using Google Gemini API
      const embeddingResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'models/gemini-embedding-001',
            content: {
              parts: [{ text: chunk.pageContent }]
            },
            taskType: 'RETRIEVAL_DOCUMENT',
            title: metadata?.title || `Chunk ${i + 1}`
          }),
        }
      )

      if (!embeddingResponse.ok) {
        throw new Error(`Failed to generate embedding for chunk ${i + 1}`)
      }

      const embeddingData = await embeddingResponse.json()
      const embedding = embeddingData.embedding?.values

      if (!embedding || embedding.length !== 1536) {
        throw new Error(`Invalid embedding dimensions for chunk ${i + 1}`)
      }

      embeddings.push(embedding)
    }

    console.log(`Generated ${embeddings.length} embeddings`)

    // Insert chunks with embeddings into the database
    const chunkData = chunks.map((chunk, index) => ({
      title: `${metadata?.title || 'Document'} - Part ${index + 1}`,
      content: chunk.pageContent,
      metadata: {
        ...metadata,
        chunk_index: index,
        total_chunks: chunks.length,
        original_document_id: documentId,
        processing_completed: new Date().toISOString()
      },
      embedding: embeddings[index],
      document_type: metadata?.documentType || 'Unknown',
      jurisdiction: metadata?.jurisdiction || 'Unknown',
      client_id: metadata?.userId
    }))

    const { error: insertError } = await supabaseClient
      .from('legal_documents')
      .insert(chunkData)

    if (insertError) {
      throw new Error(`Failed to insert chunks: ${insertError.message}`)
    }

    // Update the original document to mark it as processed
    const { error: updateError } = await supabaseClient
      .from('legal_documents')
      .update({
        content: `Document processed successfully. Contains ${chunks.length} searchable chunks.`,
        metadata: {
          ...metadata,
          processingStatus: 'completed',
          chunks_count: chunks.length,
          processing_completed_at: new Date().toISOString()
        }
      })
      .eq('id', documentId)

    if (updateError) {
      throw new Error(`Failed to update document: ${updateError.message}`)
    }

    console.log(`Successfully processed document ${documentId}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Document processed successfully',
        chunks: chunks.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error processing document:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process document'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
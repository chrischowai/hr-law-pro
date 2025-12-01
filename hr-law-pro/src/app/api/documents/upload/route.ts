import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const jurisdiction = formData.get('jurisdiction') as string
    const documentType = formData.get('documentType') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${user.id}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('legal-documents')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('legal-documents')
      .getPublicUrl(filePath)

    // Queue document for processing (we'll implement the actual processing later)
    // For now, we'll create a placeholder document
    const { data: documentData, error: documentError } = await supabase
      .from('legal_documents')
      .insert({
        title: title || file.name,
        content: 'Document queued for processing...',
        metadata: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          filePath: filePath,
          publicUrl: publicUrl,
          description: description,
          processingStatus: 'queued'
        },
        document_type: documentType,
        jurisdiction: jurisdiction,
        client_id: user.id
      })
      .select()
      .single()

    if (documentError) {
      console.error('Document creation error:', documentError)
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
    }

    // TODO: Trigger edge function for document processing
    // This will extract text, create embeddings, and update the document

    return NextResponse.json({
      success: true,
      document: documentData,
      message: 'Document uploaded successfully and queued for processing'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds for large file processing
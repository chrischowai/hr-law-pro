'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Upload, File, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const SUPPORTED_TYPES = {
  'application/pdf': { ext: '.pdf', icon: '📄' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', icon: '📝' },
  'text/plain': { ext: '.txt', icon: '📃' },
  'text/markdown': { ext: '.md', icon: '📝' },
}

const JURISDICTIONS = [
  'Federal',
  'California',
  'New York',
  'Texas',
  'Florida',
  'Illinois',
  'Pennsylvania',
  'Ohio',
  'Georgia',
  'North Carolina',
  'Michigan',
  'New Jersey',
  'Virginia',
  'Washington',
  'Arizona',
  'Massachusetts',
  'Tennessee',
  'Indiana',
  'Missouri',
  'Maryland',
  'Wisconsin',
  'Colorado',
  'Minnesota',
  'South Carolina',
  'Alabama',
  'Louisiana',
  'Kentucky',
  'Oregon',
  'Oklahoma',
  'Connecticut',
  'Utah',
  'Iowa',
  'Nevada',
  'Arkansas',
  'Mississippi',
  'Kansas',
  'New Mexico',
  'Nebraska',
  'West Virginia',
  'Idaho',
  'Hawaii',
  'New Hampshire',
  'Maine',
  'Rhode Island',
  'Montana',
  'Delaware',
  'South Dakota',
  'North Dakota',
  'Alaska',
  'Vermont',
  'Wyoming',
]

const DOCUMENT_TYPES = [
  'Contract',
  'Agreement',
  'Policy',
  'Regulation',
  'Statute',
  'Case Law',
  'Legal Opinion',
  'Compliance Document',
  'Employee Handbook',
  'HR Policy',
  'Training Material',
  'Legal Brief',
  'Pleading',
  'Discovery Document',
  'Other',
]

export default function DocumentUploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    jurisdiction: '',
    documentType: '',
    description: '',
  })

  const onDrop = (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file =>
      Object.keys(SUPPORTED_TYPES).includes(file.type)
    )

    if (validFiles.length !== acceptedFiles.length) {
      toast.error('Some files were rejected. Only PDF, Word, TXT, and MD files are supported.')
    }

    setFiles(prev => [...prev, ...validFiles])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.keys(SUPPORTED_TYPES).reduce((acc, type) => ({
      ...acc,
      [type]: []
    }), {}),
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      toast.error('Please select at least one file to upload.')
      return
    }

    if (!formData.jurisdiction || !formData.documentType) {
      toast.error('Please fill in all required fields.')
      return
    }

    setIsUploading(true)

    try {
      // Process each file
      for (const file of files) {
        const formDataToSend = new FormData()
        formDataToSend.append('file', file)
        formDataToSend.append('title', formData.title || file.name)
        formDataToSend.append('jurisdiction', formData.jurisdiction)
        formDataToSend.append('documentType', formData.documentType)
        formDataToSend.append('description', formData.description)

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formDataToSend,
        })

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`)
        }
      }

      toast.success(`Successfully uploaded ${files.length} document(s)!`)
      setFiles([])
      setFormData({
        title: '',
        jurisdiction: '',
        documentType: '',
        description: '',
      })
    } catch (error) {
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upload Legal Documents</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Add new legal documents to your knowledge base. Supported formats: PDF, Word (.docx), Text (.txt), and Markdown (.md).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Select Documents</CardTitle>
            <CardDescription>
              Drag and drop your files here, or click to select files. Maximum file size: 10MB per file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isDragActive ? 'Drop the files here...' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to select files
              </p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Selected Files:</h3>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {SUPPORTED_TYPES[file.type as keyof typeof SUPPORTED_TYPES]?.icon || '📄'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
            <CardDescription>
              Provide metadata for the documents to help with organization and search.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                <Select
                  value={formData.jurisdiction}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, jurisdiction: value }))}
                >
                  <SelectTrigger id="jurisdiction">
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {JURISDICTIONS.map((jurisdiction) => (
                      <SelectItem key={jurisdiction} value={jurisdiction}>
                        {jurisdiction}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type *</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value }))}
                >
                  <SelectTrigger id="documentType">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter document title (optional - filename will be used if empty)"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a brief description of the document content (optional)"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFiles([])
              setFormData({
                title: '',
                jurisdiction: '',
                documentType: '',
                description: '',
              })
            }}
            disabled={isUploading}
          >
            Clear All
          </Button>
          <Button type="submit" disabled={isUploading || files.length === 0}>
            {isUploading ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents ({files.length})
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
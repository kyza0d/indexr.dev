import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { FileIcon, Globe, UploadIcon, XIcon, Lock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AutoTagger } from '@/components/dataset/auto-tagger'
import { useSession } from 'next-auth/react'

const FormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  file: z
    .custom<File | null>(
      (val) => val instanceof File || val === null,
      { message: 'Please select a file' }
    )
    .nullable(),
  tags: z.array(z.string()),
  isPublic: z.boolean().default(false),
})

interface UploadDatasetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadSuccess: () => void
}

const CustomTagInput = ({
  value,
  onChange,
}: {
  value: string[]
  onChange: (value: string[]) => void
}) => {
  const [inputValue, setInputValue] = useState('')
  const [tags, setTags] = useState(value)

  useEffect(() => {
    setTags(value)
  }, [value])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputValue) {
      event.preventDefault()
      const newTags = [...tags, inputValue]
      setTags(newTags)
      onChange(newTags)
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(newTags)
    onChange(newTags)
  }

  return (
    <div className="flex flex-wrap gap-2 border rounded-md p-2">
      {tags.map((tag, index) => (
        <div
          key={index}
          className="h-10 inline-flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
        >
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="ml-2">
            <XIcon size={16} />
          </button>
        </div>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-fit inline-flex flex-grow border-none shadow-none"
        placeholder="Add a tag..."
      />
    </div>
  )
}

export function UploadDatasetDialog({
  open,
  onOpenChange,
  onUploadSuccess,
}: UploadDatasetDialogProps) {
  const { data: session } = useSession()
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')

  const [triggerTagGeneration, setTriggerTagGeneration] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      description: '',
      tags: [],
      file: null,
      isPublic: session?.user?.publicByDefault || false,
    },
  })

  const handleSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsUploading(true)
    const formData = new FormData()
    if (data.file) {
      formData.append('file', data.file)
    }
    formData.append('name', data.name)
    formData.append('description', data.description || '')
    formData.append('tags', JSON.stringify(data.tags))
    formData.append('isPublic', data.isPublic.toString())

    try {
      const response = await fetch('/api/datasets/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      // Optionally use the result
      // const result = await response.json()

      await response.json() // Consume the response body
      toast({
        title: 'Success',
        description: 'Dataset uploaded successfully.',
      })
      onOpenChange(false)
      onUploadSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload dataset. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    form.setValue('file', file)
    if (file) {
      setSelectedFileName(file.name)

      // Read file content
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setFileContent(content)

        // Trigger tag generation if autoTag is enabled
        if (session?.user?.autoTag) {
          setTriggerTagGeneration(true)
        }
      }
      reader.readAsText(file)
    } else {
      setSelectedFileName(null)
      setFileContent('')
      setTriggerTagGeneration(false)
    }
  }

  const clearFileSelection = (e: React.MouseEvent) => {
    e.preventDefault()
    form.setValue('file', null)
    setSelectedFileName(null)
    setFileContent('')
    setTriggerTagGeneration(false)
  }

  const handleFileButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('file-upload')?.click()
  }

  const handleTagsGenerated = (tags: string[]) => {
    form.setValue('tags', tags)
    setTriggerTagGeneration(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Upload Dataset</DialogTitle>
          <DialogDescription>
            Upload a new dataset to your account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input
                        type="file"
                        className="hidden"
                        accept=".csv, .json"
                        onChange={handleFileChange}
                        id="file-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={handleFileButtonClick}
                        className="flex-grow"
                        type="button"
                      >
                        <FileIcon className="h-4 w-4 mr-2" />
                        {selectedFileName || 'Select a file'}
                      </Button>
                      {selectedFileName && (
                        <Button
                          variant="ghost"
                          onClick={clearFileSelection}
                          className="ml-2"
                          type="button"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    .csv, .json
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <CustomTagInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>
                    Add relevant tags to your dataset
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedFileName && session?.user?.autoTag && (
              <AutoTagger
                fileName={selectedFileName}
                fileContent={fileContent}
                onTagsGenerated={handleTagsGenerated}
                trigger={triggerTagGeneration}
              />
            )}
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {field.value ? (
                        <Globe className="h-4 w-4 inline-block mr-2" />
                      ) : (
                        <Lock className="h-4 w-4 inline-block mr-2" />
                      )}
                      {field.value ? 'Public' : 'Private'}
                    </FormLabel>
                    <FormDescription>
                      {field.value
                        ? 'This dataset will be visible to everyone.'
                        : 'Only you can see this dataset.'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isUploading}>
                <UploadIcon className="mr-2 h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

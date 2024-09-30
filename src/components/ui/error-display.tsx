import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorDisplayProps {
  message: string
  title?: string
}

export function ErrorDisplay({ message, title = 'Error' }: ErrorDisplayProps) {
  return (
    <Alert variant="destructive" className="max-w-md mx-auto mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

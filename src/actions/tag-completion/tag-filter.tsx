'use client'

import React, { useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface DatasetTagFilterProps {
  allTags: string[]
}

/**
 * Renders a list of tags as checkboxes to filter datasets.
 *
 * @param {DatasetTagFilterProps} props - Props containing the list of all tags.
 */
export function DatasetTagFilter({ allTags }: DatasetTagFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedTags = useMemo(() => searchParams.getAll('tag'), [searchParams])

  /**
   * Handles the change event when a tag checkbox is toggled.
   *
   * @param tag - The tag that was toggled.
   * @param checked - The new checked state of the checkbox.
   */
  const handleTagChange = useCallback(
    (tag: string, checked: boolean) => {
      const updatedSearchParams = new URLSearchParams(Array.from(searchParams.entries()))
      const tags = updatedSearchParams.getAll('tag')

      console.log('Before change - Selected tags:', tags);

      if (checked && !tags.includes(tag)) {
        updatedSearchParams.append('tag', tag)
      } else if (!checked) {
        const newTags = tags.filter((t) => t !== tag)
        updatedSearchParams.delete('tag')
        newTags.forEach((t) => updatedSearchParams.append('tag', t))
      }

      const search = updatedSearchParams.toString()
      const query = search ? `?${search}` : ''
      console.log('After change - Updated search query:', query);
      router.push(`/explore${query}`)
    },
    [searchParams, router]
  )

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Filter by Tags</h2>
      <div className="space-y-2">
        {allTags.map((tag) => (
          <div key={tag} className="flex items-center space-x-2">
            <Checkbox
              id={`tag-${tag}`}
              checked={selectedTags.includes(tag)}
              onCheckedChange={(checked) => handleTagChange(tag, !!checked)}
            />
            <Label htmlFor={`tag-${tag}`}>{tag}</Label>
          </div>
        ))}
      </div>
    </div>
  )
}

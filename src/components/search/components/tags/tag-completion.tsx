'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils"
import { useDatasetSearch } from '@/dataset/provider'
import { Input } from '@/components/ui/input';

type Tag = {
  id: string
  name: string
}

export function TagCompletion() {
  const { query, tags: selectedTags, setQuery, addTag, removeTag } = useDatasetSearch()
  const [inputValue, setInputValue] = useState(query)
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [filteredTags, setFilteredTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1)

  const fetchAllTags = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/tags')
      if (!response.ok) {
        throw new Error('Failed to fetch tags')
      }
      const data = await response.json()
      setAllTags(data)
    } catch (err) {
      setError('Error fetching tags')
      console.error('Error fetching tags:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllTags()
  }, [fetchAllTags])

  const getTagQuery = (value: string, position: number): string | null => {
    const beforeCursor = value.slice(0, position)
    const match = beforeCursor.match(/#([^#\s]*)$/)
    return match ? match[1] : null
  }


  const tagQuery = useMemo(() => getTagQuery(inputValue, cursorPosition), [inputValue, cursorPosition])

  useEffect(() => {
    if (tagQuery) {
      const lowercaseQuery = tagQuery.toLowerCase().replace(/_/g, ' ')
      const filtered = allTags.filter(tag =>
        tag.name.toLowerCase().includes(lowercaseQuery)
      )
      setFilteredTags(filtered)
      setSuggestionsOpen(true)
    } else {
      setFilteredTags([])
      setSuggestionsOpen(false)
    }
  }, [tagQuery, allTags])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setQuery(newValue)
    setCursorPosition(e.target.selectionStart || 0)
    setFocusedSuggestionIndex(-1)
  }

  const insertTag = (selectedTag: string) => {
    const beforeCursor = inputValue.slice(0, cursorPosition)
    const afterCursor = inputValue.slice(cursorPosition)
    const replaceRegex = /#[^#\s]*$/
    const newValue = beforeCursor.replace(replaceRegex, '') + afterCursor
    setInputValue(newValue)
    setQuery(newValue)
    addTag(selectedTag.replace(/_/g, ' '))
    setSuggestionsOpen(false)
    setFocusedSuggestionIndex(-1)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestionsOpen) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setFocusedSuggestionIndex(prev => (prev + 1) % filteredTags.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedSuggestionIndex(prev => (prev - 1 + filteredTags.length) % filteredTags.length)
          break
        case 'Tab':
          e.preventDefault()
          if (focusedSuggestionIndex === -1) {
            setFocusedSuggestionIndex(0)
          } else {
            setFocusedSuggestionIndex(prev => (prev + 1) % filteredTags.length)
          }
          break
        case 'Enter':
          e.preventDefault()
          if (focusedSuggestionIndex !== -1) {
            insertTag(filteredTags[focusedSuggestionIndex].name)
          } else if (filteredTags.length > 0) {
            insertTag(filteredTags[0].name)
          }
          break
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // Trigger search is no longer needed as filtering is done automatically
    } else if (e.key === 'Backspace') {
      if (inputValue === '' || (inputRef.current && inputRef.current.selectionStart === 0 && inputRef.current.selectionEnd === 0)) {
        e.preventDefault()
        if (selectedTags.length > 0) {
          const lastTag = selectedTags[selectedTags.length - 1]
          removeTag(lastTag)
        }
      }
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    removeTag(tagToRemove)
  }

  return (
    <div>
      <div className="flex items-center p-2 mb-6 border rounded-md relative bg-background pl-8">
        {/* Search Icon */}
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-foreground/70" />

        {/* Tag Input Area */}
        <div className="flex flex-wrap items-center gap-2 w-full pl-2">
          {/* Render Selected Tags */}
          {selectedTags.map((tag) => (
            <div key={tag} className="flex items-center bg-primary text-primary-foreground px-2 py-1 rounded-md">
              <span>{tag}</span>
              <button
                className="ml-1 h-auto p-0 focus:outline-none"
                onClick={() => handleTagRemove(tag)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Input Field */}
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search datasets..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none focus:outline-none h-8"
          />
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {suggestionsOpen && (
        <div className="relative mt-2">
          <div className="absolute z-10 bg-background border rounded-md">
            <Command>
              <CommandList>
                {loading && <CommandItem disabled>Loading...</CommandItem>}
                {error && <CommandItem disabled>{error}</CommandItem>}
                {!loading && !error && filteredTags.length === 0 && (
                  <CommandEmpty>No tags found.</CommandEmpty>
                )}
                {!loading && !error && filteredTags.length > 0 && (
                  <CommandGroup>
                    {filteredTags.map((tag, index) => (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => insertTag(tag.name)}
                        className={cn(
                          focusedSuggestionIndex === index && "bg-accent"
                        )}
                      >
                        {tag.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>
        </div>
      )}
    </div>
  );
}

'use client'

import React, { useState, useEffect } from 'react'
import { UserDatasetList } from '@/components/dataset/user-list'
import { fetchDatasets } from '@/actions/dataset'
import { Loader2 } from 'lucide-react'

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const loadDatasets = async () => {
    setIsLoading(true)
    try {
      const { datasets: fetchedDatasets, error } = await fetchDatasets()
      if (error) {
        throw new Error(error)
      }
      setDatasets(fetchedDatasets)
    } catch (error) {
      console.error('Error fetching datasets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDatasets()
  }, [])

  const handleDatasetDeleted = () => {
    loadDatasets()
  }

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <UserDatasetList datasets={datasets} onDatasetDeleted={handleDatasetDeleted} />
      )}
    </div>
  )
}

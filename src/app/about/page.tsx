'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FileJson, Search, Users, Lock } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">About Indexr</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What is Indexr?</CardTitle>
          <CardDescription>Powerful data exploration and visualization tool</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Indexr is a comprehensive web-based application designed for efficient exploration and visualization of JSON and CSV datasets.
            It provides users with powerful tools to upload, analyze, and interact with complex data structures through an intuitive interface.
          </p>
          <p>
            Whether you&apos;re a data scientist, analyst, or developer, Indexr simplifies the process of understanding and working with large datasets.
          </p>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-4">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <FeatureCard
          icon={<FileJson className="h-8 w-8 text-primary-foreground" />}
          title="JSON and CSV Support"
          description="Upload and explore both JSON and CSV file formats with ease."
        />
        <FeatureCard
          icon={<Search className="h-8 w-8 text-primary-foreground" />}
          title="Advanced Search"
          description="Powerful search functionality to quickly find specific data points."
        />
        <FeatureCard
          icon={<Users className="h-8 w-8 text-primary-foreground" />}
          title="Collaboration"
          description="Share datasets with team members and collaborate on data analysis."
        />
        <FeatureCard
          icon={<Lock className="h-8 w-8 text-primary-foreground" />}
          title="Privacy Controls"
          description="Set datasets as public or private to control access."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Why Choose Indexr?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            <li>Intuitive interface for both beginners and advanced users</li>
            <li>Fast performance, even with large datasets</li>
            <li>Customizable views: tree view for hierarchical data, grid view for tabular data</li>
            <li>Automatic data type inference and visualization</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
    </Card>
  )
}

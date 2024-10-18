'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InlineDataExplorer } from '@/components/data/inline-data-explorer';
import { useInlineDataExplorer } from '@/hooks/use-inline-data-explorer';
import { parse } from 'csv-parse/sync';
import { FileType } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'; // Import resizable panels

export default function InlineDataViewerPage() {
  const [inputData, setInputData] = useState<string>(
    JSON.stringify(
      {
        "company": {
          "name": "TechNova Solutions",
          "founded": "2005-03-15T00:00:00Z",
          "isPublic": false,
          "employeeCount": 1500,
          "revenue": "$250,000,000",
          "growthRate": "12.5%",
          "CEO": null
        },
        "departments": [
          {
            "id": 1,
            "name": "Engineering",
            "head": "Jane Smith",
            "email": "j.smith@technova.com",
            "budget": "$5,000,000",
            "projectCount": 15
          },
          {
            "id": 2,
            "name": "Marketing",
            "head": "Mike Johnson",
            "email": "m.johnson@technova.com",
            "budget": "$3,500,000",
            "projectCount": 8
          },
          {
            "id": 3,
            "name": "Human Resources",
            "head": "Emily Brown",
            "email": "e.brown@technova.com",
            "budget": "$1,200,000",
            "projectCount": 3
          }
        ],
        "products": [
          {
            "id": "PROD-001",
            "name": "TechNova Cloud Suite",
            "launchDate": "2018-09-01T00:00:00Z",
            "currentVersion": "3.2.1",
            "price": "$199.99",
            "isSubscription": true,
            "features": ["Cloud Storage", "AI Analytics", "Real-time Collaboration"],
            "userRating": 4.7
          },
          {
            "id": "PROD-002",
            "name": "SecureGuard Pro",
            "launchDate": "2020-06-15T00:00:00Z",
            "currentVersion": "2.0.5",
            "price": "$299.99",
            "isSubscription": false,
            "features": ["Firewall", "Intrusion Detection", "VPN"],
            "userRating": 4.9
          }
        ],
        "financials": {
          "quarterlyResults": [
            {
              "quarter": "Q1 2023",
              "revenue": "$62,500,000",
              "expenses": "$48,750,000",
              "profit": "$13,750,000",
              "profitMargin": "22%"
            },
            {
              "quarter": "Q4 2022",
              "revenue": "$65,000,000",
              "expenses": "$50,700,000",
              "profit": "$14,300,000",
              "profitMargin": "22%"
            }
          ],
          "stockPrice": {
            "current": "$145.50",
            "high52Week": "$160.75",
            "low52Week": "$98.25",
            "marketCap": "3.6B"
          }
        },
        "hr": {
          "openPositions": 25,
          "averageTenure": "4.5 years",
          "diversityScore": 0.78,
          "benefitsEnrollmentDeadline": "2023-11-30T23:59:59Z",
          "salaryReviewPattern": "^(Junior|Senior)\\s(Developer|Manager|Analyst)$"
        },
        "itSystems": {
          "mainDatabase": {
            "type": "PostgreSQL",
            "version": "13.4",
            "lastBackup": "2023-10-16T22:00:00Z",
            "sizeGB": 1024,
            "connections": 500,
            "uptime": "99.99%"
          },
          "internalTools": [
            "Jira",
            "Confluence",
            "Slack",
            "GitLab",
            ""
          ]
        },
        "marketing": {
          "activeCampaigns": 12,
          "socialMediaFollowers": {
            "twitter": 50000,
            "linkedin": 75000,
            "facebook": 30000
          },
          "websiteStats": {
            "monthlyVisitors": 1000000,
            "bounceRate": "35%",
            "averageSessionDuration": "00:03:45"
          },
          "upcomingEvents": [
            {
              "name": "TechNova Developer Conference",
              "date": "2024-03-15T09:00:00Z",
              "expectedAttendees": 5000,
              "budget": "€750,000",
              "isVirtual": false
            }
          ]
        }
      },
      null,
      2
    )
  );

  const [fileType, setFileType] = useState<FileType>('application/json');
  const [inlineData, setInlineData] = useState<string | object>(inputData);

  const { isValidSyntax, error } = useInlineDataExplorer(inlineData, fileType);

  const validateInput = useCallback(
    (data: string) => {
      try {
        const jsonData = JSON.parse(data);
        setFileType('application/json');
        setInlineData(jsonData);
      } catch (jsonError) {
        try {
          parseCSV(data);
          setFileType('text/csv');
          setInlineData(data);
        } catch (csvError) {
          setFileType('application/json');
          setInlineData(data);
        }
      }
    },
    []
  );

  const parseCSV = (data: string) => {
    parse(data, { columns: true, skip_empty_lines: true });
  };

  useEffect(() => {
    validateInput(inputData);
  }, [inputData, validateInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputData(e.target.value);
  };

  return (
    <div className="flex flex-col h-[96vh]">

      <PanelGroup direction="horizontal" className='border rounded-md'>

        {/* Left Pane: JSON/CSV Input Area */}
        <Panel defaultSize={50} minSize={20}>
          <Textarea
            value={inputData}
            onChange={handleInputChange}
            rows={20}
            className="w-full h-full focus:outline-none border-none font-mono text-md resize-none"
            placeholder="Paste JSON or CSV data here..."
          />
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </Panel>

        <PanelResizeHandle className="w-[1px] cursor-row-resize relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-[1px] bg-border rounded"></div>
          </div>
        </PanelResizeHandle>

        {/* Right Pane: Data Explorer */}
        <Panel defaultSize={50} minSize={0}>
          {isValidSyntax.valid ? (
            <InlineDataExplorer inlineData={inlineData} fileType={fileType} />
          ) : (
            <div className="text-gray-500">Paste valid JSON or CSV on the left to see the data.</div>
          )}
        </Panel>
      </PanelGroup>
    </div>
  );
}

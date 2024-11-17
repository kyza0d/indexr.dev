import React, { useState } from 'react';
import { useTabs } from '../provider';
import { Button } from '@/components/ui/button';
import { TabsTrigger } from '@/components/ui/tabs';
import { AutoGrowingInput } from './input';
import { cn } from '@/lib/utils';

import { FileType } from '@/editor/provider';
import { X, FileJson, FileSpreadsheet } from 'lucide-react';
import { detectFileType } from "@/tabs/utils";

interface TabProps {
  id: string;
  name: string;
  isActive: boolean;
  isModified: boolean;
  content?: string;
}


export function Tab({ id, name, isModified, content = '' }: TabProps) {
  const { setActiveTab, closeTab, renameTab } = useTabs();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);

  const fileType = content ? detectFileType(content) : FileType.JSON;

  const FileIcon = fileType === FileType.JSON ? FileJson : FileSpreadsheet;

  const handleSubmitRename = () => {
    if (editedName.trim() !== '') {
      renameTab(id, editedName.trim());
    } else {
      setEditedName(name);
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditedName(name);
    setIsEditing(false);
  };

  return (
    <TabsTrigger
      value={id}
      onClick={() => setActiveTab(id)}
      className={cn(
        "group relative min-w-40 px-",
        isModified && "text-foreground",
      )}
    >
      <div className="flex items-center gap-2">
        <FileIcon
          size={16}
          className={cn(
            "flex-shrink-0",
          )}
        />
        {isEditing ? (
          <AutoGrowingInput
            value={editedName}
            onChange={setEditedName}
            onSubmit={handleSubmitRename}
            onCancel={handleCancelRename}
            autoFocus
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditing(true)}
            className="truncate max-w-[120px]"
          >
            {name}
          </span>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation();
              closeTab(id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </TabsTrigger>
  );
}

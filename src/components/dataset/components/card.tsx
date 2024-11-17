import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileJson2, FileSpreadsheet, User, MoreHorizontal, Trash2, BookmarkMinus } from 'lucide-react';

interface DatasetCardProps {
  dataset: {
    id: string;
    name: string;
    fileType: string;
    createdAt: string;
    tags?: { name: string }[];
    isSaved: boolean;
    isPublic: boolean;
    user?: {
      name: string | null;
      image: string | null;
    };
  };
  isOwner: boolean;
  onSave?: (id: string, isSaved: boolean) => void;
  onDelete?: (id: string) => void;
}

export const DatasetCard = ({
  dataset,
  onSave,
  onDelete,
}: DatasetCardProps) => {
  const { id, name, fileType, createdAt, tags, isSaved, user } = dataset;
  const FileIcon = fileType === 'text/csv' ? FileSpreadsheet : FileJson2;

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = () => {
    setIsDialogOpen(false);
    onDelete?.(id);
  };

  return (
    <div>
      <Link href={`/explore/${id}`}>
        <Card className="relative w-full min-h-[200px] h-full flex flex-col justify-between p-6 transition-colors hover:bg-accent/30 border-border">

          {/* File Icon and Title */}
          <div className="flex items-center gap-4 mb-6">
            <FileIcon className="h-7 w-7 text-foreground/80" />
            <div>
              <h3 className="font-medium text-base tracking-tight">{name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Tags Grid */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.map((tag) => (
                <Badge key={tag.name} variant="secondary" className="px-2 py-0.5 text-xs transition-colors">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* User Info */}
          <div className="flex items-center gap-3 border-t border-border pt-6">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.image || undefined} />
              <AvatarFallback>{user?.name ? user.name[0] : <User className="h-3 w-3" />}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground font-medium">
              {user?.name || 'Anonymous'}
            </span>
          </div>

          {/* Actions Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 p-0 hover:bg-border">
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {isSaved && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave?.(id, true);
                  }}
                  className="flex items-center gap-2 text-sm"
                >
                  <BookmarkMinus className="w-4 h-4" /> Unsave
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDialogOpen(true);
                }}
                className="flex items-center gap-2 text-sm text-red-600"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      </Link>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Dataset</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this dataset? This action cannot be undone.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

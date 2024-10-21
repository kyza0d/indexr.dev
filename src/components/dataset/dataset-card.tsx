import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileJson2, FileText, Calendar, Clock, Tag, Eye, BookmarkCheck, Bookmark, Trash2, Loader2, Globe, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DatasetCardProps {
  dataset: {
    id: string;
    name: string;
    description: string | null;
    fileType: string;
    createdAt: string;
    updatedAt: string;
    tags?: { name: string }[];
    isSaved: boolean;
    isPublic: boolean;
  };
  isOwner: boolean;
  onSave?: (id: string, isSaved: boolean) => void;
  onDelete?: (id: string) => void;
  savingId: string | null;
  deletingId: string | null;
  minimal?: boolean;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
  dataset,
  isOwner,
  onSave,
  onDelete,
  savingId,
  deletingId,
  minimal = false,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete && onDelete(dataset.id);
    setIsDeleteDialogOpen(false);
  };

  const CardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    minimal ? <Link href={`/explore/${dataset.id}`}>{children}</Link> : <>{children}</>;
  const cardProps = minimal ? { href: `/explore/${dataset.id}` } : {};

  return (
    <>
      <CardWrapper {...cardProps}>

        <Card className={`w-full ${minimal ? 'cursor-pointer' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center truncate">
                {dataset.fileType === 'text/csv' ? <FileSpreadsheet className="mr-3 h-6 w-6" /> : <FileJson2 className="mr-3 h-6 w-6" />}
                {dataset.name}
              </span>

              {!minimal && (
                <div>
                  {dataset.isPublic ? (<Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />) : (<Lock className="h-4 w-4 text-gray-500 flex-shrink-0" />)}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid grid-cols-1 gap-4 mb-4`}>
              {!minimal && (
                <>
                  <div className="flex items-center text-sm text-gray-500">
                    <FileText className="mr-2 h-4 w-4" />
                    <p className="line-clamp-2">{dataset.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="mr-2 h-4 w-4" />
                    Uploaded {formatDistanceToNow(new Date(dataset.createdAt), { addSuffix: true })}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-2 h-4 w-4" />
                    Last modified {format(new Date(dataset.updatedAt), 'PPpp')}
                  </div>
                </>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                {dataset.tags && dataset.tags.length > 0 ? (
                  dataset.tags.map((tag) => (
                    <Badge key={tag.name} className="text-xs">
                      {tag.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No tags</span>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {!minimal && (
                <Link href={`/explore/${dataset.id}`} passHref>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </Link>
              )}
              {!isOwner && onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSave(dataset.id, dataset.isSaved)}
                  disabled={savingId === dataset.id}
                  className="flex items-center"
                >
                  {savingId === dataset.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : dataset.isSaved ? (
                    <BookmarkCheck className="mr-2 h-4 w-4" />
                  ) : (
                    <Bookmark className="mr-2 h-4 w-4" />
                  )}
                  {dataset.isSaved ? 'Unsave' : 'Save'}
                </Button>
              )}
              {isOwner && onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteClick}
                  disabled={deletingId === dataset.id}
                  className="flex items-center"
                >
                  {deletingId === dataset.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

      </CardWrapper>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='mb-4'>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the dataset &quot;{dataset.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

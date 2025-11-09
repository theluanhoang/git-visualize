import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActionButtonProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMore?: () => void;
}

export function ActionButtons({ onView, onEdit, onDelete, onMore }: ActionButtonProps) {
  return (
    <div className="flex items-center gap-2">
      {onView && (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(); }}>
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {onEdit && (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      {onMore && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMore(); }}>
              Thêm tùy chọn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

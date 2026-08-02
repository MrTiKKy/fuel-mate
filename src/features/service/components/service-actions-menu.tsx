"use client";

import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ServiceRecord } from "@/types";

export type ServiceAction = "edit" | "delete" | "duplicate";

type ServiceActionsMenuProps = {
  record: ServiceRecord;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAction: (action: ServiceAction) => void;
};

export function ServiceActionsMenu({
  record,
  open,
  onOpenChange,
  onAction,
}: ServiceActionsMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-xl text-muted-foreground"
          aria-label={`Actions for ${record.title}`}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl">
        <DropdownMenuItem
          className="h-10 gap-2 rounded-lg"
          onSelect={() => onAction("edit")}
        >
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="h-10 gap-2 rounded-lg"
          onSelect={() => onAction("duplicate")}
        >
          <Copy className="size-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="h-10 gap-2 rounded-lg text-destructive focus:text-destructive"
          onSelect={() => onAction("delete")}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

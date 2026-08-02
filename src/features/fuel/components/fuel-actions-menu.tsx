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
import type { FuelEntry } from "@/types";

export type FuelAction = "edit" | "delete" | "duplicate";

type FuelActionsMenuProps = {
  entry: FuelEntry;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAction: (action: FuelAction) => void;
};

export function FuelActionsMenu({
  entry,
  open,
  onOpenChange,
  onAction,
}: FuelActionsMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-xl text-muted-foreground"
          aria-label={`Actions for fill-up on ${entry.date}`}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 rounded-xl"
        onClick={(event) => event.stopPropagation()}
      >
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

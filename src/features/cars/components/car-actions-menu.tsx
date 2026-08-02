"use client";

import {
  Copy,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Car } from "@/types";

export type CarAction = "edit" | "delete" | "set-active" | "duplicate";

type CarActionsMenuProps = {
  car: Car;
  isActive: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAction: (action: CarAction) => void;
  triggerClassName?: string;
};

export function CarActionsMenu({
  car,
  isActive,
  open,
  onOpenChange,
  onAction,
  triggerClassName,
}: CarActionsMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={triggerClassName ?? "size-10 rounded-xl text-muted-foreground"}
          aria-label={`Actions for ${car.brand} ${car.model}`}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-xl"
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
          disabled={isActive}
          onSelect={() => onAction("set-active")}
        >
          <Star className="size-4" />
          Set active
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

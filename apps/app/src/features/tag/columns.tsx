import type { Tag } from "@goi/contracts"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"

export type TagActions = {
  onEdit: (tag: Tag) => void
  onDelete: (tag: Tag) => void
}

export function getTagColumns({ onEdit, onDelete }: TagActions): ColumnDef<Tag>[] {
  return [
    {
      accessorKey: "name",
      header: "标签名称",
    },
    {
      accessorKey: "color",
      header: "颜色",
      cell: ({ row }) => {
        const color = row.getValue<string>("color")
        return color ? (
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full border"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-muted-foreground">{color}</span>
          </div>
        ) : (
          "-"
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "创建时间",
      cell: ({ row }) => {
        const date = row.getValue<string>("createdAt")
        return date ? format(new Date(date), "yyyy-MM-dd HH:mm") : "-"
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const tag = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(tag)}
            >
              编辑
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(tag)}
            >
              删除
            </Button>
          </div>
        )
      },
    },
  ]
}

import type { DragEndEvent } from "@dnd-kit/core"
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { TableProps } from "antd"
import { Table } from "antd"

interface SortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string
}

const SortableRow = ({ children, ...props }: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props["data-row-key"],
  })

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    cursor: "move",
    ...(isDragging ? { position: "relative", zIndex: 9999 } : {}),
  }

  return (
    <tr
      {...props}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </tr>
  )
}

interface SortableTableProps<T> extends Omit<TableProps<T>, "components"> {
  onSortEnd: (newItems: T[]) => void
  rowKey: string | ((record: T) => string)
}

export function SortableTable<T>({ dataSource, onSortEnd, rowKey, ...props }: SortableTableProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 1 } }))

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const items = (dataSource || []) as T[]
      const oldIndex = items.findIndex((item) => {
        // biome-ignore lint/suspicious/noExplicitAny: <allow any>
        const key = typeof rowKey === "function" ? rowKey(item) : (item as any)[rowKey]
        return key === active.id
      })
      const newIndex = items.findIndex((item) => {
        // biome-ignore lint/suspicious/noExplicitAny: <allow any>
        const key = typeof rowKey === "function" ? rowKey(item) : (item as any)[rowKey]
        return key === over?.id
      })

      if (oldIndex !== -1 && newIndex !== -1) {
        onSortEnd(arrayMove(items, oldIndex, newIndex))
      }
    }
  }

  // Extract keys for SortableContext
  const keys = (dataSource || []).map((item) => {
    // biome-ignore lint/suspicious/noExplicitAny: <allow any>
    return typeof rowKey === "function" ? rowKey(item) : (item as any)[rowKey]
  })

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={keys}
        strategy={verticalListSortingStrategy}
      >
        <Table
          components={{
            body: {
              row: SortableRow,
            },
          }}
          rowKey={rowKey}
          dataSource={dataSource}
          {...props}
        />
      </SortableContext>
    </DndContext>
  )
}

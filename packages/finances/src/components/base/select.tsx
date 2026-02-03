import { type ComponentProps, useMemo } from "react"
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as ShadcnSelect,
} from "@/components/ui/select"

interface SelectProps extends ComponentProps<typeof import("@/components/ui/select").Select> {
  options: { label: string; value: string | number }[]
}

export function Select(props: SelectProps) {
  const { options, value, ...selectProps } = props

  const map = useMemo(() => {
    return options.reduce<Record<string, string>>((prev, next) => {
      const { label, value } = next
      prev[value] = label
      return prev
    }, {})
  }, [options])

  return (
    <ShadcnSelect
      {...selectProps}
      value={map[value as string] ?? value}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="请选择" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </ShadcnSelect>
  )
}

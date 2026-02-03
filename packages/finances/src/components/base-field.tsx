import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"

export { FieldGroup } from "@/components/ui/field"

export function FormField({
  label,
  errors,
  children,
  orientation,
  className,
  contentClassName,
  ...props
}: Omit<React.ComponentProps<typeof Field>, "children"> & {
  label: React.ReactNode
  errors?: Array<{ message?: string } | undefined>
  children: React.ReactNode
  contentClassName?: string
}) {
  return (
    <Field
      orientation={orientation}
      className={className}
      {...props}
    >
      <FieldLabel>{label}</FieldLabel>
      <FieldContent className={contentClassName}>
        {children}
        <FieldError errors={errors} />
      </FieldContent>
    </Field>
  )
}

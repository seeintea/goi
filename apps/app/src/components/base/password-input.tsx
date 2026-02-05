import { Eye, EyeOff } from "lucide-react"
import { type InputHTMLAttributes, type Ref, useState } from "react"
import { Button } from "@/components/ui/button"
import { FieldContent } from "@/components/ui/field"

import { Input } from "@/components/ui/input"

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  ref?: Ref<HTMLInputElement>
}

export function PasswordInput(field: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={"relative"}>
      <FieldContent>
        <Input
          autoComplete="current-password"
          type={showPassword ? "text" : "password"}
          {...field}
        />
      </FieldContent>
      <Button
        type="button"
        className={"absolute top-1/2 right-0 -translate-y-1/2"}
        onClick={() => setShowPassword((prev) => !prev)}
        variant={"link"}
      >
        {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
      </Button>
    </div>
  )
}

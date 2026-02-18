import { BadRequestException, Inject, Injectable } from "@nestjs/common"

export type ProtectionRule = {
  identifiers: readonly string[]
  actions: Record<string, boolean>
  message?: string
}

export type ProtectionRules = Record<string, ProtectionRule>

export const SYSTEM_PROTECTION_OPTIONS = "SYSTEM_PROTECTION_OPTIONS"

@Injectable()
export class SystemProtectionService {
  constructor(@Inject(SYSTEM_PROTECTION_OPTIONS) private readonly rules: ProtectionRules) {}

  /**
   * Validate if an action is allowed on a resource identifier.
   * Throws BadRequestException if not allowed.
   */
  validate(resource: string, action: string, identifier: string): void {
    if (!this.can(resource, action, identifier)) {
      const rule = this.rules[resource]
      throw new BadRequestException(rule?.message || `System protected resource: ${action} is not allowed`)
    }
  }

  /**
   * Check if an action is allowed on a resource identifier.
   * Returns boolean.
   */
  can(resource: string, action: string, identifier: string): boolean {
    const rule = this.rules[resource]
    if (!rule) return true

    // Case-insensitive check for identifiers
    const isProtected = rule.identifiers.some((id) => id.toUpperCase() === identifier.toUpperCase())
    if (!isProtected) return true

    const isAllowed = rule.actions[action]
    // If action is explicitly set to false, it's forbidden.
    // If undefined, it depends on policy (default allow or deny). Assuming default allow if not specified in 'actions'.
    return isAllowed !== false
  }
}

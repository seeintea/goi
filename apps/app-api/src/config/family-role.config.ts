export const FAMILY_ROLE_CONFIG = {
  // 1. Role code assigned to the creator of a new family
  CREATOR_ROLE_CODE: "owner",

  // 2. Roles that inherit permissions from the global template role (familyId = null)
  // When authenticating, users with these roles will use the global role's permissions
  GLOBAL_PERMISSION_INHERITANCE_ROLES: ["owner"],
} as const

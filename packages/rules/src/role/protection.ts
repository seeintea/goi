export const SHARED_ROLE_PROTECTION = {
  // Protected Role Codes
  identifiers: ["OWNER", "GUEST"],
  // Prohibited actions for protected roles
  actions: {
    delete: false, // Forbidden
    updateStatus: false, // Forbidden (cannot disable)
  },
} as const

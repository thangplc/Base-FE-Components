export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'invited' | 'suspended'
  createdAt: string
}

const firstNames = ['Anna', 'Ben', 'Chloe', 'David', 'Emma', 'Felix', 'Grace', 'Henry', 'Ivy', 'Jack']
const lastNames = ['Nguyen', 'Smith', 'Tran', 'Garcia', 'Le', 'Kim', 'Pham', 'Brown']
const roles: User['role'][] = ['admin', 'editor', 'viewer']
const statuses: User['status'][] = ['active', 'invited', 'suspended']

/** Deterministic mock data so server and client render the same rows. */
export const users: User[] = Array.from({ length: 42 }, (_, i) => {
  const first = firstNames[i % firstNames.length]!
  const last = lastNames[(i * 3) % lastNames.length]!
  return {
    id: `usr_${String(i + 1).padStart(3, '0')}`,
    name: `${first} ${last}`,
    email: `${first}.${last}${i}@example.com`.toLowerCase(),
    role: roles[i % roles.length]!,
    status: statuses[(i * 7) % statuses.length]!,
    createdAt: new Date(Date.UTC(2026, i % 12, (i % 27) + 1)).toISOString(),
  }
})

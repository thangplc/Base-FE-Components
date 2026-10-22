export type User = {
  id: string
  name: string
  email: string
  phone: string
  role: "admin" | "editor" | "viewer"
  status: "active" | "invited" | "suspended"
  company: string
  department: string
  jobTitle: string
  city: string
  country: string
  plan: "free" | "pro" | "enterprise"
  twoFactor: boolean
  storageMb: number
  logins: number
  lastLoginAt: string
  timezone: string
  createdAt: string
}

const firstNames = ["Anna", "Ben", "Chloe", "David", "Emma", "Felix", "Grace", "Henry", "Ivy", "Jack"]
const lastNames = ["Nguyen", "Smith", "Tran", "Garcia", "Le", "Kim", "Pham", "Brown"]
const roles: User["role"][] = ["admin", "editor", "viewer"]
const statuses: User["status"][] = ["active", "invited", "suspended"]
const plans: User["plan"][] = ["free", "pro", "enterprise"]
// A few long names on purpose, to show the ellipsis + tooltip.
const companies = [
  "Acme",
  "Globex Corporation",
  "Initech",
  "Umbrella International Holdings Corporation Limited",
  "Hooli",
  "Stark Industries",
  "Wayne Enterprises Asia Pacific Regional Headquarters",
]
const departments = ["Engineering", "Design", "Marketing", "Sales", "Finance", "Support"]
const jobTitles = [
  "Frontend Developer",
  "Product Designer",
  "Growth Marketing Manager",
  "Account Executive",
  "Senior Financial Analyst",
  "Customer Success Lead",
]
const places = [
  { city: "Ho Chi Minh City", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { city: "Hanoi", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { city: "Singapore", country: "Singapore", timezone: "Asia/Singapore" },
  { city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo" },
  { city: "Berlin", country: "Germany", timezone: "Europe/Berlin" },
  { city: "San Francisco", country: "United States", timezone: "America/Los_Angeles" },
]

/** Deterministic mock data so server and client render the same rows. */
export const users: User[] = Array.from({ length: 42 }, (_, i) => {
  const first = firstNames[i % firstNames.length]
  const last = lastNames[(i * 3) % lastNames.length]
  const place = places[(i * 5) % places.length]
  return {
    id: `usr_${String(i + 1).padStart(3, "0")}`,
    name: `${first} ${last}`,
    email: `${first}.${last}${i}@example.com`.toLowerCase(),
    phone: `+84 9${i % 10} ${100 + ((i * 37) % 900)} ${1000 + ((i * 53) % 9000)}`,
    role: roles[i % roles.length],
    status: statuses[(i * 7) % statuses.length],
    company: companies[i % companies.length],
    department: departments[(i * 5) % departments.length],
    jobTitle: jobTitles[(i * 5) % jobTitles.length],
    city: place.city,
    country: place.country,
    plan: plans[(i * 2) % plans.length],
    twoFactor: i % 3 !== 0,
    storageMb: ((i * 733) % 9800) + 120,
    logins: (i * 17) % 400,
    lastLoginAt: new Date(Date.UTC(2026, 9, (i % 21) + 1, (i * 3) % 24, (i * 7) % 60)).toISOString(),
    timezone: place.timezone,
    createdAt: new Date(Date.UTC(2026, i % 12, (i % 27) + 1)).toISOString(),
  }
})

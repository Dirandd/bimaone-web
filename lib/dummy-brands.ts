export type Brand = {
  id: number
  name: string
  description: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export const dataTiruan: Brand[] = [
  {
    id: 1,
    name: "Nike",
    description: "Brand perlengkapan olahraga",
    archived_at: null,
    created_at: "2026-10-01T08:00:00Z",
    updated_at: "2026-10-01T08:00:00Z",
  },
  {
    id: 2,
    name: "Adidas",
    description: "Brand pakaian dan perlengkapan olahraga",
    archived_at: null,
    created_at: "2026-10-02T08:00:00Z",
    updated_at: "2026-10-02T08:00:00Z",
  },
  {
    id: 3,
    name: "Puma",
    description: "Brand sepatu dan aksesori olahraga",
    archived_at: null,
    created_at: "2026-10-03T08:00:00Z",
    updated_at: "2026-10-03T08:00:00Z",
  },
  {
    id: 4,
    name: "New Balance",
    description: "Brand sepatu dan pakaian kasual",
    archived_at: null,
    created_at: "2026-10-04T08:00:00Z",
    updated_at: "2026-10-04T08:00:00Z",
  },
  {
    id: 5,
    name: "Converse",
    description: "Brand sepatu kasual",
    archived_at: null,
    created_at: "2026-10-05T08:00:00Z",
    updated_at: "2026-10-05T08:00:00Z",
  },
  {
    id: 6,
    name: "Reebok",
    description: null,
    archived_at: null,
    created_at: "2026-10-06T08:00:00Z",
    updated_at: "2026-10-06T08:00:00Z",
  },
]

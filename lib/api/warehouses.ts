import {
  panggilApi,
  type ResponsDaftar,
  type ResponsTunggal,
} from "@/lib/apiclient"

import type { Warehouse } from "@/lib/types"

// Data yang dikirim saat tambah dan ubah gudang.
// id, archived_at, created_at, dan updated_at diatur oleh server.
export type DataGudang = {
  code: string
  name: string
  address: string | null
  pic_name: string | null
  phone: string | null
}

export type ParameterDaftarGudang = {
  search?: string // BE mencari di code dan name
  status?: "active" | "archived" | "all"
  page?: number
  per_page?: number
}

// GET /api/v1/warehouses
export async function ambilDaftarGudang(
  parameter: ParameterDaftarGudang = {}
): Promise<ResponsDaftar<Warehouse>> {
  const query = new URLSearchParams()

  if (parameter.search?.trim()) {
    query.set("search", parameter.search.trim())
  }

  if (parameter.status) {
    query.set("status", parameter.status)
  }

  if (parameter.page !== undefined) {
    query.set("page", String(parameter.page))
  }

  if (parameter.per_page !== undefined) {
    query.set("per_page", String(parameter.per_page))
  }

  const queryString = query.toString()
  const alamat = `/api/v1/warehouses${
    queryString ? `?${queryString}` : ""
  }`

  return panggilApi<ResponsDaftar<Warehouse>>(alamat)
}

// GET /api/v1/warehouses/{id}
export async function ambilGudang(
  id: number
): Promise<ResponsTunggal<Warehouse>> {
  return panggilApi<ResponsTunggal<Warehouse>>(
    `/api/v1/warehouses/${id}`
  )
}

// POST /api/v1/warehouses
export async function tambahGudang(
  data: DataGudang
): Promise<ResponsTunggal<Warehouse>> {
  return panggilApi<ResponsTunggal<Warehouse>>(
    "/api/v1/warehouses",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  )
}

// PUT /api/v1/warehouses/{id}
export async function ubahGudang(
  id: number,
  data: DataGudang
): Promise<ResponsTunggal<Warehouse>> {
  return panggilApi<ResponsTunggal<Warehouse>>(
    `/api/v1/warehouses/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  )
}

// PATCH /api/v1/warehouses/{id}/archive
export async function arsipkanGudang(
  id: number
): Promise<ResponsTunggal<Warehouse>> {
  return panggilApi<ResponsTunggal<Warehouse>>(
    `/api/v1/warehouses/${id}/archive`,
    { method: "PATCH" }
  )
}

// PATCH /api/v1/warehouses/{id}/restore
export async function pulihkanGudang(
  id: number
): Promise<ResponsTunggal<Warehouse>> {
  return panggilApi<ResponsTunggal<Warehouse>>(
    `/api/v1/warehouses/${id}/restore`,
    { method: "PATCH" }
  )
}
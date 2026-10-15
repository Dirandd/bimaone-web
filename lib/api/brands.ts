import {
  panggilApi,
  type ResponsDaftar,
  type ResponsTunggal,
} from "@/lib/apiclient"

import type { Brand } from "@/lib/types"

export type DataBrand = {
  name: string
  description: string | null
}

export type ParameterDaftarBrand = {
  search?: string
  status?: "active" | "archived" | "all"
  page?: number
  per_page?: number
}

// GET /api/v1/brands
export async function ambilDaftarBrand(
  parameter: ParameterDaftarBrand = {}
): Promise<ResponsDaftar<Brand>> {
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
  const alamat = `/api/v1/brands${
    queryString ? `?${queryString}` : ""
  }`

  return panggilApi<ResponsDaftar<Brand>>(alamat)
}

// GET /api/v1/brands/{id}
export async function ambilBrand(
  id: number
): Promise<ResponsTunggal<Brand>> {
  return panggilApi<ResponsTunggal<Brand>>(
    `/api/v1/brands/${id}`
  )
}

// POST /api/v1/brands
export async function tambahBrand(
  data: DataBrand
): Promise<ResponsTunggal<Brand>> {
  return panggilApi<ResponsTunggal<Brand>>(
    "/api/v1/brands",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  )
}

// PUT /api/v1/brands/{id}
export async function ubahBrand(
  id: number,
  data: DataBrand
): Promise<ResponsTunggal<Brand>> {
  return panggilApi<ResponsTunggal<Brand>>(
    `/api/v1/brands/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  )
}

// PATCH /api/v1/brands/{id}/archive
export async function arsipkanBrand(
  id: number
): Promise<ResponsTunggal<Brand>> {
  return panggilApi<ResponsTunggal<Brand>>(
    `/api/v1/brands/${id}/archive`,
    { method: "PATCH" }
  )
}

// PATCH /api/v1/brands/{id}/restore
export async function pulihkanBrand(
  id: number
): Promise<ResponsTunggal<Brand>> {
  return panggilApi<ResponsTunggal<Brand>>(
    `/api/v1/brands/${id}/restore`,
    { method: "PATCH" }
  )
}

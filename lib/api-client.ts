
export type ResponsTunggal<T> = {
  data: T
}

export type MetaHalaman = {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export type ResponsDaftar<T> = {
  data: T[]
  meta: MetaHalaman
}

type ResponsGalat = {
  error: {
    code: string
    message: string
    fields?: Record<string, string>
  }
}

export class GalatApi extends Error {
  status: number
  kode: string
  fields: Record<string, string>

  constructor(
    status: number,
    kode: string,
    pesan: string,
    fields: Record<string, string> = {}
  ) {
    super(pesan)
    this.name = "GalatApi"
    this.status = status
    this.kode = kode
    this.fields = fields
  }
}

export class GalatJaringan extends Error {
  constructor(pesan: string) {
    super(pesan)
    this.name = "GalatJaringan"
  }
}

function ambilAlamatDasar(): string {
  const alamat = process.env.NEXT_PUBLIC_API_URL

  if (!alamat) {
    throw new Error(
      "Alamat API belum dikonfigurasi. Periksa NEXT_PUBLIC_API_URL di file .env.local."
    )
  }

  return alamat.replace(/\/+$/, "")
}

export async function panggilApi<T>(
  alamat: string,
  opsi: RequestInit = {}
): Promise<T> {
  const alamatLengkap = `${ambilAlamatDasar()}${alamat}`

  const header = new Headers(opsi.headers)

  if (opsi.body != null && !header.has("Content-Type")) {
    header.set("Content-Type", "application/json")
  }

  let respons: Response

  try {
    respons = await fetch(alamatLengkap, {
      ...opsi,
      headers: header,
    })
  } catch {
    throw new GalatJaringan(
      "Tidak dapat terhubung ke server. Periksa koneksi internet atau pastikan server API sedang berjalan."
    )
  }

  if (!respons.ok) {
    let body: ResponsGalat | null = null

    try {
      body = (await respons.json()) as ResponsGalat
    } catch {
      // Body galat bukan JSON valid atau tidak dapat dibaca.
    }

    throw new GalatApi(
      respons.status,
      body?.error?.code ?? "API_ERROR",
      body?.error?.message ??
        `Terjadi kesalahan pada server (HTTP ${respons.status}).`,
      body?.error?.fields ?? {}
    )
  }

  return (await respons.json()) as T
}

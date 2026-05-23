export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  order: number
  momentCount?: number
}

export interface Moment {
  id: string
  title: string
  description: string
  youtubeId: string
  thumbnailUrl?: string
  platform: 'regular' | 'shorts'
  duration: number    // másodpercekben
  year: number
  viralScore: number  // 0–100
  viewCount: number
  isHero: boolean
  tags: string[]
  categoryId: string
  category: Category
  createdAt: string
  updatedAt: string
}

export interface ApiError {
  error: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    role: 'ADMIN' | 'VIEWER'
  }
}

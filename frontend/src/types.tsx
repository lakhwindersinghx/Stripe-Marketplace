// This file defines shared types for your frontend and backend
export interface TempProfile {
  account_id: string
  name: string
  city: string
  profession: string
  available: boolean
  experience?: string
  rate?: number
}

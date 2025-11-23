export interface Community {
  name: string
  location: string
  tags: string[]
  events: string
  site?: string
  logo: string
  members?: number
}

export interface EventData {
  name: string
  logo: string
  location: string
  eventLocation?: string
  date: string
  isoDate?: string
  event: string
  events: string
  site?: string
  url?: string
  members?: number
  tags?: string[]
}

export interface EventOutput {
  updated: string
  events: EventData[]
}
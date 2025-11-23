import yaml from 'js-yaml'
import type { Community, EventOutput } from './types'

export async function getCommunities(): Promise<Community[]> {
  try {
    const response = await fetch('/data/communities.yml')
    const text = await response.text()
    return yaml.load(text) as Community[]
  } catch (error) {
    console.error('Failed to load communities:', error)
    return []
  }
}

export async function getEvents(): Promise<EventOutput> {
  try {
    // Try JSON first
    const response = await fetch('/data/output.json')
    console.log('JSON fetch response:', response.status, response.ok)
    if (response.ok) {
      const data = await response.json() as EventOutput
      console.log('Loaded events from JSON:', data.events?.length || 0, 'events')
      return data
    }
  } catch (error) {
    console.error('Failed to load JSON:', error)
  }

  // Fallback to YAML
  try {
    const response = await fetch('/data/output.yml')
    console.log('YAML fetch response:', response.status, response.ok)
    if (response.ok) {
      const text = await response.text()
      const data = yaml.load(text) as EventOutput
      console.log('Loaded events from YAML:', data.events?.length || 0, 'events')
      return data
    }
  } catch (error) {
    console.error('Failed to load YAML:', error)
  }

  // Return empty data if both fail
  console.warn('No events data found, returning empty')
  return {
    updated: new Date().toISOString(),
    events: []
  }
}

export function filterUpcomingEvents(events: EventOutput['events']): EventOutput['events'] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return events.filter(event => {
    const [day, month, year] = event.date.split('/')
    const eventDate = new Date(+year, +month - 1, +day)
    return eventDate >= today
  }).sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split('/')
    const [dayB, monthB, yearB] = b.date.split('/')
    const dateA = new Date(+yearA, +monthA - 1, +dayA)
    const dateB = new Date(+yearB, +monthB - 1, +dayB)
    return dateA.getTime() - dateB.getTime()
  })
}

export function filterPastEvents(events: EventOutput['events']): EventOutput['events'] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return events.filter(event => {
    const [day, month, year] = event.date.split('/')
    const eventDate = new Date(+year, +month - 1, +day)
    return eventDate < today
  }).sort((a, b) => {
    const [dayA, monthA, yearA] = a.date.split('/')
    const [dayB, monthB, yearB] = b.date.split('/')
    const dateA = new Date(+yearA, +monthA - 1, +dayA)
    const dateB = new Date(+yearB, +monthB - 1, +dayB)
    return dateB.getTime() - dateA.getTime()
  })
}
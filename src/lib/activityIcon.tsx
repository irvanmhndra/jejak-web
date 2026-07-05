import { Bike, Footprints, Mountain, PersonStanding, Timer } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

const map: Record<string, React.ComponentType<LucideProps>> = {
  run: Footprints,
  ride: Bike,
  walk: PersonStanding,
  hike: Mountain,
  other: Timer,
}

export function ActivityIcon({ type, ...props }: { type: string } & LucideProps) {
  const Icon = map[type] ?? Timer
  return <Icon {...props} />
}

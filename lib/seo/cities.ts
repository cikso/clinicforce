export type City = {
  slug: string
  name: string
  state: string
}

export const CITIES: City[] = [
  { slug: 'sydney',         name: 'Sydney',         state: 'NSW' },
  { slug: 'melbourne',      name: 'Melbourne',      state: 'VIC' },
  { slug: 'brisbane',       name: 'Brisbane',       state: 'QLD' },
  { slug: 'perth',          name: 'Perth',          state: 'WA'  },
  { slug: 'adelaide',       name: 'Adelaide',       state: 'SA'  },
  { slug: 'gold-coast',     name: 'Gold Coast',     state: 'QLD' },
  { slug: 'newcastle',      name: 'Newcastle',      state: 'NSW' },
  { slug: 'canberra',       name: 'Canberra',       state: 'ACT' },
  { slug: 'sunshine-coast', name: 'Sunshine Coast', state: 'QLD' },
  { slug: 'wollongong',     name: 'Wollongong',     state: 'NSW' },
]

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug)
}

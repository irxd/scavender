export interface ItemData {
  id: string
  name: string
  description: string
  image: string
}

export const ITEMS: Record<string, ItemData> = {
  rebar: {
    id: 'rebar',
    name: 'REBAR LEVER',
    description: 'Robust steel rebar. Strong enough to pry open heavy metal chests.',
    image: '/assets/images/item/rebar.png',
  },
  wire: {
    id: 'wire',
    name: 'STURDY COPPER WIRE',
    description: 'A length of salvaged copper. Use it to repair broken control circuits or connect electrical wiring.',
    image: '/assets/images/item/wire.png',
  },
  wrench: {
    id: 'wrench',
    name: 'HEAVY WRENCH',
    description: 'A heavy, rusted wrench. Use it to crank open heavy bolts and stubborn valves.',
    image: '/assets/images/item/wrench.png',
  },
  watch: {
    id: 'watch',
    name: 'WORN WATCH',
    description: "A rugged timepiece with a worn leather strap. It isn't ticking, but it emits a mysterious, pulsing blue glow. The back is engraved with the initials '░M'.",
    image: '/assets/images/item/watch.png',
  },
  battery: {
    id: 'battery',
    name: 'H-C BATTERY',
    description: 'A high-capacity cell filled with corrosive acid.',
    image: '/assets/images/item/battery.png',
  },
  fuel: {
    id: 'fuel',
    name: 'FUEL CANISTER',
    description: 'A canister of high-grade volatile fuel, salvaged from a derelict generator.',
    image: '/assets/images/item/fuel.png',
  },
  igniter: {
    id: 'igniter',
    name: 'PIEZO IGNITER',
    description: 'A primitive but reliable sparking tool. Can ignite fuel or trigger carefully placed explosives.',
    image: '/assets/images/item/igniter.png',
  },
  sulfate: {
    id: 'sulfate',
    name: 'STATIC-NEUTRALIZED SULFATE',
    description: 'A pouch of pure sulfate crystals. A key component for advanced chemical crafting.',
    image: '/assets/images/item/sulfate.png',
  }
}

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
    description: 'A heavy, sturdy piece of construction rebar, found near the staircase collapse. Its robust build makes it perfect for leveraging open stubborn metal chests.',
    image: '/assets/images/item/rebar.png',
  },
  wire: {
    id: 'wire',
    name: 'STURDY COPPER WIRE',
    description: 'A length of thick copper wire salvaged from an old electrical panel. Might be useful for repairing control circuits or picking primitive locks.',
    image: '/assets/images/item/wire.png',
  },
  wrench: {
    id: 'wrench',
    name: 'HEAVY WRENCH',
    description: 'A rusted but extremely solid pipe wrench. Suitable for tightening enormous valves or perhaps cracking open something heavily armored.',
    image: '/assets/images/item/wrench.png',
  },
  watch: {
    id: 'watch',
    name: 'CHRONOS WATCH',
    description: "A rugged timepiece with a worn leather strap, remarkably still ticking. The back is engraved with the initials '彡M'.",
    image: '/assets/images/item/watch.png',
  },
  battery: {
    id: 'battery',
    name: 'H-C BATTERY',
    description: 'A high-capacity cell with a localized time-static flicker. Needs to be stabilized before use.',
    image: '/assets/images/item/battery.png',
  },
  fuel: {
    id: 'fuel',
    name: 'FUEL CANISTER',
    description: 'A canister of high-grade volatile fuel, salvaged from a derelict generator. Essential for powering burners or mechanical engines.',
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
    description: 'A pouch of pure sulfate crystals, scavenged from an old laboratory. A key component for advanced chemical crafting.',
    image: '/assets/images/item/sulfate.png',
  }
}

// ─── Learning Path ─────────────────────────────────────────────────────────────
// Ordered beginner learning path shown to new users (xp < 200).
// Each step links to a specific vocabulary category or situation section.
// The `type` field identifies which tab/hub to navigate to.

export interface LearningStep {
  id: string
  order: number
  icon: string
  title: string             // must match the exact category/section title
  type: "vocabulary" | "situations"
  description: string
  prereqs?: string[]        // titles of steps that should be done first
}

export const LEARNING_PATH: LearningStep[] = [
  {
    id: "step-1-greetings",
    order: 1,
    icon: "👋",
    title: "Greetings",
    type: "situations",
    description: "Say hello, introduce yourself, and start any conversation.",
  },
  {
    id: "step-2-vocab-greetings",
    order: 2,
    icon: "🗣️",
    title: "Greetings & Small Talk",
    type: "vocabulary",
    description: "The words behind your first conversations.",
    prereqs: ["Greetings"],
  },
  {
    id: "step-3-numbers",
    order: 3,
    icon: "🔢",
    title: "Numbers",
    type: "vocabulary",
    description: "Count, tell prices, and give your phone number.",
  },
  {
    id: "step-4-supermarket",
    order: 4,
    icon: "🛒",
    title: "Supermarket",
    type: "situations",
    description: "Navigate a Slovak grocery store confidently.",
    prereqs: ["Numbers"],
  },
  {
    id: "step-5-food",
    order: 5,
    icon: "🍽️",
    title: "Food & Drinks",
    type: "vocabulary",
    description: "Name the foods you see every day.",
  },
  {
    id: "step-6-transport",
    order: 6,
    icon: "🚌",
    title: "Public Transport",
    type: "situations",
    description: "Catch a bus or train around the city.",
    prereqs: ["Numbers"],
  },
  {
    id: "step-7-directions",
    order: 7,
    icon: "🗺️",
    title: "Directions",
    type: "situations",
    description: "Ask and understand how to get anywhere.",
  },
  {
    id: "step-8-restaurant",
    order: 8,
    icon: "🍽️",
    title: "Restaurant",
    type: "situations",
    description: "Order food and pay the bill with ease.",
    prereqs: ["Food & Drinks"],
  },
  {
    id: "step-9-family",
    order: 9,
    icon: "👨‍👩‍👧",
    title: "Family",
    type: "vocabulary",
    description: "Talk about the people you care about.",
  },
  {
    id: "step-10-taxi",
    order: 10,
    icon: "🚕",
    title: "Taxi",
    type: "situations",
    description: "Get where you're going by taxi.",
    prereqs: ["Directions"],
  },
]

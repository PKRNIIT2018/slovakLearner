export interface Phrase {
  id?: string
  english: string
  slovak: string
  grammar_focus?: "present" | "past" | "future" | "imperative" | "conditional"
}

export interface PhraseSection {
  icon?: string
  title: string
  subtitle: string
  level?: "beginner" | "intermediate" | "advanced"
  phrases: Phrase[]
}

export interface Word {
  id?: string
  english: string
  slovak: string
  type: "noun" | "verb" | "adjective" | "adverb" | "pronoun" | "number" | "expression" | "preposition"
  
  // --- Linguistic Metadata (v2.0 Enriched) ---
  gender?: "masculine" | "feminine" | "neuter"
  animacy?: "animate" | "inanimate"
  declension_pattern?: string
  aspect?: "perfective" | "imperfective"
  aspect_pair?: string
  pronunciation?: string
  synonyms?: string[]

  // --- Context ---
  english_example?: string
  slovak_example?: string
  register?: "formal" | "informal" | "neutral"

  // --- Memory Aid ---
  memory_hook?: string  // Mnemonic, etymology, or visual association to aid retention
}

export interface WordCategory {
  icon?: string
  title: string
  description: string
  level?: "beginner" | "intermediate" | "advanced"
  words: Word[]
}

export type Mode = "learn" | "quiz" | "speed" | "match"

export type Direction = "en-sk" | "sk-en"

// ─── Grammar System ───────────────────────────────────────────────────────────

export interface GrammarExample {
  slovak: string
  english: string
  /** The specific word/morpheme to highlight in the Slovak text */
  highlight?: string
}

export interface GrammarExercise {
  id: string
  type: "multiple_choice" | "fill_blank"
  /** Instruction shown above the question */
  prompt: string
  /** Slovak sentence with ___ for fill_blank type */
  slovak_context?: string
  english_context?: string
  answer: string
  distractors: string[]
  /** Shown after answering — explains the rule applied */
  explanation: string
}

// ─── Conversation System ──────────────────────────────────────────────────────

export interface ConversationTurn {
  speaker: "you" | "them"
  slovak?: string
  english?: string
  /** What you should try to say (shown as the task) */
  prompt?: string
  /** Model answer shown after attempting */
  suggested?: string
  /** Keywords that count as a valid attempt */
  accept_keywords?: string[]
  cultural_note?: string
}

export interface ConversationScenario {
  id: string
  title: string
  context: string
  level: "beginner" | "intermediate" | "advanced"
  icon: string
  turns: ConversationTurn[]
}

// ─── Culture System ───────────────────────────────────────────────────────────

export interface CultureQuizItem {
  question: string
  answer: string
  distractors: string[]
  explanation: string
}

export interface CultureLesson {
  id: string
  title: string
  icon: string
  category: "social" | "language" | "food" | "practical" | "history"
  level: "beginner" | "intermediate" | "advanced"
  body: string
  examples: Array<{ slovak: string; english: string }>
  quiz: CultureQuizItem[]
}

export interface GrammarTopic {
  id: string
  title: string
  subtitle: string
  level: "beginner" | "intermediate" | "advanced"
  icon: string
  /** Question shown during discovery phase before the rule is revealed */
  discovery_prompt: string
  examples: GrammarExample[]
  /** The grammar rule, revealed after discovery */
  rule: string
  exercises: GrammarExercise[]
  xp_reward: number
}

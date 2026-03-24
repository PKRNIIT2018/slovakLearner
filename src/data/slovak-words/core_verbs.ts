// Category : Core Verbs
// Words    : 22 | Examples: 22 | Pronunciation: 22
// ⚠️ NEEDS NATIVE SPEAKER REVIEW before publishing

import type { WordCategory } from "@/types/learning";

export const CORE_VERBS: WordCategory = {
  icon: "🏃",
  title: "Core Verbs",
  description: "Essential everyday verbs",
  level: "beginner",
  words: [
    { id: "w-core-verbs-robit", english: "to make (to create from a certain material)", slovak: "robiť", type: "verb", aspect: "imperfective", aspect_pair: "urobiť", pronunciation: "ro-biť", synonyms: ["diať", "honiť", "predstierať", "spôsobovať", "tváriť", "utvárať", "vyrábať", "vznikať", "zapríčiňovať", "činiť"], english_example: "He's making kolaches.", slovak_example: "Robí koláče." },
    { id: "w-core-verbs-otvorit", english: "to open", slovak: "otvoriť", type: "verb", aspect: "perfective", aspect_pair: "otvárať", pronunciation: "otvo-riť", synonyms: ["aktivovať", "dať priestor", "nastoliť", "odchlopiť", "odchýliť", "odhaliť", "predostrieť", "rozovrieť", "roztiahnuť", "roztvoriť", "sprístupniť", "spustiť", "ukázať", "zahájiť", "zjaviť"], english_example: "to open a door", slovak_example: "Otvoriť dvere" },
    { id: "w-core-verbs-citat", english: "to read", slovak: "čítať", type: "verb", aspect: "imperfective", aspect_pair: "prečítať", pronunciation: "čí-tať", synonyms: ["domýšľať", "interpretovať", "poznávať", "počítať", "predpovedať", "rátať", "veštiť", "vykladať", "vysvetľovať"], english_example: "to read the newspaper", slovak_example: "Čítať noviny" },
    { id: "w-core-verbs-moct", english: "can, be able to", slovak: "môcť", type: "verb", aspect: "imperfective", pronunciation: "môcť", english_example: "I lost my passport—can you help?", slovak_example: "Stratil som pas—môžete mi pomôcť?" },
    { id: "w-core-verbs-byt", english: "to be", slovak: "byť", type: "verb", aspect: "imperfective", pronunciation: "byť", english_example: "Human rights must be respected.", slovak_example: "Ľudské práva musia byť rešpektované." },
    { id: "w-core-verbs-kupit", english: "to buy", slovak: "kúpiť", type: "verb", aspect: "perfective", aspect_pair: "kupovať", pronunciation: "kú-piť", english_example: "I want to buy bread.", slovak_example: "Chcem kúpiť chlieb." },
    { id: "w-core-verbs-volat", english: "to call", slovak: "volať", type: "verb", aspect: "imperfective", pronunciation: "vo-lať", synonyms: ["telefonovať"], english_example: "I need to call my mother.", slovak_example: "Musím zavolať mame." },
    { id: "w-core-verbs-pit", english: "to drink", slovak: "piť", type: "verb", aspect: "imperfective", pronunciation: "piť", english_example: "I drink water every day.", slovak_example: "Každý deň pijem vodu." },
    { id: "w-core-verbs-dat", english: "to give, put", slovak: "dať", type: "verb", aspect: "perfective", aspect_pair: "dávať", pronunciation: "dať", english_example: "Can you give me the book?", slovak_example: "Môžeš mi dať tú knihu?" },
    { id: "w-core-verbs-mat", english: "to have", slovak: "mať", type: "verb", aspect: "imperfective", pronunciation: "mať", english_example: "Can I have a room with a view?", slovak_example: "Môžem mať izbu s výhľadom?" },
    { id: "w-core-verbs-pocut", english: "to hear", slovak: "počuť", type: "verb", pronunciation: "po-čuť", english_example: "Can you hear that sound?", slovak_example: "Počuješ ten zvuk?" },
    { id: "w-core-verbs-vediet", english: "to know", slovak: "vedieť", type: "verb", aspect: "imperfective", pronunciation: "ve-dieť", english_example: "I know the answer to this question.", slovak_example: "Viem odpoveď na túto otázku." },
    { id: "w-core-verbs-platit", english: "to pay (to give money)", slovak: "platiť", type: "verb", aspect: "imperfective", pronunciation: "pla-tiť", english_example: "Can I pay by card?", slovak_example: "Môžem platiť kartou?" },
    { id: "w-core-verbs-hladat", english: "to search, to look for", slovak: "hľadať", type: "verb", aspect: "imperfective", aspect_pair: "výhľadať", pronunciation: "hľa-dať", english_example: "I am looking for my keys.", slovak_example: "Hľadám svoje kľúče." },
    { id: "w-core-verbs-vidiet", english: "to see", slovak: "vidieť", type: "verb", aspect: "imperfective", aspect_pair: "uvidieť", pronunciation: "vi-dieť", english_example: "Can I see the apartment?", slovak_example: "Môžem vidieť byt?" },
    { id: "w-core-verbs-predat", english: "to sell", slovak: "predať", type: "verb", aspect: "perfective", aspect_pair: "predávať", pronunciation: "pre-dať", english_example: "They want to sell their old car.", slovak_example: "Chcú predať svoje staré auto." },
    { id: "w-core-verbs-spat", english: "to sleep", slovak: "spať", type: "verb", aspect: "imperfective", pronunciation: "spať", english_example: "Go to bed early.", slovak_example: "Choď skoro spať." },
    { id: "w-core-verbs-brat", english: "to take", slovak: "brať", type: "verb", aspect: "imperfective", aspect_pair: "vziať", pronunciation: "brať", english_example: "Please take this book with you.", slovak_example: "Prosím, vezmi si túto knihu so sebou." },
    { id: "w-core-verbs-hovorit", english: "to talk, to speak", slovak: "hovoriť", type: "verb", aspect: "imperfective", pronunciation: "ho-vo-riť", english_example: "Do you speak Slovak?", slovak_example: "Hovoríš po slovensky?" },
    { id: "w-core-verbs-rozumiet", english: "to understand", slovak: "rozumieť", type: "verb", aspect: "imperfective", aspect_pair: "porozumieť", pronunciation: "ro-zu-mieť", english_example: "I understand what you mean.", slovak_example: "Rozumiem, čo tým myslíš." },
    { id: "w-core-verbs-chciet", english: "to want", slovak: "chcieť", type: "verb", aspect: "imperfective", pronunciation: "chieť", synonyms: ["želať"], english_example: "I want to learn Slovak.", slovak_example: "Chcem sa naučiť po slovensky." },
    { id: "w-core-verbs-pisat", english: "to write", slovak: "písať", type: "verb", aspect: "imperfective", aspect_pair: "napísať", pronunciation: "pí-sať", english_example: "I like to write letters by hand.", slovak_example: "Rád píšem listy rukou." },
  ],
};

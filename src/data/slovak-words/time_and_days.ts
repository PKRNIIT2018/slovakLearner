// Category : Time & Days
// Words    : 16 | Examples: 16 | Pronunciation: 16
// ⚠️ NEEDS NATIVE SPEAKER REVIEW before publishing

import type { WordCategory } from "@/types/learning";

export const TIME_AND_DAYS: WordCategory = {
  icon: "⏰",
  title: "Time & Days",
  description: "Days, months and time expressions",
  level: "advanced",
  words: [
    { id: "w-time-days-dnes", english: "today", slovak: "dnes", type: "adverb", pronunciation: "dnes", english_example: "I have a meeting today.", slovak_example: "Dnes mám stretnutie." },
    { id: "w-time-days-zajtra", english: "tomorrow", slovak: "zajtra", type: "adverb", pronunciation: "zaj-tra", english_example: "See you tomorrow.", slovak_example: "Uvidíme sa zajtra." },
    { id: "w-time-days-vcera", english: "yesterday", slovak: "včera", type: "adverb", pronunciation: "vče-ra", english_example: "I was at the doctor yesterday.", slovak_example: "Včera som bol u lekára." },
    { id: "w-time-days-tyzden", english: "week", slovak: "týždeň", type: "noun", gender: "masculine", pronunciation: "týž-deň", english_example: "Next week I start a new job.", slovak_example: "Budúci týždeň začínam novú prácu." },
    { id: "w-time-days-mesiac", english: "month", slovak: "mesiac", type: "noun", gender: "masculine", pronunciation: "me-siac", english_example: "My permit expires next month.", slovak_example: "Môj pobyt vyprší budúci mesiac." },
    { id: "w-time-days-rok", english: "year", slovak: "rok", type: "noun", gender: "masculine", pronunciation: "rok", english_example: "I have lived here for three years.", slovak_example: "Bývam tu tri roky." },
    { id: "w-time-days-hodina", english: "hour", slovak: "hodina", type: "noun", gender: "feminine", pronunciation: "ho-di-na", english_example: "The journey takes one hour.", slovak_example: "Cesta trvá jednu hodinu." },
    { id: "w-time-frequency-vlani", english: "last year, yesteryear", slovak: "vlani", type: "adverb", pronunciation: "vla-ni", english_example: "We traveled to Italy last year.", slovak_example: "Vlani sme cestovali do Talianska." },
    { id: "w-time-frequency-neskoro", english: "late", slovak: "neskoro", type: "adverb", pronunciation: "nes-ko-ro", english_example: "Don't be late for the train.", slovak_example: "Nemeškaj na vlak." },
    { id: "w-time-frequency-nikdy", english: "never", slovak: "nikdy", type: "adverb", pronunciation: "nik-dy", english_example: "I will never forget this day.", slovak_example: "Nikdy nezabudnem na tento deň." },
    { id: "w-time-frequency-teraz", english: "now", slovak: "teraz", type: "adverb", pronunciation: "te-raz", english_example: "I need to leave now.", slovak_example: "Teraz musím odísť." },
    { id: "w-time-frequency-casto", english: "often", slovak: "často", type: "adverb", pronunciation: "čas-to", english_example: "I often go for a walk in the evening.", slovak_example: "Často chodím večer na prechádzku." },
    { id: "w-time-frequency-kedysi", english: "once upon a time", slovak: "kedysi", type: "adverb", pronunciation: "ke-dy-si", english_example: "Once upon a time, there was a brave knight.", slovak_example: "Kedysi žil statočný rytier." },
    { id: "w-time-frequency-niekedy", english: "sometimes", slovak: "niekedy", type: "adverb", pronunciation: "nie-ke-dy", english_example: "Sometimes I prefer to stay home.", slovak_example: "Niekedy radšej zostanem doma." },
    { id: "w-time-frequency-skoro", english: "soon, shortly", slovak: "skoro", type: "adverb", pronunciation: "sko-ro", synonyms: ["takmer", "temer"], english_example: "I will be there soon.", slovak_example: "Už tam budem skoro." },
    { id: "w-time-frequency-vtedy", english: "then", slovak: "vtedy", type: "adverb", pronunciation: "vte-dy", english_example: "Back then, life was simpler.", slovak_example: "Vtedy bol život jednoduchší." },
  ],
};

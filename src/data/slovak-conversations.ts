import type { ConversationScenario } from "@/types/learning"

export const CONVERSATION_SCENARIOS: ConversationScenario[] = [
  // ─── Beginner ──────────────────────────────────────────────────────────────
  {
    id: "conv-greetings",
    title: "First Meeting",
    context: "You've just arrived in Bratislava and meet your neighbour in the hallway.",
    level: "beginner",
    icon: "👋",
    turns: [
      {
        speaker: "them",
        slovak: "Dobrý deň! Som váš nový sused. Volám sa Martin.",
        english: "Good afternoon! I'm your new neighbour. My name is Martin.",
      },
      {
        speaker: "you",
        prompt: "Greet Martin and introduce yourself.",
        suggested: "Dobrý deň! Teší ma. Volám sa ___.",
        english: "Good afternoon! Nice to meet you. My name is ___.",
        accept_keywords: ["dobrý deň", "teší ma", "volám sa", "ahoj"],
      },
      {
        speaker: "them",
        slovak: "Odkiaľ ste?",
        english: "Where are you from?",
      },
      {
        speaker: "you",
        prompt: "Tell Martin where you're from.",
        suggested: "Som z ___.",
        english: "I'm from ___.",
        accept_keywords: ["som z", "pochádzam z"],
        cultural_note: "Slovaks are genuinely curious about foreigners. Sharing where you're from always sparks a warm conversation.",
      },
      {
        speaker: "them",
        slovak: "Hovoríte po slovensky?",
        english: "Do you speak Slovak?",
      },
      {
        speaker: "you",
        prompt: "Tell Martin your Slovak is a little limited.",
        suggested: "Trochu. Učím sa slovenčinu.",
        english: "A little. I'm learning Slovak.",
        accept_keywords: ["trochu", "učím sa", "po slovensky", "nehovorím dobre"],
        cultural_note: "Even a few words of Slovak will win enormous goodwill. Slovaks deeply appreciate any effort to learn their language.",
      },
    ],
  },

  {
    id: "conv-supermarket",
    title: "At the Supermarket",
    context: "You're shopping at Billa in Bratislava. You can't find the bread and ask a staff member.",
    level: "beginner",
    icon: "🛒",
    turns: [
      {
        speaker: "you",
        prompt: "Politely get the staff member's attention.",
        suggested: "Prepáčte, prosím.",
        english: "Excuse me, please.",
        accept_keywords: ["prepáčte", "prepáč", "prosím"],
      },
      {
        speaker: "them",
        slovak: "Áno? Môžem vám pomôcť?",
        english: "Yes? Can I help you?",
      },
      {
        speaker: "you",
        prompt: "Ask where the bread is.",
        suggested: "Kde je chlieb, prosím?",
        english: "Where is the bread, please?",
        accept_keywords: ["kde", "chlieb", "prosím"],
      },
      {
        speaker: "them",
        slovak: "Chlieb je v tretej uličke, na pravej strane.",
        english: "The bread is in the third aisle, on the right side.",
      },
      {
        speaker: "you",
        prompt: "Thank the staff member.",
        suggested: "Ďakujem pekne!",
        english: "Thank you very much!",
        accept_keywords: ["ďakujem", "vďaka", "dakujem"],
        cultural_note: "In Slovak shops, always say 'dobrý deň' when entering and 'dovidenia' when leaving — it's expected and polite.",
      },
      {
        speaker: "them",
        slovak: "Prosím! Dobrý nákup.",
        english: "You're welcome! Happy shopping.",
      },
    ],
  },

  {
    id: "conv-cafe",
    title: "Ordering at a Café",
    context: "You're at a café in the old town. A waiter approaches your table.",
    level: "beginner",
    icon: "☕",
    turns: [
      {
        speaker: "them",
        slovak: "Dobrý deň, čo si dáte?",
        english: "Good afternoon, what will you have?",
      },
      {
        speaker: "you",
        prompt: "Order a coffee and a water.",
        suggested: "Jedno kávu a jednu vodu, prosím.",
        english: "One coffee and one water, please.",
        accept_keywords: ["kávu", "káva", "vodu", "voda", "prosím"],
        cultural_note: "Slovak coffee culture is strong — 'káva' usually means espresso. Say 'biela káva' for a white coffee, 'čierna káva' for black.",
      },
      {
        speaker: "them",
        slovak: "Nech sa páči. Chcete niečo iné?",
        english: "Here you go. Would you like anything else?",
      },
      {
        speaker: "you",
        prompt: "Say no thank you, that's all.",
        suggested: "Nie, ďakujem. To je všetko.",
        english: "No, thank you. That's all.",
        accept_keywords: ["nie", "ďakujem", "to je všetko", "stačí"],
      },
      {
        speaker: "them",
        slovak: "Dobre. Prídem o chvíľu.",
        english: "Okay. I'll be back in a moment.",
      },
    ],
  },

  // ─── Intermediate ──────────────────────────────────────────────────────────
  {
    id: "conv-directions",
    title: "Asking for Directions",
    context: "You're lost near Hlavná stanica (main station) and need to find the Old Town.",
    level: "intermediate",
    icon: "🗺️",
    turns: [
      {
        speaker: "you",
        prompt: "Stop a passerby and ask how to get to the Old Town.",
        suggested: "Prepáčte, ako sa dostanem do Starého Mesta?",
        english: "Excuse me, how do I get to the Old Town?",
        accept_keywords: ["prepáčte", "staré mesto", "ako sa dostanem", "kde je"],
      },
      {
        speaker: "them",
        slovak: "Choďte rovno, potom odbočte vľavo pri parku. Je to asi päť minút pešo.",
        english: "Go straight ahead, then turn left at the park. It's about five minutes on foot.",
      },
      {
        speaker: "you",
        prompt: "Confirm you understood — straight ahead then left at the park.",
        suggested: "Teda rovno a potom vľavo pri parku. Ďakujem!",
        english: "So straight ahead and then left at the park. Thank you!",
        accept_keywords: ["rovno", "vľavo", "park", "ďakujem"],
        cultural_note: "Bratislavans are generally helpful. If you ask in Slovak — even imperfectly — they often slow down and are more patient.",
      },
      {
        speaker: "them",
        slovak: "Presne tak. Ak sa stratíte, pýtajte sa znova.",
        english: "Exactly. If you get lost, ask again.",
      },
    ],
  },

  {
    id: "conv-doctor",
    title: "At the Doctor",
    context: "You're not feeling well and have come to see a doctor. The receptionist greets you.",
    level: "intermediate",
    icon: "🏥",
    turns: [
      {
        speaker: "them",
        slovak: "Dobrý deň, ako vám môžem pomôcť?",
        english: "Good afternoon, how can I help you?",
      },
      {
        speaker: "you",
        prompt: "Say you're not feeling well and have a headache and fever.",
        suggested: "Necítim sa dobre. Bolí ma hlava a mám horúčku.",
        english: "I don't feel well. I have a headache and a fever.",
        accept_keywords: ["necítim sa", "bolí ma", "hlava", "horúčku", "teplotu"],
      },
      {
        speaker: "them",
        slovak: "Odkedy sa takto cítite?",
        english: "Since when have you been feeling this way?",
      },
      {
        speaker: "you",
        prompt: "Say since yesterday.",
        suggested: "Od včera.",
        english: "Since yesterday.",
        accept_keywords: ["včera", "od včera"],
        cultural_note: "Slovak healthcare requires a 'kartička poistenca' (insurance card). EU citizens can use their EHIC card.",
      },
      {
        speaker: "them",
        slovak: "Dobre, sadnite si. Doktor vás čoskoro príde pozrieť.",
        english: "Okay, please take a seat. The doctor will come to see you shortly.",
      },
    ],
  },

  // ─── Beginner (additional) ─────────────────────────────────────────────────
  {
    id: "conv-pharmacy",
    title: "At the Pharmacy",
    context: "You have a headache and go to a pharmacy (lekáreň) to buy something for the pain.",
    level: "beginner",
    icon: "💊",
    turns: [
      {
        speaker: "you",
        prompt: "Greet the pharmacist and say you have a headache.",
        suggested: "Dobrý deň. Bolí ma hlava.",
        english: "Good afternoon. I have a headache.",
        accept_keywords: ["dobrý deň", "bolí ma", "hlava"],
      },
      {
        speaker: "them",
        slovak: "Rozumiem. Chcete niečo na bolesť hlavy?",
        english: "I understand. Would you like something for the headache?",
      },
      {
        speaker: "you",
        prompt: "Say yes please.",
        suggested: "Áno, prosím.",
        english: "Yes, please.",
        accept_keywords: ["áno", "prosím", "dobre"],
        cultural_note: "Pharmacists in Slovakia are highly trained and often give solid medical advice for minor ailments — don't be shy to describe symptoms.",
      },
      {
        speaker: "them",
        slovak: "Nech sa páči, ibuprofen. Dvakrát denne po jedle.",
        english: "Here you go, ibuprofen. Twice a day with food.",
      },
      {
        speaker: "you",
        prompt: "Ask how much it costs.",
        suggested: "Koľko to stojí?",
        english: "How much does it cost?",
        accept_keywords: ["koľko", "stojí", "cena"],
      },
      {
        speaker: "them",
        slovak: "Tri eurá päťdesiat.",
        english: "Three euros fifty.",
      },
      {
        speaker: "you",
        prompt: "Pay and thank them.",
        suggested: "Nech sa páči. Ďakujem pekne!",
        english: "Here you go. Thank you very much!",
        accept_keywords: ["ďakujem", "vďaka", "nech sa páči"],
      },
    ],
  },

  {
    id: "conv-train-ticket",
    title: "Buying a Train Ticket",
    context: "You're at Bratislava hlavná stanica (main station) and want a ticket to Košice.",
    level: "beginner",
    icon: "🚂",
    turns: [
      {
        speaker: "you",
        prompt: "Greet the ticket officer and say you'd like a ticket to Košice.",
        suggested: "Dobrý deň. Jeden lístok do Košíc, prosím.",
        english: "Good afternoon. One ticket to Košice, please.",
        accept_keywords: ["dobrý deň", "lístok", "košíc", "košice", "prosím"],
      },
      {
        speaker: "them",
        slovak: "Tam a späť alebo len tam?",
        english: "Return or one way?",
      },
      {
        speaker: "you",
        prompt: "Say one way only.",
        suggested: "Len tam, prosím.",
        english: "One way only, please.",
        accept_keywords: ["len tam", "jednosmerný", "tam"],
        cultural_note: "Trains in Slovakia are operated by ZSSK. Intercity (IC) trains are fastest but cost more — regional (Os) trains are cheap but slow.",
      },
      {
        speaker: "them",
        slovak: "Na kedy? Najbližší IC ide o 14:05.",
        english: "For when? The next IC leaves at 14:05.",
      },
      {
        speaker: "you",
        prompt: "Say that's good, you'll take that one.",
        suggested: "Dobre, ten vezmem.",
        english: "Good, I'll take that one.",
        accept_keywords: ["dobre", "vezmem", "ten", "áno"],
      },
      {
        speaker: "them",
        slovak: "Dvadsaťdva eur. Platíte kartou alebo hotovosťou?",
        english: "Twenty-two euros. Card or cash?",
      },
      {
        speaker: "you",
        prompt: "Say by card.",
        suggested: "Kartou, prosím.",
        english: "By card, please.",
        accept_keywords: ["kartou", "kartičkou", "platobnou"],
      },
    ],
  },

  // ─── Intermediate (additional) ─────────────────────────────────────────────
  {
    id: "conv-restaurant-reservation",
    title: "Making a Restaurant Reservation",
    context: "You call a restaurant to book a table for Saturday evening.",
    level: "intermediate",
    icon: "📞",
    turns: [
      {
        speaker: "them",
        slovak: "Reštaurácia Korzo, dobrý deň.",
        english: "Restaurant Korzo, good afternoon.",
      },
      {
        speaker: "you",
        prompt: "Say you'd like to reserve a table for two people on Saturday at 7pm.",
        suggested: "Dobrý deň, chcel by som rezervovať stôl pre dve osoby v sobotu o siedmej večer.",
        english: "Good afternoon, I'd like to reserve a table for two people on Saturday at 7pm.",
        accept_keywords: ["rezervovať", "stôl", "dve osoby", "sobotu", "siedmej", "19"],
      },
      {
        speaker: "them",
        slovak: "Moment... áno, máme voľný stôl. Na aké meno?",
        english: "One moment... yes, we have a free table. What name?",
      },
      {
        speaker: "you",
        prompt: "Give your name.",
        suggested: "Na meno ___.",
        english: "Under the name ___.",
        accept_keywords: ["meno", "na"],
        cultural_note: "Slovak restaurants often expect you to show up on time or call if you're late. No-shows without cancellation are considered quite rude.",
      },
      {
        speaker: "them",
        slovak: "Výborne. Tešíme sa na vás v sobotu o 19:00.",
        english: "Excellent. We look forward to seeing you on Saturday at 7pm.",
      },
      {
        speaker: "you",
        prompt: "Thank them and say goodbye.",
        suggested: "Ďakujem pekne. Dovidenia.",
        english: "Thank you very much. Goodbye.",
        accept_keywords: ["ďakujem", "dovidenia", "dovidíme sa"],
      },
    ],
  },

  // ─── Advanced ──────────────────────────────────────────────────────────────
  {
    id: "conv-job-interview",
    title: "Job Interview Small Talk",
    context: "You've arrived for a job interview at a Slovak company. The HR manager greets you before the formal interview begins.",
    level: "advanced",
    icon: "💼",
    turns: [
      {
        speaker: "them",
        slovak: "Vitajte! Dúfam, že ste nás ľahko našli.",
        english: "Welcome! I hope you found us easily.",
      },
      {
        speaker: "you",
        prompt: "Say yes, no problem — the location is very easy to find by tram.",
        suggested: "Áno, bez problémov. Poloha je veľmi dostupná, prišiel som električkou.",
        english: "Yes, no problem. The location is very accessible, I came by tram.",
        accept_keywords: ["bez problémov", "električkou", "dostupná", "ľahko"],
      },
      {
        speaker: "them",
        slovak: "Výborne. Chcete niečo na pitie — vodu, kávu?",
        english: "Excellent. Would you like something to drink — water, coffee?",
      },
      {
        speaker: "you",
        prompt: "Accept a glass of water, thank them.",
        suggested: "Áno, pohár vody by bol skvelý, ďakujem.",
        english: "Yes, a glass of water would be lovely, thank you.",
        accept_keywords: ["vodu", "vody", "pohár", "ďakujem"],
        cultural_note: "Accepting an offered drink is polite in Slovak professional culture — refusing without reason can feel cold. A simple 'voda, prosím' is always safe.",
      },
      {
        speaker: "them",
        slovak: "Nech sa páči. Pracujete momentálne niekde, alebo ste voľný okamžite?",
        english: "Here you go. Are you currently working somewhere, or are you immediately available?",
      },
      {
        speaker: "you",
        prompt: "Say you're currently working but could start in one month after your notice period.",
        suggested: "Momentálne pracujem, ale po výpovednej dobe jedného mesiaca by som bol k dispozícii.",
        english: "I'm currently working, but after a one-month notice period I would be available.",
        accept_keywords: ["pracujem", "mesiac", "výpovedná", "k dispozícii"],
        cultural_note: "Notice periods ('výpovedná doba') in Slovakia are typically 1–3 months by law. Knowing this vocabulary signals professionalism.",
      },
      {
        speaker: "them",
        slovak: "Rozumiem. Tak začneme. Môžete nám povedať niečo o sebe?",
        english: "I understand. Let's begin then. Can you tell us something about yourself?",
      },
    ],
  },
]

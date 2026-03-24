import type { CultureLesson } from "@/types/learning"

export const CULTURE_LESSONS: CultureLesson[] = [
  {
    id: "culture-greetings-etiquette",
    title: "Greeting Etiquette",
    icon: "🤝",
    category: "social",
    level: "beginner",
    body: "Slovaks shake hands when meeting, including with children. Make eye contact — looking away is considered rude or shifty. When entering a shop or office, always say 'Dobrý deň'. When leaving, say 'Dovidenia'. Skipping this feels abrupt to locals.",
    examples: [
      { slovak: "Dobrý deň!", english: "Said when entering any shop, office, or meeting a stranger." },
      { slovak: "Dovidenia!", english: "Said when leaving. Not optional — it's a social obligation." },
      { slovak: "Ahoj! / Čau!", english: "Only for friends and people you know well." },
    ],
    quiz: [
      {
        question: "You walk into a pharmacy. What do you say first?",
        answer: "Dobrý deň",
        distractors: ["Ahoj", "Čau", "Nothing — just browse"],
        explanation: "Always greet with 'Dobrý deň' in formal/public settings. Not greeting is considered rude.",
      },
      {
        question: "Which greeting is appropriate with a stranger on the street?",
        answer: "Dobrý deň",
        distractors: ["Ahoj", "Čauko", "Servus"],
        explanation: "'Dobrý deň' is the safe default with any stranger. Casual greetings are for people you know.",
      },
    ],
  },

  {
    id: "culture-ty-vy-social",
    title: "Formal vs Informal: The Social Rules",
    icon: "👥",
    category: "language",
    level: "beginner",
    body: "Using 'ty' (informal) with someone who expects 'vy' (formal) is a genuine social offense — like addressing your boss by a nickname they never offered. The switch from 'vy' to 'ty' is usually initiated by the older or higher-status person. They may say 'Môžeme si tykať' (we can use ty with each other).",
    examples: [
      { slovak: "Môžeme si tykať.", english: "We can use 'ty' with each other. (An invitation to be informal)" },
      { slovak: "Ako sa voláte?", english: "What is your name? (formal — use with strangers and elders)" },
      { slovak: "Ako sa voláš?", english: "What's your name? (informal — use with friends and children)" },
    ],
    quiz: [
      {
        question: "An elderly woman on a tram speaks to you first. Which form do you use?",
        answer: "Vy (formal)",
        distractors: ["Ty (informal)", "Either is fine", "Don't speak back"],
        explanation: "Always default to 'vy' with strangers, especially older people. Wait for them to invite 'ty'.",
      },
      {
        question: "Your new Slovak colleague is the same age as you. After a week, they say 'Môžeme si tykať'. What happened?",
        answer: "They invited you to use informal 'ty' with each other",
        distractors: ["They said goodbye", "They asked your name", "They asked you to be quiet"],
        explanation: "'Môžeme si tykať' is the formal Slovak invitation to switch to informal address. It's a sign of warmth and acceptance.",
      },
    ],
  },

  {
    id: "culture-na-zdravie",
    title: "Na zdravie — Toast & Sneeze",
    icon: "🥂",
    category: "social",
    level: "beginner",
    body: "'Na zdravie' literally means 'to health'. Slovaks say it before drinking (like 'cheers') AND after someone sneezes (like 'bless you'). When toasting, make eye contact with every person you clink glasses with — not doing so is said to bring seven years of bad luck in Central European tradition.",
    examples: [
      { slovak: "Na zdravie!", english: "Cheers! / Bless you! (after a sneeze)" },
      { slovak: "Nech sa darí!", english: "May things go well for you! (often added after a toast)" },
      { slovak: "Na zdravie a šťastie!", english: "To health and happiness!" },
    ],
    quiz: [
      {
        question: "Your colleague sneezes. What do you say?",
        answer: "Na zdravie",
        distractors: ["Dovidenia", "Ďakujem", "Prosím"],
        explanation: "'Na zdravie' is used after sneezes, exactly like English 'bless you' or German 'Gesundheit'.",
      },
      {
        question: "You're at a Slovak dinner table. Someone raises their glass. What matters most?",
        answer: "Make eye contact with every person you clink glasses with",
        distractors: ["Drink before clinking", "Don't clink — just drink", "Say 'cheers' in English"],
        explanation: "Eye contact when clinking is very important in Slovak (and Czech) culture. Skipping it is considered bad luck and disrespectful.",
      },
    ],
  },

  {
    id: "culture-food-meals",
    title: "Meals & Food Culture",
    icon: "🍽️",
    category: "food",
    level: "beginner",
    body: "The main meal in Slovakia is lunch ('obed'), not dinner. Lunch is usually a hot, cooked meal — soup first, then a main course. Dinner ('večera') is often lighter. 'Dobrú chuť' (bon appétit) is said before eating. The national dish is 'bryndzové halušky' — potato dumplings with sheep's cheese and bacon.",
    examples: [
      { slovak: "Dobrú chuť!", english: "Bon appétit! / Enjoy your meal!" },
      { slovak: "Bryndzové halušky", english: "Slovakia's national dish — potato dumplings with sheep cheese" },
      { slovak: "Obed", english: "Lunch — the main meal of the day in Slovakia" },
    ],
    quiz: [
      {
        question: "Someone sits down to eat in front of you. What do you say?",
        answer: "Dobrú chuť",
        distractors: ["Na zdravie", "Ďakujem", "Dobrý deň"],
        explanation: "'Dobrú chuť' is said to anyone who is eating or about to eat — like 'bon appétit'.",
      },
      {
        question: "Which meal is typically the largest in Slovak culture?",
        answer: "Obed (lunch)",
        distractors: ["Raňajky (breakfast)", "Večera (dinner)", "They're all equal"],
        explanation: "Obed (lunch) is the main hot meal in Slovakia, usually eaten between 12–2pm. Dinner is often lighter.",
      },
    ],
  },

  {
    id: "culture-numbers-money",
    title: "Numbers & Prices in Practice",
    icon: "💶",
    category: "practical",
    level: "beginner",
    body: "Slovakia uses the Euro (€). Prices are written with a comma for decimals: 2,50 € means two euros fifty. When saying prices, Slovaks say the euros then cents: 'dve eurá päťdesiat centov'. Bargaining is not common in shops but is normal at markets ('trh' or 'trhnica').",
    examples: [
      { slovak: "Koľko to stojí?", english: "How much does it cost?" },
      { slovak: "To je 3,20 €.", english: "That's three euros twenty. (tri eurá dvadsať centov)" },
      { slovak: "Máte drobné?", english: "Do you have change?" },
    ],
    quiz: [
      {
        question: "You want to ask the price of something. What do you say?",
        answer: "Koľko to stojí?",
        distractors: ["Kde to je?", "Čo to je?", "Kedy to je?"],
        explanation: "'Koľko' = how much, 'stojí' = costs. Literally 'how much does it stand/cost?'",
      },
      {
        question: "A price tag says '4,90 €'. How do you read this in Slovak?",
        answer: "štyri eurá deväťdesiat centov",
        distractors: ["štyri body deväťdesiat", "štyri a deväťdesiat", "štyri eurá deväť"],
        explanation: "Comma = decimal separator in Slovak. '4,90 €' = štyri eurá deväťdesiat centov.",
      },
    ],
  },

  {
    id: "culture-public-transport",
    title: "Public Transport Customs",
    icon: "🚌",
    category: "practical",
    level: "intermediate",
    body: "In Bratislava, you must validate ('kompostovať') your ticket on entry — plain tickets bought aren't valid until punched. Give up your seat for elderly, pregnant, and disabled passengers — failing to do so will earn you sharp looks. Tram stops are announced in Slovak; knowing a few key terms helps.",
    examples: [
      { slovak: "Kompostovať lístok", english: "To validate/punch your ticket" },
      { slovak: "Nasledujúca zastávka:", english: "Next stop: (announcement prefix)" },
      { slovak: "Prestupná zastávka", english: "Transfer stop (where you change lines)" },
    ],
    quiz: [
      {
        question: "You board a tram in Bratislava with a ticket you just bought. What must you do?",
        answer: "Validate (punch) it in the yellow machine",
        distractors: ["Show it to the driver", "Nothing — buying it is enough", "Scan it on your phone"],
        explanation: "Tickets must be validated ('kompostované') when you board. Unvalidated tickets are treated as no ticket by inspectors.",
      },
    ],
  },

  {
    id: "culture-slovak-history",
    title: "Slovak National Identity",
    icon: "🏔️",
    category: "history",
    level: "intermediate",
    body: "Slovakia only became an independent country on 1 January 1993, when Czechoslovakia peacefully split into Slovakia and the Czech Republic — the 'Velvet Divorce'. Before that, Slovaks spent centuries under Hungarian rule, then as part of the Austro-Hungarian Empire. Slovak national consciousness was shaped by 19th-century figures like Ľudovít Štúr, who codified the modern Slovak literary language in 1843. Slovaks are proud of their distinct language and culture — never confuse Slovak with Czech in conversation.",
    examples: [
      { slovak: "Slovenská republika", english: "The Slovak Republic — independent since 1 January 1993" },
      { slovak: "Ľudovít Štúr", english: "The codifier of modern written Slovak (1843) — a national hero" },
      { slovak: "Zamatová revolúcia", english: "The Velvet Revolution (1989) — peaceful end of communist rule" },
    ],
    quiz: [
      {
        question: "When did Slovakia become an independent country?",
        answer: "1 January 1993",
        distractors: ["1 January 1989", "1 January 1968", "1 January 2004"],
        explanation: "Slovakia declared independence on 1 January 1993 when Czechoslovakia split. 2004 is when Slovakia joined the EU.",
      },
      {
        question: "Who codified the modern Slovak literary language?",
        answer: "Ľudovít Štúr",
        distractors: ["Milan Rastislav Štefánik", "Alexander Dubček", "Andrej Hlinka"],
        explanation: "Ľudovít Štúr standardised the Slovak literary language in 1843, based on the Central Slovak dialect.",
      },
      {
        question: "How did Czechoslovakia split into Slovakia and the Czech Republic?",
        answer: "Peacefully, by agreement — the 'Velvet Divorce'",
        distractors: ["Through a civil war", "Via a UN referendum", "After a constitutional crisis and military intervention"],
        explanation: "The split on 1 January 1993 was entirely peaceful and negotiated — nicknamed the 'Velvet Divorce' after the 1989 Velvet Revolution.",
      },
    ],
  },

  {
    id: "culture-christmas-traditions",
    title: "Christmas & Holiday Traditions",
    icon: "🎄",
    category: "social",
    level: "beginner",
    body: "Christmas ('Vianoce') is the most important holiday in Slovakia. The main celebration is on Christmas Eve ('Štedrý večer' — literally 'Generous Evening'), not Christmas Day. Families gather for a traditional meal that must include fish soup ('rybacia polievka') and fried carp ('vyprážaný kapor'). Presents are said to be brought by 'Ježiško' (Baby Jesus), not Santa Claus. Before eating, the head of the family breaks a wafer ('oblátka') with honey and shares it around the table.",
    examples: [
      { slovak: "Veselé Vianoce!", english: "Merry Christmas!" },
      { slovak: "Štedrý večer", english: "Christmas Eve — the main celebration day" },
      { slovak: "Oblátka", english: "A thin wafer broken and shared before the Christmas Eve meal" },
    ],
    quiz: [
      {
        question: "When is the main Christmas celebration in Slovakia?",
        answer: "Christmas Eve (Štedrý večer)",
        distractors: ["Christmas Day (25 December)", "New Year's Eve", "St. Nicholas Day (6 December)"],
        explanation: "'Štedrý večer' (Christmas Eve, 24 Dec) is the main event in Slovakia — family gathers, the meal is eaten, and gifts are given in the evening.",
      },
      {
        question: "Who brings presents in Slovak Christmas tradition?",
        answer: "Ježiško (Baby Jesus)",
        distractors: ["Santa Claus", "Mikuláš (St. Nicholas)", "Dedko Mráz (Grandfather Frost)"],
        explanation: "In Slovakia, gifts are brought by Ježiško (Baby Jesus) on Christmas Eve. Mikuláš (St. Nicholas) comes on 5-6 December with small gifts and sweets.",
      },
    ],
  },

  {
    id: "culture-regional-dialects",
    title: "Regional Dialects & Accents",
    icon: "🗣️",
    category: "language",
    level: "intermediate",
    body: "Standard Slovak ('spisovná slovenčina') is understood everywhere, but Slovakia has rich regional dialects. The three main dialect groups are Western Slovak (around Trnava, influenced by Czech), Central Slovak (the basis for the literary standard — around Banská Bystrica and Zvolen), and Eastern Slovak (around Prešov and Košice — the most distinct, with unique vocabulary and accent). Eastern Slovak sounds almost like a different language to outsiders. People from Bratislava often mix Slovak with German-origin words due to historical Austro-Hungarian influence.",
    examples: [
      { slovak: "Spisovná slovenčina", english: "Standard/literary Slovak — safe for all formal contexts" },
      { slovak: "Východoslovenský dialekt", english: "Eastern Slovak dialect — very distinct, spoken in Košice region" },
      { slovak: "Ako sa voláš? / Jako sa menaš?", english: "Standard vs Eastern Slovak: 'What's your name?'" },
    ],
    quiz: [
      {
        question: "Which Slovak dialect group forms the basis of the literary (standard) language?",
        answer: "Central Slovak (Stredoslovenský dialekt)",
        distractors: ["Eastern Slovak (Východoslovenský dialekt)", "Western Slovak (Západoslovenský dialekt)", "Bratislava dialect"],
        explanation: "Ľudovít Štúr based the standard on Central Slovak dialects in 1843. Central Slovak is spoken around Banská Bystrica and Zvolen.",
      },
      {
        question: "Which region has the most distinct dialect — often barely understood by speakers from other regions?",
        answer: "Eastern Slovakia (Prešov / Košice area)",
        distractors: ["Bratislava", "Trnava", "Nitra"],
        explanation: "Eastern Slovak dialects have unique vocabulary, grammar structures, and a distinctive accent. Even native Slovaks from western areas sometimes struggle to follow it.",
      },
    ],
  },
]

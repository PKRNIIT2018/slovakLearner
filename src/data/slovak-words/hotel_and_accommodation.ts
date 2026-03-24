import type { WordCategory } from "@/types/learning";

export const HOTEL_AND_ACCOMMODATION: WordCategory = {
  icon: "🏨",
  title: "Hotel & Accommodation",
  description: "Booking stays and hotel services",
  level: "intermediate",
  words: [
    { id: "w-hotel-accomm-hotel", english: "hotel", slovak: "hotel", type: "noun", gender: "masculine", pronunciation: "ho-tel", english_example: "We stayed at a nice hotel.", slovak_example: "Boli sme v peknom hoteli." },
    { id: "w-hotel-accomm-rezervacia", english: "reservation", slovak: "rezervácia", type: "noun", gender: "feminine", pronunciation: "re-zer-vá-cia", english_example: "I made a reservation online.", slovak_example: "Urobil som rezerváciu online." },
    { id: "w-hotel-accomm-ubytovanie", english: "check-in", slovak: "ubytovanie", type: "noun", gender: "neuter", pronunciation: "u-by-to-va-nie", english_example: "Check-in is at 2 PM.", slovak_example: "Ubytovanie je o 14:00." },
    { id: "w-hotel-accomm-odhlasenie", english: "check-out", slovak: "odhlásenie", type: "noun", gender: "neuter", pronunciation: "od-hlá-se-nie", english_example: "Check-out is at noon.", slovak_example: "Odhlásenie je o 12:00." },
    { id: "w-hotel-accomm-kluc", english: "key", slovak: "kľúč", type: "noun", gender: "masculine", pronunciation: "kľúč", english_example: "I lost my room key.", slovak_example: "Stratil som kľúč od izby." },
    { id: "w-hotel-accomm-recepcne", english: "reception", slovak: "recepčné", type: "noun", gender: "neuter", pronunciation: "re-cep-čné", english_example: "Go to reception for help.", slovak_example: "Choď na recepčné pre pomoc." },
    { id: "w-hotel-accomm-ranajky", english: "breakfast", slovak: "raňajky", type: "noun", pronunciation: "ra-ňaj-ky", english_example: "Breakfast is included.", slovak_example: "Raňajky sú zahrnuté." },
    { id: "w-hotel-accomm-batozina", english: "luggage", slovak: "batožina", type: "noun", gender: "feminine", pronunciation: "ba-to-ži-na", english_example: "Where can I store my luggage?", slovak_example: "Kde môžem uložiť batožinu?" },
    { id: "w-hotel-accomm-uterak", english: "towel", slovak: "uterák", type: "noun", gender: "masculine", pronunciation: "u-te-rák", english_example: "Can I get an extra towel?", slovak_example: "Môžem dostať extra uterák?" },
    { id: "w-hotel-accomm-sprcha", english: "shower", slovak: "sprcha", type: "noun", gender: "feminine", pronunciation: "spr-cha", english_example: "The shower is hot.", slovak_example: "Sprcha je horúca." },
    { id: "w-hotel-accomm-toaletne-potreby", english: "toiletries", slovak: "toaletné potreby", type: "noun", gender: "feminine", pronunciation: "to-a-let-né po-tre-by", english_example: "They provide toiletries.", slovak_example: "Poskytujú toaletné potreby." },
    { id: "w-hotel-accomm-jednolozkova-izba", english: "single room", slovak: "jednolôžková izba", type: "noun", gender: "feminine", pronunciation: "jed-no-lôž-ko-vá iz-ba", english_example: "I booked a single room.", slovak_example: "Zarezervoval som jednolôžkovú izbu." },
    { id: "w-hotel-accomm-dvojlozkova-izba", english: "double room", slovak: "dvojlôžková izba", type: "noun", gender: "feminine", pronunciation: "dvoj-lôž-ko-vá iz-ba", english_example: "We need a double room.", slovak_example: "Potrebujeme dvojlôžkovú izbu." },
    { id: "w-hotel-accomm-rezervovat", english: "to book", slovak: "rezervovať", type: "verb", pronunciation: "re-zer-vo-vať", english_example: "I booked a room for two nights.", slovak_example: "Zarezervoval som izbu na dve noci." },
  ],
};

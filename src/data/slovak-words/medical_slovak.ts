// Step 6.4 — C1 Content Expansion
// Category : Medical Slovak
// Words    : 30 | Examples: 30 | Pronunciation: 30
// ⚠️ NEEDS NATIVE SPEAKER REVIEW before publishing — spellings and examples must be verified.

import type { WordCategory } from "@/types/learning";

export const MEDICAL_SLOVAK: WordCategory = {
  icon: "🩺",
  title: "Medical Slovak",
  description: "Specialist consultations, symptoms, and hospital procedures",
  level: "advanced",
  words: [
    { id: "w-med-neurolog", english: "neurologist", slovak: "neurológ", type: "noun", gender: "masculine", pronunciation: "neu-ro-lóg", english_example: "I have an appointment with a neurologist.", slovak_example: "Mám termín u neurológa." },
    { id: "w-med-kardiolog", english: "cardiologist", slovak: "kardiológ", type: "noun", gender: "masculine", pronunciation: "kar-dio-lóg", english_example: "The cardiologist checked my heart.", slovak_example: "Kardiológ mi skontroloval srdce." },
    { id: "w-med-ortoped", english: "orthopedist", slovak: "ortopéd", type: "noun", gender: "masculine", pronunciation: "or-to-péd", english_example: "The orthopedist examined my knee.", slovak_example: "Ortopéd mi vyšetril koleno." },
    { id: "w-med-psychiater", english: "psychiatrist", slovak: "psychiater", type: "noun", gender: "masculine", pronunciation: "psy-chia-ter", english_example: "He was referred to a psychiatrist.", slovak_example: "Bol odoslaný k psychiatrovi." },
    { id: "w-med-onkolog", english: "oncologist", slovak: "onkológ", type: "noun", gender: "masculine", pronunciation: "on-ko-lóg", english_example: "The oncologist reviewed the test results.", slovak_example: "Onkológ prezrel výsledky testov." },
    { id: "w-med-dermatolog", english: "dermatologist", slovak: "dermatológ", type: "noun", gender: "masculine", pronunciation: "der-ma-to-lóg", english_example: "I went to a dermatologist for my skin.", slovak_example: "Išiel som k dermatológovi kvôli pleti." },
    { id: "w-med-gynekolog", english: "gynecologist", slovak: "gynekológ", type: "noun", gender: "masculine", pronunciation: "gy-ne-ko-lóg", english_example: "She visited her gynecologist.", slovak_example: "Navštívila svojho gynekológa." },
    { id: "w-med-infarkt", english: "heart attack", slovak: "infarkt", type: "noun", gender: "masculine", pronunciation: "in-farkt", english_example: "He suffered a heart attack.", slovak_example: "Utrpel infarkt." },
    { id: "w-med-mrtvica", english: "stroke", slovak: "mŕtvica", type: "noun", gender: "feminine", pronunciation: "mŕt-vi-ca", english_example: "She had a stroke last year.", slovak_example: "Minulý rok dostala mŕtvicu." },
    { id: "w-med-cukrovka", english: "diabetes", slovak: "cukrovka", type: "noun", gender: "feminine", pronunciation: "cu-krov-ka", english_example: "He has been managing diabetes for years.", slovak_example: "Roky žije s cukrovkou." },
    { id: "w-med-hypertenzia", english: "hypertension / high blood pressure", slovak: "hypertenzia", type: "noun", gender: "feminine", pronunciation: "hy-per-ten-zia", english_example: "Hypertension increases the risk of stroke.", slovak_example: "Hypertenzia zvyšuje riziko mŕtvice." },
    { id: "w-med-dychavicnost", english: "shortness of breath", slovak: "dýchavičnosť", type: "noun", gender: "feminine", pronunciation: "dý-cha-vič-nosť", english_example: "I have shortness of breath when climbing stairs.", slovak_example: "Mám dýchavičnosť pri chôdzi po schodoch." },
    { id: "w-med-nevolnost", english: "nausea", slovak: "nevoľnosť", type: "noun", gender: "feminine", pronunciation: "ne-voľ-nosť", english_example: "I have been feeling nausea since morning.", slovak_example: "Od rána cítim nevoľnosť." },
    { id: "w-med-vyrazka", english: "rash", slovak: "vyrážka", type: "noun", gender: "feminine", pronunciation: "vy-ráž-ka", english_example: "I have a rash on my arm.", slovak_example: "Mám vyrážku na ruke." },
    { id: "w-med-opuch", english: "swelling", slovak: "opuch", type: "noun", gender: "masculine", pronunciation: "o-puch", english_example: "There is swelling around the ankle.", slovak_example: "Okolo členka je opuch." },
    { id: "w-med-krvacanie", english: "bleeding", slovak: "krvácanie", type: "noun", gender: "neuter", pronunciation: "kr-vá-ca-nie", english_example: "The bleeding has stopped.", slovak_example: "Krvácanie sa zastavilo." },
    { id: "w-med-bezvedomie", english: "unconsciousness", slovak: "bezvedomie", type: "noun", gender: "neuter", pronunciation: "bez-ve-do-mie", english_example: "He lost consciousness at the scene.", slovak_example: "Stratil vedomie na mieste." },
    { id: "w-med-tehotenstvo", english: "pregnancy", slovak: "tehotenstvo", type: "noun", gender: "neuter", pronunciation: "te-ho-ten-stvo", english_example: "She is in the second trimester of pregnancy.", slovak_example: "Je v druhom trimestri tehotenstva." },
    { id: "w-med-hospitalizacia", english: "hospitalization", slovak: "hospitalizácia", type: "noun", gender: "feminine", pronunciation: "hos-pi-ta-li-zá-cia", english_example: "Hospitalization lasted three days.", slovak_example: "Hospitalizácia trvala tri dni." },
    { id: "w-med-prepustenie", english: "discharge (from hospital)", slovak: "prepustenie", type: "noun", gender: "neuter", pronunciation: "pre-pus-te-nie", english_example: "I received my discharge papers today.", slovak_example: "Dnes som dostal prepúšťaciu správu." },
    { id: "w-med-krvna-skupina", english: "blood type", slovak: "krvná skupina", type: "noun", gender: "feminine", pronunciation: "krv-ná sku-pi-na", english_example: "My blood type is A positive.", slovak_example: "Moja krvná skupina je A pozitívna." },
    { id: "w-med-cakarena", english: "waiting room", slovak: "čakáreň", type: "noun", gender: "feminine", pronunciation: "ča-ká-reň", english_example: "Please wait in the waiting room.", slovak_example: "Prosím čakajte v čakárni." },
    { id: "w-med-odborny-lekar", english: "specialist", slovak: "odborný lekár", type: "noun", gender: "masculine", pronunciation: "od-bor-ný le-kár", english_example: "I need a referral to a specialist.", slovak_example: "Potrebujem odporúčanie k odbornému lekárovi." },
    { id: "w-med-zapal", english: "inflammation", slovak: "zápal", type: "noun", gender: "masculine", pronunciation: "zá-pal", english_example: "The inflammation has reduced.", slovak_example: "Zápal sa znížil." },
    { id: "w-med-resuscitacia", english: "resuscitation / CPR", slovak: "resuscitácia", type: "noun", gender: "feminine", pronunciation: "re-sus-ci-tá-cia", english_example: "They performed resuscitation at the scene.", slovak_example: "Na mieste vykonali resuscitáciu." },
    { id: "w-med-sanitka", english: "ambulance", slovak: "sanitka", type: "noun", gender: "feminine", pronunciation: "sa-nit-ka", english_example: "Call an ambulance immediately!", slovak_example: "Zavolajte okamžite sanitku!" },
    { id: "w-med-zdravotna-karta", english: "health insurance card", slovak: "zdravotná karta", type: "noun", gender: "feminine", pronunciation: "zdra-vot-ná kar-ta", english_example: "Show your health insurance card at reception.", slovak_example: "Na recepcii ukážte zdravotnú kartu." },
    { id: "w-med-vysetrenie", english: "medical examination", slovak: "vyšetrenie", type: "noun", gender: "neuter", pronunciation: "vy-še-tre-nie", english_example: "The examination takes about thirty minutes.", slovak_example: "Vyšetrenie trvá asi tridsať minút." },
    { id: "w-med-hospitalizovat", english: "to hospitalize", slovak: "hospitalizovať", type: "verb", pronunciation: "hos-pi-ta-li-zo-vať", english_example: "The doctor decided to hospitalize him.", slovak_example: "Lekár sa rozhodol ho hospitalizovať." },
    { id: "w-med-odoslan", english: "to refer (to a specialist)", slovak: "odoslať", type: "verb", pronunciation: "o-do-slať", english_example: "My GP referred me to a cardiologist.", slovak_example: "Môj obvodný lekár ma odoslal ku kardiológovi." },
  ],
};

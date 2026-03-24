// Step 6.4 — C1 Content Expansion
// Category : Administrative Slovak
// Words    : 30 | Examples: 30 | Pronunciation: 30
// ⚠️ NEEDS NATIVE SPEAKER REVIEW before publishing — spellings and examples must be verified.

import type { WordCategory } from "@/types/learning";

export const ADMINISTRATIVE_SLOVAK: WordCategory = {
  icon: "🏛️",
  title: "Administrative Slovak",
  description: "Tax office, labor office (UPSVAR), trade license (živnosť), and official forms",
  level: "advanced",
  words: [
    { id: "w-admin-zivnost", english: "trade license / self-employment license", slovak: "živnosť", type: "noun", gender: "feminine", pronunciation: "živ-nosť", english_example: "I applied for a trade license.", slovak_example: "Požiadal som o živnosť." },
    { id: "w-admin-zivnostnik", english: "self-employed person / sole trader", slovak: "živnostník", type: "noun", gender: "masculine", pronunciation: "živ-nos-tník", english_example: "He works as a self-employed person.", slovak_example: "Pracuje ako živnostník." },
    { id: "w-admin-danovy-urad", english: "tax office", slovak: "daňový úrad", type: "noun", gender: "masculine", pronunciation: "da-ňo-vý ú-rad", english_example: "I need to register at the tax office.", slovak_example: "Potrebujem sa zaregistrovať na daňovom úrade." },
    { id: "w-admin-upsvar", english: "labor office (UPSVAR)", slovak: "úrad práce", type: "noun", gender: "masculine", pronunciation: "ú-rad prá-ce", english_example: "I registered at the labor office after losing my job.", slovak_example: "Po strate práce som sa prihlásil na úrade práce." },
    { id: "w-admin-dan", english: "tax", slovak: "daň", type: "noun", gender: "feminine", pronunciation: "daň", english_example: "Income tax must be paid by March.", slovak_example: "Daň z príjmu sa musí zaplatiť do marca." },
    { id: "w-admin-dph", english: "VAT (value-added tax)", slovak: "DPH", type: "noun", gender: "feminine", pronunciation: "D-P-H", english_example: "The price includes VAT.", slovak_example: "Cena zahŕňa DPH." },
    { id: "w-admin-danove-priznanie", english: "tax return", slovak: "daňové priznanie", type: "noun", gender: "neuter", pronunciation: "da-ňo-vé priz-na-nie", english_example: "I need to submit my tax return by April.", slovak_example: "Musím podať daňové priznanie do apríla." },
    { id: "w-admin-ico", english: "company registration number (IČO)", slovak: "IČO", type: "noun", gender: "neuter", pronunciation: "I-Č-O", english_example: "Please provide your company registration number.", slovak_example: "Prosím uveďte svoje IČO." },
    { id: "w-admin-dic", english: "tax identification number (DIČ)", slovak: "DIČ", type: "noun", gender: "neuter", pronunciation: "D-I-Č", english_example: "You need a tax ID number to invoice clients.", slovak_example: "Na fakturovanie klientov potrebujete DIČ." },
    { id: "w-admin-potvrdenie", english: "certificate / confirmation", slovak: "potvrdenie", type: "noun", gender: "neuter", pronunciation: "pot-vr-de-nie", english_example: "I need a confirmation of employment.", slovak_example: "Potrebujem potvrdenie o zamestnaní." },
    { id: "w-admin-vypis", english: "official extract / statement", slovak: "výpis", type: "noun", gender: "masculine", pronunciation: "vý-pis", english_example: "I need a bank statement for the application.", slovak_example: "Na žiadosť potrebujem výpis z účtu." },
    { id: "w-admin-prihlasenie", english: "registration / enrollment", slovak: "prihlásenie", type: "noun", gender: "neuter", pronunciation: "pri-hlá-se-nie", english_example: "Address registration is required within ten days.", slovak_example: "Prihlásenie na adresu je nutné do desiatich dní." },
    { id: "w-admin-zapisnica", english: "official record / minutes", slovak: "zápisnica", type: "noun", gender: "feminine", pronunciation: "zá-pis-ni-ca", english_example: "The minutes of the meeting were signed.", slovak_example: "Zápisnica zo stretnutia bola podpísaná." },
    { id: "w-admin-odvody", english: "social and health contributions", slovak: "odvody", type: "noun", gender: "masculine", pronunciation: "od-vo-dy", english_example: "Self-employed workers pay their own contributions.", slovak_example: "Živnostníci platia odvody sami." },
    { id: "w-admin-socialna-poistovna", english: "Social Insurance Agency", slovak: "Sociálna poisťovňa", type: "noun", gender: "feminine", pronunciation: "So-ci-ál-na pois-ťov-ňa", english_example: "I need to register with the Social Insurance Agency.", slovak_example: "Musím sa prihlásiť do Sociálnej poisťovne." },
    { id: "w-admin-ziadost", english: "application / request", slovak: "žiadosť", type: "noun", gender: "feminine", pronunciation: "žia-dosť", english_example: "I submitted an application for a residence permit.", slovak_example: "Podal som žiadosť o povolenie na pobyt." },
    { id: "w-admin-poplatok", english: "fee / charge", slovak: "poplatok", type: "noun", gender: "masculine", pronunciation: "pop-la-tok", english_example: "There is an administrative fee of €5.", slovak_example: "Je tu administratívny poplatok 5 €." },
    { id: "w-admin-uradnik", english: "clerk / official", slovak: "úradník", type: "noun", gender: "masculine", pronunciation: "ú-rad-ník", english_example: "The clerk reviewed my documents.", slovak_example: "Úradník skontroloval moje doklady." },
    { id: "w-admin-formular", english: "form", slovak: "formulár", type: "noun", gender: "masculine", pronunciation: "for-mu-lár", english_example: "Please fill in this form.", slovak_example: "Prosím vyplňte tento formulár." },
    { id: "w-admin-stavebne-povolenie", english: "building permit", slovak: "stavebné povolenie", type: "noun", gender: "neuter", pronunciation: "sta-veb-né po-vo-le-nie", english_example: "A building permit is required before construction.", slovak_example: "Pred výstavbou je potrebné stavebné povolenie." },
    { id: "w-admin-trvaly-pobyt", english: "permanent residence", slovak: "trvalý pobyt", type: "noun", gender: "masculine", pronunciation: "tr-va-lý po-byt", english_example: "I am applying for permanent residence.", slovak_example: "Žiadam o trvalý pobyt." },
    { id: "w-admin-prechodny-pobyt", english: "temporary residence", slovak: "prechodný pobyt", type: "noun", gender: "masculine", pronunciation: "pre-cho-dný po-byt", english_example: "My temporary residence registration expires in May.", slovak_example: "Moja registrácia prechodného pobytu vyprší v máji." },
    { id: "w-admin-rodne-cislo", english: "personal identification number (birth number)", slovak: "rodné číslo", type: "noun", gender: "neuter", pronunciation: "rod-né čís-lo", english_example: "Your birth number is required on all official forms.", slovak_example: "Rodné číslo je potrebné na všetkých úradných formulároch." },
    { id: "w-admin-splnomocnenie", english: "power of attorney / authorization", slovak: "splnomocnenie", type: "noun", gender: "neuter", pronunciation: "spl-no-moc-ne-nie", english_example: "I gave my wife power of attorney.", slovak_example: "Dal som manželke splnomocnenie." },
    { id: "w-admin-overenie", english: "notarization / authentication", slovak: "overenie", type: "noun", gender: "neuter", pronunciation: "o-ve-re-nie", english_example: "The document needs notarization.", slovak_example: "Dokument potrebuje overenie." },
    { id: "w-admin-evidencia", english: "registry / record-keeping", slovak: "evidencia", type: "noun", gender: "feminine", pronunciation: "e-vi-den-cia", english_example: "Your name is in the register.", slovak_example: "Vaše meno je v evidencii." },
    { id: "w-admin-prispevok", english: "benefit / allowance", slovak: "príspevok", type: "noun", gender: "masculine", pronunciation: "prís-pe-vok", english_example: "I applied for an unemployment benefit.", slovak_example: "Požiadal som o príspevok v nezamestnanosti." },
    { id: "w-admin-podat-ziadost", english: "to submit an application", slovak: "podať žiadosť", type: "verb", pronunciation: "po-dať žia-dosť", english_example: "I need to submit the application in person.", slovak_example: "Žiadosť musím podať osobne." },
    { id: "w-admin-odhlasit-sa", english: "to deregister", slovak: "odhlásiť sa", type: "verb", pronunciation: "od-hlá-siť sa", english_example: "I deregistered from my old address.", slovak_example: "Odhlásil som sa zo starej adresy." },
    { id: "w-admin-uradny", english: "official / administrative", slovak: "úradný", type: "adjective", pronunciation: "ú-rad-ný", english_example: "This is an official document.", slovak_example: "Toto je úradný dokument." },
  ],
};

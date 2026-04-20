import React, { useEffect, useMemo, useRef, useState } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import html2canvas from "html2canvas";
import bacheloretteImg from "./bachelorette.png";
import bachelorImg from "./bachelor.png";
import princessImg from "./princess.png";
import sonicImg from "./sonic.png";
import fortniteImg from "./fortnite.png";
import girlsBirthdayImg from "./girls-birthday.png";
import boysBirthdayImg from "./boys-birthday.png";
import animalsImg from "./animals.png";
import genderRevealImg from "./gender.png";

/* =========================
   DATA
========================= */
const conceptsData = {
  girls: [
    {
      id: "barbie",
      name: "ברבי",
      emoji: "💖",
      colors: ["ורוד", "לבן", "זהב"],
      branding: "שלט כניסה ורוד עם שם הילדה, טופרים ממותגים ומדבקות אישיות.",
      tableIdea: "מפה ורודה, בלונים מטאליים, כלי אוכל לבנים ונגיעות זהב.",
    },
    {
      id: "unicorn",
      name: "חד קרן קסום",
      emoji: "🦄",
      colors: ["סגול", "ורוד", "טורקיז"],
      branding: "שלט חד־קרן עם שם הילדה וקישוטי קשת.",
      tableIdea: "שולחן פסטלי עם בלונים בגווני קשת וכלי אוכל צבעוניים.",
    },
    {
      id: "frozen",
      name: "פרוזן",
      emoji: "❄️",
      colors: ["תכלת", "לבן", "כסף"],
      branding: "מיתוג קרחוני עם שם הילדה.",
      tableIdea: "שולחן קפוא עם נצנצים וכלים כסופים.",
    },
    {
      id: "mermaid",
      name: "בת הים הקסומה",
      emoji: "🧜‍♀️",
      colors: ["טורקיז", "סגול", "ורוד"],
      branding: "שלט ים מנצנץ.",
      tableIdea: "צדפים, פנינים וגווני ים.",
    },
  ],
  boys: [
    {
      id: "spiderman",
      name: "ספיידרמן",
      emoji: "🕷️",
      colors: ["אדום", "כחול", "שחור"],
      branding: "שלט גיבורי על עם שם הילד ומדבקות קורי עכביש.",
      tableIdea: "שולחן אדום־כחול עם בלונים מודפסים וקישוטי קורים.",
    },
    {
      id: "soccer",
      name: "כדורגל",
      emoji: "⚽",
      colors: ["ירוק", "שחור", "לבן"],
      branding: "שלט אצטדיון עם שם הילד ומספר חולצה.",
      tableIdea: "שולחן בהשראת מגרש כדורגל.",
    },
    {
      id: "minecraft",
      name: "מיינקראפט",
      emoji: "🧱",
      colors: ["ירוק", "חום", "שחור"],
      branding: "שלט קוביות וגיימינג.",
      tableIdea: "שולחן בנוי כמו עולם בלוקים.",
    },
    {
      id: "hotwheels",
      name: "Hot Wheels",
      emoji: "🏎️",
      colors: ["כתום", "שחור", "אדום"],
      branding: "שלט מרוצים בוער.",
      tableIdea: "מסלולים, מכוניות ודגלי מרוץ.",
    },
  ],
  bachelorette: [
    {
      id: "boho",
      name: "בוהו",
      emoji: "🌸",
      colors: ["בז'", "לבן", "זהב"],
      branding: "שלט עדין עם שם הכלה ופרחים יבשים.",
      tableIdea: "שולחן בגוונים טבעיים עם פרחים יבשים ונרות.",
    },
    {
      id: "pink-night",
      name: "פינק נייט",
      emoji: "🎀",
      colors: ["ורוד", "לבן", "זהב רוז"],
      branding: "מיתוג ורוד נוצץ עם שם הכלה.",
      tableIdea: "שולחן ורוד עם בלונים וקיר צילום.",
    },
  ],
  bachelor: [
    {
      id: "whiskey",
      name: "וויסקי & יוקרה",
      emoji: "🥃",
      colors: ["שחור", "זהב", "חום כהה"],
      branding: "מיתוג שחור־זהב גברי ואלגנטי.",
      tableIdea: "שולחן כהה עם כוסות ויסקי ונרות.",
    },
    {
      id: "pool-party",
      name: "מסיבת בריכה",
      emoji: "🏖️",
      colors: ["טורקיז", "לבן", "כחול"],
      branding: "מיתוג קליל עם שמש ובריכה.",
      tableIdea: "שולחן קיץ עם כוסות צבעוניות ואביזרי חוף.",
    },
  ],
  goldenAge: [
    {
      id: "classic-gold",
      name: "קלאסי זהב",
      emoji: "✨",
      colors: ["זהב", "לבן", "שמנת"],
      branding: "מיתוג אלגנטי עם מספר גיל ושלט יוקרתי.",
      tableIdea: "שולחן קלאסי עם מפות שמנת ופרחים לבנים.",
    },
    {
      id: "tea-garden",
      name: "גן תה חגיגי",
      emoji: "☕",
      colors: ["שמנת", "זהב", "ירוק מרווה"],
      branding: "שלט אלגנטי עם פרחים עדינים.",
      tableIdea: "שולחן תה מעוצב עם כלי הגשה לבנים וזהב.",
    },
  ],
};

const smartTasksTemplates = {
  girls: [
    "בחירת קונספט עיצוב",
    "סגירת מפעילה",
    "הזמנת עוגה מעוצבת",
    "רכישת בלונים",
    "בניית שולחן מתוקים",
    "שליחת הזמנות",
  ],
  boys: [
    "בחירת קונספט",
    "סגירת מפעיל",
    "הזמנת עוגה",
    "בחירת אטרקציה",
    "קניית קישוטים",
    "שליחת הזמנות",
  ],
  bachelorette: [
    "בחירת לוקיישן",
    "סגירת צלם",
    "הזמנת שולחן מתוקים",
    "קניית אביזרים",
    "תכנון לו״ז ערב",
    "הכנת פלייליסט",
  ],
  bachelor: [
    "בחירת לוקיישן",
    "סגירת אטרקציה",
    "הזמנת אוכל",
    "תכנון פעילות",
    "ארגון מוזיקה",
  ],
  goldenAge: [
    "בחירת אולם/בית",
    "הזמנת קייטרינג",
    "הזמנת עוגה",
    "קישוטים עדינים",
    "שליחת הזמנות",
    "תכנון נאומים",
  ],
};

const shopCatalog = {
  products: [
    {
      id: "prod-1",
      title: "מזרון ים הדפס מנומר",
      category: "מתנפחים",
      price: "₪35.90",
      store: "Lifestyle",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      tags: ["בריכה", "קיץ"],
      description: "מתנפח קיצי מושלם למסיבת בריכה או ים.",
      link: "https://s.click.aliexpress.com/e/_DdExample1",
    },
    {
      id: "prod-2",
      title: "בלון מספר ורוד",
      category: "בלונים",
      price: "₪35–₪55",
      store: "Balloon City",
      image:
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
      tags: ["בלונים", "ורוד"],
      description: "בלון מספר גדול ומרשים לתמונה המרכזית.",
      link: "https://s.click.aliexpress.com/e/_DdExample2",
    },
    {
      id: "prod-3",
      title: "צלחות כדורגל",
      category: "מוצרי שולחן",
      price: "₪22–₪34",
      store: "Sport Party",
      image:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
      tags: ["כדורגל", "שולחן"],
      description: "מושלם למסיבות כדורגל עם מראה אחיד.",
      link: "https://s.click.aliexpress.com/e/_DdExample3",
    },
    {
      id: "prod-4",
      title: "קשת בלונים זהב-לבן",
      category: "בלונים",
      price: "₪120–₪190",
      store: "Balloon City",
      image:
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
      tags: ["יוקרה", "בלונים"],
      description: "קשת בלונים יוקרתית לכניסה או קיר צילום.",
      link: "https://s.click.aliexpress.com/e/_DdExample4",
    },
  ],
  invitations: [
    {
      id: "inv-1",
      title: "הזמנה דיגיטלית דוב הקוטב",
      category: "הזמנות",
      price: "₪24.90",
      image:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      tags: ["דיגיטלי", "חמוד"],
      description: "עיצוב חמוד ועדין להזמנה דיגיטלית.",
    },
    {
      id: "inv-2",
      title: "הזמנה דיגיטלית מסיבת כלבים",
      category: "הזמנות",
      price: "₪24.90",
      image:
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80",
      tags: ["כלבים", "דיגיטלי"],
      description: "מתאים למסיבות חיות ואוהבי כלבים.",
    },
    {
      id: "inv-3",
      title: "הזמנה דיגיטלית מלך האריות",
      category: "הזמנות",
      price: "₪24.90",
      image:
        "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80",
      tags: ["סוואנה", "דיגיטלי"],
      description: "עיצוב חזק בהשראת סוואנה והרפתקה.",
    },
    {
      id: "inv-4",
      title: "הזמנה דיגיטלית גיימינג",
      category: "הזמנות",
      price: "₪24.90",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
      tags: ["גיימינג", "דיגיטלי"],
      description: "מתאים לילדים שאוהבים גיימינג.",
    },
  ],
};

const invitationTemplates = [
  {
    id: "bachelorette",
    title: "מסיבת רווקות",
    image: bacheloretteImg,
    overlay:
      "linear-gradient(135deg, rgba(255,220,230,0.18) 0%, rgba(115,72,95,0.16) 100%)",
    accent: "#fff2f6",
    textColor: "#ffffff",
  },
  {
    id: "bachelor",
    title: "מסיבת רווקים",
    image: bachelorImg,
    overlay:
      "linear-gradient(135deg, rgba(95,64,24,0.16) 0%, rgba(28,22,14,0.14) 100%)",
    accent: "#fff0c4",
    textColor: "#ffffff",
  },
  {
    id: "princess",
    title: "נסיכות",
    image: princessImg,
    overlay:
      "linear-gradient(135deg, rgba(255,182,193,0.10) 0%, rgba(255,215,0,0.08) 100%)",
    accent: "#fff6fb",
    textColor: "#ffffff",
  },
  {
    id: "sonic",
    title: "סוניק",
    image: sonicImg,
    overlay:
      "linear-gradient(135deg, rgba(35,84,255,0.12) 0%, rgba(255,187,0,0.06) 100%)",
    accent: "#ffffff",
    textColor: "#ffffff",
  },
  {
    id: "fortnite",
    title: "פורטנייט",
    image: fortniteImg,
    overlay:
      "linear-gradient(135deg, rgba(63,111,255,0.14) 0%, rgba(16,26,61,0.08) 100%)",
    accent: "#ffffff",
    textColor: "#ffffff",
  },
  {
    id: "girls-birthday",
    title: "יום הולדת לבנות",
    image: girlsBirthdayImg,
    overlay:
      "linear-gradient(135deg, rgba(255,189,214,0.14) 0%, rgba(56,42,63,0.08) 100%)",
    accent: "#fff4f8",
    textColor: "#ffffff",
  },
  {
    id: "boys-birthday",
    title: "יום הולדת לבנים",
    image: boysBirthdayImg,
    overlay:
      "linear-gradient(135deg, rgba(113,173,255,0.14) 0%, rgba(26,37,70,0.08) 100%)",
    accent: "#ffffff",
    textColor: "#ffffff",
  },
  {
    id: "animals",
    title: "חיות",
    image: animalsImg,
    overlay:
      "linear-gradient(135deg, rgba(255,200,90,0.10) 0%, rgba(118,74,15,0.08) 100%)",
    accent: "#fff7df",
    textColor: "#ffffff",
  },
  {
    id: "gender-reveal",
    title: "בן או בת",
    image: genderRevealImg,
    overlay:
      "linear-gradient(135deg, rgba(255,185,220,0.12) 0%, rgba(120,190,255,0.12) 100%)",
    accent: "#ffffff",
    textColor: "#ffffff",
  },
];

const supplierRegions = [
  "צפון",
  "חיפה",
  "שרון",
  "מרכז",
  "תל אביב",
  "שפלה",
  "ירושלים",
  "דרום",
  "ארצי",
];
const supplierCategories = [
  "מפעילים",
  "אטרקציות",
  "בלונים",
  "עוגות",
  "סדנאות מתוקים",
  "צלמים",
  "דיג׳יי",
  "מאפרות",
  "מעצבות אירועים",
  "שולחנות מתוקים",
  "מתנפחים",
  "השכרת ציוד",
  "נותני שירות",
];

const suppliers = [
  {
    id: "sup-1",
    name: "Magic Balloons",
    category: "בלונים",
    region: "מרכז",
    city: "תל אביב",
    rating: 4.9,
    phone: "050-1111111",
    insta: "@magic_balloons",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80",
    description: "עיצובי בלונים לאירועים פרטיים וימי הולדת.",
    tags: ["בלונים", "בר מצווה", "בת מצווה"],
  },
  {
    id: "sup-2",
    name: "Sweet Table Dream",
    category: "שולחנות מתוקים",
    region: "מרכז",
    city: "חולון",
    rating: 4.8,
    phone: "050-2222222",
    insta: "@sweet_table_dream",
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
    description: "שולחנות מתוקים בעיצוב אישי לכל קונספט.",
    tags: ["שולחן מתוקים", "מיתוג", "עיצוב"],
  },
  {
    id: "sup-3",
    name: "Cake Boutique",
    category: "עוגות",
    region: "שרון",
    city: "נתניה",
    rating: 4.7,
    phone: "050-3333333",
    insta: "@cake_boutique",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
    description: "עוגות מעוצבות לפי נושא וצבעי האירוע.",
    tags: ["עוגות", "עוגת יום הולדת"],
  },
  {
    id: "sup-4",
    name: "Fun Time Kids",
    category: "מפעילים",
    region: "שפלה",
    city: "רחובות",
    rating: 4.8,
    phone: "050-4444444",
    insta: "@fun_time_kids",
    image:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=80",
    description: "מפעילים לימי הולדת, בועות סבון, משחקים ותחנות.",
    tags: ["הפעלה", "ילדים", "ימי הולדת"],
  },
  {
    id: "sup-5",
    name: "Game Truck Pro",
    category: "אטרקציות",
    region: "דרום",
    city: "באר שבע",
    rating: 4.9,
    phone: "050-5555555",
    insta: "@game_truck_pro",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
    description: "משאית גיימינג ואטרקציות דיגיטליות לאירועים.",
    tags: ["גיימינג", "אטרקציות"],
  },
  {
    id: "sup-6",
    name: "Jerusalem Balloons",
    category: "בלונים",
    region: "ירושלים",
    city: "ירושלים",
    rating: 4.6,
    phone: "050-6666666",
    insta: "@jerusalem_balloons",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
    description: "קשתות בלונים, בלוני מספר וקירות צילום.",
    tags: ["קשת בלונים", "ירושלים"],
  },
  {
    id: "sup-7",
    name: "Northern Cakes",
    category: "עוגות",
    region: "צפון",
    city: "חיפה",
    rating: 4.7,
    phone: "050-7777777",
    insta: "@northern_cakes",
    image:
      "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=900&q=80",
    description: "עוגות, קאפקייקס ושולחנות קינוחים.",
    tags: ["עוגה", "קאפקייקס"],
  },
  {
    id: "sup-8",
    name: "Sharon Party Stars",
    category: "מפעילים",
    region: "שרון",
    city: "כפר סבא",
    rating: 4.8,
    phone: "050-8888888",
    insta: "@sharon_party_stars",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
    description: "מפעילים, סדנאות ותחנות יצירה.",
    tags: ["יצירה", "הפעלה"],
  },
  {
    id: "sup-100",
    name: "בלוני מאיה",
    category: "בלונים",
    region: "שרון",
    city: "נתניה",
    rating: 4.8,
    phone: "052-6001111",
    insta: "@maya_balloons",
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80",
    description: "עיצוב בלונים לימי הולדת, קשתות בלונים ומיתוג שולחנות.",
    tags: ["בלונים", "יום הולדת", "קשת בלונים"],
  },
  {
    id: "sup-101",
    name: "כיף עם רוני",
    category: "מפעילים",
    region: "מרכז",
    city: "פתח תקווה",
    rating: 4.7,
    phone: "052-6002222",
    insta: "@roni_fun_party",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    description: "הפעלות לילדים, משחקים, מוזיקה ותחרויות לימי הולדת.",
    tags: ["מפעילים", "ילדים", "יום הולדת"],
  },
  {
    id: "sup-102",
    name: "Sweet Table by Lian",
    category: "שולחנות מתוקים",
    region: "שפלה",
    city: "רחובות",
    rating: 4.9,
    phone: "052-6003333",
    insta: "@sweettable_lian",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
    description: "שולחנות מתוקים מעוצבים, קינוחים, קאפקייקס ומיתוג אישי.",
    tags: ["שולחן מתוק", "קינוחים", "אירועים"],
  },
  {
    id: "sup-103",
    name: "DJ Eden Kids",
    category: "דיג׳יי",
    region: "חיפה",
    city: "חיפה",
    rating: 4.6,
    phone: "052-6004444",
    insta: "@djedenkids",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    description: "דיג׳יי לאירועי ילדים, ימי הולדת ומסיבות קונספט.",
    tags: ["דיגיי", "מוזיקה", "ילדים"],
  },
  {
    id: "sup-104",
    name: "צילום עם אור",
    category: "צלמים",
    region: "ירושלים",
    city: "ירושלים",
    rating: 4.8,
    phone: "052-6005555",
    insta: "@or_event_photo",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    description: "צילום אירועים, מגנטים, סטילס ותמונות משפחה.",
    tags: ["צילום", "מגנטים", "אירועים"],
  },
  {
    id: "sup-105",
    name: "גלי הפקות אירועים",
    category: "מעצבות אירועים",
    region: "תל אביב",
    city: "תל אביב",
    rating: 4.9,
    phone: "052-6006666",
    insta: "@gali_events_design",
    image:
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=900&q=80",
    description: "מיתוג, עיצוב שולחנות, בלונים וקונספט מלא לאירוע.",
    tags: ["עיצוב", "מיתוג", "אירוע"],
  },
  {
    id: "sup-106",
    name: "המתנפחים של עידן",
    category: "מתנפחים",
    region: "דרום",
    city: "באר שבע",
    rating: 4.5,
    phone: "052-6007777",
    insta: "@idan_inflatables",
    image:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=80",
    description: "השכרת מתנפחים, מתקנים ומשחקי חצר לאירועים.",
    tags: ["מתנפחים", "ילדים", "השכרה"],
  },
  {
    id: "sup-107",
    name: "רותם ביוטי",
    category: "מאפרות",
    region: "מרכז",
    city: "ראשון לציון",
    rating: 4.7,
    phone: "052-6008888",
    insta: "@rotem_beauty_events",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    description: "איפור לאירועים, איפור לבת מצווה, רווקות וימי צילום.",
    tags: ["איפור", "בת מצווה", "רווקות"],
  },
  {
    id: "sup-real-1",
    name: "בלונים באהבה",
    category: "בלונים",
    region: "מרכז",
    city: "רמת גן",
    rating: 4.6,
    price: "החל מ-₪250",
    link: "",
    notes: "דף עסק פעיל באיזי; מומלץ לבדוק זמינות טלפונית לפני שימוש",
    phone: "0544520260",
    insta: "",
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80",
    description: "עיצוב זרי בלונים וחדרים לימי הולדת ולאירועים",
    tags: ["בלונים", "יום הולדת", "מרכז"],
  },
  {
    id: "sup-real-2",
    name: "Balloon Shine",
    category: "בלונים",
    region: "מרכז",
    city: "משמר השבעה",
    rating: 4.7,
    price: "מחיר בפרטי",
    link: "",
    notes:
      "כולל בלונים ליום הולדת, לידה, בר/בת מצווה וגילוי מין; בדף העסק מופיעים גם אינסטגרם ופייסבוק",
    phone: "0528518114",
    insta: "",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80",
    description: "בלונים, מארזים ומתנות למגוון אירועים",
    tags: ["בלונים", "מארזים", "מרכז"],
  },
  {
    id: "sup-real-3",
    name: "פיפס בלונים וקישוטים",
    category: "בלונים",
    region: "מרכז",
    city: "לא צוין",
    rating: 4.8,
    price: "מחיר בפרטי",
    link: "",
    notes:
      "כ-20 שנות ניסיון; מציעים גם קישוטים, מתנפחים ודוכני מזון לפי דף העסק",
    phone: "",
    insta: "",
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80",
    description: "עיצוב בלונים וקישוטים מיוחדים לאירועים",
    tags: ["בלונים", "קישוטים", "אטרקציות"],
  },
  {
    id: "sup-real-4",
    name: "מתוקמאור",
    category: "שולחנות מתוקים",
    region: "תל אביב",
    city: "תל אביב",
    rating: 4.7,
    price: "מחיר בפרטי",
    link: "",
    notes: "מגשי קינוחים, עוגות מעוצבות ושולחנות מתוקים",
    phone: "",
    insta: "",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
    description: "שולחנות מתוקים, קינוחים ועוגות לאירועים",
    tags: ["שולחן מתוק", "עוגות", "קינוחים"],
  },
  {
    id: "sup-real-5",
    name: "Riki Cookies",
    category: "עוגות",
    region: "מרכז",
    city: "רמת גן",
    rating: 4.8,
    price: "מחיר בפרטי",
    link: "",
    notes: "עוגות מעוצבות, מארזים ושולחנות מתוקים",
    phone: "",
    insta: "",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
    description: "עוגות מעוצבות לימי הולדת, בת/בר מצווה ורווקות",
    tags: ["עוגות", "שולחן מתוק", "מיתוג"],
  },
  {
    id: "sup-real-6",
    name: "עובדיה הצלם",
    category: "צלמים",
    region: "ארצי",
    city: "תל אביב / באר שבע",
    rating: 5.0,
    price: "מחיר בפרטי",
    link: "",
    notes: "צילום מגנטים ואירועים; מצוין בדף העסק שפועלים ברחבי הארץ",
    phone: "0556652489",
    insta: "",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    description: "צילום מגנטים ואירועים עם שירות ארצי",
    tags: ["צילום", "מגנטים", "אירועים"],
  },
  {
    id: "sup-real-7",
    name: "דיג'יי ניצן מאירי",
    category: "דיג׳יי",
    region: "מרכז",
    city: "תל אביב",
    rating: 4.8,
    price: "מחיר בפרטי",
    link: "",
    notes: "מופיע כדיג'יי ותיק עם ניסיון רב באירועים",
    phone: "",
    insta: "",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    description: "שירותי תקלוט לאירועים",
    tags: ["DJ", "מוזיקה", "אירועים"],
  },
  {
    id: "sup-real-8",
    name: "ניסו דיסקו",
    category: "מפעילים",
    region: "מרכז",
    city: "תל אביב",
    rating: 4.5,
    price: "מחיר בפרטי",
    link: "",
    notes: "הפעלות לימי הולדת עם קונספטים ותפאורה",
    phone: "",
    insta: "",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    description: "הפעלות לימי הולדת והפקות קונספט לילדים",
    tags: ["מפעילים", "ילדים", "יום הולדת"],
  },
  {
    id: "sup-b1",
    name: "בלוני ליאור",
    category: "בלונים",
    region: "מרכז",
    city: "ראשון לציון",
    rating: 4.9,
    price: "₪600-₪1200",
    link: "https://instagram.com/lior_balloons",
    notes: "קשתות בלונים מושקעות במיוחד",
    phone: "0523456789",
    insta: "@lior_balloons",
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80",
    description: "עיצוב בלונים לאירועים, ימי הולדת ובר מצווה",
    tags: ["בלונים", "קשת בלונים", "עיצוב"],
  },
  {
    id: "sup-b2",
    name: "Balloon Party TLV",
    category: "בלונים",
    region: "תל אביב",
    city: "תל אביב",
    rating: 4.8,
    price: "₪500+",
    link: "https://instagram.com/balloonparty_tlv",
    notes: "משלוחים מהירים ביום האירוע",
    phone: "0521112233",
    insta: "@balloonparty_tlv",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80",
    description: "בלונים, מארזים ומתנות לאירועים",
    tags: ["בלונים", "משלוחים", "מתנות"],
  },
  {
    id: "sup-b3",
    name: "עיצוב בלונים שיר",
    category: "בלונים",
    region: "שרון",
    city: "כפר סבא",
    rating: 4.7,
    price: "₪450-₪900",
    link: "https://instagram.com/shir_balloons",
    notes: "מתאימה לאירועים קטנים ובינוניים",
    phone: "0529988776",
    insta: "@shir_balloons",
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80",
    description: "עיצוב בלונים אישי בהתאמה לאירוע",
    tags: ["בלונים", "יום הולדת"],
  },

  {
    id: "sup-a1",
    name: "מפעיל רוי הפעלות",
    category: "מפעילים",
    region: "מרכז",
    city: "פתח תקווה",
    rating: 4.9,
    price: "₪800-₪1500",
    link: "https://instagram.com/roi_fun",
    notes: "הפעלות עם מוזיקה ומשחקים",
    phone: "0524443322",
    insta: "@roi_fun",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    description: "הפעלות לילדים לימי הולדת ואירועים",
    tags: ["מפעילים", "ילדים", "יום הולדת"],
  },
  {
    id: "sup-a2",
    name: "מסיבת כיף עם דניאל",
    category: "מפעילים",
    region: "שפלה",
    city: "רחובות",
    rating: 4.8,
    price: "₪700-₪1300",
    link: "https://instagram.com/daniel_party",
    notes: "כולל משחקים ותחרויות",
    phone: "0522233445",
    insta: "@daniel_party",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    description: "הפעלות מגוונות עם ציוד מלא",
    tags: ["מפעילים", "מסיבה", "ילדים"],
  },
  {
    id: "sup-a3",
    name: "ליצן יוסי",
    category: "מפעילים",
    region: "דרום",
    city: "אשדוד",
    rating: 4.6,
    price: "₪500-₪900",
    link: "https://instagram.com/yossi_clown",
    notes: "ליצנות קלאסית לילדים",
    phone: "0526677889",
    insta: "@yossi_clown",
    image:
      "https://images.unsplash.com/photo-1574870111867-089730e5a72b?auto=format&fit=crop&w=900&q=80",
    description: "ליצן לאירועים עם הפעלה מלאה",
    tags: ["ליצן", "ילדים", "מפעילים"],
  },
  {
    id: "sup-a4",
    name: "סדנאות יצירה עם נועה",
    category: "מפעילים",
    region: "שרון",
    city: "רעננה",
    rating: 4.9,
    price: "₪900-₪1400",
    link: "https://instagram.com/noa_workshops",
    notes: "מתאים לבנות ולבנים",
    phone: "0523344556",
    insta: "@noa_workshops",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
    description: "סדנאות יצירה חווייתיות",
    tags: ["סדנה", "יצירה", "ילדים"],
  },
];

/* =========================
   UI THEME
========================= */
const appearanceThemes = {
  dark: {
    bg: "radial-gradient(circle at 50% 0%, #22114a 0%, #0f1335 42%, #030816 100%)",
    card: "rgba(15, 19, 53, 0.78)",
    cardSoft: "rgba(24, 29, 71, 0.9)",
    line: "rgba(255,255,255,0.10)",
    text: "#f5f3ff",
    muted: "#b8b6da",
  },
  light: {
    bg: "linear-gradient(180deg, #f8f3ff 0%, #edf7ff 100%)",
    card: "rgba(255,255,255,0.92)",
    cardSoft: "rgba(245,248,255,0.98)",
    line: "rgba(34,36,59,0.08)",
    text: "#22243b",
    muted: "#707491",
  },
};

const accentThemes = {
  pink: { primary: "#ff4fd8", secondary: "#9b5cff", tertiary: "#49a6ff" },
  blue: { primary: "#49a6ff", secondary: "#3ef3ff", tertiary: "#7a6cff" },
  gold: { primary: "#ffd166", secondary: "#ff9a3e", tertiary: "#ff4fd8" },
  mint: { primary: "#29e3a1", secondary: "#49a6ff", tertiary: "#9b5cff" },
};

function useUi(settings) {
  const theme = appearanceThemes[settings.appearance];
  const accent = {
    ...accentThemes[settings.accent],
    gold: "#ffd166",
    danger: "#ff7aa8",
    success: "#29e3a1",
  };
  return useMemo(() => {
    const comfy = settings.density === "comfortable";
    return {
      theme,
      accent,
      shell: {
        minHeight: "100vh",
        background: theme.bg,
        padding: settings.mobileMode ? 14 : 20,
        fontFamily: "Arial, sans-serif",
        direction: "rtl",
        color: theme.text,
      },
      card: {
        background: theme.card,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `1px solid ${theme.line}`,
        borderRadius: settings.mobileMode ? 26 : 30,
        padding: comfy ? 20 : 16,
        marginTop: 14,
        boxShadow: "0 16px 42px rgba(0,0,0,0.18)",
      },
      heroCard: {
        background: `linear-gradient(135deg, ${accent.tertiary}33 0%, ${accent.secondary}33 45%, ${accent.primary}33 100%)`,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `1px solid ${theme.line}`,
        borderRadius: settings.mobileMode ? 24 : 32,
        padding: comfy ? 20 : 16,
        marginTop: 14,
        boxShadow: "0 14px 50px rgba(0,0,0,0.24)",
      },
      miniCard: {
        border: `1px solid ${theme.line}`,
        borderRadius: 24,
        padding: comfy ? 18 : 14,
        background:
          settings.appearance === "dark"
            ? "rgba(255,255,255,0.035)"
            : "rgba(255,255,255,0.82)",
      },
      sectionTitle: { fontSize: 24, fontWeight: "bold" },
      input: {
        width: "100%",
        marginTop: 12,
        padding: settings.mobileMode ? 14 : 13,
        borderRadius: 16,
        border: `1px solid ${theme.line}`,
        background:
          settings.appearance === "dark"
            ? "rgba(255,255,255,0.06)"
            : "rgba(255,255,255,0.9)",
        color: theme.text,
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "inherit",
        fontSize: 15,
      },
      primaryButton: {
        border: "none",
        borderRadius: 16,
        padding: settings.mobileMode ? "14px 16px" : "12px 16px",
        cursor: "pointer",
        fontWeight: "bold",
        color: "white",
        background: `linear-gradient(135deg, ${accent.tertiary} 0%, ${accent.secondary} 55%, ${accent.primary} 100%)`,
        fontFamily: "inherit",
      },
      secondaryButton: {
        border: `1px solid ${theme.line}`,
        borderRadius: 16,
        padding: settings.mobileMode ? "12px 14px" : "10px 14px",
        cursor: "pointer",
        fontWeight: "bold",
        color: theme.text,
        background:
          settings.appearance === "dark"
            ? "rgba(255,255,255,0.05)"
            : "rgba(255,255,255,0.68)",
        fontFamily: "inherit",
      },
      dangerButton: {
        border: `1px solid ${accent.danger}55`,
        borderRadius: 16,
        padding: settings.mobileMode ? "12px 14px" : "10px 14px",
        cursor: "pointer",
        fontWeight: "bold",
        color: accent.danger,
        background:
          settings.appearance === "dark"
            ? "rgba(255,122,168,0.10)"
            : "rgba(255,122,168,0.08)",
        fontFamily: "inherit",
      },
      tabButton: (activeColor, isActive) => ({
        border: `1px solid ${isActive ? activeColor : theme.line}`,
        borderRadius: 16,
        padding: settings.mobileMode ? "12px 15px" : "11px 15px",
        cursor: "pointer",
        fontWeight: "bold",
        background: isActive
          ? `${activeColor}22`
          : settings.appearance === "dark"
          ? "rgba(255,255,255,0.04)"
          : "rgba(255,255,255,0.68)",
        color: theme.text,
        fontFamily: "inherit",
      }),
      chip: (active) => ({
        border: `1px solid ${active ? accent.tertiary : theme.line}`,
        borderRadius: 999,
        padding: "8px 12px",
        cursor: "pointer",
        fontWeight: "bold",
        background: active
          ? `${accent.tertiary}22`
          : settings.appearance === "dark"
          ? "rgba(255,255,255,0.04)"
          : "rgba(255,255,255,0.66)",
        color: theme.text,
        fontFamily: "inherit",
      }),
      logoStyle: {
        fontSize: settings.mobileMode ? 75 : 64,
        fontWeight: "900",
        letterSpacing: 2,
        lineHeight: 1.7, //
        background: `linear-gradient(90deg, ${accent.tertiary} 0%, ${accent.secondary} 50%, ${accent.primary} 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: 6,
        textAlign: "center",
        width: "100%",
      },
      statStyle: {
        background: theme.cardSoft,
        border: `1px solid ${theme.line}`,
        borderRadius: 22,
        padding: 16,
      },
    };
  }, [settings, theme, accent]);
}

/* =========================
   FIREBASE HELPERS
========================= */
async function saveEvent(userId, eventData) {
  const docRef = await addDoc(collection(db, "events"), {
    userId,
    ...eventData,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}
async function getUserEvents(userId) {
  const q = query(collection(db, "events"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}
async function updateEventInFirestore(eventId, updatedFields) {
  await updateDoc(doc(db, "events", eventId), updatedFields);
}
async function deleteEventInFirestore(eventId) {
  await deleteDoc(doc(db, "events", eventId));
}

/* =========================
   LOGIN
========================= */
function LoginScreen({ onLogin, ui }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim())
      return alert("נא למלא אימייל וסיסמה");
    try {
      const cleanEmail = email.trim();
      const cred = isRegister
        ? await createUserWithEmailAndPassword(auth, cleanEmail, password)
        : await signInWithEmailAndPassword(auth, cleanEmail, password);
      onLogin(cred.user);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div
      style={{
        ...ui.shell,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={ui.card}>
          <div style={ui.sectionTitle}>{isRegister ? "הרשמה" : "התחברות"}</div>
          <input
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={ui.input}
          />
          <input
            placeholder="סיסמה"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={ui.input}
          />
          <button
            onClick={handleAuth}
            style={{ ...ui.primaryButton, width: "100%", marginTop: 14 }}
          >
            {isRegister ? "הרשמה" : "התחברות"}
          </button>
          <button
            onClick={() => setIsRegister((prev) => !prev)}
            style={{ ...ui.secondaryButton, width: "100%", marginTop: 10 }}
          >
            {isRegister ? "יש לי חשבון" : "אין לי חשבון"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   PROFILE
========================= */
function ProfileSheet({
  user,
  profile,
  setProfile,
  settings,
  setSettings,
  ui,
  onClose,
}) {
  const updateProfile = (field, value) =>
    setProfile((prev) => ({ ...prev, [field]: value }));
  const updateSettings = (field, value) =>
    setSettings((prev) => ({ ...prev, [field]: value }));

  return (
    <div style={ui.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
        }}
      >
        <div style={ui.sectionTitle}>👤 פרופיל והגדרות</div>
        <button onClick={onClose} style={ui.secondaryButton}>
          סגור
        </button>
      </div>
      <div
        style={{
          ...ui.miniCard,
          marginTop: 14,
          display: "flex",
          gap: 14,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            fontWeight: "bold",
            fontSize: 24,
            background: `linear-gradient(135deg, ${ui.accent.tertiary} 0%, ${ui.accent.secondary} 55%, ${ui.accent.primary} 100%)`,
            color: "white",
          }}
        >
          {(profile.name || user.email || "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: "bold", fontSize: 20 }}>
            {profile.name || "המשתמשת שלי"}
          </div>
          <div style={{ marginTop: 4, color: ui.theme.muted }}>
            {user.email}
          </div>
          <div style={{ marginTop: 4, color: ui.theme.muted, fontSize: 14 }}>
            {profile.role || "מפיקת אירועים"}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        <input
          value={profile.name}
          onChange={(e) => updateProfile("name", e.target.value)}
          placeholder="שם מלא"
          style={ui.input}
        />
        <input
          value={profile.role}
          onChange={(e) => updateProfile("role", e.target.value)}
          placeholder="תפקיד / עסק"
          style={ui.input}
        />
        <input
          value={profile.phone}
          onChange={(e) => updateProfile("phone", e.target.value)}
          placeholder="טלפון"
          style={ui.input}
        />
      </div>
      <div style={{ marginTop: 18, ...ui.sectionTitle, fontSize: 20 }}>
        ⚙️ הגדרות
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ color: ui.theme.muted, marginBottom: 8 }}>מראה</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["dark", "light"].map((value) => (
            <button
              key={value}
              onClick={() => updateSettings("appearance", value)}
              style={ui.chip(settings.appearance === value)}
            >
              {value === "dark" ? "כהה" : "בהיר"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ color: ui.theme.muted, marginBottom: 8 }}>צבע מוביל</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["pink", "blue", "gold", "mint"].map((value) => (
            <button
              key={value}
              onClick={() => updateSettings("accent", value)}
              style={ui.chip(settings.accent === value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <input
          type="checkbox"
          checked={settings.mobileMode}
          onChange={(e) => updateSettings("mobileMode", e.target.checked)}
        />
        <span>טאץ' יותר אפליקציוני</span>
      </label>
    </div>
  );
}

/* =========================
   MAIN APP CONTENT
========================= */
function GlassBadge({ children, ui, tone = "default" }) {
  const map = {
    default: ui.accent.tertiary,
    success: ui.accent.success,
    warning: ui.accent.gold,
    danger: ui.accent.danger,
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: "bold",
        border: `1px solid ${map[tone]}55`,
        background: `${map[tone]}18`,
        color: ui.theme.text,
      }}
    >
      {children}
    </span>
  );
}

function QuickActionCard({ title, subtitle, emoji, onClick, ui }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...ui.miniCard,
        width: "100%",
        textAlign: "right",
        cursor: "pointer",
        border: `1px solid ${ui.theme.line}`,
        minHeight: 132,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 18,
        background:
          ui.theme.text === "#f5f3ff"
            ? "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(247,249,255,0.92) 100%)",
        boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
        transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
        e.currentTarget.style.boxShadow =
          "0 20px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.05), 0 0 24px rgba(155,92,255,0.18)";

        const icon = e.currentTarget.querySelector(".qa-icon");
        if (icon) {
          icon.style.transform = "translateY(-4px) scale(1.08)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.10)";

        const icon = e.currentTarget.querySelector(".qa-icon");
        if (icon) {
          icon.style.transform = "translateY(-2px) scale(1)";
        }
      }}
    >
      <div
        className="qa-icon"
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          fontSize: 24,
          transform: "translateY(-2px) scale(1)",
          transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
          background: "rgba(255,255,255,0.06)",
          border: `1px solid ${ui.theme.line}`,
          alignSelf: "flex-end",
        }}
      >
        {emoji}
      </div>

      <div>
        <div
          style={{
            marginTop: 14,
            fontWeight: 700,
            fontSize: 19,
            letterSpacing: 0.2,
            background: `linear-gradient(90deg, ${ui.accent.secondary}, ${ui.accent.primary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 6,
            color: ui.theme.muted,
            fontSize: 15,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </div>
      </div>
    </button>
  );
}

function EmptyState({ title, subtitle, buttonLabel, onClick, ui }) {
  return (
    <div style={{ ...ui.card, textAlign: "center", padding: 28 }}>
      <div style={{ fontSize: 50 }}>✨</div>
      <div style={{ fontSize: 24, fontWeight: "bold", marginTop: 10 }}>
        {title}
      </div>
      <div style={{ marginTop: 10, color: ui.theme.muted }}>{subtitle}</div>
      <button onClick={onClick} style={{ ...ui.primaryButton, marginTop: 18 }}>
        {buttonLabel}
      </button>
    </div>
  );
}

function MobileBottomNav({ screen, setScreen, ui, isAdmin, setProfileOpen }) {
  const items = [
    { key: "dashboard", label: "דשבורד", emoji: "🏠" },
    { key: "manage", label: "ניהול", emoji: "🗂️" },
    { key: "shop", label: "חנות", emoji: "🛒" },
    { key: "suppliers", label: "ספקים", emoji: "📦" },
    { key: "invitationBuilder", label: "הזמנה", emoji: "💌" },
  ];

  if (isAdmin) {
    items.push({ key: "admin", label: "אדמין", emoji: "⚙️" });
  }

  return (
    <div
      style={{
        position: "fixed",
        right: 12,
        left: 12,
        bottom: 12,
        zIndex: 30,
        background: "rgba(21, 18, 54, 0.88)",
        backdropFilter: "blur(18px)",
        border: `1px solid ${ui.theme.line}`,
        borderRadius: 24,
        padding: 12,
      }}
    ><div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
    rowGap: 10,
    alignItems: "stretch",
    width: "100%",
  }}
>
  {items.map((item) => {
    const isActive = screen === item.key;

    return (
      <button
        key={item.key}
        onClick={() => setScreen(item.key)}
        style={{
          border: "none",
          borderRadius: 18,
          padding: "10px 4px",
          minHeight: 58,
          minWidth: 0,
          width: "100%",
          cursor: "pointer",
          background: isActive
            ? "linear-gradient(135deg, rgba(255,79,216,0.24) 0%, rgba(73,166,255,0.20) 100%)"
            : "transparent",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      >
        <span style={{ fontSize: 18 }}>{item.emoji}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: isActive ? "bold" : "normal",
            whiteSpace: "nowrap",
          }}
        >
          {item.label}
        </span>
      </button>
    );
  })}

  <button
    onClick={() => setProfileOpen(true)}
    style={{
      border: "none",
      borderRadius: 18,
      padding: "10px 4px",
      minHeight: 58,
      minWidth: 0,
      width: "100%",
      cursor: "pointer",
      background: "transparent",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      fontFamily: "inherit",
      boxSizing: "border-box",
    }}
  >
    <span style={{ fontSize: 18 }}>👤</span>
    <span style={{ fontSize: 11, whiteSpace: "nowrap" }}>פרופיל</span>
  </button>
</div>

function SupplierCard({
  supplier,
  ui,
  isSaved,
  isFavorite,
  onSave,
  onFavorite,
  onOpen,
  onWhatsApp,
}) {
  return (
    <div
      style={{
        ...ui.miniCard,
        overflow: "hidden",
        padding: 0,
        borderRadius: 26,
        boxShadow: "0 14px 30px rgba(0,0,0,0.12)",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 180,
          backgroundImage: `url(${supplier.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(10,10,20,0.08) 0%, rgba(10,10,20,0.42) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={onFavorite}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "8px 10px",
              cursor: "pointer",
              background: isFavorite
                ? "rgba(255,79,216,0.22)"
                : "rgba(255,255,255,0.18)",
              color: "white",
              backdropFilter: "blur(10px)",
            }}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>

          <button
            onClick={onSave}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "8px 10px",
              cursor: "pointer",
              background: isSaved
                ? "rgba(41,227,161,0.22)"
                : "rgba(255,255,255,0.18)",
              color: "white",
              backdropFilter: "blur(10px)",
            }}
          >
            {isSaved ? "✅" : "➕"}
          </button>
        </div>

        <div
          style={{
            position: "absolute",
            right: 14,
            left: 14,
            bottom: 14,
            color: "white",
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.92 }}>{supplier.category}</div>
          <div style={{ marginTop: 4, fontSize: 22, fontWeight: 800 }}>
            {supplier.name}
          </div>
          <div style={{ marginTop: 4, fontSize: 14, opacity: 0.92 }}>
            {supplier.city} • {supplier.region}
          </div>
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <GlassBadge ui={ui} tone="warning">
            ⭐ {supplier.rating || "חדש"}
          </GlassBadge>
          {supplier.price ? (
            <GlassBadge ui={ui}>💸 {supplier.price}</GlassBadge>
          ) : (
            <GlassBadge ui={ui}>📍 {supplier.city}</GlassBadge>
          )}
        </div>

        <div
          style={{
            marginTop: 14,
            color: ui.theme.muted,
            lineHeight: 1.7,
            fontSize: 14,
            minHeight: 48,
          }}
        >
          {supplier.description}
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {(supplier.tags || []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: `1px solid ${ui.theme.line}`,
                fontSize: 12,
                color: ui.theme.muted,
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginTop: 16,
          }}
        >
          <button onClick={onOpen} style={ui.primaryButton}>
            פרטים
          </button>

          <button onClick={onSave} style={ui.secondaryButton}>
            {isSaved ? "נשמר" : "שמירה"}
          </button>

          <button onClick={onWhatsApp} style={ui.secondaryButton}>
            וואטסאפ
          </button>
        </div>
      </div>
    </div>
  );
}
function SupplierDetailsModal({
  supplier,
  ui,
  onClose,
  onWhatsApp,
  onSave,
  onFavorite,
  isSaved,
  isFavorite,
}) {
  if (!supplier) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,10,20,0.55)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 999,
        animation: "fadeIn 0.25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          background: ui.theme.card,
          border: `1px solid ${ui.theme.line}`,
          borderRadius: 28,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          animation: "scaleIn 0.25s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          style={{
            position: "relative",
            height: 240,
            backgroundImage: `url(${
              supplier.image ||
              "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80"
            })`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(10,10,20,0.10) 0%, rgba(10,10,20,0.55) 100%)",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
            }}
          />

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              border: "none",
              borderRadius: 999,
              width: 42,
              height: 42,
              cursor: "pointer",
              background: "rgba(255,255,255,0.18)",
              color: "white",
              fontSize: 22,
              backdropFilter: "blur(8px)",
            }}
          >
            ×
          </button>

          <div
            style={{
              position: "absolute",
              right: 18,
              left: 18,
              bottom: 18,
              color: "white",
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.95 }}>
              {supplier.category}
            </div>
            <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800 }}>
              {supplier.name}
            </div>
            <div style={{ marginTop: 6, fontSize: 15, opacity: 0.95 }}>
              {supplier.city} • {supplier.region}
            </div>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <GlassBadge ui={ui} tone="warning">
              ⭐ {supplier.rating || "חדש"}
            </GlassBadge>
            {supplier.price ? (
              <GlassBadge ui={ui}>💸 {supplier.price}</GlassBadge>
            ) : null}
            {supplier.phone ? (
              <GlassBadge ui={ui}>📞 {supplier.phone}</GlassBadge>
            ) : null}
          </div>

          <div
            style={{
              color: ui.theme.muted,
              lineHeight: 1.9,
              fontSize: 15,
            }}
          >
            {supplier.description || "אין תיאור זמין כרגע."}
          </div>

          {!!supplier.notes && (
            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 18,
                background:
                  ui.theme.text === "#f5f3ff"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.72)",
                border: `1px solid ${ui.theme.line}`,
                color: ui.theme.muted,
                lineHeight: 1.8,
                fontSize: 14,
              }}
            >
              {supplier.notes}
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {(supplier.tags || []).map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "7px 11px",
                  borderRadius: 999,
                  border: `1px solid ${ui.theme.line}`,
                  fontSize: 12,
                  color: ui.theme.muted,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginTop: 22,
            }}
          >
            <button onClick={onWhatsApp} style={ui.primaryButton}>
              וואטסאפ
            </button>
            <button onClick={onSave} style={ui.secondaryButton}>
              {isSaved ? "נשמר" : "שמירה"}
            </button>
            <button onClick={onFavorite} style={ui.secondaryButton}>
              {isFavorite ? "מועדף" : "מועדפים"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function EventsScreen({ user, profile, settings, setProfileOpen, ui }) {
  const [screen, setScreen] = useState("dashboard");
  const [supplierWhatsappNote, setSupplierWhatsappNote] = useState("");
  const [timelineState, setTimelineState] = useState({});
  const [shopTab, setShopTab] = useState("products");
  const [conceptCategory, setConceptCategory] = useState("girls");
  const [selectedConceptId, setSelectedConceptId] = useState("");
  const [supplierRegion, setSupplierRegion] = useState("מרכז");
  const [supplierView, setSupplierView] = useState("grid");
  const [supplierCategory, setSupplierCategory] = useState("בלונים");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const invitationCardRef = useRef(null);

  const [adminSupplierName, setAdminSupplierName] = useState("");
  const [adminSupplierCategory, setAdminSupplierCategory] = useState("");
  const [adminSupplierPhone, setAdminSupplierPhone] = useState("");
  const [adminSuppliers, setAdminSuppliers] = useState([]);

  const [adminProductTitle, setAdminProductTitle] = useState("");
  const [adminProductImageFile, setAdminProductImageFile] = useState(null);
  const [adminProductCategory, setAdminProductCategory] = useState("");
  const [adminProductPrice, setAdminProductPrice] = useState("");
  const [adminProductStore, setAdminProductStore] = useState("");
  const [adminProductLink, setAdminProductLink] = useState("");
  const [adminProductImage, setAdminProductImage] = useState("");
  const [adminProducts, setAdminProducts] = useState([]);
  const [editingAdminProductId, setEditingAdminProductId] = useState(null);

  const ADMIN_EMAIL = "makmaayan@gmail.com";
  const isAdmin = user?.email === ADMIN_EMAIL;
  const openSupplierWhatsApp = (supplier) => {
    if (!supplier?.phone) {
      alert("אין מספר וואטסאפ לספק הזה");
      return;
    }

    const cleanPhone = supplier.phone.replace(/[^\d]/g, "");
    const israelPhone = cleanPhone.startsWith("0")
      ? `972${cleanPhone.slice(1)}`
      : cleanPhone;

    const message = `היי ${supplier.name || ""} 👋
  ראיתי אותך דרך EVENTLY ואני מתעניינת בפרטים.
  ${active?.title ? `אירוע: ${active.title}` : ""}
  ${active?.date ? `תאריך: ${active.date}` : ""}
  ${supplierWhatsappNote ? `הערה: ${supplierWhatsappNote}` : ""}
  
  אשמח לקבל מידע נוסף 😊`;

    const url = `https://wa.me/${israelPhone}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };
  const timelineSections = [
    {
      title: "חודש לפני",
      emoji: "🗓️",
      items: [
        "לבחור קונספט",
        "לסגור ספקים מרכזיים",
        "להגדיר תקציב",
        "להכין רשימת מוזמנים",
      ],
    },
    {
      title: "שבוע לפני",
      emoji: "📦",
      items: [
        "לשלוח תזכורת למוזמנים",
        "לאשר הגעה מול ספקים",
        "לקנות מוצרים חסרים",
        "לעדכן לו״ז אירוע",
      ],
    },
    {
      title: "יום לפני",
      emoji: "⏰",
      items: [
        "לבדוק ציוד",
        "לוודא כתובת ושעה עם כולם",
        "להכין בגדים / אביזרים",
        "לעבור על רשימת משימות אחרונה",
      ],
    },
    {
      title: "יום האירוע",
      emoji: "🎉",
      items: ["קבלת ספקים", "בדיקת עיצוב והקמה", "ניהול לו״ז", "ליהנות ולצלם"],
    },
  ];

  const [taskInput, setTaskInput] = useState("");

  const [guestInput, setGuestInput] = useState("");

  const [expenseTitle, setExpenseTitle] = useState("");
  const [guestPhoneInput, setGuestPhoneInput] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteDate, setInviteDate] = useState("");
  const [inviteTime, setInviteTime] = useState("");
  const [inviteLocation, setInviteLocation] = useState("");
  const [inviteMessage, setInviteMessage] = useState("מחכים לכם לחגוג איתנו!");
  const [selectedInviteTemplate, setSelectedInviteTemplate] = useState(
    invitationTemplates[0]?.id || "bachelorette"
  );

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [searchEverywhere, setSearchEverywhere] = useState("");
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const userEvents = await getUserEvents(user.uid);
      setEvents(userEvents);
      if (!activeId && userEvents[0]?.id) setActiveId(userEvents[0].id);
    } catch (error) {
      alert("שגיאה בטעינת האירועים: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  const active = useMemo(
    () => events.find((event) => event.id === activeId) || events[0] || null,
    [events, activeId]
  );

  useEffect(() => {
    if (!active) return;

    setConceptCategory(active.conceptCategory || "girls");
    setSelectedConceptId(active.conceptId || "");

    if (active.invitation) {
      setInviteTitle(active.invitation.title || "");
      setInviteDate(active.invitation.date || "");
      setInviteTime(active.invitation.time || "");
      setInviteLocation(active.invitation.location || "");
      setInviteMessage(active.invitation.message || "מחכים לכם לחגוג איתנו!");

      setSelectedInviteTemplate(
        active.invitation.templateId ||
          invitationTemplates[0]?.id ||
          "bachelorette"
      );
    } else {
      setInviteTitle(active.title || "");
      setInviteDate(active.date || "");
      setInviteTime("");
      setInviteLocation("");
      setInviteMessage("מחכים לכם לחגוג איתנו!");

      setSelectedInviteTemplate(invitationTemplates[0]?.id || "bachelorette");
    }
  }, [active?.id]);

  const dashboardStats = useMemo(() => {
    const totalEvents = events.length;
    const totalGuests = events.reduce(
      (sum, event) => sum + (event.guests || []).length,
      0
    );
    const totalTasks = events.reduce(
      (sum, event) => sum + (event.tasks || []).length,
      0
    );
    const doneTasks = events.reduce(
      (sum, event) => sum + (event.tasks || []).filter((t) => t.done).length,
      0
    );
    const totalExpenses = events.reduce(
      (sum, event) =>
        sum +
        (event.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0),
      0
    );
    return { totalEvents, totalGuests, totalTasks, doneTasks, totalExpenses };
  }, [events]);

  const activeEventProgress = active?.tasks?.length
    ? Math.round(
        ((active.tasks || []).filter((task) => task.done).length /
          active.tasks.length) *
          100
      )
    : 0;

  const filteredEvents = useMemo(() => {
    return (events || []).filter((event) => {
      const text = `${event.title || ""} ${event.notes || ""}`.toLowerCase();

      const matchesSearch =
        !searchEverywhere.trim() ||
        text.includes(searchEverywhere.trim().toLowerCase());

      const matchesUpcoming =
        !showOnlyUpcoming ||
        !event.date ||
        new Date(event.date).toString() === "Invalid Date" ||
        new Date(event.date) >= new Date(new Date().toDateString());

      return matchesSearch && matchesUpcoming;
    });
  }, [events, searchEverywhere, showOnlyUpcoming]);

  const upcomingEvents = useMemo(() => {
    return [...(events || [])]
      .filter((event) => event.date)
      .filter((event) => !isNaN(new Date(event.date)))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  }, [events]);

  const createEvent = async () => {
    if (!newEventTitle.trim()) return alert("תכתבי שם לאירוע");
    try {
      setSaving(true);
      const id = await saveEvent(user.uid, {
        title: newEventTitle.trim(),
        date: "",
        notes: "",
        guests: [],
        tasks: [],
        expenses: [],
        budget: 0,
        conceptCategory: "",
        conceptId: "",
        savedProducts: [],
        favoriteProducts: [],
        savedSuppliers: [],
        favoriteSuppliers: [],
        invitation: null,
      });
      setNewEventTitle("");
      const refreshed = await getUserEvents(user.uid);
      setEvents(refreshed);
      setActiveId(id);
      setScreen("event");
    } catch (error) {
      alert("שגיאה בשמירת האירוע: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveActiveFields = async (fields) => {
    if (!active) return;
    const updated = { ...active, ...fields };
    setEvents((prev) =>
      prev.map((item) => (item.id === active.id ? updated : item))
    );
    try {
      setSaving(true);
      await updateEventInFirestore(active.id, fields);
    } catch (error) {
      alert("שגיאה בעדכון האירוע: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeActive = async () => {
    if (!active) return;
    if (!window.confirm(`למחוק את האירוע "${active.title}"?`)) return;
    try {
      setSaving(true);
      await deleteEventInFirestore(active.id);
      const next = events.filter((item) => item.id !== active.id);
      setEvents(next);
      setActiveId(next[0]?.id || null);
      setScreen("dashboard");
    } catch (error) {
      alert("שגיאה במחיקת האירוע: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const applyConcept = async () => {
    if (!active || !selectedConceptId) return;
    await saveActiveFields({ conceptCategory, conceptId: selectedConceptId });
    setScreen("event");
  };

  const generateTasks = async () => {
    if (!active) return;
    const template = smartTasksTemplates[conceptCategory] || [];
    const existing = new Set((active.tasks || []).map((t) => t.title));
    const tasks = [...(active.tasks || [])];
    template.forEach((title, index) => {
      if (!existing.has(title))
        tasks.push({ id: Date.now() + index, title, done: false });
    });
    await saveActiveFields({ tasks });
    setScreen("event");
  };

  const toggleSaveProduct = async (item) => {
    if (!active) return;
    const current = active.savedProducts || [];
    const exists = current.some((p) => p.id === item.id);
    const savedProducts = exists
      ? current.filter((p) => p.id !== item.id)
      : [...current, item];
    await saveActiveFields({ savedProducts });
  };

  const toggleFavoriteProduct = async (item) => {
    if (!active) return;
    const current = active.favoriteProducts || [];
    const exists = current.some((p) => p.id === item.id);
    const favoriteProducts = exists
      ? current.filter((p) => p.id !== item.id)
      : [...current, item];
    await saveActiveFields({ favoriteProducts });
  };

  const toggleFavoriteSupplier = async (supplier) => {
    if (!active) return;
    const current = active.favoriteSuppliers || [];
    const exists = current.some((s) => s.id === supplier.id);
    const favoriteSuppliers = exists
      ? current.filter((s) => s.id !== supplier.id)
      : [...current, supplier];
    await saveActiveFields({ favoriteSuppliers });
  };

  const toggleSaveSupplier = async (supplier) => {
    if (!active) return;

    const current = active.savedSuppliers || [];
    const exists = current.some((s) => s.id === supplier.id);

    const savedSuppliers = exists
      ? current.filter((s) => s.id !== supplier.id)
      : [
          ...current,
          {
            ...supplier,
            dealStatus: "בבדיקה",
            dealPrice: "",
            dealNotes: "",
          },
        ];

    await saveActiveFields({ savedSuppliers });
  };

  const updateSavedSupplierField = async (supplierId, field, value) => {
    if (!active) return;

    const savedSuppliers = (active.savedSuppliers || []).map((supplier) =>
      supplier.id === supplierId ? { ...supplier, [field]: value } : supplier
    );

    await saveActiveFields({ savedSuppliers });
  };

  const removeSavedSupplier = async (supplierId) => {
    if (!active) return;

    const savedSuppliers = (active.savedSuppliers || []).filter(
      (supplier) => supplier.id !== supplierId
    );

    await saveActiveFields({ savedSuppliers });
  };
  const addTask = async () => {
    if (!active || !taskInput.trim()) return;
    const tasks = [
      ...(active.tasks || []),
      { id: Date.now(), title: taskInput.trim(), done: false },
    ];
    setTaskInput("");
    await saveActiveFields({ tasks });
  };

  const toggleTaskDone = async (taskId) => {
    if (!active) return;
    const tasks = (active.tasks || []).map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task
    );
    await saveActiveFields({ tasks });
  };

  const removeTask = async (taskId) => {
    if (!active) return;
    const tasks = (active.tasks || []).filter((task) => task.id !== taskId);
    await saveActiveFields({ tasks });
  };

  const addGuest = async () => {
    if (!active || !guestInput.trim()) return;

    const guests = [
      ...(active.guests || []),
      {
        id: Date.now(),
        name: guestInput.trim(),
        phone: guestPhoneInput.trim(),
        status: "ממתין",
      },
    ];

    setGuestInput("");
    setGuestPhoneInput("");
    await saveActiveFields({ guests });
  };

  const addProductFromAdmin = () => {
    if (!adminProductTitle.trim()) {
      alert("צריך למלא שם מוצר");
      return;
    }

    const productPayload = {
      id: editingAdminProductId || "admin-prod-" + Date.now(),
      title: adminProductTitle.trim(),
      category: adminProductCategory.trim() || "כללי",
      price: adminProductPrice.trim() || "לא צוין",
      store: adminProductStore.trim() || "מותאם אישית",
      image: adminProductImage.trim() || "https://via.placeholder.com/300x200",
      tags: ["חדש"],
      description: "מוצר שנוסף דרך האדמין",
      link: adminProductLink.trim(),
    };

    if (editingAdminProductId) {
      setAdminProducts((prev) =>
        prev.map((item) =>
          item.id === editingAdminProductId ? productPayload : item
        )
      );
      alert("המוצר עודכן");
    } else {
      setAdminProducts((prev) => [productPayload, ...prev]);
      alert("המוצר נוסף לחנות");
    }

    setAdminProductTitle("");
    setAdminProductCategory("");
    setAdminProductPrice("");
    setAdminProductStore("");
    setAdminProductLink("");
    setAdminProductImage("");
    setEditingAdminProductId(null);
  };
  const handleAdminProductImageUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setAdminProductImage(reader.result);
      setAdminProductImageFile(file);
    };

    reader.readAsDataURL(file);
  };

  const editAdminProduct = (item) => {
    setAdminProductTitle(item.title || "");
    setAdminProductCategory(item.category || "");
    setAdminProductPrice(item.price || "");
    setAdminProductStore(item.store || "");
    setAdminProductLink(item.link || "");
    setAdminProductImage(item.image || "");
    setEditingAdminProductId(item.id);
  };

  const toggleTimelineItem = (sectionTitle, item) => {
    const key = `${sectionTitle}-${item}`;

    setTimelineState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  // 👆👆👆 כאן בדיוק

  const removeGuest = async (indexToDelete) => {
    if (!active) return;

    const guests = (active.guests || []).filter(
      (_, idx) => idx !== indexToDelete
    );

    await saveActiveFields({ guests });
  };

  const updateGuestStatus = async (guestId, newStatus) => {
    if (!active) return;

    const guests = (active.guests || []).map((guest) =>
      typeof guest === "string"
        ? guest
        : guest.id === guestId
        ? { ...guest, status: newStatus }
        : guest
    );

    await saveActiveFields({ guests });
  };
  const sendGuestWhatsApp = async (guest) => {
    const guestName = typeof guest === "string" ? guest : guest.name;

    const text = `היי ${guestName || ""}! 💌
  נשמח לאישור הגעה ל-${active?.title || "האירוע שלנו"}.
  תאריך: ${active?.date || inviteDate || "יעודכן"}
  ${inviteTime ? `שעה: ${inviteTime}` : ""}
  ${inviteLocation ? `מיקום: ${inviteLocation}` : ""}
  אנא החזירו תשובה:
  ✅ מאשר/ת
  ❌ לא מגיע/ה`;

    try {
      await navigator.clipboard.writeText(text);
      window.open("https://wa.me/", "_blank");
      alert("הטקסט הועתק. בוואטסאפ פשוט תדביקי.");
    } catch (err) {
      alert("לא הצלחתי לפתוח וואטסאפ.");
    }
  };
  const exportGuestsToCSV = () => {
    if (!active || !active.guests || active.guests.length === 0) {
      alert("אין מוזמנים לייצוא");
      return;
    }

    const rows = [
      ["שם", "טלפון", "סטטוס"],
      ...active.guests.map((guest) => [
        typeof guest === "string" ? guest : guest.name || "",
        typeof guest === "string" ? "" : guest.phone || "",
        typeof guest === "string" ? "ממתין" : guest.status || "ממתין",
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(active.title || "guests").replace(
      /\s+/g,
      "_"
    )}_guests.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const addExpense = async () => {
    if (!active || !expenseTitle.trim() || !expenseAmount.trim()) return;
    const expenses = [
      ...(active.expenses || []),
      {
        id: Date.now(),
        title: expenseTitle.trim(),
        amount: Number(expenseAmount) || 0,
      },
    ];
    setExpenseTitle("");
    setExpenseAmount("");
    await saveActiveFields({ expenses });
  };

  const removeExpense = async (expenseId) => {
    if (!active) return;
    const expenses = (active.expenses || []).filter(
      (expense) => expense.id !== expenseId
    );
    await saveActiveFields({ expenses });
  };

  const saveInvitation = async () => {
    if (!active) return;
    const invitation = {
      title: inviteTitle || active.title || "האירוע שלנו",
      date: inviteDate,
      time: inviteTime,
      location: inviteLocation,
      message: inviteMessage,
      templateId: selectedInviteTemplate,
    };
    await saveActiveFields({ invitation });
    alert("ההזמנה נשמרה");
  };

  const copyInvitationText = async () => {
    const text = `${inviteTitle || "אתם מוזמנים!"}
תאריך: ${inviteDate || "-"}
שעה: ${inviteTime || "-"}
מיקום: ${inviteLocation || "-"}
${inviteMessage || ""}`;
    try {
      await navigator.clipboard.writeText(text);
      alert("הטקסט הועתק");
    } catch {
      alert("לא הצלחתי להעתיק. אפשר לסמן ידנית.");
    }
  };

  const downloadInvitationImage = async () => {
    if (!invitationCardRef.current) return;
    try {
      const canvas = await html2canvas(invitationCardRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `${(
        inviteTitle ||
        active?.title ||
        "evently-invitation"
      ).replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      alert("לא הצלחתי להוריד את ההזמנה כתמונה");
    }
  };

  const shareInvitationWhatsApp = async () => {
    const text = `${inviteTitle || active?.title || "האירוע שלנו"}
  תאריך: ${inviteDate || "לבחירה"}
  ${inviteTime ? `שעה: ${inviteTime}` : ""}
  מיקום: ${inviteLocation || "יעודכן"}
  ${inviteMessage || "מחכים לכם לחגוג איתנו!"}`;

    try {
      await navigator.clipboard.writeText(text);
      window.open("https://wa.me/", "_blank");
    } catch (err) {
      alert("הטקסט הועתק, פתחי וואטסאפ והדביקי 😊");
    }
  };

  const allSuppliers = [...adminSuppliers, ...suppliers];

  const filteredSuppliers = useMemo(
    () =>
      allSuppliers.filter((supplier) => {
        const byRegion = !supplierRegion || supplier.region === supplierRegion;

        const byCategory =
          !supplierCategory || supplier.category === supplierCategory;

        const searchText = `${supplier.name} ${supplier.city} ${
          supplier.category
        } ${(supplier.tags || []).join(" ")}`.toLowerCase();

        const bySearch =
          supplierSearch.trim() === "" ||
          searchText.includes(supplierSearch.toLowerCase());

        return byRegion && byCategory && bySearch;
      }),
    [allSuppliers, supplierRegion, supplierCategory, supplierSearch]
  );

  const allShopProducts = [...adminProducts, ...shopCatalog.products];

  const currentShopItems = useMemo(() => {
    const items =
      shopTab === "products" ? allShopProducts : shopCatalog.invitations;

    return items.filter((item) => {
      const text = `${item.title} ${item.category} ${item.store || ""} ${(
        item.tags || []
      ).join(" ")}`.toLowerCase();

      return (
        productSearch.trim() === "" ||
        text.includes(productSearch.toLowerCase())
      );
    });
  }, [shopTab, productSearch, allShopProducts]);

  const selectedConcept = useMemo(
    () =>
      (conceptsData[conceptCategory] || []).find(
        (c) => c.id === selectedConceptId
      ) || null,
    [conceptCategory, selectedConceptId]
  );
  const selectedInviteTheme = useMemo(
    () =>
      invitationTemplates.find((item) => item.id === selectedInviteTemplate) ||
      invitationTemplates[0],
    [selectedInviteTemplate]
  );

  const progressPct = dashboardStats.totalTasks
    ? Math.round((dashboardStats.doneTasks / dashboardStats.totalTasks) * 100)
    : 0;
  const conceptLabel =
    active?.conceptCategory && active?.conceptId
      ? (conceptsData[active.conceptCategory] || []).find(
          (c) => c.id === active.conceptId
        )
      : null;
  const productFavoritesCount = (active?.favoriteProducts || []).length || 0;
  const savedSuppliersCount = (active?.savedSuppliers || []).length || 0;

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        paddingBottom: settings.mobileMode ? 86 : 20,
      }}
    >
      <div style={ui.heroCard}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 12,
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div>
            {/* כותרת ממורכזת */}
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ textAlign: "center", width: "100%" }}>
                <div style={ui.logoStyle}>Evently</div>
              </div>

              <div
                style={{
                  fontSize: 14,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: ui.accent.gold,
                  marginTop: 6,
                }}
              >
                Premium Event Planner
              </div>
            </div>

            {/* ברכה */}
            <div
              style={{
                fontSize: settings.mobileMode ? 30 : 38,
                fontWeight: 900,
              }}
            >
              היי {profile?.name || "מעייני"} ✨
            </div>

            {/* תיאור */}
            <div
              style={{
                marginTop: 8,
                color: ui.theme.muted,
                lineHeight: 1.8,
                maxWidth: 460,
              }}
            >
              ניהול אירועים, ספקים והזמנות — הכל במקום אחד, בעיצוב שמרגיש כמו
              אפליקציה אמיתית.
            </div>

            {/* סטטיסטיקות */}
            <div
              style={{
                marginTop: 14,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <GlassBadge ui={ui}>
                🎉 {dashboardStats.totalEvents} אירועים
              </GlassBadge>
              <GlassBadge ui={ui} tone="success">
                ✅ {dashboardStats.doneTasks}/{dashboardStats.totalTasks} משימות
              </GlassBadge>
              <GlassBadge ui={ui} tone="warning">
                👥 {dashboardStats.totalGuests} מוזמנים
              </GlassBadge>
            </div>
          </div>

          <div
            style={{
              minWidth: settings.mobileMode ? "100%" : 240,
              flex: 1,
              maxWidth: 320,
            }}
          >
            <div
              style={{
                ...ui.miniCard,
                padding: 20,
                borderRadius: 24,
                background:
                  ui.theme.text === "#f5f3ff"
                    ? "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)"
                    : "rgba(255,255,255,0.95)",
                boxShadow: "0 12px 28px rgba(0,0,0,0.14)",
              }}
            >
              <div style={{ fontSize: 13, color: ui.theme.muted }}>
                האירוע הפעיל
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 18,
                  fontWeight: "bold",
                  lineHeight: 1.4,
                }}
              >
                {active?.title || "עוד לא נבחר אירוע"}
              </div>

              <div
                style={{ marginTop: 8, color: ui.theme.muted, fontSize: 14 }}
              >
                {active?.date || "אין תאריך עדיין"}
              </div>

              <div style={{ marginTop: 18 }}>
                <div
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.10)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${activeEventProgress}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: `linear-gradient(90deg, ${ui.accent.tertiary} 0%, ${ui.accent.secondary} 45%, ${ui.accent.primary} 100%)`,
                    }}
                  />
                </div>

                <div
                  style={{ marginTop: 10, fontSize: 13, color: ui.theme.muted }}
                >
                  התקדמות: {activeEventProgress}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: settings.mobileMode
              ? "1fr 1fr"
              : "repeat(3, 1fr)",
            gap: 10,
            marginTop: 18,
          }}
        >
          <QuickActionCard
            ui={ui}
            emoji="➕"
            title="אירוע חדש"
            subtitle="יצירה מהירה"
            onClick={createEvent}
          />
          <QuickActionCard
            ui={ui}
            emoji="💌"
            title="הזמנות"
            subtitle="ניהול הזמנות"
            onClick={() => setScreen("invitationBuilder")}
          />
          <QuickActionCard
            ui={ui}
            emoji="🛍️"
            title="ספקים"
            subtitle="מצא ספקים"
            onClick={() => setScreen("suppliers")}
          />
          <QuickActionCard
            ui={ui}
            emoji="🧠"
            title="קונספטים"
            subtitle="קבל השראה"
            onClick={() => setScreen("concepts")}
          />
          <QuickActionCard
            ui={ui}
            emoji="❤️"
            title="מועדפים"
            subtitle="כל מה ששמרת"
            onClick={() => setScreen("favorites")}
          />
          <QuickActionCard
            ui={ui}
            emoji="🛒"
            title="חנות"
            subtitle="מוצרים והזמנות"
            onClick={() => setScreen("shop")}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setScreen("dashboard")}
            style={ui.tabButton(ui.accent.primary, screen === "dashboard")}
          >
            דשבורד
          </button>

          <button
            onClick={() => setScreen("home")}
            style={ui.tabButton(ui.accent.tertiary, screen === "home")}
          >
            אירועים
          </button>

          <button
            onClick={() => setScreen("event")}
            style={ui.tabButton(ui.accent.secondary, screen === "event")}
          >
            אירוע
          </button>

          <button
            onClick={() => setScreen("manage")}
            style={ui.tabButton(ui.accent.gold, screen === "manage")}
          >
            ניהול
          </button>

          <button
            onClick={() => setScreen("suppliers")}
            style={ui.tabButton(ui.accent.tertiary, screen === "suppliers")}
          >
            ספקים
          </button>

          <button
            onClick={() => setScreen("shop")}
            style={ui.tabButton(ui.accent.primary, screen === "shop")}
          >
            חנות
          </button>

          <button
            onClick={() => setScreen("favorites")}
            style={ui.tabButton(ui.accent.primary, screen === "favorites")}
          >
            מועדפים
          </button>

          <button
            onClick={() => setScreen("invitationBuilder")}
            style={ui.tabButton(
              ui.accent.secondary,
              screen === "invitationBuilder"
            )}
          >
            הזמנה
          </button>
        </div>
      </div>

      {saving && (
        <div style={{ ...ui.card, padding: 12 }}>
          <div style={{ color: ui.accent.tertiary }}>שומר שינויים בענן...</div>
        </div>
      )}

      {screen === "dashboard" && (
        <>
          <div style={ui.card}>
            <div style={ui.sectionTitle}>📊 דשבורד אמיתי</div>
            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div style={ui.statStyle}>
                <div style={{ color: ui.theme.muted, fontSize: 13 }}>
                  סה״כ מוזמנים
                </div>
                <div style={{ marginTop: 6, fontWeight: "bold", fontSize: 28 }}>
                  {dashboardStats.totalGuests}
                </div>
                {active && (
                  <div
                    style={{
                      ...ui.miniCard,
                      marginTop: 12,
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div style={{ fontWeight: "bold", fontSize: 18 }}>
                      💰 תקציב האירוע
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: settings.mobileMode
                          ? "1fr 1fr"
                          : "repeat(3, 1fr)",
                      }}
                    >
                      <div>
                        <div style={{ color: ui.theme.muted, fontSize: 13 }}>
                          תקציב
                        </div>
                        <div style={{ fontWeight: "bold", fontSize: 20 }}>
                          ₪{Number(active.budget || 0)}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: ui.theme.muted, fontSize: 13 }}>
                          הוצאות
                        </div>
                        <div style={{ fontWeight: "bold", fontSize: 20 }}>
                          ₪
                          {(active.expenses || []).reduce(
                            (sum, item) => sum + Number(item.amount || 0),
                            0
                          )}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: ui.theme.muted, fontSize: 13 }}>
                          נשאר
                        </div>
                        <div
                          style={{
                            fontWeight: "bold",
                            fontSize: 20,
                            color:
                              Number(active.budget || 0) -
                                (active.expenses || []).reduce(
                                  (sum, item) => sum + Number(item.amount || 0),
                                  0
                                ) >=
                              0
                                ? ui.accent.success
                                : ui.accent.danger,
                          }}
                        >
                          ₪
                          {Number(active.budget || 0) -
                            (active.expenses || []).reduce(
                              (sum, item) => sum + Number(item.amount || 0),
                              0
                            )}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "center", marginTop: 4 }}>
                      {Number(active.budget || 0) > 0
                        ? Math.min(
                            100,
                            Math.round(
                              ((active.expenses || []).reduce(
                                (sum, item) => sum + Number(item.amount || 0),
                                0
                              ) /
                                Number(active.budget || 0)) *
                                100
                            )
                          )
                        : 0}
                      % נוצל
                      <div
                        style={{
                          marginTop: 10,
                          width: "100%",
                          height: 12,
                          borderRadius: 999,
                          background:
                            settings.appearance === "dark"
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(34,36,59,0.08)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${
                              Number(active.budget || 0) > 0
                                ? Math.min(
                                    100,
                                    Math.round(
                                      ((active.expenses || []).reduce(
                                        (sum, item) =>
                                          sum + Number(item.amount || 0),
                                        0
                                      ) /
                                        Number(active.budget || 0)) *
                                        100
                                    )
                                  )
                                : 0
                            }%`,
                            borderRadius: 999,
                            background:
                              (active.expenses || []).reduce(
                                (sum, item) => sum + Number(item.amount || 0),
                                0
                              ) <= Number(active.budget || 0)
                                ? `linear-gradient(90deg, ${ui.accent.tertiary} 0%, ${ui.accent.success} 100%)`
                                : `linear-gradient(90deg, ${ui.accent.primary} 0%, ${ui.accent.danger} 100%)`,
                            transition: "width 0.35s ease",
                          }}
                        />
                      </div>
                      {(active.expenses || []).reduce(
                        (sum, item) => sum + Number(item.amount || 0),
                        0
                      ) > Number(active.budget || 0) && (
                        <div
                          style={{
                            marginTop: 10,
                            color: ui.accent.danger,
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          ⚠️ חריגה מהתקציב
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div style={ui.statStyle}>
                <div style={{ color: ui.theme.muted, fontSize: 13 }}>
                  התקדמות כללית
                </div>
                <div style={{ marginTop: 6, fontWeight: "bold", fontSize: 28 }}>
                  {progressPct}%
                </div>
              </div>
            </div>
          </div>
          <div style={ui.card}>
            <div style={ui.sectionTitle}>🎯 אירועים אחרונים</div>
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {events.length === 0 ? (
                <div style={{ color: ui.theme.muted }}>עדיין אין אירועים</div>
              ) : (
                events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    style={{
                      ...ui.miniCard,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: 18 }}>
                        {event.title}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          color: ui.theme.muted,
                          fontSize: 14,
                        }}
                      >
                        {event.date || "ללא תאריך"}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveId(event.id);
                        setScreen("event");
                      }}
                      style={ui.secondaryButton}
                    >
                      פתחי
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {screen === "home" && (
        <>
          <div style={ui.card}>
            <div style={ui.sectionTitle}>✨ יצירת אירוע חדש</div>
            <div
              style={{ marginTop: 6, color: ui.theme.muted, lineHeight: 1.6 }}
            >
              יש כאן כבר ספקים, חנות, הזמנות, ניהול אירוע, והזמנה דיגיטלית
              מעוצבת
            </div>
            <input
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="שם האירוע"
              style={ui.input}
            />
            <button
              onClick={createEvent}
              style={{ ...ui.primaryButton, width: "100%", marginTop: 12 }}
            >
              צור אירוע
            </button>
          </div>
          <div style={ui.card}>
            <div style={ui.sectionTitle}>🎊 האירועים שלי</div>
            {loading ? (
              <div style={{ marginTop: 14, color: ui.theme.muted }}>
                טוען אירועים...
              </div>
            ) : events.length === 0 ? (
              <div style={{ marginTop: 14, color: ui.theme.muted }}>
                עדיין אין אירועים
              </div>
            ) : (
              <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
                {events.map((event) => {
                  const c =
                    event.conceptCategory && event.conceptId
                      ? (conceptsData[event.conceptCategory] || []).find(
                          (x) => x.id === event.conceptId
                        )
                      : null;
                  return (
                    <div
                      key={event.id}
                      onClick={() => {
                        setActiveId(event.id);
                        setScreen("event");
                      }}
                      style={{
                        ...ui.miniCard,
                        cursor: "pointer",
                        border: `1px solid ${
                          event.id === active?.id
                            ? ui.accent.secondary
                            : ui.theme.line
                        }`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "bold", fontSize: 20 }}>
                            {event.title}
                          </div>
                          <div
                            style={{
                              marginTop: 8,
                              color: ui.theme.muted,
                              fontSize: 14,
                            }}
                          >
                            תאריך: {event.date || "לא הוגדר"}
                          </div>
                          {c ? (
                            <div
                              style={{
                                marginTop: 8,
                                color: ui.accent.tertiary,
                                fontSize: 14,
                              }}
                            >
                              {c.emoji} {c.name}
                            </div>
                          ) : null}
                        </div>
                        <div
                          style={{
                            ...ui.miniCard,
                            padding: "8px 12px",
                            borderRadius: 999,
                          }}
                        >
                          נשמר בענן
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {screen === "timeline" && (
        <div style={ui.card}>
          {!active ? (
            <div style={{ color: ui.theme.muted }}>בחרי קודם אירוע</div>
          ) : (
            <>
              <div style={ui.sectionTitle}>🕒 ציר זמן לאירוע</div>

              <div
                style={{
                  marginTop: 8,
                  color: ui.theme.muted,
                  lineHeight: 1.7,
                }}
              >
                כל מה שכדאי לעשות לפי שלבי התכנון של האירוע
              </div>

              <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
                {timelineSections.map((section) => (
                  <div key={section.title} style={ui.miniCard}>
                    <div style={{ fontWeight: "bold", fontSize: 20 }}>
                      {section.emoji} {section.title}
                    </div>

                    <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                      {section.items.map((item) => (
                        <div
                          key={item}
                          onClick={() =>
                            toggleTimelineItem(section.title, item)
                          }
                          style={{
                            ...ui.miniCard,
                            padding: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            cursor: "pointer",
                            background: timelineState[
                              `${section.title}-${item}`
                            ]
                              ? "rgba(0,200,100,0.15)"
                              : undefined,
                          }}
                        >
                          <span>
                            {timelineState[`${section.title}-${item}`]
                              ? "✅"
                              : "⬜"}
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      {screen === "admin" && isAdmin && (
        <div style={ui.card}>
          <div style={ui.sectionTitle}>🔐 אזור אדמין</div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: "bold", marginBottom: 8 }}>
              ➕ הוספת ספק חדש
            </div>

            <input
              placeholder="שם הספק"
              value={adminSupplierName}
              onChange={(e) => setAdminSupplierName(e.target.value)}
              style={ui.input}
            />

            <input
              placeholder="קטגוריה"
              value={adminSupplierCategory}
              onChange={(e) => setAdminSupplierCategory(e.target.value)}
              style={ui.input}
            />

            <input
              placeholder="טלפון"
              value={adminSupplierPhone}
              onChange={(e) => setAdminSupplierPhone(e.target.value)}
              style={ui.input}
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={{ fontWeight: "bold", marginBottom: 8 }}>
              🛒 הוספת מוצר חדש
            </div>

            <input
              placeholder="שם המוצר"
              value={adminProductTitle}
              onChange={(e) => setAdminProductTitle(e.target.value)}
              style={ui.input}
            />

            <input
              placeholder="קטגוריה"
              value={adminProductCategory}
              onChange={(e) => setAdminProductCategory(e.target.value)}
              style={ui.input}
            />

            <input
              placeholder="מחיר"
              value={adminProductPrice}
              onChange={(e) => setAdminProductPrice(e.target.value)}
              style={ui.input}
            />

            <input
              placeholder="חנות (AliExpress / SHEIN / אחר)"
              value={adminProductStore}
              onChange={(e) => setAdminProductStore(e.target.value)}
              style={ui.input}
            />

            <input
              placeholder="קישור למוצר"
              value={adminProductLink}
              onChange={(e) => setAdminProductLink(e.target.value)}
              style={ui.input}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleAdminProductImageUpload(e.target.files?.[0])
              }
              style={{ ...ui.input, padding: 10 }}
            />
            {adminProductImage && (
              <div
                style={{
                  marginTop: 10,
                  width: 140,
                  height: 100,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: `1px solid ${ui.theme.line}`,
                }}
              >
                <img
                  src={adminProductImage}
                  alt="תצוגה מקדימה"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
            <input
              placeholder="קישור לתמונה"
              value={adminProductImage}
              onChange={(e) => setAdminProductImage(e.target.value)}
              style={ui.input}
            />

            <button
              onClick={addProductFromAdmin}
              style={{ ...ui.primaryButton, marginTop: 10 }}
            >
              הוסף מוצר
            </button>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                📦 מוצרים שהוספת
              </div>

              {adminProducts.length === 0 ? (
                <div style={{ color: ui.theme.muted }}>
                  עדיין לא הוספת מוצרים
                </div>
              ) : (
                adminProducts.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      ...ui.miniCard,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold" }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: ui.theme.muted }}>
                        {item.price} · {item.store}
                      </div>
                    </div>

                    <button
                      onClick={() => removeAdminProduct(item.id)}
                      style={ui.dangerButton}
                    >
                      מחק
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {screen === "manage" && (
        <div style={ui.card}>
          {!active ? (
            <div style={{ color: ui.theme.muted }}>בחרי קודם אירוע</div>
          ) : (
            <>
              <div style={ui.sectionTitle}>🧩 ניהול אירוע</div>

              <div style={{ ...ui.miniCard, marginTop: 14 }}>
                <div style={{ fontWeight: "bold", fontSize: 18 }}>
                  ✅ משימות
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <input
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="משימה חדשה"
                    style={{ ...ui.input, marginTop: 0 }}
                  />
                  <button onClick={addTask} style={ui.primaryButton}>
                    הוסף
                  </button>
                </div>
                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  {(active.tasks || []).length === 0 ? (
                    <div style={{ color: ui.theme.muted }}>
                      אין משימות עדיין
                    </div>
                  ) : (
                    (active.tasks || []).map((task) => (
                      <div
                        key={task.id}
                        style={{
                          ...ui.miniCard,
                          padding: 10,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: task.done
                            ? `${ui.accent.success}18`
                            : ui.miniCard.background,
                        }}
                      >
                        <div
                          style={{
                            textDecoration: task.done ? "line-through" : "none",
                          }}
                        >
                          {task.title}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => toggleTaskDone(task.id)}
                            style={ui.secondaryButton}
                          >
                            {task.done ? "בטל" : "בוצע"}
                          </button>
                          <button
                            onClick={() => removeTask(task.id)}
                            style={ui.dangerButton}
                          >
                            מחק
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div style={{ ...ui.miniCard, marginTop: 14 }}>
                <div style={{ fontWeight: "bold", fontSize: 18 }}>
                  👥 מוזמנים
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr auto",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  <input
                    value={guestInput}
                    onChange={(e) => setGuestInput(e.target.value)}
                    placeholder="שם מוזמן"
                    style={{ ...ui.input, marginTop: 0 }}
                  />
                  <input
                    value={guestPhoneInput}
                    onChange={(e) => setGuestPhoneInput(e.target.value)}
                    placeholder="טלפון"
                    style={{ ...ui.input, marginTop: 0 }}
                  />
                  <button onClick={addGuest} style={ui.primaryButton}>
                    הוסף
                    <button
                      onClick={exportGuestsToCSV}
                      style={{
                        ...ui.secondaryButton,
                        width: "100%",
                        marginTop: 8,
                      }}
                    >
                      ייצא מוזמנים ל־CSV
                    </button>
                  </button>
                </div>

                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  {(active.guests || []).length === 0 ? (
                    <div style={{ color: ui.theme.muted }}>
                      אין מוזמנים עדיין
                    </div>
                  ) : (
                    (active.guests || []).map((guest, idx) => (
                      <div
                        key={guest.id || idx}
                        style={{
                          ...ui.miniCard,
                          padding: 10,
                          display: "grid",
                          gap: 8,
                        }}
                      >
                        <div style={{ fontWeight: "bold" }}>
                          {typeof guest === "string" ? guest : guest.name}
                        </div>

                        {typeof guest !== "string" && guest.phone && (
                          <div style={{ color: ui.theme.muted }}>
                            {guest.phone}
                          </div>
                        )}

                        {typeof guest !== "string" && (
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              onClick={() =>
                                updateGuestStatus(guest.id, "אישר")
                              }
                              style={ui.primaryButton}
                            >
                              אישר
                            </button>

                            <button
                              onClick={() =>
                                updateGuestStatus(guest.id, "לא מגיע")
                              }
                              style={ui.secondaryButton}
                            >
                              לא מגיע
                            </button>

                            <button
                              onClick={() => sendGuestWhatsApp(guest)}
                              style={ui.secondaryButton}
                            >
                              תזכורת RSVP
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => removeGuest(idx)}
                          style={ui.dangerButton}
                        >
                          מחק
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div style={{ ...ui.miniCard, marginTop: 14 }}>
                <div style={{ fontWeight: "bold", fontSize: 18 }}>
                  💸 הוצאות
                </div>
                <input
                  value={active.budget || ""}
                  onChange={(e) =>
                    saveActiveFields({ budget: Number(e.target.value) || 0 })
                  }
                  placeholder="יעד תקציב"
                  type="number"
                  style={{ ...ui.input, marginTop: 10 }}
                />
                <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                  <input
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="שם הוצאה"
                    style={{ ...ui.input, marginTop: 0 }}
                  />
                  <input
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="סכום"
                    type="number"
                    style={{ ...ui.input, marginTop: 0 }}
                  />
                  <button onClick={addExpense} style={ui.primaryButton}>
                    הוסף הוצאה
                  </button>
                </div>
                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  {(active.expenses || []).length === 0 ? (
                    <div style={{ color: ui.theme.muted }}>
                      אין הוצאות עדיין
                    </div>
                  ) : (
                    (active.expenses || []).map((expense) => (
                      <div
                        key={expense.id}
                        style={{
                          ...ui.miniCard,
                          padding: 10,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "bold" }}>
                            {expense.title}
                          </div>
                          <div style={{ color: ui.theme.muted }}>
                            ₪{expense.amount}
                          </div>
                        </div>
                        <button
                          onClick={() => removeExpense(expense.id)}
                          style={ui.dangerButton}
                        >
                          מחק
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ marginTop: 12, fontWeight: "bold" }}>
                  סה״כ הוצאות: ₪
                  {(active.expenses || []).reduce(
                    (sum, item) => sum + Number(item.amount || 0),
                    0
                  )}
                </div>
                <div
                  style={{
                    ...ui.miniCard,
                    marginTop: 12,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                    textAlign: "center",
                  }}
                >
                  <div>
                    <div style={{ color: ui.theme.muted, fontSize: 13 }}>
                      תקציב
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: 20 }}>
                      ₪{Number(active.budget || 0)}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: ui.theme.muted, fontSize: 13 }}>
                      נשאר
                    </div>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: 20,
                        color:
                          Number(active.budget || 0) -
                            (active.expenses || []).reduce(
                              (sum, item) => sum + Number(item.amount || 0),
                              0
                            ) >=
                          0
                            ? ui.accent.success
                            : ui.accent.danger,
                      }}
                    >
                      ₪
                      {Number(active.budget || 0) -
                        (active.expenses || []).reduce(
                          (sum, item) => sum + Number(item.amount || 0),
                          0
                        )}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: ui.theme.muted, fontSize: 13 }}>
                      ניצול
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: 20 }}>
                      {Number(active.budget || 0) > 0
                        ? Math.min(
                            100,
                            Math.round(
                              ((active.expenses || []).reduce(
                                (sum, item) => sum + Number(item.amount || 0),
                                0
                              ) /
                                Number(active.budget || 0)) *
                                100
                            )
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {screen === "concepts" && (
        <div style={ui.card}>
          {!active ? (
            <div style={{ color: ui.theme.muted }}>בחרי קודם אירוע</div>
          ) : (
            <>
              <div style={ui.sectionTitle}>🎨 קונספטים</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginTop: 16,
                }}
              >
                <button
                  onClick={() => setConceptCategory("girls")}
                  style={ui.tabButton(
                    ui.accent.primary,
                    conceptCategory === "girls"
                  )}
                >
                  בנות
                </button>
                <button
                  onClick={() => setConceptCategory("boys")}
                  style={ui.tabButton(
                    ui.accent.tertiary,
                    conceptCategory === "boys"
                  )}
                >
                  בנים
                </button>
                <button
                  onClick={() => setConceptCategory("bachelorette")}
                  style={ui.tabButton(
                    ui.accent.gold,
                    conceptCategory === "bachelorette"
                  )}
                >
                  רווקות
                </button>
                <button
                  onClick={() => setConceptCategory("bachelor")}
                  style={ui.tabButton(
                    ui.accent.secondary,
                    conceptCategory === "bachelor"
                  )}
                >
                  רווקים
                </button>
                <button
                  onClick={() => setConceptCategory("goldenAge")}
                  style={{
                    ...ui.tabButton(
                      ui.accent.gold,
                      conceptCategory === "goldenAge"
                    ),
                    gridColumn: "1 / -1",
                  }}
                >
                  גיל הזהב
                </button>
              </div>
              <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
                {(conceptsData[conceptCategory] || []).map((concept) => (
                  <div
                    key={concept.id}
                    onClick={() => setSelectedConceptId(concept.id)}
                    style={{
                      ...ui.miniCard,
                      cursor: "pointer",
                      border: `1px solid ${
                        selectedConceptId === concept.id
                          ? ui.accent.tertiary
                          : ui.theme.line
                      }`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: 20 }}>
                          {concept.emoji} {concept.name}
                        </div>
                        <div style={{ marginTop: 6, color: ui.theme.muted }}>
                          {concept.colors.join(" · ")}
                        </div>
                      </div>
                      <div
                        style={{
                          color:
                            selectedConceptId === concept.id
                              ? ui.accent.tertiary
                              : ui.theme.muted,
                          fontWeight: "bold",
                        }}
                      >
                        {selectedConceptId === concept.id ? "נבחר" : "בחרי"}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        color: ui.theme.muted,
                        lineHeight: 1.6,
                      }}
                    >
                      {concept.tableIdea}
                    </div>
                  </div>
                ))}
              </div>
              {selectedConcept && (
                <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                  <button
                    onClick={applyConcept}
                    style={{ ...ui.primaryButton, width: "100%" }}
                  >
                    החל על האירוע שלי
                  </button>
                  <button
                    onClick={generateTasks}
                    style={{ ...ui.secondaryButton, width: "100%" }}
                  >
                    צור צ'קליסט אוטומטי
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {screen === "suppliers" && (
        <>
          <div style={ui.card}>
            {!active ? (
              <div style={{ color: ui.theme.muted }}>בחרי קודם אירוע</div>
            ) : (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ ...ui.sectionTitle, fontSize: 26 }}>
                      ספקים מומלצים
                    </div>
                    <div style={{ color: ui.theme.muted, marginTop: 6 }}>
                      מצאי ספקים לפי אזור, קטגוריה וסגנון האירוע שלך
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setSupplierView("grid")}
                      style={ui.tabButton(
                        ui.accent.primary,
                        supplierView === "grid"
                      )}
                    >
                      גריד
                    </button>
                    <button
                      onClick={() => setSupplierView("compact")}
                      style={ui.tabButton(
                        ui.accent.secondary,
                        supplierView === "compact"
                      )}
                    >
                      קומפקטי
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: settings.mobileMode
                      ? "1fr"
                      : "repeat(3, 1fr)",
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  <select
                    value={supplierRegion}
                    onChange={(e) => setSupplierRegion(e.target.value)}
                    style={{
                      ...ui.input,
                      color: "#111",
                      background: "rgba(255,255,255,0.92)",
                      border: `1px solid ${ui.theme.line}`,
                    }}
                  >
                    {supplierRegions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>

                  <select
                    value={supplierCategory}
                    onChange={(e) => setSupplierCategory(e.target.value)}
                    style={{
                      ...ui.input,
                      color: "#000",
                      background: "#fff",
                    }}
                  >
                    >
                    {supplierCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <div
                    style={{
                      marginTop: 10,
                      color: ui.theme.muted,
                      fontSize: 14,
                    }}
                  >
                    הערה שתצורף אוטומטית להודעה לספק:
                  </div>
                  <input
                    value={supplierWhatsappNote}
                    onChange={(e) => setSupplierWhatsappNote(e.target.value)}
                    placeholder="הערה שתצורף להודעת הוואטסאפ לספק"
                    style={ui.input}
                  />
                </div>

                <div style={{ marginTop: 18, color: ui.theme.muted }}>
                  נמצאו {filteredSuppliers.length} ספקים
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      supplierView === "compact"
                        ? "1fr"
                        : settings.mobileMode
                        ? "1fr"
                        : "repeat(2, 1fr)",
                    gap: 16,
                    marginTop: 18,
                  }}
                >
                  {filteredSuppliers.map((supplier) => {
                    const isSaved = (active?.savedSuppliers || []).some(
                      (s) => s.id === supplier.id
                    );
                    const isFavorite = (active?.favoriteSuppliers || []).some(
                      (s) => s.id === supplier.id
                    );

                    return (
                      <SupplierCard
                        key={supplier.id}
                        supplier={supplier}
                        ui={ui}
                        isSaved={isSaved}
                        isFavorite={isFavorite}
                        onSave={() => toggleSaveSupplier(supplier)}
                        onFavorite={() => toggleFavoriteSupplier(supplier)}
                        onOpen={() => setSelectedSupplier(supplier)}
                        onWhatsApp={() => openSupplierWhatsApp(supplier)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {active && (
            <div style={ui.card}>
              <div style={ui.sectionTitle}>כרטיסי ספקים</div>
              <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
                {filteredSuppliers.length === 0 ? (
                  <div style={{ color: ui.theme.muted }}>
                    לא נמצאו ספקים תואמים
                  </div>
                ) : (
                  filteredSuppliers.map((supplier) => {
                    const isFavorite = (active.favoriteSuppliers || []).some(
                      (s) => s.id === supplier.id
                    );
                    const isSaved = (active.savedSuppliers || []).some(
                      (s) => s.id === supplier.id
                    );

                    return (
                      <div
                        key={supplier.id}
                        style={{
                          ...ui.miniCard,
                          display: "flex",
                          gap: 12,
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            width: 86,
                            height: 86,
                            borderRadius: 16,
                            overflow: "hidden",
                            border: `1px solid ${ui.theme.line}`,
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={supplier.image}
                            alt={supplier.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: "bold", fontSize: 18 }}>
                                {supplier.name}
                              </div>

                              <div
                                style={{ marginTop: 4, color: ui.theme.muted }}
                              >
                                {supplier.category} · {supplier.city}
                              </div>

                              <div
                                style={{ marginTop: 6, color: ui.theme.muted }}
                              >
                                {supplier.description}
                              </div>

                              <div
                                style={{ marginTop: 8, color: ui.theme.muted }}
                              >
                                💰 {supplier.price || "מחיר לא צוין"}
                              </div>

                              {supplier.notes ? (
                                <div
                                  style={{
                                    marginTop: 6,
                                    color: ui.theme.muted,
                                  }}
                                >
                                  📝 {supplier.notes}
                                </div>
                              ) : null}

                              {supplier.link ? (
                                <a
                                  href={supplier.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "inline-block",
                                    marginTop: 8,
                                    color: ui.accent.tertiary,
                                    textDecoration: "none",
                                    fontWeight: "bold",
                                  }}
                                >
                                  🔗 מעבר לקישור
                                </a>
                              ) : null}
                            </div>

                            <div style={{ fontWeight: "bold" }}>
                              <div style={{ fontSize: 14 }}>
                                {"⭐".repeat(Math.round(supplier.rating))}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                              marginTop: 8,
                            }}
                          >
                            {supplier.tags.map((tag) => (
                              <div
                                key={tag}
                                style={{
                                  ...ui.miniCard,
                                  padding: "6px 10px",
                                  borderRadius: 999,
                                }}
                              >
                                {tag}
                              </div>
                            ))}
                          </div>

                          <div
                            style={{ display: "grid", gap: 8, marginTop: 12 }}
                          >
                            <button
                              onClick={() => setSelectedSupplier(supplier)}
                              style={ui.secondaryButton}
                            >
                              דף ספק
                            </button>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 8,
                              }}
                            >
                              <button
                                onClick={() => toggleFavoriteSupplier(supplier)}
                                style={ui.secondaryButton}
                              >
                                {isFavorite ? "הסר ממועדפים" : "מועדף"}
                              </button>

                              <button
                                onClick={() => toggleSaveSupplier(supplier)}
                                style={ui.primaryButton}
                              >
                                {isSaved ? "הסר מהאירוע" : "שמור לאירוע"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {selectedSupplier && (
            <SupplierDetailsModal
              supplier={selectedSupplier}
              ui={ui}
              onClose={() => setSelectedSupplier(null)}
              onWhatsApp={() => openSupplierWhatsApp(selectedSupplier)}
              onSave={() => toggleSaveSupplier(selectedSupplier)}
              onFavorite={() => toggleFavoriteSupplier(selectedSupplier)}
              isSaved={(active?.savedSuppliers || []).some(
                (s) => s.id === selectedSupplier.id
              )}
              isFavorite={(active?.favoriteSuppliers || []).some(
                (s) => s.id === selectedSupplier.id
              )}
            />
          )}
          {screen === "favorites" && (
            <div style={ui.card}>
              {!active ? (
                <div style={{ color: ui.theme.muted }}>בחרי קודם אירוע</div>
              ) : (
                <div>
                  <div style={ui.sectionTitle}>❤️ המועדפים שלי</div>

                  <div
                    style={{
                      marginTop: 14,
                      color: ui.theme.muted,
                      fontWeight: "bold",
                    }}
                  >
                    ספקים
                  </div>
                  <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
                    {(active.favoriteSuppliers || []).length === 0 ? (
                      <div style={{ color: ui.theme.muted }}>
                        עדיין לא שמרת ספקים למועדפים
                      </div>
                    ) : (
                      (active.favoriteSuppliers || []).map((supplier) => (
                        <div
                          key={supplier.id}
                          style={{
                            ...ui.miniCard,
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{ fontWeight: "bold", fontSize: 18 }}
                              >
                                {supplier.name}
                              </span>

                              {supplier.rating >= 4.8 && (
                                <span
                                  style={{
                                    background: "rgba(255,215,0,0.2)",
                                    color: "#FFD700",
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                    fontSize: 12,
                                    fontWeight: "bold",
                                  }}
                                >
                                  מומלץ
                                </span>
                              )}
                            </div>
                            <div
                              style={{ marginTop: 4, color: ui.theme.muted }}
                            >
                              {supplier.category} · {supplier.city}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => setSelectedSupplier(supplier)}
                              style={ui.secondaryButton}
                            >
                              פתחי
                            </button>
                            <button
                              onClick={() => toggleSaveSupplier(supplier)}
                              style={ui.primaryButton}
                            >
                              {(active.savedSuppliers || []).some(
                                (s) => s.id === supplier.id
                              )
                                ? "שמור ✓"
                                : "שמור לאירוע"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}

                    <div
                      style={{
                        marginTop: 18,
                        color: ui.theme.muted,
                        fontWeight: "bold",
                      }}
                    >
                      ספקים שנשמרו לאירוע
                    </div>

                    <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
                      {(active.savedSuppliers || []).length === 0 ? (
                        <div style={{ color: ui.theme.muted }}>
                          עדיין לא שמרת ספקים לאירוע
                        </div>
                      ) : (
                        (active.savedSuppliers || []).map((supplier) => (
                          <div
                            key={supplier.id}
                            style={{
                              ...ui.miniCard,
                              display: "grid",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 10,
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <div
                                  style={{ fontWeight: "bold", fontSize: 18 }}
                                >
                                  {supplier.name}
                                </div>
                                <div
                                  style={{
                                    marginTop: 4,
                                    color: ui.theme.muted,
                                  }}
                                >
                                  {supplier.category} · {supplier.city}
                                </div>
                              </div>

                              <button
                                onClick={() => removeSavedSupplier(supplier.id)}
                                style={ui.dangerButton}
                              >
                                הסר
                              </button>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                onClick={() =>
                                  updateSavedSupplierField(
                                    supplier.id,
                                    "dealStatus",
                                    "בבדיקה"
                                  )
                                }
                                style={ui.tabButton(
                                  ui.accent.gold,
                                  supplier.dealStatus === "בבדיקה"
                                )}
                              >
                                בבדיקה
                              </button>

                              <button
                                onClick={() =>
                                  updateSavedSupplierField(
                                    supplier.id,
                                    "dealStatus",
                                    "סגור"
                                  )
                                }
                                style={ui.tabButton(
                                  ui.accent.tertiary,
                                  supplier.dealStatus === "סגור"
                                )}
                              >
                                סגור
                              </button>

                              <button
                                onClick={() =>
                                  updateSavedSupplierField(
                                    supplier.id,
                                    "dealStatus",
                                    "לא רלוונטי"
                                  )
                                }
                                style={ui.tabButton(
                                  ui.accent.primary,
                                  supplier.dealStatus === "לא רלוונטי"
                                )}
                              >
                                לא רלוונטי
                              </button>
                            </div>

                            <input
                              value={supplier.dealPrice || ""}
                              onChange={(e) =>
                                updateSavedSupplierField(
                                  supplier.id,
                                  "dealPrice",
                                  e.target.value
                                )
                              }
                              placeholder="מחיר שסגרתי"
                              type="number"
                              style={{ ...ui.input, marginTop: 0 }}
                            />

                            <textarea
                              value={supplier.dealNotes || ""}
                              onChange={(e) =>
                                updateSavedSupplierField(
                                  supplier.id,
                                  "dealNotes",
                                  e.target.value
                                )
                              }
                              placeholder="הערות על הספק"
                              style={{
                                ...ui.input,
                                minHeight: 80,
                                resize: "vertical",
                                marginTop: 0,
                              }}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 18,
                      color: ui.theme.muted,
                      fontWeight: "bold",
                    }}
                  >
                    מוצרים והזמנות
                  </div>
                  <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
                    {(active.favoriteProducts || []).length === 0 ? (
                      <div style={{ color: ui.theme.muted }}>
                        עדיין לא שמרת מוצרים למועדפים
                      </div>
                    ) : (
                      (active.favoriteProducts || []).map((item) => (
                        <div
                          key={item.id}
                          style={{
                            ...ui.miniCard,
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 10,
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: "bold", fontSize: 18 }}>
                              {item.title}
                            </div>
                            <div
                              style={{ marginTop: 4, color: ui.theme.muted }}
                            >
                              {item.category} · {item.price}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => setSelectedProduct(item)}
                              style={ui.secondaryButton}
                            >
                              דף מוצר
                            </button>
                            <button
                              onClick={() => toggleSaveProduct(item)}
                              style={ui.primaryButton}
                            >
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    ...ui.secondaryButton,
                                    textDecoration: "none",
                                    display: "block",
                                    textAlign: "center",
                                    marginTop: 8,
                                  }}
                                >
                                  🛒 מעבר לרכישה
                                </a>
                              )}
                              {(active.savedProducts || []).some(
                                (p) => p.id === item.id
                              )
                                ? "שמור ✓"
                                : "שמור לאירוע"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {screen === "shop" && (
            <div>
              <div style={ui.card}>
                {!active ? (
                  <div style={{ color: ui.theme.muted }}>בחרי קודם אירוע</div>
                ) : (
                  <div>
                    <div style={ui.sectionTitle}>🛍️ חנות והזמנות</div>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 16,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => setShopTab("products")}
                        style={ui.tabButton(
                          ui.accent.primary,
                          shopTab === "products"
                        )}
                      >
                        מוצרים
                      </button>

                      <button
                        onClick={() => setShopTab("invitations")}
                        style={ui.tabButton(
                          ui.accent.gold,
                          shopTab === "invitations"
                        )}
                      >
                        הזמנות
                      </button>
                    </div>

                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder={
                        shopTab === "products"
                          ? "חיפוש מוצרים..."
                          : "חיפוש הזמנות..."
                      }
                      style={ui.input}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {active && (
            <div style={ui.card}>
              <div style={ui.sectionTitle}>
                {shopTab === "products" ? "מוצרים" : "הזמנות"}
              </div>
              <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
                {currentShopItems.length === 0 ? (
                  <div style={{ color: ui.theme.muted }}>לא נמצאו פריטים</div>
                ) : (
                  currentShopItems.map((item) => {
                    const isSaved = (active.savedProducts || []).some(
                      (p) => p.id === item.id
                    );
                    const isFavorite = (active.favoriteProducts || []).some(
                      (p) => p.id === item.id
                    );
                    return (
                      <div
                        key={item.id}
                        style={{
                          ...ui.miniCard,
                          display: "flex",
                          gap: 12,
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            width: 84,
                            height: 84,
                            borderRadius: 16,
                            overflow: "hidden",
                            border: `1px solid ${ui.theme.line}`,
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 8,
                            }}
                          >
                            <div style={{ fontWeight: "bold", fontSize: 18 }}>
                              {item.title}
                            </div>
                            <button
                              onClick={() => toggleFavoriteProduct(item)}
                              style={ui.secondaryButton}
                            >
                              {isFavorite ? "♥" : "♡"}
                            </button>
                          </div>
                          <div style={{ marginTop: 4, color: ui.theme.muted }}>
                            {item.store || "קטלוג"} · {item.price}
                          </div>
                          <div
                            style={{
                              marginTop: 8,
                              color: ui.theme.muted,
                              lineHeight: 1.6,
                            }}
                          >
                            {item.description}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                              marginTop: 8,
                            }}
                          >
                            {(item.tags || []).map((tag) => (
                              <div
                                key={tag}
                                style={{
                                  ...ui.miniCard,
                                  padding: "6px 10px",
                                  borderRadius: 999,
                                }}
                              >
                                {tag}
                              </div>
                            ))}
                          </div>
                          <div
                            style={{ display: "grid", gap: 8, marginTop: 12 }}
                          >
                            <button
                              onClick={() => setSelectedProduct(item)}
                              style={ui.secondaryButton}
                            >
                              דף מוצר
                            </button>

                            <button
                              onClick={() => toggleSaveProduct(item)}
                              style={ui.primaryButton}
                            >
                              {isSaved ? "הסר מהאירוע" : "שמור לאירוע"}
                            </button>

                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  ...ui.secondaryButton,
                                  textDecoration: "none",
                                  display: "block",
                                  textAlign: "center",
                                }}
                              >
                                🛒 מעבר לרכישה
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {selectedProduct && active && (
            <div style={ui.card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div style={ui.sectionTitle}>דף מוצר</div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  style={ui.secondaryButton}
                >
                  סגור
                </button>
              </div>
              <div
                style={{
                  marginTop: 14,
                  width: "100%",
                  height: 220,
                  borderRadius: 20,
                  overflow: "hidden",
                  border: `1px solid ${ui.theme.line}`,
                }}
              >
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ ...ui.miniCard, marginTop: 14 }}>
                <div style={{ fontWeight: "bold", fontSize: 24 }}>
                  {selectedProduct.title}
                </div>
                <div style={{ marginTop: 8, color: ui.theme.muted }}>
                  {selectedProduct.category} · {selectedProduct.price}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    color: ui.theme.muted,
                    lineHeight: 1.7,
                  }}
                >
                  {selectedProduct.description}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  {(selectedProduct.tags || []).map((tag) => (
                    <div
                      key={tag}
                      style={{
                        ...ui.miniCard,
                        padding: "6px 10px",
                        borderRadius: 999,
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
                  <button
                    onClick={() => toggleFavoriteProduct(selectedProduct)}
                    style={ui.secondaryButton}
                  >
                    {(active.favoriteProducts || []).some(
                      (p) => p.id === selectedProduct.id
                    )
                      ? "הסר ממועדפים"
                      : "הוסף למועדפים"}
                  </button>
                  <button
                    onClick={() => toggleSaveProduct(selectedProduct)}
                    style={ui.primaryButton}
                  >
                    {(active.savedProducts || []).some(
                      (p) => p.id === selectedProduct.id
                    )
                      ? "הסר מהאירוע"
                      : "שמור לאירוע"}
                  </button>
                  {selectedProduct.link && (
                    <a
                      href={selectedProduct.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...ui.primaryButton,
                        textDecoration: "none",
                        display: "block",
                        textAlign: "center",
                        marginTop: 8,
                      }}
                    >
                      🛒 מעבר לרכישה
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {screen === "invitationBuilder" && (
        <div style={ui.card}>
          {!active ? (
            <div style={{ color: ui.theme.muted }}>בחרי קודם אירוע</div>
          ) : (
            <>
              <div style={ui.sectionTitle}>💌 הזמנה דיגיטלית מעוצבת</div>
              <div
                style={{ marginTop: 8, color: ui.theme.muted, lineHeight: 1.7 }}
              >
                צבע הטקסט מותאם אוטומטית לכל תבנית, וב־V10.3 אפשר גם לשתף
                בוואטסאפ ולהוריד כתמונה.
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 14,
                }}
              >
                {invitationTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedInviteTemplate(template.id)}
                    style={ui.tabButton(
                      ui.accent.secondary,
                      selectedInviteTemplate === template.id
                    )}
                  >
                    {template.title}
                  </button>
                ))}
              </div>

              <input
                value={inviteTitle}
                onChange={(e) => setInviteTitle(e.target.value)}
                placeholder="כותרת ההזמנה"
                style={ui.input}
              />
              <input
                value={inviteDate}
                onChange={(e) => setInviteDate(e.target.value)}
                type="date"
                style={ui.input}
              />
              <input
                value={inviteTime}
                onChange={(e) => setInviteTime(e.target.value)}
                type="time"
                style={ui.input}
              />
              <input
                value={inviteLocation}
                onChange={(e) => setInviteLocation(e.target.value)}
                placeholder="מיקום"
                style={ui.input}
              />
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="טקסט חופשי"
                style={{ ...ui.input, minHeight: 90, resize: "vertical" }}
              />

              <div
                style={{
                  ...ui.miniCard,
                  marginTop: 16,
                  padding: 0,
                  overflow: "hidden",
                }}
              >
                <div
                  ref={invitationCardRef}
                  style={{
                    position: "relative",
                    minHeight: 520,
                    backgroundImage: selectedInviteTheme.image
                      ? `${selectedInviteTheme.overlay}, url(${selectedInviteTheme.image})`
                      : selectedInviteTheme.overlay,
                    backgroundSize: "contain",
                    backgroundPosition: "center top",
                    backgroundRepeat: "no-repeat",
                    backgroundColor: "#0f1335",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: 18,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      maxWidth: 380,
                      margin: "0 auto",
                      color: selectedInviteTheme.textColor || "#ffffff",
                      textAlign: "center",
                      textShadow:
                        (selectedInviteTheme.textColor || "#ffffff") ===
                        "#000000"
                          ? "0 1px 6px rgba(255,255,255,0.65)"
                          : "0 2px 12px rgba(0,0,0,0.55)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        letterSpacing: 2,
                        color: selectedInviteTheme.textColor || "#ffffff",
                        opacity: 0.95,
                      }}
                    >
                      You're Invited
                    </div>

                    <div
                      style={{
                        fontSize: 38,
                        fontWeight: "900",
                        marginTop: 10,
                        color: selectedInviteTheme.textColor || "#ffffff",
                      }}
                    >
                      {inviteTitle || active?.title || "האירוע שלנו"}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 19,
                        color: selectedInviteTheme.textColor || "#ffffff",
                        fontWeight: 600,
                      }}
                    >
                      {inviteDate || "בחרי תאריך"}{" "}
                      {inviteTime ? `· ${inviteTime}` : ""}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 19,
                        color: selectedInviteTheme.textColor || "#ffffff",
                        fontWeight: 600,
                      }}
                    >
                      {inviteLocation || "הוסיפי מיקום"}
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        fontSize: 20,
                        fontWeight: "bold",
                        color: selectedInviteTheme.textColor || "#ffffff",
                      }}
                    >
                      {inviteMessage || "מחכים לכם לחגוג איתנו!"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 10,
                    marginTop: 16,
                    padding: 16,
                  }}
                >
                  <button
                    onClick={saveInvitation}
                    style={{ ...ui.primaryButton, width: "100%" }}
                  >
                    שמור הזמנה
                  </button>
                  <button
                    onClick={copyInvitationText}
                    style={{ ...ui.secondaryButton, width: "100%" }}
                  >
                    העתק טקסט להזמנה
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `${inviteTitle || active?.title || "האירוע שלנו"}
תאריך: ${inviteDate || "לבחירה"}
${inviteTime ? `שעה: ${inviteTime}` : ""}
מיקום: ${inviteLocation || "יעודכן"}
${inviteMessage || "מחכים לכם לחגוג איתנו!"}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...ui.secondaryButton,
                      width: "100%",
                      display: "block",
                      textAlign: "center",
                      textDecoration: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    שיתוף בוואטסאפ
                  </a>
                  <button
                    onClick={downloadInvitationImage}
                    style={{ ...ui.primaryButton, width: "100%" }}
                  >
                    הורד הזמנה כתמונה
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {settings.mobileMode && (
        <div
          style={{
            position: "sticky",
            bottom: 10,
            marginTop: 16,
            background: ui.theme.card,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: `1px solid ${ui.theme.line}`,
            borderRadius: 22,
            padding: 8,
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 8,
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
          }}
        >
          <button
            onClick={() => setScreen("dashboard")}
            style={ui.tabButton(ui.accent.primary, screen === "dashboard")}
          >
            דשבורד
          </button>
          <button
            onClick={() => setScreen("manage")}
            style={ui.tabButton(ui.accent.gold, screen === "manage")}
          >
            ניהול
          </button>
          <button
            onClick={() => setScreen("timeline")}
            style={ui.tabButton(ui.accent.tertiary, screen === "timeline")}
          >
            ציר זמן
          </button>

          <button
            onClick={() => setScreen("shop")}
            style={ui.tabButton(ui.accent.secondary, screen === "shop")}
          >
            חנות
          </button>
          <button
            onClick={() => setScreen("invitationBuilder")}
            style={ui.tabButton(ui.accent.gold, screen === "invitationBuilder")}
          >
            הזמנה
          </button>
          {isAdmin && (
            <button
              onClick={() => setScreen("admin")}
              style={ui.tabButton(ui.accent.primary, screen === "admin")}
            >
              אדמין
            </button>
          )}
          <button
            onClick={() => setProfileOpen(true)}
            style={ui.tabButton(ui.accent.primary, false)}
          >
            פרופיל
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================
   APP ROOT
========================= */
export default function App() {
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: "מעייני",
    role: "מנהלת EVENTLY",
    phone: "",
  });
  const [settings, setSettings] = useState({
    appearance: "dark",
    accent: "pink",
    density: "comfortable",
    mobileMode: true,
  });
  const ui = useUi(settings);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) =>
      setUser(currentUser)
    );
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (!user) return <LoginScreen onLogin={setUser} ui={ui} />;

  return (
    <div style={ui.shell}>
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
        }}
      >
        <button onClick={() => setProfileOpen(true)} style={ui.secondaryButton}>
          פרופיל
        </button>
        <button onClick={handleLogout} style={ui.secondaryButton}>
          התנתק
        </button>
      </div>

      {profileOpen && (
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <ProfileSheet
            user={user}
            profile={profile}
            setProfile={setProfile}
            settings={settings}
            setSettings={setSettings}
            ui={ui}
            onClose={() => setProfileOpen(false)}
          />
        </div>
      )}

      <EventsScreen
        user={user}
        profile={profile}
        settings={settings}
        setProfileOpen={setProfileOpen}
        ui={ui}
      />
    </div>
  );
}

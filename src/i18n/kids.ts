import type { Locale } from "./config";
import type { AgeGroup, Gender } from "@/lib/kids";

// Kids-specific storefront + admin texts (filters, size guide, gender).
export type KidsText = {
  filters: string;
  showResults: string;
  reset: string;
  gender: string;
  genders: Record<Gender | "all", string>;
  age: string;
  ageGroups: Record<AgeGroup | "all", string>;
  ageHints: Record<AgeGroup, string>;
  size: string;
  color: string;
  price: string;
  min: string;
  max: string;
  inStock: string;
  noResults: string;
  newBadge: string;
  sizeGuideTitle: string;
  sizeGuideIntro: string;
  sizeGuideSize: string;
  sizeGuideAge: string;
  sizeGuideHeight: string;
  sizeGuideNote: string;
  shopByAge: string;
  admin: { gender: string; genderNone: string; sizesHint: string };
};

export const kidsText: Record<Locale, KidsText> = {
  ar: {
    filters: "تصفية",
    showResults: "عرض النتائج",
    reset: "إعادة الضبط",
    gender: "لمن؟",
    genders: { all: "الكل", girls: "بنات", boys: "أولاد", unisex: "للجنسين" },
    age: "العمر",
    ageGroups: { all: "كل الأعمار", baby: "رضّع", toddler: "صغار", kids: "أطفال", juniors: "كبار" },
    ageHints: { baby: "0–2 سنة", toddler: "2–4 سنوات", kids: "5–8 سنوات", juniors: "9–14 سنة" },
    size: "المقاس",
    color: "اللون",
    price: "السعر (دج)",
    min: "من",
    max: "إلى",
    inStock: "المتوفر فقط",
    noResults: "لا توجد منتجات تطابق اختيارك. جرّب تصفية أخرى.",
    newBadge: "جديد",
    sizeGuideTitle: "دليل المقاسات حسب العمر",
    sizeGuideIntro: "اختر المقاس حسب طول الطفل أكثر من عمره للحصول على أفضل مقاس.",
    sizeGuideSize: "المقاس",
    sizeGuideAge: "العمر",
    sizeGuideHeight: "الطول (سم)",
    sizeGuideNote: "قيم تقريبية؛ إذا كان الطفل بين مقاسين فاختر الأكبر.",
    shopByAge: "تسوّق حسب العمر",
    admin: { gender: "لمن؟ (بنات / أولاد)", genderNone: "غير محدد", sizesHint: "المقاسات المعتادة: 0-3M … 18-24M ثم 2Y … 14Y، والأحذية 16 … 38. تُرتّب تلقائيًا حسب العمر." },
  },
  fr: {
    filters: "Filtres",
    showResults: "Voir les résultats",
    reset: "Réinitialiser",
    gender: "Pour qui ?",
    genders: { all: "Tous", girls: "Filles", boys: "Garçons", unisex: "Mixte" },
    age: "Âge",
    ageGroups: { all: "Tous les âges", baby: "Bébé", toddler: "Petits", kids: "Enfants", juniors: "Juniors" },
    ageHints: { baby: "0–2 ans", toddler: "2–4 ans", kids: "5–8 ans", juniors: "9–14 ans" },
    size: "Taille",
    color: "Couleur",
    price: "Prix (DA)",
    min: "Min",
    max: "Max",
    inStock: "En stock uniquement",
    noResults: "Aucun produit ne correspond à vos filtres. Essayez d'autres choix.",
    newBadge: "Nouveau",
    sizeGuideTitle: "Guide des tailles par âge",
    sizeGuideIntro: "Choisissez selon la taille de l'enfant plutôt que son âge pour un meilleur ajustement.",
    sizeGuideSize: "Taille",
    sizeGuideAge: "Âge",
    sizeGuideHeight: "Stature (cm)",
    sizeGuideNote: "Valeurs indicatives ; entre deux tailles, prenez la plus grande.",
    shopByAge: "Acheter par âge",
    admin: { gender: "Pour qui ? (filles / garçons)", genderNone: "Non précisé", sizesHint: "Tailles usuelles : 0-3M … 18-24M puis 2Y … 14Y, chaussures 16 … 38. Triées automatiquement par âge." },
  },
  en: {
    filters: "Filters",
    showResults: "Show results",
    reset: "Reset",
    gender: "For",
    genders: { all: "All", girls: "Girls", boys: "Boys", unisex: "Unisex" },
    age: "Age",
    ageGroups: { all: "All ages", baby: "Baby", toddler: "Toddler", kids: "Kids", juniors: "Juniors" },
    ageHints: { baby: "0–2 yrs", toddler: "2–4 yrs", kids: "5–8 yrs", juniors: "9–14 yrs" },
    size: "Size",
    color: "Colour",
    price: "Price (DA)",
    min: "Min",
    max: "Max",
    inStock: "In stock only",
    noResults: "No products match your filters. Try different choices.",
    newBadge: "New",
    sizeGuideTitle: "Size guide by age",
    sizeGuideIntro: "Choose by your child's height rather than age for the best fit.",
    sizeGuideSize: "Size",
    sizeGuideAge: "Age",
    sizeGuideHeight: "Height (cm)",
    sizeGuideNote: "Approximate values; between two sizes, pick the larger one.",
    shopByAge: "Shop by age",
    admin: { gender: "For (girls / boys)", genderNone: "Not set", sizesHint: "Usual sizes: 0-3M … 18-24M then 2Y … 14Y, shoes 16 … 38. Sorted by age automatically." },
  },
};

export type PlaceKind = "church" | "monastery" | "landmark";

export type ChurchPlace = {
  id: string;
  name: string;
  city: string;
  kind: PlaceKind;
  distanceKm: number;
  image: string;
  coords: { lat: number; lng: number };
};

import imgChurch from "@/assets/home/card-church.jpg";
import imgMass from "@/assets/home/news-mass.jpg";
import imgCandle from "@/assets/home/news-candle.jpg";
import imgYouth from "@/assets/home/news-youth.jpg";
import imgHeavenly from "@/assets/home/heavenly-church.png";
import imgAgpeya from "@/assets/home/card-agpeya.jpg";
import imgKatameros from "@/assets/home/card-katameros.jpg";
import imgChildren from "@/assets/home/card-children.jpg";

export const CHURCH_PLACES: ChurchPlace[] = [
  {
    id: "mar-girgis-nasr",
    name: "كنيسة الشهيد مار جرجس",
    city: "مدينة نصر، القاهرة",
    kind: "church",
    distanceKm: 0.4,
    image: imgChurch,
    coords: { lat: 30.0626, lng: 31.347 },
  },
  {
    id: "anba-rweis",
    name: "الكاتدرائية المرقسية — الأنبا رويس",
    city: "العباسية، القاهرة",
    kind: "church",
    distanceKm: 3.2,
    image: imgMass,
    coords: { lat: 30.0723, lng: 31.2773 },
  },
  {
    id: "muallaqa",
    name: "الكنيسة المعلقة",
    city: "مصر القديمة، القاهرة",
    kind: "landmark",
    distanceKm: 9.1,
    image: imgHeavenly,
    coords: { lat: 30.005, lng: 31.2299 },
  },
  {
    id: "abu-serga",
    name: "كنيسة أبو سرجة",
    city: "مصر القديمة، القاهرة",
    kind: "landmark",
    distanceKm: 9.4,
    image: imgCandle,
    coords: { lat: 30.0055, lng: 31.2316 },
  },
  {
    id: "deir-makar",
    name: "دير القديس أنبا مقار",
    city: "وادي النطرون",
    kind: "monastery",
    distanceKm: 92,
    image: imgKatameros,
    coords: { lat: 30.3527, lng: 30.3463 },
  },
  {
    id: "deir-baramous",
    name: "دير البراموس",
    city: "وادي النطرون",
    kind: "monastery",
    distanceKm: 96,
    image: imgAgpeya,
    coords: { lat: 30.4044, lng: 30.3211 },
  },
  {
    id: "deir-suryan",
    name: "دير السريان",
    city: "وادي النطرون",
    kind: "monastery",
    distanceKm: 95,
    image: imgChildren,
    coords: { lat: 30.3556, lng: 30.3553 },
  },
  {
    id: "deir-anba-bishoy",
    name: "دير الأنبا بيشوي",
    city: "وادي النطرون",
    kind: "monastery",
    distanceKm: 94,
    image: imgYouth,
    coords: { lat: 30.348, lng: 30.358 },
  },
  {
    id: "st-mary-zeitoun",
    name: "كنيسة العذراء بالزيتون",
    city: "الزيتون، القاهرة",
    kind: "church",
    distanceKm: 5.6,
    image: imgChurch,
    coords: { lat: 30.1264, lng: 31.3127 },
  },
  {
    id: "monastery-st-anthony",
    name: "دير القديس أنطونيوس",
    city: "البحر الأحمر",
    kind: "monastery",
    distanceKm: 280,
    image: imgMass,
    coords: { lat: 28.9219, lng: 32.3506 },
  },
];

export const KIND_LABEL: Record<PlaceKind, string> = {
  church: "كنيسة",
  monastery: "دير",
  landmark: "معلم مسيحي",
};

export function mapsUrlFor(p: ChurchPlace) {
  return `https://www.google.com/maps/search/?api=1&query=${p.coords.lat},${p.coords.lng}`;
}

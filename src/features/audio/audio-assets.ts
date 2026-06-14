import cardAudio from "@/assets/home/card-audio.jpg";
import cardChurch from "@/assets/home/card-church.jpg";
import heroChurch from "@/assets/home/hero-church-premium.jpg";
import dailyHymn from "@/assets/home/daily-hymn.jpg";
import cardMeditation from "@/assets/home/card-meditation.jpg";
import feastResurrection from "@/assets/feasts/feast-resurrection.jpg";
import cardSynaxarium from "@/assets/home/card-synaxarium.jpg";

export const audioHero = cardAudio;
export const audioThumb = dailyHymn;
export const audioStreamImages = [cardChurch, heroChurch, cardSynaxarium] as const;
export const audioPlaylistImages = [cardAudio, dailyHymn, feastResurrection, cardMeditation, cardSynaxarium] as const;
export const audioTrackImages = [dailyHymn, cardMeditation, cardSynaxarium, feastResurrection, cardChurch] as const;

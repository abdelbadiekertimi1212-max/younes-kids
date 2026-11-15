import { Baloo_Bhaijaan_2, Nunito } from "next/font/google";

/** Rounded Arabic + Latin display font. UI font for lang = ar, headings everywhere. */
export const baloo = Baloo_Bhaijaan_2({
  subsets: ["arabic", "latin"],
  variable: "--font-baloo",
  display: "swap",
});

/** Rounded Latin text font. Used when lang = fr / en. */
export const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  variable: "--font-nunito",
  display: "swap",
});

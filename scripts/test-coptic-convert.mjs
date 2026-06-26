import { formatCopticDisplay } from "../src/lib/coptic-text/format-coptic-display.ts";

const samples = [
  "Pi`precbuteroc@",
  "Pidiakwn@",
  "Pilaoc@",
  "Am/n@",
  "Kurioc@",
  "Ten y/nou ;e;pswi ;nte ;e;P_ ;nte nijom",
];

for (const s of samples) {
  console.log("\nINPUT:", s);
  const u = await formatCopticDisplay(s);
  console.log("  =>", u);
}

import mic from "@/assets/icon-mic.png";
import books from "@/assets/icon-books.png";
import folder from "@/assets/icon-folder.png";
import calendar from "@/assets/icon-calendar.png";
import heart from "@/assets/icon-heart.png";
import download from "@/assets/icon-download.png";
import clock from "@/assets/icon-clock.png";

const items = [
  { img: mic, label: "العظات" },
  { img: books, label: "السلاسل التعليمية" },
  { img: folder, label: "الموضوعات" },
  { img: calendar, label: "في مثل هذا اليوم" },
  { img: heart, label: "المفضلة" },
  { img: download, label: "التنزيلات" },
  { img: clock, label: "تاريخ الاستماع" },
];

export function CategoriesStrip() {
  return (
    <section className="mt-6">
      <div
        dir="rtl"
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1"
      >
        {items.map((it) => (
          <button
            key={it.label}
            className="glass-card group flex w-[112px] shrink-0 snap-start flex-col items-center gap-2 rounded-3xl p-3 pt-4 transition active:scale-[0.97]"
          >
            <div className="grid h-[72px] w-[72px] place-items-center rounded-2xl bg-gradient-to-br from-[var(--beige)]/60 to-white/40 ring-1 ring-[var(--gold)]/15">
              <img
                src={it.img}
                alt={it.label}
                className="h-14 w-14 object-contain drop-shadow-[0_8px_14px_rgba(140,100,40,0.25)]"
                loading="lazy"
                width={512}
                height={512}
              />
            </div>
            <span className="line-clamp-2 text-center text-[12px] font-semibold leading-tight text-foreground">
              {it.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        <span className="h-1.5 w-4 rounded-full bg-[var(--gold-deep)]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]/35" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]/35" />
      </div>
    </section>
  );
}

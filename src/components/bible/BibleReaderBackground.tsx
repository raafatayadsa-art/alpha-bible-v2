import katamerosReadingBg from "@/assets/katameros-reading-bg.png";

/** Parchment Katameros background for the Bible chapter reader. */
export function BibleReaderBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img
        src={katamerosReadingBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        decoding="async"
      />
      <div className="absolute inset-0 bg-[#f5edd8]/12" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#fbf7f0]/55 via-transparent to-[#ebe2cf]/45" />
    </div>
  );
}

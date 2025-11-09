"use client";

import Image from "next/image";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  src: string;
  alt: string;
  headline?: string;
  subheadline?: string;
};

type Props = {
  slides: Slide[];
  intervalMs?: number;
  fullBleed?: boolean;
  heightClass?: string;
  className?: string;
};

export default function Carousel({ slides, intervalMs = 5000, fullBleed = false, heightClass = "h-64 sm:h-80 md:h-96", className = "" }: Props) {
  const [index, setIndex] = React.useState<number>(0);
  const [paused, setPaused] = React.useState<boolean>(false);
  const len = slides.length;

  React.useEffect(() => {
    if (paused || len === 0) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % len);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, paused, len]);

  function goTo(i: number) {
    setIndex((i + len) % len);
  }

  function prev() {
    goTo(index - 1);
  }

  function next() {
    goTo(index + 1);
  }

  if (len === 0) return null;

  return (
    <section
      className={`${fullBleed ? "rounded-none border-0" : "bg-white rounded-xl border border-gray-200 shadow-sm"} relative group overflow-hidden ${className}`}
      aria-roledescription="carousel"
      aria-label="Project showcase"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`relative w-full ${heightClass}`}>
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${len}`}
          >
            <Image src={slide.src} alt={slide.alt} fill className="object-cover" priority={i === index} />
            {(slide.headline || slide.subheadline) && !fullBleed && (
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/60 to-transparent text-white">
                {slide.headline ? <h3 className="text-lg sm:text-xl font-semibold">{slide.headline}</h3> : null}
                {slide.subheadline ? <p className="text-sm opacity-90">{slide.subheadline}</p> : null}
              </div>
            )}
          </div>
        ))}
      </div>

      {}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute cursor-pointer z-30 left-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200/50 shadow-lg hover:bg-white hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-all duration-200 opacity-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute cursor-pointer z-30 right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200/50 shadow-lg hover:bg-white hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-all duration-200 opacity-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 rounded-full border transition-all duration-200 ${
              i === index 
                ? "bg-[var(--primary)] border-[var(--primary)] scale-125" 
                : "bg-white/80 border-white/60 hover:bg-white hover:scale-110"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

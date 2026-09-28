// src/components/HeroBannerSlider.tsx
// Sunbloom Adorn — Horizontal Track Hero Banner Slider
// Features: Centered active banner, partial neighboring previews (left & right),
// smooth translateX horizontal translation, auto-slide (5s), pause on hover/focus,
// responsive desktop/tablet/mobile, and seamless infinite wrap-around.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getBannersApi, type HeroBanner } from '../lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AUTO_SLIDE_MS = 5000;
const TRANSITION_DURATION_MS = 600;

export const HeroBannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  // trackIndex is 1-indexed because index 0 is the clone of the last banner
  const [trackIndex, setTrackIndex] = useState(1);
  const [withTransition, setWithTransition] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);

  // ── Fetch active banners from backend ──────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    getBannersApi()
      .then((res) => {
        if (mounted) {
          setBanners(res.banners || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setBanners([]);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totalBanners = banners.length;

  // Real index corresponding to current trackIndex (0 to totalBanners - 1)
  const realIndex =
    totalBanners <= 1
      ? 0
      : trackIndex === 0
      ? totalBanners - 1
      : trackIndex === totalBanners + 1
      ? 0
      : trackIndex - 1;

  // ── Transition End & Infinite Wrap-Around Snap ────────────────────────────
  const handleTransitionEnd = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    if (trackIndex === 0) {
      // Reached prepended clone of last banner -> instantaneously snap to real last banner
      setWithTransition(false);
      setTrackIndex(totalBanners);
    } else if (trackIndex === totalBanners + 1) {
      // Reached appended clone of first banner -> instantaneously snap to real first banner
      setWithTransition(false);
      setTrackIndex(1);
    }
    setIsTransitioning(false);
  }, [trackIndex, totalBanners]);

  // Re-enable transition after snap frame paint
  useEffect(() => {
    if (!withTransition) {
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setWithTransition(true);
        });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [withTransition]);

  // ── Navigation Handlers ───────────────────────────────────────────────────
  const goNext = useCallback(() => {
    if (isTransitioning || totalBanners <= 1) return;
    setIsTransitioning(true);
    setWithTransition(true);
    setTrackIndex((prev) => prev + 1);

    // Safety timeout in case onTransitionEnd doesn't fire
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      handleTransitionEnd();
    }, TRANSITION_DURATION_MS + 100);
  }, [isTransitioning, totalBanners, handleTransitionEnd]);

  const goPrev = useCallback(() => {
    if (isTransitioning || totalBanners <= 1) return;
    setIsTransitioning(true);
    setWithTransition(true);
    setTrackIndex((prev) => prev - 1);

    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(() => {
      handleTransitionEnd();
    }, TRANSITION_DURATION_MS + 100);
  }, [isTransitioning, totalBanners, handleTransitionEnd]);

  const goTo = useCallback(
    (targetRealIndex: number) => {
      if (isTransitioning || totalBanners <= 1) return;
      setIsTransitioning(true);
      setWithTransition(true);
      setTrackIndex(targetRealIndex + 1);

      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = setTimeout(() => {
        handleTransitionEnd();
      }, TRANSITION_DURATION_MS + 100);
    },
    [isTransitioning, totalBanners, handleTransitionEnd]
  );

  // ── Auto-slide Timer (5 seconds) ──────────────────────────────────────────
  useEffect(() => {
    if (totalBanners <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      goNext();
    }, AUTO_SLIDE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalBanners, isPaused, goNext]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // ── Touch / Swipe support for mobile ──────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  // ── 1. Loading State ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="w-full max-w-7xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FAF4EF] animate-pulse border border-[#E8DCCF]/60"
        style={{ aspectRatio: '16/7', minHeight: 180 }}
      />
    );
  }

  // ── 2. Empty State: No banners configured ────────────────────────────────
  if (totalBanners === 0) {
    return (
      <div
        className="w-full max-w-7xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col items-center justify-center gap-3 border border-[#E8DCCF]/60 bg-gradient-to-br from-[#FAF6F0] via-[#FDF2F5]/60 to-[#FAF5EB] shadow-xs"
        style={{ minHeight: 220, aspectRatio: '16/7' }}
      >
        <img
          src="/logo.png"
          alt="Sunbloom Adorn"
          className="w-14 h-14 rounded-full object-cover opacity-50"
        />
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.26em] text-[#7A223B] font-medium">
            Sunbloom Adorn
          </p>
          <p className="text-[11px] text-[#A8928D] mt-1 font-light tracking-wide">
            Fine Jewellery Atelier
          </p>
        </div>
      </div>
    );
  }

  // ── 3. Single Banner State (no slider needed) ─────────────────────────────
  if (totalBanners === 1) {
    const banner = banners[0];
    const singleContent = (
      <div className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-2xl sm:rounded-3xl border border-[#DFC598]/60 shadow-md bg-[#FAF4EF]">
        <img
          src={banner.imageUrl}
          alt={banner.altText || 'Sunbloom Adorn Banner'}
          className="w-full object-cover object-center"
          style={{ aspectRatio: '16/7', display: 'block' }}
          loading="eager"
          decoding="async"
        />
      </div>
    );
    return banner.linkUrl ? (
      <a href={banner.linkUrl} className="block w-full">
        {singleContent}
      </a>
    ) : (
      singleContent
    );
  }

  // ── 4. Multi-Banner Horizontal Sliding Carousel ───────────────────────────
  // Items array: [clone of last, ...all banners, clone of first]
  const extendedItems = [banners[totalBanners - 1], ...banners, banners[0]];

  return (
    <div
      className="sunbloom-hero-carousel relative w-full overflow-hidden select-none py-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Responsive Dimensions & Layout Variables */}
      <style>{`
        .sunbloom-hero-carousel {
          --slide-w: 86%;
          --slide-gap: 12px;
          --slide-ratio: 16/8;
        }
        @media (min-width: 640px) {
          .sunbloom-hero-carousel {
            --slide-w: 84%;
            --slide-gap: 18px;
            --slide-ratio: 16/7;
          }
        }
        @media (min-width: 1024px) {
          .sunbloom-hero-carousel {
            --slide-w: 80%;
            --slide-gap: 24px;
            --slide-ratio: 16/6.5;
          }
        }
      `}</style>

      {/* Horizontal Translating Track */}
      <div
        className="flex items-center"
        style={{
          transform: `translateX(calc(50% - (var(--slide-w) / 2) - ${trackIndex} * (var(--slide-w) + var(--slide-gap))))`,
          transition: withTransition
            ? `transform ${TRANSITION_DURATION_MS}ms cubic-bezier(0.25, 1, 0.5, 1)`
            : 'none',
          willChange: 'transform',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedItems.map((banner, idx) => {
          const isCentered = idx === trackIndex;
          const isNeighbor = idx === trackIndex - 1 || idx === trackIndex + 1;

          return (
            <div
              key={`${banner.id}-${idx}`}
              className="shrink-0 transition-transform duration-500 ease-out"
              style={{
                width: 'var(--slide-w)',
                marginRight: 'var(--slide-gap)',
              }}
              onClick={() => {
                if (idx < trackIndex) goPrev();
                else if (idx > trackIndex) goNext();
              }}
            >
              <div
                className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-500 ${
                  isCentered
                    ? 'border-[#DFC598]/90 shadow-lg scale-100 opacity-100 ring-1 ring-[#DFC598]/30'
                    : isNeighbor
                    ? 'border-[#E8DCCF]/70 shadow-xs scale-[0.97] opacity-75 sm:opacity-85 hover:opacity-95 cursor-pointer'
                    : 'border-[#E8DCCF]/50 scale-[0.94] opacity-50'
                }`}
              >
                {banner.linkUrl && isCentered ? (
                  <a
                    href={banner.linkUrl}
                    className="block w-full h-full"
                    tabIndex={isCentered ? 0 : -1}
                  >
                    <img
                      src={banner.imageUrl}
                      alt={banner.altText || `Sunbloom Adorn Banner ${idx}`}
                      className="w-full h-full object-cover object-center"
                      style={{ aspectRatio: 'var(--slide-ratio)', display: 'block' }}
                      loading={idx <= 2 ? 'eager' : 'lazy'}
                      decoding={idx <= 2 ? 'sync' : 'async'}
                    />
                  </a>
                ) : (
                  <img
                    src={banner.imageUrl}
                    alt={banner.altText || `Sunbloom Adorn Banner ${idx}`}
                    className="w-full h-full object-cover object-center"
                    style={{ aspectRatio: 'var(--slide-ratio)', display: 'block' }}
                    loading={idx <= 2 ? 'eager' : 'lazy'}
                    decoding={idx <= 2 ? 'sync' : 'async'}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next Controls */}
      <button
        type="button"
        onClick={goPrev}
        aria-label="Previous banner"
        className="absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 sm:bg-white/90 hover:bg-white text-[#7A223B] border border-[#DFC598]/70 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        type="button"
        onClick={goNext}
        aria-label="Next banner"
        className="absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 sm:bg-white/90 hover:bg-white text-[#7A223B] border border-[#DFC598]/70 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Navigation Dots */}
      <div className="flex items-center justify-center gap-2 pt-4 sm:pt-5">
        {banners.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              realIndex === i
                ? 'w-7 sm:w-8 bg-[#7A223B] shadow-xs'
                : 'w-2 bg-[#DFC598]/70 hover:bg-[#DFC598]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBannerSlider;

// src/components/HeroBannerSlider.tsx
// Sunbloom Adorn — Admin-managed Homepage Hero Banner Slider
// Dynamic: loads images from backend API, no hardcoded/fallback banners.
// Empty state: shown when no banners exist — clean neutral state.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getBannersApi, type HeroBanner } from '../lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AUTO_SLIDE_MS = 5000;

export const HeroBannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch active banners from backend
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
    return () => { mounted = false; };
  }, []);

  // Auto-advance slide
  const goTo = useCallback(
    (idx: number) => {
      if (isTransitioning || banners.length <= 1) return;
      setIsTransitioning(true);
      setCurrentIndex(idx);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [banners.length, isTransitioning]
  );

  const goNext = useCallback(() => {
    goTo((currentIndex + 1) % banners.length);
  }, [currentIndex, banners.length, goTo]);

  const goPrev = useCallback(() => {
    goTo(currentIndex === 0 ? banners.length - 1 : currentIndex - 1);
  }, [currentIndex, banners.length, goTo]);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(goNext, AUTO_SLIDE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, isPaused, goNext]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FAF4EF] animate-pulse"
        style={{ aspectRatio: '16/6', minHeight: 160 }}
      />
    );
  }

  // ── Empty State: No banners configured ────────────────────────────────────
  if (banners.length === 0) {
    return (
      <div
        className="w-full rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col items-center justify-center gap-3 border border-[#E8DCCF]/60 bg-gradient-to-br from-[#FAF6F0] via-[#FDF2F5]/60 to-[#FAF5EB]"
        style={{ minHeight: 180, aspectRatio: '16/6' }}
      >
        <img
          src="/logo.png"
          alt="Sunbloom Adorn"
          className="w-12 h-12 rounded-full object-cover opacity-50"
        />
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#A8928D] font-medium">Sunbloom Adorn</p>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  // ── Single Banner (no controls needed) ────────────────────────────────────
  if (banners.length === 1) {
    const content = (
      <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E8DCCF]/60 shadow-sm bg-[#FAF4EF]">
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.altText || 'Sunbloom Adorn Banner'}
          className="w-full object-cover object-center"
          style={{ aspectRatio: '16/6', display: 'block' }}
          loading="eager"
          decoding="async"
        />
      </div>
    );
    return currentBanner.linkUrl ? (
      <a href={currentBanner.linkUrl} className="block w-full">{content}</a>
    ) : content;
  }

  // ── Multi-Banner Slider ────────────────────────────────────────────────────
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E8DCCF]/60 shadow-sm group bg-[#FAF4EF]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Track */}
      <div className="relative w-full" style={{ aspectRatio: '16/6', minHeight: 140 }}>
        {banners.map((banner, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              aria-hidden={!isActive}
            >
              {banner.linkUrl ? (
                <a href={banner.linkUrl} className="block w-full h-full" tabIndex={isActive ? 0 : -1}>
                  <img
                    src={banner.imageUrl}
                    alt={banner.altText || `Sunbloom Adorn Banner ${idx + 1}`}
                    className="w-full h-full object-cover object-center"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding={idx === 0 ? 'sync' : 'async'}
                  />
                </a>
              ) : (
                <img
                  src={banner.imageUrl}
                  alt={banner.altText || `Sunbloom Adorn Banner ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding={idx === 0 ? 'sync' : 'async'}
                />
              )}
            </div>
          );
        })}

        {/* Gradient overlays for control visibility */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-20" />

        {/* Prev / Next Controls */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous banner"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center text-[#7A223B] opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next banner"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center text-[#7A223B] opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide counter badge */}
        <div className="absolute top-3 right-3 z-30 px-2.5 py-1 rounded-full bg-black/40 text-white text-[10px] font-mono backdrop-blur-xs">
          {currentIndex + 1} / {banners.length}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-30 pointer-events-none">
        {banners.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer pointer-events-auto ${
              currentIndex === idx
                ? 'w-6 bg-white shadow-xs'
                : 'w-1.5 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

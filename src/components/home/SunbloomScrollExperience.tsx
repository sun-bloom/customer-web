// src/components/home/SunbloomScrollExperience.tsx
// Interactive 3D Canvas Solar Medallion Experience
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const SunbloomScrollExperience: React.FC = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let scrollProgress = 0;
    let currentScrollProgress = 0;
    let isRunning = true;

    const updateScrollProgress = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      scrollProgress = Math.min(1, Math.max(0, scrollY / (windowHeight * 1.2)));
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width || 560;
      height = rect.height || 560;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
      ctx.scale(dpr, dpr);
    };

    // Stardust floating particles
    interface Particle {
      x: number;
      y: number;
      radius: number;
      speed: number;
      angle: number;
      alpha: number;
      alphaSpeed: number;
      orbitRadius: number;
    }

    const particles: Particle[] = Array.from({ length: 42 }, () => ({
      x: 0,
      y: 0,
      radius: Math.random() * 2 + 0.8,
      speed: Math.random() * 0.008 + 0.003,
      angle: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.7 + 0.3,
      alphaSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      orbitRadius: Math.random() * 240 + 90,
    }));

    const drawFrame = (time: number) => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;
      currentScrollProgress += (scrollProgress - currentScrollProgress) * 0.08;

      const tiltX = mouseX * 24;
      const tiltY = mouseY * 24 - currentScrollProgress * 30;

      ctx.save();
      ctx.translate(centerX + tiltX, centerY + tiltY);

      const bloomExpansion = 1 + currentScrollProgress * 0.65;
      const baseRotation = time * 0.0003 + currentScrollProgress * Math.PI * 0.75;

      // 1. Solar Corona Outer Glow Aura
      const coreBaseRadius = Math.min(width, height) * 0.18;
      const pulse = Math.sin(time * 0.002) * 4;
      const sunRadius = (coreBaseRadius + pulse) * (1 + currentScrollProgress * 0.15);

      const auraGrad = ctx.createRadialGradient(0, 0, sunRadius * 0.5, 0, 0, sunRadius * 2.5 * bloomExpansion);
      auraGrad.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
      auraGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.22)');
      auraGrad.addColorStop(0.7, 'rgba(197, 160, 89, 0.08)');
      auraGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, sunRadius * 2.5 * bloomExpansion, 0, Math.PI * 2);
      ctx.fill();

      // 2. Concentric Blooming Jewelry Petals
      const layers = [
        { count: 8, radius: sunRadius * 1.35 * bloomExpansion, rot: baseRotation * 0.8, alpha: 0.7, width: 1.8, gold: '#D4AF37' },
        { count: 12, radius: sunRadius * 1.75 * bloomExpansion, rot: -baseRotation * 0.6, alpha: 0.55, width: 1.4, gold: '#C5A059' },
        { count: 16, radius: sunRadius * 2.15 * bloomExpansion, rot: baseRotation * 0.4, alpha: 0.4, width: 1.2, gold: '#B88E3E' },
        { count: 24, radius: sunRadius * 2.55 * bloomExpansion, rot: -baseRotation * 0.25, alpha: 0.25, width: 1.0, gold: '#E2BF48' },
      ];

      layers.forEach((layer) => {
        ctx.save();
        ctx.rotate(layer.rot);
        ctx.strokeStyle = layer.gold;
        ctx.lineWidth = layer.width;
        ctx.globalAlpha = layer.alpha;

        for (let i = 0; i < layer.count; i++) {
          const angle = (i * 2 * Math.PI) / layer.count;
          ctx.save();
          ctx.rotate(angle);

          ctx.beginPath();
          ctx.moveTo(0, sunRadius * 0.7);
          ctx.bezierCurveTo(
            layer.radius * 0.35,
            layer.radius * 0.5,
            layer.radius * 0.25,
            layer.radius * 0.9,
            0,
            layer.radius
          );
          ctx.bezierCurveTo(
            -layer.radius * 0.25,
            layer.radius * 0.9,
            -layer.radius * 0.35,
            layer.radius * 0.5,
            0,
            sunRadius * 0.7
          );
          ctx.stroke();

          ctx.fillStyle = layer.gold;
          ctx.beginPath();
          ctx.arc(0, layer.radius, 2.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
        ctx.restore();
      });

      // 3. Central Haute Jewelry Solar Medallion Core
      ctx.globalAlpha = 1.0;
      const coreGrad = ctx.createRadialGradient(
        -sunRadius * 0.25,
        -sunRadius * 0.25,
        sunRadius * 0.1,
        0,
        0,
        sunRadius
      );
      coreGrad.addColorStop(0, '#FFFFFF');
      coreGrad.addColorStop(0.2, '#FEF3C7');
      coreGrad.addColorStop(0.5, '#FCD34D');
      coreGrad.addColorStop(0.85, '#D4AF37');
      coreGrad.addColorStop(1, '#92400E');

      ctx.fillStyle = coreGrad;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.45)';
      ctx.shadowBlur = 32;
      ctx.beginPath();
      ctx.arc(0, 0, sunRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner Sunbloom Golden Filigree Rim
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, sunRadius * 0.85, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(197, 160, 89, 0.7)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(0, 0, sunRadius * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Orbiting Jewelry Sparkles
      particles.forEach((p) => {
        p.angle += p.speed;
        p.alpha += p.alphaSpeed;
        if (p.alpha > 0.9 || p.alpha < 0.2) p.alphaSpeed = -p.alphaSpeed;

        const dynamicOrbit = p.orbitRadius * bloomExpansion;
        const px = Math.cos(p.angle) * dynamicOrbit;
        const py = Math.sin(p.angle) * dynamicOrbit * 0.85;

        const sparkGrad = ctx.createRadialGradient(px, py, 0, px, py, p.radius * 2.5);
        sparkGrad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
        sparkGrad.addColorStop(0.5, `rgba(254, 240, 138, ${p.alpha * 0.8})`);
        sparkGrad.addColorStop(1, 'rgba(197, 160, 89, 0)');

        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(px, py, p.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    };

    const loop = (t: number) => {
      if (!isRunning) return;
      drawFrame(t);
      animationFrameId = requestAnimationFrame(loop);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        if (!isRunning) {
          isRunning = true;
          animationFrameId = requestAnimationFrame(loop);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', resize, { passive: true });

    resize();
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative w-full min-h-[88vh] sm:min-h-[92vh] flex items-center overflow-hidden select-none bg-gradient-to-b from-[#FAF7F2] via-[#F6F0E6] to-[#FAF7F2]">
      {/* Radiant Solar Background Aura */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000">
        <div className="absolute top-1/2 right-[5%] sm:right-[10%] -translate-y-1/2 w-[480px] sm:w-[680px] h-[480px] sm:h-[680px] rounded-full bg-radial from-[#FEF3C7]/60 via-[#FDE68A]/20 to-transparent blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-8 z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 xl:col-span-6 text-center lg:text-left z-20 space-y-6">
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium font-sans inline-block mb-3 bg-[#FAF7F2]/80 px-3.5 py-1.5 rounded-full border border-[#C5A059]/25 shadow-2xs">
                Haute Jewellery Atelier
              </span>
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-serif font-normal text-[#1C1612] tracking-tight leading-[1.08]">
                Sunbloom <br className="hidden sm:inline" />
                <span className="font-serif italic text-gold-gradient font-normal">Adorn</span>
              </h1>
            </div>

            <p className="text-sm sm:text-base xl:text-lg text-[#5C5248] font-sans font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
              Where sunlight meets adornment. Discover handcrafted anti-tarnish fine jewellery rooted in Korean minimalist aesthetics.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#1C1612] text-[#FEF3C7] hover:bg-[#2A231D] text-xs uppercase tracking-[0.22em] font-medium shadow-gold hover:shadow-gold-lg transition-all duration-500 hover:scale-105 active:scale-95"
                  >
                    <span>Enter Dashboard</span>
                    <span className="text-[#C5A059] transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#D1C7BA] hover:border-[#C5A059] text-[#1C1612] text-xs uppercase tracking-[0.18em] font-medium transition-all"
                  >
                    View Catalog
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login?mode=login"
                    className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#1C1612] text-[#FEF3C7] hover:bg-[#2A231D] text-xs uppercase tracking-[0.22em] font-medium shadow-gold hover:shadow-gold-lg transition-all duration-500 hover:scale-105 active:scale-95"
                  >
                    <span>Enter Atelier</span>
                    <span className="text-[#C5A059] transform group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link
                    to="/login?mode=signup"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#D1C7BA] hover:border-[#C5A059] text-[#1C1612] text-xs uppercase tracking-[0.18em] font-medium transition-all"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>

            <div className="pt-2 flex items-center justify-center lg:justify-start gap-3 text-[#8A7E72] opacity-75">
              <div className="w-3.5 h-6 rounded-full border border-[#8A7E72] p-0.5 flex justify-center">
                <div className="w-1 h-1.5 rounded-full bg-[#C5A059] animate-bounce"></div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-medium">Scroll to bloom</span>
            </div>
          </div>

          {/* Right 3D Canvas Column */}
          <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center relative z-10">
            <canvas
              ref={canvasRef}
              className="relative z-10 w-full max-w-[460px] sm:max-w-[540px] xl:max-w-[600px] aspect-square object-contain cursor-grab active:cursor-grabbing transition-transform duration-300"
              aria-label="3D Sunbloom Adorn Interactive Jewelry Medallion"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

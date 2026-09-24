// src/components/home/JewelleryHeroExperience.tsx
// High-End 3D Luxury Jewellery Hero with Scroll-Driven Interaction & Official Logo
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import * as THREE from 'three';

export const JewelleryHeroExperience: React.FC = () => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // 1. WebGL Support Verification
    const hasWebGL = (() => {
      try {
        const testCanvas = document.createElement('canvas');
        return !!(
          window.WebGLRenderingContext &&
          (testCanvas.getContext('webgl2') || testCanvas.getContext('webgl'))
        );
      } catch {
        return false;
      }
    })();

    if (!hasWebGL) {
      setWebGLSupported(false);
      return;
    }

    // 2. Accessibility: Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 3. Three.js Scene & Camera Setup
    const scene = new THREE.Scene();

    const fov = 38;
    const aspect = canvas.clientWidth / canvas.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    let renderer: THREE.WebGLRenderer;
    let pmremGenerator: THREE.PMREMGenerator | null = null;
    let envMapTexture: THREE.Texture | null = null;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

    } catch (e) {
      console.warn('WebGL initialization failed, falling back to static visual:', e);
      setWebGLSupported(false);
      return;
    }

    // 4. Studio Multi-Point Lighting Architecture
    // Ambient soft studio fill
    const ambientLight = new THREE.AmbientLight(0xfff9f0, 1.2);
    scene.add(ambientLight);

    // Main Studio Key Light (Upper Left Front)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(-3.2, 4.2, 4.0);
    scene.add(keyLight);

    // Warm Atelier Gold Reflector Light (Right Front)
    const fillLight = new THREE.DirectionalLight(0xf7dd9e, 2.4);
    fillLight.position.set(3.6, 1.8, 3.5);
    scene.add(fillLight);

    // Top Specular Glint Light (Back Rim)
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.6);
    rimLight.position.set(0.2, 4.5, -2.8);
    scene.add(rimLight);

    // Dynamic Sparkle Accent Point Light (Tracks with scroll)
    const sparkleLight = new THREE.PointLight(0xfff3db, 3.8, 14);
    sparkleLight.position.set(1.4, 2.2, 2.8);
    scene.add(sparkleLight);

    // 5. Materials: Physically Based Rendering (PBR)
    // 18K Yellow Gold Material
    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#E6C374'),
      emissive: new THREE.Color('#2C1B06'),
      metalness: 0.95,
      roughness: 0.12,
      clearcoat: 0.9,
      clearcoatRoughness: 0.06,
      reflectivity: 0.98,
    });

    // 18K Rose Gold Inset
    const roseGoldMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#E8B692'),
      metalness: 0.92,
      roughness: 0.15,
      clearcoat: 0.75,
      clearcoatRoughness: 0.08,
    });

    // Faceted Diamond Solitaire (Refractive Crystal PBR with Sharp Facet Scintillation)
    const diamondMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFFFFF'),
      metalness: 0.05,
      roughness: 0.04,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      flatShading: true, // Each facet sparkles independently!
      specularIntensity: 1.0,
      specularColor: new THREE.Color('#FFFFFF'),
    });

    // Micro Pavé Accent Gems
    const paveGemMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFF8EE'),
      metalness: 0.02,
      roughness: 0.05,
      clearcoat: 0.9,
      clearcoatRoughness: 0.04,
      flatShading: true,
    });

    // 6. Sculpting the Sunbloom Haute Jewellery Ensemble
    const jewelleryGroup = new THREE.Group();

    // A. Main Sculpted 18K Gold Band (Torque / Fine Ring)
    const bandRadius = 1.25;
    const bandTube = 0.105;
    const bandGeo = new THREE.TorusGeometry(bandRadius, bandTube, 36, 120);
    const bandMesh = new THREE.Mesh(bandGeo, goldMaterial);
    jewelleryGroup.add(bandMesh);

    // B. Inner Comfort-Fit Filigree Band
    const innerRimGeo = new THREE.TorusGeometry(bandRadius - 0.035, 0.04, 24, 80);
    const innerRimMesh = new THREE.Mesh(innerRimGeo, roseGoldMaterial);
    jewelleryGroup.add(innerRimMesh);

    // C. Outer Fine Beaded Accent Chain (Faithful to Sunbloom Logo Silhouette)
    const chainRadius = bandRadius + 0.14;
    const beadCount = 38;
    const beadGeo = new THREE.SphereGeometry(0.038, 16, 16);

    for (let i = 0; i < beadCount; i++) {
      const angle = (i / beadCount) * Math.PI * 2;
      const wave = Math.sin(angle * 3) * 0.045;
      const bead = new THREE.Mesh(beadGeo, goldMaterial);
      bead.position.set(
        Math.cos(angle) * (chainRadius + wave),
        Math.sin(angle) * (chainRadius + wave),
        Math.cos(angle * 2) * 0.04
      );
      jewelleryGroup.add(bead);
    }

    // Lower Draping Micro-Chain Arc (Iconic Sunbloom Motif)
    const drapeCount = 18;
    for (let i = 0; i < drapeCount; i++) {
      const angle = Math.PI * 1.08 + (i / drapeCount) * Math.PI * 0.84;
      const sag = Math.sin((i / drapeCount) * Math.PI) * 0.22;
      const bead = new THREE.Mesh(beadGeo, roseGoldMaterial);
      bead.position.set(
        Math.cos(angle) * (bandRadius + 0.2),
        Math.sin(angle) * (bandRadius + 0.2) - sag,
        Math.sin(angle * 2) * 0.05
      );
      jewelleryGroup.add(bead);
    }

    // D. The Sunbloom Signature Flower Crown Centerpiece
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(0.72, 1.02, 0.16);
    flowerGroup.rotation.z = -0.32;
    flowerGroup.rotation.x = 0.12;

    // Golden Bezel Cup Base
    const bezelGeo = new THREE.CylinderGeometry(0.32, 0.22, 0.16, 24);
    const bezel = new THREE.Mesh(bezelGeo, goldMaterial);
    bezel.rotation.x = Math.PI / 2;
    flowerGroup.add(bezel);

    // 8 Sculpted Organic Golden Petals (Smooth rounded fine jewellery petals)
    const petalCount = 8;
    for (let p = 0; p < petalCount; p++) {
      const pAngle = (p / petalCount) * Math.PI * 2;
      const petalGeo = new THREE.SphereGeometry(0.13, 16, 16);
      petalGeo.scale(0.85, 1.75, 0.42);
      const petalMesh = new THREE.Mesh(petalGeo, goldMaterial);

      petalMesh.position.set(
        Math.cos(pAngle) * 0.32,
        Math.sin(pAngle) * 0.32,
        0.06
      );
      petalMesh.rotation.z = pAngle - Math.PI / 2;
      petalMesh.rotation.x = 0.25; // Gentle outward blossom curve
      flowerGroup.add(petalMesh);

      // Micro-pavé gem set into each petal tip
      const paveGeo = new THREE.SphereGeometry(0.03, 12, 12);
      const pave = new THREE.Mesh(paveGeo, paveGemMaterial);
      pave.position.set(
        Math.cos(pAngle) * 0.52,
        Math.sin(pAngle) * 0.52,
        0.13
      );
      flowerGroup.add(pave);
    }

    // E. Brilliant-Cut Solitaire Diamond Centerpiece
    // Multi-faceted Diamond Crown & Pavilion (Octagonal Scintillation)
    const crownGeo = new THREE.CylinderGeometry(0.22, 0.3, 0.15, 14, 1);
    const crown = new THREE.Mesh(crownGeo, diamondMaterial);
    crown.position.set(0, 0, 0.17);
    crown.rotation.x = Math.PI / 2;
    flowerGroup.add(crown);

    const pavilionGeo = new THREE.ConeGeometry(0.3, 0.3, 14);
    pavilionGeo.rotateX(Math.PI);
    const pavilion = new THREE.Mesh(pavilionGeo, diamondMaterial);
    pavilion.position.set(0, 0, 0.02);
    flowerGroup.add(pavilion);

    // 6 Cathedral Filigree Prongs
    for (let pr = 0; pr < 6; pr++) {
      const prAngle = (pr / 6) * Math.PI * 2;
      const prongGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.25, 10);
      const prong = new THREE.Mesh(prongGeo, goldMaterial);
      prong.position.set(
        Math.cos(prAngle) * 0.27,
        Math.sin(prAngle) * 0.27,
        0.14
      );
      prong.rotation.x = Math.PI / 2;
      flowerGroup.add(prong);
    }

    // F. Suspended Star-Light Charm (Matching Official Logo Charm)
    const starCharmGroup = new THREE.Group();
    starCharmGroup.position.set(0.66, -1.18, 0.06);

    // Connector link ring
    const linkGeo = new THREE.TorusGeometry(0.06, 0.016, 12, 20);
    const link = new THREE.Mesh(linkGeo, goldMaterial);
    starCharmGroup.add(link);

    // 4-Pointed Star Solitaire
    const starGeo = new THREE.OctahedronGeometry(0.17, 0);
    starGeo.scale(0.72, 1.35, 0.42);
    const starMesh = new THREE.Mesh(starGeo, diamondMaterial);
    starMesh.position.set(0, -0.2, 0);
    starCharmGroup.add(starMesh);

    // Golden Droplet bead
    const dropletGeo = new THREE.SphereGeometry(0.048, 14, 14);
    const droplet = new THREE.Mesh(dropletGeo, goldMaterial);
    droplet.position.set(0, -0.37, 0);
    starCharmGroup.add(droplet);

    jewelleryGroup.add(flowerGroup);
    jewelleryGroup.add(starCharmGroup);

    // G. Soft Studio Contact Shadow (Circular with 100% transparent zero-clip edge)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext('2d');
    if (shadowCtx) {
      const grad = shadowCtx.createRadialGradient(128, 128, 0, 128, 128, 115);
      grad.addColorStop(0, 'rgba(197, 160, 89, 0.24)');
      grad.addColorStop(0.3, 'rgba(130, 112, 95, 0.10)');
      grad.addColorStop(0.65, 'rgba(210, 195, 175, 0.03)');
      grad.addColorStop(1, 'rgba(250, 247, 242, 0)');
      shadowCtx.fillStyle = grad;
      shadowCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.CircleGeometry(2.4, 48);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.position.set(0, -1.65, -0.2);
    shadowPlane.rotation.x = -Math.PI / 2.2;
    jewelleryGroup.add(shadowPlane);

    // Initial Composition Angle (Luxury 3/4 Fine Jewellery Atelier Posture)
    jewelleryGroup.rotation.set(0.48, 0.52, -0.16);
    jewelleryGroup.position.set(0.0, -0.05, 0);
    jewelleryGroup.scale.set(0.88, 0.88, 0.88);
    scene.add(jewelleryGroup);

    // 7. Interactive & Scroll Choreography State
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragDeltaX = 0;
    let dragDeltaY = 0;

    let targetScroll = 0;
    let currentScroll = 0;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = container.clientHeight || window.innerHeight;
      targetScroll = Math.min(1.25, Math.max(0, scrollY / heroHeight));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mouse / Touch handlers for subtle tilting & inspection
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      targetMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      if (isDragging) {
        dragDeltaX += (e.clientX - dragStartX) * 0.005;
        dragDeltaY += (e.clientY - dragStartY) * 0.005;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const canvasRect = canvas.getBoundingClientRect();
      if (
        e.clientX >= canvasRect.left &&
        e.clientX <= canvasRect.right &&
        e.clientY >= canvasRect.top &&
        e.clientY <= canvasRect.bottom
      ) {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        targetMouseX = ((e.touches[0].clientX - rect.left) / rect.width - 0.5) * 2;
        targetMouseY = ((e.touches[0].clientY - rect.top) / rect.height - 0.5) * 2;
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // 8. Responsive Viewport Handler
    const onResize = () => {
      if (!canvas || !renderer) return;
      const width = canvas.clientWidth || 520;
      const height = canvas.clientHeight || 520;
      camera.aspect = width / height;

      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

      if (isMobile) {
        camera.fov = 44;
        jewelleryGroup.scale.set(0.82, 0.82, 0.82);
      } else if (isTablet) {
        camera.fov = 40;
        jewelleryGroup.scale.set(0.9, 0.9, 0.9);
      } else {
        camera.fov = 37;
        jewelleryGroup.scale.set(1.0, 1.0, 1.0);
      }

      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    window.addEventListener('resize', onResize, { passive: true });
    onResize();

    // 9. Intersection Observer (Pause rendering when scrolled out of view)
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 10. Animation Loop: Smooth Scroll Choreography & Camera Arc
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsed = (performance.now() - startTime) * 0.001;

      // Smooth damping (lerp)
      currentScroll += (targetScroll - currentScroll) * 0.08;
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      const floatX = Math.sin(elapsed * 0.75) * 0.035;
      const floatY = Math.cos(elapsed * 1.05) * 0.05;

      if (!prefersReducedMotion) {
        // === SCROLL-DRIVEN 3D CINEMATICS ===
        // Rotation: Pirouettes gracefully across scroll
        const scrollRotY = 0.52 + currentScroll * Math.PI * 1.5;
        const scrollRotX = 0.48 - currentScroll * 0.36;
        const scrollRotZ = -0.16 + Math.sin(currentScroll * Math.PI) * 0.2;

        jewelleryGroup.rotation.y = scrollRotY + currentMouseX * 0.28 + dragDeltaX;
        jewelleryGroup.rotation.x = scrollRotX - currentMouseY * 0.2 + dragDeltaY;
        jewelleryGroup.rotation.z = scrollRotZ;

        // Position: Moves gracefully in depth with scroll
        jewelleryGroup.position.x = floatX + currentMouseX * 0.1;
        jewelleryGroup.position.y = -0.05 + floatY - currentScroll * 0.35;
        jewelleryGroup.position.z = -currentScroll * 0.22;

        // Camera: Glides in along an arc to reveal fine diamond prongs
        camera.position.z = 5.2 - currentScroll * 1.25;
        camera.position.y = -0.05 + currentScroll * 0.35;
        camera.lookAt(
          jewelleryGroup.position.x * 0.2,
          jewelleryGroup.position.y * 0.8,
          0
        );

        // Subtle Studio Lights Motion across scroll for dynamic gold gleams
        sparkleLight.position.x = 1.4 + Math.sin(currentScroll * Math.PI * 2) * 2.0;
        sparkleLight.position.y = 2.2 + Math.cos(currentScroll * Math.PI * 2) * 1.4;
        keyLight.position.x = -3.2 + currentScroll * 1.8;

        // Star Charm subtle sway
        starCharmGroup.rotation.z = Math.sin(elapsed * 1.6 + currentScroll * 3.5) * 0.12;
      } else {
        // Reduced Motion: Tranquil, stationary presentation
        jewelleryGroup.rotation.y = 0.52 + currentMouseX * 0.08;
        jewelleryGroup.rotation.x = 0.48 - currentMouseY * 0.08;
        jewelleryGroup.rotation.z = -0.16;
        jewelleryGroup.position.set(0.0, -0.05, 0);
        camera.position.set(0, 0, 5.2);
        camera.lookAt(0, -0.05, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Cleanup and Resource Disposal
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      if (pmremGenerator) pmremGenerator.dispose();
      if (envMapTexture) envMapTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[88vh] sm:min-h-[92vh] flex items-center overflow-hidden select-none bg-gradient-to-b from-[#FAF7F2] via-[#F7F2E8] to-[#FAF7F2]"
    >
      {/* Editorial Luxury Studio Ambient Glow (Warm Champagne Aura) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 right-[2%] sm:right-[8%] -translate-y-1/2 w-[420px] sm:w-[620px] h-[420px] sm:h-[620px] rounded-full bg-radial from-[#FCEFC7]/45 via-[#F8E7BE]/15 to-transparent blur-3xl opacity-80"></div>
        <div className="absolute top-1/4 left-[5%] w-[320px] h-[320px] rounded-full bg-radial from-[#FFF9EE]/80 to-transparent blur-2xl opacity-60"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 sm:py-8 lg:py-14 z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* ========================================================================= */}
          {/* LEFT HERO COLUMN: OFFICIAL LOGO + EDITORIAL COPY + CTA BUTTONS */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 text-center lg:text-left z-20 space-y-4 sm:space-y-6">
            
            {/* Atelier Pill Badge */}
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#9E7B31] font-medium font-sans inline-block mb-1 sm:mb-2 bg-[#FAF7F2]/90 px-3.5 py-1.5 rounded-full border border-[#C5A059]/35 shadow-2xs">
                Haute Jewellery Atelier
              </span>
            </div>

            {/* Official Sunbloom Adorn Logo (Replacing large text branding, naturally blending without white box) */}
            <div className="flex justify-center lg:justify-start">
              <img
                src="/logo.png"
                alt="Sunbloom Adorn — Haute Jewellery Atelier Official Logo"
                className="w-auto h-auto max-w-[240px] sm:max-w-[320px] xl:max-w-[380px] object-contain transition-transform duration-500 hover:scale-[1.02]"
                style={{ mixBlendMode: 'multiply' }}
                loading="eager"
                decoding="async"
              />
            </div>

            {/* Editorial Brand Description */}
            <p className="text-sm sm:text-base xl:text-lg text-[#5C5248] font-sans font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
              Where sunlight meets adornment. Discover handcrafted anti-tarnish fine jewellery rooted in Korean minimalist aesthetics.
            </p>

            {/* CTA Navigation Buttons (Preserved exactly with existing routes) */}
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
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#D1C7BA] hover:border-[#C5A059] text-[#1C1612] text-xs uppercase tracking-[0.18em] font-medium transition-all hover:bg-white/60"
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
                    to="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#D1C7BA] hover:border-[#C5A059] text-[#1C1612] text-xs uppercase tracking-[0.18em] font-medium transition-all hover:bg-white/60"
                  >
                    View Catalog
                  </Link>
                </>
              )}
            </div>

            {/* Scroll Indicator */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-3 text-[#8A7E72] opacity-75">
              <div className="w-3.5 h-6 rounded-full border border-[#8A7E72] p-0.5 flex justify-center">
                <div className="w-1 h-1.5 rounded-full bg-[#C5A059] animate-bounce"></div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-medium">
                Scroll to bloom
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT HERO COLUMN: 3D JEWELLERY EXPERIENCE (OR ACCESSIBLE FALLBACK) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center relative z-10 pointer-events-auto">
            {webGLSupported ? (
              <canvas
                ref={canvasRef}
                className="relative z-10 w-full max-w-[440px] sm:max-w-[500px] xl:max-w-[560px] aspect-square object-contain cursor-grab active:cursor-grabbing transition-transform duration-300"
                aria-label="Interactive 3D Sunbloom Adorn Fine Jewellery Display"
              />
            ) : (
              /* High-Resolution Static Visual Fallback if WebGL is disabled or unsupported */
              <div className="relative z-10 w-full max-w-[440px] sm:max-w-[500px] aspect-square flex items-center justify-center p-8">
                <img
                  src="/logo.png"
                  alt="Sunbloom Adorn Signature Creation"
                  className="w-full h-auto max-h-[360px] object-contain drop-shadow-[0_16px_36px_rgba(197,160,89,0.22)]"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default JewelleryHeroExperience;

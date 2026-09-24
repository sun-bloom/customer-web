// src/components/home/CinematicNecklaceExperience.tsx
// High-End 3D Luxury Jewellery Experience: Draped Haute Necklace Travelling Through Scroll
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Props {
  scrollProgress: number; // Normalized scroll progress 0.0 -> 1.0
}

interface Keyframe {
  p: number;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
  opacity: number;
}

// 7-Stage Choreography matching the homepage sections
const KEYFRAMES: Keyframe[] = [
  // 1. HERO (p=0.0): Necklace elegant & prominent on right
  { p: 0.0,  x: 1.15, y: 0.82,  z: 0.0,   rotX: 0.22, rotY: -0.30, rotZ: 0.06,  scale: 0.82, opacity: 1.0 },
  // 2. HERO EXIT -> VALUES (p=0.18): Begins diagonal descent toward center
  { p: 0.18, x: 0.45, y: 0.72,  z: -0.2,  rotX: 0.30, rotY: 0.18,  rotZ: -0.05, scale: 0.80, opacity: 1.0 },
  // 3. BRAND VALUES & STORY (p=0.35): Glides to left background, revealing craftsmanship
  { p: 0.35, x: -0.95, y: 0.62, z: -0.45, rotX: 0.35, rotY: 0.62,  rotZ: -0.14, scale: 0.76, opacity: 0.95 },
  // 4. CURATED CATEGORIES (p=0.52): Sweeps toward right background, framing categories
  { p: 0.52, x: 1.10, y: 0.65,  z: -0.65, rotX: 0.26, rotY: -0.45, rotZ: 0.16,  scale: 0.74, opacity: 0.92 },
  // 5. LATEST CREATIONS (p=0.70): Moves deeper into background, letting products shine
  { p: 0.70, x: -1.05, y: 0.40, z: -0.95, rotX: 0.42, rotY: 0.75, rotZ: -0.18, scale: 0.68, opacity: 0.85 },
  // 6. POPULAR / MANIFESTO (p=0.86): Returns center-stage with majestic pirouette
  { p: 0.86, x: 0.0,  y: 0.50,  z: -0.55, rotX: 0.24, rotY: 1.62,  rotZ: 0.0,   scale: 0.72, opacity: 0.80 },
  // 7. LOCATIONS & FOOTER (p=1.0): Gracefully descends and dissolves
  { p: 1.0,  x: 0.0,  y: -0.8,  z: -1.1,  rotX: 0.20, rotY: 1.95,  rotZ: 0.0,   scale: 0.50, opacity: 0.0 },
];

function interpolateKeyframes(p: number, isSmallScreen: boolean) {
  const clampedP = Math.max(0, Math.min(1, p));
  let i = 0;
  while (i < KEYFRAMES.length - 1 && KEYFRAMES[i + 1].p <= clampedP) {
    i++;
  }
  if (i >= KEYFRAMES.length - 1) return KEYFRAMES[KEYFRAMES.length - 1];

  const k1 = KEYFRAMES[i];
  const k2 = KEYFRAMES[i + 1];
  const t = (clampedP - k1.p) / (k2.p - k1.p);
  // Smooth cosine easing between keyframe waypoints
  const ease = (1 - Math.cos(t * Math.PI)) / 2;

  // On small screens (< 1024px, tablet & mobile), keep necklace centered and positioned below hero CTAs
  const xMult = isSmallScreen ? 0.0 : 1.0;
  const yShift = isSmallScreen ? -1.30 : 0.0;
  const scaleMult = isSmallScreen ? 0.56 : 1.0;

  return {
    x: (k1.x + (k2.x - k1.x) * ease) * xMult,
    y: (k1.y + (k2.y - k1.y) * ease) + yShift,
    z: k1.z + (k2.z - k1.z) * ease,
    rotX: k1.rotX + (k2.rotX - k1.rotX) * ease,
    rotY: k1.rotY + (k2.rotY - k1.rotY) * ease,
    rotZ: k1.rotZ + (k2.rotZ - k1.rotZ) * ease,
    scale: (k1.scale + (k2.scale - k1.scale) * ease) * scaleMult,
    opacity: k1.opacity + (k2.opacity - k1.opacity) * ease,
  };
}

export const CinematicNecklaceExperience: React.FC<Props> = ({ scrollProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  // Keep ref of latest scroll progress for 60fps render loop
  const scrollRef = useRef<number>(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5.4);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
    } catch {
      setWebGLSupported(false);
      return;
    }

    // 3. Multi-Point Studio Lighting Architecture
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.4);
    scene.add(ambientLight);

    // Key Light (Left-Front Studio Softbox)
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(-3.5, 4.5, 4.2);
    scene.add(keyLight);

    // Warm Atelier Gold Reflector (Right-Front)
    const fillLight = new THREE.DirectionalLight(0xf8dfa5, 2.6);
    fillLight.position.set(3.8, 2.2, 3.8);
    scene.add(fillLight);

    // Rim Backlight (Top-Rear Specular)
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.8);
    rimLight.position.set(0.0, 5.0, -3.0);
    scene.add(rimLight);

    // Dynamic Glint Accent Point Light (Tracks with necklace movement)
    const glintLight = new THREE.PointLight(0xfff1d6, 4.2, 16);
    glintLight.position.set(1.5, 1.8, 2.5);
    scene.add(glintLight);

    // 4. Luxury Materials (Physically Based Rendering)
    // 18K Yellow Gold
    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#E6C374'),
      emissive: new THREE.Color('#2C1B06'),
      metalness: 0.95,
      roughness: 0.12,
      clearcoat: 0.92,
      clearcoatRoughness: 0.05,
      reflectivity: 0.98,
    });

    // 18K Rose Gold Inset Accents
    const roseGoldMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#E8B692'),
      metalness: 0.92,
      roughness: 0.14,
      clearcoat: 0.8,
      clearcoatRoughness: 0.08,
    });

    // Faceted Diamond Solitaire (Sharp facet scintillation)
    const diamondMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFFFFF'),
      metalness: 0.04,
      roughness: 0.03,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      flatShading: true,
      specularIntensity: 1.0,
      specularColor: new THREE.Color('#FFFFFF'),
    });

    // Micro Pavé Accent Gems
    const paveGemMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFF8EE'),
      metalness: 0.02,
      roughness: 0.04,
      clearcoat: 0.9,
      clearcoatRoughness: 0.04,
      flatShading: true,
    });

    // 5. Sculpting the Haute Jewellery Necklace Ensemble
    const necklaceGroup = new THREE.Group();

    // A. Primary Draped Catenary Chain (Natural Hanging Arc)
    const mainChainCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.6, 1.9, -0.45),
      new THREE.Vector3(-1.8, 1.1, -0.18),
      new THREE.Vector3(-0.9, 0.22, 0.12),
      new THREE.Vector3(0.0, -0.68, 0.28), // Pendant Apex
      new THREE.Vector3(0.9, 0.22, 0.12),
      new THREE.Vector3(1.8, 1.1, -0.18),
      new THREE.Vector3(2.6, 1.9, -0.45),
    ]);
    const mainChainGeo = new THREE.TubeGeometry(mainChainCurve, 120, 0.042, 16, false);
    const mainChainMesh = new THREE.Mesh(mainChainGeo, goldMaterial);
    necklaceGroup.add(mainChainMesh);

    // B. Inner Choker Chain Arc (Layered Fine Jewellery Silhouette)
    const chokerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.0, 2.0, -0.35),
      new THREE.Vector3(-1.2, 1.15, -0.08),
      new THREE.Vector3(0.0, 0.22, 0.18),
      new THREE.Vector3(1.2, 1.15, -0.08),
      new THREE.Vector3(2.0, 2.0, -0.35),
    ]);
    const chokerGeo = new THREE.TubeGeometry(chokerCurve, 90, 0.026, 14, false);
    const chokerMesh = new THREE.Mesh(chokerGeo, roseGoldMaterial);
    necklaceGroup.add(chokerMesh);

    // C. Micro Golden Stations along the Main Chain (44 Delicate Faceted Beads)
    const beadCount = 44;
    const beadGeo = new THREE.SphereGeometry(0.038, 14, 14);
    for (let b = 0; b < beadCount; b++) {
      const t = b / (beadCount - 1);
      const pos = mainChainCurve.getPointAt(t);
      const bead = new THREE.Mesh(beadGeo, b % 3 === 0 ? roseGoldMaterial : goldMaterial);
      bead.position.copy(pos);
      necklaceGroup.add(bead);
    }

    // D. Choker Accent Gems (18 Micro Pavé Drops)
    const chokerGemCount = 18;
    const gemGeo = new THREE.OctahedronGeometry(0.034, 0);
    for (let g = 0; g < chokerGemCount; g++) {
      const t = (g + 0.5) / chokerGemCount;
      const pos = chokerCurve.getPointAt(t);
      const gem = new THREE.Mesh(gemGeo, diamondMaterial);
      gem.position.set(pos.x, pos.y - 0.04, pos.z + 0.02);
      necklaceGroup.add(gem);
    }

    // E. Central Sunbloom Medallion Pendant (At Apex of the Drape)
    const pendantGroup = new THREE.Group();
    pendantGroup.position.set(0.0, -0.68, 0.28);

    // 18K Gold Bail Loop Clasping the Chain
    const bailGeo = new THREE.TorusGeometry(0.085, 0.024, 14, 24);
    const bail = new THREE.Mesh(bailGeo, goldMaterial);
    bail.position.set(0.0, 0.08, 0.0);
    pendantGroup.add(bail);

    // Golden Bezel Base
    const bezelGeo = new THREE.CylinderGeometry(0.32, 0.22, 0.16, 24);
    const bezel = new THREE.Mesh(bezelGeo, goldMaterial);
    bezel.rotation.x = Math.PI / 2;
    pendantGroup.add(bezel);

    // 8 Sculpted Organic Blooming Petals (Official Sunbloom Flower Motif)
    const petalCount = 8;
    for (let p = 0; p < petalCount; p++) {
      const pAngle = (p / petalCount) * Math.PI * 2;
      const petalGeo = new THREE.SphereGeometry(0.125, 16, 16);
      petalGeo.scale(0.85, 1.75, 0.42);
      const petalMesh = new THREE.Mesh(petalGeo, goldMaterial);

      petalMesh.position.set(
        Math.cos(pAngle) * 0.32,
        Math.sin(pAngle) * 0.32,
        0.05
      );
      petalMesh.rotation.z = pAngle - Math.PI / 2;
      petalMesh.rotation.x = 0.22;
      pendantGroup.add(petalMesh);

      // Micro Pavé Accent Diamond in each petal tip
      const paveGeo = new THREE.SphereGeometry(0.03, 10, 10);
      const pave = new THREE.Mesh(paveGeo, paveGemMaterial);
      pave.position.set(
        Math.cos(pAngle) * 0.52,
        Math.sin(pAngle) * 0.52,
        0.12
      );
      pendantGroup.add(pave);
    }

    // Centerpiece Solitaire Diamond (Faceted Brilliant Cut)
    const crownGeo = new THREE.CylinderGeometry(0.22, 0.30, 0.15, 14, 1);
    const crown = new THREE.Mesh(crownGeo, diamondMaterial);
    crown.position.set(0, 0, 0.16);
    crown.rotation.x = Math.PI / 2;
    pendantGroup.add(crown);

    const pavilionGeo = new THREE.ConeGeometry(0.30, 0.30, 14);
    pavilionGeo.rotateX(Math.PI);
    const pavilion = new THREE.Mesh(pavilionGeo, diamondMaterial);
    pavilion.position.set(0, 0, 0.01);
    pendantGroup.add(pavilion);

    // 6 Cathedral Filigree Prongs
    for (let pr = 0; pr < 6; pr++) {
      const prAngle = (pr / 6) * Math.PI * 2;
      const prongGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.24, 10);
      const prong = new THREE.Mesh(prongGeo, goldMaterial);
      prong.position.set(
        Math.cos(prAngle) * 0.27,
        Math.sin(prAngle) * 0.27,
        0.13
      );
      prong.rotation.x = Math.PI / 2;
      pendantGroup.add(prong);
    }

    // F. Suspended Teardrop Briolette & Star Charm (Dynamic pendulum sway)
    const dropGroup = new THREE.Group();
    dropGroup.position.set(0.0, -0.42, 0.02);

    // Connector link ring
    const dropLinkGeo = new THREE.TorusGeometry(0.055, 0.015, 12, 20);
    const dropLink = new THREE.Mesh(dropLinkGeo, goldMaterial);
    dropGroup.add(dropLink);

    // Faceted Marquise/Briolette Diamond Drop
    const dropGeo = new THREE.ConeGeometry(0.18, 0.44, 12);
    dropGeo.rotateX(Math.PI);
    const dropMesh = new THREE.Mesh(dropGeo, diamondMaterial);
    dropMesh.position.set(0, -0.25, 0);
    dropGroup.add(dropMesh);

    // 4-Pointed Golden Star Accent
    const starGeo = new THREE.OctahedronGeometry(0.12, 0);
    starGeo.scale(0.8, 1.4, 0.4);
    const starMesh = new THREE.Mesh(starGeo, goldMaterial);
    starMesh.position.set(0, -0.52, 0);
    dropGroup.add(starMesh);

    pendantGroup.add(dropGroup);
    necklaceGroup.add(pendantGroup);

    // Initial Position (Section 1 - Hero right)
    necklaceGroup.position.set(1.15, -0.05, 0.0);
    necklaceGroup.rotation.set(0.22, -0.32, 0.06);
    necklaceGroup.scale.set(1.05, 1.05, 1.05);
    scene.add(necklaceGroup);

    // 6. Interactive Parallax & Inertia State
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // 7. Responsive Viewport Handler
    const onResize = () => {
      if (!canvas || !renderer) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    window.addEventListener('resize', onResize, { passive: true });
    onResize();

    // 8. 60 FPS Render Loop with Smooth Damped Interpolation
    let animId: number;
    const startTime = performance.now();
    let currentP = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsed = (performance.now() - startTime) * 0.001;
      const targetP = scrollRef.current;
      const isSmallScreen = window.innerWidth < 1024;

      // Silky smooth damping lerp (0.08 factor)
      currentP += (targetP - currentP) * 0.08;
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      // Natural idle micro-floating physics
      const floatY = Math.sin(elapsed * 1.1) * 0.035;
      const floatRotZ = Math.cos(elapsed * 0.9) * 0.02;

      // Teardrop pendant pendulum sway
      dropGroup.rotation.z = Math.sin(elapsed * 1.6 + currentP * 8.0) * 0.08;

      if (!prefersReducedMotion) {
        // Compute interpolated keyframe transformation
        const kf = interpolateKeyframes(currentP, isSmallScreen);

        // Position: travels across viewport according to scroll choreography
        necklaceGroup.position.x = kf.x + currentMouseX * 0.12;
        necklaceGroup.position.y = kf.y + floatY - currentMouseY * 0.08;
        necklaceGroup.position.z = kf.z;

        // Rotation: responds continuously to scroll + parallax
        necklaceGroup.rotation.x = kf.rotX - currentMouseY * 0.14;
        necklaceGroup.rotation.y = kf.rotY + currentMouseX * 0.22;
        necklaceGroup.rotation.z = kf.rotZ + floatRotZ;

        // Scale
        necklaceGroup.scale.set(kf.scale, kf.scale, kf.scale);

        // Dynamic Glint Light Tracking
        glintLight.position.x = necklaceGroup.position.x + 0.8;
        glintLight.position.y = necklaceGroup.position.y + 1.2;

        // Container opacity fade-out at bottom
        if (containerRef.current) {
          containerRef.current.style.opacity = String(kf.opacity);
        }
      } else {
        // Reduced motion: static presentation respecting user preference
        const s = isSmallScreen ? 0.56 : 0.88;
        necklaceGroup.position.set(isSmallScreen ? 0.0 : 1.15, isSmallScreen ? -0.85 : 0.52, 0.0);
        necklaceGroup.rotation.set(0.22, -0.30, 0.06);
        necklaceGroup.scale.set(s, s, s);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup and Resource Disposal
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
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
      renderer.dispose();
    };
  }, []);

  if (!webGLSupported) {
    return (
      <div className="fixed top-24 right-8 w-80 h-80 pointer-events-none z-10 opacity-70 hidden lg:block">
        <img
          src="/logo.png"
          alt="Sunbloom Adorn Fine Jewellery"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden transition-opacity duration-500"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default CinematicNecklaceExperience;

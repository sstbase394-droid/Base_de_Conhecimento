'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export interface Interactive3DHeroProps {
  className?: string;
}

/**
 * Interactive3DHero: Componente 3D WebGL de alto desempenho (Three.js) com:
 * - Scroll Scrubbing 360º atrelado à timeline GSAP ScrollTrigger (`scrub: 1`).
 * - Mouse Parallax / Magnetic Tilt sutil que reage suavemente à posição do cursor.
 * - Geometria de Icosaedro / Escultura refrativa com iluminação dinâmica multicores
 *   (combinando com as variáveis CSS de mesh gradient do projeto).
 * - Otimização de performance: pausa quando fora de vista, renderiza via requestAnimationFrame,
 *   limpeza total de WebGL textures/geometries e respeito a `prefers-reduced-motion`.
 */
export function Interactive3DHero({ className = '' }: Interactive3DHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Checagem de preferência de movimento reduzido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Configuração de Cena, Câmera e Renderer Three.js
    const scene = new THREE.Scene();

    const fov = 45;
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Grupo central para conter os objetos 3D
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Núcleo Interno (Icosaedro com relevo)
    const coreGeometry = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a243b,
      metalness: 0.15,
      roughness: 0.1,
      transmission: 0.75, // Efeito vidro/acrílico transparente
      thickness: 1.2,
      ior: 1.5,
      transparent: true,
      opacity: 0.95,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    mainGroup.add(coreMesh);

    // 2. Anéis Orbitais Refrativos (Wireframe / Grid orbital sofisticado)
    const ringGeo = new THREE.TorusGeometry(2.35, 0.025, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Sky blue
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.9,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.65, 0.02, 16, 100),
      new THREE.MeshStandardMaterial({
        color: 0xa855f7, // Purple glow
        emissive: 0x7e22ce,
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.8,
      })
    );
    ring2.rotation.y = Math.PI / 4;
    mainGroup.add(ring2);

    // 3. Nuvem de partículas de dados (Constelação de pontos)
    const particlesCount = 120;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      const radius = 2.8 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.045,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const pointsMesh = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(pointsMesh);

    // Iluminação sofisticada (Ambient + Directional lights com cores corporativas premium)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLightCyan = new THREE.PointLight(0x38bdf8, 3, 20);
    pointLightCyan.position.set(5, 4, 4);
    scene.add(pointLightCyan);

    const pointLightPurple = new THREE.PointLight(0xa855f7, 2.5, 20);
    pointLightPurple.position.set(-5, -4, -2);
    scene.add(pointLightPurple);

    // Física de Mouse Parallax / Tilt Suave
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouse.targetX = (e.clientX / innerWidth - 0.5) * 1.2;
      mouse.targetY = (e.clientY / innerHeight - 0.5) * 1.2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Registro do ScrollTrigger do GSAP para Scroll Scrubbing 360º
    gsap.registerPlugin(ScrollTrigger);

    let scrollTriggerInstance: ScrollTrigger | null = null;

    if (!prefersReducedMotion) {
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        onUpdate: (self) => {
          const progress = self.progress;
          // Rotação 360º ao longo do scroll da página
          mainGroup.rotation.y = progress * Math.PI * 4;
          mainGroup.rotation.x = progress * Math.PI * 2;
          mainGroup.rotation.z = Math.sin(progress * Math.PI) * 0.5;

          // Transição sutil de escala e profundidade conforme a leitura avança
          mainGroup.position.y = -progress * 1.2;
          mainGroup.scale.setScalar(1 + Math.sin(progress * Math.PI) * 0.2);
        },
      });
    }

    // Resize Handler
    const onResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // Loop de Renderização 60fps
    let animationFrameId: number;
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Interpolação suave do mouse (Tilt magnético)
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      if (prefersReducedMotion) {
        // Movimento estático com apenas leve rotação sutil e elegante
        mainGroup.rotation.y = elapsedTime * 0.1;
      } else {
        // Animação contínua idle combinada com o mouse tilt
        ring1.rotation.z = elapsedTime * 0.25;
        ring2.rotation.z = -elapsedTime * 0.2;
        pointsMesh.rotation.y = elapsedTime * 0.08;

        mainGroup.position.x = mouse.x * 0.5;
        mainGroup.position.y += (mouse.y * -0.4 - mainGroup.position.y) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      scrollTriggerInstance?.kill();

      // Limpeza de recursos Three.js da GPU
      coreGeometry.dispose();
      coreMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { HeroSearch } from "@/components/home/hero-search";
import { useLenis } from "@/components/providers/smooth-scroll";

// Pinned scroll distance for the exact travelnextlvl.de water door opening & camera zoom
const HERO_SCROLL_VH = 280;

interface DestinationCard {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  tag: string;
  href: string;
  rating: number;
}

interface ArticleCard {
  id: string;
  title: string;
  category: string;
  readTime: string;
  image: string;
  href: string;
}

const DESTINATION_CARDS: DestinationCard[] = [
  {
    id: "duomo-dome",
    title: "DUOMO & DOME CLIMB",
    subtitle: "Brunelleschi's masterpiece, panoramic terrace & crypt",
    category: "ICONIC LANDMARK",
    image: "/images/hero2-duomo-vertical.jpg",
    tag: "BESTSELLER",
    href: "/experiences/duomo-and-brunelleschis-dome-climb",
    rating: 4.96,
  },
  {
    id: "uffizi-gallery",
    title: "UFFIZI GALLERY",
    subtitle: "Botticelli's Birth of Venus & Da Vinci masterworks",
    category: "MUSEUM & ART",
    image: "/images/hero2-uffizi-corridor.jpg",
    tag: "SKIP-THE-LINE",
    href: "/experiences/uffizi-gallery-skip-the-line-ticket",
    rating: 4.94,
  },
  {
    id: "chianti-wine",
    title: "CHIANTI HILLS WINE",
    subtitle: "Cellar tasting, vineyard lunch & medieval San Gimignano",
    category: "DAY TRIP & WINE",
    image: "/images/hero2-chianti-wine.jpg",
    tag: "TOP RATED",
    href: "/experiences/chianti-countryside-and-wine-tasting-day-trip",
    rating: 4.98,
  },
  {
    id: "accademia-david",
    title: "ACCADEMIA & DAVID",
    subtitle: "Michelangelo's original David & unfinished Slaves",
    category: "MUSEUM & ART",
    image: "/images/accademia-david.jpg",
    tag: "OFFICIAL ACCESS",
    href: "/experiences/accademia-gallery-michelangelos-david-ticket",
    rating: 4.95,
  },
  {
    id: "tuscan-cooking",
    title: "TUSCAN COOKING CLASS",
    subtitle: "Central Market food walk, fresh pasta & tiramisù",
    category: "CULINARY & TASTING",
    image: "/images/hero2-guided-tour.jpg",
    tag: "HANDS-ON",
    href: "/experiences/florentine-cooking-class-with-market-visit",
    rating: 4.97,
  },
  {
    id: "florence-panorama",
    title: "PANORAMIC ARNO & HILLS",
    subtitle: "Piazzale Michelangelo sunset, San Miniato & gardens",
    category: "VIEWPOINTS",
    image: "/images/hero2-florence-panorama.jpg",
    tag: "SCENIC",
    href: "/experiences/pisa-and-lucca-day-trip-with-wine-tasting",
    rating: 4.92,
  },
];

const LATEST_ARTICLES: ArticleCard[] = [
  {
    id: "art-1",
    title: "How to Skip 3-Hour Queues at the Uffizi & Duomo in 2026",
    category: "INSIDER GUIDE",
    readTime: "4 min read",
    image: "/images/hero2-uffizi-corridor.jpg",
    href: "/blog/skip-the-line-florence-guide",
  },
  {
    id: "art-2",
    title: "The 7 Best Rooftop Terraces with Unobstructed Cathedral Views",
    category: "FLORENCE STAYS",
    readTime: "6 min read",
    image: "/images/hero2-duomo-terrace.jpg",
    href: "/blog/florence-best-rooftop-views",
  },
  {
    id: "art-3",
    title: "A Wine Lover's Guide to Chianti Classico & Bolgheri Super Tuscans",
    category: "WINE & DINE",
    readTime: "5 min read",
    image: "/images/hero2-chianti-wine.jpg",
    href: "/blog/chianti-wine-tasting-secrets",
  },
  {
    id: "art-4",
    title: "Early Morning in Oltrarno: Artisans, Espresso, & Renaissance Alleys",
    category: "CULTURE & WALKS",
    readTime: "5 min read",
    image: "/images/hero2-florence-panorama.jpg",
    href: "/blog/oltrarno-neighborhood-guide",
  },
];

export function HeroV2() {
  const [activeTab, setActiveTab] = useState<"tours" | "tickets" | "wine">("tours");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Scroll Progress Engine (0.0 to 1.0)
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const heroBoundsRef = useRef({ top: 0, scrollRange: 1 });
  const [heroProgress, setHeroProgress] = useState(0);

  const measureHeroBounds = useCallback(() => {
    const el = heroWrapperRef.current;
    if (!el) return;
    const viewportHeight = window.innerHeight;
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    heroBoundsRef.current = {
      top: rect.top + scrollTop,
      scrollRange: Math.max(el.offsetHeight - viewportHeight, 1),
    };
  }, []);

  const updateProgressWithScroll = useCallback((scrollY: number) => {
    const { top, scrollRange } = heroBoundsRef.current;
    const progress = Math.min(Math.max((scrollY - top) / scrollRange, 0), 1);
    setHeroProgress(progress);
  }, []);

  useEffect(() => {
    measureHeroBounds();
    const handleNativeScroll = () => {
      updateProgressWithScroll(window.pageYOffset || document.documentElement.scrollTop);
    };
    window.addEventListener("scroll", handleNativeScroll, { passive: true });
    window.addEventListener("resize", measureHeroBounds);
    return () => {
      window.removeEventListener("scroll", handleNativeScroll);
      window.removeEventListener("resize", measureHeroBounds);
    };
  }, [measureHeroBounds, updateProgressWithScroll]);

  // Lenis hook integration
  const handleLenisScroll = useCallback(
    (instance: { scroll: number }) => {
      updateProgressWithScroll(instance.scroll);
    },
    [updateProgressWithScroll]
  );
  useLenis(handleLenisScroll);

  // ---------------------------------------------------------------------------
  // EXACT TRAVELNEXTLVL.DE WATER DOOR ANIMATION MECHANICS:
  // ---------------------------------------------------------------------------
  // 1. Door opening angle: swings from 0deg (closed) to -105deg (inwards to the right)
  const doorOpenProgress = Math.min(Math.max(heroProgress / 0.45, 0), 1);
  const easedDoorProgress = 1 - Math.pow(1 - doorOpenProgress, 2.5);
  const doorAngle = easedDoorProgress * -105;

  // 2. Camera zoom & plunge through the open door aperture (from distant background to full screen)
  const zoomProgress = Math.min(Math.max((heroProgress - 0.35) / 0.65, 0), 1);
  const easedZoomProgress = Math.pow(zoomProgress, 1.9);
  // Starts smaller/further back (0.82x) and zooms deeply to 4.6x
  const portalScale = 0.82 + easedZoomProgress * 3.8;
  const portalTranslateY = easedZoomProgress * 110;

  // 3. Inner World scale & light bloom
  const innerWorldScale = 1.05 + easedZoomProgress * 0.45;
  const innerGlowOpacity = Math.sin(doorOpenProgress * Math.PI) * 0.75 + (zoomProgress * 0.45);

  // 4. Headline transitions matching travelnextlvl.de
  // Phase 1 (0% -> 25%): "Step Into a World of Discoveries"
  const phase1Opacity = Math.max(0, 1 - heroProgress / 0.22);
  const phase1TranslateY = -heroProgress * 45;

  // Phase 2 (25% -> 60%): "A Window to Enchanting Destinations"
  const phase2Progress = Math.min(Math.max((heroProgress - 0.22) / 0.35, 0), 1);
  const phase2Opacity = Math.sin(phase2Progress * Math.PI);
  const phase2TranslateY = (1 - phase2Progress) * 25;

  // Phase 3 (60% -> 90%): "Travel to Iconic Florence Landmarks"
  const phase3Progress = Math.min(Math.max((heroProgress - 0.60) / 0.35, 0), 1);
  const phase3Opacity = Math.sin(phase3Progress * Math.PI);
  const phase3TranslateY = (1 - phase3Progress) * 25;

  // Floating bottom-right card fades as scroll begins
  const floatingCardOpacity = Math.max(0, 1 - heroProgress / 0.20);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#f2f5f8] text-[#111827] min-h-screen selection:bg-[#111827] selection:text-white">
      {/* 1. Hero Surreal Water Door Section — pinned stage matching travelnextlvl.de */}
      <div ref={heroWrapperRef} className="relative" style={{ height: `${HERO_SCROLL_VH}vh` }}>
        <section className="sticky top-0 h-[100dvh] min-h-[640px] max-h-[960px] w-full flex flex-col justify-between overflow-hidden bg-[#78b3d6]">
          
          {/* ================================================================= */}
          {/* SURREAL OCEAN ENVIRONMENT + 3D OPENING DOORWAY */}
          {/* ================================================================= */}
          <div className="absolute inset-0 z-0 select-none overflow-hidden flex items-center justify-center">
            
            {/* Background Base: Calm Turquoise Ocean Water & Sky */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/hero2-water-sky.jpg"
                alt="Calm turquoise ocean water reflecting sky"
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#02131e]/25 via-transparent to-black/15 pointer-events-none" />
            </div>

            {/* Portal Master Scaling Stage (Set further back, zooms and pushes through on scroll) */}
            <div
              className="relative w-full h-full flex items-center justify-center will-change-transform pointer-events-none"
              style={{
                transform: `scale(${portalScale}) translate3d(0, ${portalTranslateY}px, 0)`,
                transformOrigin: "50% 50%",
                transition: "transform 0.05s linear",
              }}
            >
              
              {/* Central White Door Frame (Set deeply back on the horizon with elegant proportions) */}
              <div className="relative w-[180px] sm:w-[220px] md:w-[270px] lg:w-[310px] h-[310px] sm:h-[380px] md:h-[460px] lg:h-[530px] mb-4 sm:mb-6">
                
                {/* 1. Dynamic Water Reflection Underneath */}
                <div
                  className="absolute -bottom-[38%] left-1/2 -translate-x-1/2 w-[94%] h-[44%] overflow-hidden opacity-50 pointer-events-none filter blur-[1px]"
                  style={{
                    transform: "scaleY(-1) skewX(2deg)",
                    maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent 75%)",
                    WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent 75%)",
                  }}
                >
                  <div className="relative w-full h-full rounded-t-[160px] bg-gradient-to-b from-white via-[#e8f1f8] to-[#92bedb] opacity-70" />
                </div>

                {/* 2. Inner Portal World (Sunlit Florence Duomo & Tuscan Morning) */}
                {/* Visible through the arched cutout as the door opens */}
                <div className="absolute inset-0 rounded-t-[160px] sm:rounded-t-[190px] overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.45)] z-10 bg-[#160c07]">
                  <div
                    className="relative w-full h-full will-change-transform"
                    style={{
                      transform: `scale(${innerWorldScale})`,
                      transformOrigin: "center center",
                    }}
                  >
                    <Image
                      src="/images/hero2-florence-inner.jpg"
                      alt="Florence Duomo golden sunrise inner world"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-[52%_45%]"
                      priority
                    />

                    {/* Sunburst Rays pouring through opening door */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                      style={{
                        opacity: innerGlowOpacity,
                        background:
                          "radial-gradient(circle at 50% 40%, rgba(255,235,180,0.65) 0%, rgba(255,195,115,0.25) 45%, transparent 75%)",
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-amber-950/40 via-transparent to-black/15 pointer-events-none" />
                  </div>
                </div>

                {/* 3. The 3D Hinged Door Leaf (Swings Open in 3D Perspective) */}
                <div
                  className="absolute inset-0 z-20"
                  style={{
                    perspective: "1800px",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    className="relative w-full h-full rounded-t-[160px] sm:rounded-t-[190px] origin-right will-change-transform"
                    style={{
                      transform: `rotateY(${doorAngle}deg)`,
                      transformOrigin: "100% 50%",
                      transformStyle: "preserve-3d",
                      boxShadow: doorAngle < -5 ? "-15px 10px 40px rgba(0,0,0,0.45)" : "none",
                    }}
                  >
                    {/* Front Face: Classical White Architectural Door Panels */}
                    <div className="absolute inset-0 rounded-t-[160px] sm:rounded-t-[190px] bg-gradient-to-br from-[#ffffff] via-[#f7f8fa] to-[#e6e9ee] border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center overflow-hidden p-4 sm:p-6">
                      
                      {/* Classical Inset Panel Molding */}
                      <div className="w-full h-full rounded-t-[140px] sm:rounded-t-[160px] border-[5px] border-[#eaedf2] shadow-[inset_0_4px_14px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between p-3 sm:p-4 bg-white/70">
                        
                        {/* Upper Arched Decorative Panel with Giglio */}
                        <div className="w-full h-[42%] rounded-t-[120px] sm:rounded-t-[140px] border-2 border-[#dde2e8] bg-gradient-to-b from-white/90 to-[#f0f3f6]/80 flex items-center justify-center shadow-inner">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-700/60 font-serif italic text-[10px]">
                            ⚜
                          </div>
                        </div>

                        {/* Lower Rectangular Molding Panels */}
                        <div className="w-full h-[50%] grid grid-rows-2 gap-2">
                          <div className="w-full h-full rounded border-2 border-[#dde2e8] bg-gradient-to-b from-white/90 to-[#f0f3f6]/80 shadow-inner" />
                          <div className="w-full h-full rounded border-2 border-[#dde2e8] bg-gradient-to-b from-white/90 to-[#f0f3f6]/80 shadow-inner" />
                        </div>
                      </div>

                      {/* Brass Classical Door Lever / Handle (Left side of door) */}
                      <div className="absolute left-4 sm:left-6 top-[54%] -translate-y-1/2 flex items-center space-x-0.5 z-30">
                        <div className="w-3 h-5 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 rounded-sm shadow-md" />
                        <div className="w-6 h-2 bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.3)] transform -rotate-6" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Exterior Classical White Frame */}
                <div className="absolute -inset-3 sm:-inset-4 md:-inset-5 pointer-events-none z-30 flex items-center justify-center">
                  <div className="w-full h-full rounded-t-[180px] sm:rounded-t-[220px] border-[10px] sm:border-[14px] md:border-[16px] border-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.22),inset_0_2px_10px_rgba(255,255,255,0.8)] bg-transparent" />
                </div>

                {/* Architectural Keystone Crest */}
                <div className="absolute -top-2.5 sm:-top-3.5 left-1/2 -translate-x-1/2 z-40 bg-white px-2.5 sm:px-3 py-1 rounded-full shadow-md border border-slate-200 flex items-center space-x-1 pointer-events-none">
                  <span className="text-amber-700 font-serif text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">
                    VACAY • FLORENCE
                  </span>
                </div>

                {/* Door Base Threshold resting on the calm water surface */}
                <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 w-[112%] h-3 sm:h-4 bg-gradient-to-b from-white via-[#f0f2f5] to-[#cdd5de] rounded shadow-xl border-t border-white z-40 pointer-events-none" />

              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* TOP MINIMALIST BAR (Exact travelnextlvl.de layout) */}
          {/* ================================================================= */}
          <div className="relative z-30 pt-20 sm:pt-24 px-6 sm:px-12 flex items-center justify-between">
            {/* Left Brand Identity */}
            <div className="text-white drop-shadow-md select-none">
              <span className="block text-[11px] font-bold tracking-[0.25em] uppercase opacity-80 leading-none">
                TRAVEL
              </span>
              <span className="block text-sm font-black tracking-[0.18em] uppercase leading-tight">
                NEXT LEVEL
              </span>
            </div>

            {/* Center Floating Switcher Pill */}
            <div className="hidden md:flex items-center p-1 bg-white/25 backdrop-blur-xl rounded-full border border-white/40 shadow-lg text-white">
              <button
                onClick={() => setActiveTab("tours")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "tours" ? "bg-white text-[#111827] shadow-md" : "hover:bg-white/10"
                }`}
              >
                <span>✈️</span> Tours
              </button>
              <button
                onClick={() => setActiveTab("tickets")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "tickets" ? "bg-white text-[#111827] shadow-md" : "hover:bg-white/10"
                }`}
              >
                <span>🏛️</span> Tickets
              </button>
              <button
                onClick={() => setActiveTab("wine")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === "wine" ? "bg-white text-[#111827] shadow-md" : "hover:bg-white/10"
                }`}
              >
                <span>🍷</span> Wine
              </button>
            </div>

            {/* Right Action Quick Search Trigger */}
            <div className="flex items-center gap-4 text-white">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/35 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                  <circle cx="11" cy="11" r="7.5" />
                  <line x1="16.5" y1="16.5" x2="21.5" y2="21.5" strokeLinecap="round" />
                </svg>
                <span>SEARCH</span>
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* MULTI-STAGE EDITORIAL HEADLINES (Exact travelnextlvl.de text steps) */}
          {/* ================================================================= */}
          <Container className="relative z-30 my-auto py-4 pointer-events-none">
            <div className="max-w-2xl text-white">
              
              {/* STAGE 1: Closed Door Headline (0% -> 25% scroll) */}
              <div
                className="will-change-transform"
                style={{
                  opacity: phase1Opacity,
                  transform: `translate3d(0, ${phase1TranslateY}px, 0)`,
                  display: phase1Opacity <= 0.01 ? "none" : "block",
                }}
              >
                <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.02] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                  Step Into a World of
                  <br />
                  <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-[#faeedd] to-amber-200">
                    Discoveries
                  </span>
                </h1>

                <p className="mt-4 sm:mt-6 max-w-lg text-xs sm:text-sm md:text-[14.5px] font-normal leading-relaxed text-white/90 drop-shadow-md">
                  Unique travel experiences await to spark curiosity and inspire your next adventure. At Vacay in Florence, we uncover hidden gems around Tuscany, including enchanting historical sights and offbeat destinations.
                </p>

                <div className="mt-6 sm:mt-8 pointer-events-auto">
                  <a
                    href="#destinations"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-xs sm:text-sm font-bold text-[#111827] shadow-[0_10px_25px_rgba(0,0,0,0.25)] transition-all duration-200 hover:bg-[#faeedd] hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                  >
                    <span>Explore Now</span>
                    <span>→</span>
                  </a>
                </div>
              </div>

              {/* STAGE 2: Door Swung Open Headline (25% -> 60% scroll) */}
              <div
                className="will-change-transform"
                style={{
                  opacity: phase2Opacity,
                  transform: `translate3d(0, ${phase2TranslateY}px, 0)`,
                  display: phase2Opacity <= 0.02 ? "none" : "block",
                }}
              >
                <div className="inline-block px-3.5 py-1 mb-3 rounded-full bg-white/20 backdrop-blur text-[11px] font-bold tracking-wider text-amber-200 uppercase border border-white/30 shadow-sm">
                  ✨ The Renaissance Unlocked
                </div>
                <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.02] tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
                  A Window to
                  <br />
                  <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-[#faeedd] to-amber-200">
                    Enchanting Destinations
                  </span>
                </h2>
                <p className="mt-4 text-xs sm:text-sm md:text-[14.5px] font-normal leading-relaxed text-white/90 drop-shadow-md max-w-lg">
                  Where Brunelleschi&apos;s dome rises above golden rooftops and timeless Tuscan hills.
                </p>
              </div>

              {/* STAGE 3: Camera Zoom Push Headline (60% -> 90% scroll) */}
              <div
                className="will-change-transform"
                style={{
                  opacity: phase3Opacity,
                  transform: `translate3d(0, ${phase3TranslateY}px, 0)`,
                  display: phase3Opacity <= 0.02 ? "none" : "block",
                }}
              >
                <div className="inline-block px-3.5 py-1 mb-3 rounded-full bg-white/20 backdrop-blur text-[11px] font-bold tracking-wider text-emerald-200 uppercase border border-white/30 shadow-sm">
                  🏛️ Welcome to Florence
                </div>
                <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.02] tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
                  Travel to Iconic Landmarks
                  <br />
                  <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-[#faeedd] to-amber-200">
                    Where Art Meets History
                  </span>
                </h2>
                <p className="mt-4 text-xs sm:text-sm md:text-[14.5px] font-normal leading-relaxed text-white/90 drop-shadow-md max-w-lg">
                  Curated skip-the-line admissions, private Duomo terraces, and Chianti wine tours.
                </p>
              </div>

            </div>
          </Container>

          {/* ================================================================= */}
          {/* FLOATING BOTTOM RIGHT FEATURE CARD (Exact travelnextlvl.de widget) */}
          {/* ================================================================= */}
          <div
            className="relative z-30 px-6 sm:px-12 pb-8 flex justify-end will-change-transform transition-opacity pointer-events-auto"
            style={{ opacity: floatingCardOpacity }}
          >
            <Link
              href="/experiences/duomo-and-brunelleschis-dome-climb"
              className="group flex items-center gap-3.5 p-2 sm:p-2.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_15px_35px_rgba(0,0,0,0.15)] max-w-sm transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
            >
              <div className="relative h-16 w-20 sm:h-20 sm:w-24 rounded-xl overflow-hidden shrink-0">
                <Image
                  src="/images/hero2-duomo-terrace.jpg"
                  alt="Duomo Rooftop Terraces"
                  fill
                  sizes="100px"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="min-w-0 flex-1 pr-2">
                <h4 className="text-xs sm:text-[13px] font-bold text-[#111827] group-hover:text-amber-700 transition-colors leading-snug truncate">
                  10 Luxurious Florence Experiences
                </h4>
                <span className="text-[11px] font-bold underline decoration-1 text-[#111827] block mt-0.5">
                  Read more &rarr;
                </span>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Curated Guides &bull; Spring 2026
                </p>
              </div>
            </Link>
          </div>

        </section>
      </div>

      {/* ===================================================================== */}
      {/* 2. HORIZONTAL DESTINATION SLIDER (Exact travelnextlvl.de slider) */}
      {/* ===================================================================== */}
      <section id="destinations" className="pt-10 sm:pt-14 pb-12 sm:pb-16 overflow-hidden bg-[#f2f5f8]">
        <Container>
          {/* Header & Controls */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 block">
                ICONIC DESTINATIONS
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-normal text-[#111827] mt-0.5">
                Top Experiences in Florence &amp; Tuscany
              </h2>
            </div>

            {/* Slider Navigation */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mr-2">
                DRAG TO NAVIGATE
              </span>
              <button
                onClick={() => scrollSlider("left")}
                aria-label="Previous"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-neutral-200 shadow-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                &larr;
              </button>
              <button
                onClick={() => scrollSlider("right")}
                aria-label="Next"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-neutral-200 shadow-sm text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Deck */}
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {DESTINATION_CARDS.map((dest) => (
              <Link
                key={dest.id}
                href={dest.href}
                className="group relative h-[380px] sm:h-[420px] w-[280px] sm:w-[320px] shrink-0 rounded-3xl overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.08)] bg-neutral-900 snap-start transition-all duration-300 hover:shadow-[0_20px_45px_rgba(0,0,0,0.18)] hover:-translate-y-1 flex flex-col justify-between p-5"
              >
                <Image
                  src={dest.image}
                  alt={dest.title}
                  fill
                  sizes="(max-width: 768px) 80vw, 320px"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

                {/* Top Badge Title */}
                <div className="relative z-10">
                  <span className="font-display text-sm font-bold tracking-wider uppercase text-white drop-shadow-md">
                    {dest.title}
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="relative z-10 flex items-end justify-between text-white">
                  <div>
                    <span className="text-xs text-white/80 block">{dest.subtitle}</span>
                    <span className="text-sm font-bold text-amber-300 mt-0.5 block">
                      ★ {dest.rating} &bull; {dest.tag}
                    </span>
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 transition-all group-hover:bg-white group-hover:text-[#111827]">
                    &rarr;
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ===================================================================== */}
      {/* 3. LATEST EXPERIENCES & ARTICLES (Exact travelnextlvl.de grid) */}
      {/* ===================================================================== */}
      <section className="pt-6 pb-16 bg-white border-t border-slate-200/70">
        <Container>
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#111827]">
              Latest articles &amp; experiences
            </h2>
            <Link
              href="/blog"
              className="text-xs sm:text-sm font-bold text-[#111827] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {LATEST_ARTICLES.map((article) => (
              <Link
                key={article.id}
                href={article.href}
                className="group flex flex-col justify-between bg-white rounded-3xl overflow-hidden p-3.5 border border-neutral-200/80 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="relative h-48 w-full rounded-2xl overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                    {article.category}
                  </div>
                </div>

                <div className="pt-3.5 pb-1 flex flex-col justify-between flex-1">
                  <h3 className="text-sm font-bold text-[#111827] group-hover:text-amber-800 transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#111827]">
                    <span className="underline decoration-1">Read more</span>
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ===================================================================== */}
      {/* 4. SEARCH MODAL POPUP */}
      {/* ===================================================================== */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                  SEARCH FLORENCE
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-slate-900">
                  Find Tours, Tickets & Guides
                </h3>
              </div>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <HeroSearch />
          </div>
        </div>
      )}
    </div>
  );
}

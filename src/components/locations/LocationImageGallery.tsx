import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  X, 
  Camera, 
  Check, 
  ZoomIn, 
  ZoomOut,
  Sparkles
} from 'lucide-react';

interface LocationImageGalleryProps {
  images: string[];
  locationTitle: string;
  categoryName?: string;
  district?: string;
  aspectRatio?: 'video' | 'cinema' | 'square';
  className?: string;
}

export const LocationImageGallery: React.FC<LocationImageGalleryProps> = ({
  images,
  locationTitle,
  categoryName,
  district,
  aspectRatio = 'cinema',
  className = ''
}) => {
  // Safe fallback if images is empty
  const safeImages = images && images.length > 0 
    ? images 
    : ['https://images.unsplash.com/photo-1590059390047-5a02e6462444?w=1600&fit=crop'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Touch tracking for mobile swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  // Thumbnails scroll container ref
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // Dismiss swipe hint after 4 seconds or after user interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const paginate = useCallback((newDirection: number) => {
    setShowSwipeHint(false);
    setIsZoomed(false);
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = safeImages.length - 1;
      if (nextIndex >= safeImages.length) nextIndex = 0;
      return nextIndex;
    });
  }, [safeImages.length]);

  const selectIndex = useCallback((index: number) => {
    if (index === currentIndex) return;
    setShowSwipeHint(false);
    setIsZoomed(false);
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  // Keep active thumbnail in view
  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const container = thumbnailContainerRef.current;
      const activeThumb = container.children[currentIndex] as HTMLElement;
      if (activeThumb) {
        const thumbLeft = activeThumb.offsetLeft;
        const thumbWidth = activeThumb.offsetWidth;
        const containerWidth = container.offsetWidth;
        container.scrollTo({
          left: thumbLeft - containerWidth / 2 + thumbWidth / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        paginate(-1);
      } else if (e.key === 'ArrowRight') {
        paginate(1);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paginate, isFullscreen]);

  // Touch Swipe Handlers for seamless mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = (touchStartY.current || 0) - (touchEndY.current || 0);

    // Only swipe if horizontal motion is significantly larger than vertical motion (not page scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        // Swiped Left -> Next
        paginate(1);
      } else {
        // Swiped Right -> Prev
        paginate(-1);
      }
    }

    // Reset touch coordinates
    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  // Motion drag swipe end handler for desktop grab-and-drag and trackpad
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) => {
    const swipeThreshold = 50;
    const velocityThreshold = 200;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      paginate(1);
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      paginate(-1);
    }
  };

  // Aspect ratio classes
  const aspectClass = aspectRatio === 'cinema' 
    ? 'aspect-[16/9] sm:aspect-[21/9]' 
    : aspectRatio === 'video' 
      ? 'aspect-[16/10]' 
      : 'aspect-[4/3]';

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.96
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 320, damping: 32 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring' as const, stiffness: 320, damping: 32 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 }
      }
    })
  };

  return (
    <div className={`relative flex flex-col select-none ${className}`}>
      {/* Main Stage Container */}
      <div 
        id="location-image-gallery-stage"
        className={`relative w-full ${aspectClass} overflow-hidden rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl group touch-pan-y cursor-grab active:cursor-grabbing`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Animated Slide View */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-full flex items-center justify-center"
          >
            <img
              src={safeImages[currentIndex]}
              alt={`${locationTitle} - High Resolution View ${currentIndex + 1}`}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover pointer-events-none transition-transform duration-500 ${
                isZoomed ? 'scale-125 object-contain bg-black' : 'scale-100'
              }`}
              onLoad={() => setIsLoading(false)}
            />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Top & Bottom Gradients for UI Contrast */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        {/* Top Badges & Controls Header */}
        <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 flex items-center justify-between pointer-events-auto z-20">
          <div className="flex items-center gap-2">
            {/* Category / District Chip */}
            {categoryName && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-black/60 text-zinc-200 backdrop-blur-md border border-white/10 shadow-sm">
                {categoryName}
              </span>
            )}
            {district && (
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/60 text-rose-300 backdrop-blur-md border border-rose-500/30">
                {district} District
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Image Counter Badge */}
            <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-xs font-medium text-zinc-300 flex items-center gap-1.5 shadow-sm">
              <Camera className="w-3.5 h-3.5 text-rose-400" />
              <span>
                <strong className="text-white">{currentIndex + 1}</strong> / {safeImages.length}
              </span>
            </div>

            {/* Fullscreen Expand Button */}
            <button
              id="expand-gallery-fullscreen-btn"
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-2 rounded-lg bg-black/70 hover:bg-black/90 text-zinc-300 hover:text-white backdrop-blur-md border border-white/15 transition-all active:scale-95 shadow-sm"
              title="Open Fullscreen Lightbox"
              aria-label="Open Fullscreen Lightbox"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Previous Button (Left Arrow) */}
        {safeImages.length > 1 && (
          <button
            id="gallery-prev-photo-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              paginate(-1);
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 hover:border-rose-500 transition-all duration-200 active:scale-90 shadow-xl opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Previous photo"
            title="Previous photo (Arrow Left)"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Next Button (Right Arrow) */}
        {safeImages.length > 1 && (
          <button
            id="gallery-next-photo-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              paginate(1);
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 hover:border-rose-500 transition-all duration-200 active:scale-90 shadow-xl opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Next photo"
            title="Next photo (Arrow Right)"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Bottom Location Caption & Pagination Dots */}
        <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 flex items-end justify-between pointer-events-none z-20">
          <div className="max-w-[70%] drop-shadow-md">
            <h4 className="text-white font-bold text-sm sm:text-base leading-tight truncate">
              {locationTitle}
            </h4>
            <p className="text-[11px] sm:text-xs text-zinc-300 flex items-center gap-1.5 mt-0.5">
              <span>High-Resolution Production Photo</span>
              <span>•</span>
              <span className="text-rose-300 font-medium">Shot {currentIndex + 1} of {safeImages.length}</span>
            </p>
          </div>

          {/* Quick Pagination Dots */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 shadow-sm">
            {safeImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex 
                    ? 'w-5 h-2 bg-rose-500 shadow-sm' 
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Jump to photo ${idx + 1}`}
                title={`Jump to photo ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Swipe Hint Overlay (Auto-fades on mobile) */}
        <AnimatePresence>
          {showSwipeHint && safeImages.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-0 bottom-16 flex justify-center pointer-events-none z-20 sm:hidden"
            >
              <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[11px] text-zinc-200 flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3 h-3 text-rose-400 animate-pulse" />
                <span>Swipe left / right to browse</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Horizontal Thumbnails Carousel Strip */}
      {safeImages.length > 1 && (
        <div className="mt-3 relative">
          <div
            ref={thumbnailContainerRef}
            className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent scroll-smooth focus:outline-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {safeImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                id={`gallery-thumb-${idx}`}
                onClick={() => selectIndex(idx)}
                className={`relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden transition-all duration-200 border-2 ${
                  idx === currentIndex
                    ? 'border-rose-500 ring-2 ring-rose-500/40 scale-105 shadow-md shadow-rose-950/50'
                    : 'border-white/10 hover:border-white/40 opacity-70 hover:opacity-100 scale-100'
                }`}
                aria-label={`Select photo ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {idx === currentIndex && (
                  <div className="absolute inset-0 bg-rose-500/10" />
                )}
                <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-white bg-black/70 px-1 rounded">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-6"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Top Lightbox Bar */}
            <div className="flex items-center justify-between text-white z-30">
              <div className="flex items-center gap-3">
                <span className="font-bold text-base sm:text-lg text-white font-cinematic truncate max-w-[260px] sm:max-w-md">
                  {locationTitle}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-zinc-300 font-mono">
                  {currentIndex + 1} of {safeImages.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom toggle */}
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={isZoomed ? "Reset Zoom" : "Zoom High Resolution"}
                  aria-label={isZoomed ? "Reset Zoom" : "Zoom High Resolution"}
                >
                  {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                </button>

                {/* Close Fullscreen */}
                <button
                  type="button"
                  id="close-gallery-fullscreen-btn"
                  onClick={() => {
                    setIsFullscreen(false);
                    setIsZoomed(false);
                  }}
                  className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-md"
                  title="Close Fullscreen (Esc)"
                  aria-label="Close Fullscreen"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Central High-Resolution Display Stage */}
            <div className="relative flex-1 flex items-center justify-center overflow-hidden my-2">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.3}
                  onDragEnd={handleDragEnd}
                  className="w-full h-full flex items-center justify-center p-2"
                >
                  <img
                    src={safeImages[currentIndex]}
                    alt={`${locationTitle} Full View ${currentIndex + 1}`}
                    referrerPolicy="no-referrer"
                    className={`max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl transition-transform duration-300 ${
                      isZoomed ? 'scale-150 cursor-grab active:cursor-grabbing' : 'scale-100'
                    }`}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Fullscreen Arrow Left */}
              {safeImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(-1);
                  }}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-2xl z-40"
                  aria-label="Previous High-Res Photo"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              )}

              {/* Fullscreen Arrow Right */}
              {safeImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    paginate(1);
                  }}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 transition-all active:scale-95 shadow-2xl z-40"
                  aria-label="Next High-Res Photo"
                >
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              )}
            </div>

            {/* Bottom Fullscreen Thumbnail Bar */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-30">
              {safeImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectIndex(idx)}
                  className={`w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                    idx === currentIndex
                      ? 'border-rose-500 ring-2 ring-rose-500/40 scale-105'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

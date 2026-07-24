'use client';

// =============================================================================
// Screenshot Lightbox — Full-screen image modal with zoom
// =============================================================================

import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { useEffect } from 'react';

interface ScreenshotLightboxProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
  title?: string;
}

export default function ScreenshotLightbox({
  isOpen,
  imageUrl,
  onClose,
  title,
}: ScreenshotLightboxProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur
                       flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Title */}
          {title && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-6 left-6 text-white text-sm font-medium"
            >
              {title}
            </motion.div>
          )}

          {/* Image */}
          <motion.img
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            src={imageUrl}
            alt={title || 'Screenshot'}
            className="relative max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </AnimatePresence>
  );
}

// Clickable thumbnail that opens the lightbox
export function ScreenshotThumbnail({
  url,
  label,
  onClick,
}: {
  url: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden border border-[var(--border)]
                 hover:border-[var(--accent-blue)] transition-all cursor-pointer"
    >
      <img src={url} alt={label} className="w-full h-24 object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors
                      flex items-center justify-center">
        <ZoomIn
          size={20}
          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/50 text-white text-[10px] font-medium">
        {label}
      </div>
    </button>
  );
}

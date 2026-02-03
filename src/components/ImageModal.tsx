'use client';

import { useEffect } from 'react';

interface ImageModalProps {
  imageUrl: string;
  imageName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ imageUrl, imageName, isOpen, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-[95vw] max-h-[95vh]">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 text-sm flex items-center gap-2"
        >
          Fechar (ESC) ✕
        </button>
        <img
          src={imageUrl}
          alt={imageName}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <p className="text-white text-center mt-2 text-sm">{imageName}</p>
      </div>
    </div>
  );
}

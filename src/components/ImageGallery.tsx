import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  onRegenerateImages: () => void;
}

export function ImageGallery({ images, onRegenerateImages }: ImageGalleryProps) {
  const defaultImages = [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12'
  ];

  const displayImages = images.length > 0 ? images : defaultImages;

  return (
    <div className="space-y-4">
      <div className="relative h-64 bg-yolk-50 rounded-xl overflow-hidden border border-yolk-200">
        <div className="flex h-full">
          {displayImages.map((image, index) => (
            <img
              key={index}
              src={`${image}?w=400&h=300&fit=crop`}
              alt={`Generated content ${index + 1}`}
              className="w-full h-full object-cover"
            />
          ))}
        </div>
        <button className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/90 rounded-full shadow-lg hover:bg-white text-yolk-700">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/90 rounded-full shadow-lg hover:bg-white text-yolk-700">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Image, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 图片预览模态框
  const ImagePreview = () => {
    if (!previewImage) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={() => setPreviewImage(null)}
      >
        <button 
          className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10"
          onClick={() => setPreviewImage(null)}
        >
          <X className="w-6 h-6" />
        </button>
        <img 
          src={previewImage} 
          alt="Preview" 
          className="max-w-full max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    );
  };

  if (images.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">笔记图片</h2>
        <div className="bg-zinc-900/50 rounded-xl p-8 border border-zinc-700 
          flex flex-col items-center justify-center min-h-[300px]">
          <Image className="w-16 h-16 text-zinc-600 mb-4" />
          <p className="text-zinc-400 text-center">
            上传图片并点击生成按钮<br />
            AI将为您创作精美的图片内容
          </p>
        </div>
      </div>
    );
  }

  // 根据图片数量决定布局
  const getGridLayout = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-3';
  };

  const getImageHeight = (count: number) => {
    if (count === 1) return 'h-[600px]';
    if (count === 2) return 'h-[400px]';
    if (count <= 4) return 'h-[300px]';
    return 'h-[250px]';
  };

  return (
    <>
      <ImagePreview />
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">笔记图片</h2>
        <div className={`grid ${getGridLayout(images.length)} gap-4`}>
          {images.map((url, index) => (
            <div
              key={index}
              className={`relative ${getImageHeight(images.length)} group overflow-hidden rounded-xl 
                border border-zinc-700 bg-zinc-900 cursor-pointer`}
              onClick={() => setPreviewImage(url)}
            >
              <img
                src={url}
                alt={`Generated ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-zinc-900 bg-opacity-0 group-hover:bg-opacity-30 
                transition-opacity duration-300" />
              <span className="absolute bottom-2 right-2 bg-zinc-900 bg-opacity-75 text-zinc-100 
                px-2 py-1 rounded-md text-sm border border-zinc-700">
                {index + 1}/{images.length}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
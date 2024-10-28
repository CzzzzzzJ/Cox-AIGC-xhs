import React from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  imagePreviews: string[];
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
  formData: {
    images: File[];
    contentType: string;
    sellingPoints: string;
    targetAudience: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    images: File[];
    contentType: string;
    sellingPoints: string;
    targetAudience: string;
  }>>;
}

export function ImageUpload({ 
  imagePreviews, 
  setImagePreviews, 
  formData, 
  setFormData 
}: ImageUploadProps) {
  const MAX_IMAGES = 9;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = formData.images.length + files.length;
    
    if (totalImages > MAX_IMAGES) {
      alert(`最多只能上传${MAX_IMAGES}张图片`);
      return;
    }

    const newFiles = files.slice(0, MAX_IMAGES - formData.images.length);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles]
    }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        商品图片上传 ({formData.images.length}/{MAX_IMAGES})
      </label>
      <div className="grid grid-cols-3 gap-4">
        {imagePreviews.map((preview, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {formData.images.length < MAX_IMAGES && (
          <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-yolk-400 transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">上传图片</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">支持 PNG, JPG, GIF 格式，单张最大 10MB</p>
    </div>
  );
}
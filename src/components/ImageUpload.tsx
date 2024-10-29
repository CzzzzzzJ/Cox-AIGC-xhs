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
  onError?: (error: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  imagePreviews,
  setImagePreviews,
  formData,
  setFormData,
  onError
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (formData.images.length + files.length > 9) {
      onError?.('最多只能上传9张图片');
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        上传图片 <span className="text-red-500">*</span>
        <span className="text-gray-500 text-xs ml-2">(1-9张)</span>
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
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {formData.images.length < 9 && (
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
};
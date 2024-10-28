import React, { useState } from 'react';
import { Upload, Wand2, X } from 'lucide-react';
import { ImageGallery } from './components/ImageGallery';
import { ContentDisplay } from './components/ContentDisplay';
import { ImageUpload } from './components/ImageUpload';

interface FormData {
  images: File[];
  contentType: 'recommendation' | 'guide' | 'review' | '';
  sellingPoints: string;
  targetAudience: string;
}

interface GeneratedContent {
  images: string[];
  title: string;
  content: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    images: [],
    contentType: '',
    sellingPoints: '',
    targetAudience: '',
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    images: [],
    title: '',
    content: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Generating content with:', formData);
  };

  const handleRegenerateContent = () => {
    console.log('Regenerating content...');
  };

  const handleRegenerateImages = () => {
    console.log('Regenerating images...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yolk-50 to-yolk-100">
      <div className="container mx-auto px-4 py-8 flex gap-8">
        {/* Left Side Form */}
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Co-x小红书笔记生成器</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              imagePreviews={imagePreviews}
              setImagePreviews={setImagePreviews}
              formData={formData}
              setFormData={setFormData}
            />

            {/* Content Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                内容类型
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'recommendation', label: '好物推荐' },
                  { value: 'guide', label: '攻略教程' },
                  { value: 'review', label: '产品测评' },
                ].map((type) => (
                  <label
                    key={type.value}
                    className={`
                      flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer
                      ${formData.contentType === type.value
                        ? 'border-yolk-500 bg-yolk-50 text-yolk-700'
                        : 'border-gray-200 hover:border-yolk-200'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="contentType"
                      value={type.value}
                      checked={formData.contentType === type.value}
                      onChange={(e) => setFormData({ ...formData, contentType: e.target.value as FormData['contentType'] })}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Selling Points */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                商品核心卖点
              </label>
              <div className="mt-1">
                <textarea
                  rows={4}
                  value={formData.sellingPoints}
                  onChange={(e) => setFormData({ ...formData, sellingPoints: e.target.value })}
                  className="shadow-sm focus:ring-yolk-500 focus:border-yolk-500 block w-full sm:text-sm border-gray-300 rounded-md resize-none"
                  placeholder="请输入商品的核心优势和特色..."
                />
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                适用人群
              </label>
              <div className="mt-1">
                <textarea
                  rows={3}
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="shadow-sm focus:ring-yolk-500 focus:border-yolk-500 block w-full sm:text-sm border-gray-300 rounded-md resize-none"
                  placeholder="请描述该商品适合哪些人使用..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-yolk-500 hover:bg-yolk-600 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              AIGC一键生成
            </button>
          </form>
        </div>

        {/* Right Side Preview */}
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 space-y-8">
          <ImageGallery 
            images={generatedContent.images}
            onRegenerateImages={handleRegenerateImages}
          />
          <ContentDisplay
            title={generatedContent.title}
            content={generatedContent.content}
            onRegenerateContent={handleRegenerateContent}
            onRegenerateImages={handleRegenerateImages}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
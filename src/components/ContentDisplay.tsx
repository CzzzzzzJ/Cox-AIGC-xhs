import React from 'react';
import { RefreshCw, Image } from 'lucide-react';

interface ContentDisplayProps {
  title: string;
  content: string;
  onRegenerateContent: () => void;
  onRegenerateImages: () => void;
}

export function ContentDisplay({ 
  title, 
  content, 
  onRegenerateContent, 
  onRegenerateImages 
}: ContentDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="bg-yolk-50 rounded-lg shadow-sm p-3 border border-yolk-200">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-yolk-700">标题</h3>
            <p className="text-base font-medium text-gray-900 flex-1">{title || '这款产品将彻底改变您的生活方式'}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 min-h-[300px]">
          <h3 className="text-sm font-medium text-yolk-700 mb-3">正文</h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {content || '这里将展示生成的产品详细介绍内容...\n\n您可以在这里看到完整的产品描述、特点介绍、使用方法等详细信息。生成的内容会根据您提供的商品图片、核心卖点和目标人群自动优化。\n\n点击下方的"换文案"按钮可以重新生成不同风格的文案内容。'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onRegenerateContent}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yolk-50 border border-yolk-200 rounded-lg text-sm font-medium text-yolk-700 hover:bg-yolk-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          换文案
        </button>
        <button
          onClick={onRegenerateImages}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yolk-50 border border-yolk-200 rounded-lg text-sm font-medium text-yolk-700 hover:bg-yolk-100 transition-colors"
        >
          <Image className="w-4 h-4" />
          换图片
        </button>
      </div>
    </div>
  );
}
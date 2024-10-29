import React from 'react';
import { RefreshCw, FileText } from 'lucide-react';

interface ContentDisplayProps {
  title: string;
  content: string;
  onRegenerateContent: () => void;
  onRegenerateImages: () => void;
}

export const ContentDisplay: React.FC<ContentDisplayProps> = ({
  title,
  content,
  onRegenerateContent,
  onRegenerateImages,
}) => {
  // 初始状态展示
  if (!title && !content) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-zinc-100">笔记文案</h2>
        <div className="bg-zinc-900/50 rounded-xl p-8 border border-zinc-700 flex flex-col items-center justify-center min-h-[300px]">
          <FileText className="w-16 h-16 text-zinc-600 mb-4" />
          <p className="text-zinc-400 text-center">
            填写左侧表单并点击生成按钮<br />
            AI将为您创作精美的笔记内容
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-100">笔记文案</h2>
        <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-700">
          <h3 className="text-lg font-medium text-zinc-100 mb-4">{title}</h3>
          <p className="text-zinc-300 whitespace-pre-wrap">{content}</p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <button
          onClick={onRegenerateContent}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
            bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100
            border border-zinc-700 hover:border-zinc-600
            rounded-lg transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          换文案
        </button>
        <button
          onClick={onRegenerateImages}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
            bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100
            border border-zinc-700 hover:border-zinc-600
            rounded-lg transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          换图片
        </button>
      </div>
    </div>
  );
};
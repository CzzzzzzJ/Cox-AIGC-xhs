import React, { useState } from 'react';
import { Upload, Wand2, X } from 'lucide-react';
import { ImageGallery } from './components/ImageGallery';
import { ContentDisplay } from './components/ContentDisplay';
import { ImageUpload } from './components/ImageUpload';

interface FormData {
  images: File[];
  contentType: 'recommendation' | 'guide' | 'review' | '';
  productInfo: string;
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
    productInfo: '',
    sellingPoints: '',
    targetAudience: '',
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    images: [],
    title: '',
    content: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.contentType) {
      setError('请选择内容类型');
      return;
    }

    setIsGenerating(true);

    console.log('开始生成内容，表单数据:', formData);

    const requestBody = {
      bot_id: "7406168499032277055",
      user_id: "123456789",
      stream: true,
      auto_save_history: true,
      additional_messages: [
        {
          role: "user",
          content_type: "text",
          content: JSON.stringify([
            {
              type: "text",
              text: `文案描述: ${formData.productInfo}, 商品核心卖点: ${formData.sellingPoints}, 商品适用人群: ${formData.targetAudience}, 笔记生成需求： ${formData.contentType}`
            }
          ])
        }
      ]
    };

    console.log('准备发送的请求体:', requestBody);

    try {
      console.log('开始发送API请求...');
      const response = await fetch('https://api.coze.cn/v3/chat?conversation_id=7423696040869543976', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer pat_T4KjokUbkD0ptMdny8QRyzCJGLSsUrIKZUb0qkvIIay3XmwKs9ngh6e9cwOdXW6d',
          'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('收到API响应:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 获取响应的原始文本
      const text = await response.text();
      console.log('API原始响应文本:', text);

      // 处理SSE格式的响应
      const lines = text.split('\n');
      let fullMessage = '';
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const jsonStr = line.slice(5); // 移除 'data:' 前缀
            const data = JSON.parse(jsonStr);
            console.log('解析的数据片段:', data);
            
            // 只处理包含实际内容的消息
            if (data.content && !data.content.startsWith('{')) {
              fullMessage = data.content;
              
              // 只有当内容完整时才更新状态
              if (fullMessage.includes('标签：')) {
                console.log('获取到完整内容:', fullMessage);
                
                // 提取标题和正文
                const contentParts = fullMessage.split('\n\n');
                const title = contentParts[0];
                const content = contentParts.slice(1).join('\n\n');

                console.log('解析后的标题:', title);
                console.log('解析后的正文:', content);

                setGeneratedContent({
                  images: [],  // API目前没有返回图片
                  title: title,
                  content: content
                });
              }
            }
          } catch (e) {
            console.log('跳过非JSON行:', line);
          }
        }
      }

      console.log('状态更新完成');

    } catch (error) {
      console.error('生成内容时发生错误:', error);
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
    } finally {
      setIsGenerating(false);
    }
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

            {/* 产品信息 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                产品信息
              </label>
              <div className="mt-1">
                <textarea
                  rows={3}
                  value={formData.productInfo}
                  onChange={(e) => setFormData({ ...formData, productInfo: e.target.value })}
                  className="shadow-sm focus:ring-yolk-500 focus:border-yolk-500 block w-full sm:text-sm border-gray-300 rounded-md resize-none"
                  placeholder="请输入产品的品牌、规格等信息..."
                />
              </div>
            </div>

            {/* 商品核心卖点 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                商品核心卖点
              </label>
              <div className="mt-1">
                <textarea
                  rows={3}
                  value={formData.sellingPoints}
                  onChange={(e) => setFormData({ ...formData, sellingPoints: e.target.value })}
                  className="shadow-sm focus:ring-yolk-500 focus:border-yolk-500 block w-full sm:text-sm border-gray-300 rounded-md resize-none"
                  placeholder="请输入商品的核心优势和特色..."
                />
              </div>
            </div>

            {/* 适用人群 */}
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

            {/* Content Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                内容类型 <span className="text-red-500">*</span>
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
                      ${error && !formData.contentType ? 'border-red-500' : ''}
                    `}
                  >
                    <input
                      type="radio"
                      name="contentType"
                      value={type.value}
                      checked={formData.contentType === type.value}
                      onChange={(e) => {
                        setFormData({ ...formData, contentType: e.target.value as FormData['contentType'] });
                        setError('');
                      }}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-lg text-white 
                ${isGenerating 
                  ? 'bg-yolk-400 cursor-not-allowed' 
                  : 'bg-yolk-500 hover:bg-yolk-600'} 
                md:py-4 md:text-lg md:px-10 transition-colors duration-200`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  正在生成...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  AIGC一键生成
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side Preview */}
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 space-y-8">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="relative w-24 h-24">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-yolk-200 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-yolk-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-lg text-gray-600">AI正在创作中...</p>
              <p className="text-sm text-gray-400">请稍候片刻，马上为您生成精彩内容</p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
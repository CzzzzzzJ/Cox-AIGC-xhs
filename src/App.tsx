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

// 更新环境变量的类型声明
declare global {
  interface ImportMetaEnv {
    VITE_COZE_AUTH_TOKEN: string;
    VITE_COZE_BOT_ID: string;
    VITE_COZE_IMAGE_BOT_ID: string;
    VITE_COZE_CONVERSATION_ID: string;
  }
}

// 修改uploadImage函数，使用统一的token
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const token = import.meta.env.VITE_COZE_AUTH_TOKEN;
    console.log('开始上传图片...');
    console.log('上传的文件大小:', file.size, '字节');
    console.log('上传件类型:', file.type);

    const response = await fetch('https://api.coze.cn/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const responseText = await response.text();
    console.log('上传响应原文:', responseText);

    if (!response.ok) {
      throw new Error(`上传失败: ${response.status}, ${responseText}`);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`响应解析失败: ${responseText}`);
    }

    if (responseData.code !== 0) {
      throw new Error(`API错误: ${responseData.code}, ${responseData.msg}`);
    }

    console.log('图片上传成功，返回数据:', responseData);
    return responseData.data.id;
  } catch (error) {
    console.error('图片上传失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
    }
    throw error;
  }
};

// 添加重试上传函数
const uploadImageWithRetry = async (file: File, maxRetries = 3): Promise<string | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`尝试上传图片 ${file.name}，第 ${attempt} 次试`);
      const id = await uploadImage(file);
      return id;
    } catch (error) {
      console.log(`第 ${attempt} 次上传失败:`, error);
      if (attempt === maxRetries) {
        console.log(`图片 ${file.name} 上传失败，已达到最大重试次数`);
        return null;
      }
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return null;
};

// 修改提取图片URL的函数
const extractImageUrls = (content: string): string[] => {
  const urls: string[] = [];
  
  // 处理markdown格式的图片链接
  const markdownRegex = /!\[图片\]\((https:\/\/[^)]+)\)/g;
  const markdownMatches = [...content.matchAll(markdownRegex)];
  urls.push(...markdownMatches.map(match => match[1]));

  // 处理直接返回的URL格式
  const urlRegex = /'(https:\/\/[^']+)'/g;
  const urlMatches = [...content.matchAll(urlRegex)];
  urls.push(...urlMatches.map(match => match[1]));

  // 处理JSON格式中的图片URL
  try {
    if (content.includes('"image":') || content.includes('"image_biji":')) {
      const jsonData = JSON.parse(content);
      if (jsonData.image) urls.push(jsonData.image);
      if (jsonData.image_biji) urls.push(jsonData.image_biji);
      // 处理image1到image8的字段
      for (let i = 1; i <= 8; i++) {
        const key = `image${i}`;
        if (jsonData[key]) urls.push(jsonData[key]);
      }
    }
  } catch (e) {
    console.log('JSON解析失败，跳过');
  }

  // 去重并过滤空值
  return [...new Set(urls)].filter(url => url && url.trim() !== '');
};

// 添加一个通用的API请求函数，包含重试机制
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`API请求尝试 ${attempt}/${maxRetries}:`, url);
      const response = await fetch(url, options);
      
      // 如果请求成功，直接返回
      if (response.ok) {
        return response;
      }
      
      // 如果是401错误，不需要重试
      if (response.status === 401) {
        throw new Error(`认证失败: ${response.status}`);
      }
      
      // 其他错误情况，记录错误并继续重试
      const errorText = await response.text();
      lastError = new Error(`请求失败: ${response.status}, ${errorText}`);
      
      // 如果还有重试机会，等待后继续
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`等待 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    } catch (error) {
      console.error(`第 ${attempt} 次请求失败:`, error);
      lastError = error instanceof Error ? error : new Error('未知错误');
      
      // 如果是网络错误，等待后重试
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`网络错误，等待 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // 所有重试都失败了，抛出最后一个错误
  throw lastError || new Error('所有重试都失败了');
};

// 修改文案生成请求
const generateContent = async (requestBody: any): Promise<string> => {
  const response = await fetchWithRetry(
    `https://api.coze.cn/v3/chat?conversation_id=${import.meta.env.VITE_COZE_CONVERSATION_ID}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_COZE_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  );

  return response.text();
};

// 修改图片生成请求
const generateImages = async (requestBody: any): Promise<string> => {
  const response = await fetchWithRetry(
    'https://api.coze.cn/v3/chat',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_COZE_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  );

  return response.text();
};

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
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.contentType) {
      setError('请选择内容类型');
      return;
    }

    try {
      // 生成文案
      setIsGeneratingContent(true);
      const contentRequestBody = {
        bot_id: import.meta.env.VITE_COZE_BOT_ID,
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

      const contentText = await generateContent(contentRequestBody);
      const contentLines = contentText.split('\n');
      let fullMessage = '';
      
      for (const line of contentLines) {
        if (line.startsWith('data:')) {
          try {
            const jsonStr = line.slice(5);
            const data = JSON.parse(jsonStr);
            
            if (data.content && !data.content.startsWith('{')) {
              fullMessage = data.content;
              setGeneratedContent(prev => ({
                ...prev,
                title: data.content.split('\n')[0],
                content: data.content.split('\n').slice(1).join('\n')
              }));
            }
          } catch (e) {
            console.log('跳过非JSON行:', line);
          }
        }
      }
      setIsGeneratingContent(false);

      // 生成图片
      if (formData.images.length > 0) {
        setIsGeneratingImages(true);
        if (formData.images.length > 9) {
          throw new Error('最多只能上传9张图片');
        }

        console.log('开始上传图片，图片数量:', formData.images.length);
        const uploadResults = await Promise.all(
          formData.images.map(file => uploadImageWithRetry(file))
        );

        // 过滤出成功上传的图片ID
        const successfulImageIds = uploadResults.filter((id): id is string => id !== null);
        console.log('成功上传的图片数量:', successfulImageIds.length);

        if (successfulImageIds.length === 0) {
          setError('所有图片上传失败，请重试或更换图片');
          return;
        }

        if (successfulImageIds.length < formData.images.length) {
          console.warn(`部分图片上传失败: ${formData.images.length - successfulImageIds.length} 张未能上传`);
          setError(`${formData.images.length - successfulImageIds.length} 张图片上传失败，将使用已成功上传的图片继续生成`);
        }

        const imageRequestBody = {
          bot_id: import.meta.env.VITE_COZE_IMAGE_BOT_ID,
          user_id: "123456789",
          stream: true,
          auto_save_history: true,
          additional_messages: [
            {
              role: "user",
              content_type: "object_string",
              content: JSON.stringify([
                {
                  type: "text",
                  text: formData.productInfo || "生成商品图片"
                },
                ...successfulImageIds.map(id => ({
                  type: "image",
                  file_id: id
                }))
              ])
            }
          ]
        };

        console.log('图片生成请求体:', JSON.stringify(imageRequestBody, null, 2));

        const imageText = await generateImages(imageRequestBody);
        console.log('图片生成API原始响应:', imageText);

        // 分行处理响应
        const lines = imageText.split('\n');
        const allImageUrls: string[] = [];

        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const jsonStr = line.slice(5);
              const data = JSON.parse(jsonStr);
              
              if (data.content) {
                const urls = extractImageUrls(data.content);
                if (urls.length > 0) {
                  allImageUrls.push(...urls);
                  console.log('从响应中提取到的图片URL:', urls);
                }
              }
            } catch (e) {
              console.log('跳过非JSON行或解析失败:', line);
            }
          }
        }

        if (allImageUrls.length > 0) {
          setGeneratedContent(prev => ({
            ...prev,
            images: [...new Set(allImageUrls)] // 去重
          }));
          console.log('成功更新生成的图片URLs:', allImageUrls);
        } else {
          console.warn('未能从响应中提取到任何图片URL');
        }
      }
      setIsGeneratingImages(false);
    } catch (error) {
      console.error('生成内容时发生错误:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('生成内容时发生未知错误');
      }
    } finally {
      setIsGeneratingContent(false);
      setIsGeneratingImages(false);
    }
  };

  // 将重新生成文案函数移到这里
  const handleRegenerateContent = async () => {
    setIsGeneratingContent(true);
    
    try {
      const contentRequestBody = {
        bot_id: import.meta.env.VITE_COZE_BOT_ID,
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

      const contentText = await generateContent(contentRequestBody);
      const contentLines = contentText.split('\n');
      let fullMessage = '';
      
      for (const line of contentLines) {
        if (line.startsWith('data:')) {
          try {
            const jsonStr = line.slice(5);
            const data = JSON.parse(jsonStr);
            
            if (data.content && !data.content.startsWith('{')) {
              fullMessage = data.content;
              setGeneratedContent(prev => ({
                ...prev,
                title: data.content.split('\n')[0],
                content: data.content.split('\n').slice(1).join('\n')
              }));
            }
          } catch (e) {
            console.log('跳过非JSON行:', line);
          }
        }
      }
    } catch (error) {
      console.error('重新生成文案时发生错误:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // 将重新生成图片函数移到这里
  const handleRegenerateImages = async () => {
    if (formData.images.length === 0) {
      setError('没有可用的图片');
      return;
    }

    setIsGeneratingImages(true);

    try {
      console.log('开始重新生成图片...');
      const uploadResults = await Promise.all(
        formData.images.map(file => uploadImageWithRetry(file))
      );

      const successfulImageIds = uploadResults.filter((id): id is string => id !== null);

      if (successfulImageIds.length === 0) {
        throw new Error('所有图片上传失败，请重试或更换图片');
      }

      if (successfulImageIds.length < formData.images.length) {
        console.warn(`部分图片上传失败: ${formData.images.length - successfulImageIds.length} 张未能上传`);
        setError(`${formData.images.length - successfulImageIds.length} 张图片上传失败，将使用已成功上传的图片继续生成`);
      }

      const imageRequestBody = {
        bot_id: import.meta.env.VITE_COZE_IMAGE_BOT_ID,
        user_id: "123456789",
        stream: true,
        auto_save_history: true,
        additional_messages: [
          {
            role: "user",
            content_type: "object_string",
            content: JSON.stringify([
              {
                type: "text",
                text: formData.productInfo || "生成商品图片"
              },
              ...successfulImageIds.map(id => ({
                type: "image",
                file_id: id
              }))
            ])
          }
        ]
      };

      const imageText = await generateImages(imageRequestBody);
      const lines = imageText.split('\n');
      const allImageUrls: string[] = [];

      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const jsonStr = line.slice(5);
            const data = JSON.parse(jsonStr);
            
            if (data.content) {
              const urls = extractImageUrls(data.content);
              if (urls.length > 0) {
                allImageUrls.push(...urls);
              }
            }
          } catch (e) {
            console.log('跳过非JSON行或解析失败:', line);
          }
        }
      }

      if (allImageUrls.length > 0) {
        setGeneratedContent(prev => ({
          ...prev,
          images: [...new Set(allImageUrls)]
        }));
      } else {
        throw new Error('未能生成新的图片');
      }
    } catch (error) {
      console.error('重新生���图片时发生错误:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsGeneratingImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* 左侧表单 */}
          <div className="w-full lg:w-1/3 bg-zinc-800 rounded-2xl shadow-2xl p-8 border border-zinc-700">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
              <Wand2 className="w-8 h-8 mr-3 text-emerald-500" />
              Cox小红书笔记生成器
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <ImageUpload
                imagePreviews={imagePreviews}
                setImagePreviews={setImagePreviews}
                formData={formData}
                setFormData={setFormData}
              />

              {/* 产品信息 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  产品信息
                </label>
                <div className="mt-1">
                  <textarea
                    rows={3}
                    value={formData.productInfo}
                    onChange={(e) => setFormData({ ...formData, productInfo: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 
                      placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                      transition-all duration-200 resize-none"
                    placeholder="请输入产品的品牌、规格等信息..."
                  />
                </div>
              </div>

              {/* 商品核心卖点 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  商品核心卖点
                </label>
                <div className="mt-1">
                  <textarea
                    rows={3}
                    value={formData.sellingPoints}
                    onChange={(e) => setFormData({ ...formData, sellingPoints: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 
                      placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                      transition-all duration-200 resize-none"
                    placeholder="请输入商品的核心优势和特色..."
                  />
                </div>
              </div>

              {/* 适用人群 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">
                  适用人群
                </label>
                <div className="mt-1">
                  <textarea
                    rows={3}
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 
                      placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                      transition-all duration-200 resize-none"
                    placeholder="请描述该商品适合哪些人使用..."
                  />
                </div>
              </div>

              {/* 内容类型选择 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-300">
                  内容类型 <span className="text-emerald-500">*</span>
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
                        flex items-center justify-center p-4 rounded-lg border cursor-pointer
                        transition-all duration-200
                        ${formData.contentType === type.value
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-300'
                        }
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
                  <p className="text-sm text-red-400 mt-2">{error}</p>
                )}
              </div>

              {/* 生成按钮 */}
              <button
                type="submit"
                disabled={isGenerating}
                className={`
                  w-full flex items-center justify-center px-8 py-4 rounded-lg text-base font-medium
                  transition-all duration-200 
                  ${isGenerating 
                    ? 'bg-zinc-700 cursor-not-allowed text-zinc-400'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }
                `}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    AI一键生成
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 右侧预览区域 */}
          <div className="w-full lg:w-2/3 bg-zinc-800 rounded-2xl shadow-2xl p-8 border border-zinc-700">
            <div className="space-y-8">
              {/* 图片区域 */}
              <div className="relative">
                {isGeneratingImages ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-zinc-900/50 rounded-xl border border-zinc-700">
                    <div className="relative w-20 h-20">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-500/20 rounded-full animate-ping"></div>
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-6 text-lg text-zinc-300">正在生成图片</p>
                    <p className="text-sm text-zinc-500">AI正在为您创作精美图片</p>
                  </div>
                ) : (
                  <ImageGallery images={generatedContent.images} />
                )}
              </div>

              {/* 文案区域 */}
              <div className="relative">
                {isGeneratingContent ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-zinc-900/50 rounded-xl border border-zinc-700">
                    <div className="relative w-20 h-20">
                      <svg className="animate-spin w-full h-full text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <p className="mt-6 text-lg text-zinc-300">正在生成文案</p>
                    <p className="text-sm text-zinc-500">AI正在为您撰写优质内容</p>
                  </div>
                ) : (
                  <ContentDisplay
                    title={generatedContent.title}
                    content={generatedContent.content}
                    images={generatedContent.images}
                    onRegenerateContent={handleRegenerateContent}
                    onRegenerateImages={handleRegenerateImages}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
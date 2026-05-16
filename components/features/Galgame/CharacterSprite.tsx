/**
 * CharacterSprite.tsx
 *
 * 角色立绘组件。支持左/右侧定位、呼吸动画、表情切换、懒加载。
 */

import React, { useState, useEffect } from 'react';

export interface CharacterSpriteProps {
  /** 角色名称 */
  name: string;
  /** 立绘图片 URL */
  imageUrl?: string;
  /** 表情变体 */
  expression?: 'normal' | 'happy' | 'angry' | 'sad' | 'surprised';
  /** 定位: 左侧 / 右侧 / 居中 */
  position?: 'left' | 'right' | 'center';
  /** 是否为当前说话角色（前景高亮） */
  isSpeaking?: boolean;
  /** CSS 类名追加 */
  className?: string;
}

const expressionFilters: Record<NonNullable<CharacterSpriteProps['expression']>, string> = {
  normal: 'none',
  happy: 'brightness(1.1) saturate(1.1)',
  angry: 'contrast(1.3) brightness(0.9) saturate(1.2)',
  sad: 'brightness(0.85) saturate(0.7)',
  surprised: 'brightness(1.15) saturate(1.2)',
};

const positionClasses: Record<NonNullable<CharacterSpriteProps['position']>, string> = {
  left: 'left-0 md:left-8',
  right: 'right-0 md:right-8',
  center: 'left-1/2 -translate-x-1/2',
};

export const CharacterSprite = React.memo<CharacterSpriteProps>(({
  name,
  imageUrl,
  expression = 'normal',
  position = 'center',
  isSpeaking = false,
  className = '',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
    if (imageUrl) {
      const img = new Image();
      img.onload = () => setLoaded(true);
      img.onerror = () => setError(true);
      img.src = imageUrl;
    }
  }, [imageUrl]);

  // 无图片降级方案：色块 + 名称标签
  if (!imageUrl || error) {
    return (
      <div
        className={`absolute bottom-0 ${positionClasses[position]} z-10 flex flex-col items-center transition-all duration-300 ${className}`}
      >
        <div className={`w-24 h-36 md:w-32 md:h-48 rounded-lg flex items-center justify-center border-2 ${
          isSpeaking ? 'border-wuxia-gold/80 bg-wuxia-gold/10' : 'border-gray-600 bg-gray-800/60'
        }`}>
          <span className="text-gray-400 text-xs md:text-sm text-center px-2">{name}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute bottom-0 ${positionClasses[position]} z-10 transition-all duration-300 ${
        isSpeaking ? 'animate-breathe' : 'opacity-80'
      } ${className}`}
      style={{
        filter: expressionFilters[expression],
      }}
    >
      {!loaded && (
        <div className="w-32 h-48 md:w-48 md:h-64 bg-gray-800 animate-pulse rounded-lg" />
      )}
      <img
        src={imageUrl}
        alt={name}
        className={`w-32 h-48 md:w-48 md:h-64 object-contain ${loaded ? 'block' : 'hidden'}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
});

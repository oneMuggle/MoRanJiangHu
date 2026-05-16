/**
 * SceneBackground.tsx
 *
 * 场景背景组件。根据当前区域加载背景图，支持淡入淡出、时段色调影响。
 */

import React, { useState, useEffect } from 'react';

export interface SceneBackgroundProps {
  /** 背景图片 URL */
  imageUrl?: string;
  /** 场景名称（用于无图降级） */
  sceneName?: string;
  /** 时段（影响色调） */
  timeOfDay?: '清晨' | '上午' | '下午' | '黄昏' | '夜晚' | '深夜';
  /** 过渡时长（毫秒） */
  transitionDuration?: number;
  /** CSS 类名追加 */
  className?: string;
}

const timeFilters: Record<NonNullable<SceneBackgroundProps['timeOfDay']>, string> = {
  '清晨': 'brightness(1.1) sepia(0.1) hue-rotate(-10deg)',
  '上午': 'none',
  '下午': 'brightness(1.05) saturate(1.1)',
  '黄昏': 'brightness(0.9) sepia(0.3) hue-rotate(-20deg)',
  '夜晚': 'brightness(0.5) saturate(0.6) hue-rotate(200deg)',
  '深夜': 'brightness(0.3) saturate(0.4) hue-rotate(220deg)',
};

const sceneGradients: Record<string, string> = {
  '门派': 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)',
  '客栈': 'linear-gradient(135deg, #2d1b00 0%, #4a2c00 50%, #6b3e00 100%)',
  '市集': 'linear-gradient(135deg, #3d2b00 0%, #5c3d00 50%, #8b5a00 100%)',
  '秘境': 'linear-gradient(135deg, #0a2e1a 0%, #0e4a21 50%, #146b30 100%)',
  '山洞': 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #3d3d3d 100%)',
  '村庄': 'linear-gradient(135deg, #1a2e0a 0%, #2e4a0e 50%, #4a6b14 100%)',
  '城镇': 'linear-gradient(135deg, #0a1a2e 0%, #0e2e4a 50%, #144a6b 100%)',
  '荒野': 'linear-gradient(135deg, #2e0a0a 0%, #4a0e0e 50%, #6b1414 100%)',
  default: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
};

export const SceneBackground = React.memo<SceneBackgroundProps>(({
  imageUrl,
  sceneName,
  timeOfDay = '上午',
  transitionDuration = 800,
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

  const timeFilter = timeFilters[timeOfDay] || 'none';
  const gradient = sceneName
    ? (sceneGradients[sceneName] || sceneGradients.default)
    : sceneGradients.default;

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 transition-opacity"
        style={{ background: gradient }}
      />
      {imageUrl && !error && (
        <img
          src={imageUrl}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ filter: timeFilter }}
          loading="lazy"
        />
      )}
    </div>
  );
});

/**
 * GalgameView.tsx
 *
 * Galgame 风格视图：替代默认 ChatList，以沉浸式 Galgame 方式渲染对话。
 * 支持段进度导航、对话记录回顾（Backlog）、loading 不白屏。
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SceneBackground } from '../features/Galgame/SceneBackground';
import { CharacterSprite } from '../features/Galgame/CharacterSprite';
import { GalgameDialogueBox } from '../features/Galgame/GalgameDialogueBox';
import type { DialogueOption } from '../features/Galgame/GalgameDialogueBox';
import { DialogueBacklog } from '../features/Galgame/DialogueBacklog';
import { useAggregatedDialogue } from '../../hooks/useGame/ui/useAggregatedDialogue';

interface GalgameViewProps {
  /** 聊天历史记录 */
  history: any[];
  /** 是否正在加载（AI 回复中） */
  loading: boolean;
  /** 社交 NPC 列表（用于匹配角色图片） */
  socialList: any[];
  /** 玩家信息 */
  playerProfile: { 姓名?: string; 头像图片URL?: string };
  /** 当前可选操作 */
  currentOptions: string[];
  /** 背景图片 URL */
  backgroundImage?: string;
  /** 场景名称（用于无图降级） */
  sceneName?: string;
  /** 时段 */
  timeOfDay?: string;
  /** 选择选项 */
  onOptionSelect: (optionId: string) => void;
  /** 发送消息 */
  onSend: (text: string) => void;
  /** 停止生成 */
  onStop: () => void;
}

export const GalgameView: React.FC<GalgameViewProps> = ({
  history,
  loading,
  socialList,
  playerProfile,
  currentOptions,
  backgroundImage,
  sceneName,
  timeOfDay = '上午',
  onOptionSelect,
}) => {
  const [showBacklog, setShowBacklog] = useState(false);
  // 段进度计数器：当前显示到第几段（0 = 最新段，递增向前翻阅）
  const [segmentIndex, setSegmentIndex] = useState(0);

  const {
    allEntries,
    currentSceneEntries,
    currentSpeaker,
    currentSceneCharacters,
  } = useAggregatedDialogue({
    history,
    socialList,
    playerName: playerProfile.姓名,
  });

  // loading 状态变化时（新对话生成后），重置段进度
  const wasLoading = useRef(loading);
  useEffect(() => {
    if (wasLoading.current && !loading) {
      // 从 loading → 完成，说明新对话已生成
      setSegmentIndex(0);
    }
    wasLoading.current = loading;
  }, [loading]);

  // 当前场景的段分组：按连续旁白/角色对话分组
  const sceneSegments = useMemo(() => {
    if (currentSceneEntries.length === 0) return [];

    const segments: Array<typeof currentSceneEntries> = [];
    let currentSegment: typeof currentSceneEntries = [];

    for (const entry of currentSceneEntries) {
      currentSegment.push(entry);
      // 每当遇到角色对话（非旁白），结束当前段
      if (!entry.isNarrator) {
        if (currentSegment.length > 0) {
          segments.push([...currentSegment]);
          currentSegment = [];
        }
      }
    }
    // 剩余条目
    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }

    return segments;
  }, [currentSceneEntries]);

  // 当前显示的段
  const totalSegments = sceneSegments.length;
  const displaySegment = sceneSegments[totalSegments - 1 - segmentIndex] || [];

  const validTimeOfDay = (timeOfDay && ['清晨', '上午', '下午', '黄昏', '夜晚', '深夜'].includes(timeOfDay))
    ? (timeOfDay as '清晨' | '上午' | '下午' | '黄昏' | '夜晚' | '深夜')
    : '上午';

  // 将 currentOptions 转为 DialogueOption[]
  const options: DialogueOption[] = useMemo(
    () => (currentOptions || []).map((opt, idx) => ({ id: `opt-${idx}`, text: opt })),
    [currentOptions],
  );

  // 空状态
  const isEmpty = allEntries.length === 0;
  if (isEmpty) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-ink-black">
        {backgroundImage && (
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${backgroundImage})` }} />
        )}
        <div className="relative z-10 text-center">
          <p className="text-wuxia-gold/50 text-lg">江湖之旅即将开始</p>
          <p className="text-gray-500 text-sm mt-2">输入消息开启你的故事</p>
        </div>
      </div>
    );
  }

  // CharacterSprite 角色列表
  const galgameCharacters = currentSceneCharacters.map((char, idx) => {
    const positions: Array<'left' | 'right' | 'center'> = ['left', 'right'];
    return {
      id: char.name,
      name: char.name,
      imageUrl: char.imageUrl,
      position: positions[idx] || 'center' as const,
    };
  });

  // 当前说话角色
  const galgameSpeaker = currentSpeaker
    ? {
        id: currentSpeaker.name,
        name: currentSpeaker.name,
        imageUrl: currentSpeaker.imageUrl,
        position: 'center' as const,
      }
    : undefined;

  // 当前段最后一个非旁白角色作为说话者
  const segmentSpeaker = displaySegment.length > 0
    ? (() => {
        for (let i = displaySegment.length - 1; i >= 0; i--) {
          if (!displaySegment[i].isNarrator) {
            const npc = socialList.find((n) => n.姓名 === displaySegment[i].sender);
            return {
              name: displaySegment[i].sender,
              text: displaySegment[i].text,
              imageUrl: npc?.头像图片URL,
            };
          }
        }
        const last = displaySegment[displaySegment.length - 1];
        return { name: last.sender, text: last.text, imageUrl: undefined };
      })()
    : currentSpeaker;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 场景背景 */}
      <SceneBackground
        imageUrl={backgroundImage}
        sceneName={sceneName}
        timeOfDay={validTimeOfDay}
      />

      {/* 角色立绘 */}
      {galgameCharacters.map((char) => (
        <CharacterSprite
          key={char.id}
          name={char.name}
          imageUrl={char.imageUrl}
          position={char.position}
          isSpeaking={galgameSpeaker?.id === char.id}
        />
      ))}

      {/* 对话区域 */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="mx-4 mb-4 md:mx-auto md:mb-6 md:max-w-3xl">
          {/* 选项列表 — Galgame 风格：在正文上方，紧凑排列 */}
          {options.length > 0 && !loading && segmentIndex === 0 && (
            <div className="mb-2 space-y-1.5">
              {options.map((option) => (
                <button
                  key={option.id}
                  className="w-full text-left bg-gray-900/90 border border-wuxia-gold/20 hover:border-wuxia-gold/50 rounded px-3 py-2 transition-colors group flex items-center gap-2"
                  onClick={() => onOptionSelect(option.id)}
                >
                  <span className="w-4 h-4 rounded-full border border-wuxia-gold/30 flex items-center justify-center shrink-0 group-hover:border-wuxia-gold/60 group-hover:bg-wuxia-gold/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-wuxia-gold/40 group-hover:bg-wuxia-gold/70" />
                  </span>
                  <span className="text-sm text-wuxia-gold/90 group-hover:text-amber-300">{option.text}</span>
                </button>
              ))}
            </div>
          )}

          <div className="bg-gray-900/95 backdrop-blur-sm border border-wuxia-gold/30 rounded-lg overflow-hidden">
            {/* 标题栏 + 导航 + Backlog */}
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-wuxia-gold/10">
              <div className="flex items-center gap-2">
                {segmentSpeaker && (
                  <span className="inline-block px-3 py-0.5 bg-wuxia-gold/20 text-wuxia-gold text-xs font-bold rounded">
                    {segmentSpeaker.name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {/* 段导航 */}
                {totalSegments > 1 && (
                  <div className="flex items-center gap-1 mr-2">
                    {segmentIndex > 0 && (
                      <button
                        onClick={() => setSegmentIndex(prev => Math.min(prev + 1, totalSegments - 1))}
                        className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-wuxia-gold transition-colors"
                        title="上一段"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    <span className="text-[10px] text-gray-500 min-w-[3rem] text-center">
                      {totalSegments - segmentIndex} / {totalSegments}
                    </span>
                    {segmentIndex === 0 && loading && (
                      <span className="text-[10px] text-wuxia-gold/40">· 生成中</span>
                    )}
                    {segmentIndex < totalSegments - 1 && (
                      <button
                        onClick={() => setSegmentIndex(prev => prev + 1)}
                        className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-wuxia-gold transition-colors"
                        title="下一段"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
                {/* Backlog 按钮 */}
                <button
                  onClick={() => setShowBacklog(true)}
                  className="p-1 rounded text-gray-500 hover:text-wuxia-gold hover:bg-white/5 transition-colors"
                  title="对话记录"
                  aria-label="查看对话记录"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16ZM6.75 9.25a.75.75 0 01.75-.75h5a.75.75 0 010 1.5h-5a.75.75 0 01-.75-.75Zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5Z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 当前段内容 */}
            <div>
              {displaySegment.map((entry, idx) => {
                const isLast = idx === displaySegment.length - 1;
                // 旁白样式
                if (entry.isNarrator) {
                  return (
                    <div
                      key={`entry-${entry.turnIndex}-${idx}`}
                      className="px-4 py-3 text-sm text-gray-400 italic border-l-2 border-gray-700/60 bg-gray-900/30 whitespace-pre-wrap leading-relaxed"
                    >
                      {entry.text}
                    </div>
                  );
                }
                // 角色对话 — 最新段的最后一条用打字机
                if (isLast && !loading && segmentIndex === 0) {
                  return (
                    <div key={`entry-${entry.turnIndex}-${idx}`} className="px-4 py-3">
                      <GalgameDialogueBox
                        speakerName={entry.sender}
                        text={entry.text}
                        typewriterSpeed={40}
                      />
                    </div>
                  );
                }
                // 历史段或非最后一条 — 直接显示
                return (
                  <div
                    key={`entry-${entry.turnIndex}-${idx}`}
                    className="px-4 py-3 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed"
                  >
                    <span className="text-wuxia-gold/80 font-bold text-xs mr-2">{entry.sender}</span>
                    {entry.text}
                  </div>
                );
              })}
            </div>

            {/* Loading 提示 */}
            {loading && (
              <div className="px-4 py-2 flex items-center gap-2 text-wuxia-gold/60 text-xs">
                <div className="w-1.5 h-1.5 bg-wuxia-gold/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-wuxia-gold/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-wuxia-gold/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span>对方正在输入...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backlog 面板 */}
      <DialogueBacklog
        entries={allEntries}
        isOpen={showBacklog}
        onClose={() => setShowBacklog(false)}
      />
    </div>
  );
};

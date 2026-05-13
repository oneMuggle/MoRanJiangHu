/**
 * GalgameDialogueBox.tsx
 *
 * Galgame 风格对话框：角色名 + 对话文本（集成打字机效果）+ 选项列表。
 */

import React from 'react';
import { useTypewriter } from '../../../hooks/useGame/ui/useTypewriter';

export interface DialogueOption {
  id: string;
  text: string;
  /** 选项后果提示（可选） */
  consequence?: string;
}

export interface GalgameDialogueBoxProps {
  /** 说话角色名称 */
  speakerName: string;
  /** 完整对话文本 */
  text: string;
  /** 打字机速度（ms/字符），默认 50 */
  typewriterSpeed?: number;
  /** 可选列表 */
  options?: DialogueOption[];
  /** 选择选项回调 */
  onOptionSelect?: (optionId: string) => void;
  /** 点击跳过回调 */
  onClick?: () => void;
  /** 禁用打字机效果，直接显示全文 */
  disableTypewriter?: boolean;
}

export const GalgameDialogueBox: React.FC<GalgameDialogueBoxProps> = ({
  speakerName,
  text,
  typewriterSpeed = 50,
  options,
  onOptionSelect,
  onClick,
  disableTypewriter = false,
}) => {
  const { displayedText, isComplete, skip } = disableTypewriter
    ? { displayedText: text, isComplete: true, skip: () => {} }
    : useTypewriter(text, { speed: typewriterSpeed });

  const handleClick = () => {
    if (!isComplete) {
      skip();
    } else {
      onClick?.();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div
        className="mx-4 mb-4 md:mx-auto md:mb-6 md:max-w-3xl bg-gray-900/95 backdrop-blur-sm border border-wuxia-gold/30 rounded-lg p-4 cursor-pointer"
        onClick={handleClick}
      >
        <div className="mb-1">
          <span className="inline-block px-3 py-0.5 bg-wuxia-gold/20 text-wuxia-gold text-sm font-bold rounded">
            {speakerName}
          </span>
        </div>

        <div className="min-h-[4rem] text-gray-200 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
          {displayedText}
          {!isComplete && <span className="inline-block w-0.5 h-4 bg-wuxia-gold animate-pulse ml-0.5" />}
        </div>

        {!isComplete && (
          <div className="mt-2 text-right text-xs text-gray-500">点击跳过</div>
        )}
      </div>

      {options && options.length > 0 && isComplete && (
        <div className="mx-4 mb-4 md:mx-auto md:max-w-3xl space-y-2">
          {options.map((option) => (
            <button
              key={option.id}
              className="w-full text-left bg-gray-800/90 border border-gray-600 hover:border-wuxia-gold/60 rounded-lg px-4 py-3 transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                onOptionSelect?.(option.id);
              }}
            >
              <span className="text-wuxia-gold group-hover:text-amber-300">{option.text}</span>
              {option.consequence && (
                <p className="text-xs text-gray-500 mt-1">{option.consequence}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

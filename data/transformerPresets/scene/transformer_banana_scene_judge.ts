import { 词组转化器提示词预设结构 } from '../../../models/system';

export const transformer_banana_scene_judge: 词组转化器提示词预设结构 = {
    id: 'transformer_banana_scene_judge',
    名称: 'GeminiBanana · 场景判定',
    类型: 'scene_judge',
    提示词: [
        '判断当前文本更适合风景场景还是故事快照。',
        '优先判断是否存在足够稳定的单帧视觉证据。',
        '如果地点、动作、在场人物、道具和空间关系至少有三项明确可见，且能归并成一个清晰瞬间，可考虑故事快照；否则改为风景场景。',
        '若文本更偏对话、回忆、情绪或抽象说明，一律回退为风景场景。',
        '即使判定通过，也要保持环境优先，避免人物占满画面。',
        '只输出"风景场景"或"故事快照"其中之一。'
    ].join('\n'),
    createdAt: 6,
    updatedAt: 6
};
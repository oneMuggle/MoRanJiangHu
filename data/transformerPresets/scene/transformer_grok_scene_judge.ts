import { 词组转化器提示词预设结构 } from '../../../models/system';

export const transformer_grok_scene_judge: 词组转化器提示词预设结构 = {
    id: 'transformer_grok_scene_judge',
    名称: 'Grok · 场景判定',
    类型: 'scene_judge',
    提示词: [
        '判断当前文本更适合生成风景场景还是故事快照。',
        '优先寻找带有明确动作方向、人物站位、道具交互和环境细节的单一时刻。',
        '若正文更像情绪描写、纯对话、设定说明、回忆总结或多段连续动作，直接回退到风景场景。',
        '即使允许场景快照，也要确保环境和地点仍然是第一主体。',
        '优先选择稳定、可读、可执行的剧情瞬间。',
        '只输出"风景场景"或"故事快照"其中之一。'
    ].join('\n'),
    createdAt: 9,
    updatedAt: 9
};
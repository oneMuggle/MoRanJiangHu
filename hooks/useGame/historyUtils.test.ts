import { describe, it, expect } from 'vitest';
import { formatHistoryToScript } from './historyUtils';

describe('formatHistoryToScript', () => {
    it('returns empty string for empty history', () => {
        expect(formatHistoryToScript([])).toBe('');
    });

    it('formats user messages', () => {
        const history = [{ role: 'user', content: '你好' } as any];
        const result = formatHistoryToScript(history);
        expect(result).toBe('玩家：你好');
    });

    it('formats assistant messages with structuredResponse', () => {
        const history = [
            {
                role: 'assistant' as const,
                structuredResponse: {
                    body_original_logs: [
                        { sender: '旁白', text: '风起云涌' }
                    ]
                }
            } as any
        ];
        const result = formatHistoryToScript(history);
        expect(result).toContain('风起云涌');
    });

    it('uses sender without colon for bracket format', () => {
        const history = [
            {
                role: 'assistant' as const,
                structuredResponse: {
                    body_original_logs: [
                        { sender: '【旁白】', text: '故事开始' }
                    ]
                }
            } as any
        ];
        const result = formatHistoryToScript(history);
        expect(result).toContain('【旁白】故事开始');
    });

    it('uses sender with colon for non-bracket format', () => {
        const history = [
            {
                role: 'assistant' as const,
                structuredResponse: {
                    body_original_logs: [
                        { sender: '张三', text: '你好' }
                    ]
                }
            } as any
        ];
        const result = formatHistoryToScript(history);
        expect(result).toContain('张三：你好');
    });

    it('includes gameTime prefix when present', () => {
        const history = [
            {
                role: 'user' as const,
                content: '出发',
                gameTime: '2026:04:30:14:00'
            } as any
        ];
        const result = formatHistoryToScript(history);
        expect(result).toContain('【2026:04:30:14:00】');
        expect(result).toContain('玩家：出发');
    });

    it('filters out empty lines', () => {
        const history = [
            {
                role: 'assistant' as const,
                structuredResponse: {
                    body_original_logs: [
                        { sender: '', text: '' },
                        { sender: '旁白', text: 'valid' }
                    ]
                }
            } as any
        ];
        const result = formatHistoryToScript(history);
        expect(result).toBe('旁白：valid');
    });

    it('separates multiple items with double newline', () => {
        const history = [
            { role: 'user', content: '问' } as any,
            { role: 'user', content: '答' } as any,
        ];
        const result = formatHistoryToScript(history);
        expect(result).toBe('玩家：问\n\n玩家：答');
    });

    it('includes planning text on last plannable index', () => {
        const history = [
            {
                role: 'assistant' as const,
                structuredResponse: {
                    body_original_logs: [{ sender: '旁白', text: '正文' }],
                    t_plan: '  规划内容  ',
                }
            } as any
        ];
        const result = formatHistoryToScript(history);
        expect(result).toContain('【上回合AI剧情规划】');
        expect(result).toContain('规划内容');
        expect(result).toContain('<剧情规划>');
    });

    it('uses logs fallback when body_original_logs is empty', () => {
        const history = [
            {
                role: 'assistant' as const,
                structuredResponse: {
                    body_original_logs: [],
                    logs: [{ sender: '旁白', text: 'fallback text' }]
                }
            } as any
        ];
        const result = formatHistoryToScript(history);
        expect(result).toContain('fallback text');
    });

    it('skips assistant without structuredResponse', () => {
        const history = [{ role: 'assistant' } as any];
        const result = formatHistoryToScript(history);
        expect(result).toBe('');
    });
});

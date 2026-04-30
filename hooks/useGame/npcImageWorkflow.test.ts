import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 执行NPC生图工作流 } from './npcImageWorkflow';

vi.mock('../../services/ai/image', () => ({
    generateImageFromPrompt: vi.fn(() => Promise.resolve({ dataUrl: 'data:image/png;base64,xxx' }))
}));

describe('npcImageWorkflow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('is exported as a function', () => {
        expect(typeof 执行NPC生图工作流).toBe('function');
    });
});

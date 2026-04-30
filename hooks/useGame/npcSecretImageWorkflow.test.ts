import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 执行NPC香闺秘档部位生图工作流 } from './npcSecretImageWorkflow';

vi.mock('../../services/ai/image', () => ({
    generateImageFromPrompt: vi.fn(() => Promise.resolve({ dataUrl: 'data:image/png;base64,xxx' }))
}));

describe('npcSecretImageWorkflow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('is exported as a function', () => {
        expect(typeof 执行NPC香闺秘档部位生图工作流).toBe('function');
    });
});

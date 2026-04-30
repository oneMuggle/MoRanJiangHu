import { describe, it, expect } from 'vitest';
import {
    updateIntimacy,
    getIntimacyLevel,
    canTriggerIntimacy,
    getAvailableOptions,
    createIntimacyRecord,
    triggerLixiangCultivation,
} from './intimacyUtils';

function makeNpc(overrides: any = {}) {
    return {
        id: 'npc_001',
        姓名: '张三',
        好感度: 50,
        关系状态: '普通',
        是否在场: true,
        是否队友: false,
        记忆: [],
        ...overrides,
    };
}

describe('updateIntimacy', () => {
    it('adds delta to favor', () => {
        const npc = makeNpc({ 好感度: 30 });
        const result = updateIntimacy(npc, 10);
        expect(result.好感度).toBe(40);
    });

    it('clamps to max 100', () => {
        const npc = makeNpc({ 好感度: 95 });
        const result = updateIntimacy(npc, 10);
        expect(result.好感度).toBe(100);
    });

    it('clamps to min 0', () => {
        const npc = makeNpc({ 好感度: 10 });
        const result = updateIntimacy(npc, -20);
        expect(result.好感度).toBe(0);
    });

    it('returns new object (immutability)', () => {
        const npc = makeNpc();
        const result = updateIntimacy(npc, 5);
        expect(result).not.toBe(npc);
        expect(npc.好感度).toBe(50);
    });
});

describe('getIntimacyLevel', () => {
    it('delegates to 计算亲密度等级', () => {
        const npc = makeNpc({ 好感度: 50 });
        const result = getIntimacyLevel(npc);
        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThanOrEqual(0);
    });
});

describe('canTriggerIntimacy', () => {
    it('returns boolean', () => {
        const npc = makeNpc({ 好感度: 80 });
        const result = canTriggerIntimacy(npc, '调情');
        expect(typeof result).toBe('boolean');
    });

    it('returns false for very low favor', () => {
        const npc = makeNpc({ 好感度: 0 });
        const result = canTriggerIntimacy(npc, '双修');
        expect(result).toBe(false);
    });
});

describe('getAvailableOptions', () => {
    it('returns array of options', () => {
        const npc = makeNpc({ 好感度: 50 });
        const result = getAvailableOptions(npc);
        expect(Array.isArray(result)).toBe(true);
    });
});

describe('createIntimacyRecord', () => {
    it('creates record with all fields', () => {
        const record = createIntimacyRecord('npc_001', '调情', '轻声说话', { 属性类型: '力量', 数值: 5 });
        expect(record.npcId).toBe('npc_001');
        expect(record.类型).toBe('调情');
        expect(record.描述).toBe('轻声说话');
    });
});

describe('triggerLixiangCultivation', () => {
    it('fails with low intimacy', () => {
        const npc = makeNpc({ 好感度: 10 });
        const result = triggerLixiangCultivation(npc);
        expect(result.success).toBe(false);
        expect(result.message).toContain('亲密度不足');
    });

    it('succeeds with level 5+ intimacy (好感度 >= 100)', () => {
        // Level 5 requires 好感度 >= 100 (threshold[5] = 100)
        const npc = makeNpc({ 好感度: 100 });
        const result = triggerLixiangCultivation(npc);
        expect(result.success).toBe(true);
    });

    it('uses specified 功法Id', () => {
        const npc = makeNpc({ 好感度: 100 });
        const result = triggerLixiangCultivation(npc, 'hxq_hmxmp');
        expect(result.success).toBe(true);
        expect(result.功法?.id).toBe('hxq_hmxmp');
    });
});

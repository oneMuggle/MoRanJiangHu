import { describe, it, expect } from 'vitest';
import { 合并变量校准结果到响应 } from './variableCalibrationMerge';
import type { GameResponse, TavernCommand } from '../../types';

describe('合并变量校准结果到响应', () => {
    it('merges calibration commands into response', () => {
        const base: GameResponse = {
            story_text: 'story',
            tavern_commands: [{ type: 'set', key: 'a', value: 1 }] as TavernCommand[],
        };
        const calibration = {
            commands: [{ type: 'set', key: 'b', value: 2 }] as TavernCommand[],
            reports: ['report1'],
            model: 'calibration-v1',
        };
        const result = 合并变量校准结果到响应(base, calibration);
        expect(result.tavern_commands).toHaveLength(2);
        expect(result.variable_calibration_report).toEqual(['report1']);
        expect(result.variable_calibration_model).toBe('calibration-v1');
    });

    it('preserves base commands when no calibration commands', () => {
        const base: GameResponse = {
            story_text: 'story',
            tavern_commands: [{ type: 'set', key: 'a', value: 1 }] as TavernCommand[],
        };
        const result = 合并变量校准结果到响应(base, {});
        expect(result.tavern_commands).toHaveLength(1);
    });

    it('adds calibration commands when base has none', () => {
        const base: GameResponse = { story_text: 'story' };
        const calibration = {
            commands: [{ type: 'push', key: 'list', value: 'item' }] as TavernCommand[],
        };
        const result = 合并变量校准结果到响应(base, calibration);
        expect(result.tavern_commands).toHaveLength(1);
        expect(result.variable_calibration_commands).toBeDefined();
    });

    it('handles empty base commands', () => {
        const base: GameResponse = { story_text: 'story', tavern_commands: [] };
        const calibration = {
            commands: [{ type: 'set', key: 'x', value: 0 }] as TavernCommand[],
            reports: ['calibrated'],
        };
        const result = 合并变量校准结果到响应(base, calibration);
        expect(result.tavern_commands).toHaveLength(1);
        expect(result.variable_calibration_report).toEqual(['calibrated']);
    });

    it('does not set report when calibration reports is empty', () => {
        const base: GameResponse = { story_text: 'story' };
        const calibration = { reports: [] };
        const result = 合并变量校准结果到响应(base, calibration);
        expect(result.variable_calibration_report).toBeUndefined();
    });

    it('does not set variable_calibration_commands when none', () => {
        const base: GameResponse = { story_text: 'story' };
        const result = 合并变量校准结果到响应(base, {});
        expect(result.variable_calibration_commands).toBeUndefined();
    });

    it('does not modify base response (immutability)', () => {
        const base: GameResponse = {
            story_text: 'original',
            tavern_commands: [{ type: 'set', key: 'a', value: 1 }] as TavernCommand[],
        };
        const calibration = {
            commands: [{ type: 'set', key: 'b', value: 2 }] as TavernCommand[],
        };
        合并变量校准结果到响应(base, calibration);
        expect(base.tavern_commands).toHaveLength(1); // unchanged
    });

    it('returns new object with spread base properties', () => {
        const base: GameResponse = { story_text: 'story', extra_field: 'preserved' } as any;
        const result = 合并变量校准结果到响应(base, {});
        expect((result as any).extra_field).toBe('preserved');
    });
});

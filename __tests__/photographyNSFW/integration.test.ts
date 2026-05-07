// 模块注册和参数提取集成测试

import { 规范化写真NSFW设置 } from '../../models/photographyNSFW/normalization';
import type { 写真系统扩展 } from '../../models/photographyNSFW';
import type { 游戏状态快照 } from '../../utils/storyModule/types';
import { 构建写真NSFW完整叙事约束 } from '../../prompts/runtime/photographyNSFW';
import { wrapXmlTag, createInvalidXmlTag } from '../setup/xmlParserTestHelper';
import { createMockModel, createMockShootProject, createMockLeakEvent, createMockSettings } from '../setup/mockStateFactory';

describe('规范化设置', () => {
  test('INT-16: 部分设置使用默认值补充', () => {
    const raw = { 启用写真NSFW系统: true, NSFW内容强度: '露骨' as const };
    const result = 规范化写真NSFW设置(raw);
    expect(result.启用写真NSFW系统).toBe(true);
    expect(result.NSFW内容强度).toBe('露骨');
    expect(result.主要玩法层).toBe('灰色地带');
  });
});

describe('提示词构建', () => {
  test('INT-17: buildPromptFragment全参数输出', () => {
    const result = 构建写真NSFW完整叙事约束({
      写真类型: '私房照',
      拍摄场所: '酒店',
      拍摄风格: '私房暧昧',
      当前尺度: 'R级',
      模特姓名: '张三',
      模特保护意识: '适度保护',
      摄影师姓名: '李四',
      摄影师信誉: '普通摄影师',
      内容强度: '暧昧',
      主要玩法层: '灰色地带',
      启用尺度递进: true,
      启用越界识别: true,
      启用照片交付: true,
      启用泄露事件: true,
      泄露事件频率: '中',
    });
    expect(result).toContain('写真类型');
    expect(result).toContain('玩法层');
    expect(result).toContain('状态输出要求');
  });
});

describe('XML解析', () => {
  function 解析写真系统状态(rawContent: string, currentState: 写真系统扩展): 写真系统扩展 {
    const match = rawContent.match(/<写真系统状态>\s*([\s\S]*?)\s*<\/写真系统状态>/);
    if (!match) return currentState;
    try {
      const data = JSON.parse(match[1]) as {
        更新模特档案?: Record<string, Record<string, unknown>>;
        更新项目状态?: Record<string, Record<string, unknown>>;
        新泄露事件?: Record<string, unknown>[];
      };
      const updated = { ...currentState };
      if (data.更新模特档案) {
        updated.模特档案 = { ...(updated.模特档案 || {}) };
        for (const [id, updates] of Object.entries(data.更新模特档案)) {
          const existing = updated.模特档案![id];
          if (existing) {
            updated.模特档案![id] = { ...existing, ...updates } as any;
          }
        }
      }
      if (data.更新项目状态) {
        const projects = [...(updated.进行中的拍摄项目 || [])];
        for (const [id, updates] of Object.entries(data.更新项目状态)) {
          const idx = projects.findIndex(p => p.id === id);
          if (idx >= 0) {
            projects[idx] = { ...projects[idx], ...updates } as any;
          }
        }
        updated.进行中的拍摄项目 = projects;
      }
      if (data.新泄露事件) {
        updated.泄露事件列表 = [...(updated.泄露事件列表 || []), ...(data.新泄露事件 as any[])];
      }
      return updated;
    } catch {
      return currentState;
    }
  }

  test('INT-09: 正常XML解析', () => {
    const json = JSON.stringify({
      更新模特档案: { 'model_test_001': { 安全感: 45, 信任度: 40 } },
    });
    const xml = wrapXmlTag(json);
    const state: 写真系统扩展 = {
      模特档案: { 'model_test_001': createMockModel() },
    };
    const result = 解析写真系统状态(xml, state);
    expect(result.模特档案!['model_test_001'].安全感).toBe(45);
    expect(result.模特档案!['model_test_001'].信任度).toBe(40);
  });

  test('INT-11: 无效JSON静默失败', () => {
    const xml = createInvalidXmlTag();
    const state: 写真系统扩展 = {};
    expect(解析写真系统状态(xml, state)).toEqual(state);
  });

  test('INT-12: 缺少标签不做修改', () => {
    const xml = '普通文本无标签';
    const state: 写真系统扩展 = { 模特档案: { 'm1': createMockModel() } };
    expect(解析写真系统状态(xml, state)).toEqual(state);
  });

  test('INT-13: 状态合并保留未更新字段', () => {
    const json = JSON.stringify({
      更新模特档案: { 'm1': { 安全感: 30 } },
    });
    const xml = wrapXmlTag(json);
    const state: 写真系统扩展 = {
      模特档案: { 'm1': createMockModel({ 安全感: 60, 信任度: 70 }) },
    };
    const result = 解析写真系统状态(xml, state);
    expect(result.模特档案!['m1'].安全感).toBe(30);
    expect(result.模特档案!['m1'].信任度).toBe(70);
  });

  test('INT-14: 新泄露事件追加', () => {
    const newLeak = createMockLeakEvent({ id: 'leak_new' });
    const json = JSON.stringify({ 新泄露事件: [newLeak] });
    const xml = wrapXmlTag(json);
    const state: 写真系统扩展 = {
      泄露事件列表: [createMockLeakEvent({ id: 'leak_existing' })],
    };
    const result = 解析写真系统状态(xml, state);
    expect(result.泄露事件列表).toHaveLength(2);
    expect(result.泄露事件列表![1].id).toBe('leak_new');
  });

  test('INT-15: 更新拍摄项目', () => {
    const project = createMockShootProject({ id: 'shoot_1' });
    const json = JSON.stringify({
      更新项目状态: { 'shoot_1': { 实际尺度: 'PG-13', 当前回合: 2 } },
    });
    const xml = wrapXmlTag(json);
    const state: 写真系统扩展 = { 进行中的拍摄项目: [project] };
    const result = 解析写真系统状态(xml, state);
    expect(result.进行中的拍摄项目![0].实际尺度).toBe('PG-13');
    expect(result.进行中的拍摄项目![0].当前回合).toBe(2);
  });
});

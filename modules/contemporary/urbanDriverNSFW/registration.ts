// 都市网约车 NSFW 模块注册

import type { StoryModule, 游戏状态快照 } from '../../../utils/storyModule/types';
import { 故事模块注册表 } from '../../../utils/storyModule/registry';
import type { 都市网约车NSFW设置 } from '../../../models/urbanDriverNSFW';
import { 默认都市网约车NSFW设置 } from '../../../models/urbanDriverNSFW';
import { 规范化都市网约车NSFW设置 } from '../../../models/urbanDriverNSFW/normalization';
import { 构建都市网约车完整叙事约束 } from '../../../prompts/runtime/urbanDriverNSFW';
import type { 行程NSFW类型, 乘客欲望阶段, 行程关系轨道, 醉酒状态, 药物状态, 网约车后果类型 } from '../../../models/urbanDriverNSFW';

interface 网约车运行时参数 {
  行程类型?: 行程NSFW类型;
  乘客欲望阶段?: 乘客欲望阶段;
  关系轨道?: 行程关系轨道;
  暴露风险?: number;
  紧张度?: number;
  醉酒状态?: 醉酒状态;
  药物状态?: 药物状态;
  行车记录仪状态?: '关闭' | '录制中' | '已泄露';
  内容强度: '微暗' | '暧昧' | '露骨';
  后果?: { 类型: 网约车后果类型; 严重程度: '轻微' | '中等' | '严重' | '毁灭'; NPC信息?: string };
}

function 提取网约车参数(
  gameState: 游戏状态快照,
  settings: 都市网约车NSFW设置
): 网约车运行时参数 | null {
  const 行程系统 = (gameState.都市网约车系统 as any)?.行程系统;
  if (!行程系统) return null;

  const 乘客档案 = 行程系统.乘客欲望档案;
  if (!乘客档案 || Object.keys(乘客档案).length === 0) return null;

  const 首位乘客Id = Object.keys(乘客档案)[0];
  const 焦点档案 = 乘客档案[首位乘客Id];
  if (!焦点档案) return null;

  return {
    行程类型: 行程系统.当前行程类型,
    乘客欲望阶段: 焦点档案.当前阶段,
    关系轨道: 焦点档案.关系轨道,
    暴露风险: 焦点档案.暴露风险值,
    紧张度: 焦点档案.紧张度?.当前值,
    醉酒状态: 焦点档案.醉酒状态,
    药物状态: 焦点档案.药物状态,
    行车记录仪状态: 行程系统.行车记录仪状态 ?? '关闭',
    内容强度: settings.NSFW内容强度,
    后果: 行程系统.后果列表?.length > 0
      ? 行程系统.后果列表[0]
      : undefined,
  };
}

const 都市网约车NSFW模块: StoryModule<都市网约车NSFW设置, 网约车运行时参数> = {
  id: 'urbanDriverNSFW',
  name: '都市网约车NSFW',
  eraId: 'contemporary_urban',
  version: '1.0.0',
  priority: 90,
  category: 'nsfw',
  description: '都市网约车 NSFW 深化系统：乘客欲望状态机、行程场景、醉酒/下药、行车记录仪、后果系统',
  masterToggleKey: '启用都市网约车NSFW系统',
  dependencies: [],
  defaultSettings: 默认都市网约车NSFW设置,
  normalizeSettings: (raw) => 规范化都市网约车NSFW设置(raw as Partial<都市网约车NSFW设置>),
  extractPromptParams: 提取网约车参数,
  buildPromptFragment: (params) => {
    return 构建都市网约车完整叙事约束({
      行程类型: params.行程类型,
      乘客欲望阶段: params.乘客欲望阶段,
      关系轨道: params.关系轨道,
      暴露风险: params.暴露风险,
      紧张度: params.紧张度,
      醉酒状态: params.醉酒状态,
      药物状态: params.药物状态,
      行车记录仪状态: params.行车记录仪状态,
      内容强度: params.内容强度,
      后果: params.后果,
    });
  },
  responseTag: '都市网约车系统状态',
};

故事模块注册表.注册模块(都市网约车NSFW模块);

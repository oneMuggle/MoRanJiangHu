import type { NPC欲望档案, 露出状态, 紧张度状态, 权力天平状态, 服从度状态, 校园祭状态, 桌游状态, 欲望阶段, 关系轨道, 权力倾向 } from '../../../models/campusNSFW';

function 从性格推断初始档案(npc: { 核心性格特征?: string; 性癖?: string; 关系状态?: string; 好感度?: number }): { 当前阶段: 欲望阶段; 阶段进度: number; 关系轨道: 关系轨道; 轨道进度: number; 权力倾向: 权力倾向 } {
  const traits = [npc.核心性格特征, npc.性癖, npc.关系状态].filter(Boolean).join(' ').toLowerCase();
  const 好感度 = npc.好感度 ?? 0;
  const 支配关键词 = ['强势', '霸道', '支配', '女王', '傲娇', '主动', '征服', '控制', '傲慢', '野心'];
  const 开放关键词 = ['开放', '大胆', '放荡', '淫', '色', '欲望', '渴求', '魅魔', '诱惑', '勾引'];
  const 温柔关键词 = ['温柔', '内向', '害羞', '腼腆', '纯真', '纯洁', '保守', '矜持', '含蓄'];
  const 支配分 = 支配关键词.filter(k => traits.includes(k)).length;
  const 开放分 = 开放关键词.filter(k => traits.includes(k)).length;
  const 温柔分 = 温柔关键词.filter(k => traits.includes(k)).length;

  let 当前阶段: 欲望阶段 = '克制';
  let 阶段进度 = 0;
  if (开放分 >= 2 || (开放分 >= 1 && 好感度 > 50)) { 当前阶段 = '渴望'; 阶段进度 = 20; }
  else if (开放分 >= 1 || 支配分 >= 2 || 好感度 > 60) { 当前阶段 = '试探'; 阶段进度 = 15; }
  else if (支配分 >= 1 || 好感度 > 30) { 当前阶段 = '试探'; 阶段进度 = 5; }

  let 关系轨道: 关系轨道 = '纯爱';
  let 轨道进度 = 0;
  if (traits.includes('多角') || traits.includes('花心') || traits.includes('滥情')) { 关系轨道 = '多角'; 轨道进度 = 5; }
  else if (开放分 >= 2 || traits.includes('肉体') || traits.includes('肉欲')) { 关系轨道 = '肉体'; 轨道进度 = 5; }
  else if (开放分 >= 1 || traits.includes('暧昧')) { 关系轨道 = '暧昧'; 轨道进度 = 10; }

  let 权力倾向: 权力倾向 = '切换者';
  if (支配分 >= 2) 权力倾向 = '绝对支配';
  else if (支配分 >= 1) 权力倾向 = '偏支配';
  else if (温柔分 >= 2 && 开放分 === 0) 权力倾向 = '偏服从';

  return { 当前阶段, 阶段进度, 关系轨道, 轨道进度, 权力倾向 };
}

export function 创建默认欲望档案(): NPC欲望档案 {
  return {
    当前阶段: '克制', 阶段进度: 0, 关系轨道: '纯爱', 轨道进度: 0,
    最后一次互动时间: new Date().toISOString(), 互动冷却期: 0,
    暴露风险值: 0, 流言等级: 0, 学业影响: '无', 已暴露次数: 0, 最大紧张度: 0, 权力倾向: '切换者',
  };
}

export function 从NPC创建欲望档案(npc: { id?: string; 核心性格特征?: string; 性癖?: string; 关系状态?: string; 好感度?: number }): NPC欲望档案 {
  const 推断 = 从性格推断初始档案(npc);
  return {
    ...推断, 最后一次互动时间: new Date().toISOString(), 互动冷却期: 0,
    暴露风险值: 0, 流言等级: 0, 学业影响: '无', 已暴露次数: 0, 最大紧张度: 0,
    BDSM关系: { 阶段: '初识', 服从度: 0, 权力天平: 0, 契约记录: [], 任务历史: [], 日常指令: [], 里程碑: [], 安全词: '月光', 底线列表: [] },
  };
}

export function 创建默认露出状态(): 露出状态 {
  return { 当前等级: 0, 等级进度: 0, 最后一次露出尝试: new Date().toISOString(), 成功露出次数: 0, 暴露失败次数: 0, 最大紧张度记录: 0 };
}

export function 创建默认紧张度状态(): 紧张度状态 {
  return { 当前值: 0, 周围人数: 0, 互动强度系数: 1.0, 周围人状态: '正常上课', NPC公开行为: '无' };
}

export function 创建默认权力天平(): 权力天平状态 {
  return { 当前值: 0, 波动范围: 30, 已交互次数: 0, 是否已固化: false };
}

export function 创建默认服从度(): 服从度状态 {
  return { 当前值: 50, 未完成指令数: 0, 连续拒绝次数: 0, 连续服从回合: 0, 最后指令时间: new Date().toISOString() };
}

export function 创建默认校园祭状态(): 校园祭状态 {
  return {
    阶段: '未开始', 主题: '经典校园祭', 班级摊位: '咖啡厅', 是否有舞台表演: false,
    筹备进度: 0, 已触发筹备NSFW: false, 已触发摊位NSFW: false, 已触发舞台NSFW: false,
    已解锁特殊场景: [], 服装试穿发生: false, 排练独处发生: false, 告白已发生: false,
    总NSFW场景数: 0,
  };
}

export function 创建默认桌游状态(): 桌游状态 {
  return { 当前桌游: null, 桌游类型: null, 历史桌游记录: [], 桌游偏好: {} };
}

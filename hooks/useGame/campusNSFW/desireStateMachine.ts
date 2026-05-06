import type { NPC欲望档案, 欲望阶段, 关系轨道, 亲密里程碑, 里程碑类型, 后果记录, 后果类型 } from '../../../models/campusNSFW';
import type { 校园亲密互动类型 } from '../../../models/intimacy';
import { 欲望阶段推进基础值, 互动基础冷却, 地点暴露风险基础值, 选择系数, 欲望阶段冷却修正, 欲望阶段列表, 时间段修正 } from './constants';

export function 计算欲望阶段推进(
  当前档案: NPC欲望档案,
  互动类型: 校园亲密互动类型,
  地点暴露风险: string,
  选择倾向: string
): number {
  const 基础值 = 欲望阶段推进基础值[互动类型] ?? 5;
  const 地点加成 = 地点暴露风险基础值[地点暴露风险] !== undefined
    ? 1.0 + (地点暴露风险基础值[地点暴露风险] / 100 - 0.5) * 0.5
    : 1.0;
  const 系数 = 选择系数[选择倾向] ?? 1.0;
  const 随机波动 = 0.9 + Math.random() * 0.2;
  return Math.round(基础值 * 地点加成 * 系数 * 随机波动);
}

export function 检查欲望阶段升级(当前档案: NPC欲望档案): { 升级: boolean; 新阶段: 欲望阶段 } {
  if (当前档案.阶段进度 >= 100) {
    const 当前索引 = 欲望阶段列表.indexOf(当前档案.当前阶段);
    if (当前索引 < 欲望阶段列表.length - 1) {
      return { 升级: true, 新阶段: 欲望阶段列表[当前索引 + 1] };
    }
  }
  return { 升级: false, 新阶段: 当前档案.当前阶段 };
}

export function 计算互动冷却(互动类型: 校园亲密互动类型, 欲望阶段: 欲望阶段): number {
  const 基础冷却 = 互动基础冷却[互动类型] ?? 1;
  const 阶段修正 = 欲望阶段冷却修正[欲望阶段] ?? 1.0;
  return Math.max(0, Math.round(基础冷却 * 阶段修正));
}

export function 计算暴露风险(地点暴露风险: string, 时间段: string, 流言等级: number): number {
  const 基础风险 = 地点暴露风险基础值[地点暴露风险] ?? 50;
  const 时间修正 = 时间段修正[时间段] ?? 1.0;
  let 流言修正 = 1.0;
  if (流言等级 <= 1) 流言修正 = 1.0;
  else if (流言等级 <= 3) 流言修正 = 1.2;
  else 流言修正 = 1.5;
  return Math.min(100, Math.round(基础风险 * 时间修正 * 流言修正));
}

export function 判定后果(
  暴露风险: number,
  学业影响: string,
  多角NPC数: number,
  欲望阶段: 欲望阶段,
  流言等级: number
): { 触发: boolean; 类型?: 后果类型; 严重程度?: 后果记录['严重程度'] } {
  if (暴露风险 >= 80) return { 触发: true, 类型: '暴露风险', 严重程度: '严重' };
  if (暴露风险 >= 60) return { 触发: true, 类型: '暴露风险', 严重程度: '中等' };
  if (流言等级 >= 4) return { 触发: true, 类型: '流言传播', 严重程度: '严重' };
  if (流言等级 >= 2) return { 触发: true, 类型: '流言传播', 严重程度: '轻微' };
  if (学业影响 === '显著') return { 触发: true, 类型: '学业下滑', 严重程度: '毁灭' };
  if (学业影响 === '中等') return { 触发: true, 类型: '学业下滑', 严重程度: '中等' };
  if (多角NPC数 >= 3) return { 触发: true, 类型: '多角冲突', 严重程度: '严重' };
  if (多角NPC数 >= 2) return { 触发: true, 类型: '多角冲突', 严重程度: '中等' };
  if (欲望阶段 === '克制' && 暴露风险 > 50) return { 触发: true, 类型: '心理负担', 严重程度: '轻微' };
  return { 触发: false };
}

export function 判定关系轨道(
  最近里程碑: 亲密里程碑[],
  欲望阶段: 欲望阶段,
  多角NPC数: number
): { 轨道: 关系轨道; 理由: string } {
  if (欲望阶段 === '支配') return { 轨道: '支配', 理由: '欲望阶段达到支配' };
  if (多角NPC数 >= 2) return { 轨道: '多角', 理由: `同时与 ${多角NPC数} 个NPC发展关系` };
  const 最近5个 = 最近里程碑.slice(-5);
  if (最近5个.length < 3) return { 轨道: '纯爱', 理由: '里程碑不足，默认纯爱' };
  const 保守数 = 最近5个.filter(m => m.选择分支 === '保守').length;
  const 中性数 = 最近5个.filter(m => m.选择分支 === '中性').length;
  const 激进数 = 最近5个.filter(m => m.选择分支 === '激进').length;
  const 总数 = 最近5个.length;
  if (保守数 / 总数 > 0.6) return { 轨道: '纯爱', 理由: '保守选项占比超过60%' };
  if (激进数 / 总数 > 0.6) return { 轨道: '肉体', 理由: '激进选项占比超过60%' };
  if (中性数 / 总数 > 0.6) return { 轨道: '暧昧', 理由: '中性选项占比超过60%' };
  return { 轨道: '纯爱', 理由: '无明显倾向，默认纯爱' };
}

export function 模拟流言传播(当前等级: number, 暴露事件数: number, 无新暴露回合: number): number {
  let 新等级 = 当前等级 + Math.floor(暴露事件数 / 3);
  新等级 = Math.min(5, 新等级);
  if (无新暴露回合 >= 10) 新等级 = Math.max(0, 新等级 - Math.floor(无新暴露回合 / 10));
  return 新等级;
}

export function 生成里程碑(
  _npcId: string,
  npc姓名: string,
  类型: 里程碑类型,
  描述: string,
  选择分支: string,
  地点: string,
  后续影响: string
): 亲密里程碑 {
  return {
    id: `milestone_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    时间: new Date().toISOString(),
    地点,
    NPC姓名: npc姓名,
    里程碑类型: 类型,
    描述,
    选择分支,
    后续影响,
  };
}

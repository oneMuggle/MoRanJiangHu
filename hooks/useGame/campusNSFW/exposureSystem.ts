import type { 露出状态, 露出偏好等级, 旁观者, 旁观者反应, 紧张度状态, 网络流言状态 } from '../../../models/campusNSFW';
import type { 欲望阶段 } from '../../../models/campusNSFW';
import { 旁观者距离基础察觉率, 旁观者类型修正, 旁观者反应权重 } from './constants';

export function 计算露出偏好推进(
  当前档案: { 露出状态?: 露出状态 },
  欲望阶段: 欲望阶段,
  选择倾向: string,
  当前暴露风险: number,
  npc性格外向: boolean,
  之前发生过暴露: boolean
): { 新等级: 露出偏好等级; 新进度: number; 升级: boolean } {
  const 露出状态 = 当前档案.露出状态;
  if (!露出状态) return { 新等级: 0, 新进度: 0, 升级: false };
  let 基础概率 = 0.05;
  if (欲望阶段 === '试探') 基础概率 = 0.05;
  else if (欲望阶段 === '渴望') 基础概率 = 0.15;
  else if (欲望阶段 === '沉沦') 基础概率 = 0.30;
  else if (欲望阶段 === '支配') 基础概率 = 0.50;
  let 修正系数 = 1.0;
  if (选择倾向 === '冒险暴露') 修正系数 *= 2.0;
  else if (选择倾向 === '安全隐蔽') 修正系数 *= 0.3;
  if (当前暴露风险 > 70) 修正系数 *= 1.5;
  if (npc性格外向) 修正系数 *= 1.3;
  else 修正系数 *= 0.7;
  if (之前发生过暴露) 修正系数 *= 1.8;
  const 触发概率 = 基础概率 * 修正系数;
  if (Math.random() < 触发概率) {
    const 进度增加 = Math.floor(10 + Math.random() * 15);
    const 新进度 = Math.min(100, 露出状态.等级进度 + 进度增加);
    if (新进度 >= 100 && 露出状态.当前等级 < 5) {
      return { 新等级: (露出状态.当前等级 + 1) as 露出偏好等级, 新进度: 0, 升级: true };
    }
    return { 新等级: 露出状态.当前等级, 新进度, 升级: false };
  }
  return { 新等级: 露出状态.当前等级, 新进度: 露出状态.等级进度, 升级: false };
}

export function 计算紧张度(参数: {
  场景基础值: number; 周围人数: number; 互动强度系数: number;
  周围人状态: 紧张度状态['周围人状态'];
  npc公开行为: 紧张度状态['NPC公开行为'];
  露出偏好等级: 露出偏好等级;
}): number {
  const { 场景基础值, 周围人数, 互动强度系数, npc公开行为, 露出偏好等级 } = 参数;
  let 人数修正 = 1.0;
  if (周围人数 <= 2) 人数修正 = 0.5;
  else if (周围人数 <= 10) 人数修正 = 1.0;
  else if (周围人数 <= 30) 人数修正 = 1.5;
  else 人数修正 = 2.0;
  let 行为修正 = 1.0;
  if (npc公开行为 === '正在发言') 行为修正 = 2.0;
  else if (npc公开行为 === '需要回应') 行为修正 = 1.5;
  const 紧张度 = 场景基础值 * 人数修正 * 互动强度系数 * 行为修正;
  const 露出缓和 = 1.0 - (露出偏好等级 * 0.05);
  return Math.min(100, Math.round(紧张度 * 露出缓和));
}

export function 判定旁观者察觉(旁观者: 旁观者, 紧张度: number): boolean {
  const 基础察觉 = 旁观者距离基础察觉率[旁观者.距离] ?? 5;
  const 类型修正 = 旁观者类型修正[旁观者.类型] ?? 1.0;
  const 紧张度修正 = 1.0 + (紧张度 / 100) * 0.5;
  return Math.random() * 100 < 基础察觉 * 类型修正 * 紧张度修正;
}

export function 模拟旁观者反应(已察觉: boolean): 旁观者反应 {
  if (!已察觉) return '未察觉';
  const 总权重 = 旁观者反应权重.reduce((sum, r) => sum + r.权重, 0);
  let 随机值 = Math.random() * 总权重;
  for (const { 反应, 权重 } of 旁观者反应权重) {
    随机值 -= 权重;
    if (随机值 <= 0) return 反应;
  }
  return '假装没看到';
}

export function 模拟网络传播(
  当前网络流言: 网络流言状态 | undefined,
  有偷拍证据: boolean,
  口头流言等级: number,
  无新事件回合: number,
  正在辟谣: boolean
): 网络流言状态 {
  const 状态 = 当前网络流言 ?? {
    当前等级: 0, 传播渠道: [] as ('匿名论坛' | '校园群' | '截图流传' | '社交媒体')[], 有无证据: false,
    最新传播时间: new Date().toISOString(), 辟谣状态: '未辟谣' as const,
  };
  let 新等级 = 状态.当前等级;
  const 新渠道: ('匿名论坛' | '校园群' | '截图流传' | '社交媒体')[] = [...状态.传播渠道];
  let 有证据 = 状态.有无证据 || 有偷拍证据;
  if (有偷拍证据 && 口头流言等级 >= 2 && 新等级 < 1) { 新等级 = 1; if (!新渠道.includes('匿名论坛')) 新渠道.push('匿名论坛'); }
  if (口头流言等级 >= 3 && 新等级 < 2) { 新等级 = 2; if (!新渠道.includes('校园群')) 新渠道.push('校园群'); }
  if (有证据 && 口头流言等级 >= 4 && 新等级 < 3) { 新等级 = 3; if (!新渠道.includes('截图流传')) 新渠道.push('截图流传'); }
  if (口头流言等级 >= 5 && 新等级 < 4) { 新等级 = 4; if (!新渠道.includes('社交媒体')) 新渠道.push('社交媒体'); }
  if (无新事件回合 >= 15) {
    const 衰减值 = 正在辟谣 ? Math.floor(无新事件回合 / 7.5) : Math.floor(无新事件回合 / 15);
    新等级 = Math.max(0, 新等级 - 衰减值);
  }
  return { ...状态, 当前等级: 新等级, 传播渠道: 新渠道, 有无证据: 有证据, 最新传播时间: new Date().toISOString(), 辟谣状态: 正在辟谣 ? '正在辟谣' : 状态.辟谣状态 };
}

export function 计算回合衰减(参数: { 当前暴露风险: number; 当前流言等级: number; 正在辟谣?: boolean }): { 新暴露风险: number; 新流言等级: number } {
  const { 当前暴露风险, 当前流言等级, 正在辟谣 } = 参数;
  return { 新暴露风险: Math.max(0, 当前暴露风险 - 5), 新流言等级: Math.max(0, 当前流言等级 - (正在辟谣 ? 4 : 2)) };
}

export function 计算露出衰减(参数: { 当前露出状态: 露出状态 | undefined; 无互动回合: number }): 露出状态 | undefined {
  const { 当前露出状态, 无互动回合 } = 参数;
  if (!当前露出状态 || 当前露出状态.当前等级 === 0) return 当前露出状态;
  let 新进度 = Math.max(0, 当前露出状态.等级进度 - Math.floor(无互动回合 / 3) * 10);
  const 旧等级 = 当前露出状态.当前等级;
  let 新等级: 露出偏好等级 = 旧等级;
  if (新进度 === 0 && 新等级 > 0 && 无互动回合 >= 10) { 新等级 = Math.max(0, 新等级 - 1) as 露出偏好等级; 新进度 = 50; }
  return { ...当前露出状态, 当前等级: 新等级 as 露出偏好等级, 等级进度: 新进度 };
}

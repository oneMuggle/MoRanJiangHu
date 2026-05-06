import type { 校园祭阶段, 摊位类型, 校园祭主题, 校园祭状态, 后夜祭状态, 欲望阶段 } from '../../../models/campusNSFW';

export function 判定校园祭触发(参数: {
  当前学期: number; 当前回合: number; 上次校园祭回合: number;
  有NPC欲望阶段达标: boolean; 校园祭设置开启: boolean;
}): boolean {
  const { 当前学期, 当前回合, 上次校园祭回合, 有NPC欲望阶段达标, 校园祭设置开启 } = 参数;
  if (!校园祭设置开启) return false;
  if (!有NPC欲望阶段达标) return false;
  if (当前回合 - 上次校园祭回合 < 30) return false;
  const 学期概率: Record<number, number> = { 1: 0.30, 2: 0.50, 3: 0.40 };
  const 概率 = 学期概率[当前学期] ?? 0.30;
  return Math.random() < 概率;
}

export function 选择校园祭主题(学期: number): 校园祭主题 {
  switch (学期) {
    case 1: { const r = Math.random(); if (r < 0.4) return '经典校园祭'; if (r < 0.7) return '冬季校园祭'; return '毕业校园祭'; }
    case 2: { const r = Math.random(); if (r < 0.4) return '经典校园祭'; if (r < 0.7) return '万圣节校园祭'; return '夏日祭'; }
    case 3: return '毕业校园祭';
    default: return '经典校园祭';
  }
}

export function 选择摊位类型(): 摊位类型 {
  const 列表: 摊位类型[] = ['鬼屋', '咖啡厅', '女仆咖啡厅', '执事咖啡厅', '小吃摊', '烧烤摊', '展示类', '游戏摊位'];
  return 列表[Math.floor(Math.random() * 列表.length)];
}

export function 推进校园祭阶段(当前状态: 校园祭状态, 经过回合: number): 校园祭阶段 {
  const 阶段回合数: Record<校园祭阶段, number> = { '未开始': 0, '筹备期': 12, '预热期': 4, '举办期': 7, '收尾期': 2, '已结束': 0 };
  let 剩余回合 = 经过回合;
  let 当前阶段 = 当前状态.阶段;
  while (剩余回合 > 0 && 当前阶段 !== '已结束') {
    const 需要回合 = 阶段回合数[当前阶段];
    if (需要回合 === 0) break;
    if (剩余回合 >= 需要回合) {
      剩余回合 -= 需要回合;
      switch (当前阶段) {
        case '筹备期': 当前阶段 = '预热期'; break;
        case '预热期': 当前阶段 = '举办期'; break;
        case '举办期': 当前阶段 = '收尾期'; break;
        case '收尾期': 当前阶段 = '已结束'; break;
        default: break;
      }
    } else break;
  }
  return 当前阶段;
}

export function 判定告白条件(参数: {
  npc欲望阶段: 欲望阶段; npc好感度: number; 校园祭阶段: 校园祭阶段;
  后夜祭阶段: 后夜祭状态['阶段']; 酒精影响: boolean;
}): { 可告白: boolean; 成功概率: number } {
  const { npc欲望阶段, npc好感度, 校园祭阶段, 后夜祭阶段, 酒精影响 } = 参数;
  if (npc欲望阶段 !== '渴望' && npc欲望阶段 !== '沉沦' && npc欲望阶段 !== '支配') return { 可告白: false, 成功概率: 0 };
  if (校园祭阶段 !== '举办期' && 校园祭阶段 !== '收尾期') return { 可告白: false, 成功概率: 0 };
  if (后夜祭阶段 !== '告白时间' && 后夜祭阶段 !== '自由时间') return { 可告白: false, 成功概率: 0 };
  let 概率 = 30;
  if (npc欲望阶段 === '沉沦') 概率 += 20;
  if (npc欲望阶段 === '支配') 概率 += 30;
  if (npc好感度 >= 60) 概率 += 15;
  if (npc好感度 >= 80) 概率 += 15;
  if (酒精影响) 概率 += 10;
  return { 可告白: true, 成功概率: Math.min(95, 概率) };
}

export function 处理告白结果(成功概率: number, 告白: boolean): { 结果: '成功' | '拒绝' | '未告白'; 关系轨道变更?: '纯爱'; 亲密度变化: number } {
  if (!告白) return { 结果: '未告白', 亲密度变化: -5 };
  if (Math.random() * 100 < 成功概率) return { 结果: '成功', 关系轨道变更: '纯爱', 亲密度变化: 25 };
  return { 结果: '拒绝', 亲密度变化: -15 };
}

export function 判定多角冲突(参数: { 多角NPC列表: Array<{ id: string; 欲望阶段: 欲望阶段; 好感度: number }> }): boolean {
  const { 多角NPC列表 } = 参数;
  if (多角NPC列表.length < 2) return false;
  const 高欲望NPC = 多角NPC列表.filter(npc => npc.欲望阶段 === '渴望' || npc.欲望阶段 === '沉沦' || npc.欲望阶段 === '支配');
  return 高欲望NPC.length >= 2 && Math.random() < 0.4;
}

export function 生成摊位NSFW场景(摊位: 摊位类型, 欲望阶段: 欲望阶段): string[] {
  const 场景: string[] = [];
  switch (摊位) {
    case '鬼屋':
      if (欲望阶段 !== '克制') 场景.push('鬼屋的黑暗中，NPC借着"惊吓"的名义靠近，外面的游客完全不知道里面发生了什么');
      if (欲望阶段 === '渴望' || 欲望阶段 === '沉沦' || 欲望阶段 === '支配') 场景.push('在鬼屋最深处，NPC的手悄悄握住了玩家的手，尖叫声掩盖了一切');
      break;
    case '咖啡厅': case '女仆咖啡厅': case '执事咖啡厅':
      if (欲望阶段 !== '克制') 场景.push('NPC在桌下轻轻碰了碰玩家的腿，脸上却保持着专业的微笑');
      break;
    case '小吃摊': case '烧烤摊':
      if (欲望阶段 !== '克制') 场景.push('NPC借着"试吃"的名义，用筷子将食物送到玩家嘴边，烟火气中眼神暧昧');
      break;
    case '游戏摊位':
      if (欲望阶段 !== '克制') 场景.push('NPC教玩家玩游戏时，身体不自觉地贴近，"我帮你瞄准..."');
      break;
    case '展示类':
      if (欲望阶段 === '试探' || 欲望阶段 === '渴望' || 欲望阶段 === '沉沦' || 欲望阶段 === '支配') 场景.push('NPC在展台后面，趁着没人注意的时候，偷偷对玩家做了个亲昵的手势');
      break;
  }
  return 场景;
}

export function 生成后夜祭场景(参数: { 后夜祭类型: 后夜祭状态['类型']; 欲望阶段: 欲望阶段; 酒精影响: boolean; 告白已发生: boolean }): string[] {
  const { 后夜祭类型, 欲望阶段, 酒精影响, 告白已发生 } = 参数;
  const 场景: string[] = [];
  switch (后夜祭类型) {
    case '篝火晚会':
      场景.push('篝火旁的NPC脸庞被火光照亮，眼神格外温柔');
      if (欲望阶段 !== '克制' && !告白已发生) 场景.push('"能单独聊一会儿吗？"NPC邀请玩家远离篝火');
      break;
    case '烟花大会':
      场景.push('烟花绽放的瞬间，周围的人都欢呼起来，NPC却在黑暗中靠近了玩家');
      if (欲望阶段 !== '克制') 场景.push('烟花的声音掩盖了心跳声，NPC在光亮交替中握住了玩家的手');
      break;
    case '宿舍派对': case '自由派对':
      if (酒精影响) 场景.push('酒精让NPC的脸颊微微泛红，眼神比平时更加大胆');
      if (欲望阶段 !== '克制') 场景.push('派对的音乐声中，NPC在角落里拉住了玩家的衣角');
      break;
  }
  return 场景;
}

export function 生成筹备期场景(参数: { 场景类型: '班级讨论' | '服装试穿' | '排练独处' | '深夜赶工' | '道具制作'; 欲望阶段: 欲望阶段 }): string[] {
  const { 场景类型, 欲望阶段 } = 参数;
  const 场景: string[] = [];
  switch (场景类型) {
    case '班级讨论': if (欲望阶段 !== '克制') 场景.push('全班都在热烈讨论，NPC却悄悄在桌子下面碰了碰玩家的膝盖'); break;
    case '服装试穿': if (欲望阶段 === '试探' || 欲望阶段 === '渴望' || 欲望阶段 === '沉沦' || 欲望阶段 === '支配') 场景.push('"这个拉链我拉不上，能帮帮我吗？"NPC转过身，后背对着玩家'); break;
    case '排练独处': if (欲望阶段 !== '克制') 场景.push('排练间隙的空教室，NPC擦了擦额头的汗，笑着看向玩家："休息一下吧"'); break;
    case '深夜赶工': if (欲望阶段 === '渴望' || 欲望阶段 === '沉沦' || 欲望阶段 === '支配') 场景.push('深夜的教室只剩两人，NPC疲惫地靠在桌上："好累啊..."眼神却在火光中格外柔软'); break;
    case '道具制作': if (欲望阶段 !== '克制') 场景.push('搬运大型道具时，两人的身体不可避免地贴在了一起'); break;
  }
  return 场景;
}

export function 计算校园祭总NSFW(状态: 校园祭状态): number {
  let 总数 = 0;
  if (状态.已触发筹备NSFW) 总数 += 1;
  if (状态.已触发摊位NSFW) 总数 += 1;
  if (状态.已触发舞台NSFW) 总数 += 1;
  总数 += 状态.总NSFW场景数;
  if (状态.后夜祭状态) 总数 += 状态.后夜祭状态.触发NSFW场景数;
  return 总数;
}

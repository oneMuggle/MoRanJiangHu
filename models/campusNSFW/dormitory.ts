/**
 * 校园宿舍系统数据模型
 * 宿舍类型、室友关系、私密场景
 */

export type 宿舍类型 = '男生宿舍' | '女生宿舍' | '混合宿舍';
export type 宿舍楼栋 = '1号楼' | '2号楼' | '3号楼' | '4号楼' | '5号楼' | '6号楼';
export type 室友职位 = '舍长' | '副舍长' | '普通室友';

export interface 宿舍成员 {
  npcId: string;
  职位: 室友职位;
  入住时间: string;
  共眠次数: number; // 共同过夜次数
  私密互动次数: number;
}

export interface 宿舍数据 {
  宿舍ID: string;
  宿舍类型: 宿舍类型;
  楼栋: 宿舍楼栋;
  房间号: string;
  成员: 宿舍成员[];
  私密程度: number; // 0-100，影响可触发事件类型
  装饰度: number; // 0-100，可升级
  整洁度: number; // 0-100，影响NPC心情
  创建时间: string;
  最后互动时间?: string;
}

export interface 宿舍事件 {
  id: string;
  宿舍ID: string;
  类型: '日常' | '深夜' | '周末' | '节假日' | '特殊';
  标题: string;
  描述: string;
  涉及NPC: string[];
  私密程度: number;
  时间: string;
}

/**
 * 创建默认宿舍数据
 */
export function 创建默认宿舍数据(
  宿舍ID: string,
  类型: 宿舍类型,
  楼栋: 宿舍楼栋,
  房间号: string
): 宿舍数据 {
  return {
    宿舍ID,
    宿舍类型: 类型,
    楼栋,
    房间号,
    成员: [],
    私密程度: 30,
    装饰度: 20,
    整洁度: 60,
    创建时间: new Date().toISOString(),
  };
}

/**
 * 宿舍类型对应的私密程度基数
 */
export const 宿舍类型私密基数: Record<宿舍类型, number> = {
  '男生宿舍': 20,
  '女生宿舍': 25,
  '混合宿舍': 40,
};

/**
 * 室友职位对应的初始贡献度
 */
export const 室友职位贡献基数: Record<室友职位, number> = {
  '舍长': 50,
  '副舍长': 30,
  '普通室友': 10,
};

/**
 * 装饰度升级消耗
 */
export const 装饰升级消耗 = {
  初级: { 金钱: 500, 材料: [] },
  中级: { 金钱: 1500, 材料: ['墙纸', '地毯'] },
  高级: { 金钱: 3000, 材料: ['墙纸', '地毯', '窗帘', '装饰灯'] },
};

/**
 * 计算宿舍私密事件触发概率
 */
export function 计算私密事件概率(宿舍: 宿舍数据): number {
  const baseProbability = 10; // 基础10%
  const 私密加成 = Math.floor(宿舍.私密程度 / 10) * 2;
  const 装饰加成 = Math.floor(宿舍.装饰度 / 20) * 1;
  const 整洁惩罚 = Math.floor((100 - 宿舍.整洁度) / 25) * 1;
  
  return Math.max(5, Math.min(60, baseProbability + 私密加成 + 装饰加成 - 整洁惩罚));
}

/**
 * 获取宿舍描述文本
 */
export function 获取宿舍描述(宿舍: 宿舍数据): string {
  const 楼栋描述 = `${宿舍.楼栋}${宿舍.房间号}室`;
  const 装饰描述 = 宿舍.装饰度 >= 60 ? '温馨舒适' : 宿舍.装饰度 >= 30 ? '简单整洁' : '略显简陋';
  const 整洁描述 = 宿舍.整洁度 >= 70 ? '干净明亮' : 宿舍.整洁度 >= 40 ? '还算整洁' : '有些凌乱';
  
  return `${楼栋描述}，${装饰描述}、${整洁描述}。`;
}

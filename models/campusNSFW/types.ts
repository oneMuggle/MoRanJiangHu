/**
 * 校园纪元玩法深度扩展 - 类型定义
 * 
 * 包含：社团系统、学业追踪、校园传闻、学期日历、宿舍系统
 * 
 * 来源：docs/plans/2026-05-03_campus-era-gameplay-deepening.md
 */

// Import dormitory types directly (needed for local interface)
import type {
  宿舍类型,
  宿舍楼栋,
  室友职位,
  宿舍成员,
  宿舍数据,
  宿舍事件,
} from './dormitory';

// Re-export dormitory types
export type {
  宿舍类型,
  宿舍楼栋,
  室友职位,
  宿舍成员,
  宿舍数据,
  宿舍事件,
};

export {
  创建默认宿舍数据,
  宿舍类型私密基数,
  室友职位贡献基数,
  装饰升级消耗,
  计算私密事件概率,
  获取宿舍描述,
} from './dormitory';

// ==================== 社团系统类型 ====================

export type 社团类型 = '学术' | '艺术' | '体育' | '社交' | '神秘' | '综合';
export type 社团职位 = '会长' | '副会长' | '骨干' | '普通成员';
export type 社团活动类型 = '比赛' | '演出' | '讲座' | '团建' | '社会实践' | '日常聚会';

export interface 社团成员 {
  npcId: string;
  职位: 社团职位;
  加入时间: string;
  贡献度: number; // 0-100
  请假次数: number;
  最后活跃时间?: string;
}

export interface 社团资源 {
  资金: number;
  名气: number;    // 影响招募和活动效果
  凝聚力: number; // 影响活动成功率
  人脉: number;   // 影响对外合作
}

export interface 社团活动 {
  id: string;
  名称: string;
  类型: 社团活动类型;
  描述: string;
  消耗资源: Partial<社团资源>;
  预计收益: Partial<社团资源>;
  成功率: number; // 0-100
  实际结果?: '成功' | '失败' | '部分成功';
  参与成员: string[];
  时间: string;
  持续天数: number;
}

export interface 社团数据 {
  id: string;
  名称: string;
  类型: 社团类型;
  会长Id: string; // NPC ID
  成员: 社团成员[];
  资源: 社团资源;
  等级: number;     // 1-5级
  设施等级: number; // 1-5级，影响可举办活动类型
  成立时间: string;
  描述?: string;
  招新中: boolean;
  对外关系: Record<string, number>; // 其他社团的关系 -100到100
}

// 社团升级条件
export interface 社团升级条件 {
  名气: number;
  资金: number;
  成员数: number;
}

// 社团活动配置
export interface 社团活动配置 {
  消耗资金: number;
  消耗凝聚力: number;
  名气收益: number;
  凝聚力收益: number;
  基础成功率: number;
}

// ==================== 学业追踪系统类型 ====================

export type 学期 = 1 | 2;
export type 成绩等级 = 'A' | 'B' | 'C' | 'D' | 'F';
export type 课程类型 = '必修' | '选修' | '通识';
export type 考试类型 = '期中' | '期末' | '平时' | '论文';

export interface 课程成绩 {
  课程ID: string;
  课程名: string;
  授课老师: string;
  学分: number;
  课程类型: 课程类型;
  成绩?: number;      // 0-100
  等级?: 成绩等级;
  出勤率: number;      // 0-100
  平时表现: number;    // 0-100
  期中成绩?: number;
  期末成绩?: number;
  最终成绩?: number;
}

export interface 学业状态 {
  学年: number;
  学期: 学期;
  课程列表: 课程成绩[];
  已获学分: number;
  总学分: number;
  GPA: number;              // 0-4.0
  累计GPA: number;          // 截止目前的累计GPA
  升学压力: number;          // 0-100
  奖学金资格: boolean;
  奖学金等级?: '国家奖学金' | '一等奖学金' | '二等奖学金' | '三等奖学金';
  不及格门数: number;
  警告状态: '正常' | '学业警告' | '严重警告';
  最后更新时间: string;
}

// ==================== 校园传闻系统类型 ====================

export type 传播范围 = '小圈子' | '班级' | '年级' | '全校';
export type 传闻类型 = '关系' | '八卦' | '学术' | '社团' | '事件' | '其他';
export type 传闻来源 = 'NPC行为' | '玩家行为' | '系统事件';

export interface 校园传闻 {
  id: string;
  内容: string;
  类型: 传闻类型;
  涉及NPC: string[];      // 涉及的NPC ID列表
  涉及玩家: boolean;       // 是否涉及玩家
  传播范围: 传播范围;
  真实性: number;         // 0-100，越高越真
  影响力: number;         // 0-100，影响NPC态度
  持续天数: number;       // 剩余有效天数
  创建时间: string;
  创建者?: string;        // NPC ID or 'system'
  源传闻Id?: string;      // 如果是传播来的，原传闻ID
}

// ==================== 学期日历系统类型 ====================

export type 学期事件类型 = '开学' | '期中' | '期末' | '节假日' | '社团节' | '运动会' | '校庆' | '毕业';
export type 事件标记 = '考试' | '活动' | '假期' | '仪式' | '普通';

export interface 学期事件 {
  id: string;
  名称: string;
  类型: 学期事件类型;
  标记: 事件标记;
  描述: string;
  持续天数: number;
  触发日期: string;    // 游戏内日期
  可触发剧情: string[];
  已触发剧情: string[];
  特殊效果?: {
    压力变化?: number;
    社交机会?: number;
    学业效率?: number;
  };
}

export interface 学期日历 {
  当前学年: number;
  当前学期: 1 | 2;
  学年开始日: string;
  学期开始日: string;
  当前进度日: number;   // 学期第几天
  学期总天数: number;   // 通常 90-120 天
  事件列表: 学期事件[];
  已发生事件: 学期事件[];
  下次考试日?: string;
  假期开始日?: string;
}

// ==================== 校园纪元扩展状态 ====================

/**
 * 校园纪元玩法深度扩展的完整状态
 * 集成到校园系统数据中
 */
export interface 校园纪元扩展状态 {
  // 社团系统
  社团列表: 社团数据[];
  当前社团Id?: string;
  
  // 学业追踪
  学业: 学业状态;
  
  // 传闻系统
  传闻列表: 校园传闻[];
  
  // 学期日历
  日历: 学期日历;
  
  // 宿舍系统
  当前宿舍?: 宿舍数据;
}

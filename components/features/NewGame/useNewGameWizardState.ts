import { useEffect, useMemo, useRef, useState } from 'react';
import * as dbService from '../../../services/dbService';
import { 读取小说拆分数据集列表 } from '../../../services/novel-decomposition/novelDecompositionStore';
import { randomQiyun, 气运数据, 气运数据列表 } from '../../../data/qiyun';
import { 预设天赋, 预设背景 } from '../../../data/presets';
import { resolveEraNode } from '../../../models/eraTheme';
import { 开局预设方案结构 } from '../../../data/newGamePresets';
import { 获取子纪元默认预设, 获取子纪元默认预设列表, 子纪元默认预设结构 } from '../../../data/subEraDefaultPresets';
import { OpeningConfig, WorldGenConfig, 小说拆分数据集结构, 角色数据结构, 天赋结构, 背景结构, 游戏难度 } from '../../../types';
import { 合并去重开局预设方案, 标准化开局预设方案, 生成自定义开局预设ID, 自定义开局预设存储键 } from '../../../utils/customNewGamePresets';
import {
    关系侧重选项,
    同人来源类型选项,
    同人融合强度选项,
    开局切入偏好选项,
    属性最大值,
    属性最小值,
    创建默认属性分配,
    新开局步骤列表,
    默认开局配置,
    获取难度总属性点,
    获取同人角色替换规则列表,
    格式化角色替换规则摘要,
    规范化开局配置,
    规范化可选开局配置
} from '../../../utils/openingConfig';
import { 默认境界母板提示词 } from '../../../prompts/runtime/fandom';
import { 设置键 } from '../../../utils/settingsSchema';
import { 内置时代配置, 获取时代背景 } from '../../../models/system';
import { 时代主题方案列表, 获取时代主题方案 } from '../../../models/eraTheme';
import { 体系类型 } from '../../../types';

// --- Constants ---
const STEPS = [...新开局步骤列表];

/** 背景推荐映射：每个背景对应的推荐天赋和气运 */
interface 背景推荐配置 {
    天赋: string[];
    气运: string[];
}
const 背景推荐映射: Record<string, 背景推荐配置> = {
    // 学生
    '在校大学生': { 天赋: ['考试体质', '社团达人', '奖学金猎手'], 气运: ['校园风云人物', '学霸光环', '挂科预警'] },
    // 教师
    '中小学教师': { 天赋: ['课堂掌控', '因材施教', '寒暑假自由'], 气运: ['桃李满天下', '名师出高徒', '职业倦怠'] },
    // 程序员
    '互联网程序员': { 天赋: ['Debug直觉', '开源贡献者', '全栈能力'], 气运: ['代码无Bug', '技术大牛', '35岁危机'] },
    '程序员': { 天赋: ['代码脑子', '屏幕视力', '手机依赖'], 气运: ['代码无Bug', '技术大牛', '35岁危机'] },
    // 医生
    '临床医生': { 天赋: ['临床直觉', '医患沟通术', '学术资源'], 气运: ['妙手回春', '医学天才', '医患纠纷'] },
    '急诊医生': { 天赋: ['急救知识', '临床直觉', '医患沟通术'], 气运: ['妙手回春', '医学天才', '医患纠纷'] },
    // 自由职业者
    '自由职业者': { 天赋: ['多面手', '客户维护术', '自律大师'], 气运: ['接单锦鲤', '时间管理大师', '断单焦虑'] },
    // 创业者
    '创业者': { 天赋: ['商业嗅觉', '融资能力', '团队凝聚力'], 气运: ['风口上的猪', '连续创业者', '资金链断裂'] },
    '自媒体创业者': { 天赋: ['镜头感', '社交媒体', '社群管理'], 气运: ['接单锦鲤', '时间管理大师', '断单焦虑'] },
    // 配送出行
    '外卖骑手': { 天赋: ['快递脚力', '活地图', '平台算法理解'], 气运: ['接单锦鲤', '时间管理大师', '断单焦虑'] },
    '网约车司机': { 天赋: ['活地图', '城市地图', '驾驶执照'], 气运: ['接单锦鲤', '时间管理大师', '城市地图'] },
    '快递小哥': { 天赋: ['快递脚力', '城市地图', '多线程操作'], 气运: ['接单锦鲤', '时间管理大师', '断单焦虑'] },
    '代驾司机': { 天赋: ['驾驶执照', '夜行直觉', '夜猫子'], 气运: ['城市地图', '接单锦鲤', '时间管理大师'] },
    // 生活服务
    '理发师': { 天赋: ['手感精准', '审美在线', '察言观色'], 气运: ['客户黏性', '审美在线', '手感精准'] },
    '健身教练': { 天赋: ['健身身材', '体力充沛', '客户黏性'], 气运: ['客户黏性', '体力充沛', '健身身材'] },
    '美容师': { 天赋: ['手感精准', '审美在线', '工具精通'], 气运: ['客户黏性', '审美在线', '手感精准'] },
    '推拿按摩师': { 天赋: ['手感精准', '体力充沛', '察言观色'], 气运: ['客户黏性', '手感精准', '体力充沛'] },
    // 蓝领技工
    '装修师傅': { 天赋: ['万能手', '材料直觉', '安全意识'], 气运: ['工地人脉', '材料直觉', '万能手'] },
    '汽修工': { 天赋: ['听音辨障', '力气大', '电动车维护'], 气运: ['工地人脉', '听音辨障', '力气大'] },
    '电工': { 天赋: ['万能手', '安全意识', '材料直觉'], 气运: ['工地人脉', '万能手', '安全意识'] },
    '建筑工人': { 天赋: ['力气大', '安全意识', '万能手'], 气运: ['工地人脉', '力气大', '安全意识'] },
    // 零售个体
    '便利店老板': { 天赋: ['算盘脑子', '库存管理', '邻里熟客'], 气运: ['邻里熟客', '算盘脑子', '库存管理'] },
    '夜市摊主': { 天赋: ['夜市生存', '砍价王', '识货眼'], 气运: ['夜市生存', '砍价王', '邻里熟客'] },
    '水果摊老板': { 天赋: ['识货眼', '砍价王', '邻里熟客'], 气运: ['识货眼', '砍价王', '邻里熟客'] },
    '房产中介': { 天赋: ['人脉编织', '键盘侠', '商业嗅觉'], 气运: ['人脉编织', '商业嗅觉', '邻里熟客'] },
    '保险推销员': { 天赋: ['人情练达', '社群管理', '商业嗅觉'], 气运: ['人脉编织', '商业嗅觉', '邻里熟客'] },
    // 都市职场
    '大厂员工': { 天赋: ['代码直觉', '咖啡体质', '格子间伪装'], 气运: ['人脉编织', '咖啡体质', '格子间伪装'] },
    '都市白领': { 天赋: ['人脉编织', '咖啡体质', '租房达人'], 气运: ['人脉编织', '咖啡体质', '格子间伪装'] },
    '投行分析师': { 天赋: ['商业嗅觉', '咖啡体质', '人脉编织'], 气运: ['商业嗅觉', '人脉编织', '咖啡体质'] },
    '律所新人': { 天赋: ['权谋心眼', '人情练达', '咖啡体质'], 气运: ['权谋心眼', '人情练达', '咖啡体质'] },
    // 废土末日
    '废土拾荒者': { 天赋: ['废土求生', '废墟寻宝', '辐射感知'], 气运: ['废墟寻宝', '废土求生', '辐射感知'] },
    '营地技工': { 天赋: ['废土工匠', '营地建设', '万能手'], 气运: ['营地建设', '废土工匠', '万能手'] },
    '废车场老板': { 天赋: ['废土工匠', '驾驶执照', '废土交易'], 气运: ['废车场老板', '废土工匠', '驾驶执照'] },
    // 黑色犯罪
    '私家侦探': { 天赋: ['冷硬推理', '城市暗道', '审讯技巧'], 气运: ['冷硬推理', '城市暗道', '审讯技巧'] },
    '酒吧调酒师': { 天赋: ['调酒师的手', '酒后吐真言', '微醺暧昧'], 气运: ['调酒师的手', '酒后吐真言', '微醺暧昧'] },
    // 乡村
    '返乡创业青年': { 天赋: ['电商头脑', '短视频运营', '节气通'], 气运: ['节气通', '电商头脑', '乡土人情'] },
    '村干部': { 天赋: ['乡土人情', '宗族谱系', '村口情报站'], 气运: ['乡土人情', '宗族谱系', '村口情报站'] },
    '乡村教师': { 天赋: ['因材施教', '课堂掌控', '乡土人情'], 气运: ['桃李满天下', '乡土人情', '课堂掌控'] },
    // 都市职场
    '产品经理': { 天赋: ['商业谈判', '团队管理', '人情练达'], 气运: ['资金链断裂', '人员流失', '商业嗅觉'] },
    '运营专员': { 天赋: ['流量运营', '粉丝运营', '数据敏感'], 气运: ['平台政策变动', '封号风险', '流量红利'] },
    '艺人经纪人': { 天赋: ['人脉撮合', '商业谈判', '情报收集'], 气运: ['艺人解约', '人脉编织', '商业嗅觉'] },
    '法律顾问': { 天赋: ['权谋心眼', '人情练达', '商业嗅觉'], 气运: ['律所新人', '权谋心眼', '人情练达'] },
    '金融交易员': { 天赋: ['商业嗅觉', '多线处理', '风险把控'], 气运: ['资金链断裂', '商业嗅觉', '风险把控'] },
    '市场营销': { 天赋: ['流量运营', '社群管理', '商业嗅觉'], 气运: ['平台政策变动', '流量红利', '商业嗅觉'] },
    'HR专员': { 天赋: ['人情练达', '信任建立', '社群管理'], 气运: ['人员流失', '人情练达', '职场风云'] },
    '财务会计': { 天赋: ['算盘脑子', '细节把控', '风险把控'], 气运: ['资金链断裂', '算盘脑子', '审计风暴'] },
    // 配送出行
    '货运司机': { 天赋: ['驾驶执照', '活地图', '长途耐力'], 气运: ['超载检查', '天气影响', '接单锦鲤'] },
    '共享单车运维': { 天赋: ['快速反应', '力气大', '多线程操作'], 气运: ['意外抓伤', '共享单车', '接单锦鲤'] },
    '搬家工人': { 天赋: ['力气大', '快速反应', '服务意识'], 气运: ['意外抓伤', '力气大', '工地人脉'] },
    '代排队': { 天赋: ['早起耐力', '顾客沟通', '服务意识'], 气运: ['接单锦鲤', '时间管理大师', '排队红利'] },
    // 生活服务
    '宠物美容师': { 天赋: ['美容技巧', '动物亲和', '手感精准'], 气运: ['动物亲和', '客户黏性', '手感精准'] },
    '上门私教': { 天赋: ['健身身材', '体力充沛', '客户黏性'], 气运: ['客户黏性', '体力充沛', '健身身材'] },
    '婚礼策划师': { 天赋: ['情商极高', '审美在线', '团队管理'], 气运: ['客户黏性', '审美在线', '婚礼旺季'] },
    '月嫂': { 天赋: ['服务意识', '顾客沟通', '早期经验'], 气运: ['客户黏性', '口碑传播', '服务意识'] },
    '搬家保洁': { 天赋: ['力气大', '早起耐力', '服务意识'], 气运: ['接单锦鲤', '力气大', '客户黏性'] },
    '社区团购团长': { 天赋: ['邻里熟客', '库存管理', '顾客沟通'], 气运: ['邻里熟客', '社区红利', '库存管理'] },
    '花艺师': { 天赋: ['审美在线', '季节性嗅觉', '手感精准'], 气运: ['审美在线', '季节性嗅觉', '客户黏性'] },
    '咖啡师': { 天赋: ['咖啡体质', '服务意识', '顾客沟通'], 气运: ['咖啡体质', '客户黏性', '手艺精进'] },
    '调酒师': { 天赋: ['夜场社交', '情绪控制', '顾客沟通'], 气运: ['夜场风云', '客户黏性', '微醺暧昧'] },
    // 蓝领技工
    '管道工': { 天赋: ['管道维修', '万能手', '快速反应'], 气运: ['污水喷发', '万能手', '工地人脉'] },
    '空调维修': { 天赋: ['制冷维修', '高空作业', '快速反应'], 气运: ['安全隐患', '万能手', '旺季红利'] },
    '电焊工': { 天赋: ['焊接技能', '安全意识', '力气大'], 气运: ['工地人脉', '焊接红利', '安全意识'] },
    '家具安装工': { 天赋: ['金属加工', '顾客沟通', '快速反应'], 气运: ['工地人脉', '客户黏性', '意外抓伤'] },
    '开锁师傅': { 天赋: ['快速反应', '顾客沟通', '服务意识'], 气运: ['接单锦鲤', '城市暗道', '客户黏性'] },
    '废品回收': { 天赋: ['识货眼', '砍价王', '议价能力'], 气运: ['识货眼', '砍价王', '意外发现'] },
    // 零售个体
    '餐饮老板': { 天赋: ['商业嗅觉', '团队管理', '顾客沟通'], 气运: ['资金链断裂', '商业嗅觉', '客户黏性'] },
    '服装店老板': { 天赋: ['审美在线', '商业嗅觉', '顾客沟通'], 气运: ['商业嗅觉', '客户黏性', '库存管理'] },
    '手机维修': { 天赋: ['维修技能', '电子产品精通', '顾客沟通'], 气运: ['客户黏性', '手艺精进', '配件红利'] },
    '电脑维修': { 天赋: ['维修技能', '电子产品精通', '数据敏感'], 气运: ['客户黏性', '手艺精进', '数据红利'] },
    '摄影工作室': { 天赋: ['审美在线', '多平台操作', '场景引导'], 气运: ['客户黏性', '审美在线', '旺季红利'] },
    '健身房老板': { 天赋: ['团队管理', '健身身材', '商业嗅觉'], 气运: ['商业嗅觉', '客户黏性', '人员流失'] },
    // 特殊身份 - 夜场娱乐 (NSFW)
    '夜场DJ': { 天赋: ['夜场社交', '舞台表现', '观众魅力'], 气运: ['夜场风云', '舞台红利', '粉丝追捧'] },
    '夜店营销': { 天赋: ['夜场社交', '暧昧掌控', '顾客沟通'], 气运: ['夜场风云', '客户黏性', '暧昧升级'] },
    '酒吧驻唱': { 天赋: ['舞台表现', '语音社交', '观众魅力'], 气运: ['夜场风云', '舞台红利', '观众魅力'] },
    'KTV陪唱': { 天赋: ['夜场社交', '语音社交', '情绪控制'], 气运: ['夜场风云', '客户黏性', '情绪控制'] },
    '私人影院': { 天赋: ['私密场景应对', '场景引导', '服务意识'], 气运: ['私密红利', '客户黏性', '场景引导'] },
    '舞池领舞': { 天赋: ['舞台表现', '观众魅力', '长途耐力'], 气运: ['舞台红利', '观众魅力', '夜场风云'] },
    // 特殊身份 - 内容创作 (NSFW)
    '短视频博主': { 天赋: ['网红孵化', '多平台操作', '粉丝运营'], 气运: ['平台政策变动', '粉丝红利', '流量爆款'] },
    '直播主播': { 天赋: ['直播控场', '舞台表现', '粉丝运营'], 气运: ['封号风险', '粉丝追捧', '流量红利'] },
    'ASMR主播': { 天赋: ['语音社交', '私密场景应对', '粉丝运营'], 气运: ['封号风险', '粉丝红利', '私密场景'] },
    '写真模特': { 天赋: ['美容技巧', '舞台表现', '场景引导'], 气运: ['审美红利', '客户黏性', '平台政策'] },
    '擦边网红': { 天赋: ['暧昧掌控', '多平台操作', '粉丝运营'], 气运: ['封号风险', '流量爆款', '粉丝红利'] },
    '情感博主': { 天赋: ['情绪控制', '语音社交', '粉丝运营'], 气运: ['粉丝追捧', '情绪红利', '平台政策'] },
    // 特殊身份 - 职场关系 (NSFW)
    '私人秘书': { 天赋: ['商业谈判', '情绪控制', '服务意识'], 气运: ['职场风云', '老板信任', '越界直觉'] },
    ' executive助理': { 天赋: ['团队管理', '情绪控制', '服务意识'], 气运: ['职场风云', '老板信任', '资源对接'] },
    '前台接待': { 天赋: ['顾客沟通', '服务意识', '舞台表现'], 气运: ['职场风云', '客户黏性', '前台红利'] },
    '商务礼仪': { 天赋: ['商业谈判', '高端社交', '情绪控制'], 气运: ['职场风云', '商业嗅觉', '高端人脉'] },
    // 特殊身份 - 配送出行 (NSFW)
    '夜间配送': { 天赋: ['快速反应', '夜猫子', '顾客沟通'], 气运: ['夜间红利', '接单锦鲤', '安全风险'] },
    '专车司机': { 天赋: ['驾驶执照', '夜行直觉', '顾客沟通'], 气运: ['专车红利', '客户黏性', '夜间风云'] },
    '私人司机': { 天赋: ['驾驶执照', '情绪控制', '服务意识'], 气运: ['老板信任', '客户黏性', '夜间红利'] },
    // 特殊身份 - 生活服务 (NSFW)
    'SPA技师': { 天赋: ['手感精准', '私密场景应对', '服务意识'], 气运: ['客户黏性', '手艺精进', '私密红利'] },
    '足疗师': { 天赋: ['手感精准', '体力充沛', '顾客沟通'], 气运: ['客户黏性', '手艺红利', '体力充沛'] },
    '私人瑜伽': { 天赋: ['健身身材', '场景引导', '情绪控制'], 气运: ['客户黏性', '瑜伽红利', '情绪控制'] },
    '私人舞蹈': { 天赋: ['舞台表现', '场景引导', '身体语言解读'], 气运: ['客户黏性', '舞蹈红利', '场景引导'] },
    '私人造型': { 天赋: ['美容技巧', '审美在线', '场景引导'], 气运: ['客户黏性', '审美红利', '造型红利'] },
    // 特殊身份 - 蓝领技工 (NSFW)
    '工地包工': { 天赋: ['团队管理', '力气大', '顾客沟通'], 气运: ['工地人脉', '团队红利', '安全风险'] },
    '车间主任': { 天赋: ['团队管理', '快速反应', '服务意识'], 气运: ['车间红利', '团队管理', '安全红线'] },
    // 特殊身份 - 零售个体 (NSFW)
    '情趣店主': { 天赋: ['商业嗅觉', '私密场景应对', '顾客沟通'], 气运: ['商业红利', '私密场景', '客户黏性'] },
    '成人用品': { 天赋: ['商业嗅觉', '服务意识', '顾客沟通'], 气运: ['商业红利', '私密场景', '客户黏性'] },
    '酒店老板': { 天赋: ['商业嗅觉', '团队管理', '顾客沟通'], 气运: ['商业红利', '客户黏性', '安全风险'] },
    '民宿老板': { 天赋: ['商业嗅觉', '服务意识', '顾客沟通'], 气运: ['商业红利', '客户黏性', '旺季红利'] },
    // 特殊身份 - 住房邻里 (NSFW)
    '合租室友': { 天赋: ['情绪控制', '夜猫子', '顾客沟通'], 气运: ['邻里红利', '合租风云', '情绪控制'] },
    '邻居熟客': { 天赋: ['邻里熟客', '信任建立', '顾客沟通'], 气运: ['邻里熟客', '社区红利', '信任建立'] },
    '房东太太': { 天赋: ['商业嗅觉', '顾客沟通', '服务意识'], 气运: ['房东红利', '客户黏性', '商业嗅觉'] },
    '物业管家': { 天赋: ['顾客沟通', '服务意识', '团队管理'], 气运: ['物业红利', '客户黏性', '邻里熟客'] },
    // 特殊身份 - 教育健身 (NSFW)
    '舞蹈教练': { 天赋: ['舞台表现', '场景引导', '身体语言解读'], 气运: ['舞蹈红利', '客户黏性', '场景引导'] },
    '瑜伽教练': { 天赋: ['健身身材', '情绪控制', '场景引导'], 气运: ['瑜伽红利', '客户黏性', '情绪控制'] },
    '拳击教练': { 天赋: ['体力充沛', '快速反应', '场景引导'], 气运: ['拳击红利', '客户黏性', '体力充沛'] },
    '游泳教练': { 天赋: ['体力充沛', '长途耐力', '场景引导'], 气运: ['游泳红利', '客户黏性', '体力充沛'] },
    // 特殊身份 - 酒店休闲 (NSFW)
    '酒店前台': { 天赋: ['顾客沟通', '服务意识', '情绪控制'], 气运: ['酒店红利', '客户黏性', '职场风云'] },
    '客房服务': { 天赋: ['服务意识', '体力充沛', '顾客沟通'], 气运: ['酒店红利', '客户黏性', '体力充沛'] },
    '温泉服务': { 天赋: ['手感精准', '服务意识', '顾客沟通'], 气运: ['温泉红利', '客户黏性', '手艺精进'] },
    '桑拿技师': { 天赋: ['手感精准', '体力充沛', '服务意识'], 气运: ['桑拿红利', '客户黏性', '手艺精进'] },
    // 特殊身份 - 医疗健康 (NSFW)
    '私人医生': { 天赋: ['急救知识', '身体语言解读', '服务意识'], 气运: ['医生红利', '客户黏性', '身体语言'] },
    '心理咨询师': { 天赋: ['情绪控制', '信任建立', '身体语言解读'], 气运: ['咨询红利', '客户黏性', '情绪控制'] },
    // 特殊身份 - 私人服务 (NSFW)
    '私人管家': { 天赋: ['服务意识', '情绪控制', '顾客沟通'], 气运: ['管家红利', '老板信任', '客户黏性'] },
    '私人助理': { 天赋: ['团队管理', '情绪控制', '服务意识'], 气运: ['助理红利', '老板信任', '资源对接'] },
    '私人导游': { 天赋: ['活地图', '顾客沟通', '场景引导'], 气运: ['导游红利', '客户黏性', '场景引导'] },
    // 特殊身份 - 酒吧夜场 (NSFW)
    '夜场经理': { 天赋: ['团队管理', '夜场社交', '商业嗅觉'], 气运: ['夜场风云', '团队红利', '商业嗅觉'] },
    '吧台主管': { 天赋: ['夜场社交', '顾客沟通', '服务意识'], 气运: ['夜场风云', '客户黏性', '吧台红利'] },
    '夜场保安': { 天赋: ['力气大', '快速反应', '安全意识'], 气运: ['夜场风云', '安全红线', '力气红利'] },
    // 特殊身份 - 旅行摄影 (NSFW)
    '旅行博主': { 天赋: ['多平台操作', '粉丝运营', '场景引导'], 气运: ['旅行红利', '粉丝追捧', '平台政策'] },
    '摄影师': { 天赋: ['审美在线', '场景引导', '多平台操作'], 气运: ['摄影红利', '客户黏性', '审美红利'] },
    '旅拍向导': { 天赋: ['活地图', '场景引导', '顾客沟通'], 气运: ['向导红利', '客户黏性', '场景引导'] },
    // 特殊身份 - 电竞游戏 (NSFW)
    '电竞选手': { 天赋: ['游戏精通', '快速反应', '团队管理'], 气运: ['电竞红利', '团队管理', '赛事奖金'] },
    '游戏主播': { 天赋: ['游戏精通', '直播控场', '粉丝运营'], 气运: ['游戏红利', '粉丝追捧', '平台政策'] },
    '陪玩师': { 天赋: ['游戏精通', '语音社交', '情绪控制'], 气运: ['陪玩红利', '客户黏性', '情绪控制'] },
    // 特殊身份 - 赛车骑行 (NSFW)
    '赛车手': { 天赋: ['驾驶执照', '快速反应', '长途耐力'], 气运: ['赛车红利', '赛事奖金', '安全风险'] },
    '骑行教练': { 天赋: ['驾驶执照', '体力充沛', '场景引导'], 气运: ['骑行红利', '客户黏性', '体力充沛'] },
    '车队经理': { 天赋: ['团队管理', '商业嗅觉', '顾客沟通'], 气运: ['车队红利', '商业嗅觉', '团队管理'] },
    // 特殊身份 - 音乐表演 (NSFW)
    '乐队主唱': { 天赋: ['舞台表现', '语音社交', '观众魅力'], 气运: ['舞台红利', '观众魅力', '乐队风云'] },
    '音乐制作人': { 天赋: ['多平台操作', '审美在线', '粉丝运营'], 气运: ['音乐红利', '粉丝追捧', '审美红利'] },
    '舞蹈演员': { 天赋: ['舞台表现', '身体语言解读', '观众魅力'], 气运: ['舞台红利', '观众魅力', '舞蹈风云'] },
    // 特殊身份 - 宠物 (NSFW)
    '宠物训练师': { 天赋: ['动物亲和', '场景引导', '顾客沟通'], 气运: ['宠物红利', '客户黏性', '动物亲和'] },
    '宠物寄养': { 天赋: ['动物亲和', '服务意识', '顾客沟通'], 气运: ['寄养红利', '客户黏性', '动物亲和'] },
};
const 自定义天赋存储键 = 设置键.自定义天赋;
const 自定义背景存储键 = 设置键.自定义背景;

// --- Types ---
type 自定义开局预设元信息 = { 名称: string; 简介: string };
type 属性结构 = { 力量: number; 敏捷: number; 体质: number; 根骨: number; 悟性: number; 福源: number };

// --- Hook interface ---
interface UseNewGameWizardStateProps {
    onComplete: (
        worldConfig: WorldGenConfig,
        charData: 角色数据结构,
        openingConfig: OpeningConfig | undefined,
        mode: 'all' | 'step',
        openingStreaming: boolean,
        openingExtraPrompt?: string
    ) => void;
    onCancel: () => void;
    loading: boolean;
    currentEra?: string;
    requestConfirm?: (options: { title?: string; message: string; confirmText?: string; cancelText?: string; danger?: boolean }) => Promise<boolean>;
}

export type UseNewGameWizardStateReturn = ReturnType<typeof useNewGameWizardState>;

export function useNewGameWizardState({ onComplete, onCancel, loading, currentEra, requestConfirm }: UseNewGameWizardStateProps) {
    // --- State: World Config ---
    const [worldConfig, setWorldConfig] = useState<WorldGenConfig>(() => {
        const initialEra = currentEra || 'ancient_eastern_wuxia';
        const era = 内置时代配置.find(c => c.id === initialEra);
        return {
            worldName: '太古界',
            worldSize: era?.默认世界版图 ?? '九州宏大',
            dynastySetting: era?.默认王朝占位符 ?? '群雄逐鹿，王朝末年',
            sectDensity: era?.默认组织密度 ?? '林立',
            tianjiaoSetting: era?.默认天骄占位符 ?? '大争之世，天骄并起',
            武力等级: era?.默认武力等级 ?? '中武',
            nsfw场景类型: '无',
            能力类型: era?.默认能力类型 ?? '传统武侠',
            超能力分类: '未觉醒',
            觉醒程度: '未觉醒',
            时代配置ID: initialEra,
            worldExtraRequirement: '',
            manualWorldPrompt: '',
            manualRealmPrompt: '',
            difficulty: 'normal' as 游戏难度
        };
    });

    // Sync global era setting into wizard world config, applying era defaults
    useEffect(() => {
        if (!currentEra || typeof currentEra !== 'string') return;
        const era = 内置时代配置.find(c => c.id === currentEra);
        if (!era) return;
        setWorldConfig(prev => {
            if (prev.时代配置ID === currentEra) return prev;
            return {
                ...prev,
                时代配置ID: currentEra,
                能力类型: era.默认能力类型 ?? prev.能力类型,
                武力等级: era.默认武力等级 ?? prev.武力等级,
                worldSize: era.默认世界版图 ?? prev.worldSize,
                sectDensity: era.默认组织密度 ?? prev.sectDensity,
                dynastySetting: era.默认王朝占位符 ?? prev.dynastySetting,
                tianjiaoSetting: era.默认天骄占位符 ?? prev.tianjiaoSetting,
            };
        });
        // 同步古代体系选择：如果当前体系不在新时代的支持列表中，重置为第一个有效值
        if (Array.isArray(era.支持体系) && era.支持体系.length > 0) {
            设置古代体系选择(prev => {
                if (era.支持体系.includes(prev)) return prev;
                return era.支持体系[0];
            });
        }
    }, [currentEra]);

    // 子纪元里模式开关：默认开启，用户可手动关闭

    const [selectedQiyun, setSelectedQiyun] = useState<气运数据[]>([]);

    // --- State: Character Config ---
    const [charName, setCharName] = useState('');
    const [charGender, setCharGender] = useState('男');
    const [charAge, setCharAge] = useState(18);
    const [charAppearance, setCharAppearance] = useState('黑发黑眸，面容清秀，衣着朴素利落。');
    const [charPersonality, setCharPersonality] = useState('外冷内热，谨慎克制，遇事先观察再出手。');
    const [birthMonth, setBirthMonth] = useState(1);
    const [birthDay, setBirthDay] = useState(1);
    const [monthOpen, setMonthOpen] = useState(false);
    const [dayOpen, setDayOpen] = useState(false);
    const monthRef = useRef<HTMLDivElement>(null);
    const dayRef = useRef<HTMLDivElement>(null);
    const manualWorldPromptInputRef = useRef<HTMLInputElement>(null);
    const manualRealmPromptInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState(0);
    const [stats, setStats] = useState<属性结构>(创建默认属性分配);
    const [openingConfig, setOpeningConfig] = useState<OpeningConfig>(默认开局配置);
    const [openingConfigEnabled, setOpeningConfigEnabled] = useState(false);
    const [showEraSelector, setShowEraSelector] = useState(false);

    // Talents & Background
    const [selectedBackground, setSelectedBackground] = useState<背景结构>(预设背景[0]);
    const [selectedTalents, setSelectedTalents] = useState<天赋结构[]>([]);
    const [自定义天赋列表, 设置自定义天赋列表] = useState<天赋结构[]>([]);
    const [自定义背景列表, 设置自定义背景列表] = useState<背景结构[]>([]);
    const [自定义开局预设列表, 设置自定义开局预设列表] = useState<开局预设方案结构[]>([]);
    const [小说拆分数据集列表, 设置小说拆分数据集列表] = useState<小说拆分数据集结构[]>([]);
    const [成人内容开启, 设置成人内容开启] = useState(false);
    const [子纪元里模式开启, 设置子纪元里模式开启] = useState(true);
    const [古代体系选择, 设置古代体系选择] = useState<体系类型>('武侠');

    // Search & filter
    const [背景搜索词, set背景搜索词] = useState('');
    const [天赋搜索词, set天赋搜索词] = useState('');
    const [气运搜索词, set气运搜索词] = useState('');
    const [气运类别过滤, set气运类别过滤] = useState<import('../../../data/qiyun').气运类别 | null>(null);
    const [气运稀有度过滤, set气运稀有度过滤] = useState<import('../../../data/qiyun').气运稀有度 | null>(null);
    const [背景分类过滤, set背景分类过滤] = useState<string | null>(null);
    const [天赋分类过滤, set天赋分类过滤] = useState<string | null>(null);
    const [自动填充开启, set自动填充开启] = useState(true);

    // Custom Inputs
    const [customTalent, setCustomTalent] = useState<天赋结构>({ 名称: '', 描述: '', 效果: '' });
    const [showCustomTalent, setShowCustomTalent] = useState(false);
    const [正在编辑天赋名, set正在编辑天赋名] = useState('');
    const [customBackground, setCustomBackground] = useState<背景结构>({ 名称: '', 描述: '', 效果: '' });
    const [showCustomBackground, setShowCustomBackground] = useState(false);
    const [正在编辑背景名, set正在编辑背景名] = useState('');
    const [showCustomPresetEditor, setShowCustomPresetEditor] = useState(false);
    const [正在编辑开局预设ID, set正在编辑开局预设ID] = useState('');
    const [customPresetMeta, setCustomPresetMeta] = useState<自定义开局预设元信息>({ 名称: '', 简介: '' });
    const [openingExtraRequirement, setOpeningExtraRequirement] = useState('');

    // --- Logic: Helpers ---
    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
    const dayOptions = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

    const 选择气运类别 = (v: string | null) => set气运类别过滤(v as import('../../../data/qiyun').气运类别 | null);
    const 选择气运稀有度 = (v: string | null) => set气运稀有度过滤(v as import('../../../data/qiyun').气运稀有度 | null);

    const 标准化天赋 = (raw: 天赋结构): 天赋结构 | null => {
        const 名称 = raw?.名称?.trim() || '';
        const 描述 = raw?.描述?.trim() || '';
        const 效果 = raw?.效果?.trim() || '';
        if (!名称 || !描述 || !效果) return null;
        return { 名称, 描述, 效果 };
    };
    const 标准化背景 = (raw: 背景结构): 背景结构 | null => {
        const 名称 = raw?.名称?.trim() || '';
        const 描述 = raw?.描述?.trim() || '';
        const 效果 = raw?.效果?.trim() || '';
        if (!名称 || !描述 || !效果) return null;
        return { 名称, 描述, 效果 };
    };
    const 合并去重天赋 = (rawList: 天赋结构[]): 天赋结构[] => {
        const map = new Map<string, 天赋结构>();
        rawList.forEach((item) => {
            const normalized = 标准化天赋(item);
            if (!normalized) return;
            map.set(normalized.名称, normalized);
        });
        return Array.from(map.values());
    };
    const 合并去重背景 = (rawList: 背景结构[]): 背景结构[] => {
        const map = new Map<string, 背景结构>();
        rawList.forEach((item) => {
            const normalized = 标准化背景(item);
            if (!normalized) return;
            map.set(normalized.名称, normalized);
        });
        return Array.from(map.values());
    };

    const 当前时代背景 = useMemo(() => 获取时代背景(worldConfig.时代配置ID), [worldConfig.时代配置ID]);

    const 匹配时代 = (item: { 时代适配?: string[], 子纪元适配?: string[] }) => {
        // 子纪元精确匹配优先
        if (item.子纪元适配 && item.子纪元适配.length > 0) {
            return item.子纪元适配.includes(worldConfig.时代配置ID || '');
        }
        // 回退到时代大类匹配
        return !item.时代适配 || item.时代适配.length === 0 || (当前时代背景 && item.时代适配.includes(当前时代背景));
    };

    const 当前子纪元默认预设 = useMemo((): 子纪元默认预设结构 | undefined => {
        return 获取子纪元默认预设(worldConfig.时代配置ID || '');
    }, [worldConfig.时代配置ID]);

    const 当前子纪元默认预设列表 = useMemo((): 子纪元默认预设结构[] => {
        return 获取子纪元默认预设列表(worldConfig.时代配置ID || '');
    }, [worldConfig.时代配置ID]);

    const 应用子纪元默认预设 = (preset: 子纪元默认预设结构) => {
        const bg = 根据名称查找背景(preset.背景名称);
        const talents = 根据名称查找天赋列表(preset.天赋名称列表);
        const qiyunList = (preset.气运名称列表 || [])
            .map((名称) => 气运数据列表.find(q => q.名称 === 名称))
            .filter((q): q is 气运数据 => Boolean(q));
        setSelectedBackground(bg);
        setSelectedTalents(talents);
        setSelectedQiyun(qiyunList);
    };

    const 全部背景选项 = useMemo(() => {
        const combined = [...预设背景, ...自定义背景列表.filter(item => !预设背景.some(p => p.名称 === item.名称))];
        return combined.filter(item =>
            (!item.适用性别 || item.适用性别 === charGender) &&
            (item.nsfw !== true || worldConfig.nsfw场景类型 !== '无') &&
            匹配时代(item)
        );
    }, [自定义背景列表, charGender, worldConfig.nsfw场景类型, 当前时代背景]);

    const 全部天赋选项 = useMemo(() => {
        const combined = [...预设天赋, ...自定义天赋列表.filter(item => !预设天赋.some(p => p.名称 === item.名称))];
        return combined.filter(item =>
            (!item.适用性别 || item.适用性别 === charGender) &&
            (item.nsfw !== true || worldConfig.nsfw场景类型 !== '无') &&
            匹配时代(item)
        );
    }, [自定义天赋列表, charGender, worldConfig.nsfw场景类型, 当前时代背景]);

    const 全部气运选项 = useMemo(() => {
        return 气运数据列表.filter(item => {
            const nsfwOk = item.nsfw等级 !== undefined && item.nsfw等级 > 0
                ? worldConfig.nsfw场景类型 !== '无'
                : true;
            return nsfwOk && 匹配时代(item);
        });
    }, [worldConfig.nsfw场景类型, 当前时代背景]);

    const 过滤匹配 = (文本: string, 搜索词: string): boolean => {
        if (!搜索词) return true;
        return 文本.includes(搜索词);
    };

    const 过滤后背景选项 = useMemo(() => {
        return 全部背景选项.filter(item => {
            const 搜索通过 = 过滤匹配(item.名称, 背景搜索词) || 过滤匹配(item.描述, 背景搜索词) || 过滤匹配(item.效果, 背景搜索词);
            const 分类通过 = !背景分类过滤 || item.分类 === 背景分类过滤;
            return 搜索通过 && 分类通过;
        });
    }, [全部背景选项, 背景搜索词, 背景分类过滤]);

    const 过滤后天赋选项 = useMemo(() => {
        return 全部天赋选项.filter(item => {
            const 搜索通过 = 过滤匹配(item.名称, 天赋搜索词) || 过滤匹配(item.描述, 天赋搜索词) || 过滤匹配(item.效果, 天赋搜索词);
            const 分类通过 = !天赋分类过滤 || item.分类 === 天赋分类过滤;
            return 搜索通过 && 分类通过;
        });
    }, [全部天赋选项, 天赋搜索词, 天赋分类过滤]);

    const 过滤后气运选项 = useMemo(() => {
        return 全部气运选项.filter(item => {
            const 名称匹配 = 过滤匹配(item.名称, 气运搜索词);
            const 描述匹配 = 过滤匹配(item.描述, 气运搜索词);
            const 搜索通过 = 名称匹配 || 描述匹配;
            const 类别通过 = !气运类别过滤 || item.类别 === 气运类别过滤;
            const 稀有度通过 = !气运稀有度过滤 || item.稀有度 === 气运稀有度过滤;
            return 搜索通过 && 类别通过 && 稀有度通过;
        });
    }, [全部气运选项, 气运搜索词, 气运类别过滤, 气运稀有度过滤]);

    const 重置自定义天赋编辑 = () => {
        setCustomTalent({ 名称: '', 描述: '', 效果: '' });
        set正在编辑天赋名('');
        setShowCustomTalent(false);
    };
    const 重置自定义背景编辑 = () => {
        setCustomBackground({ 名称: '', 描述: '', 效果: '' });
        set正在编辑背景名('');
        setShowCustomBackground(false);
    };
    const 重置自定义开局预设编辑 = () => {
        setCustomPresetMeta({ 名称: '', 简介: '' });
        set正在编辑开局预设ID('');
        setShowCustomPresetEditor(false);
    };
    const 根据名称查找背景 = (名称: string): 背景结构 => {
        const hit = [...预设背景, ...自定义背景列表].find(item => item.名称 === 名称);
        return hit || 预设背景[0];
    };
    const 根据名称查找天赋列表 = (名称列表: string[]): 天赋结构[] => (
        名称列表
            .map((名称) => [...预设天赋, ...自定义天赋列表].find(item => item.名称 === 名称))
            .filter((item): item is 天赋结构 => Boolean(item))
            .slice(0, 3)
    );

    const 构建角色数据 = (params?: {
        角色名?: string;
        性别?: string;
        年龄?: number;
        外貌?: string;
        性格?: string;
        出生月?: number;
        出生日?: number;
        属性?: 属性结构;
        背景?: 背景结构;
        天赋列表?: 天赋结构[];
        气运列表?: 气运数据[];
    }): 角色数据结构 => {
        const 最终属性 = params?.属性 || stats;
        const 最终年龄 = params?.年龄 ?? charAge;
        const 初始境界层级 = 1;
        const 初始境界名称 = '';
        const 初始升级经验 = Math.floor(
            110 + 初始境界层级 * 24
            + Math.max(0, 初始境界层级 - 4) * 10
            + Math.max(0, 初始境界层级 - 8) * 12
            + Math.max(0, 初始境界层级 - 12) * 16
            + Math.max(0, 初始境界层级 - 16) * 20
            + Math.max(0, 初始境界层级 - 20) * 26
            + Math.max(0, 初始境界层级 - 24) * 34
            + Math.max(0, 初始境界层级 - 27) * 42
            + Math.max(0, 初始境界层级 - 33) * 56
        );
        const 最大精力 = Math.floor(
            36 + 最终属性.体质 * 6.2 + 最终属性.根骨 * 3.4
            + 初始境界层级 * 5.2
            + Math.max(0, 初始境界层级 - 4) * 2.2
            + Math.max(0, 初始境界层级 - 8) * 2.6
            + Math.max(0, 初始境界层级 - 12) * 3.1
            + Math.max(0, 初始境界层级 - 16) * 3.8
            + Math.max(0, 初始境界层级 - 20) * 4.8
            + Math.max(0, 初始境界层级 - 24) * 6.0
            + Math.max(0, 初始境界层级 - 27) * 7.2
            + Math.max(0, 初始境界层级 - 33) * 9.0
        );
        const 最大内力 = Math.floor(
            18 + 最终属性.根骨 * 7.4 + 最终属性.悟性 * 6.6
            + 初始境界层级 * 6.0
            + Math.max(0, 初始境界层级 - 4) * 2.6
            + Math.max(0, 初始境界层级 - 8) * 3.2
            + Math.max(0, 初始境界层级 - 12) * 4.0
            + Math.max(0, 初始境界层级 - 16) * 5.0
            + Math.max(0, 初始境界层级 - 20) * 6.4
            + Math.max(0, 初始境界层级 - 24) * 8.2
            + Math.max(0, 初始境界层级 - 27) * 9.6
            + Math.max(0, 初始境界层级 - 33) * 12.0
        );
        const 最大饱腹 = Math.floor(
            72 + 最终属性.体质 * 2.2 + 最终属性.力量 * 1.2
            + 初始境界层级 * 2.8
            + Math.max(0, 初始境界层级 - 4) * 0.7
            + Math.max(0, 初始境界层级 - 8) * 0.8
            + Math.max(0, 初始境界层级 - 12) * 1.0
            + Math.max(0, 初始境界层级 - 16) * 1.2
            + Math.max(0, 初始境界层级 - 20) * 1.5
            + Math.max(0, 初始境界层级 - 24) * 1.9
            + Math.max(0, 初始境界层级 - 27) * 2.2
            + Math.max(0, 初始境界层级 - 33) * 2.8
        );
        const 最大口渴 = Math.floor(
            72 + 最终属性.体质 * 2.1 + 最终属性.根骨 * 1.3
            + 初始境界层级 * 2.8
            + Math.max(0, 初始境界层级 - 4) * 0.7
            + Math.max(0, 初始境界层级 - 8) * 0.8
            + Math.max(0, 初始境界层级 - 12) * 1.0
            + Math.max(0, 初始境界层级 - 16) * 1.2
            + Math.max(0, 初始境界层级 - 20) * 1.5
            + Math.max(0, 初始境界层级 - 24) * 1.9
            + Math.max(0, 初始境界层级 - 27) * 2.2
            + Math.max(0, 初始境界层级 - 33) * 2.8
        );
        const 最大负重 = Math.floor(
            82 + 最终属性.力量 * 10.5 + 最终属性.体质 * 2.4
            + 初始境界层级 * 2.4
            + Math.max(0, 初始境界层级 - 4) * 1.2
            + Math.max(0, 初始境界层级 - 8) * 1.4
            + Math.max(0, 初始境界层级 - 12) * 1.8
            + Math.max(0, 初始境界层级 - 16) * 2.2
            + Math.max(0, 初始境界层级 - 20) * 2.8
            + Math.max(0, 初始境界层级 - 24) * 3.5
            + Math.max(0, 初始境界层级 - 27) * 4.0
            + Math.max(0, 初始境界层级 - 33) * 5.0
        );
        const 当前精力 = 最大精力;
        const 当前内力 = Math.floor(最大内力 * 0.9);
        const 当前饱腹 = Math.floor(最大饱腹 * 0.8);
        const 当前口渴 = Math.floor(最大口渴 * 0.8);
        const 总最大血量 = Math.floor(
            92 + 最终属性.体质 * 5.2 + 最终属性.根骨 * 3.0 + 最终属性.力量 * 1.6
            + 初始境界层级 * 5.0
            + Math.max(0, 初始境界层级 - 4) * 2.4
            + Math.max(0, 初始境界层级 - 8) * 2.8
            + Math.max(0, 初始境界层级 - 12) * 3.4
            + Math.max(0, 初始境界层级 - 16) * 4.2
            + Math.max(0, 初始境界层级 - 20) * 5.2
            + Math.max(0, 初始境界层级 - 24) * 6.6
            + Math.max(0, 初始境界层级 - 27) * 7.8
            + Math.max(0, 初始境界层级 - 33) * 9.8
        );
        const 头部最大血量 = Math.round(总最大血量 * 0.15);
        const 胸部最大血量 = Math.round(总最大血量 * 0.22);
        const 腹部最大血量 = Math.round(总最大血量 * 0.20);
        const 左手最大血量 = Math.round(总最大血量 * 0.11);
        const 右手最大血量 = Math.round(总最大血量 * 0.11);
        const 左腿最大血量 = Math.round(总最大血量 * 0.105);
        const 右腿最大血量 = Math.max(
            1,
            总最大血量 - 头部最大血量 - 胸部最大血量 - 腹部最大血量 - 左手最大血量 - 右手最大血量 - 左腿最大血量
        );

        return {
            出生日期: `${params?.出生月 ?? birthMonth}月${params?.出生日 ?? birthDay}日`,
            ...(最终属性 as any),
            姓名: (params?.角色名 ?? charName).trim(),
            性别: (params?.性别 ?? charGender).trim() || '未设定',
            年龄: 最终年龄,
            外貌: (params?.外貌 ?? charAppearance).trim() || '相貌平常，衣着朴素。',
            性格: (params?.性格 ?? charPersonality).trim() || '未设定',
            天赋列表: params?.天赋列表 ?? selectedTalents,
            出身背景: params?.背景 ?? selectedBackground,
            气运列表: params?.气运列表 ?? selectedQiyun,
            称号: '初出茅庐', 境界: 初始境界名称, 境界层级: 初始境界层级,
            所属门派ID: 'none', 门派职位: '无', 门派贡献: 0,
            金钱: { 金元宝: 0, 银子: 0, 铜钱: 0 },
            当前精力, 最大精力,
            当前内力, 最大内力,
            当前饱腹, 最大饱腹,
            当前口渴, 最大口渴,
            当前负重: 0, 最大负重,
            头部当前血量: 头部最大血量, 头部最大血量, 头部状态: '正常',
            胸部当前血量: 胸部最大血量, 胸部最大血量, 胸部状态: '正常',
            腹部当前血量: 腹部最大血量, 腹部最大血量, 腹部状态: '正常',
            左手当前血量: 左手最大血量, 左手最大血量, 左手状态: '正常',
            右手当前血量: 右手最大血量, 右手最大血量, 右手状态: '正常',
            左腿当前血量: 左腿最大血量, 左腿最大血量, 左腿状态: '正常',
            右腿当前血量: 右腿最大血量, 右腿最大血量, 右腿状态: '正常',
            装备: { 头部: '无', 胸部: '无', 盔甲: '无', 内衬: '无', 腿部: '无', 手部: '无', 足部: '无', 主武器: '无', 副武器: '无', 暗器: '无', 背部: '无', 腰部: '无', 坐骑: '无' },
            物品列表: [], 功法列表: [],
            当前经验: 0, 升级经验: 初始升级经验, 玩家BUFF: [], 突破条件: [],
            ...(() => {
                if (!子纪元里模式开启) return {};
                const resolved = resolveEraNode(currentEra);
                const liModeName = resolved?.inherited.liMode?.name || '';
                if (liModeName.includes('武侠')) {
                    return { 武根: { 硬度: 10, 尺寸: 10, 精元储量: 50, 等级: '凡品' } };
                }
                if (liModeName.includes('志怪')) {
                    return { 妖根: { 灵脉: 10, 妖力: 10, 精怪亲和力: 10, 等级: '凡骨' }, 业障: 0, 功德: 0, 灵视能力: false, 已知道法: [] };
                }
                return {};
            })()
        };
    };

    const 应用预设到表单 = (preset: 开局预设方案结构) => {
        const nextWorldConfig: WorldGenConfig = { ...worldConfig, ...preset.worldConfig };
        const nextBackground = 根据名称查找背景(preset.character.背景名称);
        const nextTalents = 根据名称查找天赋列表(preset.character.天赋名称列表);
        const nextQiyun = Array.isArray(preset.character.气运列表) ? preset.character.气运列表 : [];
        setWorldConfig(nextWorldConfig);
        setCharName(preset.character.姓名);
        setCharGender(preset.character.性别);
        setCharAge(preset.character.年龄);
        setBirthMonth(preset.character.出生月);
        setBirthDay(preset.character.出生日);
        setCharAppearance(preset.character.外貌);
        setCharPersonality(preset.character.性格);
        setStats(preset.character.属性);
        setSelectedBackground(nextBackground);
        setSelectedTalents(nextTalents);
        setSelectedQiyun(nextQiyun);
        const normalizedOpeningConfig = 规范化可选开局配置(preset.openingConfig);
        setOpeningConfigEnabled(Boolean(normalizedOpeningConfig));
        setOpeningConfig(normalizedOpeningConfig || 默认开局配置());
        setOpeningExtraRequirement(preset.openingExtraRequirement || '');
        setStep(1);
    };

    const 当前性别模式: '男' | '女' | '自定义' = charGender.trim() === '男' || charGender.trim() === '女'
        ? charGender.trim() as '男' | '女'
        : '自定义';

    const 选择性别 = (next: '男' | '女' | '自定义') => {
        if (next === '自定义') {
            setCharGender(prev => (prev.trim() === '男' || prev.trim() === '女') ? '' : prev);
            return;
        }
        setCharGender(next);
        setTimeout(() => {
            setSelectedBackground((prev) => {
                if (prev?.适用性别 && prev.适用性别 !== next) {
                    return 预设背景.find(b => !b.适用性别 || b.适用性别 === next) || 预设背景[0];
                }
                return prev;
            });
            setSelectedTalents((prev) => {
                const filtered = prev.filter(t => !t.适用性别 || t.适用性别 === next);
                if (filtered.length !== prev.length) {
                    return filtered;
                }
                return prev;
            });
        }, 0);
    };

    const totalStatBudget = useMemo(() => 获取难度总属性点(worldConfig.difficulty), [worldConfig.difficulty]);
    const usedPoints = Object.values(stats).reduce((a, b) => a + b, 0);
    const remainingPoints = totalStatBudget - usedPoints;
    const stepProgress = ((step + 1) / STEPS.length) * 100;
    const currentStepLabel = STEPS[step] || '创建';
    const selectedTalentNames = selectedTalents.map(item => item.名称);
    const 背景长期说明 = '背景代表长期身份资源、社会关系、风险来源与成长路径，不应只决定第一幕处境。';
    const 天赋说明 = '天赋代表长期倾向与修行适配，优先影响成长曲线、事件判定与路线优势。';

    const 当前附加小说数据集 = useMemo(
        () => 小说拆分数据集列表.find((item) => item.id === openingConfig.同人融合.附加小说数据集ID) || null,
        [openingConfig.同人融合.附加小说数据集ID, 小说拆分数据集列表]
    );
    const 当前角色替换规则列表 = useMemo(
        () => 获取同人角色替换规则列表(openingConfig, charName),
        [openingConfig, charName]
    );

    const 读取UTF8文本文件 = async (file: File): Promise<string> => (
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
            reader.onerror = () => reject(reader.error || new Error('读取文件失败'));
            reader.readAsText(file, 'utf-8');
        })
    );
    const 导出文本文件 = (filename: string, content: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };
    const 导入手动提示词文件 = async (
        event: React.ChangeEvent<HTMLInputElement>,
        field: 'manualWorldPrompt' | 'manualRealmPrompt'
    ) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        try {
            const text = await 读取UTF8文本文件(file);
            setWorldConfig((prev) => ({ ...prev, [field]: text }));
        } catch (error: any) {
            alert(error?.message || '读取文件失败');
        }
    };
    const 导出手动世界观提示词 = () => {
        const content = worldConfig.manualWorldPrompt.trim();
        if (!content) { alert('当前没有可导出的手动世界观提示词。'); return; }
        导出文本文件(`${worldConfig.worldName || 'world'}-世界观提示词.txt`, content);
    };
    const 导出手动境界提示词 = () => {
        const content = worldConfig.manualRealmPrompt.trim();
        if (!content) { alert('当前没有可导出的手动境界提示词。'); return; }
        导出文本文件(`${worldConfig.worldName || 'world'}-境界提示词.txt`, content);
    };
    const 导出境界提示词模板 = () => {
        导出文本文件('境界提示词模板.txt', 默认境界母板提示词);
    };

    // --- Effects ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (monthRef.current && monthRef.current.contains(target)) return;
            if (dayRef.current && dayRef.current.contains(target)) return;
            setMonthOpen(false);
            setDayOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const 加载自定义建角配置 = async () => {
            try {
                const [savedTalents, savedBackgrounds, savedStartPresets, savedNovelDatasets, savedGameSettings] = await Promise.all([
                    dbService.读取设置(自定义天赋存储键),
                    dbService.读取设置(自定义背景存储键),
                    dbService.读取设置(自定义开局预设存储键),
                    读取小说拆分数据集列表(),
                    dbService.读取设置(设置键.游戏设置)
                ]);
                if (Array.isArray(savedTalents)) {
                    设置自定义天赋列表(合并去重天赋(savedTalents as 天赋结构[]));
                }
                if (Array.isArray(savedBackgrounds)) {
                    设置自定义背景列表(合并去重背景(savedBackgrounds as 背景结构[]));
                }
                if (Array.isArray(savedStartPresets)) {
                    设置自定义开局预设列表(合并去重开局预设方案(savedStartPresets.map(item => 标准化开局预设方案(item)).filter(Boolean) as 开局预设方案结构[]));
                }
                设置小说拆分数据集列表(savedNovelDatasets);
                if (savedGameSettings && typeof savedGameSettings === 'object') {
                    设置成人内容开启(savedGameSettings.成人内容 === true);
                    if (typeof savedGameSettings.自动填充开启 === 'boolean') {
                        set自动填充开启(savedGameSettings.自动填充开启);
                    }
                    // 里武侠/里志怪已不再提供手动开关，统一由子纪元里模式自动推导
                    const loadedEra = currentEra || savedGameSettings.时代配置ID || '';
                    const savedLiModeMap = savedGameSettings.启用子纪元里模式;
                    const loadedLiMode = typeof savedLiModeMap === 'object'
                        ? savedLiModeMap?.[loadedEra]
                        : savedLiModeMap;
                    设置子纪元里模式开启(loadedLiMode !== false);
                    if (savedGameSettings.古代体系选择) 设置古代体系选择(savedGameSettings.古代体系选择 as 体系类型);
                }
            } catch (error) {
                console.error('加载自定义身份/天赋/开局方案失败', error);
            }
        };
        加载自定义建角配置();
    }, []);

    useEffect(() => {
        const 保存自动填充开关 = async () => {
            try {
                const savedGameSettings = await dbService.读取设置(设置键.游戏设置) || {};
                await dbService.保存设置(设置键.游戏设置, { ...savedGameSettings, 自动填充开启 });
            } catch (error) {
                console.error('保存自动填充开关失败', error);
            }
        };
        保存自动填充开关();
    }, [自动填充开启]);

    useEffect(() => {
        if (!openingConfig.同人融合.附加小说数据集ID) return;
        if (小说拆分数据集列表.some((item) => item.id === openingConfig.同人融合.附加小说数据集ID)) return;
        setOpeningConfig((prev) => ({
            ...prev,
            同人融合: { ...prev.同人融合, 启用附加小说: false, 附加小说数据集ID: '' }
        }));
    }, [openingConfig.同人融合.附加小说数据集ID, 小说拆分数据集列表]);

    // --- Handlers ---
    const handleStatChange = (key: keyof typeof stats, delta: number) => {
        const current = stats[key];
        if (delta > 0 && remainingPoints <= 0) return;
        if (delta < 0 && current <= 属性最小值) return;
        if (delta > 0 && current >= 属性最大值) return;
        setStats({ ...stats, [key]: current + delta });
    };

    const toggleRelationFocus = (value: OpeningConfig['关系侧重'][number]) => {
        setOpeningConfig((prev) => {
            const exists = prev.关系侧重.includes(value);
            if (exists) return { ...prev, 关系侧重: prev.关系侧重.filter((item) => item !== value) };
            if (prev.关系侧重.length >= 2) return prev;
            return { ...prev, 关系侧重: [...prev.关系侧重, value] };
        });
    };

    const 选择附加小说数据集 = (datasetId: string) => {
        const matched = 小说拆分数据集列表.find((item) => item.id === datasetId) || null;
        setOpeningConfig((prev) => ({
            ...prev,
            同人融合: {
                ...prev.同人融合,
                启用附加小说: Boolean(datasetId),
                附加小说数据集ID: datasetId,
                作品名: matched?.作品名 || matched?.标题 || prev.同人融合.作品名,
                来源类型: '小说'
            }
        }));
    };
    const 新增附加角色替换规则 = () => {
        setOpeningConfig((prev) => ({
            ...prev,
            同人融合: { ...prev.同人融合, 附加角色替换规则列表: [...prev.同人融合.附加角色替换规则列表, { 原名称: '', 替换为: '' }] }
        }));
    };
    const 更新附加角色替换规则 = (index: number, field: '原名称' | '替换为', value: string) => {
        setOpeningConfig((prev) => ({
            ...prev,
            同人融合: {
                ...prev.同人融合,
                附加角色替换规则列表: prev.同人融合.附加角色替换规则列表.map((rule, ruleIndex) =>
                    ruleIndex === index ? { ...rule, [field]: value } : rule
                )
            }
        }));
    };
    const 删除附加角色替换规则 = (index: number) => {
        setOpeningConfig((prev) => ({
            ...prev,
            同人融合: {
                ...prev.同人融合,
                附加角色替换规则列表: prev.同人融合.附加角色替换规则列表.filter((_, ruleIndex) => ruleIndex !== index)
            }
        }));
    };

    const 校验属性点是否合法 = (): boolean => {
        if (remainingPoints < 0) {
            alert(`当前属性总点数超过 ${worldConfig.difficulty.toUpperCase()} 难度上限，请先回收 ${Math.abs(remainingPoints)} 点。`);
            setStep(1);
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        if (step === 1 && !校验属性点是否合法()) return;
        setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    };

    const toggleTalent = (t: 天赋结构) => {
        if (selectedTalents.find(x => x.名称 === t.名称)) {
            setSelectedTalents(selectedTalents.filter(x => x.名称 !== t.名称));
        } else {
            if (selectedTalents.length >= 3) { alert("最多选择3个天赋"); return; }
            setSelectedTalents([...selectedTalents, t]);
        }
    };

    const toggleQiyun = (q: 气运数据) => {
        if (selectedQiyun.find(x => x.名称 === q.名称)) {
            setSelectedQiyun(selectedQiyun.filter(x => x.名称 !== q.名称));
        } else {
            if (selectedQiyun.length >= 3) return;
            setSelectedQiyun([...selectedQiyun, q]);
        }
    };

    const generateRandomQiyun = () => {
        const random = randomQiyun(3, { excludeNsfw: true, 成人内容开启 });
        if (random.length === 0) return;
        setSelectedQiyun(random);
    };

    /** 根据当前背景自动填充天赋和气运（仅填充空位） */
    const 自动填充天赋气运 = (background: 背景结构) => {
        if (!自动填充开启) return;
        const rec = 背景推荐映射[background.名称];
        if (!rec) return;
        // 查找推荐的天赋（过滤后）
        const recTalents = rec.天赋
            .map(name => 全部天赋选项.find(t => t.名称 === name))
            .filter((t): t is typeof 全部天赋选项[number] => Boolean(t));
        // 只填充空位
        const currentTalentNames = new Set(selectedTalents.map(t => t.名称));
        const toAddTalents = recTalents.filter(t => !currentTalentNames.has(t.名称));
        const maxSlots = 3;
        const slotsLeft = maxSlots - selectedTalents.length;
        if (slotsLeft > 0 && toAddTalents.length > 0) {
            setSelectedTalents([...selectedTalents, ...toAddTalents.slice(0, slotsLeft)]);
        }
        // 查找推荐的气运（过滤后）
        const recQiyun = rec.气运
            .map(name => 全部气运选项.find(q => q.名称 === name))
            .filter((q): q is typeof 全部气运选项[number] => Boolean(q));
        const currentQiyunNames = new Set(selectedQiyun.map(q => q.名称));
        const toAddQiyun = recQiyun.filter(q => !currentQiyunNames.has(q.名称));
        const qiyunSlotsLeft = maxSlots - selectedQiyun.length;
        if (qiyunSlotsLeft > 0 && toAddQiyun.length > 0) {
            setSelectedQiyun([...selectedQiyun, ...toAddQiyun.slice(0, qiyunSlotsLeft)]);
        }
    };

    const addCustomTalent = async () => {
        const normalized = 标准化天赋(customTalent);
        if (!normalized) { alert("请完整填写自定义天赋（名称/描述/效果）"); return; }
        if (预设天赋.some(item => item.名称 === normalized.名称) && 正在编辑天赋名 !== normalized.名称) {
            alert('该天赋名称与系统预设重复，请改名后保存。');
            return;
        }
        const 原名称 = 正在编辑天赋名 || normalized.名称;
        const 已选同名 = selectedTalents.some(x => x.名称 === 原名称 || x.名称 === normalized.名称);
        if (!已选同名 && selectedTalents.length >= 3) { alert("最多选择3个天赋"); return; }
        const 下一个自定义天赋列表 = 合并去重天赋([
            ...自定义天赋列表.filter(item => item.名称 !== 原名称 && item.名称 !== normalized.名称),
            normalized
        ]);
        设置自定义天赋列表(下一个自定义天赋列表);
        setSelectedTalents(prev => {
            const withoutOriginal = prev.filter(item => item.名称 !== 原名称 && item.名称 !== normalized.名称);
            return [...withoutOriginal, normalized];
        });
        重置自定义天赋编辑();
        try { await dbService.保存设置(自定义天赋存储键, 下一个自定义天赋列表); }
        catch (error) { console.error('保存自定义天赋失败', error); }
    };

    const addCustomBackground = async () => {
        const normalized = 标准化背景(customBackground);
        if (!normalized) { alert("请完整填写自定义身份（名称/描述/效果）"); return; }
        if (预设背景.some(item => item.名称 === normalized.名称) && 正在编辑背景名 !== normalized.名称) {
            alert('该身份名称与系统预设重复，请改名后保存。');
            return;
        }
        const 原名称 = 正在编辑背景名 || normalized.名称;
        const 下一个自定义背景列表 = 合并去重背景([
            ...自定义背景列表.filter(item => item.名称 !== 原名称 && item.名称 !== normalized.名称),
            normalized
        ]);
        设置自定义背景列表(下一个自定义背景列表);
        setSelectedBackground(normalized);
        重置自定义背景编辑();
        try { await dbService.保存设置(自定义背景存储键, 下一个自定义背景列表); }
        catch (error) { console.error('保存自定义身份失败', error); }
    };

    const 编辑自定义天赋 = (item: 天赋结构) => {
        setCustomTalent(item);
        set正在编辑天赋名(item.名称);
        setShowCustomTalent(true);
    };
    const 删除自定义天赋 = async (name: string) => {
        const nextList = 自定义天赋列表.filter(item => item.名称 !== name);
        设置自定义天赋列表(nextList);
        setSelectedTalents(prev => prev.filter(item => item.名称 !== name));
        if (正在编辑天赋名 === name) 重置自定义天赋编辑();
        try { await dbService.保存设置(自定义天赋存储键, nextList); }
        catch (error) { console.error('删除自定义天赋失败', error); }
    };
    const 编辑自定义背景 = (item: 背景结构) => {
        setCustomBackground(item);
        set正在编辑背景名(item.名称);
        setShowCustomBackground(true);
    };
    const 删除自定义背景 = async (name: string) => {
        const nextList = 自定义背景列表.filter(item => item.名称 !== name);
        设置自定义背景列表(nextList);
        if (selectedBackground.名称 === name) setSelectedBackground(预设背景[0]);
        if (正在编辑背景名 === name) 重置自定义背景编辑();
        try { await dbService.保存设置(自定义背景存储键, nextList); }
        catch (error) { console.error('删除自定义身份失败', error); }
    };

    const 构建当前表单开局预设 = (meta?: Partial<自定义开局预设元信息> & { id?: string }): 开局预设方案结构 => ({
        id: meta?.id || 正在编辑开局预设ID || 生成自定义开局预设ID(),
        名称: meta?.名称?.trim() || customPresetMeta.名称.trim(),
        简介: meta?.简介?.trim() || customPresetMeta.简介.trim() || '自定义开局方案',
        worldConfig: {
            ...worldConfig,
            worldExtraRequirement: worldConfig.worldExtraRequirement?.trim() || '',
            manualWorldPrompt: worldConfig.manualWorldPrompt?.trim() || '',
            manualRealmPrompt: worldConfig.manualRealmPrompt?.trim() || ''
        },
        character: {
            姓名: charName.trim(), 性别: charGender.trim(), 年龄: charAge,
            出生月: birthMonth, 出生日: birthDay,
            外貌: charAppearance.trim(), 性格: charPersonality.trim(),
            属性: { ...stats },
            背景名称: selectedBackground?.名称 || '',
            天赋名称列表: selectedTalents.map(item => item.名称).slice(0, 3),
            气运列表: selectedQiyun
        },
        openingConfig: openingConfigEnabled ? 规范化开局配置(openingConfig) : undefined,
        openingStreaming: true,
        openingExtraRequirement: openingExtraRequirement.trim()
    });

    const 保存自定义开局预设列表 = async (nextList: 开局预设方案结构[]) => {
        设置自定义开局预设列表(nextList);
        try { await dbService.保存设置(自定义开局预设存储键, nextList); }
        catch (error) { console.error('保存自定义开局方案失败', error); }
    };

    const 保存当前为自定义开局方案 = async () => {
        const 名称 = customPresetMeta.名称.trim();
        if (!名称) { alert('请先填写方案名称'); return; }
        const 目标ID = 正在编辑开局预设ID || '';
        const 名称冲突 = 自定义开局预设列表.some(item => item.名称 === 名称 && item.id !== 目标ID);
        if (名称冲突) { alert('该方案名称已存在，请改名后保存。'); return; }
        const nextPreset = 标准化开局预设方案(构建当前表单开局预设());
        if (!nextPreset) { alert('当前方案内容无效，无法保存。'); return; }
        const nextList = 合并去重开局预设方案([
            ...自定义开局预设列表.filter(item => item.id !== nextPreset.id),
            nextPreset
        ]);
        await 保存自定义开局预设列表(nextList);
        重置自定义开局预设编辑();
    };

    const 编辑自定义开局方案信息 = (preset: 开局预设方案结构) => {
        setCustomPresetMeta({ 名称: preset.名称, 简介: preset.简介 || '' });
        set正在编辑开局预设ID(preset.id);
        setShowCustomPresetEditor(true);
        setStep(4);
    };

    const 用当前配置覆盖开局方案 = async (preset: 开局预设方案结构) => {
        const nextPreset = 标准化开局预设方案(构建当前表单开局预设({
            id: preset.id, 名称: preset.名称, 简介: preset.简介
        }));
        if (!nextPreset) return;
        const nextList = 合并去重开局预设方案([
            ...自定义开局预设列表.filter(item => item.id !== preset.id),
            nextPreset
        ]);
        await 保存自定义开局预设列表(nextList);
    };

    const 删除自定义开局方案 = async (presetId: string) => {
        const nextList = 自定义开局预设列表.filter(item => item.id !== presetId);
        await 保存自定义开局预设列表(nextList);
        if (正在编辑开局预设ID === presetId) 重置自定义开局预设编辑();
    };

    const handleGenerate = async (preset?: 开局预设方案结构) => {
        const effectiveWorldConfig = preset ? { ...worldConfig, ...preset.worldConfig, 古代体系选择 } : { ...worldConfig, 古代体系选择 };
        const effectiveOpeningConfig = preset
            ? 规范化可选开局配置(preset.openingConfig)
            : (openingConfigEnabled ? 规范化开局配置(openingConfig) : undefined);
        const effectiveName = preset?.character.姓名 ?? charName;
        const effectiveGender = preset?.character.性别 ?? charGender;
        const effectiveRoleReplaceRules = 获取同人角色替换规则列表(effectiveOpeningConfig, effectiveName);
        if (!effectiveName.trim()) { alert("请先填写角色姓名"); setStep(1); return; }
        if (!effectiveGender.trim()) { alert("请先填写角色性别"); setStep(1); return; }
        if (!preset && !校验属性点是否合法()) return;
        if (effectiveOpeningConfig?.同人融合.enabled && !effectiveOpeningConfig.同人融合.作品名.trim()) {
            alert('已启用同人融合，请先填写作品名。'); setStep(3); return;
        }
        if (effectiveOpeningConfig?.同人融合.enabled && effectiveOpeningConfig.同人融合.启用附加小说 && !effectiveOpeningConfig.同人融合.附加小说数据集ID.trim()) {
            alert('已启用附加小说，请先选择一个小说分解数据集。'); setStep(3); return;
        }
        if (effectiveOpeningConfig?.同人融合.enabled && effectiveOpeningConfig.同人融合.启用角色替换 && effectiveRoleReplaceRules.length <= 0) {
            alert('已启用同人角色替换，请先填写至少一条有效替换规则。'); setStep(3); return;
        }
        const charData = preset
            ? 构建角色数据({
                角色名: preset.character.姓名, 性别: preset.character.性别,
                年龄: preset.character.年龄, 外貌: preset.character.外貌,
                性格: preset.character.性格, 出生月: preset.character.出生月,
                出生日: preset.character.出生日, 属性: preset.character.属性,
                背景: 根据名称查找背景(preset.character.背景名称),
                天赋列表: 根据名称查找天赋列表(preset.character.天赋名称列表),
                气运列表: Array.isArray(preset.character.气运列表) ? preset.character.气运列表 : undefined
            })
            : 构建角色数据();
        const effectiveOpeningExtraRequirement = preset?.openingExtraRequirement ?? openingExtraRequirement;
        const ok = requestConfirm
            ? await requestConfirm({ title: '确认创建', message: '开局将直接以流式方式生成并展示开场剧情。是否继续创建？', confirmText: '开始生成' })
            : true;
        if (!ok) return;
        // Persist 子纪元里模式开关到 IndexedDB，里武侠/里志怪由运行时自动推导
        try {
            const savedGameSettings = await dbService.读取设置(设置键.游戏设置) || {};
            const savedEra = currentEra || savedGameSettings.时代配置ID || '';
            const prev = typeof savedGameSettings.启用子纪元里模式 === 'object'
                ? savedGameSettings.启用子纪元里模式
                : {};
            await dbService.保存设置(设置键.游戏设置, { ...savedGameSettings, 时代配置ID: savedEra, 启用子纪元里模式: { ...prev, [savedEra]: 子纪元里模式开启 }, 古代体系选择 });
        } catch (error) {
            console.error('保存游戏设置失败', error);
        }
        onComplete(effectiveWorldConfig, charData, effectiveOpeningConfig, 'all', true, effectiveOpeningExtraRequirement.trim());
    };

    return {
        // State
        step, setStep,
        worldConfig, setWorldConfig,
        selectedQiyun, setSelectedQiyun,
        charName, setCharName, charGender, setCharGender, charAge, setCharAge,
        charAppearance, setCharAppearance, charPersonality, setCharPersonality,
        birthMonth, setBirthMonth, birthDay, setBirthDay,
        monthOpen, setMonthOpen, dayOpen, setDayOpen,
        monthRef, dayRef, manualWorldPromptInputRef, manualRealmPromptInputRef,
        stats, setStats,
        openingConfig, setOpeningConfig, openingConfigEnabled, setOpeningConfigEnabled,
        selectedBackground, setSelectedBackground,
        selectedTalents, setSelectedTalents,
        自定义天赋列表, 设置自定义天赋列表,
        自定义背景列表, 设置自定义背景列表,
        自定义开局预设列表, 设置自定义开局预设列表,
        小说拆分数据集列表, 设置小说拆分数据集列表,
        成人内容开启, 设置成人内容开启,
        子纪元里模式开启, 设置子纪元里模式开启,
        古代体系选择, 设置古代体系选择,
        customTalent, setCustomTalent, showCustomTalent, setShowCustomTalent,
        正在编辑天赋名, set正在编辑天赋名,
        customBackground, setCustomBackground, showCustomBackground, setShowCustomBackground,
        正在编辑背景名, set正在编辑背景名,
        showCustomPresetEditor, setShowCustomPresetEditor,
        正在编辑开局预设ID, set正在编辑开局预设ID,
        customPresetMeta, setCustomPresetMeta,
        openingExtraRequirement, setOpeningExtraRequirement,
        背景搜索词, set背景搜索词,
        天赋搜索词, set天赋搜索词,
        气运搜索词, set气运搜索词,
        气运类别过滤, set气运类别过滤,
        气运稀有度过滤, set气运稀有度过滤,
        背景分类过滤, set背景分类过滤,
        天赋分类过滤, set天赋分类过滤,
        自动填充开启, set自动填充开启,
        选择气运类别, 选择气运稀有度,

        // Computed
        STEPS, monthOptions, dayOptions,
        全部背景选项, 全部天赋选项, 全部气运选项,
        过滤后背景选项, 过滤后天赋选项, 过滤后气运选项,
        当前子纪元默认预设, 当前子纪元默认预设列表,
        当前性别模式,
        totalStatBudget, usedPoints, remainingPoints,
        stepProgress, currentStepLabel, selectedTalentNames,
        背景长期说明, 天赋说明,
        当前附加小说数据集, 当前角色替换规则列表,
        // 动态分类列表（从当前可用选项中提取）
        背景分类列表: useMemo(() => {
            const cats = new Set<string>();
            全部背景选项.forEach(item => { if (item.分类) cats.add(item.分类); });
            return Array.from(cats);
        }, [全部背景选项]),
        天赋分类列表: useMemo(() => {
            const cats = new Set<string>();
            全部天赋选项.forEach(item => { if (item.分类) cats.add(item.分类); });
            return Array.from(cats);
        }, [全部天赋选项]),

        // Handlers
        标准化天赋, 标准化背景, 合并去重天赋, 合并去重背景,
        重置自定义天赋编辑, 重置自定义背景编辑, 重置自定义开局预设编辑,
        根据名称查找背景, 根据名称查找天赋列表,
        构建角色数据, 应用预设到表单, 应用子纪元默认预设,
        选择性别, handleStatChange, toggleRelationFocus,
        选择附加小说数据集, 新增附加角色替换规则, 更新附加角色替换规则, 删除附加角色替换规则,
        校验属性点是否合法, handleNextStep,
        toggleTalent, toggleQiyun, generateRandomQiyun,
        自动填充天赋气运,
        addCustomTalent, addCustomBackground,
        编辑自定义天赋, 删除自定义天赋,
        编辑自定义背景, 删除自定义背景,
        构建当前表单开局预设,
        保存自定义开局预设列表, 保存当前为自定义开局方案,
        编辑自定义开局方案信息, 用当前配置覆盖开局方案, 删除自定义开局方案,
        handleGenerate,

        // EraSelector
        showEraSelector, setShowEraSelector,
        读取UTF8文本文件, 导出文本文件,
        导入手动提示词文件, 导出手动世界观提示词, 导出手动境界提示词, 导出境界提示词模板,

        // Props passthrough
        onCancel, loading,
    };
}

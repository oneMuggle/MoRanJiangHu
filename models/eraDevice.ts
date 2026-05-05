// 跨时代移动设备 — 时代设备配置

import { DeviceConfig, MobileApp } from './mobileDevice';
import { resolveEraNode } from './eraTheme';

/** 按 eraId 索引的设备配置 */
export const eraDeviceConfigs: Record<string, DeviceConfig> = {
    // ========== 古代东方 · 武侠 ==========
    'ancient_eastern_wuxia': {
        deviceId: 'jade_token_wuxia',
        deviceName: '传音玉简',
        deviceForm: 'jade_token',
        eraId: 'ancient_eastern_wuxia',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        normalAppNames: {
            map: '山川舆图',
            contacts: '英雄帖',
            chat: '飞鸽传书',
            forum: '武林风云录',
        },
        capabilities: {
            hasGPS: false,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '同城内',
            能源类型: '真气',
        },
        liModeOverrides: {
            appNames: {
                map: '灵识暗图',
                contacts: '暗契簿',
                chat: '密音阵',
                forum: '暗榜',
                news: '秘闻录',
            },
            themeColor: '#5C1A1A',
        },
    },

    // ========== 古代东方 · 志怪 ==========
    'ancient_eastern_strange': {
        deviceId: 'jade_token_strange',
        deviceName: '灵契玉简',
        deviceForm: 'jade_token',
        eraId: 'ancient_eastern_strange',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        normalAppNames: { map: '山川舆图', contacts: '英雄帖', chat: '飞鸽传书', forum: '武林风云录', news: '江湖快报', album: '影集', tools: '灵器' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '跨城',
            能源类型: '灵力',
        },
        liModeOverrides: {
            appNames: {
                map: '灵识暗图',
                contacts: '暗契簿',
                chat: '密音阵',
                forum: '暗榜',
                news: '秘闻录',
            },
            themeColor: '#5C1A1A',
        },
    },

    // ========== 古代东方 · 仙侠 ==========
    'ancient_eastern_xianxia': {
        deviceId: 'jade_token_xianxia',
        deviceName: '神识玉简',
        deviceForm: 'jade_token',
        eraId: 'ancient_eastern_xianxia',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        normalAppNames: { map: '山川舆图', contacts: '英雄帖', chat: '飞鸽传书', forum: '武林风云录', news: '江湖快报', album: '影集', tools: '灵器' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '跨洲',
            能源类型: '灵力',
        },
        liModeOverrides: {
            appNames: {
                map: '灵识暗图',
                contacts: '暗契簿',
                chat: '密音阵',
                forum: '暗榜',
                news: '秘闻录',
            },
            themeColor: '#5C1A1A',
        },
    },

    // ========== 古代西方 · 希腊 ==========
    'ancient_western_greek': {
        deviceId: 'scroll_greek',
        deviceName: '信使卷轴',
        deviceForm: 'scroll',
        eraId: 'ancient_western_greek',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        normalAppNames: { map: '舆图', contacts: '信使录', chat: '飞鸽传书', forum: '文告榜', news: '邸报', album: '画集', tools: '器用' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '城邦之间',
            能源类型: '体力',
        },
    },

    // ========== 古代西方 · 罗马 ==========
    'ancient_western_roman': {
        deviceId: 'scroll_roman',
        deviceName: '预言铜镜',
        deviceForm: 'scroll',
        eraId: 'ancient_western_roman',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        normalAppNames: { map: '舆图', contacts: '信使录', chat: '飞鸽传书', forum: '文告榜', news: '邸报', album: '画集', tools: '器用' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '帝国范围',
            能源类型: '体力',
        },
    },

    // ========== 近代东方 · 民国 ==========
    'modern_eastern_republic': {
        deviceId: 'telegraph_republic',
        deviceName: '电报收发器',
        deviceForm: 'telegraph',
        eraId: 'modern_eastern_republic',
        apps: ['map', 'contacts', 'chat', 'forum', 'news'],
        uiStyle: 'retro',
        normalAppNames: { map: '电报地图', contacts: '电报通讯录', chat: '电报通讯', forum: '电报公告', news: '电讯', album: '影集', tools: '电报工具' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '城市间',
            能源类型: '电力',
        },
    },

    // ========== 近代西方 · 维多利亚 ==========
    'modern_western_victorian': {
        deviceId: 'mechanical_victorian',
        deviceName: '通讯怀表',
        deviceForm: 'mechanical',
        eraId: 'modern_western_victorian',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'retro',
        normalAppNames: { map: '机械地图', contacts: '机械通讯录', chat: '机械群聊', forum: '机械论坛', news: '机械资讯', album: '机械相册', tools: '机械工具' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '城市范围',
            能源类型: '体力',
        },
    },

    // ========== 当代 · 都市（核心） ==========
    'contemporary_urban': {
        deviceId: 'smartphone_urban',
        deviceName: '智能手机',
        deviceForm: 'smartphone',
        eraId: 'contemporary_urban',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album', 'tools'],
        uiStyle: 'modern',
        normalAppNames: { map: '地图', contacts: '通讯录', chat: '群聊', forum: '论坛', news: '资讯', album: '相册', tools: '工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: true,
            通讯范围: '全球',
            能源类型: '电力',
        },
        liModeOverrides: {
            appNames: {
                map: '夜行地图',
                contacts: '关系网',
                chat: '私密聊天',
                forum: '都市秘闻',
                news: '深夜推送',
                album: '私密相册',
            },
            themeColor: '#6B2D8B',
        },
    },

    // ========== 当代 · 校园纪元 ==========
    'contemporary_campus': {
        deviceId: 'smartphone_campus',
        deviceName: '智能手机',
        deviceForm: 'smartphone',
        eraId: 'contemporary_campus',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album', 'tools', 'schedule', 'campus_card', 'club', 'confession', 'rules', 'hypnosis', 'bdsn'],
        uiStyle: 'modern',
        normalAppNames: {
            map: '地图', contacts: '通讯录', chat: '私聊', forum: '校园论坛', news: '校园资讯', album: '相册', tools: '工具',
            schedule: '课程表', campus_card: '校园卡', club: '社团活动', confession: '表白墙',
            rules: '学生手册', hypnosis: '心理辅导', bdsn: '深夜板块',
        },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: true,
            通讯范围: '校园内',
            能源类型: '电力',
        },
        liModeOverrides: {
            appNames: {
                map: '夜行地图',
                contacts: '关系网',
                chat: '私密聊天',
                forum: '深夜树洞',
                news: '暗面推送',
                album: '私密相册',
                tools: '暗面工具',
                schedule: '秘密约会',
                campus_card: '校园钱包',
                club: '地下社团',
                confession: '匿名告白',
                rules: '暗影校规',
                hypnosis: '深度催眠',
                bdsn: '禁忌论坛',
            },
            themeColor: '#2D6B3A',
        },
    },

    // ========== 当代 · 乡村 ==========
    'contemporary_rural': {
        deviceId: 'radio_rural',
        deviceName: '功能机',
        deviceForm: 'radio',
        eraId: 'contemporary_rural',
        apps: ['map', 'contacts', 'chat', 'forum', 'news'],
        uiStyle: 'modern',
        normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '数十公里',
            能源类型: '电力',
        },
        liModeOverrides: {
            appNames: {
                map: '乡野小路图',
                contacts: '乡亲录',
                chat: '村口闲聊',
                forum: '村头八卦',
                news: '乡野传闻',
            },
            themeColor: '#2D5A27',
        },
    },

    // ========== 当代 · 末日废土 ==========
    'contemporary_post_apocalyptic': {
        deviceId: 'radio_apocalyptic',
        deviceName: '对讲机',
        deviceForm: 'radio',
        eraId: 'contemporary_post_apocalyptic',
        apps: ['map', 'contacts', 'chat', 'forum', 'news'],
        uiStyle: 'retro',
        normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '数公里',
            能源类型: '太阳能',
        },
        liModeOverrides: {
            appNames: {
                map: '生存区域图',
                contacts: '幸存者名录',
                chat: '加密频道',
                forum: '黑市公告板',
                news: '废土电台',
            },
            themeColor: '#8B3A3A',
        },
    },

    // ========== 当代 · 黑色犯罪 ==========
    'contemporary_noir': {
        deviceId: 'smartphone_noir',
        deviceName: '智能手机',
        deviceForm: 'smartphone',
        eraId: 'contemporary_noir',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
        uiStyle: 'modern',
        normalAppNames: { map: '地图', contacts: '通讯录', chat: '群聊', forum: '论坛', news: '资讯', album: '相册', tools: '工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: true,
            通讯范围: '全球',
            能源类型: '电力',
        },
        liModeOverrides: {
            appNames: {
                map: '暗巷地图',
                contacts: '线人录',
                chat: '暗线通讯',
                forum: '地下情报',
                news: '黑色快讯',
                album: '私密相册',
            },
            themeColor: '#1A1A2E',
        },
    },

    // ========== 当代 · 嬉皮士文化 ==========
    'contemporary_hippie': {
        deviceId: 'smartphone_hippie',
        deviceName: '智能手机',
        deviceForm: 'smartphone',
        eraId: 'contemporary_hippie',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
        uiStyle: 'modern',
        normalAppNames: { map: '地图', contacts: '通讯录', chat: '群聊', forum: '论坛', news: '资讯', album: '相册', tools: '工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: true,
            通讯范围: '全球',
            能源类型: '电力',
        },
        liModeOverrides: {
            appNames: {
                map: '迷幻地图',
                contacts: '灵魂伴侣录',
                chat: '公社圈子',
                forum: '地下刊物',
                news: '反文化快报',
                album: '私密相册',
            },
            themeColor: '#9B59B6',
        },
    },

    // ========== 当代 · 丧尸危机 ==========
    'contemporary_zombie': {
        deviceId: 'radio_zombie',
        deviceName: '对讲机',
        deviceForm: 'radio',
        eraId: 'contemporary_zombie',
        apps: ['map', 'contacts', 'chat', 'news'],
        uiStyle: 'retro',
        normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '数公里',
            能源类型: '太阳能',
        },
        liModeOverrides: {
            appNames: {
                map: '安全区域图',
                contacts: '幸存者名录',
                chat: '加密频道',
                news: '末日电台',
            },
            themeColor: '#8B3A3A',
        },
    },

    // ========== 当代 · 极寒末日 ==========
    'contemporary_extreme_cold': {
        deviceId: 'radio_cold',
        deviceName: '对讲机',
        deviceForm: 'radio',
        eraId: 'contemporary_extreme_cold',
        apps: ['map', 'contacts', 'chat', 'news'],
        uiStyle: 'retro',
        normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '数公里',
            能源类型: '太阳能',
        },
        liModeOverrides: {
            appNames: {
                map: '避难所地图',
                contacts: '幸存者名录',
                chat: '加密频道',
                news: '极寒电台',
            },
            themeColor: '#3A5C8B',
        },
    },

    // ========== 当代 · 生化危机 ==========
    'contemporary_biohazard': {
        deviceId: 'radio_bio',
        deviceName: '对讲机',
        deviceForm: 'radio',
        eraId: 'contemporary_biohazard',
        apps: ['map', 'contacts', 'chat', 'news'],
        uiStyle: 'retro',
        normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '数公里',
            能源类型: '太阳能',
        },
        liModeOverrides: {
            appNames: {
                map: '污染区域图',
                contacts: '幸存者名录',
                chat: '加密频道',
                news: '隔离区电台',
            },
            themeColor: '#4A8B3A',
        },
    },

    // ========== 当代 · 核冬天 ==========
    'contemporary_nuclear_winter': {
        deviceId: 'radio_nuclear',
        deviceName: '对讲机',
        deviceForm: 'radio',
        eraId: 'contemporary_nuclear_winter',
        apps: ['map', 'contacts', 'chat', 'news'],
        uiStyle: 'retro',
        normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '数公里',
            能源类型: '太阳能',
        },
        liModeOverrides: {
            appNames: {
                map: '辐射区域图',
                contacts: '幸存者名录',
                chat: '加密频道',
                news: '核冬电台',
            },
            themeColor: '#8B6B3A',
        },
    },

    // ========== 近未来 · 赛博朋克（核心） ==========
    'near-future_cyberpunk': {
        deviceId: 'data_terminal_cyber',
        deviceName: '数据终端',
        deviceForm: 'data_terminal',
        eraId: 'near-future_cyberpunk',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
        uiStyle: 'tech',
        normalAppNames: { map: '星图', contacts: '星际通讯录', chat: '星际通讯', forum: '星际论坛', news: '星际资讯', album: '星际相册', tools: '星际工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: true,
            hasAR: true,
            通讯范围: '全球+神经链接',
            能源类型: '量子',
        },
        liModeOverrides: {
            appNames: {
                map: '暗网节点图',
                contacts: '神经契约',
                chat: '深网频道',
                forum: '暗网论坛',
                news: '黑市数据流',
                album: '私密记忆库',
            },
            themeColor: '#00FFFF',
        },
    },

    // ========== 近未来 · 反乌托邦 ==========
    'near-future_dystopia': {
        deviceId: 'data_terminal_dystopia',
        deviceName: '数据终端',
        deviceForm: 'data_terminal',
        eraId: 'near-future_dystopia',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
        uiStyle: 'tech',
        normalAppNames: { map: '星图', contacts: '星际通讯录', chat: '星际通讯', forum: '星际论坛', news: '星际资讯', album: '星际相册', tools: '星际工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: true,
            hasAR: true,
            通讯范围: '监控网内',
            能源类型: '量子',
        },
        liModeOverrides: {
            appNames: {
                map: '监控盲区图',
                contacts: '抵抗者名录',
                chat: '加密反抗频道',
                forum: '地下广播',
                news: '体制外真相',
                album: '隐藏记忆库',
            },
            themeColor: '#CC0000',
        },
    },

    // ========== 近未来 · 太空殖民 ==========
    'near-future_space_colonization': {
        deviceId: 'data_terminal_space',
        deviceName: '数据终端',
        deviceForm: 'data_terminal',
        eraId: 'near-future_space_colonization',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
        uiStyle: 'tech',
        normalAppNames: { map: '星图', contacts: '星际通讯录', chat: '星际通讯', forum: '星际论坛', news: '星际资讯', album: '星际相册', tools: '星际工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: true,
            hasAR: true,
            通讯范围: '星际网络',
            能源类型: '量子',
        },
        liModeOverrides: {
            appNames: {
                map: '殖民星域图',
                contacts: '基因匹配录',
                chat: '殖民者共鸣',
                forum: '星际联姻网',
                news: '殖民地秘闻',
                album: '私密记忆库',
            },
            themeColor: '#FFD700',
        },
    },

    // ========== 古代西方 · 中世纪 ==========
    'ancient_western_medieval': {
        deviceId: 'scroll_medieval',
        deviceName: '信使渡鸦',
        deviceForm: 'scroll',
        eraId: 'ancient_western_medieval',
        apps: ['map', 'contacts', 'chat'],
        uiStyle: 'ancient',
        normalAppNames: { map: '舆图', contacts: '信使录', chat: '飞鸽传书', forum: '文告榜', news: '邸报', album: '画集', tools: '器用' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '城堡间',
            能源类型: '体力',
        },
        liModeOverrides: {
            appNames: {
                map: '密道图',
                contacts: '密友录',
                chat: '暗语信',
            },
            themeColor: '#4A0E0E',
        },
    },

    // ========== 古代西方 · 维京 ==========
    'ancient_western_viking': {
        deviceId: 'rune_stone_viking',
        deviceName: '卢恩符文石',
        deviceForm: 'scroll',
        eraId: 'ancient_western_viking',
        apps: ['map', 'contacts', 'chat'],
        uiStyle: 'ancient',
        normalAppNames: { map: '舆图', contacts: '信使录', chat: '飞鸽传书', forum: '文告榜', news: '邸报', album: '画集', tools: '器用' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '峡湾间',
            能源类型: '体力',
        },
        liModeOverrides: {
            appNames: {
                map: '航海图',
                contacts: '战盟录',
                chat: '符文信',
            },
            themeColor: '#2D4A6B',
        },
    },

    // ========== 古代西方 · 凯尔特 ==========
    'ancient_western_celtic': {
        deviceId: 'druid_scroll',
        deviceName: '德鲁伊符文卷',
        deviceForm: 'scroll',
        eraId: 'ancient_western_celtic',
        apps: ['map', 'contacts', 'chat'],
        uiStyle: 'ancient',
        normalAppNames: { map: '舆图', contacts: '信使录', chat: '飞鸽传书', forum: '文告榜', news: '邸报', album: '画集', tools: '器用' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '部落间',
            能源类型: '灵力',
        },
        liModeOverrides: {
            appNames: {
                map: '灵林图',
                contacts: '部族录',
                chat: '自然密语',
            },
            themeColor: '#2D5A27',
        },
    },

    // ========== 古代东方 · 志怪 ==========
    'ancient_eastern_zhiguai': {
        deviceId: 'jade_token_zhiguai',
        deviceName: '幽冥玉简',
        deviceForm: 'jade_token',
        eraId: 'ancient_eastern_zhiguai',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        normalAppNames: { map: '山川舆图', contacts: '英雄帖', chat: '飞鸽传书', forum: '武林风云录', news: '江湖快报', album: '影集', tools: '灵器' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '人间幽冥',
            能源类型: '灵力',
        },
        liModeOverrides: {
            appNames: {
                map: '幽冥路引',
                contacts: '妖契簿',
                chat: '鬼语阵',
                forum: '幽冥榜',
            },
            themeColor: '#2D1A3A',
        },
    },

    // ========== 古代东方 · 神话 ==========
    'ancient_eastern_myth': {
        deviceId: 'jade_token_myth',
        deviceName: '仙缘玉简',
        deviceForm: 'jade_token',
        eraId: 'ancient_eastern_myth',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        normalAppNames: { map: '山川舆图', contacts: '英雄帖', chat: '飞鸽传书', forum: '武林风云录', news: '江湖快报', album: '影集', tools: '灵器' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '三界',
            能源类型: '灵力',
        },
        liModeOverrides: {
            appNames: {
                map: '仙途图',
                contacts: '仙缘录',
                chat: '传音入密',
                forum: '仙界榜',
            },
            themeColor: '#8B6914',
        },
    },

    // ========== 古代东方 · 权谋 ==========
    'ancient_eastern_intrigue': {
        deviceId: 'jade_token_intrigue',
        deviceName: '密奏玉简',
        deviceForm: 'jade_token',
        eraId: 'ancient_eastern_intrigue',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        normalAppNames: { map: '山川舆图', contacts: '英雄帖', chat: '飞鸽传书', forum: '武林风云录', news: '江湖快报', album: '影集', tools: '灵器' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '朝堂',
            能源类型: '真气',
        },
        liModeOverrides: {
            appNames: {
                map: '暗线地图',
                contacts: '暗桩录',
                chat: '密奏',
                forum: '朝野秘闻',
            },
            themeColor: '#3A1A1A',
        },
    },

    // ========== 古代东方 · 修仙 ==========
    'ancient_eastern_cultivation': {
        deviceId: 'jade_token_cultivation',
        deviceName: '传音玉牌',
        deviceForm: 'jade_token',
        eraId: 'ancient_eastern_cultivation',
        apps: ['map', 'contacts', 'chat', 'forum'],
        uiStyle: 'ancient',
        normalAppNames: { map: '山川舆图', contacts: '英雄帖', chat: '飞鸽传书', forum: '武林风云录', news: '江湖快报', album: '影集', tools: '灵器' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '修真界',
            能源类型: '灵力',
        },
        liModeOverrides: {
            appNames: {
                map: '灵脉图',
                contacts: '道契簿',
                chat: '传音法阵',
                forum: '天机榜',
            },
            themeColor: '#4A2D8B',
        },
    },

    // ========== 近代东方 · 明治大正 ==========
    'modern_eastern_meiji_taisho': {
        deviceId: 'telegraph_meiji',
        deviceName: '和风电报',
        deviceForm: 'telegraph',
        eraId: 'modern_eastern_meiji_taisho',
        apps: ['map', 'contacts', 'chat', 'news'],
        uiStyle: 'retro',
        normalAppNames: { map: '电报地图', contacts: '电报通讯录', chat: '电报通讯', forum: '电报公告', news: '电讯', album: '影集', tools: '电报工具' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '城市间',
            能源类型: '电力',
        },
        liModeOverrides: {
            appNames: {
                map: '暗地图',
                contacts: '密友录',
                chat: '暗号电报',
                news: '内幕快报',
            },
            themeColor: '#5C1A1A',
        },
    },

    // ========== 近代东方 · 晚清 ==========
    'modern_eastern_late_qing': {
        deviceId: 'mechanical_late_qing',
        deviceName: '铜铃通讯器',
        deviceForm: 'mechanical',
        eraId: 'modern_eastern_late_qing',
        apps: ['map', 'contacts', 'chat'],
        uiStyle: 'retro',
        normalAppNames: { map: '机械地图', contacts: '机械通讯录', chat: '机械群聊', forum: '机械论坛', news: '机械资讯', album: '机械相册', tools: '机械工具' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '城镇间',
            能源类型: '体力',
        },
        liModeOverrides: {
            appNames: {
                map: '密道图',
                contacts: '会党录',
                chat: '暗语铜铃',
            },
            themeColor: '#6B3A1A',
        },
    },

    // ========== 近代西方 · 爵士时代 ==========
    'modern_western_jazz_age': {
        deviceId: 'mechanical_jazz',
        deviceName: '爵士点唱机',
        deviceForm: 'mechanical',
        eraId: 'modern_western_jazz_age',
        apps: ['map', 'contacts', 'chat', 'forum', 'news'],
        uiStyle: 'retro',
        normalAppNames: { map: '机械地图', contacts: '机械通讯录', chat: '机械群聊', forum: '机械论坛', news: '机械资讯', album: '机械相册', tools: '机械工具' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '都市范围',
            能源类型: '电力',
        },
        liModeOverrides: {
            appNames: {
                map: '夜行地图',
                contacts: '密友录',
                chat: '地下酒吧热线',
                forum: '地下刊物',
                news: '内幕快报',
            },
            themeColor: '#8B6B1A',
        },
    },

    // ========== 近代西方 · 战后重建 ==========
    'modern_western_postwar': {
        deviceId: 'radio_postwar',
        deviceName: '收音通讯机',
        deviceForm: 'radio',
        eraId: 'modern_western_postwar',
        apps: ['map', 'contacts', 'chat', 'news'],
        uiStyle: 'retro',
        normalAppNames: { map: '广播地图', contacts: '广播通讯录', chat: '广播群聊', forum: '广播论坛', news: '广播资讯', album: '广播相册', tools: '广播工具' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '国家范围',
            能源类型: '电力',
        },
        liModeOverrides: {
            appNames: {
                map: '重建地图',
                contacts: '联络录',
                chat: '加密电台',
                news: '内部消息',
            },
            themeColor: '#4A4A4A',
        },
    },

    // ========== 远未来 · 太空歌剧 ==========
    'far-future_space_opera': {
        deviceId: 'hologram_space_opera',
        deviceName: '星际通讯器',
        deviceForm: 'hologram',
        eraId: 'far-future_space_opera',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
        uiStyle: 'holographic',
        normalAppNames: { map: '全息地图', contacts: '全息通讯录', chat: '全息通讯', forum: '全息论坛', news: '全息资讯', album: '全息相册', tools: '全息工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: true,
            hasAR: true,
            通讯范围: '星际网络',
            能源类型: '量子',
        },
        liModeOverrides: {
            appNames: {
                map: '暗星域图',
                contacts: '基因契录',
                chat: '深空密频',
                forum: '星际暗网',
                news: '禁忌数据流',
                album: '记忆库',
            },
            themeColor: '#00FFFF',
        },
    },

    // ========== 远未来 · 赛博格 ==========
    'far-future_cyborg': {
        deviceId: 'neural_interface_cyborg',
        deviceName: '神经植入体',
        deviceForm: 'neural_interface',
        eraId: 'far-future_cyborg',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album', 'tools'],
        uiStyle: 'tech',
        normalAppNames: { map: '神经地图', contacts: '神经通讯录', chat: '神经通讯', forum: '神经论坛', news: '神经资讯', album: '神经相册', tools: '神经工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: true,
            hasAR: true,
            通讯范围: '全球神经网',
            能源类型: '意识',
        },
        liModeOverrides: {
            appNames: {
                map: '暗网节点',
                contacts: '神经契约',
                chat: '潜意识频道',
                forum: '深层意识网',
                news: '潜意识推送',
                album: '记忆碎片库',
                tools: '神经工具',
            },
            themeColor: '#FF00FF',
        },
    },

    // ========== 远未来 · 虚拟现实 ==========
    'far-future_virtual_reality': {
        deviceId: 'hologram_vr',
        deviceName: '虚拟终端',
        deviceForm: 'hologram',
        eraId: 'far-future_virtual_reality',
        apps: ['map', 'contacts', 'chat', 'forum', 'news', 'album'],
        uiStyle: 'holographic',
        normalAppNames: { map: '全息地图', contacts: '全息通讯录', chat: '全息通讯', forum: '全息论坛', news: '全息资讯', album: '全息相册', tools: '全息工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: true,
            hasAR: true,
            通讯范围: '虚拟世界',
            能源类型: '量子',
        },
        liModeOverrides: {
            appNames: {
                map: '隐藏图层',
                contacts: '暗面好友',
                chat: '加密虚拟频道',
                forum: '暗网论坛',
                news: '真实世界推送',
                album: '隐藏相册',
            },
            themeColor: '#00FF88',
        },
    },

    // ========== 后人类 · 意识上传 ==========
    'post-human_energy': {
        deviceId: 'consciousness_energy',
        deviceName: '意识聚合器',
        deviceForm: 'consciousness',
        eraId: 'post-human_energy',
        apps: ['map', 'contacts', 'chat', 'forum', 'news'],
        uiStyle: 'consciousness',
        normalAppNames: { map: '意识地图', contacts: '意识通讯录', chat: '意识通讯', forum: '意识论坛', news: '意识资讯', album: '意识相册', tools: '意识工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: true,
            hasAR: true,
            通讯范围: '意识空间',
            能源类型: '意识',
        },
        liModeOverrides: {
            appNames: {
                map: '意识暗域',
                contacts: '隐藏意识体',
                chat: '潜意识共鸣',
                forum: '深层意识集',
                news: '意识真相',
            },
            themeColor: '#FFFFFF',
        },
    },

    // ========== 后人类 · 维度穿越 ==========
    'post-human_dimension': {
        deviceId: 'consciousness_dimension',
        deviceName: '维度终端',
        deviceForm: 'consciousness',
        eraId: 'post-human_dimension',
        apps: ['map', 'contacts', 'chat', 'forum', 'news'],
        uiStyle: 'consciousness',
        normalAppNames: { map: '意识地图', contacts: '意识通讯录', chat: '意识通讯', forum: '意识论坛', news: '意识资讯', album: '意识相册', tools: '意识工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: true,
            hasAR: true,
            通讯范围: '跨维度',
            能源类型: '意识',
        },
        liModeOverrides: {
            appNames: {
                map: '维度裂隙图',
                contacts: '跨维联络',
                chat: '维度密频',
                forum: '多维论坛',
                news: '维度真相',
            },
            themeColor: '#FFD700',
        },
    },

    // ========== 后人类 · 数学世界 ==========
    'post-human_math': {
        deviceId: 'consciousness_math',
        deviceName: '几何意识体',
        deviceForm: 'consciousness',
        eraId: 'post-human_math',
        apps: ['map', 'contacts', 'chat'],
        uiStyle: 'consciousness',
        normalAppNames: { map: '意识地图', contacts: '意识通讯录', chat: '意识通讯', forum: '意识论坛', news: '意识资讯', album: '意识相册', tools: '意识工具' },
        capabilities: {
            hasGPS: true,
            hasVocalInput: true,
            hasTextInput: true,
            hasProjection: true,
            hasNeuralLink: true,
            hasAR: true,
            通讯范围: '数学空间',
            能源类型: '意识',
        },
        liModeOverrides: {
            appNames: {
                map: '拓扑地图',
                contacts: '同构联络',
                chat: '加密函数',
            },
            themeColor: '#87CEEB',
        },
    },

    // ========== 远古 · 非洲部落 ==========
    'primordial_african': {
        deviceId: 'stone_tablet_african',
        deviceName: '部落图腾柱',
        deviceForm: 'stone_tablet',
        eraId: 'primordial_african',
        apps: ['map', 'contacts', 'chat'],
        uiStyle: 'ancient',
        normalAppNames: { map: '石刻地图', contacts: '石刻名录', chat: '石刻传音', forum: '石刻公告', news: '石刻简报', album: '石刻画集', tools: '石刻工具' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '部落范围',
            能源类型: '体力',
        },
        liModeOverrides: {
            appNames: {
                map: '猎径图',
                contacts: '族人录',
                chat: '巫术鼓语',
            },
            themeColor: '#8B4513',
        },
    },

    // ========== 远古 · 美洲原住民 ==========
    'primordial_americas': {
        deviceId: 'stone_tablet_americas',
        deviceName: '玛雅石刻',
        deviceForm: 'stone_tablet',
        eraId: 'primordial_americas',
        apps: ['map', 'contacts', 'chat'],
        uiStyle: 'ancient',
        normalAppNames: { map: '石刻地图', contacts: '石刻名录', chat: '石刻传音', forum: '石刻公告', news: '石刻简报', album: '石刻画集', tools: '石刻工具' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '城邦间',
            能源类型: '体力',
        },
        liModeOverrides: {
            appNames: {
                map: '圣地图',
                contacts: '祭司录',
                chat: '图腾密语',
            },
            themeColor: '#6B3A2D',
        },
    },

    // ========== 远古 · 北欧萨满 ==========
    'primordial_norse': {
        deviceId: 'stone_tablet_norse',
        deviceName: '卢恩石碑',
        deviceForm: 'stone_tablet',
        eraId: 'primordial_norse',
        apps: ['map', 'contacts', 'chat'],
        uiStyle: 'ancient',
        normalAppNames: { map: '石刻地图', contacts: '石刻名录', chat: '石刻传音', forum: '石刻公告', news: '石刻简报', album: '石刻画集', tools: '石刻工具' },
        capabilities: {
            hasGPS: false,
            hasVocalInput: false,
            hasTextInput: true,
            hasProjection: false,
            hasNeuralLink: false,
            hasAR: false,
            通讯范围: '峡湾间',
            能源类型: '体力',
        },
        liModeOverrides: {
            appNames: {
                map: '航海图',
                contacts: '战盟录',
                chat: '卢恩密文',
            },
            themeColor: '#2D4A6B',
        },
    },
};

/** 获取指定 eraId 的设备配置 */
/** 旧版 era ID 到新版 ID 的映射 */
const LEGACY_ERA_MAP: Record<string, string> = {
    era_ancient_wuxia: 'ancient_eastern_wuxia',
    era_republic_modern: 'modern_eastern_republic',
    era_modern_urban: 'contemporary_urban',
    era_cyberpunk_nearfuture: 'near-future_cyberpunk',
    era_scifi_future: 'far-future_space_opera',
};

export function getDeviceConfig(eraId: string): DeviceConfig | null {
    // 0. 旧版 ID 兼容转换
    const resolvedId = LEGACY_ERA_MAP[eraId] || eraId;

    // 1. 直接查找
    const direct = eraDeviceConfigs[resolvedId];
    if (direct) return direct;

    // 2. 通过时代树推导：查找该 SubEra 的父 Era 节点是否有设备配置
    const resolved = resolveEraNode(resolvedId);
    if (resolved) {
        const parentEraKey = resolved.node.parent;
        if (parentEraKey && eraDeviceConfigs[parentEraKey]) {
            return eraDeviceConfigs[parentEraKey];
        }
    }

    // 3. 无匹配配置
    return null;
}

/** 获取设备模式下显示的应用名称 */
export function getAppName(
    config: DeviceConfig,
    app: MobileApp,
    mode: 'normal' | 'li'
): string {
    if (mode === 'li' && config.liModeOverrides?.appNames?.[app]) {
        return config.liModeOverrides.appNames[app]!;
    }
    if (mode === 'normal' && config.normalAppNames?.[app]) {
        return config.normalAppNames[app]!;
    }
    const defaultNames: Record<MobileApp, string> = {
        map: '地图',
        contacts: '通讯录',
        chat: '群聊',
        forum: '论坛',
        news: '资讯',
        album: '相册',
        tools: '工具',
        schedule: '课程表',
        campus_card: '校园卡',
        club: '社团活动',
        confession: '表白墙',
        rules: '校规编辑器',
        hypnosis: '催眠App',
        bdsn: '深夜板块',
    };
    return defaultNames[app];
}

/** 获取里模式主题色 */
export function getLiModeThemeColor(config: DeviceConfig, fallback: string): string {
    return config.liModeOverrides?.themeColor ?? fallback;
}

/** 默认应用名称映射 */
export const DEFAULT_APP_NAMES: Record<MobileApp, { normal: string; li: string }> = {
    map: { normal: '地图', li: '暗面地图' },
    contacts: { normal: '通讯录', li: '暗面关系' },
    chat: { normal: '群聊', li: '私密聊天' },
    forum: { normal: '论坛', li: '暗面论坛' },
    news: { normal: '资讯', li: '暗面推送' },
    album: { normal: '相册', li: '私密相册' },
    tools: { normal: '工具', li: '暗面工具' },
    schedule: { normal: '课程表', li: '秘密约会' },
    campus_card: { normal: '校园卡', li: '校园钱包' },
    club: { normal: '社团活动', li: '地下社团' },
    confession: { normal: '表白墙', li: '匿名告白' },
    rules: { normal: '学生手册', li: '暗影校规' },
    hypnosis: { normal: '心理辅导', li: '深度催眠' },
    bdsn: { normal: '深夜板块', li: '禁忌论坛' },
};

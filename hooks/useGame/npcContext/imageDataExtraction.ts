import type { OpeningConfig, 记忆配置结构 } from '../../../types';

type 生图基础数据选项 = {
    cultivationSystemEnabled?: boolean;
};

export const 提取NPC生图基础数据 = (npc: any, options?: 生图基础数据选项) => {
    const 启用修炼体系 = options?.cultivationSystemEnabled !== false;
    const 清理空字段 = <T extends Record<string, any>>(obj: T): Partial<T> => {
        return Object.fromEntries(
            Object.entries(obj).filter(([, value]) => {
                if (value === undefined || value === null) return false;
                if (typeof value === 'string' && value.trim().length === 0) return false;
                if (Array.isArray(value) && value.length === 0) return false;
                if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
                return true;
            })
        ) as Partial<T>;
    };

    const 取首个非空文本 = (...values: unknown[]): string => {
        for (const value of values) {
            if (typeof value === 'string' && value.trim().length > 0) return value.trim();
            if (typeof value === 'number' && Number.isFinite(value)) return String(value);
        }
        return '';
    };

    const 读取档案对象 = (source: any): Record<string, unknown> => (
        source?.档案 && typeof source.档案 === 'object' && !Array.isArray(source.档案)
            ? source.档案 as Record<string, unknown>
            : {}
    );

    const 读取首个文本字段 = (source: any, keys: string[]): string => {
        const 档案 = 读取档案对象(source);
        return 取首个非空文本(
            ...keys.map((key) => source?.[key]),
            ...keys.map((key) => (档案 as any)?.[key])
        );
    };

    const 外貌 = 读取首个文本字段(npc, ['外貌描写', '外貌', '外貌要点']);
    const 身材 = 读取首个文本字段(npc, ['身材描写', '身材', '身材要点']);
    const 衣着 = 读取首个文本字段(npc, ['衣着风格', '衣着', '衣着要点']);
    const 核心性格特征 = 读取首个文本字段(npc, ['核心性格特征', '性格', '性格特征']);

    return 清理空字段({
        姓名: typeof npc?.姓名 === 'string' ? npc.姓名.trim() : undefined,
        性别: typeof npc?.性别 === 'string' ? npc.性别.trim() : undefined,
        年龄: typeof npc?.年龄 === 'number' ? npc.年龄 : undefined,
        身份: 读取首个文本字段(npc, ['身份']) || undefined,
        境界: 启用修炼体系 ? (读取首个文本字段(npc, ['境界']) || undefined) : undefined,
        简介: 读取首个文本字段(npc, ['简介']) || undefined,
        核心性格特征: 核心性格特征 || undefined,
        性格: 核心性格特征 || undefined,
        关系状态: 读取首个文本字段(npc, ['关系状态']) || undefined,
        外貌: 外貌 || undefined,
        身材: 身材 || undefined,
        衣着: 衣着 || undefined
    });
};

export const 提取主角生图基础数据 = (character: any, options?: 生图基础数据选项) => {
    const 启用修炼体系 = options?.cultivationSystemEnabled !== false;
    const 清理空字段 = <T extends Record<string, any>>(obj: T): Partial<T> => {
        return Object.fromEntries(
            Object.entries(obj).filter(([, value]) => {
                if (value === undefined || value === null) return false;
                if (typeof value === 'string' && value.trim().length === 0) return false;
                if (Array.isArray(value) && value.length === 0) return false;
                if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
                return true;
            })
        ) as Partial<T>;
    };

    const 取文本 = (value: unknown): string => (
        typeof value === 'string' ? value.trim() : ''
    );

    return 清理空字段({
        姓名: 取文本(character?.姓名) || '主角',
        性别: 取文本(character?.性别) || undefined,
        年龄: typeof character?.年龄 === 'number' ? character.年龄 : undefined,
        身份: [取文本(character?.称号), 取文本(character?.出身背景?.名称)].filter(Boolean).join(' / ') || undefined,
        境界: 启用修炼体系 ? (取文本(character?.境界) || undefined) : undefined,
        简介: 取文本(character?.出身背景?.描述) || undefined,
        核心性格特征: 取文本(character?.性格) || undefined,
        性格: 取文本(character?.性格) || undefined,
        外貌: 取文本(character?.外貌) || undefined,
        衣着: (() => {
            const equippedNames = ['头部', '胸部', '盔甲', '内衬', '腿部', '手部', '足部', '背部', '腰部']
                .map((slot) => {
                    const name = typeof character?.装备?.[slot] === 'string' ? character.装备[slot].trim() : '';
                    return !name || name === '无' ? '' : name;
                })
                .filter(Boolean);
            return equippedNames.join('，') || undefined;
        })()
    });
};

export const 提取NPC香闺秘档部位生图数据 = (npc: any, part: '胸部' | '小穴' | '屁穴', options?: 生图基础数据选项) => {
    const 基础 = 提取NPC生图基础数据(npc, options);
    const 读取文本 = (obj: any, key: string): string | undefined => (
        typeof obj?.[key] === 'string' && obj[key].trim().length > 0 ? obj[key].trim() : undefined
    );
    const 描述字段 = part === '胸部' ? '胸部描述' : part === '小穴' ? '小穴描述' : '屁穴描述';

    return {
        ...基础,
        胸部描述: part === '胸部' ? 读取文本(npc, '胸部描述') : undefined,
        小穴描述: part === '小穴' ? 读取文本(npc, '小穴描述') : undefined,
        屁穴描述: part === '屁穴' ? 读取文本(npc, '屁穴描述') : undefined,
        目标部位: part,
        目标描述字段: 描述字段,
        目标描述文本: 读取文本(npc, 描述字段),
        身材: 读取文本(npc, '身材描写') || 读取文本(npc, '身材'),
        外貌: 读取文本(npc, '外貌描写') || 读取文本(npc, '外貌'),
        衣着: 读取文本(npc, '衣着风格') || 读取文本(npc, '衣着')
    };
};

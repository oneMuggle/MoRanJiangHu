/**
 * 时段标签计算工具
 *
 * 将游戏时间 `"YYYY:MM:DD:HH:MM"` 转换为人类可读的时段标签。
 * 时段映射规则（基于小时）：
 *   05-07: 清晨, 08-11: 上午, 12-13: 中午, 14-17: 下午,
 *   18-20: 傍晚, 21-00: 深夜, 01-04: 凌晨
 */

/**
 * 将标准时间串转为时段标签。
 * @param canonicalTime `"YYYY:MM:DD:HH:MM"` 格式
 */
export function 时段标签(canonicalTime: string | null | undefined): string {
    if (!canonicalTime || typeof canonicalTime !== 'string') return '未知';
    const parts = canonicalTime.split(':');
    if (parts.length < 4) return '未知';
    const hour = parseInt(parts[3], 10);
    if (isNaN(hour)) return '未知';
    if (hour >= 5 && hour <= 7) return '清晨';
    if (hour >= 8 && hour <= 11) return '上午';
    if (hour >= 12 && hour <= 13) return '中午';
    if (hour >= 14 && hour <= 17) return '下午';
    if (hour >= 18 && hour <= 20) return '傍晚';
    if (hour >= 21 || hour === 0) return '深夜';
    return '凌晨';
}

/**
 * 完整时段显示，如 "下午 14:30"
 */
export function 完整时段显示(canonicalTime: string | null | undefined): string {
    if (!canonicalTime || typeof canonicalTime !== 'string') return '未知';
    const parts = canonicalTime.split(':');
    if (parts.length < 5) return 时段标签(canonicalTime);
    const hour = parseInt(parts[3], 10);
    const minute = parseInt(parts[4], 10);
    if (isNaN(hour) || isNaN(minute)) return 时段标签(canonicalTime);
    const tod = 时段标签(canonicalTime);
    return `${tod} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

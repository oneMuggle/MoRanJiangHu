import type { 游戏设置结构 } from '../../models/system';
import { 剧情推进速度描述映射 } from '../../models/system';

/**
 * 构建行动选项运行时指令
 * 根据当前游戏设置生成剧情推进速度和 NSFW 促进选项的运行时指令
 */
export const 构建行动选项运行时指令 = (gameConfig: 游戏设置结构): string => {
    const parts: string[] = [];

    // 剧情推进速度指令
    const pacingSpeed = gameConfig.剧情推进速度;
    if (pacingSpeed && pacingSpeed !== '正常') {
        const desc = 剧情推进速度描述映射[pacingSpeed] || '';
        parts.push(`【剧情推进速度：${pacingSpeed}】\n当前玩家配置的剧情推进速度为"${pacingSpeed}"。${desc}\n请据此调整行动选项的时间跨度和叙事密度。`);
    }

    // NSFW 促进选项指令
    if (gameConfig.启用NSFW模式 && gameConfig.启用NSFW促进选项) {
        parts.push(`【NSFW促进选项：已开启】\n当场景中存在暧昧或亲密氛围时，行动选项中必须包含至少一个促进亲密关系推进的动作（如轻抚、拉近、耳语等）。若场景为纯战斗/探索/严肃谈判等非暧昧场景，则不强制。`);
    }

    return parts.join('\n\n');
};

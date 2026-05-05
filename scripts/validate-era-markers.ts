/**
 * 时代适配标记验证器
 *
 * 扫描 data/talents/ 和 data/backgrounds/ 下所有预设条目，
 * 标记出既没有 时代适配 也没有 子纪元适配 的条目——
 * 这些条目会在所有时代/子纪元中泄漏可见。
 *
 * 用法：
 *   npx tsx scripts/validate-era-markers.ts
 *
 * 退出码：
 *   0 = 全部已标记
 *   1 = 存在未标记条目（CI 友好）
 */

import type { 天赋结构, 背景结构 } from '../types';

// ── 天赋数据 ────────────────────────────────────────────────────────────────
import { 通用天赋 }             from '../data/talents/common';
import { 武侠天赋 }             from '../data/talents/wuxia';
import { 志怪天赋 }             from '../data/talents/zhiguai';
import { 神话天赋 }             from '../data/talents/myth';
import { 古希腊天赋 }           from '../data/talents/greek';
import { 古罗马天赋 }           from '../data/talents/roman';
import { 中世纪天赋 }           from '../data/talents/medieval';
import { NSFW天赋 }             from '../data/talents/nsfw';
import { 现代天赋 }             from '../data/talents/modern';
import { 未来天赋 }             from '../data/talents/future';

// ── 背景数据 ────────────────────────────────────────────────────────────────
import { NSFW背景 }             from '../data/backgrounds/nsfw';
import { 通用背景 }             from '../data/backgrounds/common';
import { 武侠背景 }             from '../data/backgrounds/wuxia';
import { 志怪背景 }             from '../data/backgrounds/zhiguai';
import { 神话背景 }             from '../data/backgrounds/myth';
import { 古希腊背景 }           from '../data/backgrounds/greek';
import { 古罗马背景 }           from '../data/backgrounds/roman';
import { 中世纪背景 }           from '../data/backgrounds/medieval';
import { 现代背景 }             from '../data/backgrounds/modern';

// ── 类型 ───────────────────────────────────────────────────────────────────
interface UnmarkedEntry {
  类型: '天赋' | '背景';
  名称: string;
  文件: string;
  行号: number;
  现有标记?: string;
}

interface ValidationResult {
  total: { 天赋: number; 背景: number };
  unmarked: UnmarkedEntry[];
  summaryByFile: Record<string, { 天赋: number; 背景: number }>;
}

// ── 数据集定义 ─────────────────────────────────────────────────────────────
type NamedArray<T> = { name: string; data: T[] };

const TALENT_SETS: NamedArray<天赋结构>[] = [
  { name: 'data/talents/common.ts',     data: 通用天赋    },
  { name: 'data/talents/wuxia.ts',     data: 武侠天赋    },
  { name: 'data/talents/zhiguai.ts',   data: 志怪天赋    },
  { name: 'data/talents/myth.ts',      data: 神话天赋    },
  { name: 'data/talents/greek.ts',     data: 古希腊天赋  },
  { name: 'data/talents/roman.ts',     data: 古罗马天赋  },
  { name: 'data/talents/medieval.ts',  data: 中世纪天赋  },
  { name: 'data/talents/nsfw.ts',      data: NSFW天赋    },
  { name: 'data/talents/modern.ts',    data: 现代天赋    },
  { name: 'data/talents/future.ts',    data: 未来天赋    },
];

const BG_SETS: NamedArray<背景结构>[] = [
  { name: 'data/backgrounds/nsfw.ts',     data: NSFW背景    },
  { name: 'data/backgrounds/common.ts',   data: 通用背景    },
  { name: 'data/backgrounds/wuxia.ts',   data: 武侠背景    },
  { name: 'data/backgrounds/zhiguai.ts',  data: 志怪背景    },
  { name: 'data/backgrounds/myth.ts',     data: 神话背景    },
  { name: 'data/backgrounds/greek.ts',    data: 古希腊背景  },
  { name: 'data/backgrounds/roman.ts',    data: 古罗马背景  },
  { name: 'data/backgrounds/medieval.ts', data: 中世纪背景  },
  { name: 'data/backgrounds/modern.ts',   data: 现代背景    },
];

// ── 已知非适配键（用于生成"现有标记"摘要）────────────────────────────────
const KNOWN_CORE_KEYS = ['名称', '描述', '效果', '适用性别', '时代适配', '子纪元适配'];

// ── 验证逻辑 ───────────────────────────────────────────────────────────────
function validatePresets(): ValidationResult {
  const result: ValidationResult = {
    total: { 天赋: 0, 背景: 0 },
    unmarked: [],
    summaryByFile: {},
  };

  // 天赋
  for (const { name, data } of TALENT_SETS) {
    let fileUnmarked = 0;
    for (let i = 0; i < data.length; i++) {
      result.total.天赋++;
      const entry = data[i];
      const hasEra    = entry['时代适配'] !== undefined;
      const hasSubEra = entry['子纪元适配'] !== undefined;

      if (!hasEra && !hasSubEra) {
        const otherMarks = Object.keys(entry as Record<string, unknown>)
          .filter(k => !KNOWN_CORE_KEYS.includes(k))
          .join(', ') || undefined;

        result.unmarked.push({
          类型: '天赋',
          名称: entry.名称,
          文件: name,
          行号: i + 1, // 1-indexed approximate position within the array
          现有标记: otherMarks,
        });
        fileUnmarked++;
      }
    }
    if (fileUnmarked > 0) {
      result.summaryByFile[name] = { 天赋: fileUnmarked, 背景: 0 };
    }
  }

  // 背景
  for (const { name, data } of BG_SETS) {
    let fileUnmarked = 0;
    for (let i = 0; i < data.length; i++) {
      result.total.背景++;
      const entry = data[i];
      const hasEra    = entry['时代适配'] !== undefined;
      const hasSubEra = entry['子纪元适配'] !== undefined;

      if (!hasEra && !hasSubEra) {
        const otherMarks = Object.keys(entry as Record<string, unknown>)
          .filter(k => !KNOWN_CORE_KEYS.includes(k))
          .join(', ') || undefined;

        result.unmarked.push({
          类型: '背景',
          名称: entry.名称,
          文件: name,
          行号: i + 1,
          现有标记: otherMarks,
        });
        fileUnmarked++;
      }
    }
    if (fileUnmarked > 0) {
      result.summaryByFile[name] = { 天赋: 0, 背景: fileUnmarked };
    }
  }

  return result;
}

// ── 彩色输出 helpers ──────────────────────────────────────────────────────
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN  = '\x1b[32m';
const CYAN   = '\x1b[36m';
const DIM    = '\x1b[2m';

function printResult(result: ValidationResult): void {
  const { total, unmarked, summaryByFile } = result;
  const tUnmarked = unmarked.filter(e => e.类型 === '天赋').length;
  const bUnmarked = unmarked.filter(e => e.类型 === '背景').length;

  console.log(`\n${BOLD}========================================${RESET}`);
  console.log(`${BOLD}  预设条目时代适配标记验证报告${RESET}`);
  console.log(`${BOLD}========================================${RESET}\n`);
  console.log(`总计：${total.天赋} 个天赋，${total.背景} 个背景\n`);

  if (unmarked.length === 0) {
    console.log(`${GREEN}✅ 所有预设条目均已标记「时代适配」或「子纪元适配」，无跨时代泄漏风险。${RESET}\n`);
    return;
  }

  console.log(`${YELLOW}⚠️  发现 ${unmarked.length} 个无时代/子纪元标记的条目（会在所有时代中可见）：${RESET}\n`);

  // Group by file
  const byFile: Record<string, UnmarkedEntry[]> = {};
  for (const e of unmarked) {
    if (!byFile[e.文件]) byFile[e.文件] = [];
    byFile[e.文件].push(e);
  }

  for (const [file, entries] of Object.entries(byFile)) {
    const t = entries.filter(e => e.类型 === '天赋').length;
    const b = entries.filter(e => e.类型 === '背景').length;
    const parts: string[] = [];
    if (t > 0) parts.push(`天赋⚠️${t}`);
    if (b > 0) parts.push(`背景⚠️${b}`);
    console.log(`${CYAN}📄 ${file}${RESET}  (${YELLOW}${parts.join(' | ')}${RESET})`);

    for (const entry of entries) {
      const marks = entry.现有标记 ? ` ${DIM}[含: ${entry.现有标记}]${RESET}` : '';
      console.log(`   ${RED}•${RESET} [${entry.类型}] ${entry.名称}${marks}`);
    }
    console.log();
  }

  console.log(`${BOLD}========================================${RESET}`);
  console.log(`${BOLD}  按文件汇总${RESET}`);
  console.log(`${BOLD}========================================${RESET}`);
  console.log(`${'文件'.padEnd(52)} | ${'天赋无标'.padEnd(9)} | ${'背景无标'.padEnd(9)}`);
  console.log(String('─').repeat(74));
  for (const [file, counts] of Object.entries(summaryByFile)) {
    console.log(
      `${file.padEnd(52)} | ${String(counts.天赋).padEnd(9)} | ${String(counts.背景).padEnd(9)}`
    );
  }
  console.log();
  console.log(
    `${BOLD}合计：${RESET}天赋 ${YELLOW}${tUnmarked}${RESET} 个，背景 ${YELLOW}${bUnmarked}${RESET} 个\n` +
    `${DIM}提示：若条目确实应跨时代可见，可明确添加 时代适配: ['古代', '近代', '现代'] 等；\n` +
    `      若仅适用于某个时代，请在条目末尾补充 时代适配 或 子纪元适配 字段。${RESET}\n`
  );
}

// ── 运行 ────────────────────────────────────────────────────────────────────
const result = validatePresets();
printResult(result);

// Exit with error code if unmarked entries found (CI friendly)
if (result.unmarked.length > 0) {
  process.exit(1);
}

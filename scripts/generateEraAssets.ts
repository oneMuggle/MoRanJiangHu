// generateEraAssets.ts -- P3 Asset Generation Pipeline
// 
// Reads all data/era_assets/*/manifest.json
// For each SubEra with status=pending, calls MiniMax API to generate:
//   - 6 scene images (scene_01.jpg ~ scene_06.jpg)
//   - 1 BGM track (bgm.mp3)
//
// MiniMax API:
//   endpoint: https://api.minimax.chat/v1/image_generation
//   model:    image-01
//   size:     1024x1024
//
// Graceful degradation: if MINIMAX_API_KEY is not set, prints prompt
// templates only without blocking.

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Types ──────────────────────────────────────────────────────────────────

interface Manifest {
  id: string;
  status: 'pending' | 'complete' | 'partial';
  images: string[];
  bgm?: string;
}

interface EraNode {
  id: string;
  name: string;
  depth: number;
  parent: string | null;
  bgmTags?: string[];
  artStyle?: string;
  description?: string;
  children?: EraNode[];
}

// MiniMax response — actual shape from image-01 API
interface MiniMaxImageResponse {
  id?: string;
  data?: {
    image_urls?: string[];
    output_url?: string;
  };
  metadata?: {
    success_count?: number;
    failed_count?: number;
  };
  base_resp?: {
    status_code?: number;
    status_msg?: string;
  };
  error?: { message: string; code: string };
}

// ── Constants ──────────────────────────────────────────────────────────────

const ERA_ASSETS_DIR = path.resolve(__dirname, '../data/era_assets');
const ERA_THEME_TS   = path.resolve(__dirname, '../models/eraTheme.ts');
const MANIFEST_NAME  = 'manifest.json';

const MINIMAX_ENDPOINT = 'api.minimax.chat';
const MINIMAX_PATH     = '/v1/image_generation';
const IMAGE_MODEL      = 'image-01';
const IMAGE_SIZE       = '1024x1024';

// Default scene names per SubEra (matched to index.html placeholders)
const DEFAULT_SCENE_NAMES: Record<string, string[]> = {
  'ancient_eastern_zhiguai':       ['深山古刹', '狐妖洞穴', '冥界幽都', '道观炼丹', '花妖花园', '荒村鬼谈'],
  'ancient_eastern_myth':          ['天庭宫殿', '昆仑仙境', '封神战场', '东海龙宫', '瑶池盛会', '妖界裂缝'],
  'ancient_western_greek':         ['奥林匹斯山', '雅典卫城', '斯巴达军营', '奥林匹克赛场', '德尔斐神庙', '爱琴海港口'],
  'ancient_western_roman':         ['罗马斗兽场', '元老院', '罗马浴场', '军团营地', '庞贝古城', '地中海商港'],
  'ancient_western_medieval':      ['哥特式城堡', '骑士比武场', '修道院', '集市广场', '森林猎人小屋', '封建领主庄园'],
  'modern_eastern_meiji_taisho':   ['明治银座', '大正茶室', '西洋建筑群', '神社祭典', '居酒屋', '军校操场'],
  'modern_western_victorian':      ['伦敦塔桥', '工业烟囱', '绅士俱乐部', '维多利亚市场', '乡间庄园', '蒸汽火车'],
  'modern_western_jazz_age':       ['爵士酒吧', 'Art Deco建筑', '地下酒吧', '黑帮俱乐部', '好莱坞片场', '海岸度假村'],
  'modern_western_postwar':        ['废墟城市', '难民营地', '黑市交易', '战后工厂', '盟军指挥部', '铁路站台'],
  'contemporary_rural':            ['稻田农舍', '乡村小学', '集市庙会', '山水梯田', '河边洗衣', '丰收打谷场'],
  'contemporary_post_apocalyptic':['废墟都市', '辐射荒原', '幸存者营地', '变异生物巢穴', '物资掠夺点', '旧世界遗迹'],
  'near-future_dystopia':          ['监控广场', '极权总部', '居民区', '洗脑宣传墙', '地下抵抗组织', '配给中心'],
  'near-future_space_colonization':['月球基地', '火星殖民地', '小行星采矿站', '星际飞船', '零重力实验室', '深空信号站'],
  'far-future_cyborg':             ['义体改造医院', '意识上传中心', '机械躯体工厂', '人机融合社区', '神经接口市场', '记忆银行'],
  'far-future_virtual_reality':    ['虚拟城市', '数字意识海', '代码构成的世界', '虚拟身份交易所', '数据神殿', '意识脱离装置'],
};

// ── MiniMax API ────────────────────────────────────────────────────────────

function getApiKey(): string | undefined {
  return process.env.MINIMAX_API_KEY ?? undefined;
}

async function generateImage(
  prompt: string,
  attempt = 1,
): Promise<{ base64?: string; outputUrl?: string; error?: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { error: 'MINIMAX_API_KEY not configured' };
  }

  const body = JSON.stringify({
    model: IMAGE_MODEL,
    prompt,
    image_size: IMAGE_SIZE,
    n: 1,
  });

  return new Promise((resolve) => {
    const options: https.RequestOptions = {
      hostname: MINIMAX_ENDPOINT,
      path:     MINIMAX_PATH,
      method:   'POST',
      headers:  {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data) as MiniMaxImageResponse;
          if (json.error || json.base_resp?.status_code !== 0) {
            const msg = json.error?.message ?? json.base_resp?.status_msg ?? data.slice(0, 200);
            resolve({ error: `MiniMax error: ${msg}` });
          } else if (json.data?.image_urls && json.data.image_urls.length > 0) {
            resolve({ outputUrl: json.data.image_urls[0] });
          } else if (json.data?.output_url) {
            resolve({ outputUrl: json.data.output_url });
          } else {
            resolve({ error: `Unexpected response: ${data.slice(0, 200)}` });
          }
        } catch (e) {
          resolve({ error: `Parse error: ${String(e)} — raw: ${data.slice(0, 200)}` });
        }
      });
    });

    req.on('error', (e) => {
      if (attempt < 3) {
        setTimeout(() => {
          resolve(generateImage(prompt, attempt + 1));
        }, 2000 * attempt);
      } else {
        resolve({ error: `Network error: ${e.message}` });
      }
    });

    req.write(body);
    req.end();
  });
}

// ── Utilities ─────────────────────────────────────────────────────────────

function saveBase64Image(base64: string, filePath: string): void {
  const buffer = Buffer.from(base64, 'base64');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

function downloadImageFromUrl(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const file = fs.createWriteStream(filePath);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // follow redirect
        downloadImageFromUrl(res.headers.location!, filePath).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (e) => { fs.unlink(filePath, () => {}); reject(e); });
  });
}

function resolveNode(nodes: EraNode[], id: string): EraNode | undefined {
  return nodes.find((n) => n.id === id);
}

function parseEraThemeMetadata(): Map<string, { artStyle: string; bgmTags: string[] }> {
  const content = fs.readFileSync(ERA_THEME_TS, 'utf-8');
  const meta = new Map<string, { artStyle: string; bgmTags: string[] }>();

  // Match makeNode calls for depth=2 (SubEra) nodes
  // eslint-disable-next-line no-useless-escape
  const nodeBlockRegex = /makeNode\s*\(\s*['"`]([\w-]+)['"`],\s*[^,]+,\s*2,[^)]+\)\s*,\s*\{([\s\S]*?)\n\s{20}\}\s*\)/g;

  let match;
  while ((match = nodeBlockRegex.exec(content)) !== null) {
    const id    = match[1];
    const block = match[2];

    const artStyleMatch = block.match(/artStyle:\s*['"`]([^'"`]+)['"`]/);
    const bgmTagsMatch  = block.match(/bgmTags:\s*\[([^\]]+)\]/);

    if (artStyleMatch) {
      const rawBgm = bgmTagsMatch ? bgmTagsMatch[1] : '';
      const tags: string[] = [];
      const tagMatches = rawBgm.matchAll(/['"`]([^'"`]+)['"`]/g);
      for (const t of tagMatches) tags.push(t[1]);
      meta.set(id, { artStyle: artStyleMatch[1], bgmTags: tags });
    }
  }

  return meta;
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== P3: Asset Generation Pipeline ===\n');

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[WARN] MINIMAX_API_KEY not set — printing prompt templates only, skipping API calls.\n');
  }

  const metadata = parseEraThemeMetadata();
  console.log(`[INFO] Loaded metadata for ${metadata.size} SubEra nodes from eraTheme.ts\n`);

  const entries = fs.readdirSync(ERA_ASSETS_DIR, { withFileTypes: true });
  const subDirs  = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  let processed = 0;
  let skipped    = 0;
  let failed     = 0;

  for (const subDir of subDirs.sort()) {
    const manifestPath = path.join(ERA_ASSETS_DIR, subDir, MANIFEST_NAME);
    if (!fs.existsSync(manifestPath)) {
      console.warn(`[SKIP] ${subDir}/ — no manifest.json`);
      skipped++;
      continue;
    }

    let manifest: Manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch (e) {
      console.error(`[ERROR] ${subDir}/manifest.json parse error: ${e}`);
      failed++;
      continue;
    }

    if (manifest.status !== 'pending') {
      console.log(`[SKIP] ${subDir}/ — status=${manifest.status}`);
      skipped++;
      continue;
    }

    const subEraId = manifest.id;
    const eraDir   = path.join(ERA_ASSETS_DIR, subDir);

    const nodeMeta = metadata.get(subEraId);
    if (!nodeMeta) {
      console.error(`[ERROR] ${subEraId} not found in eraTheme.ts — cannot generate.`);
      failed++;
      continue;
    }

    const { artStyle, bgmTags } = nodeMeta;
    const sceneNames = DEFAULT_SCENE_NAMES[subEraId] ??
      Array.from({ length: 6 }, (_, i) => `场景${String(i + 1).padStart(2, '0')}`);

    console.log(`[PROCESSING] ${subEraId}`);
    console.log(`  artStyle: ${artStyle}`);
    console.log(`  bgmTags:   [${bgmTags.join(', ')}]`);
    console.log(`  scenes:    ${sceneNames.join(', ')}`);

    // ── Generate 6 scene images ─────────────────────────────────────
    const generatedImages: string[] = [];
    let   imageError: string | undefined;

    for (let i = 0; i < 6; i++) {
      const sceneName = sceneNames[i];
      const filename  = `scene_${String(i + 1).padStart(2, '0')}.jpg`;
      const filePath   = path.join(eraDir, filename);
      const prompt     = `${sceneName}场景图，${artStyle}，高质量，细节丰富，氛围感强`;

      if (!apiKey) {
        console.log(`  [DRY] Would generate: ${filename}`);
        console.log(`        prompt: ${prompt}`);
        generatedImages.push(filename);
        continue;
      }

      console.log(`  [API] Generating ${filename}...`);
      const result = await generateImage(prompt);

      if (result.error) {
        console.error(`  [ERROR] ${filename}: ${result.error}`);
        imageError = result.error;
        generatedImages.push('');
      } else if (result.outputUrl) {
        console.log(`  [DOWNLOAD] ${filename} from ${result.outputUrl.slice(0, 80)}...`);
        try {
          await downloadImageFromUrl(result.outputUrl, filePath);
          const size = (fs.statSync(filePath).size / 1024).toFixed(1);
          console.log(`  [OK]   ${filename} saved (${size} KB)`);
          generatedImages.push(filename);
        } catch (e) {
          console.error(`  [ERROR] ${filename} download failed: ${e}`);
          imageError = String(e);
          generatedImages.push('');
        }
      }
    }

    // ── BGM prompt (audio generation not implemented in this pipeline) ──
    const bgmFilename = 'bgm.mp3';
    const bgmPrompt   = `${bgmTags.join(' ')}风格背景音乐，${artStyle}，循环感，氛围感，适合游戏场景`;
    console.log(`  [BGM] prompt: ${bgmPrompt}`);
    console.log(`  [BGM] Note: Audio generation not implemented in this pipeline — use separate BGM service.`);

    // ── Update manifest.json ────────────────────────────────────────────
    const updatedManifest: Manifest = {
      ...manifest,
      status:   imageError ? 'partial' : 'pending',
      images:   generatedImages.filter(Boolean),
      bgm:      bgmFilename,
    };
    fs.writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2), 'utf-8');
    console.log(`  [MANIFEST] Updated ${subDir}/manifest.json (images: ${generatedImages.filter(Boolean).length}/6)`);

    processed++;
  }

  // ── Summary ────────────────────────────────────────────────────────────
  console.log(`\n=== Done ===`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Failed:    ${failed}`);

  if (!apiKey) {
    console.log(`\n[MISSING] MINIMAX_API_KEY — only printed prompt templates, no API calls made.`);
    console.log(`Set the env var to enable generation: export MINIMAX_API_KEY=your_key_here`);
  }
}

main().catch((e) => {
  console.error('[FATAL]', e);
  process.exit(1);
});

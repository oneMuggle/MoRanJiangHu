/**
 * worldToExplorationAdapter.ts
 *
 * 将世界数据（state.世界.地图[] + 建筑[]）和环境数据（state.环境）
 * 转换为探索引擎所需的 MapNode[] + MapPath[]。
 */

import type { 世界数据结构, 地图结构 } from '../../../models/world';
import type { 环境信息结构 } from '../../../models/environment';
import type { MapNode, MapPath, MapNodeType, DangerLevel, FogOfWarState } from '../../../models/exploration/mapNode';

// ============================================================================
// 类型推断工具
// ============================================================================

/** 根据建筑/地图名称推断节点类型 */
function inferNodeType(name: string, isBuilding: boolean): MapNodeType {
  const n = name;

  // 客栈/住宿
  if (/客栈|旅馆|驿|住宿|酒馆|酒楼|饭庄/.test(n)) return 'inn';

  // 市集/商业
  if (/市集|市场|商铺|商店|钱庄|当铺|布庄/.test(n)) return 'market';

  // 门派
  if (/派|门|宗|谷|阁|庄|堡|教|帮|会.*山|宫|书院|殿/.test(n)) return 'sect';

  // 秘境
  if (/秘境|遗迹|遗址|古墓|陵|仙境|神/.test(n)) return 'secret';

  // 山洞
  if (/山洞|洞|窟|穴|岩洞|洞穴/.test(n)) return 'cave';

  // 村庄
  if (/村|庄|屯/.test(n)) return 'village';

  // 城镇
  if (/城|镇|府|都|京|关/.test(n)) return 'town';

  // 默认
  return isBuilding ? 'wilderness' : 'town';
}

/** 根据节点类型推断危险等级 */
function inferDangerLevel(type: MapNodeType): DangerLevel {
  switch (type) {
    case 'secret': return 'high';
    case 'cave': return 'medium';
    case 'sect': return 'medium';
    case 'town': return 'safe';
    case 'inn': return 'safe';
    case 'market': return 'safe';
    case 'village': return 'low';
    default: return 'low';
  }
}

/** 生成节点 ID */
function makeNodeId(name: string, prefix: string): string {
  return `${prefix}_${name.replace(/\s+/g, '_')}`;
}

// ============================================================================
// 主转换函数
// ============================================================================

export interface WorldToExplorationResult {
  nodes: MapNode[];
  paths: MapPath[];
  startNodeId: string | null;
}

/**
 * 将世界数据 + 环境数据转换为探索地图。
 *
 * 策略：
 * 1. 每张地图 → MapNode（城镇/大地点类型）
 * 2. 每个建筑 → MapNode（根据名称推断类型）
 * 3. 建筑与归属地图之间建立连接
 * 4. 同大/中地点的地图互相连接
 * 5. 环境.具体地点匹配节点作为起点
 * 6. 无世界数据时用环境 4 级地点生成保底链
 */
export function worldToExploration(
  world: 世界数据结构 | null | undefined,
  env: 环境信息结构 | null | undefined,
): WorldToExplorationResult {
  const hasWorld = world && (world.地图.length > 0 || world.建筑.length > 0);

  if (hasWorld) {
    return fromWorldData(world!, env);
  }

  return fromEnvironment(env);
}

// ============================================================================
// 基于世界数据的转换
// ============================================================================

function fromWorldData(
  world: 世界数据结构,
  env: 环境信息结构 | null | undefined,
): WorldToExplorationResult {
  const nodes: MapNode[] = [];
  const paths: MapPath[] = [];

  const mapNameToNodeId = new Map<string, string>();

  // 1. 地图 → MapNode
  for (const map of world.地图) {
    const id = makeNodeId(map.名称, 'map');
    const type = inferNodeType(map.名称, false);
    const dangerLevel = inferDangerLevel(type);

    nodes.push({
      id,
      type,
      name: map.名称,
      description: map.描述 || '',
      dangerLevel,
      fowState: 'hidden' as FogOfWarState,
      eventTriggered: false,
    });

    mapNameToNodeId.set(map.名称, id);
  }

  // 2. 建筑 → MapNode
  for (const building of world.建筑) {
    const id = makeNodeId(building.名称, 'bld');
    const type = inferNodeType(building.名称, true);
    const dangerLevel = inferDangerLevel(type);

    nodes.push({
      id,
      type,
      name: building.名称,
      description: building.描述 || '',
      dangerLevel,
      fowState: 'hidden' as FogOfWarState,
      eventTriggered: false,
    });

    // 建筑与归属地图之间的连接
    const parentMapName = findParentMapName(building.归属, world.地图);
    if (parentMapName) {
      const parentMapId = mapNameToNodeId.get(parentMapName);
      if (parentMapId) {
        paths.push({
          from: parentMapId,
          to: id,
          actionCost: 1,
          description: `前往${building.名称}`,
        });
        paths.push({
          from: id,
          to: parentMapId,
          actionCost: 1,
          description: `返回${parentMapName}`,
        });
      }
    }
  }

  // 3. 地图之间的连接（共享相同大地点/中地点）
  for (let i = 0; i < world.地图.length; i++) {
    for (let j = i + 1; j < world.地图.length; j++) {
      const a = world.地图[i];
      const b = world.地图[j];
      if (mapsAreConnected(a, b)) {
        const idA = mapNameToNodeId.get(a.名称)!;
        const idB = mapNameToNodeId.get(b.名称)!;
        if (idA && idB) {
          paths.push({
            from: idA,
            to: idB,
            actionCost: 3,
            description: `${a.名称} ↔ ${b.名称}`,
          });
          paths.push({
            from: idB,
            to: idA,
            actionCost: 3,
            description: `${b.名称} ↔ ${a.名称}`,
          });
        }
      }
    }
  }

  // 4. 地图的内部建筑之间互相连接
  for (const map of world.地图) {
    const buildingIds = (map.内部建筑 || [])
      .map((bName) => {
        const building = world.建筑.find((b) => b.名称 === bName);
        return building ? makeNodeId(building.名称, 'bld') : makeNodeId(bName, 'bld');
      })
      .filter((id) => nodes.some((n) => n.id === id));

    for (let i = 0; i < buildingIds.length; i++) {
      for (let j = i + 1; j < buildingIds.length; j++) {
        paths.push({
          from: buildingIds[i],
          to: buildingIds[j],
          actionCost: 1,
        });
        paths.push({
          from: buildingIds[j],
          to: buildingIds[i],
          actionCost: 1,
        });
      }
    }
  }

  // 5. 确定起始节点 — 若环境具体地点未匹配到，取第一个地图节点作为默认起点
  let startNodeId = findStartNodeId(env, nodes, world.地图);
  if (!startNodeId && nodes.length > 0) {
    const fallback = nodes.find(n => n.type === 'town' || n.type === 'village' || n.type === 'inn' || n.type === 'market');
    startNodeId = fallback?.id ?? nodes[0].id;
  }

  // 6. 将起始节点及其相邻节点的 fowState 设为可见
  if (startNodeId) {
    for (const node of nodes) {
      if (node.id === startNodeId) {
        node.fowState = 'explored';
      } else if (paths.some(p => (p.from === startNodeId && p.to === node.id) || (p.to === startNodeId && p.from === node.id))) {
        node.fowState = 'revealed';
      }
    }
  }

  return { nodes, paths, startNodeId };
}

/** 查找建筑归属的地图名称 */
function findParentMapName(
  buildingOwnership: { 大地点: string; 中地点: string; 小地点: string },
  maps: 地图结构[],
): string | null {
  // 优先匹配小地点
  for (const map of maps) {
    if (map.归属.小地点 && map.归属.小地点 === buildingOwnership.小地点) return map.名称;
  }
  // 其次匹配中地点
  for (const map of maps) {
    if (map.归属.中地点 && map.归属.中地点 === buildingOwnership.中地点) return map.名称;
  }
  // 最后匹配大地点
  for (const map of maps) {
    if (map.归属.大地点 && map.归属.大地点 === buildingOwnership.大地点) return map.名称;
  }
  return null;
}

/** 判断两张地图是否应该连接 */
function mapsAreConnected(a: 地图结构, b: 地图结构): boolean {
  if (a.归属.大地点 && a.归属.大地点 === b.归属.大地点) return true;
  if (a.归属.中地点 && a.归属.中地点 === b.归属.中地点) return true;
  return false;
}

/** 从环境数据匹配起始节点 */
function findStartNodeId(
  env: 环境信息结构 | null | undefined,
  nodes: MapNode[],
  maps: 地图结构[],
): string | null {
  if (!env) return null;

  // 1. 精确匹配 具体地点 → 地图名称
  if (env.具体地点) {
    const mapMatch = maps.find((m) => m.名称 === env.具体地点);
    if (mapMatch) {
      const id = makeNodeId(mapMatch.名称, 'map');
      if (nodes.some((n) => n.id === id)) return id;
    }

    // 2. 精确匹配 具体地点 → 建筑名称
    const buildingMatch = nodes.find((n) => n.name === env.具体地点);
    if (buildingMatch) return buildingMatch.id;
  }

  // 3. 精确匹配 小地点 → 地图名称
  if (env.小地点) {
    const smallMatch = maps.find((m) => m.名称 === env.小地点);
    if (smallMatch) {
      const id = makeNodeId(smallMatch.名称, 'map');
      if (nodes.some((n) => n.id === id)) return id;
    }
  }

  // 4. 精确匹配 中地点 → 地图名称
  if (env.中地点) {
    const mediumMatch = maps.find((m) => m.名称 === env.中地点);
    if (mediumMatch) {
      const id = makeNodeId(mediumMatch.名称, 'map');
      if (nodes.some((n) => n.id === id)) return id;
    }
  }

  // 5. 模糊匹配：节点名称包含地点名称，或地点名称包含节点名称
  const locationNames = [env.具体地点, env.小地点, env.中地点].filter(Boolean) as string[];
  for (const loc of locationNames) {
    const fuzzyMatch = nodes.find((n) =>
      n.name.includes(loc) || loc.includes(n.name),
    );
    if (fuzzyMatch) return fuzzyMatch.id;
  }

  // 6. 关键词匹配：从 具体地点 提取关键词（如"酒店房间"→"酒店"、"房间"）
  if (env.具体地点) {
    const keywords = extractKeywords(env.具体地点);
    for (const keyword of keywords) {
      const keywordMatch = nodes.find((n) => n.name.includes(keyword));
      if (keywordMatch) return keywordMatch.id;
    }
  }

  return null;
}

/** 从地点名称中提取关键词 */
function extractKeywords(name: string): string[] {
  const commonKeywords = [
    '酒店', '客栈', '旅馆', '驿站', '驿',
    '酒馆', '酒楼', '饭庄', '茶楼',
    '市集', '市场', '商铺', '商店', '钱庄', '当铺',
    '城', '镇', '村', '庄',
    '派', '门', '宗', '谷', '阁', '书院', '殿', '宫',
    '山洞', '洞穴', '秘境', '遗迹',
    '房间', '卧室', '大堂', '厢房',
  ];
  return commonKeywords.filter((kw) => name.includes(kw));
}

// ============================================================================
// 基于环境数据的保底转换（无世界数据时）
// ============================================================================

function fromEnvironment(
  env: 环境信息结构 | null | undefined,
): WorldToExplorationResult {
  const nodes: MapNode[] = [];
  const paths: MapPath[] = [];

  // 四级地点链：大地点 → 中地点 → 小地点 → 具体地点
  const locations: Array<{ name: string; type: MapNodeType; cost: number }> = [];

  if (env?.大地点) {
    locations.push({ name: env.大地点, type: 'town', cost: 3 });
  }
  if (env?.中地点) {
    locations.push({ name: env.中地点, type: 'village', cost: 2 });
  }
  if (env?.小地点) {
    locations.push({ name: env.小地点, type: 'wilderness', cost: 2 });
  }
  if (env?.具体地点) {
    locations.push({ name: env.具体地点, type: inferNodeType(env.具体地点, false), cost: 1 });
  }

  if (locations.length === 0) {
    return { nodes: [], paths: [], startNodeId: null };
  }

  // 生成节点和路径（线性链）
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const id = makeNodeId(loc.name, 'env');

    nodes.push({
      id,
      type: loc.type,
      name: loc.name,
      description: `地点：${loc.name}`,
      dangerLevel: inferDangerLevel(loc.type),
      fowState: i === locations.length - 1 ? 'revealed' : 'explored',
      eventTriggered: false,
    });

    if (i > 0) {
      const prevId = makeNodeId(locations[i - 1].name, 'env');
      paths.push({
        from: prevId,
        to: id,
        actionCost: locations[i - 1].cost,
      });
      paths.push({
        from: id,
        to: prevId,
        actionCost: locations[i - 1].cost,
      });
    }
  }

  // 最后一个节点（具体地点）作为起点
  const startNodeId = locations.length > 0
    ? makeNodeId(locations[locations.length - 1].name, 'env')
    : null;

  return { nodes, paths, startNodeId };
}

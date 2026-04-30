import { describe, it, expect } from 'vitest';
import { eraTree, allEraNodes, getEraById, getEraPath, resolveEraNode, 时代主题方案列表, 获取时代主题方案 } from './assembly';
import type { EraNode } from './types';

describe('eraTree', () => {
    it('has a name', () => {
        expect(eraTree.name).toBe('墨色江湖·时代体系');
    });

    it('has child epochs', () => {
        expect(eraTree.children.length).toBeGreaterThan(0);
    });

    it('each epoch has children (eras)', () => {
        for (const epoch of eraTree.children) {
            expect(Array.isArray(epoch.children)).toBe(true);
            expect(epoch.children!.length).toBeGreaterThan(0);
        }
    });
});

describe('allEraNodes', () => {
    it('is a flat array of all nodes', () => {
        expect(allEraNodes.length).toBeGreaterThan(eraTree.children.length);
    });

    it('includes nodes at all depths', () => {
        const depths = new Set(allEraNodes.map((n) => n.depth));
        expect(depths.has(0)).toBe(true);
        expect(depths.has(1)).toBe(true);
        expect(depths.has(2)).toBe(true);
    });

    it('all nodes have unique IDs', () => {
        const ids = allEraNodes.map((n) => n.id);
        const unique = new Set(ids);
        expect(ids.length).toBe(unique.size);
    });

    it('each node has an id, name, and depth', () => {
        for (const node of allEraNodes) {
            expect(typeof node.id).toBe('string');
            expect(typeof node.name).toBe('string');
            expect([0, 1, 2]).toContain(node.depth);
        }
    });
});

describe('getEraById', () => {
    it('finds an existing era by ID', () => {
        const first = allEraNodes[0];
        const result = getEraById(first.id);
        expect(result).toEqual(first);
    });

    it('returns undefined for non-existent ID', () => {
        expect(getEraById('nonexistent_era')).toBeUndefined();
    });

    it('resolves legacy ID mappings', () => {
        const result = getEraById('era_ancient_wuxia');
        expect(result).toBeDefined();
        expect(result!.id).toBe('ancient_eastern_wuxia');
    });

    it('resolves all known legacy IDs', () => {
        const legacyIds = [
            'era_ancient_wuxia',
            'era_republic_modern',
            'era_modern_urban',
            'era_cyberpunk_nearfuture',
            'era_scifi_future',
        ];
        for (const id of legacyIds) {
            const result = getEraById(id);
            expect(result).toBeDefined();
        }
    });
});

describe('getEraPath', () => {
    it('returns path from root to node', () => {
        const depth2Node = allEraNodes.find((n) => n.depth === 2)!;
        const path = getEraPath(depth2Node.id);
        expect(path.length).toBe(3);
        expect(path[0].depth).toBe(0);
        expect(path[1].depth).toBe(1);
        expect(path[2].depth).toBe(2);
        expect(path[2].id).toBe(depth2Node.id);
    });

    it('returns empty array for non-existent ID', () => {
        expect(getEraPath('nonexistent')).toEqual([]);
    });

    it('path for depth-1 node has 2 items', () => {
        const depth1Node = allEraNodes.find((n) => n.depth === 1)!;
        const path = getEraPath(depth1Node.id);
        expect(path.length).toBe(2);
        expect(path[0].depth).toBe(0);
        expect(path[1].depth).toBe(1);
    });
});

describe('resolveEraNode', () => {
    it('returns null for non-existent ID', () => {
        expect(resolveEraNode('nonexistent')).toBeNull();
    });

    it('resolves inherited metadata', () => {
        const depth2Node = allEraNodes.find((n) => n.depth === 2)!;
        const result = resolveEraNode(depth2Node.id);
        expect(result).not.toBeNull();
        expect(result!.node.id).toBe(depth2Node.id);
        expect(result!.inherited).toBeDefined();
        expect(result!.inherited.colors).toBeDefined();
        expect(result!.inherited.typography).toBeDefined();
        expect(result!.inherited.uiStyle).toBeDefined();
    });

    it('includes sources array', () => {
        const depth2Node = allEraNodes.find((n) => n.depth === 2)!;
        const result = resolveEraNode(depth2Node.id);
        expect(Array.isArray(result!.sources)).toBe(true);
    });

    it('node-only fields are accessible', () => {
        const depth2Node = allEraNodes.find((n) => n.depth === 2)!;
        const result = resolveEraNode(depth2Node.id);
        expect(result).toHaveProperty('inherited.openingScenes');
        expect(result).toHaveProperty('inherited.characterArchetypes');
        expect(result).toHaveProperty('inherited.writingSamples');
    });

    it('bgmTags defaults to empty array when not defined anywhere in path', () => {
        const depth2Node = allEraNodes.find((n) => n.depth === 2 && !n.bgmTags);
        if (depth2Node) {
            const result = resolveEraNode(depth2Node.id);
            expect(result!.inherited.bgmTags).toEqual([]);
        }
    });
});

describe('时代主题方案列表', () => {
    it('contains only depth-2 nodes', () => {
        for (const scheme of 时代主题方案列表) {
            const node = allEraNodes.find((n) => n.id === scheme.id);
            expect(node).toBeDefined();
            expect(node!.depth).toBe(2);
        }
    });

    it('each scheme has required fields', () => {
        for (const scheme of 时代主题方案列表) {
            expect(scheme.id).toBeDefined();
            expect(scheme.名称).toBeDefined();
            expect(scheme.描述).toBeDefined();
            expect(scheme.配色).toBeDefined();
            expect(scheme.字体).toBeDefined();
        }
    });

    it('配色 has all required color keys', () => {
        const colorKeys = ['ink-black', 'ink-gray', 'primary', 'primary-dark', 'secondary', 'accent', 'paper-white'];
        for (const scheme of 时代主题方案列表) {
            for (const key of colorKeys) {
                expect(scheme.配色[key as keyof typeof scheme.配色]).toBeDefined();
            }
        }
    });

    it('字体 has all required font keys', () => {
        const fontKeys = ['页面标题', '正文', '等宽'];
        for (const scheme of 时代主题方案列表) {
            for (const key of fontKeys) {
                expect(scheme.字体[key as keyof typeof scheme.字体]).toBeDefined();
            }
        }
    });
});

describe('获取时代主题方案', () => {
    it('finds a scheme by ID', () => {
        if (时代主题方案列表.length > 0) {
            const firstId = 时代主题方案列表[0].id;
            const result = 获取时代主题方案(firstId);
            expect(result).toBeDefined();
            expect(result!.id).toBe(firstId);
        }
    });

    it('returns undefined for non-existent ID', () => {
        expect(获取时代主题方案('nonexistent_era')).toBeUndefined();
    });

    it('returns undefined for depth-1 era (not in 方案列表)', () => {
        const depth1Node = allEraNodes.find((n) => n.depth === 1);
        if (depth1Node) {
            expect(获取时代主题方案(depth1Node.id)).toBeUndefined();
        }
    });
});

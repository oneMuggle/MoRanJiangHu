/**
 * AI 配置助手集成测试脚本
 * 从 stdin 或命令行参数读取测试文本
 * 测试流程：解析 → 模型获取 → 延迟测试 → 错误分类 → 多端点推荐
 *
 * 使用方式:
 *   cat test_input.txt | node --experimental-vm-modules scripts/testAiConfigAssistant.mjs
 *   echo 'api地址：https://api.openai.com/v1 令牌：sk-test' | node scripts/testAiConfigAssistant.mjs
 */

import { parseUserConfig, testAndFetchModels } from '../services/ai/text/configAssistant.js';
import { testNetworkLatency, classifyError, autoAssignModelsWithRedundancy } from '../utils/apiDiagnostics.js';
import * as readline from 'node:readline';

function maskApiKey(key) {
    if (!key || key.length < 10) return '***';
    return key.slice(0, 6) + '...' + key.slice(-4);
}

async function readStdin() {
    const rl = readline.createInterface({ input: process.stdin });
    const lines = [];
    for await (const line of rl) lines.push(line);
    return lines.join('\n');
}

async function main() {
    const userInput = process.argv[2] || (await readStdin());
    if (!userInput.trim()) {
        console.log('用法: cat input.txt | node scripts/testAiConfigAssistant.mjs');
        console.log('   或: node scripts/testAiConfigAssistant.mjs "api地址：xxx 令牌：xxx"');
        process.exit(1);
    }

    console.log('='.repeat(70));
    console.log('AI 配置助手集成测试 — 真实 API 测试');
    console.log('='.repeat(70));

    // Step 1: Parse
    console.log('\n[步骤 1] 解析用户输入...');
    const parsed = await parseUserConfig(userInput, '', '', '');
    console.log(`  解析到 ${parsed.length} 个配置：`);
    parsed.forEach((cfg, i) => {
        console.log(`  ${i + 1}. baseUrl: ${cfg.baseUrl}`);
        console.log(`     apiKey: ${maskApiKey(cfg.apiKey)}`);
    });

    if (parsed.length === 0) {
        console.log('\n  ⚠️ 未解析到任何配置，测试结束。');
        process.exit(0);
    }

    // Step 2: Test each config
    console.log('\n[步骤 2] 测试每个端点...');
    const results = [];

    for (let i = 0; i < parsed.length; i++) {
        const cfg = parsed[i];
        console.log(`\n  --- 配置 ${i + 1}/${parsed.length}: ${cfg.baseUrl} ---`);

        // 2a. Network latency
        console.log('    网络延迟测试...');
        try {
            const latency = await testNetworkLatency(cfg.baseUrl, cfg.apiKey, 8000);
            if (latency.ok) {
                console.log(`    ✅ 延迟: ${latency.latencyMs}ms`);
            } else {
                console.log(`    ❌ 延迟: ${latency.latencyMs}ms, 错误: ${latency.error?.type}`);
                console.log(`       建议: ${latency.error?.suggestion}`);
            }
            results.push({ ...cfg, latency });
        } catch (e) {
            console.log(`    ❌ 异常: ${e.message}`);
            results.push({ ...cfg, latency: { ok: false, latencyMs: 0, error: classifyError(e) } });
        }

        // 2b. Fetch models
        console.log('    模型获取测试...');
        try {
            const modelResult = await testAndFetchModels({ baseUrl: cfg.baseUrl, apiKey: cfg.apiKey });
            console.log(`    ✅ 获取到 ${modelResult.models.length} 个模型`);
            if (modelResult.models.length > 0) {
                console.log(`       前5个: ${modelResult.models.slice(0, 5).join(', ')}`);
            }
            results[i].modelResult = modelResult;
        } catch (e) {
            const errMsg = e instanceof Error ? e.message : String(e);
            console.log(`    ❌ 失败: ${errMsg.slice(0, 150)}`);
            results[i].modelResult = null;
            results[i].modelError = classifyError(e);
            console.log(`       错误类型: ${results[i].modelError.type}`);
            console.log(`       建议: ${results[i].modelError.suggestion}`);
        }
    }

    // Step 3: Summary
    console.log('\n' + '='.repeat(70));
    console.log('[步骤 3] 测试汇总');
    console.log('='.repeat(70));

    const successCount = results.filter(r => r.modelResult?.models?.length > 0).length;
    const failCount = results.length - successCount;
    console.log(`\n  成功: ${successCount} / 失败: ${failCount}`);

    console.log('\n  详细列表:');
    results.forEach((r, i) => {
        const status = r.modelResult?.models?.length > 0 ? '✅' : '❌';
        const modelCount = r.modelResult?.models?.length ?? 0;
        const models = r.modelResult?.models?.slice(0, 3).join(', ') || r.modelError?.type || 'UNKNOWN';
        const latencyStr = r.latency?.ok ? `${r.latency.latencyMs}ms` : `❌${r.latency?.error?.type || 'ERR'}`;
        console.log(`  ${status} ${i + 1}. ${r.baseUrl}`);
        console.log(`     延迟: ${latencyStr} | 模型: ${modelCount} 个 | 详情: ${models}`);
    });

    // Step 4: Redundancy recommendation
    const validResults = results.filter(r => r.modelResult).map(r => r.modelResult);
    if (validResults.length > 0) {
        console.log('\n[步骤 4] 多端点冗余推荐');
        console.log('-'.repeat(70));

        const recommendation = autoAssignModelsWithRedundancy(validResults);

        for (const area of recommendation.areas) {
            if (area.primary) {
                const fallbackStr = area.fallback
                    ? ` → fallback: ${area.fallback.modelId} (${area.fallback.configId})`
                    : '';
                console.log(`  ${area.areaLabel}: ${area.primary.modelId} [${area.primary.tier}]${fallbackStr}`);
            } else {
                console.log(`  ${area.areaLabel}: (无可用模型)`);
            }
        }
    } else {
        console.log('\n  无成功端点，跳过冗余推荐。');
    }
}

main().catch(err => {
    console.error('测试失败:', err);
    process.exit(1);
});

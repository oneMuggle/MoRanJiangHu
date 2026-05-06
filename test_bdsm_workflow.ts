/**
 * BDSM 模块 AI 工作流测试脚本
 * 使用测试 API: https://gcli.ggchan.dev/
 * 验证 5 个核心函数的 AI 调用路径
 */

import { 生成调教任务, 生成日常指令, 评价任务完成, 生成契约条款, 判定关系阶段推进 } from './hooks/useGame/bdsmTaskWorkflow';
import type { 当前可用接口结构 } from './utils/apiConfig';

const TEST_API: 当前可用接口结构 = {
  id: 'test-api',
  名称: '测试API',
  供应商: 'openai_compatible',
  协议覆盖: 'openai',
  baseUrl: 'https://gcli.ggchan.dev/',
  apiKey: 'gg-gcli-RALFsIs47kRn7m3HKh98dTj0R48ccM2ln8sIVDc3OSA',
  model: 'gemini-2.5-flash',
  maxTokens: 4096,
  temperature: 0.7,
};

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function test1_生成调教任务() {
  console.log('\n========== 测试 1: 生成调教任务 ==========');
  try {
    const 结果 = await 生成调教任务({
      契约类型: '口头约定',
      契约状态: '口头约定',
      服从度: 30,
      权力倾向: '支配',
      关系阶段: '试探',
      已解锁场景: [],
      历史任务数量: 2,
      NPC性格特征: '苏婉',
    }, TEST_API);

    if (结果.length === 0) {
      console.log('FAIL: 未返回任何任务');
      return false;
    }

    console.log(`OK: 生成 ${结果.length} 个任务`);
    结果.forEach((t, i) => {
      console.log(`  任务 ${i + 1}: [${t.类型}] ${t.标题} (难度: ${t.难度})`);
    });

    const 无效任务 = 结果.filter(t => !t.类型 || !t.标题 || !t.描述 || !t.难度);
    if (无效任务.length > 0) {
      console.log(`WARN: ${无效任务.length} 个任务缺少必填字段`);
      return false;
    }
    console.log('PASS: 所有字段完整');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function test2_生成日常指令() {
  console.log('\n========== 测试 2: 生成日常指令 ==========');
  try {
    // 直接调用 workflow
    const 结果 = await 生成日常指令({
      服从度: 45,
      契约状态: '口头约定',
      关系阶段: '确立',
      已发布指令数: 0,
      NPC性格特征: '苏婉',
    }, TEST_API);

    if (结果.length === 0) {
      console.log('FAIL: 未返回任何指令（可能是 JSON 提取失败或解析失败）');
      return false;
    }

    console.log(`OK: 生成 ${结果.length} 条指令`);
    结果.forEach((item, i) => {
      console.log(`  指令 ${i + 1}: [${item.分类}] ${item.内容} (持续: ${item.持续时间})`);
    });

    const 无效指令 = 结果.filter(i => !i.内容 || !i.分类 || !i.持续时间);
    if (无效指令.length > 0) {
      console.log(`WARN: ${无效指令.length} 条指令缺少必填字段`);
      return false;
    }
    console.log('PASS: 所有字段完整');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function test3_评价任务完成() {
  console.log('\n========== 测试 3: 评价任务完成 ==========');
  try {
    const 结果 = await 评价任务完成(
      { 类型: '服从测试', 难度: '初级', 描述: '在公共场合保持沉默十分钟' },
      '玩家成功完成了任务，虽然有些犹豫但最终做到了',
      45,
      '苏婉',
      TEST_API
    );

    console.log(`OK: 评价 = ${结果.评价}, 服从度变化 = ${结果.服从度变化}`);
    console.log(`  反馈: ${结果.反馈}`);
    console.log(`  后续影响: ${结果.后续影响}`);

    if (!结果.评价 || 结果.服从度变化 === undefined) {
      console.log('FAIL: 缺少评价或服从度变化');
      return false;
    }
    console.log('PASS: 评价完整');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function test4_生成契约条款() {
  console.log('\n========== 测试 4: 生成契约条款 ==========');
  try {
    const 结果 = await 生成契约条款(
      '书面契约',
      '确立',
      60,
      '支配',
      ['不伤害身体', '不涉及第三人', '保持学业优先'],
      TEST_API
    );

    console.log(`OK: 生成 ${结果.条款.length} 条条款`);
    结果.条款.forEach((c, i) => {
      console.log(`  条款 ${i + 1}: ${c}`);
    });
    console.log(`  安全词: ${结果.安全词}`);
    console.log(`  有效期: ${结果.有效期}`);
    console.log(`  双方义务: ${结果.双方义务}`);

    if (结果.条款.length === 0) {
      console.log('FAIL: 未返回任何条款');
      return false;
    }
    console.log('PASS: 契约完整');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function test5_判定关系阶段推进() {
  console.log('\n========== 测试 5: 判定关系阶段推进 ==========');
  try {
    const 结果 = await 判定关系阶段推进(
      '试探',
      55,
      6,
      2,
      0,
      '口头约定',
      '最近互动良好，双方信任度提升',
      TEST_API
    );

    console.log(`是否推进: ${结果.是否推进}`);
    console.log(`下一阶段: ${结果.下一阶段 || '无'}`);
    console.log(`理由: ${结果.理由}`);
    console.log(`未满足条件: ${(结果.未满足条件 || []).join(', ') || '全部满足'}`);

    console.log('PASS: 阶段判定完成');
    return true;
  } catch (err) {
    console.log('FAIL:', err);
    return false;
  }
}

async function main() {
  console.log('BDSM 模块 AI 工作流测试');
  console.log('API: https://gcli.ggchan.dev/');
  console.log('='.repeat(50));

  const results: Record<string, boolean> = {};

  results['测试1_生成调教任务'] = await test1_生成调教任务();
  await sleep(3000);

  results['测试2_生成日常指令'] = await test2_生成日常指令();
  await sleep(3000);

  results['测试3_评价任务完成'] = await test3_评价任务完成();
  await sleep(3000);

  results['测试4_生成契约条款'] = await test4_生成契约条款();
  await sleep(3000);

  results['测试5_判定关系阶段推进'] = await test5_判定关系阶段推进();

  console.log('\n' + '='.repeat(50));
  console.log('测试结果汇总:');
  let passCount = 0;
  for (const [name, ok] of Object.entries(results)) {
    console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}`);
    if (ok) passCount++;
  }
  console.log(`总计: ${passCount}/${Object.keys(results).length} 通过`);

  if (passCount === Object.keys(results).length) {
    console.log('\n所有测试通过！BDSM 模块 AI 调用路径正常工作。');
  } else {
    console.log(`\n${Object.keys(results).length - passCount} 个测试失败。`);
  }
}

main().catch(err => {
  console.error('测试脚本执行异常:', err);
  process.exit(1);
});

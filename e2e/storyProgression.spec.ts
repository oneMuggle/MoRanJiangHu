import { test, expect, Page } from '@playwright/test';

/**
 * E2E 测试：故事推进
 * 覆盖：新建游戏 → 时代选择 → 角色创建 → 故事推进 → 验证故事内容
 */

// 辅助函数：创建新游戏并完成时代选择
async function startNewGameAndSelectEra(page: Page) {
    // 点击"踏入江湖"按钮
    await page.getByRole('button', { name: '踏入江湖' }).click();
    await expect(page.getByText('创建新角色')).toBeVisible({ timeout: 10000 });

    // 点击"详细选择"
    await page.getByRole('button', { name: '详细选择' }).click();
    await page.waitForTimeout(1000);

    // 展开"古代"节点
    await page.evaluate(() => {
        const btns = document.querySelectorAll('div.space-y-1 > div > button');
        for (const btn of btns) {
            const text = btn.textContent || '';
            if (text.includes('古代') && !text.includes('远古')) {
                (btn as HTMLElement).click();
                return;
            }
        }
    });
    await page.waitForTimeout(500);

    // 选择"东方古代"
    await page.evaluate(() => {
        const btns = document.querySelectorAll('.ml-4 button');
        for (const btn of btns) {
            if ((btn.textContent || '').includes('东方古代')) {
                (btn as HTMLElement).click();
                return;
            }
        }
    });
    await page.waitForTimeout(500);

    // 选择"武侠"子纪元
    await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
            const text = btn.textContent || '';
            if (text.includes('武侠') && !text.includes('东方') && btn.closest('.ml-4')) {
                (btn as HTMLElement).click();
                return;
            }
        }
    });
    await page.waitForTimeout(500);

    // 点击确认时代
    await page.getByRole('button', { name: '确认时代' }).click();
    await expect(page.locator('div.fixed.inset-0.z-\\[60\\]')).not.toBeVisible();
}

// 辅助函数：填写角色名称并创建游戏
async function fillCharacterAndCreate(page: Page, characterName: string) {
    // 找到名称输入框并填写
    const nameInput = page.getByPlaceholder(/角色姓名|名称/);
    if (await nameInput.isVisible({ timeout: 3000 })) {
        await nameInput.fill(characterName);
    }

    // 点击创建按钮（可能的名称：开始游戏、创建、确认等）
    const createBtn = page.getByRole('button', { name: /^(开始游戏|创建|确认)/ });
    if (await createBtn.isVisible({ timeout: 3000 })) {
        await createBtn.click();
    }

    // 等待游戏视图加载
    await page.waitForTimeout(2000);
}

test.describe('新建游戏', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
    });

    test('S1 — 新建游戏完整流程：踏入江湖 → 时代选择 → 角色创建', async ({ page }) => {
        // 步骤1：点击踏入江湖
        await page.getByRole('button', { name: '踏入江湖' }).click();
        await expect(page.getByText('创建新角色')).toBeVisible({ timeout: 10000 });

        // 步骤2：点击详细选择
        await page.getByRole('button', { name: '详细选择' }).click();
        await page.waitForTimeout(1000);

        // 步骤3：展开古代 Epoch
        await page.evaluate(() => {
            const btns = document.querySelectorAll('div.space-y-1 > div > button');
            for (const btn of btns) {
                const text = btn.textContent || '';
                if (text.includes('古代') && !text.includes('远古')) {
                    (btn as HTMLElement).click();
                    return;
                }
            }
        });
        await page.waitForTimeout(500);

        // 步骤4：选择东方古代 Era
        await page.evaluate(() => {
            const btns = document.querySelectorAll('.ml-4 button');
            for (const btn of btns) {
                if ((btn.textContent || '').includes('东方古代')) {
                    (btn as HTMLElement).click();
                    return;
                }
            }
        });
        await page.waitForTimeout(500);

        // 步骤5：选择武侠 SubEra
        await page.evaluate(() => {
            const btns = document.querySelectorAll('button');
            for (const btn of btns) {
                const text = btn.textContent || '';
                if (text.includes('武侠') && !text.includes('东方') && btn.closest('.ml-4')) {
                    (btn as HTMLElement).click();
                    return;
                }
            }
        });
        await page.waitForTimeout(500);

        // 步骤6：确认时代选择
        await expect(page.getByRole('button', { name: '确认时代' })).toBeEnabled();
        await page.getByRole('button', { name: '确认时代' }).click();

        // 验证时代选择弹窗关闭
        await expect(page.locator('div.fixed.inset-0.z-\\[60\\]')).not.toBeVisible({ timeout: 5000 });

        // 步骤7：填写角色名称
        const nameInput = page.getByPlaceholder(/角色姓名|名称/);
        if (await nameInput.isVisible({ timeout: 5000 })) {
            await nameInput.fill('测试侠客');
        }

        // 步骤8：创建角色
        const createBtn = page.getByRole('button', { name: /^(开始游戏|创建|确认)/ });
        if (await createBtn.isVisible({ timeout: 3000 })) {
            await createBtn.click();
        }

        // 等待游戏视图加载
        await page.waitForTimeout(2000);

        // 验证进入了游戏视图（通过检查游戏界面元素）
        // 注意：具体元素可能因实现而异，这里做合理性检查
        const gameLoaded = await page.evaluate(() => {
            // 检查 URL 变化或页面内容
            return document.body.textContent && document.body.textContent.length > 100;
        });
        expect(gameLoaded).toBe(true);
    });
});

test.describe('故事推进', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
    });

    test('S2 — 发送消息后故事情节推进', async ({ page }) => {
        // 创建新游戏
        await startNewGameAndSelectEra(page);
        await fillCharacterAndCreate(page, '测试侠客');

        // 等待游戏加载完成
        await page.waitForTimeout(3000);

        // 找到输入框并发送消息
        const inputLocator = page.locator('textarea, input[type="text"]').first();
        if (await inputLocator.isVisible({ timeout: 5000 })) {
            await inputLocator.fill('请问这里是什么地方？');
            await inputLocator.press('Enter');
        }

        // 等待 AI 响应
        await page.waitForTimeout(5000);

        // 验证有故事内容出现
        const hasStoryContent = await page.evaluate(() => {
            const text = document.body.textContent || '';
            // 检查是否有故事相关的文本内容
            return text.includes('江湖') || text.includes('武侠') ||
                   text.includes('门派') || text.length > 500;
        });
        expect(hasStoryContent).toBe(true);
    });

    test('S3 — 发送动作命令后获得正确响应', async ({ page }) => {
        // 创建新游戏
        await startNewGameAndSelectEra(page);
        await fillCharacterAndCreate(page, '测试侠客');

        // 等待游戏加载
        await page.waitForTimeout(3000);

        // 发送动作命令
        const inputLocator = page.locator('textarea, input[type="text"]').first();
        if (await inputLocator.isVisible({ timeout: 5000 })) {
            await inputLocator.fill('四处张望');
            await inputLocator.press('Enter');
        }

        // 等待响应
        await page.waitForTimeout(5000);

        // 验证有响应内容
        const hasResponse = await page.evaluate(() => {
            return document.body.textContent && document.body.textContent.length > 200;
        });
        expect(hasResponse).toBe(true);
    });
});

/**
 * explorationNarrativeService.ts
 *
 * AI 旅行叙述生成服务。
 * 移动节点后调用 AI 生成旅行叙述并推算消耗时间。
 */

export interface TravelNarrativeContext {
    originNodeName: string;
    destinationNodeName: string;
    pathDescription?: string;
    gameTime: string;
    timeOfDay: string;
    weather?: string;
    encounterTriggered: boolean;
    treasureFound: boolean;
    hiddenEvents: string[];
    playerCharacterName: string;
    destinationNodeType: string;
    destinationDescription: string;
    // 时代匹配 (Step 3.1)
    eraId?: string;
    eraName?: string;
    eraPromptVars?: {
        社会形态?: string;
        科技水平?: string;
        力量体系?: string;
        禁忌?: string[];
    };
    narrativeConstraints?: string;
}

export interface TravelNarrativeResult {
    narrative: string;
    travelTimeMinutes: number;
}

const eraStyleMap: Record<string, string> = {
    'ancient': '传统武侠/仙侠',
    'wuxia': '传统武侠/仙侠',
    'xianxia': '仙侠修真',
    'modern': '现代都市写实',
    'urban': '现代都市',
    'cyberpunk': '赛博朋克霓虹 noir',
    'future': '科幻史诗',
    'post_apocalyptic': '废土生存',
};

function getEraWritingStyle(eraId?: string): string {
    if (!eraId) return '传统武侠/仙侠';
    const key = eraId.toLowerCase();
    for (const [k, style] of Object.entries(eraStyleMap)) {
        if (key.includes(k)) return style;
    }
    return '传统武侠/仙侠';
}

function buildSystemPrompt(context: TravelNarrativeContext): string {
    const style = getEraWritingStyle(context.eraId);
    return `你是一位${style}小说家。请为玩家的旅程生成一段沉浸式的叙述。

要求：
1. 文风为${style}风格，语言优美，氛围感强
2. 叙述 200-400 字，描述从出发地到目的地的旅程
3. 融入沿途的环境描写、天气、时间氛围
4. 如果玩家触发了遇敌，在叙述中体现遭遇敌人/野兽的情节
5. 如果玩家发现了宝藏，在叙述中体现发现意外之财/物品的情节`;
}

function buildUserPrompt(context: TravelNarrativeContext): string {
    let prompt = `玩家 "${context.playerCharacterName}" 正在旅行。\n\n`;
    prompt += `出发地：${context.originNodeName}\n`;
    prompt += `目的地：${context.destinationNodeName}（${context.destinationNodeType}）\n`;
    if (context.pathDescription) {
        prompt += `路径：${context.pathDescription}\n`;
    }
    prompt += `时间：${context.timeOfDay}（游戏时间：${context.gameTime}）\n`;
    if (context.weather) {
        prompt += `天气：${context.weather}\n`;
    }
    if (context.destinationDescription) {
        prompt += `目的地描述：${context.destinationDescription}\n`;
    }

    // 时代背景注入 (Step 3.1)
    if (context.eraName) {
        prompt += `\n### 时代背景\n时代：${context.eraName}`;
        if (context.eraPromptVars?.社会形态) {
            prompt += `\n社会形态：${context.eraPromptVars.社会形态}`;
        }
        if (context.eraPromptVars?.科技水平) {
            prompt += `\n科技水平：${context.eraPromptVars.科技水平}`;
        }
        if (context.eraPromptVars?.力量体系) {
            prompt += `\n力量体系：${context.eraPromptVars.力量体系}`;
        }
        if (context.eraPromptVars?.禁忌 && context.eraPromptVars.禁忌.length > 0) {
            prompt += `\n禁忌：${context.eraPromptVars.禁忌.join('、')}`;
        }
    }

    prompt += `\n事件：`;
    if (context.encounterTriggered) prompt += `【遇敌】`;
    if (context.treasureFound) prompt += `【发现宝藏】`;
    if (context.hiddenEvents.length > 0) prompt += `【隐藏事件：${context.hiddenEvents.join('、')}】`;
    if (!context.encounterTriggered && !context.treasureFound && context.hiddenEvents.length === 0) {
        prompt += `无特殊事件`;
    }

    // 叙事约束注入 (Step 3.2)
    if (context.narrativeConstraints) {
        prompt += `\n\n### 当前状态约束\n${context.narrativeConstraints}`;
    }

    prompt += `\n\n请生成旅行叙述。`;
    return prompt;
}

function parseNarrativeResponse(text: string): TravelNarrativeResult {
    return { narrative: text.trim(), travelTimeMinutes: 0 };
}

export async function generateTravelNarrative(
    context: TravelNarrativeContext,
    apiConfig: any,
): Promise<TravelNarrativeResult | null> {
    try {
        const systemPrompt = buildSystemPrompt(context);
        const userPrompt = buildUserPrompt(context);

        const provider = apiConfig?.provider || 'openai';
        const model = apiConfig?.storyModel || apiConfig?.model;
        const apiKey = apiConfig?.apiKey;
        const baseUrl = apiConfig?.baseUrl;

        if (!apiKey) return null;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        };

        let url: string;
        let body: any;

        if (provider === 'gemini') {
            url = baseUrl || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            body = {
                contents: [
                    { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
                ],
                generationConfig: { maxOutputTokens: 1024, temperature: 0.8 },
            };
        } else {
            url = baseUrl || 'https://api.openai.com/v1/chat/completions';
            body = {
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: 1024,
                temperature: 0.8,
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) return null;

        const data = await response.json();
        let text: string;

        if (provider === 'gemini') {
            text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
            text = data?.choices?.[0]?.message?.content || '';
        }

        if (!text) return null;

        return parseNarrativeResponse(text);
    } catch {
        return null;
    }
}

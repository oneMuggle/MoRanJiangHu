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
}

export interface TravelNarrativeResult {
    narrative: string;
    travelTimeMinutes: number;
}

function buildSystemPrompt(): string {
    return `你是一位武侠小说家。请为玩家的旅程生成一段沉浸式的叙述。

要求：
1. 文风为传统武侠/仙侠风格，语言优美，氛围感强
2. 叙述 200-400 字，描述从出发地到目的地的旅程
3. 融入沿途的环境描写、天气、时间氛围
4. 如果玩家触发了遇敌，在叙述中体现遭遇敌人/野兽的情节
5. 如果玩家发现了宝藏，在叙述中体现发现意外之财/物品的情节
6. 在叙述的最后，必须附加一行 JSON（仅此一行，无其他文字）：
{"travelTimeMinutes": <数字>}

数字表示旅行消耗时间（分钟），根据距离和场景合理推算：
- 同一城镇内移动：5-15 分钟
- 城镇之间步行：30-120 分钟
- 翻山越岭/穿越危险区域：60-240 分钟`;
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
    prompt += `\n事件：`;
    if (context.encounterTriggered) prompt += `【遇敌】`;
    if (context.treasureFound) prompt += `【发现宝藏】`;
    if (context.hiddenEvents.length > 0) prompt += `【隐藏事件：${context.hiddenEvents.join('、')}】`;
    if (!context.encounterTriggered && !context.treasureFound && context.hiddenEvents.length === 0) {
        prompt += `无特殊事件`;
    }
    prompt += `\n\n请生成旅行叙述。`;
    return prompt;
}

function parseNarrativeResponse(text: string): TravelNarrativeResult {
    const jsonMatch = text.match(/\{[\s\S]*"travelTimeMinutes"\s*:\s*\d+[\s\S]*\}/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            const narrative = text.replace(jsonMatch[0], '').trim();
            return {
                narrative: narrative || text,
                travelTimeMinutes: typeof parsed.travelTimeMinutes === 'number' ? parsed.travelTimeMinutes : 30,
            };
        } catch {
            // fall through
        }
    }
    return { narrative: text, travelTimeMinutes: 30 };
}

export async function generateTravelNarrative(
    context: TravelNarrativeContext,
    apiConfig: any,
): Promise<TravelNarrativeResult | null> {
    try {
        const systemPrompt = buildSystemPrompt();
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

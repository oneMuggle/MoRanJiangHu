/**
 * ComfyUI 工作流格式转换器
 * 将 ComfyUI 前端导出的 JSON 格式（nodes/links）转换为 API 提交格式
 */

/**
 * 节点输入名称映射：nodeType -> { slotIndex: inputName }
 * 用于将 link 的 target_slot 转换为 API 格式中的输入名称
 */
const INPUT_NAME_MAP: Record<string, Record<number, string>> = {
    KSampler: { 0: 'model', 1: 'positive', 2: 'negative', 3: 'latent_image' },
    KSamplerAdvanced: { 0: 'model', 1: 'positive', 2: 'negative', 3: 'latent_image' },
    CLIPTextEncode: { 0: 'clip' },
    VAEDecode: { 0: 'samples', 1: 'vae' },
    VAEEncode: { 0: 'pixels', 1: 'vae' },
    VAEDecodeTiled: { 0: 'samples', 1: 'vae' },
    VAEEncodeTiled: { 0: 'pixels', 1: 'vae' },
    SaveImage: { 0: 'images' },
    PreviewImage: { 0: 'images' },
    EmptyLatentImage: { 0: 'width', 1: 'height', 2: 'batch_size' },
    EmptySD3LatentImage: { 0: 'width', 1: 'height', 2: 'batch_size' },
    CheckpointLoaderSimple: {},
    CLIPSetLastLayer: { 0: 'clip' },
    LoraLoaderModelOnly: { 0: 'model' },
    ImageScale: { 0: 'image' },
    ImageScaleBy: { 0: 'image' },
    ImageUpscaleWithModel: { 0: 'image', 1: 'upscale_model' },
    FluxGuidance: { 0: 'conditioning' },
    ModelSamplingSD3: { 0: 'model' },
    ModelSamplingAuraFlow: { 0: 'model' },
    ConditioningZeroOut: { 0: 'conditioning' },
    RandomNoise: {},
    BasicGuider: { 0: 'model', 1: 'conditioning' },
    CFGGuider: { 0: 'model', 1: 'conditioning' },
    BasicScheduler: { 0: 'model' },
    KSamplerSelect: { 0: 'model' },
    SamplerCustomAdvanced: { 0: 'noise', 1: 'guider', 2: 'sampler', 3: 'sigmas', 4: 'latent_image' },
    Reroute: { 0: 'VALUE' },
    UNETLoader: {},
    DualCLIPLoader: {},
    QuadrupleCLIPLoader: {},
    CLIPLoader: {},
    VAELoader: {},
    UpscaleModelLoader: {},
    LoadImage: {},
};

/** Widget 名称映射：nodeType -> { widgetIndex: widgetName } */
const WIDGET_NAME_MAP: Record<string, Record<number, string>> = {
    CheckpointLoaderSimple: { 0: 'ckpt_name' },
    VAELoader: { 0: 'vae_name' },
    UpscaleModelLoader: { 0: 'model_name' },
    UNETLoader: { 0: 'model_name', 1: 'weight_dtype' },
    CLIPLoader: { 0: 'clip_name', 1: 'type', 2: 'device' },
    CLIPVisionLoader: { 0: 'clip_name' },
    DualCLIPLoader: { 0: 'clip_name1', 1: 'clip_name2', 2: 'type', 3: 'device' },
    QuadrupleCLIPLoader: { 0: 'clip_name1', 1: 'clip_name2', 2: 'clip_name3', 3: 'clip_name4' },
    TripleCLIPLoader: { 0: 'clip_name1', 1: 'clip_name2', 2: 'clip_name3' },
    CLIPTextEncode: { 0: 'text' },
    CLIPTextEncodeFlux: { 0: 'clip_l', 1: 't5xxl', 2: 'guidance' },
    KSampler: { 0: 'seed', 1: 'control_after_generate', 2: 'steps', 3: 'cfg', 4: 'sampler_name', 5: 'scheduler', 6: 'denoise' },
    KSamplerAdvanced: { 0: 'add_noise', 1: 'noise_seed', 2: 'control_after_generate', 3: 'steps', 4: 'cfg', 5: 'sampler_name', 6: 'scheduler', 7: 'start_at_step', 8: 'end_at_step', 9: 'return_with_leftover_noise' },
    KSamplerSelect: { 0: 'sampler_name' },
    BasicScheduler: { 0: 'scheduler', 1: 'steps', 2: 'denoise' },
    CFGGuider: { 0: 'cfg' },
    RandomNoise: { 0: 'noise_seed', 1: 'control_after_generate' },
    FluxGuidance: { 0: 'guidance' },
    ModelSamplingSD3: { 0: 'sampling_strength' },
    ModelSamplingAuraFlow: { 0: 'sampling_strength' },
    EmptyLatentImage: { 0: 'width', 1: 'height', 2: 'batch_size' },
    EmptySD3LatentImage: { 0: 'width', 1: 'height', 2: 'batch_size' },
    EmptyImage: { 0: 'width', 1: 'height', 2: 'batch_size', 3: 'color' },
    VAEDecodeTiled: { 0: 'tile_size', 1: 'overlap', 2: 'temporal_size', 3: 'temporal_overlap' },
    VAEEncodeTiled: { 0: 'tile_size', 1: 'overlap', 2: 'temporal_size', 3: 'temporal_overlap' },
    ImageScale: { 0: 'upscale_method', 1: 'width', 2: 'height', 3: 'crop' },
    ImageScaleBy: { 0: 'upscale_method', 1: 'scale_by' },
    SaveImage: { 0: 'filename_prefix' },
    LoadImage: { 0: 'image' },
    CLIPSetLastLayer: { 0: 'stop_at_clip_layer' },
    Note: { 0: 'text' },
    LoraLoaderModelOnly: { 0: 'lora_name', 1: 'strength_model' },
    TeaCache: { 0: 'mode', 1: 'rel_l1_thresh', 2: 'start_step' },
};

export const 转换前端格式为API格式 = (frontendJson: Record<string, unknown>): Record<string, unknown> => {
    const nodes = Array.isArray(frontendJson.nodes) ? frontendJson.nodes : [];
    const links = Array.isArray(frontendJson.links) ? frontendJson.links : [];

    if (nodes.length === 0) {
        throw new Error('未找到有效的节点数据');
    }

    // 构建连接映射: target_node_id -> { slotIndex: [srcNodeId, srcSlot] }
    const connectionMap: Record<number, Record<number, [number, number]>> = {};
    for (const link of links) {
        if (!Array.isArray(link) || link.length < 6) continue;
        const [, srcNodeId, srcSlot, tgtNodeId, tgtSlot] = link;
        if (typeof tgtNodeId !== 'number' || typeof tgtSlot !== 'number') continue;
        if (typeof srcNodeId !== 'number' || typeof srcSlot !== 'number') continue;

        if (!connectionMap[tgtNodeId]) connectionMap[tgtNodeId] = {};
        connectionMap[tgtNodeId][tgtSlot] = [srcNodeId, srcSlot];
    }

    const apiWorkflow: Record<string, unknown> = {};

    for (const node of nodes) {
        const nodeId = String((node as any).id);
        const nodeType = (node as any).type || '';
        const widgetsValues: unknown[] = Array.isArray((node as any).widgets_values) ? (node as any).widgets_values : [];

        const inputNames = INPUT_NAME_MAP[nodeType] || {};
        const widgetNames = WIDGET_NAME_MAP[nodeType] || {};
        const inputs: Record<string, unknown> = {};

        // 处理 widget 值
        for (let i = 0; i < widgetsValues.length; i++) {
            const widgetName = widgetNames[i] || `widget_${i}`;
            const widgetValue = widgetsValues[i];

            // 跳过 ComfyUI 前端特有的复合值（如 [false, true] 表示 toggle 状态）
            if (Array.isArray(widgetValue) && widgetValue.length === 2 && typeof widgetValue[0] === 'boolean') {
                continue;
            }

            inputs[widgetName] = widgetValue;
        }

        // 处理节点连接
        const nodeConnections = connectionMap[(node as any).id] || {};
        for (const [slotStr, [srcNodeId, srcSlot]] of Object.entries(nodeConnections)) {
            const slotIndex = parseInt(slotStr);
            const inputName = inputNames[slotIndex] || `_input_${slotIndex}`;
            inputs[inputName] = [String(srcNodeId), srcSlot];
        }

        apiWorkflow[nodeId] = {
            inputs,
            class_type: nodeType
        };
    }

    return apiWorkflow;
};

export const 是否为前端格式 = (json: Record<string, unknown>): boolean => {
    return Array.isArray(json.nodes) && Array.isArray(json.links);
};

export const 是否为API格式 = (json: Record<string, unknown>): boolean => {
    if (Object.keys(json).length === 0) return false;
    const firstKey = Object.keys(json)[0];
    const firstValue = json[firstKey];
    return typeof firstValue === 'object' && firstValue !== null && 'class_type' in (firstValue as Record<string, unknown>);
};

export const 统一转换为API格式 = (json: Record<string, unknown>): Record<string, unknown> => {
    if (是否为API格式(json)) {
        return json;
    }
    if (是否为前端格式(json)) {
        return 转换前端格式为API格式(json);
    }
    throw new Error('无法识别的 ComfyUI 工作流格式');
};

export const 提取工作流名称 = (filePath: string): string => {
    const fileName = filePath.split('/').pop()?.replace(/\.json$/, '') || '未命名工作流';
    return fileName;
};

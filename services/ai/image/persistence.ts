import type { 图片生成结果 } from './imageTasks';
import * as dbService from '../../dbService';

export const blob转DataUrl = async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
};

export const 推断图片Mime类型 = (fileName: string): string => {
    const lower = (fileName || '').toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.gif')) return 'image/gif';
    return 'image/png';
};

export const uint8数组转DataUrl = (bytes: Uint8Array, mimeType: string): string => {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return `data:${mimeType};base64,${btoa(binary)}`;
};

export const persistImageAssetLocally = async (
    result: 图片生成结果
): Promise<图片生成结果> => {
    const local = (result?.本地路径 || '').trim();
    if (local) {
        return { ...result, 图片URL: undefined, 本地路径: local };
    }

    const imageUrl = (result?.图片URL || '').trim();
    if (!imageUrl) throw new Error('没有可保存的图片地址');

    if (/^data:image\//i.test(imageUrl)) {
        const assetRef = await dbService.保存图片资源(imageUrl);
        return { ...result, 图片URL: undefined, 本地路径: assetRef };
    }
    if (!/^https?:\/\//i.test(imageUrl)) {
        return { ...result, 图片URL: undefined, 本地路径: imageUrl };
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`保存本地副本失败: ${response.status}${detail ? ` - ${detail.slice(0, 200)}` : ''}`);
    }
    const blob = await response.blob();
    const dataUrl = await blob转DataUrl(blob);
    if (!dataUrl) throw new Error('保存本地副本失败：图片内容为空');

    const assetRef = await dbService.保存图片资源(dataUrl);
    return { ...result, 图片URL: undefined, 本地路径: assetRef };
};

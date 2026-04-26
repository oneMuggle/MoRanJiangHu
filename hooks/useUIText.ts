import { useEffect, useState } from 'react';
import { 时代主题UI文案 } from '../models/eraTheme';
import { 获取UI文案, 订阅UI文案变更 } from '../utils/eraUIText';

export const useUIText = (): 时代主题UI文案 => {
    const [文案, set文案] = useState<时代主题UI文案>(获取UI文案);

    useEffect(() => {
        const 取消订阅 = 订阅UI文案变更(set文案);
        return 取消订阅;
    }, []);

    return 文案;
};

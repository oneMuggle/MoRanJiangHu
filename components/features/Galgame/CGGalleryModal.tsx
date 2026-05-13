/**
 * CGGalleryModal.tsx — 桌面端 CG 图鉴弹窗包装器
 *
 * 连接 avgRelationEngine 的 CG 数据到 CGGallery 面板。
 * 当前使用示例数据，待引擎-Zustand 链路打通后替换为真实数据。
 */

import React from 'react';
import { CGGallery } from './CGGallery';
import type { GalgameCG } from '../../../models/avg/galgame';

interface Props {
  onClose: () => void;
}

// 示例数据 — 待引擎集成后从 store 读取
const demoCGs: GalgameCG[] = [
  {
    id: 'cg-demo-1',
    routeId: '初次相遇',
    title: '月下初见',
    description: '在月光下第一次遇见她',
    imageUrl: '',
    unlocked: true,
    unlockedAt: Date.now(),
    unlockCondition: { type: 'intimacy_reached', value: 10, field: '' },
  },
  {
    id: 'cg-demo-2',
    routeId: '初次相遇',
    title: '晨光微曦',
    description: '清晨的阳光洒在她的脸上',
    imageUrl: '',
    unlocked: false,
    unlockCondition: { type: 'intimacy_reached', value: 30, field: '' },
  },
  {
    id: 'cg-demo-3',
    routeId: '羁绊',
    title: '并肩作战',
    description: '两人第一次并肩作战',
    imageUrl: '',
    unlocked: true,
    unlockedAt: Date.now() - 86400000,
    unlockCondition: { type: 'event_triggered', value: 0, field: 'first_battle' },
  },
  {
    id: 'cg-demo-4',
    routeId: '羁绊',
    title: '雪夜温情',
    description: '大雪纷飞的夜晚，相互依偎取暖',
    imageUrl: '',
    unlocked: false,
    unlockCondition: { type: 'intimacy_reached', value: 50, field: '' },
  },
  {
    id: 'cg-demo-5',
    routeId: '终章',
    title: '执手天涯',
    description: '结局CG — 执子之手，与子偕老',
    imageUrl: '',
    unlocked: false,
    unlockCondition: { type: 'ending_reached', value: 0, field: 'good_ending' },
  },
];

export const CGGalleryModal: React.FC<Props> = ({ onClose }) => (
  <CGGallery allCGs={demoCGs} onClose={onClose} />
);

export default CGGalleryModal;

/**
 * MobileCGGalleryModal.tsx — 移动端 CG 图鉴弹窗包装器
 *
 * 复用 CGGallery 面板（已适配响应式布局）。
 */

import React from 'react';
import { CGGallery } from './CGGallery';
import type { GalgameCG } from '../../../models/avg/galgame';

interface Props {
  onClose: () => void;
}

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
    routeId: '羁绊',
    title: '并肩作战',
    description: '两人第一次并肩作战',
    imageUrl: '',
    unlocked: false,
    unlockCondition: { type: 'event_triggered', value: 0, field: 'first_battle' },
  },
  {
    id: 'cg-demo-3',
    routeId: '终章',
    title: '执手天涯',
    description: '结局CG — 执子之手，与子偕老',
    imageUrl: '',
    unlocked: false,
    unlockCondition: { type: 'ending_reached', value: 0, field: 'good_ending' },
  },
];

export const MobileCGGalleryModal: React.FC<Props> = ({ onClose }) => (
  <CGGallery allCGs={demoCGs} onClose={onClose} />
);

export default MobileCGGalleryModal;

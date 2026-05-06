import React from 'react';
import MobileDevice from './MobileDevice';
import type { 当前可用接口结构 } from '../../../utils/apiConfig';

type ApiConfigLike = 当前可用接口结构 | Record<string, unknown>;
import { DeviceState, MobileApp, DeviceGameContext } from '../../../models/mobileDevice';
import type { 校规条目, 校规影响日志, 催眠记录, 催眠App等级 } from '../../../types';
import type { NPC结构 } from '../../../models/domain/social';
import type { BDSM论坛帖子 } from '../../../models/campusNSFW/bdsm-forum';

interface MobileDeviceModalProps {
    eraId: string;
    deviceState: DeviceState;
    onAppClick: (app: MobileApp) => void;
    onReturnHome: () => void;
    onClose: () => void;
    gameContext?: DeviceGameContext;
    onRulesChange?: (updater: (prev: { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => void;
    onHypnosisChange?: (updater: (prev: { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => void;
    onRefresh?: (board?: 'bdsn') => void;
    onSendMessage?: (npcId: string, npcName: string, content: string) => Promise<{ npcReply: string }>;
    onUnlockNPC?: (npc: NPC结构) => void;
    onBDSM帖子更新?: (帖子ID: string, updater: (post: BDSM论坛帖子) => BDSM论坛帖子) => void;
    onBDSM任务操作?: (npcId: string, 操作: '接受' | '报告完成' | '放弃', 任务ID: string, 执行描述?: string) => void;
    onCreateChatSession?: (npcId: string, npcName: string, 关系标签: string, 初始消息: string) => void;
    onConfirmNegotiation?: (npcId: string, npcName: string, 协商结果: { 见面回合偏移: number; 见面地点: string; 安全词: string; 玩家底线: string[] }) => void;
    onBDSM保存安全设置?: (npcId: string, 安全词: string, 底线: string[]) => void;
    apiConfig?: ApiConfigLike;
}

const MobileDeviceModal: React.FC<MobileDeviceModalProps> = ({
    eraId,
    deviceState,
    onAppClick,
    onReturnHome,
    onClose,
    gameContext,
    onRulesChange,
    onHypnosisChange,
    onRefresh,
    onSendMessage,
    onUnlockNPC,
    onBDSM帖子更新,
    onBDSM任务操作,
    onCreateChatSession,
    onConfirmNegotiation,
    onBDSM保存安全设置,
    apiConfig,
}) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg h-[70vh] mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <MobileDevice
                    eraId={eraId}
                    deviceState={deviceState}
                    onAppClick={onAppClick}
                    onReturnHome={onReturnHome}
                    onClose={onClose}
                    gameContext={gameContext}
                    onRulesChange={onRulesChange}
                    onHypnosisChange={onHypnosisChange}
                    onRefresh={onRefresh}
                    onSendMessage={onSendMessage}
                    onUnlockNPC={onUnlockNPC}
                    onBDSM帖子更新={onBDSM帖子更新}
                    onBDSM任务操作={onBDSM任务操作}
                    onCreateChatSession={onCreateChatSession}
                    onConfirmNegotiation={onConfirmNegotiation}
                    onBDSM保存安全设置={onBDSM保存安全设置}
                    apiConfig={apiConfig}
                />
            </div>
        </div>
    );
};

export default MobileDeviceModal;

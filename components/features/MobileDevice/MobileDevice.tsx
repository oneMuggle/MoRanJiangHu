import React from 'react';
import MobileHome from './MobileHome';
import { DeviceState, MobileApp, DeviceGameContext } from '../../../models/mobileDevice';
import type { 校规条目, 校规影响日志, 催眠记录, 催眠App等级 } from '../../../types';

interface MobileDeviceProps {
    eraId: string;
    deviceState: DeviceState;
    onAppClick: (app: MobileApp) => void;
    onReturnHome: () => void;
    onClose: () => void;
    gameContext?: DeviceGameContext;
    onRulesChange?: (updater: (prev: { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] }) => void;
    onHypnosisChange?: (updater: (prev: { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number }) => void;
}

const MobileDevice: React.FC<MobileDeviceProps> = ({
    eraId,
    deviceState,
    onAppClick,
    onReturnHome,
    onClose,
    gameContext,
    onRulesChange,
    onHypnosisChange,
}) => {
    return (
        <div className="w-full h-full bg-gray-900/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-gray-700/50">
            <MobileHome
                eraId={eraId}
                deviceState={deviceState}
                onAppClick={onAppClick}
                onReturnHome={onReturnHome}
                onClose={onClose}
                gameContext={gameContext}
                onRulesChange={onRulesChange}
                onHypnosisChange={onHypnosisChange}
            />
        </div>
    );
};

export default MobileDevice;

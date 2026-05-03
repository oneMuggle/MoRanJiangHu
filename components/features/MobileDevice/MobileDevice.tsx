import React from 'react';
import MobileHome from './MobileHome';
import { DeviceState, MobileApp, DeviceGameContext } from '../../../models/mobileDevice';

interface MobileDeviceProps {
    eraId: string;
    deviceState: DeviceState;
    onAppClick: (app: MobileApp) => void;
    onReturnHome: () => void;
    onClose: () => void;
    gameContext?: DeviceGameContext;
}

const MobileDevice: React.FC<MobileDeviceProps> = ({
    eraId,
    deviceState,
    onAppClick,
    onReturnHome,
    onClose,
    gameContext,
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
            />
        </div>
    );
};

export default MobileDevice;

import React from 'react';
import MobileDevice from './MobileDevice';
import { DeviceState, MobileApp, DeviceGameContext } from '../../../models/mobileDevice';

interface MobileDeviceModalProps {
    eraId: string;
    deviceState: DeviceState;
    onAppClick: (app: MobileApp) => void;
    onReturnHome: () => void;
    onClose: () => void;
    gameContext?: DeviceGameContext;
}

const MobileDeviceModal: React.FC<MobileDeviceModalProps> = ({
    eraId,
    deviceState,
    onAppClick,
    onReturnHome,
    onClose,
    gameContext,
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
                />
            </div>
        </div>
    );
};

export default MobileDeviceModal;

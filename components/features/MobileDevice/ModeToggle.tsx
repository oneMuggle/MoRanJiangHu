import React from 'react';
import { DeviceMode } from '../../../models/mobileDevice';

interface ModeToggleProps {
    mode: DeviceMode;
    onToggle: (mode: DeviceMode) => void;
    liModeEnabled: boolean;
    liModeName?: string;
    themeColor?: string;
}

const ModeToggle: React.FC<ModeToggleProps> = ({
    mode,
    onToggle,
    liModeEnabled,
    liModeName,
    themeColor,
}) => {
    if (!liModeEnabled) return null;

    const isLi = mode === 'li';
    const accentColor = themeColor || '#6B2D8B';

    return (
        <div className="flex items-center gap-2 text-sm">
            <span className={`transition-colors ${!isLi ? 'text-white font-semibold' : 'text-gray-400'}`}>
                正常
            </span>
            <button
                type="button"
                onClick={() => onToggle(isLi ? 'normal' : 'li')}
                className="relative w-11 h-6 rounded-full transition-colors duration-300"
                style={{
                    backgroundColor: isLi ? accentColor : '#4B5563',
                }}
                aria-label="切换正常/里模式"
            >
                <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
                    style={{
                        transform: isLi ? 'translateX(20px)' : 'translateX(0)',
                    }}
                />
            </button>
            <span className={`transition-colors ${isLi ? 'font-semibold' : 'text-gray-400'}`}
                style={isLi ? { color: accentColor } : {}}
            >
                {liModeName || '里模式'}
            </span>
        </div>
    );
};

export default ModeToggle;

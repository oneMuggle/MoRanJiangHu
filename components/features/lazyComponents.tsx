// components/features/lazyComponents.ts
// 可预加载懒组件声明 — 从 App.tsx 提取，减少主文件行数

import React from 'react';

type 可预加载组件<T extends React.ComponentType<any>> = React.LazyExoticComponent<T> & {
    preload?: () => Promise<unknown>;
};

export const 创建可预加载懒组件 = <T extends React.ComponentType<any>>(
    loader: () => Promise<{ default: T }>
): 可预加载组件<T> => {
    const Component = React.lazy(loader) as 可预加载组件<T>;
    Component.preload = loader;
    return Component;
};

export const 懒加载占位: React.FC = () => (
    <div className="fixed inset-0 z-[260] flex items-center justify-center bg-black/45 px-6 py-10 text-center backdrop-blur-[2px]">
        <div className="rounded-2xl border border-wuxia-gold/25 bg-black/78 px-6 py-5 text-xs tracking-[0.22em] text-wuxia-gold/85 shadow-[0_0_36px_rgba(0,0,0,0.52)]">
            卷轴展开中…
        </div>
    </div>
);

export const 懒加载边界: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <React.Suspense fallback={<懒加载占位 />}>{children}</React.Suspense>
);

// Character
export const CharacterModal = 创建可预加载懒组件(() => import('./Character/CharacterModal'));
export const MobileCharacter = 创建可预加载懒组件(() => import('./Character/MobileCharacter'));

// New Game
export const NewGameWizard = 创建可预加载懒组件(() => import('./NewGame/NewGameWizard'));
export const MobileNewGameWizard = 创建可预加载懒组件(() => import('./NewGame/mobile/MobileNewGameWizard'));

// Settings
export const SettingsPanel = 创建可预加载懒组件(() => import('./Settings/SettingsPanel'));

// Inventory
export const InventoryModal = 创建可预加载懒组件(() => import('./Inventory/InventoryModal'));
export const MobileInventoryModal = 创建可预加载懒组件(() => import('./Inventory/MobileInventoryModal'));

// Equipment
export const EquipmentModal = 创建可预加载懒组件(() => import('./Equipment/EquipmentModal'));
export const MobileEquipmentModal = 创建可预加载懒组件(() => import('./Equipment/MobileEquipmentModal'));

// Battle
export const BattleModal = 创建可预加载懒组件(() => import('./Battle/BattleModal'));
export const MobileBattleModal = 创建可预加载懒组件(() => import('./Battle/MobileBattleModal'));

// Social
export const SocialModal = 创建可预加载懒组件(() => import('./Social/SocialModal'));
export const MobileSocial = 创建可预加载懒组件(() => import('./Social/MobileSocial'));
export const ImageManagerModal = 创建可预加载懒组件(() => import('./Social/ImageManagerModal'));
export const MobileImageManagerModal = 创建可预加载懒组件(() => import('./Social/mobile/MobileImageManagerModal'));

// Campus & BDSM
export const CampusDesireDashboard = 创建可预加载懒组件(() => import('./CampusDesireDashboard'));
export const PhotographyDashboard = 创建可预加载懒组件(() => import('./PhotographyDashboard'));
export const MobilePhotographyDashboard = 创建可预加载懒组件(() => import('./MobilePhotographyDashboard'));
export const BDSMRelationshipModal = 创建可预加载懒组件(() => import('./BDSMRelationshipModal'));
export const BDSMContractModal = 创建可预加载懒组件(() => import('./BDSMContractModal'));
export const BDSMSafetyModal = 创建可预加载懒组件(() => import('./BDSMSafetyModal'));
export const MobileCampusDesireApp = 创建可预加载懒组件(() => import('./MobileCampusDesireApp'));

// Urban Driver NSFW
export const UrbanDriverDashboard = 创建可预加载懒组件(() => import('./UrbanDriverDashboard'));
export const MobileUrbanDriverApp = 创建可预加载懒组件(() => import('./MobileUrbanDriverApp'));

// NSFW Center
export const NsfwControlCenter = 创建可预加载懒组件(() => import('./NSFWCenter/NsfwControlCenter'));

// Worldbook
export const WorldbookManagerModal = 创建可预加载懒组件(() => import('./Worldbook/WorldbookManagerModal'));
export const MobileWorldbookManagerModal = 创建可预加载懒组件(() => import('./Worldbook/MobileWorldbookManagerModal'));

// Team
export const TeamModal = 创建可预加载懒组件(() => import('./Team/TeamModal'));
export const MobileTeamModal = 创建可预加载懒组件(() => import('./Team/MobileTeamModal'));

// Kungfu
export const KungfuModal = 创建可预加载懒组件(() => import('./Kungfu/KungfuModal'));
export const MobileKungfuModal = 创建可预加载懒组件(() => import('./Kungfu/MobileKungfuModal'));

// World & Map
export const WorldModal = 创建可预加载懒组件(() => import('./World/WorldModal'));
export const MobileWorldModal = 创建可预加载懒组件(() => import('./World/MobileWorldModal'));
export const MapModal = 创建可预加载懒组件(() => import('./Map/MapModal'));
export const MobileMapModal = 创建可预加载懒组件(() => import('./Map/MobileMapModal'));

// Sect
export const SectModal = 创建可预加载懒组件(() => import('./Sect/SectModal'));
export const MobileSect = 创建可预加载懒组件(() => import('./Sect/MobileSect'));

// Task & Agreement
export const TaskModal = 创建可预加载懒组件(() => import('./Task/TaskModal'));
export const MobileTask = 创建可预加载懒组件(() => import('./Task/MobileTask'));
export const AgreementModal = 创建可预加载懒组件(() => import('./Agreement/AgreementModal'));
export const MobileAgreementModal = 创建可预加载懒组件(() => import('./Agreement/MobileAgreementModal'));

// Story & Planning
export const StoryModal = 创建可预加载懒组件(() => import('./Story/StoryModal'));
export const MobileStory = 创建可预加载懒组件(() => import('./Story/MobileStory'));
export const HeroinePlanModal = 创建可预加载懒组件(() => import('./Story/HeroinePlanModal'));
export const MobileHeroinePlanModal = 创建可预加载懒组件(() => import('./Story/MobileHeroinePlanModal'));

// Memory
export const MemoryModal = 创建可预加载懒组件(() => import('./Memory/MemoryModal'));
export const MobileMemory = 创建可预加载懒组件(() => import('./Memory/MobileMemory'));
export const MemorySummaryFlowModal = 创建可预加载懒组件(() => import('./Memory/MemorySummaryFlowModal'));
export const MemorySummaryFlowMobileModal = 创建可预加载懒组件(() => import('./Memory/MemorySummaryFlowMobileModal'));
export const NpcMemorySummaryFlowModal = 创建可预加载懒组件(() => import('./Memory/NpcMemorySummaryFlowModal'));
export const NpcMemorySummaryFlowMobileModal = 创建可预加载懒组件(() => import('./Memory/NpcMemorySummaryFlowMobileModal'));

// Save/Load
export const SaveLoadModal = 创建可预加载懒组件(() => import('./SaveLoad/SaveLoadModal'));
export const MobileSaveLoadModal = 创建可预加载懒组件(() => import('./SaveLoad/MobileSaveLoadModal'));

// Music
export const MobileMusicPlayer = 创建可预加载懒组件(() => import('./Music/mobile/MobileMusicPlayer'));

// Novel Decomposition & Writing
export const NovelDecompositionWorkbenchModal = 创建可预加载懒组件(() => import('./NovelDecomposition/NovelDecompositionWorkbenchModal'));
export const MobileNovelDecompositionWorkbenchModal = 创建可预加载懒组件(() => import('./NovelDecomposition/MobileNovelDecompositionWorkbenchModal'));
export const NovelWritingWorkbenchModal = 创建可预加载懒组件(() => import('./NovelWriting/NovelWritingWorkbenchModal'));
export const MobileNovelWritingWorkbenchModal = 创建可预加载懒组件(() => import('./NovelWriting/MobileNovelWritingWorkbenchModal'));

// Mobile Device
export const MobileDeviceModal = 创建可预加载懒组件(() => import('./MobileDevice/MobileDeviceModal'));

/**
 * NSFWModals.tsx
 *
 * 提取 App 中的 NSFW 相关弹窗渲染逻辑。
 * 包含：CampusDesire、Photography、UrbanDriver、NsfwControlCenter、
 *       BDSMRelationship、BDSMContract、BDSMSafety。
 */

import * as React from 'react';
import {
    懒加载边界,
    CampusDesireDashboard,
    PhotographyDashboard,
    MobilePhotographyDashboard,
    UrbanDriverDashboard,
    MobileUrbanDriverApp,
    NsfwControlCenter,
    BDSMRelationshipModal,
    BDSMContractModal,
    BDSMSafetyModal,
    MobileCampusDesireApp,
    BoardGameDashboard,
    MobileBoardGameDashboard,
    BoardGameModal,
    MobileBoardGameModal,
} from '../features/lazyComponents';

// ============================================================================
// 类型
// ============================================================================

interface NSFWModalsProps {
    state: Record<string, unknown>;
    setters: Record<string, unknown>;
    actions: Record<string, unknown>;
    isMobile: boolean;
    showCampusDesire: boolean;
    setShowCampusDesire: (v: React.SetStateAction<boolean>) => void;
    showPhotography: boolean;
    setShowPhotography: (v: React.SetStateAction<boolean>) => void;
    showUrbanDriver: boolean;
    setShowUrbanDriver: (v: React.SetStateAction<boolean>) => void;
    showNsfwCenter: boolean;
    setShowNsfwCenter: (v: React.SetStateAction<boolean>) => void;
    showBoardGameDashboard: boolean;
    setShowBoardGameDashboard: (v: React.SetStateAction<boolean>) => void;
    showBoardGameModal: boolean;
    setShowBoardGameModal: (v: React.SetStateAction<boolean>) => void;
    showBDSMRelationship: { npcId: string; npcName: string } | null;
    setShowBDSMRelationship: (v: React.SetStateAction<{ npcId: string; npcName: string } | null>) => void;
    showBDSMContract: { npcId: string; npcName: string } | null;
    setShowBDSMContract: (v: React.SetStateAction<{ npcId: string; npcName: string } | null>) => void;
    showBDSMSafety: { npcId: string; npcName: string } | null;
    setShowBDSMSafety: (v: React.SetStateAction<{ npcId: string; npcName: string } | null>) => void;
}

// ============================================================================
// Component
// ============================================================================

export function NSFWModals({
    state,
    setters,
    actions,
    isMobile,
    showCampusDesire,
    setShowCampusDesire,
    showPhotography,
    setShowPhotography,
    showUrbanDriver,
    setShowUrbanDriver,
    showNsfwCenter,
    setShowNsfwCenter,
    showBoardGameDashboard,
    setShowBoardGameDashboard,
    showBoardGameModal,
    setShowBoardGameModal,
    showBDSMRelationship,
    setShowBDSMRelationship,
    showBDSMContract,
    setShowBDSMContract,
    showBDSMSafety,
    setShowBDSMSafety,
}: NSFWModalsProps) {
    const campusSystem = (state as any).校园系统;
    const 欲望系统 = campusSystem?.欲望系统;

    return (
        <>
            {showCampusDesire && (
                <懒加载边界>
                    {isMobile ? (
                        <MobileCampusDesireApp
                            NPC欲望档案={欲望系统?.NPC欲望档案 ?? {}}
                            后果列表={欲望系统?.后果列表 ?? []}
                            NPC姓名映射={Object.fromEntries(
                                Object.keys(欲望系统?.NPC欲望档案 ?? {}).map(id => {
                                    const npc = (state.社交 as any[]).find((n: any) => n.id === id);
                                    return [id, npc?.姓名 ?? id];
                                })
                            )}
                            onClose={() => setShowCampusDesire(false)}
                        />
                    ) : (
                        <CampusDesireDashboard
                            NPC欲望档案={欲望系统?.NPC欲望档案 ?? {}}
                            后果列表={欲望系统?.后果列表 ?? []}
                            里程碑数={Object.fromEntries(
                                Object.entries(欲望系统?.NPC欲望档案 ?? {}).map(([id]: [string, any]) => {
                                    const milestones = (欲望系统?.里程碑列表 ?? []).filter(
                                        (m: any) => m.NPC姓名 === id || id.includes(m.NPC姓名)
                                    );
                                    return [id, milestones.length];
                                })
                            )}
                            NPC姓名映射={Object.fromEntries(
                                Object.keys(欲望系统?.NPC欲望档案 ?? {}).map(id => {
                                    const npc = (state.社交 as any[]).find((n: any) => n.id === id);
                                    return [id, npc?.姓名 ?? id];
                                })
                            )}
                            onClose={() => setShowCampusDesire(false)}
                            onOpenBDSMRelationship={(npcId: string, npcName: string) => setShowBDSMRelationship({ npcId, npcName })}
                            onOpenBDSMContract={(npcId: string, npcName: string) => setShowBDSMContract({ npcId, npcName })}
                            onOpenBDSMSafety={(npcId: string, npcName: string) => setShowBDSMSafety({ npcId, npcName })}
                            onGenerateTasks={(npcId: string, npcName: string) => {
                                void (actions as any).requestBDSMTaskGeneration(npcId, npcName);
                            }}
                            onGenerateDailyInstructions={(npcId: string, npcName: string) => {
                                void (actions as any).requestBDSMDailyInstructions(npcId, npcName);
                            }}
                            onCheckStageAdvance={(npcId: string, npcName: string) => {
                                void (actions as any).requestBDSMStageAdvance(npcId, npcName);
                            }}
                        />
                    )}
                </懒加载边界>
            )}

            {showPhotography && (
                <懒加载边界>
                    {isMobile ? (
                        <MobilePhotographyDashboard
                            模特档案={(state as any).写真系统?.模特档案 ?? {}}
                            摄影师档案={(state as any).写真系统?.摄影师档案 ?? {}}
                            进行中的拍摄项目={(state as any).写真系统?.进行中的拍摄项目 ?? []}
                            历史拍摄记录={(state as any).写真系统?.历史拍摄记录 ?? []}
                            泄露事件列表={(state as any).写真系统?.泄露事件列表 ?? []}
                            onClose={() => setShowPhotography(false)}
                        />
                    ) : (
                        <PhotographyDashboard
                            模特档案={(state as any).写真系统?.模特档案 ?? {}}
                            摄影师档案={(state as any).写真系统?.摄影师档案 ?? {}}
                            进行中的拍摄项目={(state as any).写真系统?.进行中的拍摄项目 ?? []}
                            历史拍摄记录={(state as any).写真系统?.历史拍摄记录 ?? []}
                            泄露事件列表={(state as any).写真系统?.泄露事件列表 ?? []}
                            onClose={() => setShowPhotography(false)}
                        />
                    )}
                </懒加载边界>
            )}

            {showUrbanDriver && (
                <懒加载边界>
                    {isMobile ? (
                        <MobileUrbanDriverApp
                            都市网约车系统={(state as any).都市网约车系统}
                            onClose={() => setShowUrbanDriver(false)}
                        />
                    ) : (
                        <UrbanDriverDashboard
                            都市网约车系统={(state as any).都市网约车系统}
                            onClose={() => setShowUrbanDriver(false)}
                        />
                    )}
                </懒加载边界>
            )}

            {showNsfwCenter && (
                <懒加载边界>
                    <NsfwControlCenter
                        gameConfig={state.gameConfig as unknown as Record<string, unknown>}
                        onSaveGame={(config) => (actions as any).saveGameSettings(config)}
                        onClose={() => setShowNsfwCenter(false)}
                        onOpenDashboard={(moduleId: string) => {
                            setShowNsfwCenter(false);
                            if (moduleId === 'campusNSFW') setShowCampusDesire(true);
                            else if (moduleId === 'photographyNSFW') setShowPhotography(true);
                            else if (moduleId === 'urbanDriverNSFW') setShowUrbanDriver(true);
                            else if (moduleId === 'boardGameNSFW') setShowBoardGameDashboard(true);
                        }}
                    />
                </懒加载边界>
            )}

            {showBoardGameDashboard && (
                <懒加载边界>
                    {isMobile ? (
                        <MobileBoardGameDashboard
                            桌游状态={欲望系统?.桌游状态 ?? null}
                            onClose={() => setShowBoardGameDashboard(false)}
                            onStartGame={(type) => {
                                setShowBoardGameDashboard(false);
                                setShowBoardGameModal(true);
                            }}
                        />
                    ) : (
                        <BoardGameDashboard
                            桌游状态={欲望系统?.桌游状态 ?? null}
                            onClose={() => setShowBoardGameDashboard(false)}
                            onStartGame={(type) => {
                                setShowBoardGameDashboard(false);
                                setShowBoardGameModal(true);
                            }}
                        />
                    )}
                </懒加载边界>
            )}

            {showBoardGameModal && (
                <懒加载边界>
                    {isMobile ? (
                        <MobileBoardGameModal
                            多人局={欲望系统?.多人局 ?? null}
                            桌游类型={欲望系统?.桌游状态?.桌游类型 ?? null}
                            桌游状态={欲望系统?.桌游状态 ?? null}
                            onClose={() => setShowBoardGameModal(false)}
                        />
                    ) : (
                        <BoardGameModal
                            多人局={欲望系统?.多人局 ?? null}
                            桌游类型={欲望系统?.桌游状态?.桌游类型 ?? null}
                            桌游状态={欲望系统?.桌游状态 ?? null}
                            onClose={() => setShowBoardGameModal(false)}
                        />
                    )}
                </懒加载边界>
            )}

            {!isMobile && showBDSMRelationship && (
                <BDSMRelationshipModal
                    关系状态={欲望系统?.NPC欲望档案?.[showBDSMRelationship.npcId]?.BDSM关系}
                    npcName={showBDSMRelationship.npcName}
                    日常指令={欲望系统?.NPC欲望档案?.[showBDSMRelationship.npcId]?.BDSM关系?.日常指令 ?? []}
                    onClose={() => setShowBDSMRelationship(null)}
                    onAcceptTask={(taskId: string) => {
                        (actions as any).updateBDSMTaskStatus(showBDSMRelationship.npcId, taskId, '进行中');
                    }}
                    onReportComplete={(taskId: string, desc: string) => {
                        void (actions as any).requestBDSMTaskEvaluation(showBDSMRelationship.npcId, taskId, desc || '已完成任务');
                    }}
                    onAbandonTask={(taskId: string) => {
                        (actions as any).updateBDSMTaskStatus(showBDSMRelationship.npcId, taskId, '已放弃');
                    }}
                    onGoToContract={() => {
                        setShowBDSMRelationship(null);
                        setShowBDSMContract(showBDSMRelationship);
                    }}
                    onEditSafety={() => {
                        setShowBDSMRelationship(null);
                        setShowBDSMSafety(showBDSMRelationship);
                    }}
                />
            )}

            {!isMobile && showBDSMContract && (
                <BDSMContractModal
                    关系状态={欲望系统?.NPC欲望档案?.[showBDSMContract.npcId]?.BDSM关系}
                    onClose={() => setShowBDSMContract(null)}
                    onNegotiateContract={() => {
                        void (actions as any).requestBDSMContractGeneration(showBDSMContract.npcId, '书面契约');
                    }}
                    onDissolveContract={() => {
                        const 档案 = 欲望系统?.NPC欲望档案?.[showBDSMContract.npcId];
                        if (档案?.BDSM关系?.契约记录?.length > 0) {
                            const 最后契约 = 档案.BDSM关系.契约记录[档案.BDSM关系.契约记录.length - 1];
                            (actions as any).updateContractStatus(showBDSMContract.npcId, {
                                ...最后契约,
                                状态: '已解除',
                            });
                        }
                        setShowBDSMContract(null);
                    }}
                />
            )}

            {!isMobile && showBDSMSafety && (
                <BDSMSafetyModal
                    关系状态={欲望系统?.NPC欲望档案?.[showBDSMSafety.npcId]?.BDSM关系}
                    npcName={showBDSMSafety.npcName}
                    onClose={() => setShowBDSMSafety(null)}
                    onSave={(安全词: string, 底线: string[]) => {
                        if (showBDSMSafety) {
                            const campusSystem = (state as any).校园系统 || {};
                            const 欲望系统 = campusSystem.欲望系统 || {};
                            const NPC欲望档案 = 欲望系统.NPC欲望档案 || {};
                            const 档案 = NPC欲望档案[showBDSMSafety.npcId];
                            if (档案?.BDSM关系) {
                                NPC欲望档案[showBDSMSafety.npcId] = {
                                    ...档案,
                                    BDSM关系: {
                                        ...档案.BDSM关系,
                                        安全词,
                                        底线列表: 底线,
                                    },
                                };
                                (setters as any).set校园系统?.({
                                    ...campusSystem,
                                    欲望系统: {
                                        ...欲望系统,
                                        NPC欲望档案,
                                    },
                                });
                            }
                        }
                        setShowBDSMSafety(null);
                    }}
                />
            )}
        </>
    );
}

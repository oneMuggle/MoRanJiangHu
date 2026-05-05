import React, { useState, useEffect } from 'react';
import { 小说写作数据集结构 } from '../../../models/novelWriting';
import { novelWritingService } from '../../../services/novelWriting/novelWritingService';

interface Props {
    open: boolean;
    onClose: () => void;
    onNotify?: (toast: { title: string; message: string; tone?: 'info' | 'success' | 'error' }) => void;
}

type TabType = 'projects' | 'outline' | 'characters' | 'chapters' | 'settings';

const MobileNovelWritingWorkbenchModal: React.FC<Props> = ({ open, onClose, onNotify }) => {
    const [activeTab, setActiveTab] = useState<TabType>('projects');
    const [projects, setProjects] = useState<小说写作数据集结构[]>([]);
    const [currentProject, setCurrentProject] = useState<小说写作数据集结构 | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            loadProjects();
        }
    }, [open]);

    const loadProjects = async () => {
        setIsLoading(true);
        try {
            const allProjects = await novelWritingService.getAllProjects();
            setProjects(allProjects);
        } catch (error) {
            console.error('加载项目失败:', error);
            onNotify?.({ title: '错误', message: '加载项目失败', tone: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProject = async () => {
        const title = prompt('请输入小说标题：');
        if (!title) return;

        const author = prompt('请输入作者名称：') || '匿名';

        try {
            const project = await novelWritingService.createProject(title, author);
            await loadProjects();
            setCurrentProject(project);
            setActiveTab('outline');
            onNotify?.({ title: '成功', message: `项目「${title}」已创建`, tone: 'success' });
        } catch (error) {
            console.error('创建项目失败:', error);
            onNotify?.({ title: '错误', message: '创建项目失败', tone: 'error' });
        }
    };

    const handleSelectProject = (project: 小说写作数据集结构) => {
        setCurrentProject(project);
        setActiveTab('outline');
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm('确定要删除这个项目吗？此操作不可撤销。')) return;

        try {
            await novelWritingService.deleteProject(projectId);
            if (currentProject?.id === projectId) {
                setCurrentProject(null);
                setActiveTab('projects');
            }
            await loadProjects();
            onNotify?.({ title: '成功', message: '项目已删除', tone: 'success' });
        } catch (error) {
            console.error('删除项目失败:', error);
            onNotify?.({ title: '错误', message: '删除项目失败', tone: 'error' });
        }
    };

    const renderProjectsTab = () => (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-serif text-wuxia-gold">我的作品</h3>
                <button
                    onClick={handleCreateProject}
                    className="px-3 py-1.5 bg-wuxia-gold/20 border border-wuxia-gold/40 rounded text-wuxia-gold text-xs"
                >
                    新建作品
                </button>
            </div>

            {isLoading ? (
                <div className="text-center text-gray-400 py-8">加载中...</div>
            ) : projects.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    <p>暂无作品</p>
                    <p className="text-xs mt-2">点击「新建作品」开始创作</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            className="p-3 bg-black/30 border border-gray-800 rounded-lg hover:border-wuxia-gold/30 transition-colors"
                            onClick={() => handleSelectProject(project)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-wuxia-gold font-serif text-sm truncate">{project.标题}</h4>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        {project.作者} | {project.章节列表.length}章
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteProject(project.id);
                                    }}
                                    className="text-[10px] text-red-400/60 hover:text-red-400 px-1.5 py-0.5"
                                >
                                    删除
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderOutlineTab = () => {
        if (!currentProject) return null;

        return (
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-serif text-wuxia-gold">大纲设定</h3>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">世界观</label>
                        <textarea
                            className="w-full h-20 bg-black/30 border border-gray-700 rounded p-2 text-gray-200 text-xs"
                            placeholder="描述故事的世界观..."
                            value={currentProject.大纲.世界观}
                            onChange={(e) => {
                                if (!currentProject) return;
                                const updated = {
                                    ...currentProject,
                                    大纲: { ...currentProject.大纲, 世界观: e.target.value }
                                };
                                setCurrentProject(updated);
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">主线剧情</label>
                        <textarea
                            className="w-full h-20 bg-black/30 border border-gray-700 rounded p-2 text-gray-200 text-xs"
                            placeholder="描述故事的主线..."
                            value={currentProject.大纲.主线剧情}
                            onChange={(e) => {
                                if (!currentProject) return;
                                const updated = {
                                    ...currentProject,
                                    大纲: { ...currentProject.大纲, 主线剧情: e.target.value }
                                };
                                setCurrentProject(updated);
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">时代背景</label>
                        <input
                            type="text"
                            className="w-full bg-black/30 border border-gray-700 rounded p-2 text-gray-200 text-xs"
                            placeholder="如：北宋末年..."
                            value={currentProject.大纲.时代背景}
                            onChange={(e) => {
                                if (!currentProject) return;
                                const updated = {
                                    ...currentProject,
                                    大纲: { ...currentProject.大纲, 时代背景: e.target.value }
                                };
                                setCurrentProject(updated);
                            }}
                        />
                    </div>
                </div>

                <button
                    onClick={async () => {
                        if (!currentProject) return;
                        await novelWritingService.updateProject(currentProject);
                        onNotify?.({ title: '成功', message: '大纲已保存', tone: 'success' });
                    }}
                    className="w-full px-3 py-2 bg-wuxia-gold/20 border border-wuxia-gold/40 rounded text-wuxia-gold text-xs"
                >
                    保存大纲
                </button>
            </div>
        );
    };

    const renderCharactersTab = () => {
        if (!currentProject) return null;

        return (
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-serif text-wuxia-gold">角色设定</h3>
                    <button
                        onClick={() => {
                            if (!currentProject) return;
                            const name = prompt('请输入角色名称：');
                            if (!name) return;

                            const newChar = {
                                id: novelWritingService.generateCharacterId(),
                                名称: name,
                                定位: 'supporting' as const,
                                描述: '',
                                性格: '',
                                外貌: '',
                                背景故事: '',
                                人物关系: []
                            };

                            novelWritingService.addCharacter(currentProject.id, newChar).then(() => {
                                const updated = { ...currentProject, 角色列表: [...currentProject.角色列表, newChar] };
                                setCurrentProject(updated);
                                loadProjects();
                            });
                        }}
                        className="px-3 py-1.5 bg-wuxia-gold/20 border border-wuxia-gold/40 rounded text-wuxia-gold text-xs"
                    >
                        新增
                    </button>
                </div>

                {currentProject.角色列表.length === 0 ? (
                    <div className="text-center text-gray-500 py-6 text-xs">
                        <p>暂无角色</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {currentProject.角色列表.map(char => (
                            <div key={char.id} className="p-3 bg-black/30 border border-gray-800 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-wuxia-gold font-serif text-sm">{char.名称}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                        char.定位 === 'protagonist' ? 'bg-wuxia-gold/20 text-wuxia-gold' :
                                        char.定位 === 'antagonist' ? 'bg-red-500/20 text-red-400' :
                                        'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {char.定位 === 'protagonist' ? '主角' : char.定位 === 'antagonist' ? '反派' : '配角'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">{char.描述 || '暂无描述'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderChaptersTab = () => {
        if (!currentProject) return null;

        return (
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-serif text-wuxia-gold">章节管理</h3>
                    <button
                        onClick={() => {
                            if (!currentProject) return;
                            const title = prompt('请输入章节标题：');
                            if (!title) return;

                            const newChapter = {
                                id: novelWritingService.generateChapterId(),
                                序号: currentProject.章节列表.length + 1,
                                标题: title,
                                内容: '',
                                大纲: '',
                                状态: 'outline' as const,
                                字数: 0,
                                createdAt: Date.now(),
                                updatedAt: Date.now()
                            };

                            novelWritingService.addChapter(currentProject.id, newChapter).then(() => {
                                const updated = { ...currentProject, 章节列表: [...currentProject.章节列表, newChapter] };
                                setCurrentProject(updated);
                                loadProjects();
                            });
                        }}
                        className="px-3 py-1.5 bg-wuxia-gold/20 border border-wuxia-gold/40 rounded text-wuxia-gold text-xs"
                    >
                        新增
                    </button>
                </div>

                {currentProject.章节列表.length === 0 ? (
                    <div className="text-center text-gray-500 py-6 text-xs">
                        <p>暂无章节</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {currentProject.章节列表.map(chapter => (
                            <div key={chapter.id} className="p-3 bg-black/30 border border-gray-800 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className="text-wuxia-gold text-xs">第{chapter.序号}章</span>
                                        <span className="text-gray-200 text-xs">{chapter.标题}</span>
                                    </div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                        chapter.状态 === 'final' ? 'bg-green-500/20 text-green-400' :
                                        chapter.状态 === 'revised' ? 'bg-blue-500/20 text-blue-400' :
                                        chapter.状态 === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {chapter.状态 === 'final' ? '定稿' :
                                         chapter.状态 === 'revised' ? '已修订' :
                                         chapter.状态 === 'draft' ? '草稿' : '大纲'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">{chapter.字数}字</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderSettingsTab = () => {
        if (!currentProject) return null;

        return (
            <div className="p-4 space-y-3">
                <h3 className="text-sm font-serif text-wuxia-gold">作品设置</h3>

                <div>
                    <label className="block text-xs text-gray-400 mb-1">作品标题</label>
                    <input
                        type="text"
                        className="w-full bg-black/30 border border-gray-700 rounded p-2 text-gray-200 text-xs"
                        value={currentProject.标题}
                        onChange={(e) => {
                            if (!currentProject) return;
                            setCurrentProject({ ...currentProject, 标题: e.target.value });
                        }}
                    />
                </div>

                <div>
                    <label className="block text-xs text-gray-400 mb-1">作者简介</label>
                    <input
                        type="text"
                        className="w-full bg-black/30 border border-gray-700 rounded p-2 text-gray-200 text-xs"
                        value={currentProject.作者}
                        onChange={(e) => {
                            if (!currentProject) return;
                            setCurrentProject({ ...currentProject, 作者: e.target.value });
                        }}
                    />
                </div>

                <div>
                    <label className="block text-xs text-gray-400 mb-1">简介</label>
                    <textarea
                        className="w-full h-20 bg-black/30 border border-gray-700 rounded p-2 text-gray-200 text-xs"
                        value={currentProject.简介}
                        onChange={(e) => {
                            if (!currentProject) return;
                            setCurrentProject({ ...currentProject, 简介: e.target.value });
                        }}
                    />
                </div>

                <button
                    onClick={async () => {
                        if (!currentProject) return;
                        await novelWritingService.updateProject(currentProject);
                        onNotify?.({ title: '成功', message: '设置已保存', tone: 'success' });
                    }}
                    className="w-full px-3 py-2 bg-wuxia-gold/20 border border-wuxia-gold/40 rounded text-wuxia-gold text-xs"
                >
                    保存设置
                </button>
            </div>
        );
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[320] bg-black/95 animate-fadeIn">
            <div className="h-full flex flex-col">
                <div className="shrink-0 flex items-center justify-between gap-2 border-b border-wuxia-gold/10 bg-black/40 px-4 py-3">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-serif font-bold text-wuxia-gold tracking-[0.1em] truncate">小说写作助手</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-full border border-gray-700 bg-black/50 px-2.5 py-1.5 text-[10px] text-gray-300"
                    >
                        关闭
                    </button>
                </div>

                {currentProject && (
                    <div className="shrink-0 flex border-b border-gray-800 bg-black/20 overflow-x-auto">
                        {(['projects', 'outline', 'characters', 'chapters', 'settings'] as TabType[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-2 text-xs whitespace-nowrap ${
                                    activeTab === tab
                                        ? 'text-wuxia-gold border-b-2 border-wuxia-gold'
                                        : 'text-gray-400'
                                }`}
                            >
                                {tab === 'projects' ? '作品' :
                                 tab === 'outline' ? '大纲' :
                                 tab === 'characters' ? '角色' :
                                 tab === 'chapters' ? '章节' : '设置'}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex-1 min-h-0 overflow-y-auto">
                    {activeTab === 'projects' && renderProjectsTab()}
                    {activeTab === 'outline' && renderOutlineTab()}
                    {activeTab === 'characters' && renderCharactersTab()}
                    {activeTab === 'chapters' && renderChaptersTab()}
                    {activeTab === 'settings' && renderSettingsTab()}
                </div>
            </div>
        </div>
    );
};

export default MobileNovelWritingWorkbenchModal;

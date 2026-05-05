import type {
    小说写作数据集结构,
    小说写作任务结构,
    小说写作章节结构,
    小说写作大纲结构,
    小说写作角色结构
} from '../../models/novelWriting';

const DB_NAME = 'WuxiaGameDB';
const STORE_NAME = 'novel_writing_projects';

export interface NovelWritingDBRecord {
    id: string;
    data: 小说写作数据集结构;
    task: 小说写作任务结构 | null;
    updatedAt: number;
}

class NovelWritingService {
    private db: IDBDatabase | null = null;

    private async getDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('novel_writing_tasks')) {
                    db.createObjectStore('novel_writing_tasks', { keyPath: 'id' });
                }
            };
        });
    }

    async createProject(title: string, author: string): Promise<小说写作数据集结构> {
        const db = await this.getDB();
        const now = Date.now();

        const project: 小说写作数据集结构 = {
            id: `nw_${now}_${Math.random().toString(36).slice(2, 9)}`,
            标题: title,
            作者: author,
            简介: '',
            schemaVersion: 1,
            大纲: {
                世界观: '',
                主线剧情: '',
                支线剧情: [],
                预计章节数: 0,
                时代背景: '',
                核心冲突: ''
            },
            角色列表: [],
            章节列表: [],
            文风配置: {
                时代: 'ancient_eastern_wuxia',
                参考作品: ['雪中悍刀行', '世子很凶', '娱乐春秋']
            },
            createdAt: now,
            updatedAt: now
        };

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put({ id: project.id, data: project, task: null, updatedAt: now });

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(project);
        });
    }

    async getProject(id: string): Promise<小说写作数据集结构 | null> {
        const db = await this.getDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const record = request.result as NovelWritingDBRecord | undefined;
                resolve(record?.data || null);
            };
        });
    }

    async getAllProjects(): Promise<小说写作数据集结构[]> {
        const db = await this.getDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const records = request.result as NovelWritingDBRecord[];
                resolve(records.map(r => r.data));
            };
        });
    }

    async updateProject(project: 小说写作数据集结构): Promise<void> {
        const db = await this.getDB();
        const now = Date.now();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(project.id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const record = request.result as NovelWritingDBRecord;
                const newRecord: NovelWritingDBRecord = {
                    id: project.id,
                    data: { ...project, updatedAt: now },
                    task: record?.task || null,
                    updatedAt: now
                };

                const putTx = db.transaction(STORE_NAME, 'readwrite');
                const putStore = putTx.objectStore(STORE_NAME);
                const putRequest = putStore.put(newRecord);

                putRequest.onerror = () => reject(putRequest.error);
                putRequest.onsuccess = () => resolve();
            };
        });
    }

    async deleteProject(id: string): Promise<void> {
        const db = await this.getDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async updateOutline(projectId: string, outline: 小说写作大纲结构): Promise<void> {
        const project = await this.getProject(projectId);
        if (!project) throw new Error('项目不存在');

        project.大纲 = outline;
        await this.updateProject(project);
    }

    async addCharacter(projectId: string, character: 小说写作角色结构): Promise<void> {
        const project = await this.getProject(projectId);
        if (!project) throw new Error('项目不存在');

        project.角色列表.push(character);
        await this.updateProject(project);
    }

    async updateCharacter(projectId: string, character: 小说写作角色结构): Promise<void> {
        const project = await this.getProject(projectId);
        if (!project) throw new Error('项目不存在');

        const index = project.角色列表.findIndex(c => c.id === character.id);
        if (index === -1) throw new Error('角色不存在');

        project.角色列表[index] = character;
        await this.updateProject(project);
    }

    async deleteCharacter(projectId: string, characterId: string): Promise<void> {
        const project = await this.getProject(projectId);
        if (!project) throw new Error('项目不存在');

        project.角色列表 = project.角色列表.filter(c => c.id !== characterId);
        await this.updateProject(project);
    }

    async addChapter(projectId: string, chapter: 小说写作章节结构): Promise<void> {
        const project = await this.getProject(projectId);
        if (!project) throw new Error('项目不存在');

        project.章节列表.push(chapter);
        await this.updateProject(project);
    }

    async updateChapter(projectId: string, chapter: 小说写作章节结构): Promise<void> {
        const project = await this.getProject(projectId);
        if (!project) throw new Error('项目不存在');

        const index = project.章节列表.findIndex(c => c.id === chapter.id);
        if (index === -1) throw new Error('章节不存在');

        project.章节列表[index] = { ...chapter, updatedAt: Date.now() };
        await this.updateProject(project);
    }

    async deleteChapter(projectId: string, chapterId: string): Promise<void> {
        const project = await this.getProject(projectId);
        if (!project) throw new Error('项目不存在');

        project.章节列表 = project.章节列表.filter(c => c.id !== chapterId);
        await this.updateProject(project);
    }

    async reorderChapters(projectId: string, chapterIds: string[]): Promise<void> {
        const project = await this.getProject(projectId);
        if (!project) throw new Error('项目不存在');

        const chapterMap = new Map(project.章节列表.map(c => [c.id, c]));
        const reorderedChapters = chapterIds
            .map((id, index) => {
                const chapter = chapterMap.get(id);
                if (chapter) {
                    return { ...chapter, 序号: index + 1 };
                }
                return null;
            })
            .filter((c): c is 小说写作章节结构 => c !== null);

        project.章节列表 = reorderedChapters;
        await this.updateProject(project);
    }

    generateChapterId(): string {
        return `ch_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    generateCharacterId(): string {
        return `char_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    async exportToJSON(projectId: string): Promise<string> {
        const project = await this.getProject(projectId);
        if (!project) throw new Error('项目不存在');

        return JSON.stringify(project, null, 2);
    }

    async exportToTXT(projectId: string): Promise<string> {
        const project = await this.getProject(projectId);
        if (!project) throw new Error('项目不存在');

        let content = `${project.标题}\n`;
        content += `作者：${project.作者}\n\n`;
        content += `简介：${project.简介}\n\n`;

        content += `【世界观】\n${project.大纲.世界观}\n\n`;
        content += `【主线剧情】\n${project.大纲.主线剧情}\n\n`;

        if (project.大纲.支线剧情.length > 0) {
            content += `【支线剧情】\n`;
            project.大纲.支线剧情.forEach((sp, i) => {
                content += `${i + 1}. ${sp}\n`;
            });
            content += '\n';
        }

        if (project.角色列表.length > 0) {
            content += `【角色设定】\n`;
            project.角色列表.forEach(char => {
                content += `${char.名称}（${char.定位}）：${char.描述}\n`;
            });
            content += '\n';
        }

        content += `【正文】\n\n`;
        project.章节列表.forEach(chapter => {
            content += `第${chapter.序号}章 ${chapter.标题}\n\n`;
            content += `${chapter.内容}\n\n`;
        });

        return content;
    }
}

export const novelWritingService = new NovelWritingService();

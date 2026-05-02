/**
 * @module storyTasks
 * Thin public API facade. All implementations live in:
 *   - storyCoreTasks.ts          (story, memory, polish, world gen, realm gen, connection test, failover)
 *   - worldEvolutionTask.ts      (world evolution)
 *   - variableCalibrationTask.ts (variable calibration)
 *   - novelDecomposition.ts      (novel decomposition + planning analysis)
 */

export {
    parseStoryRawText,
    StoryResponseParseError,
    提取首个标签内容,
    提取首尾思考区段,
    解析动态世界块,
    解析命令块
} from './storyResponseParser';
export type { StoryParseOptions } from './storyResponseParser';

// Core tasks
export {
    generateMemoryRecall,
    generatePolishedBody,
    generateWorldData,
    解析世界观提示词内容,
    generateFandomRealmData,
    解析境界体系提示词内容,
    generateStoryResponse,
    generateStoryResponseWithFailover,
    testConnection
} from './storyCoreTasks';

// World evolution
export { generateWorldEvolutionUpdate } from './worldEvolutionTask';

// Variable calibration
export { generateVariableCalibrationUpdate } from './variableCalibrationTask';

// Novel decomposition + planning analysis
export {
    generateNovelDecomposition,
    generatePlanningAnalysis
} from './novelDecomposition';

// Types
export type {
    ConnectionTestResult,
    StoryResponseResult,
    StoryStreamOptions,
    StoryRequestOptions,
    PolishedBodyResult
} from './storyCoreTasks';

export type { WorldEvolutionResult } from './worldEvolutionTask';

export type { VariableCalibrationResult } from './variableCalibrationTask';

export type {
    PlanningAnalysisResult,
    NovelDecompositionAnalysisResult,
    NovelDecompositionEventAnalysisResult,
    NovelDecompositionVisibilityAnalysisResult,
    NovelDecompositionVisibleInfoItemAnalysisResult,
    NovelDecompositionCharacterProgressAnalysisResult
} from './novelDecomposition';

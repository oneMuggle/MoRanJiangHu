/**
 * 模块注册引导入口
 *
 * 导入所有 UI 模块注册文件（side-effect imports）。
 * 在 App.tsx 或入口文件中导入此文件即可激活所有模块。
 */

// Phase 1: 批量注册现有弹窗（从 lazyComponents.tsx 迁移）
import './legacyRegistrations';

// Phase 3+: 新模块注册将在此添加，例如：
// import '../modules/contemporary/campusNSFW/uiRegistration';
// import '../modules/contemporary/photographyNSFW/uiRegistration';
// import '../modules/contemporary/urbanDriverNSFW/uiRegistration';

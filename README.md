# BIM WebGPU Viewer

## 🛠 技术栈
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Shadcn UI (Sonner)
- **3D Engine**: Three.js (WebGPU Renderer)
- **Loaders**: `web-ifc-three` (IFC), `occt-import-js` (STEP)
- **State Management**: Zustand
- **Containerization**: Docker + Nginx

## 🚀 启动指南 (How to Run)
1. 确保 Docker Desktop 已启动。
2. 在根目录执行：`docker compose up --build`
3. 等待容器启动完成...
4. 打开浏览器访问：[http://localhost:3000](http://localhost:3000)

## 🔗 服务地址 (Services)
- Frontend: http://localhost:3000

## 🧪 功能特性
- **高性能渲染**: 使用 Three.js WebGPU 渲染器提供现代图形能力。
- **BIM 支持**: 通过 WebAssembly 支持解析 `.ifc` 和 `.stp`/`.step` 文件。
- **性能优化**: 自动几何合并 (Geometry Merging) 以减少 Draw Calls。
- **属性查看**: 提供检查面板以查看对象元数据。
- **暗黑模式**: 专业的深色 UI 设计。

## ⚡ 轻量化实现 (Lightweight Architecture)
本项目采用多维度技术手段实现“BIM模型导入与轻量化”的核心需求：

### 1. 渲染层 (Rendering Layer) - WebGPU
- **技术选型**: 采用下一代图形标准 **WebGPU** (via `three/webgpu`) 替代传统的 WebGL。
- **轻量化收益**: 显著降低由于大量 Draw Calls 引起的 CPU 开销，能够更高效地处理 BIM 模型中成千上万的复杂构件，从而在浏览器中保持高帧率流畅运行。

### 2. 计算层 (Computation Layer) - WASM + Workers
- **技术选型**: 集成 `web-ifc` (WASM) 和 `occt-import-js` (WASM) 解析核心，并配置在 **Web Workers** 中运行。
- **轻量化收益**: 
    - **二进制执行**: WASM 提供接近原生的解析速度，快速处理 `.ifc` 和 `.stp` 文件。
    - **非阻塞主线程**: 繁重的几何解析任务在后台线程完成，确保 UI 线程始终响应用户操作，避免“假死”现象。

### 3. 构建层 (Build Layer) - Vite
- **技术选型**: 使用 **Vite** 进行构建与打包。
- **轻量化收益**: 基于 ES Modules 的模块化加载与 Rollup 的 Tree-shaking 机制，自动剔除未使用的代码，确保最终交付的生产环境包体（Bundle Size）维持在最小水平，加快首屏加载速度。

## 📖 加载模型使用说明 (Load Model ser Guide)
1. 点击顶部工具栏的 **"加载模型"** 按钮。
2. 在弹出的文件选择窗口中，您可以导航到项目根目录下的 `public` 文件夹，其中包含预置的测试模型。
3. 选择以下支持格式的文件进行加载：
    - **IFC 文件**: `.ifc`
    - **STEP 文件**: `.stp`, `.step`
4. 等待解析完成后，模型将自动显示在 3D 下，左侧模型树将展示构件层级。

## ⚠️ 注意事项
- 请确保您的浏览器支持 WebGPU (推荐使用 Chrome 113+)。
- 大型模型的解析时间取决于 CPU 和 WASM 性能，请耐心等待。

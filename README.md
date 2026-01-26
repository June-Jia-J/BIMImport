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

## ⚠️ 注意事项
- 请确保您的浏览器支持 WebGPU (推荐使用 Chrome 113+)。
- 大型模型的解析时间取决于 CPU 和 WASM 性能，请耐心等待。

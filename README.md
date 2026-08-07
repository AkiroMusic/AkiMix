# AkiMix — Audio Mixing Assistant

**A cross-platform desktop audio mixing reference tool** — BPM, compression, reverb, delay, EQ, filters, loudness, mixing levels, scales, chords, song structure, drum patterns, and more, all in one place.

**跨平台桌面混音参考工具** —— BPM、压缩、混响、延迟、EQ、滤波器、响度、混音电平、音阶、和弦、歌曲结构、鼓点模式等，一站式搞定。

![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

---

## English (英文)

### Overview

AkiMix is a sister app to **Format Converter**, designed for music producers, sound engineers, and mixing enthusiasts. It replicates and expands the mixing calculators of [yinlvwu.com/hyzs/](http://yinlvwu.com/hyzs/) with a modern, themed desktop experience — plus a rich set of additional mixing tools.

### Features

**Timing & Tempo**

- **BPM Calculator** — Manual BPM input (1–999) with instant results and reset
- **Tap Tempo** — Tap the rhythm with your mouse or spacebar to auto-detect BPM
- **Compressor Release Time** — Release times for 1/4, 1/8, 1/16, 1/32, 1/64 notes with safety warnings for extreme values
- **Reverb Calculator** — Pre-delay (Room / Hall / Plate / Chamber) and recommended RT60 decay ranges
- **Delay Calculator** — Complete grid for normal / dotted / triplet beats from 1/1 to 1/64, with 1-click copy-to-clipboard

**Frequency, Pitch & Samples**

- **Frequency & Pitch** — Musical note to Hz chart (C0–B8), pitch shift & speed ratio conversion (semitones / cents ↔ %)
- **Samples Converter** — Convert ms to sample counts for 44.1 / 48 / 96 / 192 kHz for precision DAW editing
- **Oscillator Reference** — Waveform types (sine / sawtooth / square / triangle / noise) and their characteristics

**Sound Design & Mixing**

- **EQ Recommendations** — Genre-based frequency band / gain / Q recommendations
- **Filter Calculator** — Cutoff↔note conversion, Q↔resonance, slope & envelope
- **Loudness Standards** — Genre-based LUFS targets and loudness categories
- **Mix Levels** — Level groups, element targets and priority guidance
- **Sidechain** — BPM-synced release timing, release curve types, and note-division pump timing
- **Effects Reference** — Categories, types, routing and parameters

**Music Theory**

- **Chords** — Progressions by genre, borrowed chords, chord qualities
- **Scales** — Scale types, intervals, degree notation
- **Song Structure** — Arrangement sections (intro, verse, chorus…) for building tracks
- **Drum Pattern** — Pattern generator with per-element i18n naming

**App Experience**

- **7 Themes** — System, Dark, Light, Sepia, Forest, Ocean, Lavender
- **i18n** — Simplified Chinese & English (English-first UI, bilingual content)
- **Frameless window** with custom title bar, icon sidebar navigation, and animated star background

### Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop shell | Electron 33 |
| Build tooling | electron-vite 2, Vite 5 |
| UI | React 18, TypeScript 5, Tailwind CSS 3 |
| State | Zustand 5 |
| i18n | i18next / react-i18next |
| Testing | Vitest 2 (819 unit tests) |

### Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Package installers
npm run build:win   # Windows (NSIS .exe)
npm run build:mac   # macOS (.dmg)
npm run build:linux # Linux
```

### Project Structure

```
├── src/
│   ├── main/        # Electron main process (window, IPC, store)
│   ├── preload/     # IPC bridge
│   ├── core/        # Mixing math & calculation engines (fully unit-tested)
│   └── renderer/    # React frontend (components, store, locales, i18n)
├── build/           # App icons & assets
└── package.json
```

### License

This project is released under a **custom license** — permissive use with **mandatory attribution** and **author consultation for major decisions**. See [LICENSE](./LICENSE) for the full terms (English and Chinese).

---

## 中文 (Chinese)

### 简介

AkiMix 是 **Format Converter** 的姊妹应用，专为音乐制作人、混音工程师和混音爱好者设计。它复刻并扩展了 [yinlvwu.com/hyzs/](http://yinlvwu.com/hyzs/) 的混音计算器，并提供现代的主题化桌面体验，以及一整套丰富的附加混音工具。

### 功能特性

**节拍与速度**

- **BPM 计算器** — 手动输入 BPM（1–999），即时计算与重置
- **Tap Tempo 打拍测速** — 用鼠标或空格键打拍，自动检测 BPM
- **压缩释放时间** — 1/4、1/8、1/16、1/32、1/64 音符的释放时间，对极端值给出安全提示
- **混响计算器** — 预延迟（房间 / 大厅 / 板式 / 腔体）与推荐 RT60 衰减范围
- **延迟计算器** — 常规 / 附点 / 三连音的完整表格（1/1 至 1/64），支持一键复制毫秒值

**频率、音高与采样**

- **频率与音高** — 音符到频率（Hz）对照表（C0–B8），变速变调换算（半音 / 音分 ↔ 百分比）
- **采样数转换器** — 将毫秒转换为 44.1 / 48 / 96 / 192 kHz 采样率下的采样数，用于精确 DAW 编辑
- **振荡器参考** — 波形类型（正弦 / 锯齿 / 方波 / 三角 / 噪声）及其特性

**声音设计与混音**

- **EQ 建议** — 基于曲风的频段 / 增益 / Q 值推荐
- **滤波器计算器** — 截止频率↔音符换算、Q↔谐振、斜率与包络
- **响度标准** — 基于曲风的 LUFS 目标与响度分类
- **混音电平** — 电平组、各元素目标与优先级指引
- **侧链压缩** — BPM 同步释放时序、释放曲线类型与音符时值泵送时序
- **效果器参考** — 分类、类型、路由与参数

**乐理工具**

- **和弦** — 按曲风的和弦进行、借用和弦、和弦性质
- **音阶** — 音阶类型、音程、级数标记
- **歌曲结构** — 编曲段落（前奏、主歌、副歌……），辅助搭建完整曲目
- **鼓点模式** — 模式生成器，各元素带 i18n 命名

**应用体验**

- **7 套主题** — 跟随系统、深色、浅色、羊皮纸、森林、海洋、薰衣草
- **多语言** — 简体中文与英文
- **无边框窗口** — 自定义标题栏、图标侧边栏导航、星空背景动画

### 技术栈

| 层级 | 技术 |
|------|------|
| 桌面外壳 | Electron 33 |
| 构建工具 | electron-vite 2、Vite 5 |
| UI | React 18、TypeScript 5、Tailwind CSS 3 |
| 状态管理 | Zustand 5 |
| 国际化 | i18next / react-i18next |
| 测试 | Vitest 2（819 个单元测试） |

### 快速开始

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 运行测试
npm test

# 生产构建
npm run build

# 打包安装程序
npm run build:win   # Windows（NSIS .exe）
npm run build:mac   # macOS（.dmg）
npm run build:linux # Linux
```

### 项目结构

```
├── src/
│   ├── main/        # Electron 主进程（窗口、IPC、存储）
│   ├── preload/     # IPC 桥接
│   ├── core/        # 混音数学与计算引擎（全部单元测试覆盖）
│   └── renderer/    # React 前端（组件、状态、语言包、i18n）
├── build/           # 应用图标与资源
└── package.json
```

### 开源协议

本项目采用**自定义协议**发布 —— 允许宽松使用，但**必须署名来源**，重大决策需与作者协商。完整条款（中英双语）见 [LICENSE](./LICENSE)。

---

© 2026 Akiro (AkiroMusic). All rights reserved.

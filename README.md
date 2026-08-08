# AkiMix — Audio Mixing Assistant
# AkiMix — 音频混音助手

**A cross-platform desktop audio mixing toolbox** — 19 integrated tools covering timing, frequency, sound design, mixing, and music theory, all in one themed application.

**跨平台桌面音频混音工具箱** —— 19 个集成工具，覆盖节拍、频率、声音设计、混音与乐理，全部整合在一套主题化应用之中。

![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

---

## Overview
## 简介

AkiMix is a complete mixing reference workstation for music producers, sound engineers, and mixing enthusiasts. It pairs a **fully offline, instant-response calculation engine** (819 unit tests) with a clean, themeable desktop UI — so every number on screen is computed live from your inputs, not looked up from static tables.

AkiMix 是为音乐制作人、混音工程师和混音爱好者打造的**完整混音参考工作站**。它将**完全离线、即时响应的计算引擎**（819 个单元测试）与简洁可主题化的桌面界面相结合——屏幕上每一个数字都由你的输入实时计算得出，而非查表得到。

> **Zero audio required.** AkiMix is a reference & calculation tool, not a DAW — it gives you the exact numbers to dial into your own plugins and DAW.

> **无需任何音频环境。** AkiMix 是参考与计算工具而非 DAW——它给你精确的数值，让你填进自己的插件和 DAW 中。

## Feature Tour (19 Tools)
## 功能导览（19 个工具）

### 1. BPM Calculator — Tempo Hub
### 1. BPM 计算器 — 节拍中枢

The timing core of the app, driving every time-based tool.

整个应用的时间基准，驱动所有基于时间的工具。

- Manual BPM input (1–999) with instant calculation
- 手动输入 BPM（1–999），即时计算
- **Tap Tempo** — tap with mouse or spacebar, auto-detect BPM from tap intervals
- **Tap Tempo 打拍测速** — 鼠标或空格键打拍，自动检测 BPM
- **Speed multipliers** — scale BPM up/down (half-time, double-time, etc.)
- **速度倍数** — 按比例缩放 BPM（半速、倍速等）

### 2. Compressor Release Time
### 2. 压缩释放时间

- Release times for **1/4, 1/8, 1/16, 1/32, 1/64** note divisions at your current BPM
- 当前 BPM 下 **1/4、1/8、1/16、1/32、1/64** 音符的释放时间
- **Safety indicators** — visual warnings for extreme values (>800 ms or <50 ms) that suggest your compressor settings may sound unnatural
- **安全提示** — 极端值（>800 ms 或 <50 ms）给出视觉警告，提示压缩器设置可能听感不自然

### 3. Reverb Calculator
### 3. 混响计算器

- **Pre-delay** for 4 space types — Room, Hall, Plate, Chamber — derived from tempo
- 4 种空间类型的**预延迟**——房间、大厅、板式、腔体，基于节拍推算
- **RT60 decay** recommendations (reverb time & decay ranges) synced to BPM
- 与 BPM 同步的 **RT60 衰减**建议（混响时间与衰减范围）
- Multi-range output for quick A/B of short vs. long room character
- 多范围输出，方便快速 A/B 短混响与长空间质感

### 4. Delay Calculator
### 4. 延迟计算器

- Full **3-mode grid** — Normal, Dotted (×1.5), Triplet — from 1/1 to 1/64
- 完整**三模式网格**——常规、附点（×1.5）、三连音——从 1/1 到 1/64
- Every value computed to 0.1 ms precision
- 每个数值精确到 0.1 ms
- **1-click copy** any delay time to the clipboard for pasting into your DAW
- **一键复制**任意延迟时间到剪贴板，直接粘贴进 DAW

### 5. Frequency & Pitch
### 5. 频率与音高

- Complete **note → frequency (Hz) chart, C0 to B8** (equal temperament, A4 = 440 Hz)
- 完整 **音符→频率（Hz）对照表，C0 至 B8**（十二平均律，A4 = 440 Hz）
- **Reverse lookup** — enter any frequency to find the nearest note
- **反向查询** — 输入任意频率，找到最近音符
- **Pitch shift ↔ speed ratio** conversion — semitones & cents to speed %, and back
- **变速 ↔ 变调**换算 — 半音 / 音分与速度百分比互转
- Built on standard formulas: `f = 440 · 2^((midi−69)/12)`
- 基于标准公式：`f = 440 · 2^((midi−69)/12)`

### 6. Samples Converter
### 6. 采样数转换器

- Convert **milliseconds ↔ sample counts** at 44.1 / 48 / 96 / 192 kHz in both directions
- **毫秒 ↔ 采样数**双向换算，支持 44.1 / 48 / 96 / 192 kHz
- Pre-computed values across all four sample rates simultaneously
- 同时给出四种采样率下的预计算结果
- Ideal for precision editing: aligning effects, transient placement, and session clock conversions
- 适合精确编辑：效果对齐、瞬态定位、会话时钟换算

### 7. EQ Recommendations
### 7. EQ 建议

- **Genre-based EQ targets** — frequency band, gain, and Q recommendations per genre
- **基于曲风的 EQ 目标** — 每种曲风的频段、增益与 Q 值建议
- **Per-element guidance** — see EQ moves recommended for each mix element (kick, snare, vocal, bass, etc.)
- **分元素指导** — 查看针对每个混音元素（底鼓、军鼓、人声、贝斯等）的 EQ 建议
- **Genre ↔ element cross-reference** — find which genres benefit from treating a given element
- **曲风 ↔ 元素交叉参考** — 找出哪些曲风适合对特定元素进行处理

### 8. Mix Levels
### 8. 混音电平

- **6 mix groups** — Drums & Percussion, Bass, Vocals, Instruments, FX & Atmosphere, Master Bus
- **6 大混音组** — 鼓与打击乐、贝斯、人声、乐器、FX 与氛围、母带总线
- **Per-element dB ranges** with min/max targets for 15+ elements
- 15+ 元素的**逐元素 dB 范围**（最小/最大目标）
- **Priority tagging** (e.g., *critical*) so you know which element anchors the mix (kick as foundation)
- **优先级标记**（如"关键"），让你知道哪个元素锚定混音（底鼓为基准）
- Genre-aware defaults — all recommendations are starting points with clear "trust your ears" guidance
- 曲风感知的默认值——所有建议都是起点，并明确提示"相信你的耳朵"

### 9. Loudness Standards
### 9. 响度标准

- **Mastering targets for 13 platforms/standards** — Spotify, Apple Music, YouTube, Tidal, Amazon Music, Deezer, SoundCloud, Bandcamp, CD, Broadcast TV, Film, Podcast, and general mastering references
- **13 个平台/标准的母带目标** — Spotify、Apple Music、YouTube、Tidal、Amazon Music、Deezer、SoundCloud、Bandcamp、CD、广播电视、电影、播客及通用母带参考
- Grouped into 4 categories: **Streaming, Broadcast & Film, Physical Media, Reference**
- 分为 4 类：**流媒体、广播电视与电影、实体介质、参考标准**
- **Loudness checker** — enter your integrated LUFS, instantly see pass/fail and the exact adjustment (dB) needed per platform
- **响度检测器** — 输入你的集成 LUFS，立即看到每个平台的通过/不通过及所需调整量（dB）
- **Genre-based loudness recommendations** with safe ranges
- **基于曲风的响度建议**与安全范围

### 10. Oscillator Reference
### 10. 振荡器参考

- **5 waveform types** — sine, sawtooth, square, triangle, noise — with characteristics
- **5 种波形类型** — 正弦、锯齿、方波、三角、噪声及其特性
- **Detune → Hz** conversion (cents offset from a base frequency)
- **失谐 → Hz** 换算（相对基准频率的音分偏移）
- **Unison voice spread** — compute detuned voice stacks for width
- **齐奏（Unison）声部扩展** — 计算失谐声部堆叠以获得宽度
- **FM ratio calculator** — harmonics of FM operator ratios
- **FM 比例计算器** — FM 算子比例的谐波分析
- **Sub-oscillator** — octaves-down frequency generation
- **次振荡器** — 降低八度的频率生成

### 11. Filter Calculator
### 11. 滤波器计算器

- **Cutoff frequency ↔ musical note** conversion — dial filters musically
- **截止频率 ↔ 音乐音符**换算 — 用乐理来调滤波器
- **Q ↔ resonance** conversion with slope info per filter type
- **Q ↔ 谐振**换算，附带各滤波器类型的斜率信息
- **Envelope points** — compute filter envelope (attack/decay/sustain/release) curves from your settings
- **包络点计算** — 由你的设置计算滤波器包络（起音/衰减/保持/释音）曲线

### 12. Modulation Planner
### 12. 调制规划器

- **LFO rate sync** — LFO speeds locked to BPM note divisions
- **LFO 速率同步** — LFO 速度锁定到 BPM 音符时值
- **ADSR validation** — sanity-check your ADSR envelope values
- **ADSR 校验** — 检查你的 ADSR 包络数值是否合理
- **Modulation matrix** — plan routing (source → target) with recommended ranges
- **调制矩阵** — 规划路由（源 → 目标）并给出推荐范围
- **LFO waveform reference** — shapes & their characters
- **LFO 波形参考** — 各波形形态与特性

### 13. Sidechain
### 13. 侧链压缩

- **BPM-synced pump timing** — attack/hold/release ms values from tempo & note division
- **BPM 同步泵送时序** — 由速度与音符时值计算起音/保持/释放毫秒值
- **Release curve types** — linear, logarithmic, exponential, with point-level preview
- **释放曲线类型** — 线性、对数、指数，带逐点预览
- **Note division selection** — quarter / eighth / sixteenth / eighth-triplet pump cycles
- **音符时值选择** — 四分 / 八分 / 十六分 / 八分三连音泵送循环
- **Kick length estimation** at current BPM
- 当前 BPM 下的**底鼓时长估算**
- **Multiband crossover calculator** for multiband sidechain setups
- 多频段侧链的**分频点计算器**

### 14. Effects Reference
### 14. 效果器参考

- **9 reverb spaces** with character descriptions
- **9 种混响空间**及特性描述
- **BPM-synced delay times** reference
- **BPM 同步延迟时间**参考
- **6 distortion types** & their characteristics
- **6 种失真类型**及其特性
- **Feedback staging calculator** — enter a feedback %, see how many audible repeats result (log-based) and the character (from *no repeats* to *near-infinite wash*)
- **反馈分级计算器** — 输入反馈百分比，算出可听见的重复次数（对数算法）与听感特征（从"无重复"到"近无限混响"）
- **Serial/parallel routing guidance** per effect category
- 各效果类别的**串联 / 并联路由**指导

### 15. Chords
### 15. 和弦

- **Progressions by genre** — EDM, Pop, Rock, Jazz, Blues, R&B, Hip-Hop, Metal, Country, Latin, Classical (11 genres)
- **按曲风的和弦进行** — EDM、流行、摇滚、爵士、蓝调、R&B、嘻哈、金属、乡村、拉丁、古典（11 种曲风）
- **Extended chords** — build extended/voiced chords from a root
- **扩展和弦** — 从根音构建扩展/加音和弦
- **Modal interchange** — borrowed chords from parallel modes (e.g., in the key of C)
- **调式互换** — 从平行调式借用和弦（如 C 调）
- **Chord quality catalog** — major, minor, diminished, augmented, dom7, maj7, min7, sus2, sus4
- **和弦性质目录** — 大三、小三、减三、增三、属七、大七、小七、挂二、挂四

### 16. Scales
### 16. 音阶

- **12 keys × 7 modes** (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian)
- **12 个调 × 7 种调式**（伊奥尼亚、多利亚、弗里几亚、利底亚、混合利底亚、伊奥利亚、洛克里亚）
- Each scale shows **degree, note name, semitone offset, exact frequency (Hz)**, and interval quality
- 每个音阶显示**级数、音名、半音偏移、精确频率（Hz）**与音程性质
- **Diatonic chord qualities** per mode — see which triads "belong" to a key
- 每种调式的**自然音和弦性质** — 查看哪些三和弦"属于"该调
- Links music theory directly to audio (EQ notching, harmonic mixing, layering)
- 将乐理直接连接音频（EQ 陷波、和声混音、乐器分层）

### 17. Song Structure
### 17. 歌曲结构

- **Structure templates for 22 genres** — House, Techno, Trance, Dubstep, Drum & Bass, UK Garage, Trap, Future Bass, Progressive House, Deep House, Hardstyle, Psytrance, Breaks, Electro House, Minimal, Ambient, Pop, Rock, Singer-Songwriter, Folk, Jazz, Classical
- **22 种曲风的结构模板** — House、Techno、Trance、Dubstep、Drum & Bass、UK Garage、Trap、Future Bass、Progressive House、Deep House、Hardstyle、Psytrance、Breaks、Electro House、Minimal、Ambient、流行、摇滚、唱作人、民谣、爵士、古典
- Full **section-by-section arrangement** (intro → build → drop → breakdown → outro, verse/chorus/bridge, exposition/development/recapitulation, etc.)
- 完整的**逐段落编曲**（前奏 → 铺垫 → 高潮 → 低谷 → 尾声；主歌/副歌/桥段；呈示/展开/再现等）
- **Energy maps** — relative energy level of each section for arrangement planning
- **能量图谱** — 各段落的相对能量水平，辅助编曲规划

### 18. Drum Pattern
### 18. 鼓点模式

- **Pattern generator for 16 genres** — House, Trance, Techno, Dubstep, D&B, UK Garage, Trap, Future Bass, Hardstyle, Breakbeat, Rock, Jazz, Funk, Hip-Hop, Metal, Latin
- **16 种曲风的模式生成器** — House、Trance、Techno、Dubstep、D&B、UK Garage、Trap、Future Bass、Hardstyle、Breakbeat、摇滚、爵士、Funk、嘻哈、金属、拉丁
- **Per-element naming** — kick, snare, hi-hats, clap, open hat, etc. (fully localized)
- **逐元素命名** — 底鼓、军鼓、踩镲、拍手、开镲等（完全本地化）
- **Swing application** — shift a grid by swing percentage
- **摇摆（Swing）应用** — 按百分比位移网格
- **Ghost notes** — add ghost-note layers for groove
- **幽灵音符** — 添加幽灵音层增强律动

### 19. Settings & App Experience
### 19. 设置与应用体验

- **7 color themes** — System, Dark, Light, Sepia, Forest, Ocean, Lavender
- **7 套主题** — 跟随系统、深色、浅色、羊皮纸、森林、海洋、薰衣草
- **Bilingual UI** — Simplified Chinese & English, switchable live
- **双语界面** — 简体中文与英文，实时切换
- **Export/Import settings** — save your configuration as a file, restore it anywhere
- **设置导入 / 导出** — 将配置保存为文件，随时恢复
- **Frameless window** — custom title bar, Material-3-inspired icon sidebar, animated star background
- **无边框窗口** — 自定义标题栏、Material 3 风格图标侧边栏、星空背景动画

## Architecture
## 技术架构

| Layer | Technology |
|-------|------------|
| Desktop shell | Electron 33 |
| Build tooling | electron-vite 2, Vite 5 |
| UI | React 18, TypeScript 5, Tailwind CSS 3 |
| State | Zustand 5 |
| i18n | i18next / react-i18next (1,404 translation keys) |
| Testing | Vitest 2 — **819 unit tests, 15 test suites, all passing** |

| 层级 | 技术 |
|------|------|
| 桌面外壳 | Electron 33 |
| 构建工具 | electron-vite 2、Vite 5 |
| UI | React 18、TypeScript 5、Tailwind CSS 3 |
| 状态管理 | Zustand 5 |
| 国际化 | i18next / react-i18next（1,404 个翻译条目） |
| 测试 | Vitest 2 — **819 个单元测试，15 个测试套件，全部通过** |

**Design principle:** every calculation lives in `src/core/` as a pure, fully unit-tested function. The UI is a thin layer on top — the same math powers the app today and any future platform.

**设计原则：** 所有计算都位于 `src/core/` 中，是纯函数且完全经过单元测试。UI 只是其上的薄层——同一套数学既驱动今天的应用，也驱动未来任何平台。

## Getting Started
## 快速开始

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests (819 unit tests)
npm test

# Build for production
npm run build

# Package installers
npm run build:win   # Windows (NSIS .exe)
npm run build:mac   # macOS (.dmg)
npm run build:linux # Linux
```

## Project Structure
## 项目结构

```
├── src/
│   ├── main/        # Electron main process (window, IPC, store persistence)
│   ├── preload/     # Typed IPC bridge
│   ├── core/        # 16 pure calculation engines (fully unit-tested)
│   └── renderer/    # React frontend (25 components, store, locales, i18n)
├── build/           # App icons & assets
└── package.json
```

## License
## 开源协议

This project is released under a **custom license** — permissive use with **mandatory attribution** and **author consultation for major decisions**. Full terms (English & Chinese) in [LICENSE](./LICENSE).

本项目采用**自定义协议**发布 —— 允许宽松使用，但**必须署名来源**，重大决策需与作者协商。完整条款（中英双语）见 [LICENSE](./LICENSE)。

---

© 2026 Akiro (AkiroMusic). All rights reserved.

# Agent 工作区约定 (AGENT.md)

> 本文件服务于在仓库内协作的 AI agent（如 Hermes / Claude Code / Codex）与人类贡献者。

## 1. Agent 文件存放路径 `.agents/`

Agent 产生的**非提交性**工作产物一律存放在仓库根下的 `.agents/` 目录：

- 探索 / 侦查文档（如 `*.exploration.md`、`*-notes.md`）
- Todo list / 任务清单
- 临时研究笔记、数据对比记录
- 任何**只对当前工作流有意义**、不该进入主代码库的 md 文件

示例：

```
.agents/
  unforge-datacore-exploration.md
  2026-08-25-qd-card-notes.md
  current-todo.md
```

这些文件**经常是单次使用的一次性产物**。它们存在于本地便于 agent 回顾上下文，但不应随功能代码一起提交进仓库。

## 2. `.agents/` 已加入 `.gitignore`

`.agents/` 目录已在仓库 `.gitignore` 中忽略，因此其中内容**不会被 git 跟踪**，也不会被误提交进 PR / commit。

这保证了：agent 可以自由地随手记录探索笔记与 todo，而不必担心污染 git history 或把草稿一起提交。

## 3. 提交时该注意

- **可提交**：`src/`、`public/`、`scripts/`、`tests/`、正式 `docs/*.md`（如 data-flow.md 这类长期有效的文档）。
- **不提交**：`.agents/` 下的一切，以及任何临时草稿。

如果某个 `.agents/` 文档后来被确认**长期有效且值得入库**，请先人工判断后将其挪到 `docs/` 再提交。

## 4. 其他 agent 友好提示

- 提交信息遵循 Conventional Commits（`feat:`/`fix:`/`docs:`/`refactor:` …）。
- 修改 `src/i18n/**` 时保持原有缩进（4 格）与键顺序，避免无关格式噪音。
- 船只译名（`src/i18n/vehicles/*.json`）由 CI 自动拉取，**不要手动补译名**。

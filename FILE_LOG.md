<!-- maintain-file-logs schema=1 -->
# 文件导航

## 目录

- 当前子项
- 按需读取
- 历史查询

索引 revision：5。仅登记直接子项；原文件是当前内容事实来源。

## 当前子项

| 路径 | 类型 | 内容简介 | 何时读取 | 定位点/子索引 | 验证 |
| --- | --- | --- | --- | --- | --- |
| [.github](.github) | directory | 回归套件与测试夹具。 | 先读子索引，再定位原文件。 | [子索引](.github/FILE_LOG.md) | partial |
| [.gitignore](.gitignore) | file | 忽略依赖、已有缓存与目录日志事务临时文件。 | 需要该入口的行为、配置或回归细节时，打开原文件核实。 | .file-log.lock | stale |
| [CHANGELOG.md](CHANGELOG.md) | file | Bilingual release history including Lazy startup and wildcard batches. | Read when investigating version 0.5.0 behavior, tests or packaging. | ## 0.5.0 | verified |
| [LICENSE](LICENSE) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [PUBLISH.md](PUBLISH.md) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [README.en.md](README.en.md) | file | English-first bilingual installation and usage, including Lazy startup. | Read when investigating version 0.5.0 behavior, tests or packaging. | 0.5.0 | verified |
| [README.md](README.md) | file | Chinese-first bilingual installation and usage, including Lazy startup. | Read when investigating version 0.5.0 behavior, tests or packaging. | 0.5.0 | verified |
| [THIRD_PARTY.md](THIRD_PARTY.md) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [assets](assets) | directory | 业务子目录；尚未索引或复核正文。 | 按精确路径需要该文件时，先打开原文件核实。 |  | unread |
| [cordis.patch.yml](cordis.patch.yml) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [docs](docs) | directory | Tool loading and settings references; see child index. | Read when investigating version 0.5.0 behavior, tests or packaging. | [子索引](docs/FILE_LOG.md) | verified |
| [mcp](mcp) | directory | Runtime implementation, settings and host bridge; see child index. | Read when investigating version 0.5.0 behavior, tests or packaging. | [子索引](mcp/FILE_LOG.md) | verified |
| [package-lock.json](package-lock.json) | file | Locked development dependencies; root version 0.5.0. | Read when investigating version 0.5.0 behavior, tests or packaging. | "version": "0.5.0" | verified |
| [package.json](package.json) | file | 0.5.0 package metadata; packaged entry points and test commands. | Read when investigating version 0.5.0 behavior, tests or packaging. | "version": "0.5.0" | verified |
| [publish](publish) | directory | 业务子目录；尚未索引或复核正文。 | 按精确路径需要该文件时，先打开原文件核实。 |  | unread |
| [scripts](scripts) | directory | Windows PowerShell 后端。 | 先读子索引，再定位原文件。 | [子索引](scripts/FILE_LOG.md) | partial |
| [test](test) | directory | Windows regression and host integration tests, including Lazy startup. | Read when investigating version 0.5.0 behavior, tests or packaging. | [子索引](test/FILE_LOG.md) | verified |

## 按需读取

先检索路径/用途，再打开相关子索引或原文件片段。详细字段见 FILE_INDEX.json。unread/partial/stale 条目需要进一步核实。

## 历史查询

按路径或稳定 ID 搜索 FILE_HISTORY.jsonl；仅在需要追溯时读取命中事件。历史从首次登记开始，来源未知与未观察的中间版本不可推断。

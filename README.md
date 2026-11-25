# 配置同步 Plus · Config sync Plus

`dsh-profile-gist-sync-plus` 是 [Meta-Virgo/dsh-profile-gist-sync](https://github.com/Meta-Virgo/dsh-profile-gist-sync) 的独立 fork。新机器可以直接读取原版 Gist：先看会改哪些配置、会从哪里安装哪些插件，再决定是否恢复。

An independent [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin for backing up a profile to a GitHub Gist and setting up a second machine. **Preview the configuration changes and plugin sources first; restore and install only after confirmation.**

[中文说明](#中文说明) · [English guide](#english-guide) · [HTTP & agent tool](#interfaces) · [MIT](LICENSE)

## 中文说明

### 从 GitHub 固定提交安装（无需 npm 发布）

1. 在 [Xeonice/dsh-profile-gist-sync-plus](https://github.com/Xeonice/dsh-profile-gist-sync-plus) 中选择并审阅**已推送**的提交，确认该提交的 [package.json](package.json) 包名是 `dsh-profile-gist-sync-plus`、版本是 `1.2.0`。复制完整的 **40 位提交 SHA**；下面的 `<commit-sha>` 是占位符，不是可安装的版本。不要以 `main`、浮动标签或上游提交代替。
2. 打开目标 DSH 配置的 **插件 → 添加插件**，输入 `git+https://github.com/Xeonice/dsh-profile-gist-sync-plus.git#<commit-sha>`，替换占位符后再确认。若使用 DSH CLI，见下方等价示例；`web` 换成自己的配置名。CLI 安装前先退出占用该配置的 DSH；Desktop 配置需已由应用初始化。
3. 启动或按提示重启 DSH，打开 **设置 → 内置插件 → 配置同步 Plus**。这个 fork 是独立插件，不会替换上游条目；安装本插件不需要执行 `npm install` 或构建脚本。

```sh
# Replace <commit-sha> with the reviewed, published commit before running.
dsh plugin --profile web add 'git+https://github.com/Xeonice/dsh-profile-gist-sync-plus.git#<commit-sha>'
```

### 迁移一台机器

| 在哪里 | 怎么做 | 会改变什么 |
| --- | --- | --- |
| 原机器 | 检查备份内容后上传到 Gist，记下链接；也可先导出 JSON 离线核对。 | 首次上传创建不公开列出的 Gist；若已指定或记住 ID，则更新其中的备份文件。 |
| 新机器 | 在「新机恢复：配置和插件」填入可信 Gist 的 ID 或链接，点 **预览恢复**。 | 只读；列出哪些配置会新增、覆盖或保留，哪些插件已存在、可补装或需手动处理。不写配置、不安装。 |
| 核对之后 | 确认来源和安装规格可信，再点 **确认恢复配置并安装插件**。 | 恢复刚预览的快照，并让 DSH 安装器处理计划中可解析的缺失插件；不会重新下载 Gist 来代替所见内容。 |

- **哪些配置会恢复？** Plus 主流程合并 bundle 选择，恢复 Cordis 配置、`data/`、`suppliers/`、`config/`、`presets/` 下的可迁移文件，以及其他位置的普通 JSON、YAML、TOML 等文本配置。预览会列出跳过项；本机包管理策略（如 `.npmrc`、`pnpm-workspace.yaml`、manifest 脚本及构建授权）、环境文件和未托管的脚本保留不动。
- **哪些插件会补装？** 只将备份声明且来源可解析的缺失项交给 DSH 安装器。不把依赖声明当成“已安装”，不升级已有版本，也不会为仅有 bundle 名或本地路径的条目猜 npm 包。如果本机已有依赖声明但实际缺包，且 DSH 拒绝安装，结果会显示仍未补齐；Plus 不改包名，也不绕过安装器。请到 DSH 插件页核对该项。
- **查看每项结果。** 个别失败不等于全部完成。待批准的构建脚本要在 DSH 插件管理中单独审阅；本插件不代为批准。要重试或计划已过期，请重新预览。没有可用的插件管理服务时可选高级的**仅同步配置**。恢复后的配置或软件包可能要重启 DSH 才生效；安装成功不等于运行中的插件已经切换。
- **仅同步配置/从本地 JSON 导入是独立操作。** 它们沿用上游的配置合并方式：本地独有文件保留，同名配置可能被覆盖，manifest 中的依赖和 bundle 名合并（同名依赖采用备份规格）。不会自动补装插件；不要把 Plus 主流程对包管理设置的保护误认为适用于所有导入操作。
- **撤销只恢复最近快照记录的配置文件，不卸载软件包。** 已下载的依赖和构建脚本的副作用不在撤销范围；若需删除软件包，在 DSH 的插件管理中处理。保留自己的离线备份。

### 兼容性与保密

- 继续使用 `dsh-profile-backup.json`，格式为 `dsh-profile-backup` **v0.2**。已用上游插件备份？直接在新页面输入原 Gist 的链接，**不用重传**。Plus 的设置、导出和撤销快照只存在目标配置下的 `.dsh-config-sync-plus/`；不会自动接管上游的 Gist 绑定或撤销历史。如果特意让两个插件指向同一个 Gist，以后上传会更新同一个文件。
- Gist 是 **secret（不公开列出），不是私密或加密存储**：持链接者可读。只恢复你信任的备份；其中可以包含可执行的供应商/插件配置和第三方软件来源。上传前检查实际导出的 JSON：凭据数据库（如 `data/auths/credentials.sqlite`）和二进制不会备份，但 `.npmrc`、环境文件、供应商设置或其他文本中手写的令牌、内网地址和本地路径**不是**自动脱敏的。凭据需要在新机单独配置。
- 包本体、`node_modules`、`pnpm-lock.yaml` 和隐藏目录不随备份传输；`data/usage.json` 默认不含，可显式选择。`dependencies` 中的 `link:`、`file:`、`portal:`、`workspace:` 或绝对/相对路径在导出时剔除；备份不附带该目录的代码，也不会凭空补出版本号。其他文本文件中的路径不会自动改写。
- 此插件调用 Gist API 需要有对应权限的 GitHub 令牌（经典令牌使用 `gist` scope；写入已有 Gist 要有其所有者的授权）。可用页面的令牌栏、宿主环境 `DSH_GITHUB_TOKEN` / `GITHUB_TOKEN`、或已登录的 `gh`。插件不把令牌写入备份或设置；不要把令牌贴进聊天、日志或 Gist。Gist 传输使用 `api.github.com`；**安装包**则由 DSH 的包管理器访问对应的注册表或 Git 源，已有构建授权仍可能使脚本执行。

## English guide

### Install from a pinned GitHub commit (no npm publication needed)

Open the [fork on GitHub](https://github.com/Xeonice/dsh-profile-gist-sync-plus), review a **pushed** commit whose [manifest](package.json) identifies `dsh-profile-gist-sync-plus@1.2.0`, and copy its full **40-character SHA**. Replace `<commit-sha>` in `git+https://github.com/Xeonice/dsh-profile-gist-sync-plus.git#<commit-sha>` with that SHA. Do not install a moving branch, a placeholder, or the upstream baseline.

Enter the spec in **Plugins → Add plugin** in the target profile, or use the `dsh plugin --profile web add` example above with your profile name. For CLI installation, stop DSH using that profile first; Desktop must already have initialized its profile. This bundle is plain ESM (Node ≥20), with no dependencies or install/build scripts. Start or restart DSH as indicated, then open **Settings → Built-in plugins → Config sync Plus**.

### Back up, preview, confirm

1. **On the source machine**, review a local export and upload to a Gist. The first upload creates an unlisted Gist unless you specify an existing one. Subsequent uploads update the named or remembered Gist. Record its link securely.
2. **On the destination**, paste the trusted Gist ID or link into **Set up this machine from a Gist** and select **Preview restore**. Review file changes, already-present plugins, the exact sources proposed for installation, and items requiring manual setup. Preview writes no profile files and installs nothing.
3. **Confirm restore and install plugins** applies the previewed snapshot, not a fresh download. It merges bundle selections and restores Cordis configuration, portable files under `data/`, `suppliers/`, `config/` and `presets/`, and ordinary text configuration such as JSON, YAML and TOML elsewhere in the profile. The preview shows what will be skipped. Local package-manager policy (including `.npmrc`, `pnpm-workspace.yaml`, manifest scripts and build approvals), environment files and unmanaged scripts stay on this machine.
4. **Read the per-package results.** Only resolvable missing packages declared in the backup go to DSH’s installer. Plus does not upgrade installed versions or guess sources from bundle names or machine-local paths. A local dependency declaration does not prove the package is present: if the files are missing and DSH refuses the install, Plus reports that the package is still missing. It does not rename the package or bypass the installer. Check that entry in Plugins. Review pending builds separately there; this plugin never approves them. Re-preview to retry failures or replace an expired plan. If the plugin manager is unavailable, use the separate **configuration-only** operation. Restart DSH as indicated to activate restored settings or packages; a successful install does not prove live activation.

The advanced configuration-only sync and local JSON import retain upstream merge semantics: local-only files stay, other backed-up files may be overwritten, and the manifest unions dependencies and bundles (the incoming spec wins on a duplicate). Neither installs packages automatically. These are **not** the combined flow’s package-manager-preserving restore. **Undo reverts configuration files only**, not installed packages, downloads or build-script effects. Remove unwanted packages separately in DSH. Keep an independent offline backup.

### What travels and whom to trust

- The Gist filename (`dsh-profile-backup.json`) and document (`dsh-profile-backup` v0.2) are unchanged. Paste an upstream Gist ID/link into Plus; no re-export is needed. Plus remembers its own ID in `<profile>/.dsh-config-sync-plus/settings.json` and keeps `exports/` and `undo/` alongside it. It neither reads nor migrates the upstream plugin’s local history. If you bind both plugins to the same Gist, uploads will update the same backup file.
- **Secret means unlisted, not private or encrypted.** Anyone with the link can read the backup. Restore only trusted configuration and package sources: configuration can load code. Supply a token in the page, set `DSH_GITHUB_TOKEN` / `GITHUB_TOKEN` on the host, or sign in with `gh`. The plugin requires a token for Gist API calls; use one with Gist access (`gist` scope for a classic token) and owner authorization to update an existing Gist. The plugin does not store the token in settings or in the backup; avoid putting it in chat or logs.
- Upload sends profile text, including files such as `cordis.patch.yml`, `.npmrc`, JSON data and supplier definitions. Known credential databases and binaries are excluded; **secrets, usernames or paths embedded in ordinary text are not redacted**. Inspect the exported JSON before sharing, and provision credentials separately on the destination. Installed packages, `node_modules`, `pnpm-lock.yaml` and hidden directories do not travel. Usage counters (`data/usage.json`) are opt-in.
- Export omits machine-local `dependencies` specs (`link:`, `file:`, `portal:`, `workspace:`, absolute or relative paths) rather than inventing a version. This is not a blanket rewrite of arbitrary paths inside config files. Gist transfers use `api.github.com`; actual package installation can contact registries or Git hosts and run scripts already allowed by the destination profile.

## Interfaces

The fork has its own package and Cordis row, `dsh-profile-gist-sync-plus`, and its own HTTP prefix, `/dsh-profile-gist-sync-plus`. Paths below are **relative to that prefix**.

| Request | Purpose |
| --- | --- |
| `POST /api/sync/preview` with `{ id?, token? }` | Read a Gist and preview configuration and plugin changes on this machine. Returns a one-use `planId` when the manager is available; otherwise no install can be confirmed. No restore or installation. |
| `POST /api/sync/install` with `{ planId, confirm: true }` | After the user reviews the plan, restore that snapshot and attempt its eligible installations. Do not send a new Gist, dependency list, or build approval. |
| `GET /api/status`, `GET /api/export`, `POST /api/gist/upload` | Inspect the current profile, download a backup, or upload one. Status reports the resolved profile directory and `profileSource`; check these before writing. |
| `POST /api/settings`, `POST /api/gist/token` | Save the Gist ID or usage-counter preference (not the token), or report which token source answered. |
| `POST /api/gist/read`, `POST /api/file/read` | Read a backup from a Gist or from a path inside the DSH home and return the configuration-only preview. |
| `POST /api/sync`, `POST /api/preview`, `POST /api/restore` | Separate, configuration-only sync, preview, or restore; the explicit backup restore requires `confirm: true`. |
| `GET /api/plugins`, `POST /api/plugins/install` | Separate inventory / installation for the current profile, not confirmation of a Gist snapshot. |
| `POST /api/undo` | Revert the latest Plus configuration snapshot; never uninstall packages. |

Agent tool: **`config_backup_plus`**. Actions: `status`, `export`, `gist_upload`, `gist_read`, `restore`, `undo`. `gist_read` and `restore` preview by default; `apply: true` writes **configuration only**. Local exports stay in the fork’s exports directory. A tool restore from a file accepts paths inside the DSH home. There is **no tool action to install a plan, confirm on the user’s behalf, or grant build-script approvals**.

## Checks and credits

Run `node test/run.mjs` from a source checkout. The tests use temporary profiles, a stub GitHub API and a stub plugin manager; they do not need a live Gist or an installation into a user profile. The packaging check verifies that the tarball contains the runtime, locales, icons, tests, README and licence, without historical screenshots or machine state.

Upstream code and artwork: **Meta-Virgo**, [dsh-profile-gist-sync](https://github.com/Meta-Virgo/dsh-profile-gist-sync), [MIT licence](LICENSE). The [SVG icon](icon.svg) and [raster icon](assets/icon-256.png) are retained from upstream; the [raster generator](https://github.com/Meta-Virgo/dsh-profile-gist-sync/blob/71e696d/assets/make-icon.py) is also preserved in the source checkout. The historical screenshot in the repository depicts upstream, not this fork; no running screenshot is advertised or packed.

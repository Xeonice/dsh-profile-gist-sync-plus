# 多端配置同步 · Multi-device config sync

`dsh-multi-device-config-sync` 是「多端配置同步」的 npm 安装名。本插件是 [Meta-Virgo/dsh-profile-gist-sync](https://github.com/Meta-Virgo/dsh-profile-gist-sync) 的独立 fork，由 [Xeonice](https://github.com/Xeonice/dsh-profile-gist-sync-plus) 维护。新机器可以直接读取原版 Gist：先看会改哪些配置、会从哪里安装哪些插件，再决定是否恢复。

An independent [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin for backing up a profile to a GitHub Gist and setting up a second machine. **Preview the configuration changes and plugin sources first; restore and install only after confirmation.**

[中文说明](#中文说明) · [English guide](#english-guide) · [HTTP & agent tool](#interfaces) · [MIT](LICENSE)

## 中文说明

### 在另一台机器安装

1. 打开 DSH 的 **插件 → 添加插件**，输入 npm 包名 **`dsh-multi-device-config-sync`**，确认安装。要固定到本版，输入 `dsh-multi-device-config-sync@1.5.0`。安装公开包不用登录 npm，也不用复制 Git 提交地址。
2. 安装完成后点 **立即启用**。再打开 **设置 → 多端配置同步 → 从备份恢复**，粘贴已有备份链接。先看预览，取消不会写入。

**已经装过旧 Git 版？** `dsh-profile-gist-sync-plus`（原「配置同步 Plus」）与 npm 版是同一个插件的两个安装包，不能同时启用。先确认[公开 npm 版本](https://www.npmjs.com/package/dsh-multi-device-config-sync/v/1.5.0)在本机可访问，再在同一配置的插件管理中移除旧包、添加并启用新包；保留 `.dsh-config-sync-plus/` 目录，就能继续使用已有绑定和撤销记录。另一台机器全新安装不需要先装旧版。上游原版 `dsh-profile-gist-sync` 是另一个插件，不用移除。

命令行也可安装。将 `web` 换成目标配置名；使用 CLI 前先退出正在使用该配置的 DSH，Desktop 配置需已由应用初始化。

```sh
dsh plugin --profile web add dsh-multi-device-config-sync@1.5.0
```

### 迁移一台机器

| 在哪里 | 怎么做 | 会改变什么 |
| --- | --- | --- |
| 原机器 | 先在「更多 → 本地备份文件」导出 JSON 检查，再点 **备份本机**。看到「备份已就绪」后点 **复制链接**。 | 未绑定时创建不公开列出的 Gist；已有上传目标时会先显示将被更新的目标。 |
| 新机器 | 点 **从备份恢复**。没有关联目标就粘贴上一台的链接并查看预览；已关联时可直接查看或换来源。 | 预览列出具体文件的新增、覆盖、合并，以及会补装的插件和来源。取消不会写配置、安装插件或改变上传目标。 |
| 核对之后 | 有可补装项时，点 **恢复并安装 N 个插件**；仅有配置变化时，点 **确认恢复配置**。 | 使用刚看过的快照，不重新下载；没有改动就不写入。恢复来源不会替换本机的上传目标。 |

打开页面只读取本机状态，不访问 GitHub。首页不展示完整备份地址；需要分享时点「复制链接」，需要核对完整目标时进「更多 → 管理备份目标」或查看更新确认页。令牌输入框只在遇到访问问题时出现。

- **哪些配置会恢复？** 默认恢复流程合并 bundle 选择，恢复 Cordis 配置、`data/`、`suppliers/`、`config/`、`presets/` 下的可迁移文件，以及其他位置的普通 JSON、YAML、TOML 等文本配置。预览会列出跳过项；本机包管理策略（如 `.npmrc`、`pnpm-workspace.yaml`、manifest 脚本及构建授权）、环境文件和未托管的脚本保留不动。
- **同步插件本身不会随清单迁移。** 预览会标出备份清单里跳过的新旧同步包声明。已有 npm 包沿用本机的安装来源和启用选择；旧 Git 包不会被当作缺失插件重新加回。即使是「仅恢复配置」或本地 JSON 导入，这两项也不覆盖。
- **哪些插件会补装？** 只将备份声明且来源可解析的其他缺失项交给 DSH 安装器。不把依赖声明当成“已安装”，不升级已有版本，也不会为仅有 bundle 名或本地路径的条目猜 npm 包。如果本机已有依赖声明但实际缺包，且 DSH 拒绝安装，结果会显示仍未补齐；本插件不改包名，也不绕过安装器。请到 DSH 插件页核对该项。
- **查看每项结果。** 个别失败不等于全部完成。待批准的构建脚本要在 DSH 插件管理中单独审阅；本插件不代为批准。要重试或计划已过期，请重新预览。没有可用的插件管理服务时可从「更多」选择**仅恢复配置**，重新核对不同的文件范围。恢复后的配置或软件包可能要重启 DSH 才生效；安装成功不等于运行中的插件已经切换。
- **仅恢复配置/从本地 JSON 导入是独立操作。** 它们各自显示完整文件范围的预览并要求确认，而非直接写入，也不会继承标准预览的跳过规则。它们沿用上游的配置合并方式：本地独有文件保留，同名配置可能被覆盖，manifest 中的依赖和 bundle 名合并（除同步插件本身外，同名依赖采用备份规格）。不会自动补装插件；不要把默认流程对包管理设置的保护误认为适用于所有导入操作。
- **撤销只恢复本次真正写入的配置文件，不卸载软件包。** 预览中标为「不变」的文件不写入，也不纳入撤销；只有补装插件而没有配置变更时，不会创建空的撤销点。 已下载的依赖和构建脚本的副作用不在撤销范围；若需删除软件包，在 DSH 的插件管理中处理。保留自己的离线备份。

### 兼容性与保密

- 继续使用 `dsh-profile-backup.json`，格式为 `dsh-profile-backup` **v0.2**。已用上游插件备份？直接在新页面输入原 Gist 的链接，**不用重传**。本插件的设置、导出和撤销快照只存在目标配置下的 `.dsh-config-sync-plus/`；不会自动接管上游的 Gist 绑定或撤销历史。如果特意让两个插件指向同一个 Gist，以后上传会更新同一个文件。
- Gist 是 **secret（不公开列出），不是私密或加密存储**：持链接者可读。只恢复你信任的备份；其中可以包含可执行的供应商/插件配置和第三方软件来源。上传前检查实际导出的 JSON：凭据数据库（如 `data/auths/credentials.sqlite`）和二进制不会备份，但 `.npmrc`、环境文件、供应商设置或其他文本中手写的令牌、内网地址和本地路径**不是**自动脱敏的。凭据需要在新机单独配置。
- 包本体、`node_modules`、`pnpm-lock.yaml` 和隐藏目录不随备份传输；`data/usage.json` 默认不含，可显式选择。`dependencies` 中的 `link:`、`file:`、`portal:`、`workspace:` 或绝对/相对路径在导出时剔除；备份不附带该目录的代码，也不会凭空补出版本号。其他文本文件中的路径不会自动改写。
- 此插件调用 Gist API 需要有对应权限的 GitHub 令牌（经典令牌使用 `gist` scope；写入已有 Gist 要有其所有者的授权）。可用访问失败时页面展开的令牌栏、宿主环境 `DSH_GITHUB_TOKEN` / `GITHUB_TOKEN`、或已登录的 `gh`。插件不把令牌写入备份或设置；不要把令牌贴进聊天、日志或 Gist。Gist 传输使用 `api.github.com`；**安装包**则由 DSH 的包管理器访问对应的注册表或 Git 源，已有构建授权仍可能使脚本执行。

## English guide

### Install on another machine

In DSH, open **Plugins → Add plugin** and enter **`dsh-multi-device-config-sync`** (or `dsh-multi-device-config-sync@1.5.0` to pin this release). You do not need an npm login to install a public package. Choose **Enable now** once installation finishes, then open **Settings → Multi-device config sync → Restore from backup** and preview your existing backup link. For CLI installation, see the command above; substitute your profile name and stop DSH using that profile first.

**Switching from the Git edition?** The old `dsh-profile-gist-sync-plus` package and the new npm package implement the same plugin. Do not enable them together. First check that the [npm version](https://www.npmjs.com/package/dsh-multi-device-config-sync/v/1.5.0) is accessible. In the same profile, remove the old package in Plugins, then add and enable the new one. Leave `.dsh-config-sync-plus/` in place to keep the linked destination and undo history. The separate upstream `dsh-profile-gist-sync` plugin is unaffected.

### Back up, preview, confirm

1. **On the source machine**, inspect a JSON export under **More → Local backup files**, then choose **Back up this machine**. An unlinked machine creates an unlisted Gist; an existing destination is shown before updating. Choose **Copy link** on the inline receipt. The home page keeps the full destination out of view; use **More → Manage backup destination** or the update confirmation to inspect it.
2. **On the destination**, choose **Restore from backup**. Paste a trusted Gist link or ID if one has not been linked. With a linked destination, go straight to the preview or choose another source. Review file changes, already-present plugins, exact installation sources and items requiring manual setup. Previewing or cancelling neither writes profile files nor installs packages.
3. **Restore and install N plugins** applies the previewed snapshot, not a fresh download. If only files change, the action confirms configuration only; if nothing changes there is no write. Restoring from a source does not change your upload destination. It merges bundle selections and restores Cordis configuration, portable files under `data/`, `suppliers/`, `config/` and `presets/`, and ordinary text configuration such as JSON, YAML and TOML elsewhere in the profile. The preview shows what will be skipped. Local package-manager policy (including `.npmrc`, `pnpm-workspace.yaml`, manifest scripts and build approvals), environment files and unmanaged scripts stay on this machine.
4. **Read the per-package results.** Only resolvable missing packages declared in the backup go to DSH’s installer. The plugin does not upgrade installed versions or guess sources from bundle names or machine-local paths. A local dependency declaration does not prove the package is present: if the files are missing and DSH refuses the install, the plugin reports that the package is still missing. It does not rename the package or bypass the installer. Check that entry in Plugins. Review pending builds separately there; this plugin never approves them. Re-preview to retry failures or replace an expired plan. If the plugin manager is unavailable, use the separate **configuration-only** operation. Restart DSH as indicated to activate restored settings or packages; a successful install does not prove live activation.

The preview lists incoming declarations for this sync plugin (both its old Git name and its npm name) as skipped. The profile keeps its local choice of sync package, source and activation; a backup cannot reinstall the old edition through its manifest. This also applies to configuration-only and local imports.

The cloud configuration-only restore under **More** and the local JSON import each have their **own preview and confirmation**. Both retain upstream merge semantics: local-only files stay, other backed-up files may be overwritten, and the manifest unions dependencies and bundles (the incoming spec wins for duplicate third-party packages). Neither installs packages automatically. These are **not** the combined flow’s package-manager-preserving restore. **Undo reverts only the configuration files actually changed**, not installed packages, downloads or build-script effects. Files shown as unchanged are neither written nor added to undo; a packages-only restore creates no empty undo point. Remove unwanted packages separately in DSH. Keep an independent offline backup.

### What travels and whom to trust

- The Gist filename (`dsh-profile-backup.json`) and document (`dsh-profile-backup` v0.2) are unchanged. Paste an upstream Gist ID or link into the restore page; no re-export is needed. This plugin remembers its own ID in `<profile>/.dsh-config-sync-plus/settings.json` and keeps `exports/` and `undo/` alongside it. It neither reads nor migrates the upstream plugin’s local history. If you bind both plugins to the same Gist, uploads will update the same backup file.
- **Secret means unlisted, not private or encrypted.** Anyone with the link can read the backup. Restore only trusted configuration and package sources: configuration can load code. Supply a token in the page, set `DSH_GITHUB_TOKEN` / `GITHUB_TOKEN` on the host, or sign in with `gh`. The plugin requires a token for Gist API calls; use one with Gist access (`gist` scope for a classic token) and owner authorization to update an existing Gist. The plugin does not store the token in settings or in the backup; avoid putting it in chat or logs.
- Upload sends profile text, including files such as `cordis.patch.yml`, `.npmrc`, JSON data and supplier definitions. Known credential databases and binaries are excluded; **secrets, usernames or paths embedded in ordinary text are not redacted**. Inspect the exported JSON before sharing, and provision credentials separately on the destination. Installed packages, `node_modules`, `pnpm-lock.yaml` and hidden directories do not travel. Usage counters (`data/usage.json`) are opt-in.
- Export omits machine-local `dependencies` specs (`link:`, `file:`, `portal:`, `workspace:`, absolute or relative paths) rather than inventing a version. This is not a blanket rewrite of arbitrary paths inside config files. Gist transfers use `api.github.com`; actual package installation can contact registries or Git hosts and run scripts already allowed by the destination profile.

## Interfaces

Install the npm package `dsh-multi-device-config-sync`. For compatibility its Cordis row, Settings section and HTTP prefix still use `dsh-profile-gist-sync-plus`. Paths below are **relative to `/dsh-profile-gist-sync-plus`**.

| Request | Purpose |
| --- | --- |
| `POST /api/sync/preview` with `{ id?, token? }` | Read a Gist and preview configuration and plugin changes on this machine. Returns a one-use `planId` when the manager is available; otherwise no install can be confirmed. No restore or installation. |
| `POST /api/sync/install` with `{ planId, confirm: true }` | After the user reviews the plan, restore that snapshot and attempt its eligible installations. Do not send a new Gist, dependency list, or build approval. |
| `POST /api/config/preview` with `{ id?, token? }` | Read the **full configuration-only** scope (including applicable package-manager files). Returns `{ planId, ref, preview }`. No writes, package inventory or installation. |
| `POST /api/config/restore` with `{ planId, confirm: true }` | Restore exactly that full-scope snapshot without packages. The two modes use separate one-use plans; stale plans must be previewed again. |
| `GET /api/status`, `GET /api/export`, `POST /api/gist/upload` | Inspect the current profile, download a backup, or upload one. The page sends `expectedTarget` on upload (an ID or `null` for a new Gist); a different resolved destination is refused before upload. Status reports the profile and `profileSource`. |
| `POST /api/settings`, `POST /api/gist/token` | Save the Gist ID or usage-counter preference (not the token), or report which token source answered. |
| `POST /api/gist/read`, `POST /api/file/read` | Read a backup from a Gist or from a path inside the DSH home and return the configuration-only preview. |
| `POST /api/preview`, `POST /api/restore` | For local JSON the page requests a separate one-use plan with `{ backup, reviewed: true }`, then sends `{ planId, confirm: true }`. Changes to the target invalidate the plan. Older explicit-document callers remain compatible. |
| `POST /api/sync` | Legacy immediate configuration-only sync, retained for compatibility. The settings page never calls this endpoint. |
| `GET /api/plugins`, `POST /api/plugins/install` | Inspect or separately install the **local** profile’s missing declarations. The page passes `expectedPackages` from that review; a new name or changed source cannot be installed in its place. |
| `POST /api/undo` | Revert this plugin’s latest configuration snapshot; never uninstall packages. The page sends `expectedStamp` to avoid undoing a different snapshot. |

Agent tool: **`config_backup_plus`**. Actions: `status`, `export`, `gist_upload`, `gist_read`, `restore`, `undo`. `gist_read` and `restore` preview by default; `apply: true` writes **configuration only**. Local exports stay in the fork’s exports directory. A tool restore from a file accepts paths inside the DSH home. There is **no tool action to install a plan, confirm on the user’s behalf, or grant build-script approvals**.

## Checks and credits

Run `node test/run.mjs` from a source checkout. The tests use temporary profiles, a stub GitHub API and a stub plugin manager; they do not need a live Gist or an installation into a user profile. The packaging check verifies that the tarball contains the runtime, locales, icons, tests, README and licence, without historical screenshots or machine state.

Upstream code and artwork: **Meta-Virgo**, [dsh-profile-gist-sync](https://github.com/Meta-Virgo/dsh-profile-gist-sync), [MIT licence](LICENSE). The [SVG icon](icon.svg) and [raster icon](assets/icon-256.png) are retained from upstream; the [raster generator](https://github.com/Meta-Virgo/dsh-profile-gist-sync/blob/71e696d/assets/make-icon.py) is also preserved in the source checkout. The historical screenshot in the repository depicts upstream, not this fork; no running screenshot is advertised or packed.

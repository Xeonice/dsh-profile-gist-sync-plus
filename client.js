/**
 * Browser half of dsh-profile-gist-sync-plus: one page inside Settings → Built-in plugins.
 *
 * A new machine previews a Gist snapshot, then confirms that specific plan
 * once. Upload, config-only sync, local file restore and undo remain separate.
 *
 * The page renders into the slot the Plugins section declares
 * (`settings.plugins.tab`), uses the host's theme tokens for every visible
 * colour, and talks to the Host half only through that half's HTTP routes.
 */
window.__ModuleLoader__.load({
  id: 'dsh-profile-gist-sync-plus',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'dsh-profile-gist-sync-plus'
    const API = '/dsh-profile-gist-sync-plus/api'
    const TAB_ORDER = 71

    /** UI strings. English is the fallback every other locale resolves to. */
    const DICT = {
      zh: {
        tab: '配置同步 Plus',
        title: '配置同步 Plus',
        subtitle: '从已有 Gist 恢复这台机器，或把本机配置备份到 Gist。',
        setupTitle: '新机恢复：配置和插件',
        setupHint: '填入旧机的 Gist ID 或链接，无需先保存。预览只读取备份，不写配置、不安装插件。',
        previewAction: '预览恢复',
        previewBusy: '正在读取 Gist 和插件清单…',
        previewTitle: '恢复预览',
        previewSource: '来源 Gist',
        previewTarget: '目标 profile',
        previewChanges: '配置文件变更',
        previewFiles: '查看文件和保留项',
        previewInstall: '将安装的插件',
        previewSkip: '不支持，将跳过',
        previewNone: '无需下载新的插件包。',
        alreadyEnable: '已安装，将加入启用清单',
        alreadyOther: '其他已安装的包',
        specLabel: '来源 / 安装规格',
        noSpec: '没有可显示的安装来源',
        snapshotHint: '确认仅使用本次预览的快照。若预览过期或本机状态改变，请重新预览。',
        trustHint: '仅在信任此 Gist 和所列安装来源时确认。配置和插件可能运行代码，并影响此 profile 的所有会话。本次确认不会批准新的构建脚本。',
        undoLimit: '撤销只还原配置文件，不会卸载已安装的包。',
        unavailablePlan: '无法核实待安装的包，不能确认组合恢复。若取消后选择「仅同步配置」，将按原版的完整文件恢复规则写入配置，不沿用此预览的跳过清单；备份中的 .npmrc 等文件也会写入。仅在信任整份备份时使用。',
        confirmAction: '确认恢复配置并安装插件',
        installBusy: '正在恢复配置并安装插件，请勿重复操作…',
        restoreDone: '已按预览恢复配置和插件',
        restoreAttention: '恢复结果：仍有事项需处理',
        configRestored: '已恢复配置文件',
        warningsTitle: '提醒',
        pluginResultTitle: '插件安装结果',
        pluginResultUnknown: '无法核实完整的插件安装结果。',
        stillMissing: '仍缺少的包',
        'reason.no-plugin-manager': '未提供插件管理服务',
        'reason.plugin-manager-error': '读取插件清单失败',
        pendingBuilds: '待批准构建脚本',
        buildHint: '请到「插件」页核对脚本来源，需要时单独批准。',
        retryHint: '处理报告中的事项后，可重新预览，检查是否还缺插件。',
        uncertainResult: '未取得可核实的恢复结果。请先检查本机状态和撤销记录；若要重试，请重新预览。',
        refreshFailed: '未能刷新本机状态，请重新打开此页。',
        statusTitle: '备份状态',
        recheck: '重新检查',
        openCloud: '打开云端备份',
        profileLabel: '本机 profile',
        filesLabel: '配置文件',
        lastUpload: '上次上传',
        lastSync: '上次同步',
        never: '还没有过',
        needRestart: '这个插件刚更新过：重启 DSH 之后，上传和同步按钮才能用。',
        hostMissing: '当前无法读取本机配置状态。',
        retryStatus: '重新读取状态',
        cloudNone: '尚未关联 Gist。要恢复旧机的配置，请在上方输入已有的 Gist；要备份本机，请选择「上传到云端」。',
        cloudSame: '云端配置文件与本机一致。插件安装状态单独列出。',
        cloudDiffers: '云端与本机配置不同：',
        cloudDiffersFiles: '个文件',
        cloudDiffersHint: '可在上方预览恢复，也可只同步配置。',
        cloudUnreachable: '暂时读不到云端备份',
        notChecked: '还没检查云端。',
        checking: '正在检查云端…',
        uploadTitle: '备份本机配置',
        uploadHint: '上传到已关联的 Gist 会覆盖旧备份。只备份配置，不含插件本体或凭据库。secret Gist 不公开列出，但持有链接的人仍可读取。',
        uploadTarget: '上传目标',
        newGist: '新建 secret Gist',
        uploadAction: '上传到云端',
        exportAction: '另存为本地文件',
        uploaded: '✓ 已上传',
        droppedTitle: '没上传的本机依赖',
        droppedHint: '它们是本机路径，传到别的电脑只会指向不存在的目录。那边同步时会保留原有的写法。',
        filesUnit: '个文件',
        countsOverwrite: '覆盖',
        countsAdd: '新增',
        countsIdentical: '不变',
        countsMerge: '合并',
        syncTitle: '仅同步配置与单独补装',
        syncHint: '仅同步会立即按原版的完整文件恢复规则写入配置，不安装插件。上方组合恢复预览的跳过清单不适用：若备份含 .npmrc 等文件，本机对应文件会被写入或覆盖。本机独有的文件保留，插件清单取并集。',
        syncAction: '仅同步配置',
        synced: '✓ 已同步',
        syncedSkipped: '，跳过',
        syncedSkippedUnit: '项（凭据库等不写入）',
        restartHint: '重启 DSH 后生效。',
        undoAction: '撤销上次配置恢复',
        undoAvailable: '可撤销：',
        undone: '✓ 已还原',
        advanced: '高级设置',
        gistIdLabel: 'Gist ID 或链接',
        gistIdPlaceholder: '粘贴备份的 Gist ID 或链接',
        save: '记住上方 Gist ID',
        saveHint: '保存上方的 Gist 作为上传目标；清空后再保存，下次上传会新建 Gist。',
        saved: '✓ 已保存',
        gistIdHint: '这些设置不会进入备份，记在这里：',
        profileLocation: '本机 profile：',
        tokenLabel: 'GitHub 令牌（一般不用填）',
        tokenPlaceholder: '留空就用本机 gh 登录或环境变量',
        tokenCheck: '检测令牌',
        tokenHint: '令牌不会保存，只随需要访问 GitHub 的请求发送。确认安装时不会再次发送。',
        tokenOk: '✓ 已核实账号：',
        tokenUnverified: '已找到令牌，但未能核实 GitHub 账号：',
        includeMachine: '备份时带上本机用量统计（data/usage.json）',
        pickFile: '从备份文件恢复…',
        pendingTitle: '待恢复的备份文件',
        pendingPlan: '将写入',
        importConfirm: '确认恢复',
        cancel: '取消',
        imported: '✓ 已恢复',
        showFiles: '显示文件清单',
        hideFiles: '收起文件清单',
        excludedLabel: '已排除',
        filesEmpty: '没有可备份的配置文件。',
        excludedEmpty: '没有排除任何文件。',
        limits: '上限：整份备份 2 MB，Gist 单文件 1 MB。',
        busy: '处理中…',
        'code.dependency': '依赖目录',
        'code.lockfile': '锁文件',
        'code.hidden-dir': '隐藏目录',
        'code.backup-copy': '备份副本',
        'code.symlink': '符号链接',
        'code.machine-state': '本机用量',
        'code.credential': '凭据库',
        'code.binary': '二进制',
        'code.too-large': '文件过大',
        'code.tool-state': '临时状态',
        'code.local-dependency': '本机路径依赖',
        'code.local-policy': '按本机策略保留，不覆盖',
        'err.stale-plan': '此预览已失效或已使用。请重新预览，再确认最新清单。',
        'err.busy': '另一项恢复或安装正在进行，请稍后重新预览。',
        'err.bad-response': '未收到完整报告，无法核实操作结果。',
        'err.auth': [
          'GitHub 拒绝此请求。请核对令牌是否有效、是否具有 gist 权限；写入备份还需对该 Gist 有写权限。',
          '',
          '三种给令牌的方法，选一种：',
          '1. 在本页「GitHub 令牌」填入本次请求的令牌，不会保存；',
          '2. 在启动 DSH 的环境里设 DSH_GITHUB_TOKEN，然后重启 DSH；',
          '3. 装过 GitHub CLI 的话执行 gh auth login，插件会自动取 gh auth token。',
          '',
          '令牌要勾上 gist 权限：GitHub → Settings → Developer settings →',
          'Personal access tokens → Tokens (classic) → Generate new token。',
          '勾好 gist 的直达链接：https://github.com/settings/tokens/new?scopes=gist&description=DSH%20config%20sync',
        ].join('\n'),
        'err.notfound': '找不到指定资源。请核对 Gist ID 或链接，并检查访问权限。',
        'err.rate-limit': 'GitHub 限流或权限不足，请稍后再试。',
        'err.invalid': '备份内容不合法，无法恢复。',
        'err.too-large': '备份超出大小上限。',
        'err.timeout': '访问 GitHub 超时。',
        'err.network': '连不上 GitHub。',
        'err.no-profile': '这个 DSH 进程没有以 profile 启动，没有配置可备份。',
        'err.no-cloud': '请先填入已有备份的 Gist ID 或链接。如果要备份本机，请另选「上传到云端」。',
        'err.unsafe-path': '备份里有不安全的路径，已拒绝恢复。',
        'err.nothing-to-undo': '没有可以撤销的同步。',
        'err.invalidJson': '这不是合法的 JSON 文件。',
        'err.other': '操作失败。',
        'source.request': '本次填写',
        'source.env': '环境变量',
        'source.gh': 'gh CLI',
        pluginsTitle: '插件',
        pluginsHint: '备份不带插件本体。同步之后这里会列出还差的插件。',
        pluginsChecking: '正在看还缺哪些插件…',
        pluginsUnknown: '无法核实本机缺少哪些插件。',
        pluginsUnknownHint: '请到「插件」页查看已安装的包，并核对备份清单。',
        pluginsAllPresent: '✓ 清单里声明的插件，这台机器上都有。',
        pluginsMissing: '还差',
        pluginsMissingUnit: '个插件没装',
        pluginUnresolvedUnit: '个本机装不了',
        pluginsInstall: '安装缺的插件',
        pluginsInstalling: '正在安装…',
        pluginsInstalledCount: '已安装',
        pluginsPresentCount: '本来就有',
        pluginsFailedCount: '失败',
        pluginsSkippedCount: '跳过',
        pluginsRestart: '装完重启 DSH 才会生效。',
        'note.local-path': '本机路径，无法自动安装',
        'note.workspace-protocol': 'workspace: 声明，无法在新机上解析',
        'note.missing-source': '未记录可核实的安装来源',
        'note.unsupported-source': '此来源不支持自动安装',
        'note.invalid-name': '包名无效',
        'note.stale-plan': '安装清单已改变，请重新预览',
        newMachineTitle: '在新机器上使用',
        newMachineStep1: '从旧机复制备份的 Gist ID 或链接，填到此页上方。',
        newMachineStep2: '使用具备 gist 权限的 GitHub 令牌，或使用本机已登录的 gh CLI。',
        newMachineStep3: '选择「预览恢复」，核对变更和插件来源，再确认。',
        newMachineStep4: '检查结果。手动处理不支持或失败的包；如需重启，请重启 DSH。',
      },
      en: {
        tab: 'Config sync Plus',
        title: 'Config sync Plus',
        subtitle: 'Restore this machine from an existing Gist, or back up its configuration to a Gist.',
        setupTitle: 'Set up this machine from a Gist',
        setupHint: 'Enter the Gist ID or link from the other machine. No need to save it first. A preview reads the backup without writing files or installing packages.',
        previewAction: 'Preview restore',
        previewBusy: 'Reading the Gist and checking plugins…',
        previewTitle: 'Restore preview',
        previewSource: 'Source Gist',
        previewTarget: 'Target profile',
        previewChanges: 'Config file changes',
        previewFiles: 'View files and exclusions',
        previewInstall: 'Plugins to install',
        previewSkip: 'Unsupported — will skip',
        previewNone: 'No new plugin packages need downloading.',
        alreadyEnable: 'Already installed — will be added to the enabled bundle list',
        alreadyOther: 'Other already-installed packages',
        specLabel: 'Source / install spec',
        noSpec: 'No install source available to display',
        snapshotHint: 'Confirmation uses only this previewed snapshot. Preview again if it expires or local state changes.',
        trustHint: 'Confirm only if you trust this Gist and the listed package sources. Configuration and plugins can run code and affect every session in this profile. This does not approve new build scripts.',
        undoLimit: 'Undo restores configuration files only. It does not uninstall packages.',
        unavailablePlan: 'The packages to install could not be verified. If you cancel and choose “Sync config only”, the original full-file restore rules apply instead of this preview’s skip list. Files such as .npmrc will be written if present in the backup. Use this only if you trust the entire backup.',
        confirmAction: 'Confirm restore and install plugins',
        installBusy: 'Restoring configuration and installing plugins. Please do not repeat the request…',
        restoreDone: 'Configuration and plugins restored as previewed',
        restoreAttention: 'Restore needs attention',
        configRestored: 'Configuration files restored',
        warningsTitle: 'Warnings',
        pluginResultTitle: 'Plugin installation results',
        pluginResultUnknown: 'The full plugin installation result could not be verified.',
        stillMissing: 'Packages still missing',
        'reason.no-plugin-manager': 'plugin manager unavailable',
        'reason.plugin-manager-error': 'plugin inventory could not be read',
        pendingBuilds: 'Build scripts awaiting approval',
        buildHint: 'Review these scripts on the Plugins page and approve them separately if needed.',
        retryHint: 'After addressing the items in this report, preview again to check what is still missing.',
        uncertainResult: 'No verifiable restore result was received. Check the local status and undo history before retrying with a new preview.',
        refreshFailed: 'Local status could not be refreshed. Reopen this page to check it.',
        statusTitle: 'Backup status',
        recheck: 'Check again',
        openCloud: 'Open the cloud copy',
        profileLabel: 'Profile',
        filesLabel: 'Config files',
        lastUpload: 'Last upload',
        lastSync: 'Last sync',
        never: 'never',
        needRestart: 'This plugin was just updated: restart DSH, then the upload and sync buttons will work.',
        hostMissing: 'Local configuration status is unavailable.',
        retryStatus: 'Retry local status',
        cloudNone: 'No Gist is linked. To restore another machine’s backup, enter its Gist above. To back up this machine, choose “Upload to cloud”.',
        cloudSame: 'The cloud configuration files match this machine. Plugin status is listed separately.',
        cloudDiffers: 'Cloud and local configurations differ:',
        cloudDiffersFiles: 'files differ from this machine',
        cloudDiffersHint: 'Preview the restore above, or sync configuration only.',
        cloudUnreachable: 'The cloud copy could not be read',
        notChecked: 'The cloud has not been checked yet.',
        checking: 'Checking the cloud…',
        uploadTitle: 'Back up this machine',
        uploadHint: 'Uploading to a linked Gist overwrites its previous backup. Configuration only — no plugin packages or credential stores. A secret Gist is unlisted; anyone with the link can read it.',
        uploadTarget: 'Upload target',
        newGist: 'Create a new secret Gist',
        uploadAction: 'Upload to cloud',
        exportAction: 'Save as a local file',
        uploaded: '✓ Uploaded',
        droppedTitle: 'machine-local dependencies left out',
        droppedHint: 'They are paths on this machine; on another computer they would point at a directory that is not there. A sync there keeps whatever it already has.',
        filesUnit: 'files',
        countsOverwrite: 'overwrite',
        countsAdd: 'add',
        countsIdentical: 'unchanged',
        countsMerge: 'merge',
        syncTitle: 'Sync configuration or install plugins separately',
        syncHint: 'Sync config only immediately restores files under the original full-file rules without installing packages. The combined preview’s skip list does not apply: files such as .npmrc are written or overwritten if present in the backup. Local-only files stay, and the plugin lists are merged.',
        syncAction: 'Sync config only',
        synced: '✓ Synced',
        syncedSkipped: ', skipped',
        syncedSkippedUnit: 'entries (a credential store is never written)',
        restartHint: 'Restart DSH to apply.',
        undoAction: 'Undo last config restore',
        undoAvailable: 'Can be undone: ',
        undone: '✓ Reverted',
        advanced: 'Advanced',
        gistIdLabel: 'Gist ID or link',
        gistIdPlaceholder: 'Paste the Gist ID or link to your backup',
        save: 'Remember Gist ID above',
        saveHint: 'Save the Gist above as the upload target. Clear it and save to create a new Gist on the next upload.',
        saved: '✓ Saved',
        gistIdHint: 'These settings never enter a backup; they live at: ',
        profileLocation: 'This machine\u2019s profile: ',
        tokenLabel: 'GitHub token (usually unnecessary)',
        tokenPlaceholder: 'Empty uses this machine’s gh login or environment',
        tokenCheck: 'Check token',
        tokenHint: 'The token is not saved. Only requests that access GitHub include it; confirming the installation does not.',
        tokenOk: '✓ Account verified: ',
        tokenUnverified: 'Token found; GitHub account could not be verified: ',
        includeMachine: "Include this machine's usage counters (data/usage.json)",
        pickFile: 'Restore from a backup file…',
        pendingTitle: 'Backup file ready to restore',
        pendingPlan: 'Will write',
        importConfirm: 'Restore now',
        cancel: 'Cancel',
        imported: '✓ Restored',
        showFiles: 'Show file list',
        hideFiles: 'Hide file list',
        excludedLabel: 'Excluded',
        filesEmpty: 'No configuration files to back up.',
        excludedEmpty: 'Nothing was excluded.',
        limits: 'Limits: 2 MB per backup, 1 MB per Gist file.',
        busy: 'Working…',
        'code.dependency': 'dependency',
        'code.lockfile': 'lockfile',
        'code.hidden-dir': 'hidden dir',
        'code.backup-copy': 'backup copy',
        'code.symlink': 'symlink',
        'code.machine-state': 'machine state',
        'code.credential': 'credential store',
        'code.binary': 'binary',
        'code.too-large': 'too large',
        'code.tool-state': 'tool state',
        'code.local-dependency': 'machine-local dependency',
        'code.local-policy': 'kept on this machine by local policy',
        'err.stale-plan': 'This preview expired, changed, or has already been used. Preview again before confirming.',
        'err.busy': 'Another restore or installation is in progress. Preview again when it finishes.',
        'err.bad-response': 'The host returned an incomplete report. The result cannot be verified.',
        'err.auth': [
          'GitHub refused the request. Check the token and its gist scope. Uploads need write access to the Gist.',
          '',
          'Three ways to give it one, pick one:',
          '1. enter a GitHub token on this page for the request; it is not saved;',
          '2. set DSH_GITHUB_TOKEN in the environment DSH starts with, then restart DSH;',
          '3. if the GitHub CLI is installed, run gh auth login — this plugin reads gh auth token.',
          '',
          'The token needs the gist scope: GitHub → Settings → Developer settings →',
          'Personal access tokens → Tokens (classic) → Generate new token.',
          'Direct link with gist pre-ticked: https://github.com/settings/tokens/new?scopes=gist&description=DSH%20config%20sync',
        ].join('\n'),
        'err.notfound': 'Resource not found. Check the Gist ID or link and your access to it.',
        'err.rate-limit': 'GitHub rate-limited the request or the token lacks scope.',
        'err.invalid': 'That backup is not valid, so it was not restored.',
        'err.too-large': 'The backup is over the size limit.',
        'err.timeout': 'The GitHub request timed out.',
        'err.network': 'GitHub is unreachable.',
        'err.no-profile': 'This DSH process was not started with a profile, so there is nothing to back up.',
        'err.no-cloud': 'Enter the ID or link of your existing Gist. To back up this machine instead, choose “Upload to cloud”.',
        'err.unsafe-path': 'The backup contains an unsafe path, so the restore was refused.',
        'err.nothing-to-undo': 'There is no sync to undo.',
        'err.invalidJson': 'That file is not valid JSON.',
        'err.other': 'The operation failed.',
        'source.request': 'entered here',
        'source.env': 'environment variable',
        'source.gh': 'gh CLI',
        pluginsTitle: 'Plugins',
        pluginsHint: 'A backup never carries plugin packages. After a sync, what is still missing is listed here.',
        pluginsChecking: 'Checking which plugins are missing…',
        pluginsUnknown: 'The missing plugins on this machine could not be verified.',
        pluginsUnknownHint: 'Check the installed packages on the Plugins page against the backup manifest.',
        pluginsAllPresent: '✓ Every plugin the manifest declares is on this machine.',
        pluginsMissing: 'Missing:',
        pluginsMissingUnit: 'plugins not installed',
        pluginUnresolvedUnit: 'cannot be installed here',
        pluginsInstall: 'Install the missing plugins',
        pluginsInstalling: 'Installing…',
        pluginsInstalledCount: 'installed',
        pluginsPresentCount: 'already there',
        pluginsFailedCount: 'failed',
        pluginsSkippedCount: 'skipped',
        pluginsRestart: 'Restart DSH after installing for them to take effect.',
        'note.local-path': 'a local path — this machine cannot install it',
        'note.workspace-protocol': 'a workspace: declaration — this machine cannot install it',
        'note.missing-source': 'no verifiable install source was recorded',
        'note.unsupported-source': 'this source is not supported for automatic installation',
        'note.invalid-name': 'invalid package name',
        'note.stale-plan': 'install list changed — preview again',
        newMachineTitle: 'Using this on a new machine',
        newMachineStep1: 'Copy the backup Gist ID or link from the other machine into the field above.',
        newMachineStep2: 'Use a GitHub token with the gist scope or a signed-in local gh CLI.',
        newMachineStep3: 'Choose “Preview restore”, check the changes and package sources, then confirm.',
        newMachineStep4: 'Review the results. Resolve unsupported or failed packages manually and restart DSH if requested.',
      },
    }

    const CSS = `
.dpgsp-root { display:flex; flex-direction:column; gap:14px; padding:2px 2px 28px; color:var(--dsw-alias-label-primary); font-size:13px; line-height:1.6; }
.dpgsp-head h2 { margin:0 0 2px; font-size:15px; font-weight:600; }
.dpgsp-head p { margin:0; color:var(--dsw-alias-label-secondary); font-size:12.5px; }
.dpgsp-card { border:1px solid var(--dsw-alias-border-l1); border-radius:12px; background:var(--dsw-alias-bg-layer-1); padding:14px 16px; display:flex; flex-direction:column; gap:10px; }
.dpgsp-cardtitle { font-size:13.5px; font-weight:600; }
.dpgsp-hint { color:var(--dsw-alias-label-secondary); font-size:12.5px; }
.dpgsp-verdict { border-radius:10px; padding:9px 12px; border:1px solid var(--dsw-alias-border-l2); font-size:13px; }
.dpgsp-ok { border-color:var(--dsw-alias-state-success-primary); color:var(--dsw-alias-label-primary); }
.dpgsp-warn { border-color:var(--dsw-alias-state-warn-primary); color:var(--dsw-alias-label-primary); }
.dpgsp-muted { color:var(--dsw-alias-label-secondary); }
.dpgsp-facts { display:flex; flex-direction:column; gap:2px; }
.dpgsp-row { display:flex; gap:10px; font-size:12.5px; }
.dpgsp-row .dpgsp-key { flex:0 0 96px; color:var(--dsw-alias-label-secondary); }
.dpgsp-row .dpgsp-val { min-width:0; word-break:break-all; }
.dpgsp-actions { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.dpgsp-btn { appearance:none; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); border-radius:8px; padding:7px 14px; font-size:12.5px; font-family:inherit; cursor:pointer; text-decoration:none; }
.dpgsp-btn:hover:not(:disabled) { border-color:var(--dsw-alias-brand-primary); }
.dpgsp-btn:disabled { opacity:.55; cursor:default; }
.dpgsp-btn-primary { background:var(--dsw-alias-button-primary-fill); border-color:var(--dsw-alias-button-primary-fill); color:var(--dsw-alias-label-primary-foreground); }
.dpgsp-btn-link { border-color:transparent; background:transparent; padding:2px 4px; color:var(--dsw-alias-brand-primary); }
.dpgsp-field { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.dpgsp-field .dpgsp-key { flex:0 0 150px; color:var(--dsw-alias-label-secondary); font-size:12.5px; }
.dpgsp-input { flex:1 1 260px; min-width:0; border:1px solid var(--dsw-alias-border-l1); border-radius:8px; background:var(--dsw-alias-bg-base); color:var(--dsw-alias-label-primary); padding:6px 10px; font-size:12.5px; font-family:inherit; }
.dpgsp-input:focus { outline:none; border-color:var(--dsw-alias-brand-primary); }
.dpgsp-check { display:flex; align-items:center; gap:8px; color:var(--dsw-alias-label-secondary); font-size:12.5px; cursor:pointer; }
.dpgsp-notice { border-radius:10px; padding:9px 12px; border:1px solid var(--dsw-alias-border-l2); font-size:12.5px; white-space:pre-wrap; word-break:break-word; }
.dpgsp-notice-ok { border-color:var(--dsw-alias-state-success-primary); }
.dpgsp-notice-warn { border-color:var(--dsw-alias-state-warn-primary); }
.dpgsp-notice-error { border-color:var(--dsw-alias-state-error-primary); color:var(--dsw-alias-label-primary); }
.dpgsp-link { color:var(--dsw-alias-brand-primary); text-decoration:none; word-break:break-all; font-size:12.5px; }
.dpgsp-details { border-top:1px dashed var(--dsw-alias-border-l1); padding-top:10px; }
.dpgsp-details summary { cursor:pointer; color:var(--dsw-alias-label-secondary); font-size:12.5px; }
.dpgsp-advbody { display:flex; flex-direction:column; gap:12px; padding-top:12px; }
.dpgsp-list { margin:0; padding:0; list-style:none; max-height:200px; overflow:auto; border-top:1px dashed var(--dsw-alias-border-l1); }
.dpgsp-list li { display:flex; gap:10px; justify-content:space-between; padding:2px 0; border-bottom:1px dashed var(--dsw-alias-border-l1); font-size:12px; }
.dpgsp-path { font-family:inherit; word-break:break-all; }
.dpgsp-dim { color:var(--dsw-alias-label-secondary); flex:0 0 auto; }
.dpgsp-sub { display:flex; flex-direction:column; gap:6px; padding-top:8px; border-top:1px dashed var(--dsw-alias-border-l1); }
.dpgsp-subtitle { font-size:12.5px; font-weight:600; }
.dpgsp-steps { margin:0; padding-left:18px; display:flex; flex-direction:column; gap:4px; color:var(--dsw-alias-label-secondary); font-size:12.5px; }
.dpgsp-busy { color:var(--dsw-alias-label-secondary); }
.dpgsp-setup { border-color:var(--dsw-alias-brand-primary); }
.dpgsp-card h3, .dpgsp-card h4 { margin:0; }
.dpgsp-note-list { margin:0; padding-left:20px; overflow-wrap:anywhere; }
.dpgsp-package { display:flex; flex-direction:column; gap:2px; min-width:0; overflow-wrap:anywhere; white-space:pre-wrap; }
.dpgsp-package code { font-family:monospace; unicode-bidi:isolate; }
.dpgsp-root { min-width:0; overflow-wrap:anywhere; }
@media (max-width:550px) { .dpgsp-field .dpgsp-key { flex-basis:100%; } }
`

    /** One Host route call; a failed answer becomes an error with its code. */
    async function api(path, init) {
      const response = await fetch(`${API}${path}`, {
        credentials: 'same-origin',
        ...init,
        headers: init?.body === undefined ? init?.headers : { 'content-type': 'application/json', ...init?.headers },
        body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      })
      let payload = null
      try {
        payload = await response.json()
      } catch {
        payload = null
      }
      if (!response.ok) {
        const error = new Error(payload?.error ?? `HTTP ${response.status}`)
        error.code = payload?.code ?? 'other'
        throw error
      }
      if (payload === null || typeof payload !== 'object') throw badResponse()
      return payload
    }

    function badResponse() {
      return Object.assign(new Error(''), { code: 'bad-response' })
    }

    function hasCounts(counts) {
      return ['add', 'overwrite', 'merge', 'identical'].every(key => Number.isSafeInteger(counts?.[key]) && counts[key] >= 0)
    }

    function hasCandidateList(inventory) {
      return inventory?.available === true && Array.isArray(inventory.missing) && inventory.missing.every(entry =>
        typeof entry?.name === 'string' && typeof entry.resolvable === 'boolean'
        && (entry.spec == null || typeof entry.spec === 'string')
        && (entry.resolvable ? typeof entry.installSpec === 'string' && entry.installSpec.trim() !== '' : entry.installSpec === null),
      )
    }

    const FILE_STATUSES = { add: 'countsAdd', overwrite: 'countsOverwrite', merge: 'countsMerge', identical: 'countsIdentical' }
    function hasFilePlan(preview) {
      return hasCounts(preview?.counts) && Array.isArray(preview.files) && Array.isArray(preview.dropped)
        && preview.files.every(file => typeof file?.path === 'string' && Object.hasOwn(FILE_STATUSES, file.status))
        && preview.dropped.every(file => typeof file?.path === 'string' && typeof file.code === 'string')
    }

    /** Accept a read-only explanation without a plan ID, but not a blind confirmation. */
    function validPreview(plan) {
      return typeof plan?.ref?.id === 'string' && plan.ref.id !== '' && typeof plan.preview?.profile === 'string'
        && hasFilePlan(plan.preview) && (plan.plugins?.available === false && plan.planId === null
          || hasCandidateList(plan.plugins) && typeof plan.planId === 'string' && plan.planId.trim() !== '')
    }

    function configSummary(counts, t) {
      return `${t('countsAdd')} ${counts.add} · ${t('countsOverwrite')} ${counts.overwrite} · ${t('countsMerge')} ${counts.merge} · ${t('countsIdentical')} ${counts.identical}`
    }

    /** Human-readable size. */
    function formatBytes(bytes) {
      if (!Number.isFinite(bytes)) return '—'
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }

    /** Absolute time, in the reader's own locale. */
    function formatTime(value) {
      if (typeof value !== 'string' || value === '') return '—'
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
    }

    function Panel(props) {
      const { ctx, t } = props
      // Re-render on a locale switch; `t` itself reads the active locale.
      React.useSyncExternalStore(
        (notify) => ctx.locale.subscribe(notify),
        () => ctx.locale.getSnapshot(),
      )
      const fieldId = React.useId()
      const fileInput = React.useRef(null)
      const previewButton = React.useRef(null)
      const reviewTitle = React.useRef(null)
      const focusPreview = React.useRef(false)
      const running = React.useRef(false)
      const cloudRead = React.useRef(0)
      const inventoryRead = React.useRef(0)
      const selected = React.useRef(null)
      const [plan, setPlan] = React.useState(null)
      const [receipt, setReceipt] = React.useState(null)
      const [flowError, setFlowError] = React.useState(null)
      const [status, setStatus] = React.useState(null)
      const [cloud, setCloud] = React.useState({ state: 'unknown' })
      const [busy, setBusy] = React.useState(null)
      const [notice, setNotice] = React.useState(null)
      const [pending, setPending] = React.useState(null)
      const [gistId, setGistId] = React.useState('')
      const [token, setToken] = React.useState('')
      const [includeMachine, setIncludeMachine] = React.useState(false)
      const [statusError, setStatusError] = React.useState(null)
      const [showFiles, setShowFiles] = React.useState(false)
      // `null` means "not asked yet", which is deliberately distinct from a
      // payload with `available: false` — the page must not paint a green line
      // for a question it has not put to the host.
      const [plugins, setPlugins] = React.useState(null)
      const [pluginReport, setPluginReport] = React.useState(null)

      const errorText = React.useCallback((error) => {
        const code = typeof error?.code === 'string' ? error.code : 'other'
        const localized = t(`err.${code}`)
        const fallback = t('err.other')
        const detail = typeof error?.message === 'string' ? error.message : ''
        if (localized === `err.${code}`) return detail === '' ? fallback : detail
        return detail === '' ? localized : `${localized}\n${detail}`
      }, [t])

      const run = React.useCallback(async (label, task) => {
        // State disables the controls on render; the ref also closes the gap
        // before that render, including rapid clicks and keyboard activation.
        if (running.current || (selected.current !== null && label !== 'combined')) return
        running.current = true
        setBusy(label)
        setNotice(null)
        setFlowError(null)
        if (['prepare', 'sync', 'restore', 'plugins', 'undo'].includes(label)) setReceipt(null)
        try {
          await task()
        } catch (error) {
          const text = errorText(error)
          if (label === 'combined' || label === 'prepare') {
            const ambiguous = label === 'combined' && !['stale-plan', 'busy'].includes(error?.code)
            setFlowError(ambiguous ? `${text}\n${t('uncertainResult')}` : text)
          } else setNotice({ kind: 'error', text })
        } finally {
          running.current = false
          setBusy(null)
        }
      }, [errorText, t])

      React.useEffect(() => {
        if (plan !== null || receipt !== null) reviewTitle.current?.focus()
        else if (focusPreview.current) {
          previewButton.current?.focus()
          focusPreview.current = false
        }
      }, [plan, receipt])

      /** Local facts plus what the Host remembers about the cloud copy. */
      const refresh = React.useCallback(async (useSavedSource = false, active = () => true) => {
        const payload = await api('/status')
        if (!payload.counts || !Array.isArray(payload.files) || !Array.isArray(payload.excluded)) throw badResponse()
        if (!active()) return payload
        setStatus(payload)
        setStatusError(null)
        if (useSavedSource) setGistId(payload.cloud?.gistId ?? '')
        setIncludeMachine(payload.cloud?.includeMachine === true)
        return payload
      }, [])

      /** Read the cloud copy and say, in one line, whether it differs. */
      const checkCloud = React.useCallback(async (body = {}) => {
        const readId = ++cloudRead.current
        setCloud({ state: 'checking' })
        try {
          const payload = await api('/gist/read', { method: 'POST', body })
          if (readId !== cloudRead.current) return
          const counts = payload.preview.counts
          const different = counts.add + counts.overwrite + counts.merge
          setCloud({
            state: different === 0 ? 'same' : 'differs',
            different,
            files: payload.backup.files.length,
            updatedAt: payload.ref.updatedAt ?? null,
            url: payload.ref.htmlUrl ?? null,
          })
        } catch (error) {
          if (readId !== cloudRead.current) return
          setCloud({
            state: error?.code === 'no-cloud' ? 'none' : 'error',
            text: errorText(error),
          })
        }
      }, [errorText])

      /** Which declared plugins this machine does not have yet. */
      const checkPlugins = React.useCallback(async () => {
        const readId = ++inventoryRead.current
        try {
          const payload = await api('/plugins')
          if (readId === inventoryRead.current) setPlugins(payload)
        } catch (error) {
          if (readId !== inventoryRead.current) return
          // A host that cannot answer is not the same as a clean answer, and the
          // page has to show which one it got.
          setPlugins({ available: false, reason: 'unreachable', text: errorText(error) })
        }
      }, [errorText])

      /** A one-line result banner, defined before any render path uses it. */
      const noticeView = (value) => h('div', { className: `dpgsp-notice dpgsp-notice-${value.kind}`, role: value.kind === 'error' ? 'alert' : 'status' },
        value.text,
        value.href === null || value.href === undefined
          ? null
          : h('div', null, h('a', { className: 'dpgsp-link', href: value.href, target: '_blank', rel: 'noreferrer' }, value.href)),
      )

      /** One label/value line in the status card. */
      const row = (key, value) => h('div', { className: 'dpgsp-row', key },
        h('span', { className: 'dpgsp-key' }, key),
        h('span', { className: 'dpgsp-val' }, value),
      )

      // On open: local facts always, the cloud only when one is remembered.
      React.useEffect(() => {
        let active = true
        void (async () => {
          try {
            const payload = await refresh(true, () => active)
            if (active && payload.cloud?.gistId) await checkCloud()
          } catch (error) {
            if (active) setStatusError(error)
          }
        })()
        // Whether plugins are missing is worth knowing before any sync: it is
        // what a fresh restore of a previous machine leaves behind.
        void checkPlugins()
        return () => { active = false; ++cloudRead.current; ++inventoryRead.current }
      }, [refresh, checkCloud, checkPlugins])

      const retryStatus = () => run('status', async () => {
        setStatusError(null)
        try {
          await refresh(true)
          await checkPlugins()
        } catch (error) { setStatusError(error) }
      })

      const requestToken = () => token.trim() ? { token: token.trim() } : {}
      const requestSource = () => ({ ...(gistId.trim() ? { id: gistId.trim() } : {}), ...requestToken() })

      const prepare = () => run('prepare', async () => {
        setPending(null)
        const payload = await api('/sync/preview', { method: 'POST', body: requestSource() })
        if (!validPreview(payload)) throw badResponse()
        // Never persist the plan, the token, or backup contents on the client.
        selected.current = payload
        setPlan(payload)
      })

      const cancelPlan = () => {
        if (running.current) return
        selected.current = null
        focusPreview.current = true
        setPlan(null)
      }

      const confirmPlan = () => run('combined', async () => {
        const current = selected.current
        if (!current || current !== plan || !current.planId || !hasCandidateList(current.plugins)) return
        // Consume before awaiting. A lost response may still have applied;
        // retry always starts with a fresh preview, never the same mutation.
        selected.current = null
        setPlan(null)
        ++cloudRead.current
        ++inventoryRead.current
        setCloud({ state: 'unknown' })
        setPlugins(null)
        setPluginReport(null)
        try {
          const payload = await api('/sync/install', {
            method: 'POST', body: { planId: current.planId, confirm: true },
          })
          if (payload.ref?.id !== current.ref.id || typeof payload.complete !== 'boolean'
            || !Number.isSafeInteger(payload.report?.restored) || !hasCounts(payload.report.counts)
            || typeof payload.restart !== 'boolean' || typeof payload.plugins?.available !== 'boolean'
            || (payload.warnings !== undefined && (!Array.isArray(payload.warnings) || !payload.warnings.every(text => typeof text === 'string')))) throw badResponse()
          setReceipt(payload)
        } finally {
          // The receipt checks the Gist declarations, not every local package.
          // Refresh both local views (GET only), even after a lost response.
          await Promise.all([checkPlugins(), refresh().catch(() => setNotice({ kind: 'warn', text: t('refreshFailed') }))])
        }
      })

      const upload = () => run('upload', async () => {
        // Upload overwrites the remembered target, never an unsaved restore draft.
        const payload = await api('/gist/upload', { method: 'POST', body: { includeMachine, ...requestToken() } })
        // A dependency left out of the upload is news the reader can only act on
        // here: on the other machine it just silently will not be there.
        const left = Array.isArray(payload.dropped) && payload.dropped.length > 0
          ? `\n${t('droppedTitle')}：${payload.dropped.map(entry => `${entry.name}（${entry.spec}）`).join('、')}\n${t('droppedHint')}`
          : ''
        setNotice({
          kind: 'ok',
          text: `${t('uploaded')} ${payload.files} ${t('filesUnit')}（${formatBytes(payload.bytes)}）${left}`,
          href: payload.ref.htmlUrl ?? null,
        })
        await refresh(true)
        await checkCloud(requestToken())
      })

      const sync = () => run('sync', async () => {
        const payload = await api('/sync', {
          method: 'POST',
          body: requestSource(),
        })
        const counts = payload.report.counts
        const skip = payload.report.dropped.length === 0
          ? ''
          : `${t('syncedSkipped')} ${payload.report.dropped.length} ${t('syncedSkippedUnit')}`
        setNotice({
          kind: 'ok',
          text: `${t('synced')} ${payload.report.restored} ${t('filesUnit')}（${configSummary(counts, t)}）${skip}\n${t('restartHint')}`,
        })
        setPluginReport(null)
        await refresh(true)
        // A config-only sync can introduce new local declarations.
        await checkPlugins()
        await checkCloud(requestToken())
      })

      const installPlugins = () => run('plugins', async () => {
        const payload = await api('/plugins/install', { method: 'POST', body: {} })
        ++inventoryRead.current
        setPlugins(payload)
        setPluginReport(payload)
      })

      const undo = () => run('undo', async () => {
        const payload = await api('/undo', { method: 'POST', body: {} })
        setNotice({ kind: 'ok', text: `${t('undone')} ${payload.report.reverted} ${t('filesUnit')}. ${t('undoLimit')}` })
        setPluginReport(null)
        await refresh()
        await checkPlugins()
        await checkCloud(requestToken())
      })

      const saveSettings = () => run('save', async () => {
        const payload = await api('/settings', {
          method: 'POST',
          body: { gistId: gistId.trim(), includeMachine },
        })
        setNotice({ kind: 'ok', text: t('saved') })
        await refresh(true)
        if (payload.cloud.gistId === null) setCloud({ state: 'none' })
        else await checkCloud(requestToken())
      })

      const checkToken = () => run('token', async () => {
        const payload = await api('/gist/token', {
          method: 'POST',
          body: token.trim() === '' ? {} : { token: token.trim() },
        })
        const login = typeof payload.login === 'string' && payload.login.trim() ? ` · ${payload.login.trim()}` : ''
        setNotice({ kind: login ? 'ok' : 'warn', text: `${login ? t('tokenOk') : t('tokenUnverified')}${t(`source.${payload.source}`)}${login}` })
      })

      /** Remember the usage-counter choice as soon as it is toggled. */
      const toggleMachine = (value) => run('settings', async () => {
        await api('/settings', { method: 'POST', body: { includeMachine: value } })
        setIncludeMachine(value)
      })

      /** Read only the file explicitly selected in this component's input. */
      const chooseFile = (event) => {
        const input = event.currentTarget
        const file = input.files?.[0]
        input.value = ''
        if (!file) return
        void run('file', async () => {
          const text = await file.text()
          let parsed
          try { parsed = JSON.parse(text) } catch { throw Object.assign(new Error(''), { code: 'invalidJson' }) }
          const payload = await api('/preview', { method: 'POST', body: { backup: parsed } })
          setPending({ name: file.name, backup: parsed, preview: payload.preview })
        })
      }

      const applyPending = () => run('restore', async () => {
        const payload = await api('/restore', {
          method: 'POST',
          body: { backup: pending.backup, confirm: true },
        })
        setPending(null)
        setNotice({
          kind: 'ok',
          text: `${t('imported')} ${payload.report.restored} ${t('filesUnit')}\n${t('restartHint')}`,
        })
        setPluginReport(null)
        await refresh()
        await checkPlugins()
      })

      if (status === null) {
        // An HTTP, profile or transient connection error is not proof the
        // plugin failed to load. Keep the diagnostic and a read-only retry here.
        return h('div', { className: 'dpgsp-root' },
          h('style', null, CSS),
          h('div', { className: 'dpgsp-head' }, h('h2', null, t('title'))),
          notice === null ? null : noticeView(notice),
          h('div', { className: 'dpgsp-card' },
            statusError === null ? h('div', { className: 'dpgsp-hint', role: 'status' }, t('busy'))
              : noticeView({ kind: 'error', text: `${t('hostMissing')}\n${statusError.message || errorText(statusError)}` }),
            statusError === null ? null : h('div', { className: 'dpgsp-actions' },
              h('button', { className: 'dpgsp-btn', onClick: retryStatus, disabled: busy !== null }, t('retryStatus'))),
          ),
        )
      }

      // The host half is only re-imported when DSH restarts, while this page can
      // already be the new one. A status payload without `cloud` therefore means
      // "new page, old host": say so plainly instead of failing in the reader's
      // face. Everything below tolerates `settings === null`.
      const settings = status.cloud ?? null
      const staleHost = settings === null
      const exportHref = `${API}/export${includeMachine ? '?include=machine' : ''}`
      const cloudUrl = cloud.url ?? (staleHost || settings.gistId === null ? null : `https://gist.github.com/${settings.gistId}`)
      const verdict = staleHost
        ? { kind: 'warn', text: t('needRestart'), hint: null }
        : cloudVerdict(cloud, settings.gistId !== null, t)
      const working = busy !== null || staleHost
      const disabled = working || plan !== null

      const stamp = (record) => record === null || record === undefined
        ? t('never')
        : `${formatTime(record.at)} · ${record.files ?? '?'} ${t('filesLabel')}`

      const setupCard = h('section', { className: 'dpgsp-card dpgsp-setup', 'aria-labelledby': `${fieldId}-setup` },
        h('h3', { id: `${fieldId}-setup`, className: 'dpgsp-cardtitle' }, t('setupTitle')),
        h('div', { className: 'dpgsp-hint' }, t('setupHint')),
        h('div', { className: 'dpgsp-field' },
          h('label', { className: 'dpgsp-key', htmlFor: `${fieldId}-gist` }, t('gistIdLabel')),
          h('input', { id: `${fieldId}-gist`, className: 'dpgsp-input', value: gistId, disabled,
            placeholder: t('gistIdPlaceholder'), spellCheck: false, onChange: event => setGistId(event.target.value) }),
        ),
        h('div', { className: 'dpgsp-field' },
          h('label', { className: 'dpgsp-key', htmlFor: `${fieldId}-token` }, t('tokenLabel')),
          h('input', { id: `${fieldId}-token`, className: 'dpgsp-input', type: 'password', value: token, disabled,
            autoComplete: 'off', spellCheck: false, placeholder: t('tokenPlaceholder'), onChange: event => setToken(event.target.value) }),
        ),
        h('div', { className: 'dpgsp-hint' }, t('tokenHint')),
        plan !== null ? h('div', { className: 'dpgsp-sub' },
          h('h4', { ref: reviewTitle, tabIndex: -1, className: 'dpgsp-cardtitle' }, t('previewTitle')),
          row(t('previewSource'), plan.ref.updatedAt ? `${plan.ref.id} · ${formatTime(plan.ref.updatedAt)}` : plan.ref.id),
          h('div', { className: 'dpgsp-hint' }, t('snapshotHint')),
          row(t('previewTarget'), plan.preview.profile),
          row(t('previewChanges'), configSummary(plan.preview.counts, t)),
          configDetails(plan.preview, t),
          plan.plugins.available ? packageList(plan.plugins.missing, t)
            : h('div', { className: 'dpgsp-verdict dpgsp-warn' }, t('unavailablePlan'),
              plan.plugins.reason ? ` (${codeText('reason', plan.plugins.reason, t)})` : null),
          plan.plugins.available ? installedSelection(plan, t) : null,
          plan.planId === null ? null : h('div', { className: 'dpgsp-verdict' }, t('trustHint')),
          h('div', { className: 'dpgsp-hint' }, t('undoLimit')),
          h('div', { className: 'dpgsp-actions' },
            h('button', { type: 'button', className: 'dpgsp-btn dpgsp-btn-primary', disabled: working || !plan.planId,
              onClick: confirmPlan }, t('confirmAction')),
            h('button', { type: 'button', className: 'dpgsp-btn', disabled: working, onClick: cancelPlan }, t('cancel')),
          ),
        ) : h('div', { className: 'dpgsp-actions' },
          h('button', { type: 'button', ref: previewButton, className: 'dpgsp-btn dpgsp-btn-primary',
            onClick: prepare, disabled: working || (!gistId.trim() && !settings?.gistId) }, t('previewAction')),
          busy === 'prepare' || busy === 'combined' ? h('span', { role: 'status', className: 'dpgsp-hint' },
            busy === 'prepare' ? t('previewBusy') : t('installBusy')) : null,
        ),
        flowError === null ? null : noticeView({ kind: 'error', text: flowError }),
        receipt === null ? null : restoreOutcome(receipt, t, reviewTitle),
      )

      const statusCard = h('div', { className: 'dpgsp-card' },
        h('div', { className: 'dpgsp-cardtitle' }, t('statusTitle')),
        h('div', { className: `dpgsp-verdict dpgsp-${verdict.kind}` }, verdict.text),
        verdict.hint === null ? null : h('div', { className: 'dpgsp-hint' }, verdict.hint),
        h('div', { className: 'dpgsp-facts' },
          row(t('profileLabel'), status.profile),
          row(t('filesLabel'), `${status.counts.files} · ${formatBytes(status.counts.bytes)}`),
          staleHost ? null : row(t('lastUpload'), stamp(settings.lastUpload)),
          staleHost ? null : row(t('lastSync'), stamp(settings.lastSync)),
        ),
        h('div', { className: 'dpgsp-actions' },
          h('button', { className: 'dpgsp-btn', onClick: () => run('check', () => checkCloud(requestToken())), disabled }, t('recheck')),
          cloudUrl === null ? null : h('a', { className: 'dpgsp-link', href: cloudUrl, target: '_blank', rel: 'noreferrer' }, t('openCloud')),
        ),
      )

      const uploadCard = h('div', { className: 'dpgsp-card' },
        h('div', { className: 'dpgsp-cardtitle' }, t('uploadTitle')),
        h('div', { className: 'dpgsp-hint' }, t('uploadHint')),
        row(t('uploadTarget'), settings?.gistId ?? t('newGist')),
        h('div', { className: 'dpgsp-actions' },
          h('button', { className: 'dpgsp-btn', onClick: upload, disabled }, busy === 'upload' ? t('busy') : t('uploadAction')),
          h('a', { className: 'dpgsp-btn', href: exportHref }, t('exportAction')),
        ),
      )

      // This list describes the live profile; only the Gist preview above is
      // authorization for the combined action. Keep the standalone path distinct.
      const pluginsBlock = (() => {
        if (plugins === null) return h('div', { className: 'dpgsp-hint' }, t('pluginsChecking'))
        if (!hasCandidateList(plugins)) return h('div', { className: 'dpgsp-sub' },
          h('div', { className: 'dpgsp-verdict dpgsp-warn' }, t('pluginsUnknown')),
          h('div', { className: 'dpgsp-hint' }, plugins.text || codeText('reason', plugins.reason, t)),
          h('div', { className: 'dpgsp-hint' }, t('pluginsUnknownHint')),
        )
        if (!plugins.missing.length) return h('div', { className: 'dpgsp-hint' }, t('pluginsAllPresent'))
        return h('div', { className: 'dpgsp-sub' },
          h('h4', { className: 'dpgsp-subtitle' }, t('pluginsTitle')),
          packageList(plugins.missing, t),
          h('div', { className: 'dpgsp-actions' }, h('button', {
            className: 'dpgsp-btn', onClick: installPlugins,
            disabled: disabled || !plugins.missing.some(entry => entry.resolvable),
          }, busy === 'plugins' ? t('pluginsInstalling') : t('pluginsInstall'))),
        )
      })()

      const syncCard = h('div', { className: 'dpgsp-card' },
        h('div', { className: 'dpgsp-cardtitle' }, t('syncTitle')),
        h('div', { className: 'dpgsp-hint' }, t('syncHint')),
        h('div', { className: 'dpgsp-actions' },
          h('button', { className: 'dpgsp-btn', onClick: sync, disabled }, busy === 'sync' ? t('busy') : t('syncAction')),
          status.undo === null
            ? null
            : h('button', { className: 'dpgsp-btn', onClick: undo, disabled }, t('undoAction')),
        ),
        status.undo === null
          ? null
          : h('div', { className: 'dpgsp-hint' }, `${t('undoAvailable')}${formatTime(status.undo.createdAt)} · ${status.undo.files} ${t('filesLabel')}`),
        h('div', { className: 'dpgsp-hint' }, t('undoLimit')),
        pluginsBlock,
        pluginReport === null ? null : pluginOutcome(pluginReport, t),
      )

      const pendingCard = pending === null ? null : h('div', { className: 'dpgsp-card' },
        h('div', { className: 'dpgsp-cardtitle' }, `${t('pendingTitle')}：${pending.name}`),
        h('div', { className: 'dpgsp-hint' }, `${t('pendingPlan')} ${pending.preview.files.length} ${t('filesUnit')}: ${configSummary(pending.preview.counts, t)}`),
        pending.preview.dropped.length === 0
          ? null
          : h('div', { className: 'dpgsp-hint' }, `${t('excludedLabel')}：${pending.preview.dropped.map(entry => `${entry.path} (${t(`code.${entry.code}`)})`).join(', ')}`),
        h('div', { className: 'dpgsp-actions' },
          h('button', { className: 'dpgsp-btn dpgsp-btn-primary', onClick: applyPending, disabled }, busy === 'restore' ? t('busy') : t('importConfirm')),
          h('button', { className: 'dpgsp-btn', onClick: () => setPending(null), disabled }, t('cancel')),
        ),
      )

      const advanced = h('details', { className: 'dpgsp-details' },
        h('summary', null, t('advanced')),
        h('div', { className: 'dpgsp-advbody' },
          h('div', { className: 'dpgsp-hint' }, t('saveHint')),
          h('div', { className: 'dpgsp-actions' },
            h('button', { className: 'dpgsp-btn', onClick: saveSettings, disabled }, t('save')),
            h('button', { className: 'dpgsp-btn', onClick: checkToken, disabled }, t('tokenCheck')),
          ),
          h('div', { className: 'dpgsp-hint' }, settings === null ? t('needRestart') : `${t('gistIdHint')}${settings.settingsFile ?? ''}`),
          h('div', { className: 'dpgsp-hint' }, `${t('profileLocation')}${status.profile} (${status.root ?? ''})`),
          h('div', { className: 'dpgsp-sub' },
            h('div', { className: 'dpgsp-subtitle' }, t('newMachineTitle')),
            h('ol', { className: 'dpgsp-steps' },
              h('li', null, t('newMachineStep1')),
              h('li', null, t('newMachineStep2')),
              h('li', null, t('newMachineStep3')),
              h('li', null, t('newMachineStep4')),
            ),
          ),
          h('label', { className: 'dpgsp-check' },
            h('input', {
              type: 'checkbox',
              checked: includeMachine, disabled,
              onChange: (event) => toggleMachine(event.target.checked),
            }),
            t('includeMachine'),
          ),
          h('div', { className: 'dpgsp-actions' },
            h('input', { type: 'file', accept: '.json,application/json', ref: fileInput, hidden: true, onChange: chooseFile }),
            h('button', { className: 'dpgsp-btn', onClick: () => fileInput.current?.click(), disabled }, t('pickFile')),
          ),
          h('button', {
            className: 'dpgsp-btn dpgsp-btn-link',
            onClick: () => setShowFiles((value) => !value),
            disabled: false,
          }, showFiles ? t('hideFiles') : t('showFiles')),
          showFiles ? fileLists(status, t) : null,
          h('div', { className: 'dpgsp-hint' }, t('limits')),
        ),
      )

      return h('div', { className: 'dpgsp-root' },
        h('style', null, CSS),
        h('div', { className: 'dpgsp-head' },
          h('h2', null, t('title')),
          h('p', null, t('subtitle')),
        ),
        notice === null ? null : noticeView(notice),
        setupCard,
        statusCard,
        syncCard,
        uploadCard,
        pendingCard,
        advanced,
      )
    }

    /** One plain sentence about how the cloud copy compares with this machine. */
    function cloudVerdict(cloud, hasCloud, t) {
      if (cloud.state === 'checking') return { kind: 'muted', text: t('checking'), hint: null }
      if (cloud.state === 'none') return { kind: 'warn', text: t('cloudNone'), hint: null }
      if (cloud.state === 'same') return { kind: 'ok', text: t('cloudSame'), hint: null }
      if (cloud.state === 'differs') {
        return {
          kind: 'warn',
          text: `${t('cloudDiffers')} ${cloud.different} ${t('cloudDiffersFiles')}`,
          hint: t('cloudDiffersHint'),
        }
      }
      if (cloud.state === 'error') {
        return { kind: 'warn', text: `${t('cloudUnreachable')}：${cloud.text}`, hint: null }
      }
      return {
        kind: 'muted',
        text: hasCloud ? t('notChecked') : t('cloudNone'),
        hint: null,
      }
    }

    // Unknown diagnostics are still useful. Render all values as text; never
    // make a package spec into a link, a command, or client-side install input.
    function codeText(prefix, code, t) {
      if (typeof code !== 'string' || !code) return ''
      const key = `${prefix}.${code}`
      const value = t(key)
      return value === key ? code : value
    }

    function configDetails(preview, t) {
      return h('details', { className: 'dpgsp-details' },
        h('summary', null, `${t('previewFiles')} · ${t('excludedLabel')} ${preview.dropped.length}`),
        h('ul', { className: 'dpgsp-list' },
          preview.files.map(file => h('li', { key: file.path },
            h('bdi', { className: 'dpgsp-path' }, file.path), h('span', null, t(FILE_STATUSES[file.status])))),
          preview.dropped.map(entry => h('li', { key: entry.path },
            h('bdi', { className: 'dpgsp-path' }, entry.path), h('span', null, codeText('code', entry.code, t)))),
        ),
      )
    }

    function packageList(missing, t) {
      if (!missing.length) return h('div', { className: 'dpgsp-hint' }, t('previewNone'))
      const group = (entries, title) => !entries.length ? null : h('div', { className: 'dpgsp-sub' },
        h('h4', { className: 'dpgsp-subtitle' }, `${title} (${entries.length})`),
        h('ul', { className: 'dpgsp-list' }, entries.map(entry => h('li', { key: entry.name },
          h('div', { className: 'dpgsp-package' },
            h('strong', null, h('bdi', null, entry.name)),
            h('span', null, `${t('specLabel')}: `, h('code', { dir: 'ltr' }, entry.installSpec ?? entry.spec ?? t('noSpec'))),
            entry.resolvable ? null : h('span', { className: 'dpgsp-hint' }, codeText('note', entry.note, t)),
          ),
        ))),
      )
      return h('div', null, group(missing.filter(item => item.resolvable), t('previewInstall')),
        group(missing.filter(item => !item.resolvable), t('previewSkip')))
    }

    /** Packages already on disk can still be newly selected by the restored manifest. */
    function installedSelection(plan, t) {
      const installed = Array.isArray(plan.plugins.installed) ? plan.plugins.installed.filter(name => typeof name === 'string') : []
      const added = new Set(plan.preview.manifest?.bundlesAdded ?? [])
      const enabling = installed.filter(name => added.has(name))
      const other = installed.filter(name => !added.has(name))
      const names = items => h('ul', { className: 'dpgsp-list' }, items.map(name => h('li', { key: name }, h('bdi', null, name))))
      return h(React.Fragment, null,
        enabling.length ? h('div', { className: 'dpgsp-sub' },
          h('h4', { className: 'dpgsp-subtitle' }, `${t('alreadyEnable')} (${enabling.length})`), names(enabling)) : null,
        other.length ? h('details', { className: 'dpgsp-details' },
          h('summary', null, `${t('alreadyOther')} (${other.length})`), names(other)) : null,
      )
    }

    const OUTCOMES = { installed: 'pluginsInstalledCount', 'already-present': 'pluginsPresentCount', failed: 'pluginsFailedCount', skipped: 'pluginsSkippedCount' }

    function pendingScripts(report) {
      const results = Array.isArray(report?.results) ? report.results : []
      return [...new Set(results.flatMap(item => Array.isArray(item?.pendingBuilds) ? item.pendingBuilds : [])
        .filter(name => typeof name === 'string' && name))]
    }

    function verifiedInstall(report) {
      return hasCandidateList(report) && Array.isArray(report.results)
        && Object.keys(OUTCOMES).every(key => Number.isSafeInteger(report.outcomeCounts?.[key]) && report.outcomeCounts[key] >= 0)
        && report.results.every(item => item && Object.hasOwn(OUTCOMES, item.outcome) && typeof item.name === 'string')
    }

    function needsAttention(receipt) {
      const report = receipt.plugins
      return receipt.complete !== true || !verifiedInstall(report) || report.missing.length > 0
        || report.outcomeCounts.failed > 0 || report.outcomeCounts.skipped > 0 || pendingScripts(report).length > 0
        || report.results.some(item => item.outcome === 'skipped' || item.outcome === 'failed')
        || (receipt.warnings?.length ?? 0) > 0
    }

    function pluginOutcome(report, t, showRestart = true) {
      const scripts = pendingScripts(report)
      const results = Array.isArray(report.results) ? report.results : []
      const remaining = Array.isArray(report.missing) ? report.missing : []
      return h('div', { className: 'dpgsp-sub' },
        h('h4', { className: 'dpgsp-subtitle' }, t('pluginResultTitle')),
        verifiedInstall(report) ? h('div', { className: 'dpgsp-hint' }, Object.entries(OUTCOMES)
          .map(([key, label]) => `${t(label)} ${report.outcomeCounts[key]}`).join(' · '))
          : h('div', { className: 'dpgsp-verdict dpgsp-warn' }, t('pluginResultUnknown'),
            report.reason ? ` (${codeText('reason', report.reason, t)})` : null),
        results.length ? h('ul', { className: 'dpgsp-list' }, results.map((item, index) => !item ? null : h('li', { key: index },
          h('div', { className: 'dpgsp-package' },
            h('strong', null, h('bdi', null, item.name), ' · ', Object.hasOwn(OUTCOMES, item.outcome) ? t(OUTCOMES[item.outcome]) : t('pluginResultUnknown')),
            item.message ? h('span', null, item.outcome === 'skipped' ? codeText('note', item.message, t) : item.message) : null,
          ),
        ))) : null,
        scripts.length ? h('div', { className: 'dpgsp-verdict dpgsp-warn' },
          h('strong', null, t('pendingBuilds')), h('ul', { className: 'dpgsp-note-list' }, scripts.map(name => h('li', { key: name }, name))),
          t('buildHint')) : null,
        remaining.length ? h('div', { className: 'dpgsp-hint' }, `${t('stillMissing')}: ${remaining.map(entry => entry?.name).filter(Boolean).join(', ')}`) : null,
        showRestart && report.restart === true ? h('strong', null, t('pluginsRestart')) : null,
      )
    }

    function restoreOutcome(receipt, t, titleRef) {
      const attention = needsAttention(receipt)
      const report = receipt.report
      return h('div', { className: 'dpgsp-sub' },
        h('h4', { ref: titleRef, tabIndex: -1, className: `dpgsp-verdict dpgsp-${attention ? 'warn' : 'ok'}` },
          attention ? t('restoreAttention') : t('restoreDone')),
        h('div', null, `${t('previewSource')}: ${receipt.ref.id} · ${t('configRestored')}: ${report.restored}`),
        h('div', { className: 'dpgsp-hint' }, configSummary(report.counts, t)),
        hasFilePlan(report) ? configDetails(report, t) : null,
        pluginOutcome(receipt.plugins, t, false),
        receipt.warnings?.length ? h('div', { className: 'dpgsp-verdict dpgsp-warn' },
          h('strong', null, t('warningsTitle')), h('ul', { className: 'dpgsp-note-list' }, receipt.warnings.map((item, index) => h('li', { key: index }, item)))) : null,
        receipt.restart === true ? h('strong', null, t('restartHint')) : null,
        attention ? h('div', { className: 'dpgsp-hint' }, t('retryHint')) : null,
        h('div', { className: 'dpgsp-hint' }, t('undoLimit')),
      )
    }

    /** The included/excluded file lists behind the toggle. */
    function fileLists(status, t) {
      const included = status.files.length === 0
        ? h('div', { className: 'dpgsp-hint' }, t('filesEmpty'))
        : h('ul', { className: 'dpgsp-list' },
            status.files.map(file => h('li', { key: file.path },
              h('span', { className: 'dpgsp-path' }, file.path),
              h('span', { className: 'dpgsp-dim' }, formatBytes(file.bytes)),
            )),
          )
      const excluded = status.excluded.length === 0
        ? h('div', { className: 'dpgsp-hint' }, t('excludedEmpty'))
        : h('ul', { className: 'dpgsp-list' },
            status.excluded.map(entry => h('li', { key: entry.path },
              h('span', { className: 'dpgsp-path' }, entry.path),
              h('span', { className: 'dpgsp-dim' }, t(`code.${entry.code}`)),
            )),
          )
      return h('div', null,
        h('div', { className: 'dpgsp-hint' }, `${t('filesLabel')} (${status.files.length})`),
        included,
        h('div', { className: 'dpgsp-hint' }, `${t('excludedLabel')} (${status.excluded.length})`),
        excluded,
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, DICT), `${NS}: dictionaries`)
        const t = ctx.locale.bind(NS)
        ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
          name: 'settings.plugins.tab',
          id: NS,
          order: TAB_ORDER,
          label: () => t('tab'),
          locale: NS,
        }, () => h(Panel, { ctx, t })))
      },
    }
  },
})

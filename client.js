/** Settings → Built-in plugins. Plans and credentials live only for the current interaction. */
window.__ModuleLoader__.load({
  id: 'dsh-profile-gist-sync-plus',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const NS = 'dsh-profile-gist-sync-plus'
    const API = '/dsh-profile-gist-sync-plus/api'
    const TAB_ORDER = 71

    const DICT = {
      zh: {
        tab: '配置同步 Plus',
        title: '配置同步 Plus',
        intro: '在不同电脑之间迁移配置和插件。',
        backup: '备份本机',
        restore: '从备份恢复',
        more: '更多',
        back: '返回首页',
        cancel: '取消',
        next: '查看预览',
        previewAgain: '重新预览',
        previewReceiptSource: '重新预览此来源',
        noneYet: '尚未备份',
        linked: '已关联备份目标',
        ready: '备份已就绪',
        copy: '复制备份链接',
        copied: '已复制',
        manualCopy: '未能自动复制，请手动复制下方链接。',
        link: '备份链接',
        openGist: '打开 Gist',
        privacy: '新建备份不公开列出，持链接者可读。配置文本不会自动脱敏。',
        overwriteHint: '再次备份会覆盖已关联目标中的备份文件。',
        overwriteReview: '更新已关联的备份？',
        visibilityKept: '更新不会更改目标的可见性；原本公开的 Gist 仍然公开。',
        uploadConfirm: '确认更新备份',
        uploadRetry: '重新备份',
        uploadScope: '上传配置和插件清单，不含插件本体或凭据库。请先检查文本文件中是否含有私密信息。',
        uploadTarget: '上传目标',
        newGist: '新建未公开列出的 Gist',
        uploadUncertain: '未能核实这次上传的结果。请先检查本机记录和目标 Gist，不要重复上传。',
        refreshFailed: '未能刷新本机状态。请重新读取状态，不必重复刚才的操作。',
        hostMissing: '当前无法读取本机配置状态。',
        staleHost: '当前服务未提供所需的备份接口。请重启 DSH 后再试。',
        statusRetry: '重新读取本机状态',
        localBusy: '正在读取本机状态…',
        uploadBusy: '正在备份本机…',
        previewBusy: '正在查看这次恢复会更改什么…',
        applyBusy: '正在按预览恢复，请勿重复操作。',
        pluginsBusy: '正在核对本机插件清单…',
        installBusy: '正在安装已核对的插件…',
        undoBusy: '正在撤销配置恢复…',
        busy: '处理中…',
        sourceIntro: '粘贴另一台电脑的备份链接，先看看这台电脑会改什么。',
        newMachineStep1: '也可以输入 Gist ID。查看预览不会写入配置、安装插件或更改上传目标。',
        sourceLabel: '备份链接或 Gist ID',
        sourcePlaceholder: '粘贴 gist.github.com 备份链接或 ID',
        changeSource: '换用其他来源',
        source: '来源',
        targetProfile: '本机 profile',
        previewTitle: '恢复预览',
        configMode: '仅恢复配置',
        configPreview: '仅恢复配置：预览',
        localPreview: '本地文件：恢复预览',
        configScope: '仅写配置，不安装插件。使用完整文件范围，备份中的 .npmrc 等包管理策略文件也可能覆盖本机设置。',
        standardTrust: '仅在信任备份和插件来源时恢复。更改影响此 profile 的所有会话；构建脚本如需批准，请单独核对。',
        configTrust: '仅在信任整份备份时恢复。更改影响此 profile 的所有会话。',
        configFiles: '配置文件',
        changeFiles: '变更 %n 个配置文件',
        fileCount: '%n 个文件',
        add: '新增',
        overwrite: '覆盖',
        merge: '合并',
        identical: '不变',
        retained: '保留或跳过',
        showUnchanged: '未变更的文件',
        pluginsToInstall: '安装 %n 个插件',
        unresolved: '无法自动安装，将跳过',
        noSpec: '未记录可核实的来源',
        installSource: '安装来源',
        alreadyEnable: '已安装，恢复后加入启用清单',
        alreadyOther: '其他已安装的包',
        cannotVerify: '无法核实插件清单，不能确认组合恢复。',
        cannotVerifyHint: '可到「插件」页核对本机安装情况；如只想恢复配置，请从「更多」打开范围不同的独立预览。',
        noChanges: '已是备份中的状态',
        filesSame: '没有配置文件需要更改。',
        filesPluginsSame: '没有配置文件需要更改，也没有插件需要安装。',
        noApplicable: '没有可自动应用的更改。请核对保留或需手动处理的项目。',
        confirmCombined: '恢复并安装 %n 个插件',
        confirmOne: '恢复并安装 1 个插件',
        confirmFiles: '确认恢复配置',
        confirmConfig: '确认仅恢复配置',
        noInstall: '此操作不安装插件。',
        reviewDone: '预览已就绪，尚未执行恢复。',
        restoreDone: '恢复完成',
        restoreUnverified: '上次恢复的结果尚未核实',
        restoreAttention: '配置已恢复，仍有事项需处理',
        changedCount: '已更改 %n 个配置文件',
        installedCount: '已安装 %n 个插件',
        resultDetails: '查看结果',
        warnings: '提醒',
        restart: '重启 DSH 后生效。',
        uncertain: '未取得可核实的结果，部分操作可能已完成。请先核对本机状态和撤销记录，再重新预览。',
        pluginUnknown: '无法核实完整的插件安装结果。',
        pluginResults: '插件安装结果',
        stillMissing: '仍缺少的包',
        installed: '已安装',
        present: '已存在',
        failed: '失败',
        skipped: '跳过',
        pendingBuilds: '待单独批准的构建脚本',
        buildHint: '请到「插件」页核对脚本来源，需要时单独批准；本页不会批准构建。',
        retryHint: '处理这些事项后，重新预览可核实还缺哪些插件。',
        undo: '撤销上次配置恢复',
        undoConfirm: '确认撤销配置',
        undoScope: '还原到这次恢复之前的配置，移除当时新增的文件；之后对这些文件的编辑可能丢失。',
        undoLimit: '撤销只还原配置，不卸载插件。',
        undoWhen: '恢复记录',
        undoNone: '没有可撤销的配置恢复。',
        undoDone: '配置已撤销',
        reverted: '已还原 %n 个文件。',
        local: '本地备份文件',
        localHint: '导入或导出配置 JSON，不必连接 GitHub。',
        import: '选择备份文件',
        export: '导出配置文件',
        chooseAgain: '重新选择文件',
        install: '单独补装插件',
        installHint: '只核对本机 profile 声明的包，不读取云端或恢复配置。',
        installConfirm: '安装已核对的 %n 个插件',
        installOne: '安装已核对的 1 个插件',
        installTrust: '仅安装你信任的来源。插件可能运行代码；本次操作不会批准新的构建脚本。',
        allPresent: '本机清单中声明的包均已安装。',
        installUnknown: '无法核实本机缺少哪些插件。请检查「插件」页。',
        refreshInventory: '重新检查插件',
        inventoryChanged: '本机清单已改变。请核对新的安装来源，再决定是否安装。',
        target: '管理备份目标',
        targetHint: '这里只管理以后上传的位置，不读取或修改云端。恢复时临时填写的来源不会保存为目标。',
        targetNew: '下次备份的目标',
        targetInput: '新的 Gist 链接或 ID',
        targetEmpty: '留空则下次备份新建 Gist',
        targetWarning: '保存后，下次备份将覆盖这个 Gist 中的备份文件。',
        saveTarget: '保存备份目标',
        targetSaved: '备份目标已保存。',
        targetChanged: '本机备份目标或备份选项已改变。请先核对最新范围。',
        diagnostics: '诊断与高级设置',
        diagnosticsHint: '以下为本机记录，不代表已经检查云端。',
        lastUpload: '最近一次上传',
        lastSync: '最近一次云端恢复',
        never: '暂无记录',
        settingsFile: '本机设置文件',
        profileRoot: 'profile 目录',
        includeMachine: '备份和导出时包含本机用量统计（data/usage.json）',
        machineSaved: '已更新备份范围。',
        machineIncluded: '包含本机用量统计。',
        machineExcluded: '不包含本机用量统计。',
        localInventory: '本机文件清单',
        defaultInventory: '基本备份范围（不含可选的用量统计）',
        excluded: '默认排除',
        limits: '大小上限：整份备份 / 单个 Gist 文件',
        droppedDeps: '未上传的本机路径依赖',
        repair: '修复 GitHub 访问',
        tokenLabel: '仅供本次请求的 GitHub 令牌',
        tokenHelp: '可以填写有 gist 权限的令牌；也可在启动环境中设置 DSH_GITHUB_TOKEN / GITHUB_TOKEN 后重启，或在本机执行 gh auth login。更新已有 Gist 还需对它有写权限。',
        tokenPrivacy: '令牌不保存，发送一次后清空；恢复确认不会再次发送。',
        authRetry: '留空重试会使用本机凭据。',
        'reason.no-plugin-manager': '未提供插件管理服务',
        'reason.plugin-manager-error': '读取插件清单失败',
        'note.local-path': '本机路径，无法自动安装',
        'note.workspace-protocol': 'workspace: 声明，无法在这台电脑解析',
        'note.missing-source': '缺少可核实的安装来源',
        'note.unsupported-source': '不支持自动安装此来源',
        'note.invalid-name': '包名无效',
        'note.stale-plan': '安装清单已改变，请重新预览',
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
        'err.bad-source': '请输入 Gist ID，或标准的 https://gist.github.com 备份链接（不要附加参数、片段或凭据）。',
        'err.auth': 'GitHub 未授权本次访问。',
        'err.rate-limit': 'GitHub 已限流，或当前凭据权限不足。可以稍后再试。',
        'err.session-auth': 'DSH 拒绝了本次请求。请检查 DSH 登录状态和访问地址。',
        'err.notfound': '未找到资源。请核对备份链接和访问权限；如果服务刚更新，请重启 DSH。',
        'err.stale-plan': '预览已失效、被使用或本机状态已改变。请重新预览。',
        'err.busy': '另一项恢复或安装正在进行。请稍后重新预览。',
        'err.invalid': '备份或请求无效，请核对后重试。',
        'err.invalidJson': '这不是有效的备份 JSON 文件。',
        'err.too-large': '备份超出大小上限。',
        'err.timeout': '请求超时。',
        'err.network': '无法连接服务。',
        'err.no-profile': 'DSH 未以 profile 启动，没有可读取的本机配置。',
        'err.no-cloud': '尚未关联备份，请输入来源链接。',
        'err.unsafe-path': '备份中含不安全的路径，已拒绝恢复。',
        'err.nothing-to-undo': '没有可撤销的恢复记录。',
        'err.bad-response': '服务没有返回可核实的完整数据。',
        'err.other': '操作未能完成。',
      },
      en: {
        tab: 'Config sync Plus',
        title: 'Config sync Plus',
        intro: 'Move settings and plugins between computers.',
        backup: 'Back up this machine',
        restore: 'Restore from backup',
        more: 'More',
        back: 'Back to home',
        cancel: 'Cancel',
        next: 'View preview',
        previewAgain: 'Preview again',
        previewReceiptSource: 'Preview this source again',
        noneYet: 'No backup yet',
        linked: 'Backup destination linked',
        ready: 'Backup ready',
        copy: 'Copy backup link',
        copied: 'Copied',
        manualCopy: 'Automatic copy was unavailable. Select and copy the link below.',
        link: 'Backup link',
        openGist: 'Open Gist',
        privacy: 'New backups are unlisted. Anyone with the link can read them. Configuration text is not redacted.',
        overwriteHint: 'Backing up again overwrites the backup file at the linked destination.',
        overwriteReview: 'Update the linked backup?',
        visibilityKept: 'Updating a Gist does not change visibility. A public Gist stays public.',
        uploadConfirm: 'Confirm backup update',
        uploadRetry: 'Retry backup',
        uploadScope: 'Uploads settings and the plugin manifest, not plugin packages or credential stores. Check text files for private information first.',
        uploadTarget: 'Upload destination',
        newGist: 'Create an unlisted Gist',
        uploadUncertain: 'The upload result could not be verified. Check the local record and destination Gist before uploading again.',
        refreshFailed: 'Local status could not be refreshed. Read it again; do not repeat the previous action.',
        hostMissing: 'Local configuration status is unavailable.',
        staleHost: 'The running host does not provide the required backup API. Restart DSH and try again.',
        statusRetry: 'Read local status again',
        localBusy: 'Reading local status…',
        uploadBusy: 'Backing up this machine…',
        previewBusy: 'Checking what this restore would change…',
        applyBusy: 'Applying the reviewed restore. Do not repeat the request.',
        pluginsBusy: 'Checking the local plugin manifest…',
        installBusy: 'Installing the reviewed plugins…',
        undoBusy: 'Undoing the configuration restore…',
        busy: 'Working…',
        sourceIntro: 'Paste the link from the other computer to see what would change here.',
        newMachineStep1: 'A Gist ID also works. A preview does not write settings, install packages or change the upload destination.',
        sourceLabel: 'Backup link or Gist ID',
        sourcePlaceholder: 'Paste a gist.github.com backup link or ID',
        changeSource: 'Use a different source',
        source: 'Source',
        targetProfile: 'Local profile',
        previewTitle: 'Restore preview',
        configMode: 'Restore configuration only',
        configPreview: 'Configuration-only preview',
        localPreview: 'Local file restore preview',
        configScope: 'Restores configuration without installing plugins. Full-file rules apply: package-manager policies such as .npmrc in this backup can overwrite local settings.',
        standardTrust: 'Trust both the backup and package sources before restoring. Changes affect every session in this profile. Review any requested build scripts separately.',
        configTrust: 'Restore only if you trust the entire backup. Changes affect every session in this profile.',
        configFiles: 'Configuration files',
        changeFiles: 'Configuration files to change: %n',
        fileCount: 'Files: %n',
        add: 'Add',
        overwrite: 'Overwrite',
        merge: 'Merge',
        identical: 'Unchanged',
        retained: 'Retained or skipped',
        showUnchanged: 'Unchanged files',
        pluginsToInstall: 'Plugins to install: %n',
        unresolved: 'Cannot install automatically — will skip',
        noSpec: 'No verifiable source recorded',
        installSource: 'Install source',
        alreadyEnable: 'Already installed; will be added to the enabled list',
        alreadyOther: 'Other already-installed packages',
        cannotVerify: 'The plugin inventory could not be verified. Combined restore is unavailable.',
        cannotVerifyHint: 'Check installed packages on the Plugins page. For configuration alone, use the separate, full-scope preview under More.',
        noChanges: 'Already matches this backup',
        filesSame: 'No configuration files need changing.',
        filesPluginsSame: 'No configuration files need changing and no plugins need installing.',
        noApplicable: 'There are no changes that can be applied automatically. Review the retained items or packages that need manual attention.',
        confirmCombined: 'Restore and install %n plugins',
        confirmOne: 'Restore and install 1 plugin',
        confirmFiles: 'Confirm configuration restore',
        confirmConfig: 'Restore configuration only',
        noInstall: 'No plugins will be installed.',
        reviewDone: 'Preview ready. No restore has been performed.',
        restoreDone: 'Restore complete',
        restoreUnverified: 'Last restore result not verified',
        restoreAttention: 'Configuration restored; some items need attention',
        changedCount: 'Configuration files changed: %n',
        installedCount: 'Plugins installed: %n',
        resultDetails: 'View results',
        warnings: 'Warnings',
        restart: 'Restart DSH for changes to take effect.',
        uncertain: 'The result could not be verified. Some changes may already have been applied. Check local status and undo history, then preview again.',
        pluginUnknown: 'The complete plugin installation result could not be verified.',
        pluginResults: 'Plugin installation results',
        stillMissing: 'Packages still missing',
        installed: 'Installed',
        present: 'Already present',
        failed: 'Failed',
        skipped: 'Skipped',
        pendingBuilds: 'Build scripts awaiting separate approval',
        buildHint: 'Review the script sources on the Plugins page and approve separately if appropriate. This page never approves builds.',
        retryHint: 'After addressing these items, preview again to check what is still missing.',
        undo: 'Undo last configuration restore',
        undoConfirm: 'Confirm undo',
        undoScope: 'Return files to their state before this restore, removing files it added. Later edits to those files may be lost.',
        undoLimit: 'Undo restores configuration only. It does not uninstall plugins.',
        undoWhen: 'Restore record',
        undoNone: 'There is no configuration restore to undo.',
        undoDone: 'Configuration restore undone',
        reverted: 'Files reverted: %n.',
        local: 'Local backup file',
        localHint: 'Import or export a configuration JSON file without connecting to GitHub.',
        import: 'Choose a backup file',
        export: 'Export configuration file',
        chooseAgain: 'Choose the file again',
        install: 'Install missing plugins separately',
        installHint: 'Check packages declared in this local profile, without reading the cloud or restoring configuration.',
        installConfirm: 'Install %n reviewed plugins',
        installOne: 'Install 1 reviewed plugin',
        installTrust: 'Install only sources you trust. Plugins can run code; this action does not approve new build scripts.',
        allPresent: 'Every package declared in this profile is already installed.',
        installUnknown: 'Missing local plugins could not be verified. Check the Plugins page.',
        refreshInventory: 'Check plugins again',
        inventoryChanged: 'The local manifest changed. Review the new sources before installing.',
        target: 'Manage backup destination',
        targetHint: 'Choose where future uploads go. This does not read or change the cloud. A temporary restore source is not saved as a destination.',
        targetNew: 'Next backup destination',
        targetInput: 'New Gist link or ID',
        targetEmpty: 'Leave empty to create a Gist on the next backup',
        targetWarning: 'After saving, the next backup overwrites the backup file in this Gist.',
        saveTarget: 'Save backup destination',
        targetSaved: 'Backup destination saved.',
        targetChanged: 'The local backup destination or options changed. Review the current scope first.',
        diagnostics: 'Diagnostics and settings',
        diagnosticsHint: 'These are local records, not a live check of the cloud.',
        lastUpload: 'Most recent upload',
        lastSync: 'Most recent cloud restore',
        never: 'No record',
        settingsFile: 'Local settings file',
        profileRoot: 'Profile directory',
        includeMachine: 'Include this machine’s usage counters (data/usage.json) in backups and exports',
        machineSaved: 'Backup scope updated.',
        machineIncluded: 'Includes this machine’s usage counters.',
        machineExcluded: 'Excludes this machine’s usage counters.',
        localInventory: 'Local file list',
        defaultInventory: 'Base backup scope (without optional usage counters)',
        excluded: 'Excluded by default',
        limits: 'Size limits: whole backup / Gist file',
        droppedDeps: 'Machine-local dependencies left out of the upload',
        repair: 'Restore GitHub access',
        tokenLabel: 'GitHub token for this request only',
        tokenHelp: 'Enter a token with Gist access below, set DSH_GITHUB_TOKEN / GITHUB_TOKEN in the startup environment and restart DSH, or run gh auth login on this machine. Updating an existing Gist requires write access to it.',
        tokenPrivacy: 'The token is not saved and is cleared after one request. Restore confirmation never sends it again.',
        authRetry: 'Leave empty to retry with local credentials.',
        'reason.no-plugin-manager': 'Plugin manager unavailable',
        'reason.plugin-manager-error': 'Plugin inventory could not be read',
        'note.local-path': 'A local path cannot be installed on this machine',
        'note.workspace-protocol': 'A workspace: reference cannot be resolved here',
        'note.missing-source': 'No verifiable installation source',
        'note.unsupported-source': 'This source does not support automatic installation',
        'note.invalid-name': 'Invalid package name',
        'note.stale-plan': 'The install list changed; preview again',
        'code.dependency': 'Dependencies',
        'code.lockfile': 'Lockfile',
        'code.hidden-dir': 'Hidden directory',
        'code.backup-copy': 'Backup copy',
        'code.symlink': 'Symbolic link',
        'code.machine-state': 'Machine usage',
        'code.credential': 'Credential store',
        'code.binary': 'Binary',
        'code.too-large': 'File too large',
        'code.tool-state': 'Temporary state',
        'code.local-dependency': 'Machine-local dependency',
        'code.local-policy': 'Retained by local policy; not overwritten',
        'err.bad-source': 'Enter a Gist ID or a standard https://gist.github.com backup link without credentials, query or fragment.',
        'err.auth': 'GitHub did not authorize this request.',
        'err.rate-limit': 'GitHub rate-limited this request, or the credential lacks permission. You can retry later.',
        'err.session-auth': 'DSH refused the request. Check the DSH sign-in and address.',
        'err.notfound': 'Resource not found. Check the link and access. If the host was just updated, restart DSH.',
        'err.stale-plan': 'This preview expired, was used, or the local state changed. Preview again.',
        'err.busy': 'Another restore or installation is running. Preview again when it finishes.',
        'err.invalid': 'The backup or request is not valid. Check it before retrying.',
        'err.invalidJson': 'This file is not valid backup JSON.',
        'err.too-large': 'The backup exceeds the size limit.',
        'err.timeout': 'The request timed out.',
        'err.network': 'The service is unreachable.',
        'err.no-profile': 'DSH was not started with a profile. No local configuration is available.',
        'err.no-cloud': 'No backup is linked. Enter a source link first.',
        'err.unsafe-path': 'An unsafe path in the backup prevented restoration.',
        'err.nothing-to-undo': 'There is no restore record to undo.',
        'err.bad-response': 'The service did not return complete, verifiable data.',
        'err.other': 'The operation could not be completed.',
      },
    }

    const CSS = `
.dpgsp-root { --ink:var(--dsw-alias-label-primary); --muted:var(--dsw-alias-label-secondary); --paper:var(--dsw-alias-bg-layer-1); --soft:var(--dsw-alias-bg-layer-2); --line:var(--dsw-alias-border-l1); --edge:var(--dsw-alias-border-l2); --brand:var(--dsw-alias-brand-primary); --good:var(--dsw-alias-state-success-primary); --warn:var(--dsw-alias-state-warn-primary); --error:var(--dsw-alias-state-error-primary); container-type:inline-size; max-width:820px; min-width:0; color:var(--ink); font:inherit; font-size:14px; line-height:1.55; overflow-wrap:anywhere; }
.dpgsp-root *, .dpgsp-root *::before { box-sizing:border-box; }
.dpgsp-panel { background:var(--paper); border:1px solid var(--line); border-radius:16px; }
.dpgsp-body { padding:clamp(18px,4cqi,34px); }
.dpgsp-root :is(h2,h3,h4,p,ul,dl,dd) { margin:0; }
.dpgsp-root h2 { font-size:clamp(20px,3.4cqi,27px); letter-spacing:-.025em; line-height:1.24; font-weight:650; }
.dpgsp-root h3 { font-size:16px; line-height:1.4; font-weight:620; }
.dpgsp-root h4 { font-size:14px; line-height:1.4; font-weight:600; }
.dpgsp-root .dpgsp-intro { margin-top:5px; color:var(--muted); font-size:14px; }
.dpgsp-header, .dpgsp-titleline, .dpgsp-actions, .dpgsp-status, .dpgsp-ready, .dpgsp-source, .dpgsp-foot, .dpgsp-row, .dpgsp-line, .dpgsp-check { display:flex; align-items:center; }
.dpgsp-header { gap:13px; align-items:flex-start; }
.dpgsp-titleline { align-items:center; gap:14px; flex:1; min-width:0; }
.dpgsp-mark { display:grid; place-items:center; flex:none; width:47px; height:47px; border:1px solid var(--line); border-radius:13px; background:var(--soft); background:color-mix(in srgb,var(--brand) 9%,var(--paper)); color:var(--brand); }
.dpgsp-icon { display:inline-block; flex:none; vertical-align:middle; }
.dpgsp-stack, .dpgsp-group, .dpgsp-iteminfo { display:grid; gap:10px; min-width:0; }
.dpgsp-stack { gap:18px; }
.dpgsp-group { gap:8px; }
.dpgsp-section { padding-top:22px; margin-top:23px; border-top:1px solid var(--line); }
.dpgsp-actions { flex-wrap:wrap; gap:9px; }
.dpgsp-btn { display:inline-flex; align-items:center; justify-content:center; gap:7px; max-width:100%; min-height:39px; padding:8px 15px; border:1px solid var(--edge); border-radius:8px; background:var(--paper); color:var(--ink); cursor:pointer; touch-action:manipulation; font:inherit; font-size:13px; font-weight:550; text-align:center; line-height:1.42; text-decoration:none; }
.dpgsp-btn:hover:not(:disabled) { background:var(--soft); border-color:var(--muted); }
.dpgsp-btn.dpgsp-primary { color:var(--paper); background:var(--ink); border-color:var(--ink); }
.dpgsp-btn.dpgsp-primary:hover:not(:disabled) { background:color-mix(in srgb,var(--ink) 88%,var(--paper)); border-color:var(--ink); }
.dpgsp-btn.dpgsp-quiet { background:transparent; border-color:transparent; color:var(--muted); padding:5px 7px; min-height:30px; font-weight:500; }
.dpgsp-btn.dpgsp-quiet:hover:not(:disabled) { color:var(--ink); background:var(--soft); border-color:transparent; }
.dpgsp-root :is(button,input):disabled { opacity:.55; cursor:not-allowed; }
.dpgsp-root :is(button,input,summary,a):focus-visible { outline:2px solid var(--brand); outline-offset:3px; }
.dpgsp-root :is(h2,h3)[tabindex]:focus { outline:none; }
.dpgsp-menuwrap { position:relative; flex:none; }
.dpgsp-menulist { position:absolute; z-index:2; top:calc(100% + 4px); inset-inline-end:0; width:min(260px,75cqi); display:grid; background:var(--dsw-alias-bg-overlay,var(--paper)); border:1px solid var(--edge); border-radius:10px; padding:5px; box-shadow:0 5px 18px var(--line); }
.dpgsp-menulist .dpgsp-btn { justify-content:flex-start; text-align:start; color:var(--ink); padding:8px 10px; }
.dpgsp-status { width:fit-content; max-width:100%; gap:8px; background:var(--soft); color:var(--muted); border:1px solid var(--line); border-radius:99px; padding:4px 11px; font-size:12px; font-weight:550; }
.dpgsp-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:var(--dsw-alias-state-idle-primary); }
.dpgsp-ready, .dpgsp-box { border:1px solid var(--line); border-radius:9px; padding:12px 14px; }
.dpgsp-ready { flex-wrap:wrap; justify-content:space-between; gap:8px 12px; background:var(--soft); background:color-mix(in srgb,var(--good) 8%,var(--paper)); border-color:color-mix(in srgb,var(--good) 30%,var(--line)); }
.dpgsp-ready .dpgsp-icon, .dpgsp-success > .dpgsp-line > .dpgsp-icon { color:var(--good); }
.dpgsp-ready h3 { color:var(--good); }
.dpgsp-ready .dpgsp-btn { min-height:30px; padding:4px 10px; font-size:12px; }
.dpgsp-box { display:grid; gap:7px; background:var(--soft); }
.dpgsp-warning { border-inline-start:3px solid var(--warn); }
.dpgsp-alert { border-inline-start:3px solid var(--error); }
.dpgsp-success { border-inline-start:3px solid var(--good); }
.dpgsp-line, .dpgsp-check { gap:8px; flex-wrap:wrap; }
.dpgsp-hint, .dpgsp-note, .dpgsp-source, .dpgsp-meta { color:var(--muted); font-size:12.5px; }
.dpgsp-note { display:flex; align-items:flex-start; gap:7px; }
.dpgsp-note > svg { margin-top:.16em; }
.dpgsp-source { gap:6px 9px; flex-wrap:wrap; }
.dpgsp-source strong { color:var(--ink); font-weight:550; }
.dpgsp-list { padding:0; list-style:none; border:1px solid var(--line); border-radius:9px; }
.dpgsp-row { gap:10px; padding:9px 12px; min-width:0; }
.dpgsp-row + .dpgsp-row { border-top:1px solid var(--line); }
.dpgsp-row > .dpgsp-icon { color:var(--muted); }
.dpgsp-row .dpgsp-iteminfo { flex:1; gap:2px; }
.dpgsp-root code { font: .94em/1.55 ui-monospace,SFMono-Regular,Consolas,monospace; overflow-wrap:anywhere; white-space:pre-wrap; unicode-bidi:isolate; }
.dpgsp-tag { flex:none; font-size:11.5px; color:var(--muted); background:var(--soft); border-radius:5px; padding:2px 7px; }
.dpgsp-details > summary { width:fit-content; max-width:100%; cursor:pointer; color:var(--muted); font-size:13px; padding:3px 0; }
.dpgsp-details > :not(summary) { margin-top:8px; }
.dpgsp-foot { background:var(--soft); border-top:1px solid var(--line); border-radius:0 0 16px 16px; padding:14px clamp(18px,4cqi,34px); flex-wrap:wrap; justify-content:flex-end; gap:12px 18px; }
.dpgsp-foot > .dpgsp-note { flex:1 1 190px; }
.dpgsp-foot .dpgsp-actions { justify-content:flex-end; }
.dpgsp-field { display:grid; gap:6px; min-width:0; }
.dpgsp-field label { font-weight:550; font-size:13px; }
.dpgsp-input { width:100%; max-width:100%; min-width:0; border:1px solid var(--edge); border-radius:8px; padding:9px 11px; color:var(--ink); background:var(--dsw-alias-bg-base); font:inherit; font-size:14px; }
.dpgsp-input[aria-invalid=true] { border-color:var(--error); }
.dpgsp-check { flex-wrap:nowrap; align-items:baseline; cursor:pointer; }
.dpgsp-check input { accent-color:var(--brand); }
.dpgsp-facts { display:grid; gap:5px; }
.dpgsp-facts > div { display:grid; grid-template-columns:minmax(75px, .45fr) 1fr; gap:10px; align-items:baseline; }
.dpgsp-facts dt { color:var(--muted); font-size:12.5px; }
.dpgsp-facts dd { min-width:0; }
.dpgsp-root .dpgsp-link { color:var(--brand); text-underline-offset:2px; }
.dpgsp-sr { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; border:0; }
@container (max-width:500px) { .dpgsp-body { padding:19px 15px; } .dpgsp-titleline { gap:10px; } .dpgsp-mark { width:39px; height:39px; border-radius:10px; } .dpgsp-header { gap:4px; } .dpgsp-section { padding-top:16px; margin-top:19px; } .dpgsp-foot { padding:12px 15px; } .dpgsp-foot > .dpgsp-note { flex-basis:100%; } .dpgsp-row { padding:8px 9px; } }
@container (max-width:330px) { .dpgsp-homeactions > .dpgsp-btn { width:100%; } .dpgsp-facts > div { grid-template-columns:1fr; gap:0; } .dpgsp-foot .dpgsp-actions { width:100%; } }
`

    const PATHS = {
      sync: 'M3 8h16m-5-5 5 5-5 5M21 16H5m5 5-5-5 5-5',
      up: 'M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5', down: 'M12 3v13m-5-5 5 5 5-5M4 15v5h16v-5',
      chevron: 'm7 10 5 5 5-5', arrow: 'M4 12h15m-6-6 6 6-6 6',
      file: 'M6 3h7l5 5v13H6zM13 3v6h5M9 13h6m-6 4h4',
      pkg: 'm12 3 8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9M8 5.3l8 4.5',
      pc: 'M3 4h18v13H3zM8 21h8m-4-4v4', shield: 'm12 3 8 3v5c0 5-4 8-8 10-4-2-8-5-8-10V6zm0 5v5m0 3v.1',
      info: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM12 10.5v6m0-9v.2',
      check: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM7.8 12.2l2.6 2.8 5.9-6.2',
      copy: 'M8 8h12v13H8zM16 8V3H4v13h4',
    }
    const icon = (key, size = 17) => h('svg', { className: 'dpgsp-icon', width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.65, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false }, h('path', { d: PATHS[key] }))
    const txt = value => typeof value === 'string' && value.trim() !== ''
    const number = value => Number.isSafeInteger(value) && value >= 0
    const names = items => Array.isArray(items) && items.every(item => typeof item === 'string')
    const countText = (t, key, n) => t(key).replace('%n', String(n))
    const fail = code => Object.assign(new Error(code), { code })
    const rowFile = file => txt(file?.path) && number(file.bytes)
    const excludedFile = file => txt(file?.path) && txt(file.code)
    const FILE_STATES = ['add', 'overwrite', 'merge', 'identical']
    const OUTCOMES = { installed: 'installed', 'already-present': 'present', failed: 'failed', skipped: 'skipped' }

    // Accept the host's bare ID alphabet, or an exact canonical HTTPS Gist path.
    // Never copy/open a raw URL supplied by the network, even on a success receipt.
    const bareId = id => typeof id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(id)
    function sourceId(raw) {
      const s = typeof raw === 'string' ? raw.trim() : ''
      if (bareId(s)) return s
      return /^https:\/\/gist\.github\.com\/(?:[a-z\d][a-z\d-]{0,38}\/)?([a-z\d_-]{1,64})\/?$/i.exec(s)?.[1] ?? null
    }
    function gistLink(ref) {
      if (!bareId(ref?.id)) return null
      if (typeof ref.htmlUrl === 'string' && sourceId(ref.htmlUrl) === ref.id && /^https:\/\//i.test(ref.htmlUrl)) return ref.htmlUrl.trim()
      return `https://gist.github.com/${ref.id}`
    }
    function formatTime(value) {
      if (!txt(value)) return '—'
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
    }
    function formatBytes(n) {
      return !number(n) ? '—' : n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KiB` : `${(n / 1048576).toFixed(1)} MiB`
    }
    function codeText(t, group, code) {
      const key = `${group}.${code}`
      return Object.hasOwn(DICT.en, key) ? t(key) : typeof code === 'string' ? code : ''
    }
    const errorText = (t, error) => Object.hasOwn(DICT.en, `err.${error?.code}`) ? t(`err.${error.code}`) : t('err.other')
    async function api(path, body, signal) {
      let response
      try {
        response = await fetch(`${API}${path}`, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', redirect: 'error', cache: 'no-store', signal,
          ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }) })
      } catch (error) { throw signal?.aborted ? error : fail('network') }
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        // An origin/login rejection from DSH is not a reason to ask for a GitHub token.
        const localDenial = data?.code === 'auth' && /^(?:DSH refused|refused: the Host)/i.test(data?.error ?? '')
        throw fail(localDenial ? 'session-auth' : data?.code ?? 'other')
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw fail('bad-response')
      return data
    }
    function validStatus(s) {
      return txt(s?.profile) && number(s.counts?.files) && number(s.counts.bytes)
        && Array.isArray(s.files) && s.files.every(rowFile) && Array.isArray(s.excluded) && s.excluded.every(excludedFile)
        && (s.cloud == null || ((s.cloud.gistId === null || typeof s.cloud.gistId === 'string') && typeof s.cloud.includeMachine === 'boolean'))
        && (s.undo == null || (txt(s.undo.stamp) && number(s.undo.files)))
    }
    function filePlan(p) {
      if (!txt(p?.profile) || !Array.isArray(p.files) || !Array.isArray(p.dropped) || !p.dropped.every(excludedFile)) return false
      const totals = { add: 0, overwrite: 0, merge: 0, identical: 0 }
      for (const f of p.files) {
        if (!txt(f?.path) || !Object.hasOwn(totals, f.status)) return false
        totals[f.status]++
      }
      return FILE_STATES.every(key => totals[key] === p.counts?.[key])
        && (p.manifest == null || names(p.manifest.bundlesAdded))
    }
    const changes = p => p.counts.add + p.counts.overwrite + p.counts.merge
    const skippedCount = p => Math.max(p.dropped.length, number(p.droppedEntries) ? p.droppedEntries : 0)
    const verifiedInventory = p => p?.available === true && names(p.installed) && Array.isArray(p.missing) && p.missing.every(entry =>
      txt(entry?.name) && typeof entry.resolvable === 'boolean' && (entry.spec == null || typeof entry.spec === 'string')
      && (entry.resolvable ? txt(entry.installSpec) : entry.installSpec === null))
    const installable = p => verifiedInventory(p) ? p.missing.filter(row => row.resolvable) : []
    const inventoryShape = p => p?.available === false || verifiedInventory(p)
    function validCloudPlan(p, mode, id) {
      if (!bareId(p?.ref?.id) || p.ref.id !== id || !filePlan(p.preview)) return false
      if (mode === 'config') return txt(p.planId) && p.plugins == null
      return p.plugins?.available === false ? p.planId === null : verifiedInventory(p.plugins) && txt(p.planId)
    }
    function actionable(p) {
      return !!p && (p.mode !== 'standard' || verifiedInventory(p.plugins)) && (changes(p.preview) > 0 || installable(p.plugins).length > 0)
    }
    function validRestore(r, plan) {
      if (!filePlan(r?.report) || !number(r.report.restored)) return false
      if (plan.mode === 'local') return true
      if (r.ref?.id !== plan.ref.id || typeof r.restart !== 'boolean' || !names(r.warnings ?? [])) return false
      return plan.mode === 'config' || (typeof r.complete === 'boolean' && typeof r.plugins?.available === 'boolean')
    }
    function verifiedReport(p) {
      return verifiedInventory(p) && Array.isArray(p.results) && p.results.every(row => txt(row?.name) && Object.hasOwn(OUTCOMES, row.outcome) && names(row.pendingBuilds))
        && Object.keys(OUTCOMES).every(key => number(p.outcomeCounts?.[key]) && p.outcomeCounts[key] === p.results.filter(row => row.outcome === key).length)
    }
    const pendingBuilds = p => [...new Set((Array.isArray(p?.results) ? p.results : []).flatMap(row => names(row?.pendingBuilds) ? row.pendingBuilds : []))]
    const incomplete = p => !verifiedReport(p) || p.missing.length > 0 || p.outcomeCounts.failed > 0 || p.outcomeCounts.skipped > 0 || pendingBuilds(p).length > 0
    function sourceKind(entry, t) {
      const full = entry.installSpec
      const prefixed = full.startsWith(`${entry.name}@`)
      const spec = prefixed ? full.slice(entry.name.length + 1) : full
      if (/^(?:git(?:\+|:|@)|ssh:|github:|gitlab:|bitbucket:)/i.test(spec) || /\.git(?:$|#)/i.test(spec)) return 'Git'
      if (/^https?:\/\//i.test(spec)) return /^https:/i.test(spec) ? 'HTTPS' : 'HTTP'
      if ((prefixed && /^[a-z\d*^~<>=][a-z\d*^~<>=.|+ -]*$/i.test(spec)) || /^npm:/i.test(spec)) return 'npm'
      return t('installSource')
    }

    function compatible(s) {
      const v = /^(\d+)\.(\d+)\.\d+(?:[-+].*)?$/.exec(s?.version ?? '')
      return !!s?.cloud && !!v && (+v[1] > 1 || (+v[1] === 1 && +v[2] >= 3))
    }
    function btn(action, label, onClick, { kind, glyph, ...props } = {}) {
      return h('button', { type: 'button', className: `dpgsp-btn${kind ? ` dpgsp-${kind}` : ''}`, 'data-action': action, onClick, ...props },
        glyph ? icon(glyph, 16) : null, label)
    }
    const box = (kind, ...children) => h('div', { className: `dpgsp-box${kind ? ` dpgsp-${kind}` : ''}` }, ...children)
    const note = (text, glyph = 'info') => h('p', { className: 'dpgsp-note' }, icon(glyph, 15), h('span', null, text))
    const hint = text => h('p', { className: 'dpgsp-hint' }, text)
    const details = (label, ...children) => h('details', { className: 'dpgsp-details' }, h('summary', null, label), ...children)
    const title = text => h('h2', { tabIndex: -1, 'data-focus': 'title' }, text)
    const facts = pairs => h('dl', { className: 'dpgsp-facts' }, pairs.filter(Boolean).map(([k, v]) => h('div', { key: k }, h('dt', null, k), h('dd', null, v))))
    const isolated = value => h('bdi', null, value)
    const mono = value => h('code', { dir: 'ltr' }, value)
    const heading = (text, ...children) => h('section', { className: 'dpgsp-group' }, h('h3', null, text), ...children)
    const badge = text => h('span', { className: 'dpgsp-tag' }, text)
    function list(items, makeRow) {
      return h('ul', { className: 'dpgsp-list' }, items.map((item, i) => h('li', { key: i, className: 'dpgsp-row' }, ...makeRow(item))))
    }
    const fileList = (files, t) => list(files, file => [icon('file'), h('div', { className: 'dpgsp-iteminfo' }, mono(file.path)), badge(t(file.status))])
    function FileChanges({ p, t }) {
      const changed = p.files.filter(f => f.status !== 'identical')
      const same = p.files.filter(f => f.status === 'identical')
      return h(React.Fragment, null,
        changed.length ? heading(countText(t, 'changeFiles', changed.length), fileList(changed, t)) : null,
        skippedCount(p) ? heading(`${t('retained')} (${skippedCount(p)})`,
          p.dropped.length ? list(p.dropped, f => [icon('file'), h('div', { className: 'dpgsp-iteminfo' }, mono(f.path), hint(codeText(t, 'code', f.code)))]) : null) : null,
        same.length ? details(`${t('showUnchanged')} (${same.length})`, fileList(same, t)) : null)
    }
    function PackageRows({ p, preview, t }) {
      const yes = installable(p)
      const no = p.missing.filter(row => !row.resolvable)
      const add = new Set(preview?.manifest?.bundlesAdded ?? [])
      const enabling = p.installed.filter(name => add.has(name))
      const other = p.installed.filter(name => !add.has(name))
      const group = (rows, resolvable) => list(rows, entry => {
        const spec = resolvable ? entry.installSpec : entry.spec
        // A Git/HTTPS spec can omit the package name. Display the full literal
        // spec, never turn it into a hyperlink, and never invent a registry.
        return [icon('pkg'), h('div', { className: 'dpgsp-iteminfo' },
          !resolvable || !spec.startsWith(`${entry.name}@`) ? h('strong', null, isolated(entry.name)) : null,
          h('div', null, resolvable ? h('span', { className: 'dpgsp-meta' }, sourceKind(entry, t), ' · ') : null, mono(spec ?? t('noSpec'))),
          resolvable ? null : hint(codeText(t, 'note', entry.note))) ]
      })
      const named = values => list(values, value => [icon('pkg'), mono(value)])
      return h(React.Fragment, null,
        yes.length ? heading(countText(t, 'pluginsToInstall', yes.length), group(yes, true)) : null,
        no.length ? heading(`${t('unresolved')} (${no.length})`, group(no, false)) : null,
        enabling.length ? heading(`${t('alreadyEnable')} (${enabling.length})`, named(enabling)) : null,
        other.length ? details(`${t('alreadyOther')} (${other.length})`, named(other)) : null)
    }
    function PlanBody({ plan, t, changeSource }) {
      const p = plan.preview
      const standard = plan.mode === 'standard'
      const unknown = standard && !verifiedInventory(plan.plugins)
      const missing = standard && !unknown ? plan.plugins.missing : []
      const blocked = skippedCount(p) > 0 || missing.some(row => !row.resolvable)
      const work = actionable(plan)
      return h(React.Fragment, null,
        h('div', { className: 'dpgsp-source' }, icon(plan.mode === 'local' ? 'file' : 'pc'), t('source'),
          h('strong', null, isolated([p.sourceProfile, plan.mode === 'local' ? plan.fileName : plan.ref.id].filter(txt).join(' · '))),
          txt(p.createdAt) ? h('span', null, formatTime(p.createdAt)) : null, changeSource),
        hint(`${t('targetProfile')}: ${p.profile}`),
        standard ? null : box(null, h('p', null, t('configScope'))),
        !work && !unknown ? box(blocked ? 'warning' : null,
          blocked ? h('p', null, t('noApplicable')) : h(React.Fragment, null, h('strong', null, t('noChanges')), hint(t(standard ? 'filesPluginsSame' : 'filesSame')))) : null,
        h(FileChanges, { p, t }),
        unknown ? box('warning', h('strong', null, t('cannotVerify')), hint(codeText(t, 'reason', plan.plugins.reason)), h('p', null, t('cannotVerifyHint'))) : null,
        standard && !unknown ? h(PackageRows, { p: plan.plugins, preview: p, t }) : null)
    }
    function PluginReport({ p, t }) {
      if (!p) return null
      const verified = verifiedReport(p)
      const results = Array.isArray(p.results) ? p.results.filter(row => txt(row?.name)) : []
      const scripts = pendingBuilds(p)
      const remaining = Array.isArray(p.missing) ? p.missing.filter(row => txt(row?.name)) : []
      return h('div', { className: 'dpgsp-group' },
        verified ? hint(Object.entries(OUTCOMES).map(([k, label]) => `${t(label)} ${p.outcomeCounts[k]}`).join(' · '))
          : box('warning', h('strong', null, t('pluginUnknown')), hint(codeText(t, 'reason', p.reason))),
        scripts.length ? box('warning', h('strong', null, t('pendingBuilds')), list(scripts, name => [mono(name)]), hint(t('buildHint'))) : null,
        results.length ? list(results, r => [icon('pkg'), h('div', { className: 'dpgsp-iteminfo' },
          h('span', null, isolated(r.name), ' · ', Object.hasOwn(OUTCOMES, r.outcome) ? t(OUTCOMES[r.outcome]) : t('pluginUnknown')),
          txt(r.message) ? hint(r.outcome === 'skipped' ? codeText(t, 'note', r.message) : r.message) : null)]) : null,
        remaining.length ? h('p', null, `${t('stillMissing')}: `, remaining.map(r => r.name).join(', ')) : null)
    }
    function RestoreReceipt({ receipt, t, undoButton, onRepreview, locked }) {
      if (!receipt) return null
      if (receipt.mode === 'unknown') return box('warning', h('h3', { tabIndex: -1, 'data-focus': 'restore-receipt' }, t('restoreUnverified')),
        hint(`${t('source')}: ${receipt.source}`), h('p', null, t('uncertain')), undoButton)
      if (receipt.mode === 'undo') return box('success', h('h3', { tabIndex: -1, 'data-focus': 'restore-receipt' }, t('undoDone')),
        h('p', null, countText(t, 'reverted', receipt.reverted), ' ', t('undoLimit')))
      const { result: r, mode } = receipt
      const attention = !!r.warnings?.length || (mode === 'standard' && (r.complete !== true || incomplete(r.plugins)))
      const scripts = pendingBuilds(r.plugins)
      const missing = verifiedInventory(r.plugins) ? r.plugins.missing : null
      const retry = mode === 'standard' && missing?.length > 0
      const results = Array.isArray(r.plugins?.results) ? r.plugins.results : []
      const failed = results.filter(item => item?.outcome === 'failed').length
      const skipped = results.filter(item => item?.outcome === 'skipped').length
      return h('section', { className: `dpgsp-box dpgsp-${attention ? 'warning' : 'success'}`, 'aria-label': t(attention ? 'restoreAttention' : 'restoreDone') },
        h('h3', { tabIndex: -1, 'data-focus': 'restore-receipt', className: 'dpgsp-line' }, icon(attention ? 'info' : 'check'), t(attention ? 'restoreAttention' : 'restoreDone')),
        h('p', null, [countText(t, 'changedCount', changes(r.report)), verifiedReport(r.plugins) ? countText(t, 'installedCount', r.plugins.outcomeCounts.installed) : null,
          receipt.restart ? t('restart') : null].filter(Boolean).join(' · ')),
        scripts.length ? note(`${t('pendingBuilds')}: ${scripts.join(', ')}. ${t('buildHint')}`, 'shield') : null,
        r.warnings?.length ? box('warning', h('strong', null, t('warnings')), list(r.warnings, w => [w])) : null,
        mode === 'standard' && !verifiedReport(r.plugins) ? hint(t('pluginUnknown')) : null,
        failed || skipped || missing?.length ? h('p', null, [failed ? `${t('failed')} ${failed}` : null, skipped ? `${t('skipped')} ${skipped}` : null, missing?.length ? `${t('stillMissing')} ${missing.length}` : null].filter(Boolean).join(' · ')) : null,
        retry ? h('div', { className: 'dpgsp-group' }, hint(t('retryHint')), h('div', { className: 'dpgsp-actions' }, btn('preview-receipt-source', t('previewReceiptSource'), onRepreview, { kind: 'quiet', disabled: locked }))) : null,
        details(t('resultDetails'), h('div', { className: 'dpgsp-stack' },
          hint(`${t('source')}: ${receipt.fileName ?? r.ref?.id ?? '—'}`), h(FileChanges, { p: r.report, t }),
          r.plugins ? heading(t('pluginResults'), h(PluginReport, { p: r.plugins, t })) : null)),
        hint(t('undoLimit')), undoButton)
    }
    function CopyReceipt({ url, t }) {
      const [state, setState] = React.useState('idle')
      const field = React.useRef(null)
      const alive = React.useRef(false)
      React.useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
      React.useEffect(() => { if (state === 'manual') { field.current?.focus(); field.current?.select() } }, [state])
      const copy = async () => {
        try {
          if (!navigator.clipboard?.writeText) throw Error()
          await navigator.clipboard.writeText(url)
          if (alive.current) setState('copied')
        } catch { if (alive.current) { setState('manual'); field.current?.focus(); field.current?.select() } }
      }
      return h('section', { className: 'dpgsp-group', 'aria-label': t('ready') },
        h('div', { className: 'dpgsp-ready' }, h('h3', { tabIndex: -1, className: 'dpgsp-line', 'data-focus': 'backup-receipt' }, icon('check'), t('ready')),
          btn('copy', t('copy'), copy, { glyph: 'copy' })),
        h('span', { role: 'status', className: state === 'idle' ? 'dpgsp-sr' : 'dpgsp-hint' }, state === 'copied' ? t('copied') : state === 'manual' ? t('manualCopy') : ''),
        state === 'manual' ? h('label', { className: 'dpgsp-field' }, t('link'), h('input', { className: 'dpgsp-input', ref: field, readOnly: true, value: url, dir: 'ltr', onFocus: e => e.target.select() })) : null)
    }
    function LocalInventory({ status: s, t }) {
      return details(t('localInventory'), h('div', { className: 'dpgsp-stack' },
        heading(`${t('defaultInventory')} (${s.files.length})`, list(s.files, f => [icon('file'), h('div', { className: 'dpgsp-iteminfo' }, mono(f.path)), badge(formatBytes(f.bytes))])),
        heading(`${t('excluded')} (${s.excluded.length})`, list(s.excluded, f => [h('div', { className: 'dpgsp-iteminfo' }, mono(f.path), hint(codeText(t, 'code', f.code)))]))))
    }

    function Panel({ ctx, t }) {
      React.useSyncExternalStore(fn => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot())
      const uid = React.useId()
      const root = React.useRef(null)
      const mounted = React.useRef(false)
      const flight = React.useRef(null)
      const selected = React.useRef(null)
      const focusNext = React.useRef(null)
      const opener = React.useRef('restore')
      const fileInput = React.useRef(null)
      const tokenInput = React.useRef(null)
      const moreButton = React.useRef(null)
      const [page, setPage] = React.useState({ name: 'home' })
      const [status, setStatus] = React.useState(null)
      const [statusError, setStatusError] = React.useState(null)
      const [uploadCheck, setUploadCheck] = React.useState(null)
      const [busy, setBusy] = React.useState(null)
      const [issue, setIssue] = React.useState(null)
      const [menu, setMenu] = React.useState(false)
      const [sourceDraft, setSourceDraft] = React.useState('')
      const [targetDraft, setTargetDraft] = React.useState('')
      const [backupReceipt, setBackupReceipt] = React.useState(null)
      const [restoreReceipt, setRestoreReceipt] = React.useState(null)
      const [installReceipt, setInstallReceipt] = React.useState(null)
      const [announcement, setAnnouncement] = React.useState('')

      // One cancellable read or non-repeatable write at a time. A ref closes the
      // gap between a button event and React committing its disabled state.
      async function run(label, write, task, onError) {
        if (flight.current || !mounted.current) return
        const job = { write, controller: new AbortController() }
        const active = () => mounted.current && flight.current === job
        const call = async (path, body) => {
          if (!active()) throw fail('cancelled')
          const data = await api(path, body, job.controller.signal)
          if (!active()) throw fail('cancelled')
          return data
        }
        flight.current = job
        setBusy(label)
        setIssue(null)
        setAnnouncement('')
        try { await task(call, active) }
        catch (error) {
          if (active()) {
            if (onError) onError(error)
            else setIssue({ error })
          }
        } finally {
          if (active()) { flight.current = null; setBusy(null) }
        }
      }
      function releaseRead() {
        const job = flight.current
        if (job?.write) return false
        if (job) { flight.current = null; job.controller.abort(); setBusy(null) }
        return true
      }
      function takeToken() {
        const input = tokenInput.current
        const value = input?.value.trim() ?? ''
        if (input) input.value = ''
        return value ? { token: value } : {}
      }
      function move(next, focus = 'title') {
        // A source or token never lives in a subsequent independent workflow.
        if (tokenInput.current) tokenInput.current.value = ''
        selected.current = null
        setIssue(null)
        setMenu(false)
        setSourceDraft('')
        setTargetDraft('')
        setAnnouncement('')
        focusNext.current = focus
        setPage(next)
      }
      function home(focus = opener.current) {
        if (releaseRead()) move({ name: 'home' }, focus)
      }
      async function readStatus(call) {
        const s = await call('/status')
        if (!validStatus(s)) throw fail('bad-response')
        setStatus(s)
        setStatusError(null)
        setUploadCheck(null)
        return s
      }
      // This is deliberately isolated from the mutation's try/catch: a failed
      // local refresh is NOT a failed upload/restore or a reason to replay it.
      async function afterWrite(call, active) {
        setBusy('localBusy')
        try { await readStatus(call) } catch (error) { if (active()) setStatusError(error) }
      }
      function retryStatus() {
        return run('localBusy', false, async call => {
          const s = await readStatus(call)
          if (page.name === 'undo') move({ name: 'undo', snapshot: s.undo })
          else if (page.name === 'backup' || page.name === 'home') move({ name: 'home' }, compatible(s) ? 'backup' : 'title')
        }, setStatusError)
      }
      React.useEffect(() => {
        mounted.current = true
        // Mount only reads the local summary. No automatic cloud request,
        // token lookup, package inventory, install, or settings write.
        void run('localBusy', false, readStatus, setStatusError)
        return () => {
          mounted.current = false
          if (!flight.current?.write) flight.current?.controller.abort()
          flight.current = null
          selected.current = null
          if (tokenInput.current) tokenInput.current.value = ''
        }
      }, [])
      React.useEffect(() => {
        const name = focusNext.current
        if (!name) return
        const element = root.current?.querySelector(`[data-focus="${name}"]`)
        if (element?.disabled && busy) return
        const target = element && !element.disabled ? element : root.current?.querySelector('[data-focus="title"]')
        if (target) { focusNext.current = null; target.focus() }
      }, [page, busy, status, issue])
      const cloud = status?.cloud
      const targetId = cloud?.gistId ?? null
      const includeMachine = cloud?.includeMachine === true
      const stale = !compatible(status) || statusError !== null || uploadCheck !== null
      const locked = stale || busy !== null
      const rootAction = (which, action) => () => {
        if (locked || flight.current) return
        opener.current = which
        action()
      }
      const repairable = e => e?.code === 'auth' || e?.code === 'rate-limit'
      const consumedPlanError = e => !['stale-plan', 'busy'].includes(e?.code)
      const notice = (key, extra = {}) => setIssue({ key, ...extra })

      function sourcePage(mode) {
        if (releaseRead()) move({ name: 'source', mode }, 'source')
      }
      function displayPlan(p) {
        move({ name: 'preview', mode: p.mode, id: p.ref?.id, fileName: p.fileName, plan: p })
        selected.current = p
        setAnnouncement('reviewDone')
      }
      function prepare(mode, id, token = {}) {
        if (stale || flight.current || !bareId(id)) return
        move({ name: 'preview', mode, id })
        return run('previewBusy', false, async call => {
          const data = await call(mode === 'config' ? '/config/preview' : '/sync/preview', { id, ...token })
          if (!validCloudPlan(data, mode, id)) throw fail('bad-response')
          displayPlan({ ...data, mode })
        }, error => setIssue({ error, repair: repairable(error) }))
      }
      function openRestore(mode) {
        if (bareId(targetId)) return prepare(mode, targetId)
        sourcePage(mode)
      }
      function sourceSubmit(e) {
        e.preventDefault()
        if (locked || flight.current) return
        const id = sourceId(sourceDraft)
        if (!id) { focusNext.current = 'source'; setIssue({ error: fail('bad-source') }); return }
        return prepare(page.mode, id)
      }
      function confirmPlan() {
        const p = selected.current
        if (locked || flight.current || !p || p !== page.plan || !actionable(p)) return
        selected.current = null // one-shot; even a lost response needs a new preview
        move({ name: 'preview', mode: p.mode, id: p.ref?.id, fileName: p.fileName })
        return run('applyBusy', true, async (call, active) => {
          const route = p.mode === 'local' ? '/restore' : p.mode === 'config' ? '/config/restore' : '/sync/install'
          const r = await call(route, { planId: p.planId, confirm: true })
          if (!validRestore(r, p)) throw fail('bad-response')
          setRestoreReceipt({ mode: p.mode, result: r, fileName: p.fileName, restart: p.mode === 'local' ? changes(r.report) > 0 : r.restart })
          move({ name: 'home' }, 'restore-receipt')
          await afterWrite(call, active)
        }, error => {
          const uncertain = consumedPlanError(error)
          if (uncertain) setRestoreReceipt({ mode: 'unknown', source: p.ref?.id ?? p.fileName })
          setIssue({ error, uncertain })
        })
      }
      function chooseFile(event) {
        const file = event.currentTarget.files?.[0]
        event.currentTarget.value = ''
        if (!file || locked || flight.current) return
        move({ name: 'preview', mode: 'local', fileName: file.name })
        return run('previewBusy', false, async (call, active) => {
          // Matches the host's JSON import transport ceiling; the host validates
          // the actual document and backup byte limits before making a plan.
          if (file.size > 4 * 1024 * 1024) throw fail('too-large')
          const text = await file.text()
          if (!active()) return
          let backup
          try { backup = JSON.parse(text) } catch { throw fail('invalidJson') }
          const r = await call('/preview', { backup, reviewed: true })
          if (!txt(r.planId) || !filePlan(r.preview)) throw fail('bad-response')
          displayPlan({ mode: 'local', fileName: file.name, planId: r.planId, preview: r.preview })
        })
      }
      function beginUpload(expectedId, expectedMachine, token = {}) {
        if (locked || flight.current) return
        let sent = false
        return run('uploadBusy', true, async (call, active) => {
          // Verify the displayed destination is still current, including the
          // distinct “create a new Gist” case. Never use a restore/target draft.
          const s = await readStatus(call)
          if (!compatible(s)) throw fail('bad-response')
          if (s.cloud.gistId !== expectedId || s.cloud.includeMachine !== expectedMachine) {
            move({ name: 'backup', id: s.cloud.gistId, includeMachine: s.cloud.includeMachine })
            notice('targetChanged'); return
          }
          if (expectedId !== null && !bareId(expectedId)) throw fail('bad-source')
          sent = true
          const r = await call('/gist/upload', { expectedTarget: expectedId, includeMachine: expectedMachine, ...token })
          if (!bareId(r.ref?.id) || (expectedId !== null && r.ref.id !== expectedId) || !number(r.files) || !number(r.bytes)) throw fail('bad-response')
          setBackupReceipt(r)
          // The upload receipt confirms the host saved this id; retain the link
          // even if the GET /status after it fails. Don't invent an upload time.
          setStatus(old => ({ ...old, cloud: { ...old.cloud, gistId: r.ref.id } }))
          move({ name: 'home' }, 'backup-receipt')
          await afterWrite(call, active)
        }, error => {
          move({ name: 'backup', id: expectedId, includeMachine: expectedMachine })
          const repair = sent && repairable(error)
          const changed = error?.code === 'stale-plan'
          const unknown = sent && !repair && !['stale-plan', 'notfound', 'too-large', 'busy', 'session-auth'].includes(error?.code)
          if (changed || unknown) setUploadCheck(changed ? 'targetChanged' : 'uploadUncertain')
          setIssue(changed ? { key: 'targetChanged' } : { error, repair, uploadUncertain: unknown })
        })
      }
      function backup() {
        if (targetId === null) return beginUpload(null, includeMachine)
        move({ name: 'backup', id: targetId, includeMachine })
      }
      function openTarget() {
        move({ name: 'target' }, 'target')
        setTargetDraft(targetId ?? '')
      }
      function saveTarget(e) {
        e.preventDefault()
        if (locked || flight.current) return
        const raw = targetDraft.trim()
        const id = raw === '' ? null : sourceId(raw)
        if (raw !== '' && !id) { focusNext.current = 'target'; setIssue({ error: fail('bad-source') }); return }
        if (id === targetId) return
        return run('busy', true, async (call, active) => {
          const r = await call('/settings', { gistId: id ?? '' })
          if (!r.cloud || r.cloud.gistId !== id || typeof r.cloud.includeMachine !== 'boolean') throw fail('bad-response')
          setStatus(s => ({ ...s, cloud: r.cloud }))
          // An old upload is not evidence that a newly linked Gist holds it.
          setBackupReceipt(old => old?.ref.id === id ? old : null)
          setTargetDraft(id ?? '')
          setAnnouncement('targetSaved')
          await afterWrite(call, active)
        })
      }
      function toggleMachine(value) {
        if (locked || flight.current) return
        return run('busy', true, async (call, active) => {
          const r = await call('/settings', { includeMachine: value })
          if (r.cloud?.includeMachine !== value) throw fail('bad-response')
          setStatus(s => ({ ...s, cloud: r.cloud }))
          setAnnouncement('machineSaved')
          await afterWrite(call, active)
        })
      }
      function openPlugins() {
        if (stale || flight.current) return
        move({ name: 'plugins' })
        return run('pluginsBusy', false, async call => {
          const inventory = await call('/plugins')
          if (!inventoryShape(inventory)) throw fail('bad-response')
          move({ name: 'plugins', inventory })
        })
      }
      function installPlugins() {
        const reviewed = page.inventory
        if (locked || flight.current || !installable(reviewed).length) return
        let sent = false
        move({ name: 'plugins' })
        return run('installBusy', true, async call => {
          // The standalone endpoint uses the local manifest, not a Gist plan.
          // If the current inventory no longer matches the review, stop here.
          const current = await call('/plugins')
          if (!inventoryShape(current)) throw fail('bad-response')
          const specs = x => x.missing.map(row => [row.name, row.resolvable, row.installSpec, row.note])
          if (!verifiedInventory(current) || JSON.stringify(specs(current)) !== JSON.stringify(specs(reviewed))) {
            move({ name: 'plugins', inventory: current }); notice('inventoryChanged'); return
          }
          sent = true
          const expectedPackages = installable(reviewed).map(({ name, installSpec }) => ({ name, installSpec }))
          const result = await call('/plugins/install', { expectedPackages })
          if (typeof result.available !== 'boolean' || !Array.isArray(result.results)) throw fail('bad-response')
          setInstallReceipt(result)
          move({ name: 'plugins', showResult: true })
        }, error => setIssue({ error, uncertain: sent && consumedPlanError(error) }))
      }
      function openUndo(expectedStamp = null) {
        if (stale || flight.current) return
        move({ name: 'undo' })
        return run('localBusy', false, async call => {
          const s = await readStatus(call)
          if (expectedStamp && s.undo?.stamp !== expectedStamp) { move({ name: 'home' }, 'restore-receipt'); setIssue({ error: fail('stale-plan') }); return }
          move({ name: 'undo', snapshot: s.undo })
        })
      }
      function doUndo() {
        if (locked || flight.current || !page.snapshot?.stamp) return
        const reviewed = page.snapshot
        let sent = false
        move({ name: 'undo' })
        return run('undoBusy', true, async (call, active) => {
          const s = await readStatus(call)
          if (!compatible(s) || s.undo?.stamp !== reviewed.stamp || s.undo.files !== reviewed.files) {
            move({ name: 'home' }, 'more'); setIssue({ error: fail('stale-plan') }); return
          }
          sent = true
          const r = await call('/undo', { expectedStamp: reviewed.stamp })
          if (r.report?.stamp !== reviewed.stamp || !number(r.report.reverted)) throw fail('bad-response')
          setRestoreReceipt({ mode: 'undo', reverted: r.report.reverted })
          move({ name: 'home' }, 'restore-receipt')
          await afterWrite(call, active)
        }, error => setIssue({ error, uncertain: sent && consumedPlanError(error) }))
      }

      const alerts = () => h(React.Fragment, null,
        uploadCheck && page.name !== 'backup' ? box('warning', h('p', { role: 'alert' }, t(uploadCheck)), h('div', { className: 'dpgsp-actions' }, btn('retry-status', t('statusRetry'), retryStatus, { disabled: !!busy }))) : null,
        statusError ? h('div', { className: 'dpgsp-box dpgsp-warning', role: 'alert' },
          h('strong', null, t(status ? 'refreshFailed' : 'hostMissing')), hint(errorText(t, statusError)),
          h('div', { className: 'dpgsp-actions' }, btn('retry-status', t('statusRetry'), retryStatus, { disabled: !!busy }))) : null,
        issue ? h('div', { className: `dpgsp-box dpgsp-${issue.error ? 'alert' : 'warning'}`, role: issue.error ? 'alert' : 'status' },
          issue.error ? h('p', null, errorText(t, issue.error)) : null, issue.key ? h('p', null, t(issue.key)) : null,
          issue.uncertain ? h('p', null, t('uncertain')) : null, issue.uploadUncertain ? h('p', null, t('uploadUncertain')) : null) : null,
        busy ? h('p', { className: 'dpgsp-hint', role: 'status' }, t(busy)) : null)
      const footer = (buttons, trust) => h('footer', { className: 'dpgsp-foot' }, trust ? note(trust, 'shield') : null,
        h('div', { className: 'dpgsp-actions' }, ...buttons))
      const isWrite = flight.current?.write === true
      const cancel = (back = false) => btn('cancel', t(back ? 'back' : 'cancel'), () => home(), { disabled: isWrite })
      const formId = `${uid}-form`
      const showRepair = issue?.repair === true && (page.name === 'backup' || (page.name === 'preview' && page.mode !== 'local'))
      const retryCloudRead = () => prepare(page.mode, page.id, takeToken())
      const retryUpload = () => beginUpload(page.id, page.includeMachine, takeToken())
      const repairView = retry => !showRepair ? null : h('form', { id: `${uid}-repair`, className: 'dpgsp-box', onSubmit: e => { e.preventDefault(); retry() } },
        h('h3', null, t('repair')), hint(t('tokenHelp')),
        h('div', { className: 'dpgsp-field' }, h('label', { htmlFor: `${uid}-token` }, t('tokenLabel')),
          h('input', { type: 'password', className: 'dpgsp-input', id: `${uid}-token`, ref: tokenInput, autoComplete: 'off', spellCheck: false, autoCapitalize: 'none',
            disabled: locked, 'aria-describedby': `${uid}-token-help` })),
        h('p', { className: 'dpgsp-hint', id: `${uid}-token-help` }, t('tokenPrivacy'), ' ', t('authRetry')))
      const retryProps = showRepair ? { type: 'submit', form: `${uid}-repair` } : {}
      const goMore = (key, action, glyph) => btn(key, t(key), action, { kind: 'quiet', glyph, disabled: locked })
      function menuView() {
        return h('div', { className: 'dpgsp-menuwrap', onBlur: e => { if (!e.currentTarget.contains(e.relatedTarget)) setMenu(false) } },
          btn('more', h(React.Fragment, null, t('more'), icon('chevron', 13)), () => { opener.current = 'more'; setMenu(v => !v) }, { kind: 'quiet', ref: moreButton, 'data-focus': 'more',
            'aria-expanded': menu, 'aria-controls': menu ? `${uid}-more` : undefined, disabled: locked }),
          menu ? h('nav', { id: `${uid}-more`, className: 'dpgsp-menulist', 'aria-label': t('more') },
            goMore('local', () => move({ name: 'local' }), 'file'), goMore('configMode', () => openRestore('config'), 'down'),
            goMore('install', openPlugins, 'pkg'), goMore('target', openTarget, 'arrow'), goMore('diagnostics', () => move({ name: 'diagnostics' }), 'info'),
            status?.undo ? goMore('undo', () => openUndo(), 'shield') : null) : null)
      }
      const linkView = id => {
        const href = gistLink({ id })
        return href ? h('a', { className: 'dpgsp-link', href, target: '_blank', rel: 'noopener noreferrer', referrerPolicy: 'no-referrer' }, href) : isolated(id ?? t('newGist'))
      }
      const receiptStamp = restoreReceipt?.result?.report?.undoStamp
      const receiptUndo = txt(receiptStamp) && receiptStamp === status?.undo?.stamp ? h('div', { className: 'dpgsp-actions' }, btn('undo-review', t('undo'), rootAction('restore', () => openUndo(receiptStamp)), { kind: 'quiet', disabled: locked })) : null
      const frame = (content, foot) => h('section', { className: 'dpgsp-panel', 'aria-label': t('tab') },
        h('div', { className: 'dpgsp-body dpgsp-stack' }, content), foot)
      const intro = (key, subtitle) => h('header', null, title(t(key)), subtitle ? h('p', { className: 'dpgsp-intro' }, t(subtitle)) : null)
      function homeView() {
        const uploaded = targetId && backupReceipt?.ref?.id === targetId ? backupReceipt : null
        const history = cloud?.lastUpload
        const readyUrl = uploaded ? gistLink(uploaded.ref) : (bareId(targetId) && history?.gistId === targetId && txt(history.at) && number(history.files)
          ? gistLink({ id: targetId }) : null)
        const dropped = Array.isArray(uploaded?.dropped) ? uploaded.dropped.filter(row => txt(row?.name)) : []
        const normal = status && compatible(status)
        return frame(h('div', null,
          h('header', { className: 'dpgsp-header' }, h('div', { className: 'dpgsp-titleline' }, h('span', { className: 'dpgsp-mark' }, icon('sync', 26)),
            h('div', null, title(t('title')), h('p', { className: 'dpgsp-intro' }, t('intro')))), normal ? menuView() : null),
          h('div', { className: 'dpgsp-section dpgsp-stack' },
            !status || !compatible(status) ? h(React.Fragment, null, alerts(), status ? box('warning', h('p', null, t('staleHost')),
              h('div', { className: 'dpgsp-actions' }, btn('retry-status', t('statusRetry'), retryStatus, { disabled: !!busy }))) : null) : h(React.Fragment, null,
              readyUrl ? h(CopyReceipt, { key: readyUrl, url: readyUrl, t })
                : h('p', { className: 'dpgsp-status' }, h('span', { className: 'dpgsp-dot', 'aria-hidden': true }), t(targetId ? 'linked' : 'noneYet')),
              h('div', { className: 'dpgsp-actions dpgsp-homeactions' },
                btn('backup', t('backup'), rootAction('backup', backup), { kind: 'primary', glyph: 'up', disabled: locked, 'data-focus': 'backup' }),
                btn('restore', t('restore'), rootAction('restore', () => openRestore('standard')), { glyph: 'down', disabled: locked, 'data-focus': 'restore' })),
              note([targetId ? t('overwriteHint') : null, t('privacy')].filter(Boolean).join(' ')),
              alerts(),
              dropped.length ? details(`${t('droppedDeps')} (${uploaded.droppedEntries ?? dropped.length})`, list(dropped, row => [isolated(row.name), mono(row.spec ?? '')])) : null,
              h(RestoreReceipt, { receipt: restoreReceipt, t, undoButton: receiptUndo, locked, onRepreview: rootAction('restore', () => prepare('standard', restoreReceipt.result.ref.id)) })))))
      }
      function sourceView() {
        return frame(h(React.Fragment, null, intro(page.mode === 'config' ? 'configMode' : 'restore', 'sourceIntro'),
          page.mode === 'config' ? note(t('configScope'), 'shield') : null,
          h('form', { id: formId, onSubmit: sourceSubmit, className: 'dpgsp-group' }, h('div', { className: 'dpgsp-field' },
            h('label', { htmlFor: `${uid}-source` }, t('sourceLabel')), h('input', { id: `${uid}-source`, className: 'dpgsp-input', 'data-focus': 'source',
              type: 'text', inputMode: 'url', autoComplete: 'off', spellCheck: false, autoCapitalize: 'none', placeholder: t('sourcePlaceholder'), value: sourceDraft, disabled: locked,
              'aria-describedby': `${uid}-source-help`, 'aria-invalid': issue?.error?.code === 'bad-source' || undefined,
              onChange: e => { setSourceDraft(e.target.value); setIssue(null) } })),
            h('p', { id: `${uid}-source-help`, className: 'dpgsp-hint' }, t('newMachineStep1'))), alerts()),
          footer([cancel(), btn('preview', t('next'), undefined, { kind: 'primary', type: 'submit', form: formId, disabled: locked || !sourceDraft.trim() })]))
      }
      function previewView() {
        const p = page.plan
        const local = page.mode === 'local'
        const standard = page.mode === 'standard'
        const canApply = actionable(p)
        const n = installable(p?.plugins).length
        const confirmLabel = standard && n > 0 ? countText(t, n === 1 ? 'confirmOne' : 'confirmCombined', n) : t(standard ? 'confirmFiles' : 'confirmConfig')
        const buttons = [cancel(!!p && !canApply)]
        if (p && canApply) buttons.push(btn('confirm', confirmLabel, confirmPlan, { kind: 'primary', disabled: locked }))
        else if (!busy && (!p || (standard && !verifiedInventory(p.plugins)))) {
          buttons.push(local ? btn('choose-again', t('chooseAgain'), () => move({ name: 'local' }, 'pick'), { kind: 'primary', disabled: locked })
            : btn('preview', t('previewAgain'), showRepair ? undefined : retryCloudRead, { kind: 'primary', disabled: locked, ...retryProps }))
        }
        const changeSource = !local && !isWrite ? btn('change-source', t('changeSource'), () => sourcePage(page.mode), { kind: 'quiet' }) : null
        return frame(h(React.Fragment, null, intro(standard ? 'previewTitle' : local ? 'localPreview' : 'configPreview'),
          p ? h(PlanBody, { plan: p, t, changeSource }) : h('div', { className: 'dpgsp-source' }, `${t('source')}: `, isolated(local ? page.fileName : page.id), changeSource),
          alerts(), repairView(retryCloudRead),
          p && canApply ? hint(t('undoLimit')) : null),
        footer(buttons, canApply ? t(standard ? 'standardTrust' : 'configTrust') : null))
      }
      function backupView() {
        const brokenId = page.id !== null && !bareId(page.id)
        const mustRead = uploadCheck !== null
        const primary = mustRead ? btn('retry-status', t('statusRetry'), retryStatus, { kind: 'primary', disabled: !!busy })
          : btn('confirm-backup', t(page.id === null ? 'backup' : 'uploadConfirm'), showRepair ? undefined : retryUpload,
            { kind: 'primary', disabled: locked || brokenId, ...retryProps })
        return frame(h(React.Fragment, null, intro(page.id === null ? 'backup' : 'overwriteReview', 'uploadScope'),
          facts([[t('uploadTarget'), linkView(page.id)], [t('targetProfile'), status?.profile]]),
          note([page.id ? t('visibilityKept') : null, t('privacy')].filter(Boolean).join(' '), 'shield'),
          hint(t(page.includeMachine ? 'machineIncluded' : 'machineExcluded')),
          status ? h(LocalInventory, { status, t }) : null, alerts(), repairView(retryUpload)), footer([cancel(), primary]))
      }
      function localView() {
        return frame(h(React.Fragment, null, intro('local', 'localHint'),
          h('p', null, t('configScope')), note(t(includeMachine ? 'machineIncluded' : 'machineExcluded')),
          h('div', { className: 'dpgsp-actions' },
            h('input', { type: 'file', hidden: true, accept: '.json,application/json', ref: fileInput, onChange: chooseFile }),
            btn('pick-file', t('import'), () => fileInput.current?.click(), { kind: 'primary', glyph: 'file', disabled: locked, 'data-focus': 'pick' }),
            !locked ? h('a', { className: 'dpgsp-btn', 'data-action': 'export', href: `${API}/export${includeMachine ? '?include=machine' : ''}`, download: true }, icon('up', 16), t('export')) : null), alerts()), footer([cancel(true)]))
      }
      function pluginsView() {
        const p = page.inventory
        const n = installable(p).length
        const result = page.showResult ? installReceipt : null
        const buttons = [cancel(!n)]
        if (n) buttons.push(btn('confirm-install', countText(t, n === 1 ? 'installOne' : 'installConfirm', n), installPlugins, { kind: 'primary', disabled: locked }))
        else if (!busy) buttons.push(btn('check-plugins', t('refreshInventory'), openPlugins, { disabled: locked }))
        return frame(h(React.Fragment, null, intro('install', 'installHint'), alerts(),
          p && !verifiedInventory(p) ? box('warning', h('strong', null, t('installUnknown')), hint(codeText(t, 'reason', p.reason))) : null,
          verifiedInventory(p) ? h(React.Fragment, null, !p.missing.length ? box(null, h('p', null, t('allPresent'))) : null, h(PackageRows, { p, t })) : null,
          result ? heading(t('pluginResults'), h(PluginReport, { p: result, t }), result.restart ? hint(t('restart')) : null) : null),
          footer(buttons, n ? t('installTrust') : null))
      }
      function targetView() {
        const raw = targetDraft.trim()
        const nextId = sourceId(raw)
        return frame(h(React.Fragment, null, intro('target', 'targetHint'), facts([[t('uploadTarget'), linkView(targetId)]]),
          h('form', { id: formId, onSubmit: saveTarget, className: 'dpgsp-field' }, h('label', { htmlFor: `${uid}-target` }, t('targetInput')),
            h('input', { id: `${uid}-target`, className: 'dpgsp-input', type: 'text', inputMode: 'url', autoComplete: 'off', autoCapitalize: 'none', spellCheck: false,
              value: targetDraft, 'data-focus': 'target', 'aria-invalid': issue?.error?.code === 'bad-source' || undefined, disabled: locked, placeholder: t('targetEmpty'),
              onChange: e => { setTargetDraft(e.target.value); setIssue(null); setAnnouncement('') } })),
          !raw || nextId ? box(null, facts([[t('targetNew'), linkView(nextId)]]), nextId ? hint(t('targetWarning')) : null) : null,
          alerts()), footer([cancel(), btn('save-target', t('saveTarget'), undefined, { type: 'submit', form: formId, kind: 'primary', disabled: locked || (raw ? nextId === targetId && nextId !== null : targetId === null) })]))
      }
      function diagnosticsView() {
        const stamp = record => txt(record?.at) ? [formatTime(record.at), bareId(record.gistId) ? record.gistId : null,
          number(record.files) ? countText(t, 'fileCount', record.files) : null].filter(Boolean).join(' · ') : t('never')
        return frame(h(React.Fragment, null, intro('diagnostics', 'diagnosticsHint'),
          facts([[t('targetProfile'), status.profile], [t('profileRoot'), status.root], [t('settingsFile'), cloud.settingsFile],
            [t('configFiles'), `${status.counts.files} · ${formatBytes(status.counts.bytes)}`], [t('lastUpload'), stamp(cloud.lastUpload)], [t('lastSync'), stamp(cloud.lastSync)],
            status.limits && [t('limits'), `${formatBytes(status.limits.maxBackupBytes)} / ${formatBytes(status.limits.gistMaxBytes)}`]]),
          h('label', { className: 'dpgsp-check' }, h('input', { type: 'checkbox', checked: includeMachine, disabled: locked, onChange: e => toggleMachine(e.target.checked) }), t('includeMachine')),
          h(LocalInventory, { status, t }), alerts()), footer([cancel(true), btn('retry-status', t('statusRetry'), retryStatus, { disabled: !!busy })]))
      }
      function undoView() {
        const s = page.snapshot
        const buttons = [cancel(!s)]
        if (s?.stamp && s.files > 0) buttons.push(btn('confirm-undo', t('undoConfirm'), doUndo, { kind: 'primary', disabled: locked }))
        else if (!busy) buttons.push(btn('retry-status', t('statusRetry'), retryStatus, { disabled: !!busy }))
        return frame(h(React.Fragment, null, intro('undo'), s ? h(React.Fragment, null,
          facts([[t('targetProfile'), status.profile], [t('undoWhen'), formatTime(s.createdAt)], [t('configFiles'), String(s.files)]]),
          box('warning', h('strong', null, t('undoLimit')), h('p', null, t('undoScope')))) : page.snapshot === null ? hint(t('undoNone')) : null,
          alerts()), footer(buttons))
      }
      const views = { home: homeView, source: sourceView, preview: previewView, backup: backupView, local: localView, plugins: pluginsView, target: targetView, diagnostics: diagnosticsView, undo: undoView }
      const visible = !status || !compatible(status) ? 'home' : page.name
      return h('div', { ref: root, className: 'dpgsp-root', 'data-view': visible, 'data-mode': page.mode,
        onKeyDown: e => {
          if (e.key !== 'Escape' || e.defaultPrevented || e.nativeEvent?.isComposing) return
          if (menu) { e.preventDefault(); e.stopPropagation(); setMenu(false); moreButton.current?.focus() }
          else if (page.name !== 'home' && !isWrite) { e.preventDefault(); e.stopPropagation(); home() }
        } }, h('style', null, CSS), views[visible](),
        h('p', { className: !announcement || announcement === 'reviewDone' ? 'dpgsp-sr' : 'dpgsp-hint', role: 'status', 'aria-live': 'polite', 'aria-atomic': true }, announcement ? t(announcement) : ''))
    }
    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, DICT), `${NS}: dictionaries`)
        const t = ctx.locale.bind(NS)
        ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
          name: 'settings.plugins.tab', id: NS, order: TAB_ORDER, label: () => t('tab'), locale: NS,
        }, () => h(Panel, { ctx, t })))
      },
    }
  },
})

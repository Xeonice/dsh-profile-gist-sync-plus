/** Settings → Multi-device config sync. Plans and credentials live only for the current interaction. */
window.__ModuleLoader__.load({
  id: 'dsh-multi-device-config-sync',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    // Package identity changed for npm; the settings section and HTTP API did not.
    const NS = 'dsh-profile-gist-sync-plus'
    const API = '/dsh-profile-gist-sync-plus/api'
    const SECTION_ORDER = 16
    const GUIDE = 'https://github.com/Xeonice/dsh-profile-gist-sync-plus#readme'

    const DICT = {
      zh: {
        section: '多端配置同步',
        localProfile: '本机配置',
        profileName: '配置名称',
        backupContents: '备份内容',
        contents: '配置文件和插件清单',
        unavailable: '状态不可用',
        help: '帮助',
        openGuide: '在新标签页打开使用指南',
        backup: '备份本机',
        restore: '从备份恢复',
        more: '更多',
        back: '返回首页',
        cancel: '取消',
        next: '查看预览',
        previewAgain: '重新预览',
        previewReceiptSource: '重新预览此来源',
        noneYet: '尚未备份',
        unlinked: '未关联备份目标',
        linked: '已关联备份目标',
        linkedGist: '已关联的 Gist',
        gistSource: 'Gist 备份',
        ready: '备份已就绪',
        copy: '复制备份链接',
        copyLink: '复制链接',
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
        restoreUnverified: '未收到可核实的恢复回执',
        progressTitle: '恢复到本机',
        inProgress: '恢复中',
        waitingReceipt: '正在恢复，等待结果',
        waitHint: '收到回执后，结果会显示在这里。',
        waitMeter: '正在等待恢复回执，进度未知',
        noRepeat: '请等待恢复回执，不要重复发起恢复。',
        restoreSteps: '本次恢复步骤',
        stageCheck: '核对恢复清单',
        stageWrite: '写入配置文件',
        stageInstall: '安装缺失插件',
        verifyPackages: '核对安装结果',
        verifyFiles: '核对写入结果',
        verifyLocal: '核对本机状态',
        checked: '已核对',
        stageActive: '进行中',
        stagePending: '等待中',
        awaitingCheck: '等待核对',
        checkHint: '正在核对已确认的恢复范围。',
        writeHint: '正在处理配置文件，尚未收到写入回执。',
        verifyHint: '正在核对本机插件清单，以最终回执为准。',
        verifyWriteHint: '正在比对配置写入回执与已确认的文件清单。',
        processed: '已处理 %n / %m 个',
        approvedMeter: '本次批准的插件中已有处理结果的数量',
        meterHint: '只数本次批准且已有结果的插件，失败或跳过也计入；不是安装成功数。',
        currentPackage: '正在安装',
        finished: '已完成',
        needsAttention: '需处理',
        needsCheck: '待核实',
        partialTitle: '配置已恢复，仍缺 %n 个插件',
        buildTitle: '配置已恢复，构建脚本待审',
        unknownPluginsTitle: '配置已恢复，插件结果待核实',
        missingOnly: '仍缺 %n 个插件',
        buildsOnly: '插件构建脚本待审',
        unknownOnly: '插件结果待核实',
        otherAttention: '本次恢复仍有事项需处理',
        inspectLocal: '核对本机状态',
        inspectConfigHint: '请比对本机配置与恢复前的清单。本次更改数尚未核实。',
        inspectPackagesHint: '请同时到「插件」页核对实际安装情况。',
        unknownUndo: '尚未取得与本次恢复匹配的撤销记录。「更多」里的上次恢复记录可能属于更早的操作。',
        readOnlyPreview: '重新预览只会比对当前状态，不会写入配置、安装插件或批准脚本。',
        inspectInstall: '请到「插件」页核对此包的安装状态和来源，再重新预览。',
        restartConfig: '重启 DSH 后，已写入的配置生效。',
        restartPackages: '插件管理器提示重启 DSH，以应用已安装项的更改。',
        restartLimit: '重启不会补装缺失的插件，也不会批准构建脚本。',
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
        'note.legacy-sync-package': '不自动补装此插件的旧 Git 包，请在「插件」中管理',
        'note.local-sync-package': '同步插件本身请在「插件」中安装或更新',
        'code.legacy-sync-package': '已跳过旧版同步插件，不会从备份安装或启用',
        'code.local-sync-package': '保留本机同步插件的安装来源和启用状态',
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
        section: 'Multi-device config sync',
        localProfile: 'Local configuration',
        profileName: 'Profile',
        backupContents: 'Backup contents',
        contents: 'Configuration files and plugin manifest',
        unavailable: 'Status unavailable',
        help: 'Help',
        openGuide: 'Open the guide in a new tab',
        backup: 'Back up this machine',
        restore: 'Restore from backup',
        more: 'More',
        back: 'Back to home',
        cancel: 'Cancel',
        next: 'View preview',
        previewAgain: 'Preview again',
        previewReceiptSource: 'Preview this source again',
        noneYet: 'No backup yet',
        unlinked: 'No backup destination linked',
        linked: 'Backup destination linked',
        linkedGist: 'Linked Gist',
        gistSource: 'Gist backup',
        ready: 'Backup ready',
        copy: 'Copy backup link',
        copyLink: 'Copy link',
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
        restoreUnverified: 'Restore receipt not verified',
        progressTitle: 'Restore to this machine',
        inProgress: 'Restoring',
        waitingReceipt: 'Waiting for the restore result',
        waitHint: 'The result will appear here when the host sends a receipt.',
        waitMeter: 'Waiting for the restore receipt; progress unknown',
        noRepeat: 'Wait for the receipt. Do not submit the restore again.',
        restoreSteps: 'Steps in this restore',
        stageCheck: 'Check the reviewed plan',
        stageWrite: 'Write configuration files',
        stageInstall: 'Install missing plugins',
        verifyPackages: 'Check installation results',
        verifyFiles: 'Check the file changes',
        verifyLocal: 'Check local state',
        checked: 'Checked',
        stageActive: 'In progress',
        stagePending: 'Waiting',
        awaitingCheck: 'Awaiting verification',
        checkHint: 'Checking the scope you confirmed.',
        writeHint: 'Processing configuration files. The write has not yet been acknowledged.',
        verifyHint: 'Checking the local plugin inventory. The final receipt will show the result.',
        verifyWriteHint: 'Comparing the configuration write receipt with the reviewed file list.',
        processed: 'Processed %n / %m',
        approvedMeter: 'Approved plugins with a processing outcome',
        meterHint: 'Counts only approved plugins with an outcome, including failures and skips. This is not a count of successful installations.',
        currentPackage: 'Installing',
        finished: 'Complete',
        needsAttention: 'Needs attention',
        needsCheck: 'Not verified',
        partialTitle: 'Configuration restored; plugins still missing: %n',
        buildTitle: 'Configuration restored; build scripts await review',
        unknownPluginsTitle: 'Configuration restored; plugin results not verified',
        missingOnly: 'Plugins still missing: %n',
        buildsOnly: 'Plugin build scripts await review',
        unknownOnly: 'Plugin results not verified',
        otherAttention: 'Some items still need attention',
        inspectLocal: 'Check local state',
        inspectConfigHint: 'Compare local configuration with the reviewed file list. The number of changes has not been verified.',
        inspectPackagesHint: 'Also check which packages are actually installed on the Plugins page.',
        unknownUndo: 'No undo record has been matched to this restore. The last record under More may belong to an earlier operation.',
        readOnlyPreview: 'A new preview compares current state. It does not rewrite files, install plugins or approve scripts.',
        inspectInstall: 'Check this package and its install source on the Plugins page, then preview again.',
        restartConfig: 'Restart DSH for the restored configuration to take effect.',
        restartPackages: 'Restart DSH to apply the installed package changes.',
        restartLimit: 'Restarting does not install missing plugins or approve build scripts.',
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
        'note.legacy-sync-package': 'The old Git edition is not installed automatically. Manage it in Plugins.',
        'note.local-sync-package': 'Install or update the sync plugin itself in Plugins.',
        'code.legacy-sync-package': 'Old sync package skipped; it will not be installed or enabled from the backup',
        'code.local-sync-package': 'The installed sync package keeps its local source and activation setting',
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

    // Geometry and materials follow the installed Account settings cards. The
    // colored Button pair stays blue with on-color text in both host palettes.
    const CSS = `
.dpgsp-root {
  --ink:var(--dsw-alias-label-primary); --muted:var(--dsw-alias-label-secondary); --subtle:var(--dsw-alias-label-tertiary,var(--muted));
  --paper:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-2)); --stroke:var(--dsw-alias-settings-card-stroke,var(--dsw-alias-border-l2));
  --line:var(--dsw-alias-border-l2); --edge:var(--dsw-alias-border-l3,var(--line)); --hover:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-1));
  --accent:var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary)); --good:var(--dsw-alias-state-success-primary); --warn:var(--dsw-alias-state-warn-primary); --error:var(--dsw-alias-state-error-primary);
  container-type:inline-size; display:flex; flex-direction:column; gap:16px; width:100%; min-width:0; padding:8px 0;
  color:var(--ink); font:inherit; font-size:13px; line-height:22px; overflow-wrap:anywhere;
}
.dpgsp-root, .dpgsp-root *, .dpgsp-root *::before, .dpgsp-root *::after { box-sizing:border-box; }
.dpgsp-root :is(h2,h3,p,ul,dl,dd) { margin:0; }
.dpgsp-root :is(h2,h3) { font-size:14px; line-height:22px; font-weight:500; }
.dpgsp-root strong { font-weight:500; }
.dpgsp-card { width:100%; min-width:0; padding:12px 16px; border:.5px solid var(--stroke); border-radius:var(--dsw-radius-xl,16px); background:var(--paper); }
.dpgsp-summary, .dpgsp-identity, .dpgsp-status, .dpgsp-line, .dpgsp-source, .dpgsp-actions, .dpgsp-foot, .dpgsp-note, .dpgsp-row, .dpgsp-check { display:flex; align-items:center; }
.dpgsp-summary { min-height:44px; justify-content:space-between; flex-wrap:wrap; gap:6px 16px; }
.dpgsp-identity { min-width:0; gap:10px; }
.dpgsp-mark { display:grid; place-items:center; flex:none; width:32px; height:32px; border-radius:50%; corner-shape:round; color:var(--muted); background:var(--dsw-alias-bg-skeleton,var(--hover)); }
.dpgsp-icon { display:inline-block; flex:none; vertical-align:middle; }
.dpgsp-identity > div, .dpgsp-status { min-width:0; }
.dpgsp-status { justify-content:flex-end; flex-wrap:wrap; gap:4px 8px; color:var(--muted); }
.dpgsp-status [data-focus=backup-receipt] { color:var(--ink); }
.dpgsp-status [data-focus=backup-receipt] svg { color:var(--good); }
.dpgsp-subtitle { color:var(--subtle); }
.dpgsp-hint, .dpgsp-meta, .dpgsp-note, .dpgsp-intro { color:var(--muted); }
.dpgsp-note { align-items:flex-start; gap:8px; }
.dpgsp-note > svg { margin-top:3px; }
.dpgsp-actions, .dpgsp-foot { justify-content:flex-end; flex-wrap:wrap; gap:8px 10px; }
.dpgsp-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; max-width:100%; min-width:min(58px,100%); min-height:36px; padding:6px 14px; border:.5px solid var(--edge); border-radius:var(--dsw-radius-md,12px); background:transparent; color:var(--ink); cursor:pointer; touch-action:manipulation; font:inherit; font-size:14px; line-height:22px; text-align:center; text-decoration:none; white-space:normal; overflow-wrap:anywhere; }
.dpgsp-btn.dpgsp-primary { --button-fill:var(--dsw-alias-button-info-fill,var(--dsw-alias-button-primary-fill,var(--accent))); --button-l:.56; border-color:transparent; font-weight:500; color:var(--dsw-alias-label-on-color,var(--dsw-alias-label-primary-foreground)); background:var(--button-fill); }
/* Cap only lightness, retaining the host's hue. The native blue alone is too
   light for 14px white text, especially on the dark palette. */
@supports (color:oklch(from currentColor min(l,.56) c h)) {
  .dpgsp-btn.dpgsp-primary { background:oklch(from var(--button-fill) min(l,var(--button-l)) c h); }
}
.dpgsp-btn.dpgsp-quiet { min-width:0; min-height:32px; padding:4px 6px; border:0; color:var(--muted); font-size:13px; }
@media (hover:hover) {
  .dpgsp-btn:not(.dpgsp-primary):not(:disabled):hover { background:var(--hover); }
  .dpgsp-btn.dpgsp-primary:not(:disabled):hover { --button-fill:var(--dsw-alias-button-info-hover,var(--dsw-alias-button-primary-hover,var(--accent))); --button-l:.53; }
  .dpgsp-btn.dpgsp-quiet:hover, .dpgsp-help:hover { color:var(--ink); }
}
.dpgsp-root :is(button,input):disabled { opacity:.55; cursor:not-allowed; }
.dpgsp-root :is(button,input,summary,a):focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
.dpgsp-root :is(h2,h3,span)[tabindex]:focus { outline:none; }
.dpgsp-body { display:flex; flex-direction:column; min-width:0; }
.dpgsp-body > * { min-width:0; padding-block:12px; }
.dpgsp-body > :first-child { padding-top:4px; }
.dpgsp-body > :last-child { padding-bottom:4px; }
.dpgsp-body > * + *, .dpgsp-foot, .dpgsp-homefoot, .dpgsp-copy-feedback { border-top:.5px solid var(--line); }
.dpgsp-foot, .dpgsp-homefoot { margin-top:8px; padding-top:12px; }
.dpgsp-foot > .dpgsp-note { flex:1 1 230px; }
.dpgsp-foot > .dpgsp-actions { min-width:0; margin-inline-start:auto; }
.dpgsp-homefoot { display:grid; align-items:center; grid-template-columns:auto auto minmax(0,1fr); gap:8px 10px; }
.dpgsp-homefoot .dpgsp-actions { grid-area:1/3; }
.dpgsp-menuwrap { display:contents; }
.dpgsp-menuwrap > button { grid-area:1/1; }
.dpgsp-menuwrap > button[aria-expanded=true] svg { transform:rotate(180deg); }
/* Disclosure in normal flow: the host's scrolling settings column can reach
   every option, including items below a short viewport. No portal or overlay. */
.dpgsp-menulist { grid-column:1 / -1; grid-row:2; display:grid; padding-top:6px; border-top:.5px solid var(--line); }
.dpgsp-menulist .dpgsp-btn { width:100%; min-height:40px; justify-content:flex-start; gap:10px; padding:6px; color:var(--ink); text-align:start; }
.dpgsp-help { grid-area:1/2; display:inline-flex; align-items:center; gap:3px; width:fit-content; min-height:32px; color:var(--muted); text-decoration:none; }
.dpgsp-stack, .dpgsp-group, .dpgsp-field, .dpgsp-box, .dpgsp-iteminfo { display:grid; gap:6px; min-width:0; }
.dpgsp-stack { gap:12px; }
.dpgsp-field label { font-weight:500; }
.dpgsp-input { width:100%; min-width:0; min-height:36px; border:.5px solid var(--edge); border-radius:var(--dsw-radius-sm,8px); padding:6px 10px; color:var(--ink); background:var(--dsw-alias-bg-layer-1); font:inherit; font-size:14px; }
.dpgsp-input::placeholder { color:var(--subtle); }
.dpgsp-input[aria-invalid=true] { border-color:var(--error); }
.dpgsp-check { gap:10px; cursor:pointer; }
.dpgsp-check input { flex:none; accent-color:var(--accent); }
.dpgsp-line, .dpgsp-source { gap:6px 8px; flex-wrap:wrap; }
.dpgsp-source { justify-content:space-between; }
.dpgsp-line > *, .dpgsp-source > * { min-width:0; }
.dpgsp-box.dpgsp-alert > :first-child, .dpgsp-box.dpgsp-warning > :first-child, .dpgsp-box.dpgsp-success > :first-child { display:flex; align-items:baseline; gap:8px; }
.dpgsp-box.dpgsp-alert > :first-child::before, .dpgsp-box.dpgsp-warning > :first-child::before, .dpgsp-box.dpgsp-success > :first-child::before { content:''; width:3px; height:1em; flex:none; align-self:center; border-radius:2px; background:var(--warn); }
.dpgsp-box.dpgsp-alert > :first-child::before { background:var(--error); }
.dpgsp-box.dpgsp-success > :first-child::before { background:var(--good); }
.dpgsp-list { list-style:none; padding:0; }
.dpgsp-row { min-height:40px; min-width:0; padding:6px 0; gap:10px; }
.dpgsp-row + .dpgsp-row, .dpgsp-facts > div + div { border-top:.5px solid var(--line); }
.dpgsp-row > .dpgsp-icon, .dpgsp-rowvalue { color:var(--muted); }
.dpgsp-row .dpgsp-iteminfo { flex:1; gap:0; }
.dpgsp-rowvalue { min-width:0; text-align:end; }
.dpgsp-root code { font: .96em/1.55 ui-monospace,SFMono-Regular,Consolas,monospace; white-space:pre-wrap; overflow-wrap:anywhere; unicode-bidi:isolate; }
.dpgsp-details > summary { min-height:32px; padding:4px 0; color:var(--ink); cursor:pointer; }
.dpgsp-details[open] > :not(summary) { margin-top:6px; }
.dpgsp-body > .dpgsp-facts { padding-block:0; }
.dpgsp-facts > div { display:flex; align-items:baseline; justify-content:space-between; gap:8px 16px; min-height:40px; padding:9px 0; }
.dpgsp-facts dt { color:var(--muted); }
.dpgsp-facts dd { min-width:0; text-align:end; }
.dpgsp-root .dpgsp-link { color:var(--dsw-alias-link,var(--accent)); text-underline-offset:2px; }
.dpgsp-copy-feedback { margin-top:8px; padding-top:8px; }
.dpgsp-restore-head { display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:6px 12px; }
.dpgsp-restore-head .dpgsp-mark { border-radius:var(--dsw-radius-md,12px); width:36px; height:36px; }
.dpgsp-restore-head h2 { font-size:17px; font-weight:600; line-height:24px; }
.dpgsp-badge { align-self:center; border:.5px solid var(--line); border-radius:99px; padding:0 9px; font-size:12px; }
.dpgsp-restore-head[data-tone=active] :is(.dpgsp-mark,.dpgsp-badge) { color:var(--accent); }
.dpgsp-restore-head[data-tone=good] :is(.dpgsp-mark,.dpgsp-badge) { color:var(--good); }
.dpgsp-restore-head[data-tone=attention] :is(.dpgsp-mark,.dpgsp-badge) { color:var(--warn); }
.dpgsp-timeline { list-style:none; margin:0; padding-inline:0; }
.dpgsp-step { display:grid; grid-template-columns:20px minmax(0,1fr); gap:8px; position:relative; }
.dpgsp-step + .dpgsp-step { margin-top:14px; }
.dpgsp-step:not(:last-child)::before { content:''; position:absolute; inset-inline-start:9px; top:21px; bottom:-13px; border-inline-start:1px solid var(--line); }
.dpgsp-step-mark { display:grid; place-items:center; align-self:start; height:20px; color:var(--muted); }
.dpgsp-step-mark:empty::before { content:''; width:12px; height:12px; border:1px solid currentColor; border-radius:50%; corner-shape:round; }
.dpgsp-step[data-state=done] .dpgsp-step-mark { color:var(--good); }
.dpgsp-step[aria-current=step] :is(.dpgsp-step-mark,.dpgsp-step-line) { color:var(--accent); }
.dpgsp-step[aria-current=step] .dpgsp-step-mark::before { background:currentColor; box-shadow:inset 0 0 0 2px var(--paper); }
.dpgsp-step-line { display:flex; justify-content:space-between; align-items:baseline; gap:0 8px; flex-wrap:wrap; }
.dpgsp-step-line > :last-child { font-size:12px; }
.dpgsp-step[data-state=pending] .dpgsp-step-line { color:var(--muted); }
.dpgsp-meterbox { display:grid; gap:5px; margin-top:6px; border:.5px solid var(--line); border-radius:var(--dsw-radius-sm,8px); padding:8px 12px; background:var(--dsw-alias-bg-layer-1); }
.dpgsp-meterbox strong { color:var(--accent); font-variant-numeric:tabular-nums; }
.dpgsp-body > .dpgsp-issue { padding:9px 12px; border:.5px solid var(--line); border-radius:var(--dsw-radius-sm,8px); background:var(--dsw-alias-state-warn-tertiary,var(--hover)); }
.dpgsp-issue .dpgsp-icon { color:var(--warn); }
.dpgsp-meter { height:7px; border-radius:99px; background:var(--edge); overflow:hidden; }
.dpgsp-fill { display:block; height:100%; border-radius:inherit; background:var(--accent); }
/* Waiting stripes do not encode a duration, stage, or percentage. */
.dpgsp-meter.dpgsp-indeterminate { background:repeating-linear-gradient(110deg,var(--edge) 0 8px,var(--hover) 8px 16px); background-size:34px 100%; animation:dpgsp-wait 2.6s linear infinite; }
@keyframes dpgsp-wait { to { background-position:34px 0; } }
@media (prefers-reduced-motion:reduce) { .dpgsp-meter.dpgsp-indeterminate { animation:none; } }
@media (forced-colors:active) { .dpgsp-meter { outline:1px solid; } .dpgsp-fill { border-block-start:7px solid; } }
.dpgsp-sr { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; border:0; }
@container (max-width:470px) {
  .dpgsp-homefoot { grid-template-columns:auto minmax(0,1fr); }
  .dpgsp-homefoot .dpgsp-actions { grid-area:3 / 1 / auto / -1; }
  .dpgsp-foot > .dpgsp-note { flex-basis:100%; }
}
@container (max-width:340px) {
  .dpgsp-status { justify-content:flex-start; }
  .dpgsp-facts > div { flex-direction:column; gap:0; }
  .dpgsp-facts dd { text-align:start; }
  .dpgsp-actions { width:100%; }
  .dpgsp-actions > .dpgsp-btn { flex:1 1 100%; }
}
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
      copy: 'M8 8h12v13H8zM16 8V3H4v13h4', external: 'M7 17 17 7M7 7h10v10',
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
    const object = value => !!value && typeof value === 'object' && !Array.isArray(value)
    const NDJSON = 'application/x-ndjson'
    const RESTORE_ROUTES = { standard: '/sync/install', config: '/config/restore', local: '/restore' }
    async function request(path, body, signal, accept) {
      try {
        return await fetch(`${API}${path}`, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', redirect: 'error', cache: 'no-store', signal,
          ...(body === undefined ? {} : { headers: { 'content-type': 'application/json', ...(accept ? { Accept: accept } : {}) }, body: JSON.stringify(body) }) })
      } catch (error) { throw signal?.aborted ? error : fail('network') }
    }
    function responseError(data) {
      // An origin/login rejection from DSH is not a reason to ask for a GitHub token.
      const localDenial = data?.code === 'auth' && /^(?:DSH refused|refused: the Host)/i.test(data?.error ?? '')
      return fail(localDenial ? 'session-auth' : txt(data?.code) ? data.code : 'other')
    }
    async function readJson(response) {
      const data = await response.json().catch(() => null)
      if (!response.ok) throw responseError(data)
      if (!object(data)) throw fail('bad-response')
      return data
    }
    async function api(path, body, signal) { return readJson(await request(path, body, signal)) }

    // Only reviewed confirmations negotiate streaming, on the original request.
    // In particular there is no capability probe, replacement POST, or cloud read.
    async function confirmReviewed(plan, signal, onProgress = () => {}) {
      if (!Object.hasOwn(RESTORE_ROUTES, plan?.mode) || !txt(plan.planId)) throw fail('bad-response')
      const streaming = typeof TextDecoder === 'function' && typeof ReadableStream === 'function'
        && typeof ReadableStream.prototype.getReader === 'function' && typeof Response === 'function' && 'body' in Response.prototype
      const response = await request(RESTORE_ROUTES[plan.mode], { planId: plan.planId, confirm: true }, signal, streaming ? NDJSON : null)
      const type = response.headers?.get('content-type')?.split(';')[0].trim().toLowerCase()
      let result
      if (type === NDJSON) {
        if (!streaming || typeof response.body?.getReader !== 'function') throw fail('bad-response')
        const scope = progressScope(plan)
        let last = null
        result = await readFrames(response.body, frame => {
          const next = checkedProgress(scope, frame, last)
          if (next) last = next // keep the monotonic floor even across unusable frames
          onProgress(response.ok ? next : null)
        })
        if (!response.ok) throw fail('bad-response')
      } else result = await readJson(response) // Older hosts ignore Accept. Never submit again.
      if (!validRestore(result, plan)) throw fail('bad-response')
      return result
    }
    async function readFrames(body, progress) {
      const reader = body.getReader()
      const decoder = new TextDecoder('utf-8', { fatal: true })
      let buffer = '', terminal = null
      // Bound a single unterminated line, not the number of packages or chunks.
      const maxLine = 8 * 1024 * 1024
      function line(text) {
        if (text.length > maxLine) throw fail('bad-response')
        if (!text.trim()) return
        if (terminal) throw fail('bad-response') // no ambiguous second outcome or trailing event
        const frame = JSON.parse(text)
        if (frame?.type === 'progress') progress(frame)
        else if ((frame?.type === 'result' && object(frame.result)) || (frame?.type === 'error' && txt(frame.code) && txt(frame.error))) terminal = frame
        else throw fail('bad-response')
      }
      try {
        for (;;) {
          const { done, value } = await reader.read()
          buffer += done ? decoder.decode() : decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop()
          for (const text of lines) line(text)
          if (buffer.length > maxLine) throw fail('bad-response')
          if (done) { line(buffer); break } // also accept an intact last record at EOF
        }
      } catch { throw fail('bad-response') } finally { reader.releaseLock() }
      if (!terminal) throw fail('bad-response')
      if (terminal.type === 'error') throw responseError(terminal)
      return terminal.result
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
      && new Set([...p.installed, ...p.missing.map(row => row.name)]).size === p.installed.length + p.missing.length
    const installable = p => verifiedInventory(p) ? p.missing.filter(row => row.resolvable) : []
    const inventoryShape = p => p?.available === false || verifiedInventory(p)
    function validCloudPlan(p, mode, id) {
      if (!['standard', 'config'].includes(mode) || !bareId(p?.ref?.id) || p.ref.id !== id || !filePlan(p.preview) || (p.mode !== undefined && p.mode !== mode)) return false
      if (mode === 'config') return txt(p.planId) && p.plugins == null
      return p.plugins?.available === false ? p.planId === null : verifiedInventory(p.plugins) && txt(p.planId)
    }
    function actionable(p) {
      return !!p && (p.mode !== 'standard' || verifiedInventory(p.plugins)) && (changes(p.preview) > 0 || installable(p.plugins).length > 0)
    }
    function validRestore(r, plan) {
      const p = plan?.preview, report = r?.report
      if (!Object.hasOwn(RESTORE_ROUTES, plan?.mode) || !filePlan(p) || !filePlan(report) || !number(report.restored)
          || report.restored !== changes(report) || report.profile !== p.profile || report.root !== p.root || report.sourceProfile !== p.sourceProfile
          || report.createdAt !== p.createdAt || report.files.length !== p.files.length || !names(r.warnings ?? []) || (r.mode !== undefined && r.mode !== plan.mode)) return false
      if (!report.files.every((row, i) => row.path === p.files[i].path && row.status === p.files[i].status)) return false
      if (plan.mode === 'local') return r.ref == null && r.plugins == null && r.complete == null
      if (!bareId(plan.ref?.id) || r.ref?.id !== plan.ref.id || typeof r.restart !== 'boolean') return false
      if (plan.mode === 'config') return r.plugins == null && r.complete == null
      if (typeof r.complete !== 'boolean') return false
      if (r.plugins?.available === false) return !r.complete
      if (!verifiedReport(r.plugins) || !verifiedInventory(plan.plugins)) return false
      const approved = new Map(installable(plan.plugins).map(row => [row.name, row.installSpec]))
      const declared = new Set([...plan.plugins.installed, ...plan.plugins.missing.map(row => row.name)])
      const observed = [...r.plugins.installed, ...r.plugins.missing.map(row => row.name)]
      return observed.length === declared.size && observed.every(name => declared.has(name))
        && r.plugins.results.every(row => declared.has(row.name) && (row.outcome === 'skipped' ||
          (approved.has(row.name) && (row.installSpec === undefined || row.installSpec === approved.get(row.name)))))
        && (!r.complete || !incomplete(r.plugins))
    }

    // The stream is scoped by the selected POST and the reviewed plan, not by
    // identifiers supplied by an event. No progress frame is a restore receipt.
    function progressScope(plan) {
      const approved = new Set(installable(plan.plugins).map(row => row.name))
      return { mode: plan.mode, approved, fileLimit: changes(plan.preview) }
    }
    const STAGES = ['check', 'write', 'install', 'verify']
    function checkedProgress(scope, frame, last) {
      if (!scope || !Object.hasOwn(RESTORE_ROUTES, scope.mode) || frame?.type !== 'progress') return null
      const { stage, files, processed, total, current } = frame
      const rank = STAGES.indexOf(stage)
      if (rank < 0 || (last && rank < STAGES.indexOf(last.stage))) return null
      const late = stage === 'install' || stage === 'verify'
      const allowed = ['type', 'stage', ...(late ? ['files', 'processed', 'total'] : []), ...(stage === 'install' ? ['current'] : [])]
      if (Object.keys(frame).some(key => !allowed.includes(key))) return null
      if (!late) return { stage }
      if (!number(files) || files > scope.fileLimit || (last?.files !== undefined && files !== last.files)) return null
      if (stage === 'install' || processed !== undefined || total !== undefined) {
        if (scope.mode !== 'standard' || !number(total) || total !== scope.approved.size || !number(processed) || processed > total || processed < (last?.processed ?? 0)) return null
        if (stage === 'install') {
          if (!total || (current !== null && (!scope.approved.has(current) || processed === total))) return null
          return { stage, files, processed, total, current }
        }
        if (total > 0) return { stage, files, processed, total }
      }
      return { stage, files }
    }
    function restoreDestination(plan, result, error) {
      const { mode, fileName } = plan, id = plan.ref?.id, profile = plan.preview.profile
      // Even a busy/expired plan loses its local confirmation. The only path
      // back to a write is a fresh, user-requested read-only preview.
      if (error && ['stale-plan', 'busy'].includes(error.code)) return { name: 'preview', mode, id, fileName }
      const receipt = error ? { mode: 'unknown', reviewedMode: mode, profile, source: id ?? fileName, error }
        : { mode, profile, result, fileName, restart: mode === 'local' ? result.report.restored > 0 : result.restart }
      return { name: 'receipt', mode, receipt }
    }
    function progressPage(plan) {
      return { name: 'progress', mode: plan.mode, profile: plan.preview.profile,
        hasPackages: plan.mode === 'standard' && installable(plan.plugins).length > 0, step: null }
    }
    async function runReviewed(plan, signal, { active, progress, settle, refresh }) {
      let result
      try { result = await confirmReviewed(plan, signal, step => { if (active()) progress(step) }) }
      catch (error) {
        if (active()) settle(restoreDestination(plan, null, error), error)
        return
      }
      if (!active()) return
      settle(restoreDestination(plan, result))
      // Outside the confirmation catch: even a broken /status cannot turn a
      // verified write into a lost receipt or send another confirmation.
      await refresh()
    }
    function matchingUndo(receipt, status) {
      const report = receipt?.result?.report, stamp = report?.undoStamp
      return txt(stamp) && receipt.profile === status?.profile && stamp === status.undo?.stamp && report.restored === status.undo.files ? stamp : null
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
    const rowValue = text => h('span', { className: 'dpgsp-rowvalue' }, text)
    const frame = (content, foot, label) => h('section', { className: 'dpgsp-card', 'aria-label': label }, h('div', { className: 'dpgsp-body' }, content), foot)
    const footer = (buttons, guidance) => h('footer', { className: 'dpgsp-foot' }, guidance ? note(guidance, 'shield') : null,
      buttons.some(Boolean) ? h('div', { className: 'dpgsp-actions' }, ...buttons) : null)
    function list(items, makeRow) {
      return h('ul', { className: 'dpgsp-list' }, items.map((item, i) => h('li', { key: i, className: 'dpgsp-row' }, ...makeRow(item))))
    }
    const fileList = (files, t) => list(files, file => [icon('file'), h('div', { className: 'dpgsp-iteminfo' }, mono(file.path)), rowValue(t(file.status))])
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
        facts([[t('source'), h('div', { className: 'dpgsp-source' },
          h('div', null, isolated([p.sourceProfile, plan.mode === 'local' ? plan.fileName : plan.ref.id].filter(txt).join(' · ')),
            txt(p.createdAt) ? hint(formatTime(p.createdAt)) : null), changeSource)], [t('targetProfile'), isolated(p.profile)]]),
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
    function restoreHeader(text, badge, tone, glyph, profile, t, focus) {
      return h('header', { className: 'dpgsp-restore-head', 'data-tone': tone },
        h('div', { className: 'dpgsp-identity' }, h('span', { className: 'dpgsp-mark' }, icon(glyph, 20)),
          h('div', null, h('h2', { tabIndex: -1, 'data-focus': focus }, text), hint(h(React.Fragment, null, t('localProfile'), ' · ', isolated(profile))))),
        h('span', { className: 'dpgsp-badge' }, t(badge)))
    }
    const tally = (t, step) => countText(t, 'processed', step.processed).replace('%m', String(step.total))
    const progressStages = hasPackages => hasPackages ? STAGES : ['check', 'write', 'verify']
    const stageLabel = (stage, page) => ({ check: 'stageCheck', write: 'stageWrite', install: 'stageInstall',
      verify: page.mode !== 'standard' ? 'verifyFiles' : page.hasPackages ? 'verifyPackages' : 'verifyLocal' })[stage]
    function progressStatus(page, t) {
      const s = page.step
      if (!s) return t('waitingReceipt')
      return [t(stageLabel(s.stage, page)), s.total > 0 ? tally(t, s) : null,
        s.current ? `${t('currentPackage')} ${s.current}` : null].filter(Boolean).join(' · ')
    }
    function RestoreProgress({ page, t }) {
      const step = page.step, stages = progressStages(page.hasPackages)
      const header = restoreHeader(t('progressTitle'), 'inProgress', 'active', 'sync', page.profile, t, 'title')
      const waiting = h('div', { className: 'dpgsp-group' }, h('strong', null, t('waitingReceipt')),
        h('div', { className: 'dpgsp-meter dpgsp-indeterminate', role: 'progressbar', 'aria-label': t('waitMeter') }), hint(t('waitHint')))
      const list = step && h('ol', { className: 'dpgsp-timeline', 'aria-label': t('restoreSteps') }, stages.map((id, i) => {
        const active = id === step.stage, done = i < stages.indexOf(step.stage)
        const state = !done ? t(active ? 'stageActive' : 'stagePending') : id === 'check' ? t('checked')
          : id === 'write' ? countText(t, 'changedCount', step.files) : step.total > 0 ? tally(t, step) : t('awaitingCheck')
        const extra = !active ? null : id === 'install' ? h('div', { className: 'dpgsp-meterbox' },
          h('strong', null, tally(t, step)), h('div', { className: 'dpgsp-meter', role: 'progressbar', 'aria-label': t('approvedMeter'),
            'aria-valuemin': 0, 'aria-valuemax': step.total, 'aria-valuenow': step.processed, 'aria-valuetext': `${tally(t, step)}. ${t('meterHint')}` },
          h('span', { className: 'dpgsp-fill', style: { width: `${100 * step.processed / step.total}%` } })),
          step.current ? h('p', null, t('currentPackage'), ' ', mono(step.current)) : null, hint(t('meterHint')))
          : hint(t(id === 'check' ? 'checkHint' : id === 'write' ? 'writeHint' : page.mode === 'standard' ? 'verifyHint' : 'verifyWriteHint'))
        return h('li', { key: id, className: 'dpgsp-step', 'data-state': active ? 'active' : done ? 'done' : 'pending', 'aria-current': active ? 'step' : undefined },
          h('span', { className: 'dpgsp-step-mark', 'aria-hidden': true }, done ? icon('check', 17) : null),
          h('div', null, h('div', { className: 'dpgsp-step-line' }, h('strong', null, t(stageLabel(id, page))), h('span', null, state)), extra))
      }))
      return frame(h(React.Fragment, null, header, list || waiting), footer([], t('noRepeat')), t('progressTitle'))
    }

    function receiptSummary(receipt) {
      const { result: r, mode } = receipt
      const combined = mode === 'standard', verified = combined && verifiedReport(r.plugins)
      const scripts = combined ? pendingBuilds(r.plugins) : []
      const missing = verified ? r.plugins.missing.length : null
      const wrote = r.report.restored > 0, unknown = combined && !verified
      const key = unknown ? (wrote ? 'unknownPluginsTitle' : 'unknownOnly') : missing ? (wrote ? 'partialTitle' : 'missingOnly')
        : scripts.length ? (wrote ? 'buildTitle' : 'buildsOnly') : r.warnings?.length || (combined && (!r.complete || incomplete(r.plugins)))
          ? (wrote ? 'restoreAttention' : 'otherAttention') : 'restoreDone'
      // Surface one verifiable problem before the disclosure. Do not guess why
      // a package is missing or interpolate arbitrary installer output here.
      const row = verified && (r.plugins.results.find(x => x.outcome === 'failed') ?? r.plugins.results.find(x => x.outcome === 'skipped'))
      const problem = row ? { name: row.name, state: OUTCOMES[row.outcome],
        reason: row.outcome === 'skipped' && txt(row.message) && Object.hasOwn(DICT.en, `note.${row.message}`) ? `note.${row.message}` : 'inspectInstall' }
        : missing ? { name: r.plugins.missing[0].name, state: 'stillMissing', reason: 'inspectInstall' } : null
      const restartKey = !receipt.restart ? null : wrote ? 'restartConfig' : 'restartPackages'
      return { key, verified, unknown, missing, scripts, problem, restartKey, attention: key !== 'restoreDone' }
    }
    function RestoreReceipt({ receipt, t, undoButton, repreviewButton, backButton, alerts }) {
      const head = (text, badge, tone, glyph) => restoreHeader(text, badge, tone, glyph, receipt.profile, t, 'restore-receipt')
      if (receipt.mode === 'undo') return frame(h(React.Fragment, null, head(t('undoDone'), 'finished', 'good', 'check'),
        h('p', null, countText(t, 'reverted', receipt.reverted), ' ', t('undoLimit'))))
      if (receipt.mode === 'unknown') return frame(h(React.Fragment, null,
        head(t('restoreUnverified'), 'needsCheck', 'attention', 'info'), h('p', null, t('uncertain')),
        facts([[t('source'), isolated(receipt.source)]]), hint(errorText(t, receipt.error)),
        details(t('inspectLocal'), hint(t('inspectConfigHint')), receipt.reviewedMode === 'standard' ? hint(t('inspectPackagesHint')) : null),
        details(t('undoWhen'), hint(t('unknownUndo')), hint(t('undoScope')), hint(t('undoLimit'))), alerts),
      footer([backButton, repreviewButton], t('readOnlyPreview')), t('restoreUnverified'))
      const { result: r, mode } = receipt
      const { key, verified, unknown, missing, scripts, problem, restartKey, attention } = receiptSummary(receipt)
      const text = missing ? countText(t, key, missing) : t(key)
      const counts = verified ? r.plugins.outcomeCounts : null
      return frame(h(React.Fragment, null,
        head(text, unknown ? 'needsCheck' : attention ? 'needsAttention' : 'finished', attention ? 'attention' : 'good', attention ? 'info' : 'check'),
        facts([[t('configFiles'), r.report.restored ? countText(t, 'changedCount', r.report.restored) : t('filesSame')], counts && [t('pluginResults'),
          [countText(t, 'installedCount', counts.installed), ...['already-present', 'failed', 'skipped'].filter(k => counts[k]).map(k => `${t(OUTCOMES[k])} ${counts[k]}`)].join(' · ')]]),
        problem ? h('div', { className: 'dpgsp-group dpgsp-issue' }, h('strong', { className: 'dpgsp-line' }, icon('pkg', 16), mono(problem.name), ' · ', t(problem.state)), hint(t(problem.reason))) : null,
        scripts.length ? box('warning', h('strong', null, t('pendingBuilds')), list(scripts, name => [mono(name)]), hint(t('buildHint'))) : null,
        mode === 'standard' && !verified ? note(t('pluginUnknown')) : null,
        r.warnings?.length ? box('warning', h('strong', null, t('warnings')), list(r.warnings, w => [w])) : null,
        restartKey ? note([t(restartKey), mode === 'standard' && attention ? t('restartLimit') : null].filter(Boolean).join(' ')) : null,
        details(t('resultDetails'), h('div', { className: 'dpgsp-stack' },
          facts([[t('source'), mode === 'local' ? isolated(receipt.fileName) : mono(r.ref.id)]]), h(FileChanges, { p: r.report, t }),
          mode === 'standard' && verified ? heading(t('pluginResults'), h(PluginReport, { p: r.plugins, t })) : null,
          hint(t('undoLimit')))), alerts),
        footer([backButton, undoButton, repreviewButton], repreviewButton ? t('readOnlyPreview') : null), text)
    }
    function ProfileStatus({ profile, stateKey, url, t }) {
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
      return h('section', { className: 'dpgsp-card', 'aria-label': t('localProfile') },
        h('div', { className: 'dpgsp-summary' },
          h('div', { className: 'dpgsp-identity' }, h('span', { className: 'dpgsp-mark' }, icon('pc', 18)),
            h('div', null, title(t('localProfile')), profile ? h('p', { className: 'dpgsp-subtitle' }, t('profileName'), ': ', isolated(profile)) : null)),
          h('div', { className: 'dpgsp-status' }, url
            ? h('span', { tabIndex: -1, 'data-focus': 'backup-receipt' }, t('ready')) : h('span', { role: 'status' }, t(stateKey)),
            url ? btn('copy', t(state === 'copied' ? 'copied' : 'copyLink'), copy, { glyph: state === 'copied' ? 'check' : 'copy', kind: 'quiet', title: t('copy'), 'aria-label': t('copy') }) : null,
            h('span', { role: 'status', className: 'dpgsp-sr' }, state === 'copied' ? t('copied') : ''))),
        state === 'manual' ? h('div', { className: 'dpgsp-copy-feedback dpgsp-group' }, h('p', { role: 'status' }, t('manualCopy')),
          h('label', { className: 'dpgsp-field' }, t('link'), h('input', { className: 'dpgsp-input', ref: field, readOnly: true, value: url, dir: 'ltr', onFocus: e => e.target.select() }))) : null)
    }
    function LocalInventory({ status: s, t }) {
      return details(t('localInventory'), h('div', { className: 'dpgsp-stack' },
        heading(`${t('defaultInventory')} (${s.files.length})`, list(s.files, f => [icon('file'), h('div', { className: 'dpgsp-iteminfo' }, mono(f.path)), rowValue(formatBytes(f.bytes))])),
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
      const menuList = React.useRef(null)
      const menuEntry = React.useRef(null)
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
        try { await task(call, active, job.controller.signal) }
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
          if (!validCloudPlan(data, mode, id) || data.preview.profile !== status.profile) throw fail('bad-response')
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
        move(progressPage(p))
        return run('applyBusy', true, (call, active, signal) => runReviewed(p, signal, {
          active, progress: step => setPage(old => old.name === 'progress' ? { ...old, step } : old),
          settle(next, error) {
            if (next.receipt) setRestoreReceipt(next.receipt)
            move(next, next.receipt ? 'restore-receipt' : 'title')
            if (!next.receipt) setIssue({ error })
          },
          refresh: () => afterWrite(call, active), // local GET only
        }))
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
          if (!txt(r.planId) || !filePlan(r.preview) || r.preview.profile !== status.profile || r.ref != null || r.plugins != null) throw fail('bad-response')
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
          setRestoreReceipt({ mode: 'undo', profile: s.profile, reverted: r.report.reverted })
          move({ name: 'home' }, 'restore-receipt')
          await afterWrite(call, active)
        }, error => setIssue({ error, uncertain: sent && consumedPlanError(error) }))
      }

      const alerts = (omitBusy = false) => h(React.Fragment, null,
        uploadCheck && page.name !== 'backup' ? box('warning', h('p', { role: 'alert' }, t(uploadCheck)), h('div', { className: 'dpgsp-actions' }, btn('retry-status', t('statusRetry'), retryStatus, { disabled: !!busy }))) : null,
        statusError ? h('div', { className: 'dpgsp-box dpgsp-warning', role: 'alert' },
          h('strong', null, t(status ? 'refreshFailed' : 'hostMissing')), hint(errorText(t, statusError)),
          h('div', { className: 'dpgsp-actions' }, btn('retry-status', t('statusRetry'), retryStatus, { disabled: !!busy }))) : null,
        issue ? h('div', { className: `dpgsp-box dpgsp-${issue.error ? 'alert' : 'warning'}`, role: issue.error ? 'alert' : 'status' },
          issue.error ? h('p', null, errorText(t, issue.error)) : null, issue.key ? h('p', null, t(issue.key)) : null,
          issue.uncertain ? h('p', null, t('uncertain')) : null, issue.uploadUncertain ? h('p', null, t('uploadUncertain')) : null) : null,
        busy && !omitBusy ? h('p', { className: 'dpgsp-hint', role: 'status' }, t(busy)) : null)
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
      const goMore = (key, action, glyph) => btn(key, t(key), rootAction('more', action), { kind: 'quiet', glyph, disabled: locked })
      // Ordinary disclosure: Tab walks the visible buttons. Arrow keys are a
      // convenience; focus and selection never leave this component's own list.
      const menuItems = () => Array.from(menuList.current?.querySelectorAll('button:not(:disabled)') ?? [])
      React.useEffect(() => {
        if (menu && menuEntry.current) {
          const items = menuItems()
          items[menuEntry.current === 'last' ? items.length - 1 : 0]?.focus()
        }
        menuEntry.current = null
      }, [menu])
      function menuKeys(e) {
        if (locked || flight.current || e.defaultPrevented || e.nativeEvent?.isComposing || e.altKey || e.ctrlKey || e.metaKey) return
        const fromButton = e.target === moreButton.current
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) || (!menu && (!fromButton || !e.key.startsWith('Arrow')))) return
        e.preventDefault(); e.stopPropagation()
        if (!menu) { opener.current = 'more'; menuEntry.current = e.key === 'ArrowUp' ? 'last' : 'first'; setMenu(true); return }
        const items = menuItems()
        if (!items.length) return
        const i = items.indexOf(e.target)
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : e.key === 'ArrowDown' ? (i + 1) % items.length : (i > 0 ? i - 1 : items.length - 1)
        items[next]?.focus()
      }
      function menuView() {
        return h('div', { className: 'dpgsp-menuwrap', onKeyDown: menuKeys, onBlur: e => { if (!e.currentTarget.contains(e.relatedTarget)) setMenu(false) } },
          btn('more', h(React.Fragment, null, t('more'), icon('chevron', 13)), rootAction('more', () => setMenu(v => !v)), { kind: 'quiet', ref: moreButton, 'data-focus': 'more',
            'aria-expanded': menu, 'aria-controls': menu ? `${uid}-more` : undefined, disabled: locked }),
          menu ? h('nav', { id: `${uid}-more`, ref: menuList, className: 'dpgsp-menulist', 'aria-label': t('more') },
            goMore('local', () => move({ name: 'local' }), 'file'), goMore('configMode', () => openRestore('config'), 'down'),
            goMore('install', openPlugins, 'pkg'), goMore('target', openTarget, 'arrow'), goMore('diagnostics', () => move({ name: 'diagnostics' }), 'info'),
            status?.undo ? goMore('undo', () => openUndo(), 'shield') : null) : null)
      }
      const linkView = id => {
        const href = gistLink({ id })
        return href ? h('a', { className: 'dpgsp-link', href, target: '_blank', rel: 'noopener noreferrer', referrerPolicy: 'no-referrer' }, href) : isolated(id ?? t('newGist'))
      }
      // The local status read that follows a receipt may still be in flight.
      // Returning home does not cancel it or unlock any other operation early.
      const leaveReceipt = () => move({ name: 'home' }, opener.current)
      function receiptView(main = false) {
        const receipt = main ? page.receipt : restoreReceipt
        if (!receipt) return null
        const mode = receipt.reviewedMode ?? receipt.mode
        const recheck = receipt.mode === 'unknown' || (receipt.result && receiptSummary(receipt).attention)
        const readAgain = () => {
          if (locked || flight.current) return
          opener.current = mode === 'standard' ? 'restore' : 'more'
          if (mode === 'local') move({ name: 'local' }, 'pick')
          else prepare(mode, receipt.result?.ref.id ?? receipt.source)
        }
        const stamp = matchingUndo(receipt, status)
        return h(RestoreReceipt, { receipt, t,
          backButton: main ? btn('back', t('back'), leaveReceipt) : null,
          undoButton: stamp ? btn('undo-review', t('undo'), () => openUndo(stamp), { disabled: locked }) : null,
          repreviewButton: recheck ? btn('preview-receipt-source', t(mode === 'local' ? 'chooseAgain' : 'previewReceiptSource'), readAgain, { disabled: locked }) : null,
          alerts: main && (statusError || issue || uploadCheck) ? alerts(true) : null })
      }
      const intro = (key, subtitle) => h('header', null, title(t(key)), subtitle ? h('p', { className: 'dpgsp-intro' }, t(subtitle)) : null)
      function homeView() {
        const uploaded = targetId && backupReceipt?.ref?.id === targetId ? backupReceipt : null
        const history = cloud?.lastUpload
        const readyUrl = uploaded ? gistLink(uploaded.ref) : (bareId(targetId) && history?.gistId === targetId && txt(history.at) && number(history.files)
          ? gistLink({ id: targetId }) : null)
        const dropped = Array.isArray(uploaded?.dropped) ? uploaded.dropped.filter(row => txt(row?.name)) : []
        const normal = status && compatible(status)
        const stateKey = !normal ? (!status && !statusError ? 'localBusy' : 'unavailable') : targetId ? 'linked' : history ? 'unlinked' : 'noneYet'
        const homeFooter = normal ? h('footer', { className: 'dpgsp-homefoot' }, menuView(),
          h('a', { className: 'dpgsp-help', href: GUIDE, target: '_blank', rel: 'noopener noreferrer', referrerPolicy: 'no-referrer', 'aria-label': t('openGuide') }, t('help'), icon('external', 12)),
          h('div', { className: 'dpgsp-actions' },
            btn('restore', t('restore'), rootAction('restore', () => openRestore('standard')), { disabled: locked, 'data-focus': 'restore' }),
            btn('backup', t('backup'), rootAction('backup', backup), { kind: 'primary', disabled: locked, 'data-focus': 'backup' }))) : null
        return h(React.Fragment, null,
          h(ProfileStatus, { key: (normal && readyUrl) || 'local', profile: status?.profile, stateKey, url: normal ? readyUrl : null, t }),
          normal ? frame(h(React.Fragment, null,
            facts([[t('backupContents'), t('contents')], [t('uploadTarget'), t(targetId === null ? 'newGist' : 'linkedGist')]]),
            note([targetId ? t('overwriteHint') : null, t('privacy')].filter(Boolean).join(' '), 'shield')), homeFooter) : null,
          statusError || issue || uploadCheck || (status && (busy || !normal)) ? frame(h(React.Fragment, null,
            alerts(!status && !statusError), status && !normal ? box('warning', h('p', null, t('staleHost')),
              h('div', { className: 'dpgsp-actions' }, btn('retry-status', t('statusRetry'), retryStatus, { disabled: !!busy }))) : null)) : null,
          normal && dropped.length ? frame(details(`${t('droppedDeps')} (${uploaded.droppedEntries ?? dropped.length})`, list(dropped, row => [isolated(row.name), mono(row.spec ?? '')]))) : null,
          normal && restoreReceipt ? receiptView() : null)
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
          h('input', { type: 'file', hidden: true, accept: '.json,application/json', ref: fileInput, onChange: chooseFile }), alerts()),
          footer([cancel(true), !locked ? h('a', { className: 'dpgsp-btn', 'data-action': 'export', href: `${API}/export${includeMachine ? '?include=machine' : ''}`, download: true }, t('export')) : null,
            btn('pick-file', t('import'), () => fileInput.current?.click(), { kind: 'primary', disabled: locked, 'data-focus': 'pick' })]))
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
      const views = { home: homeView, source: sourceView, preview: previewView, progress: () => h(RestoreProgress, { page, t }), receipt: () => receiptView(true),
        backup: backupView, local: localView, plugins: pluginsView, target: targetView, diagnostics: diagnosticsView, undo: undoView }
      const visible = page.name === 'receipt' || (status && compatible(status)) ? page.name : 'home'
      const liveText = visible === 'progress' ? progressStatus(page, t) : announcement ? t(announcement) : ''
      return h('div', { ref: root, className: 'dpgsp-root', 'data-view': visible, 'data-mode': page.mode,
        onKeyDown: e => {
          if (e.key !== 'Escape' || e.defaultPrevented || e.nativeEvent?.isComposing) return
          if (page.name === 'receipt') { e.preventDefault(); e.stopPropagation(); leaveReceipt(); return }
          if (flight.current?.write) { e.preventDefault(); e.stopPropagation(); return }
          if (menu) { e.preventDefault(); e.stopPropagation(); setMenu(false); moreButton.current?.focus() }
          else if (page.name !== 'home') { e.preventDefault(); e.stopPropagation(); home() }
        } }, h('style', null, CSS), views[visible](),
        h('p', { className: !announcement || announcement === 'reviewDone' ? 'dpgsp-sr' : 'dpgsp-hint', role: 'status', 'aria-live': 'polite', 'aria-atomic': true }, liveText))
    }
    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, DICT), `${NS}: dictionaries`)
        const t = ctx.locale.bind(NS)
        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section', id: NS, order: SECTION_ORDER, label: () => t('section'), locale: NS,
        }, () => h(Panel, { ctx, t })))
        // The shell owns the nav button, selection, size and label. This optional
        // decorative seat is matched by section id; it does not add a page.
        ctx.slots.inject('settings.section.icon', () => ctx.slots.register({ name: 'settings.section.icon', id: NS }, ({ size }) => icon('sync', size)))
      },
    }
  },
})

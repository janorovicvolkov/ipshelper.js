// <nowiki>
(() => {
    const cfg = mw.config.get();
    const page = cfg.wgPageName;
    const groups = cfg.wgUserGroups || [];
    if (!page.startsWith('Wikipedia:Investigasi_pengguna_siluman/')) return;
    if (!(groups.includes('sysop') || groups.includes('checkuser'))) return;
    const excludedPatterns = [
    	'/Arsip/',
    	'/Arsip',
    	'Kasus/',
    	'Indikator',
    	'header',
    	'IPS/'
    ];
    if (excludedPatterns.some(p => page.includes(p))) return;
    if (cfg.wgAction === 'history' || cfg.wgDiffNewId || cfg.wgDiffOldId || cfg.wgCurRevisionId !== cfg.wgRevisionId) return;
    const IPS = (window.IPSHelper = {
        version: "2.0",
        modules: {},
        ads: "([[w:id:WP:IPSHelper.js|IPSHelper.js]])",
        mainPath: "Pengguna:Janorovic Volkov/Perkakas/",
        initModule(name) {
            if (!IPS.modules[name]) {
                importScript(`${IPS.mainPath}IPSHelper-module/${name}.js`);
            }
        },
        register(name, moduleObj) {
            IPS.modules[name] = moduleObj;
            console.log(`[IPS.js v2] Modul ${name} terdaftar.`);
            if (moduleObj.init) moduleObj.init();
        }
    });
    async function load() {
        await mw.loader.using(['mediawiki.api', 'mediawiki.util', 'oojs-ui', 'mediawiki.ui.button']);
        const modules = ['change-case-status', 'block-and-tag', 'note-or-comment'];
        for (const mod of modules) {
            IPS.initModule(mod);
        }
        importScript(`${IPS.mainPath}IPSHelper-api.js`);
        importScript(`${IPS.mainPath}IPSHelper-panel.js`);
    }
    $(load);
})();
// </nowiki>

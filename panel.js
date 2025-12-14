// <nowiki>
(function() {
    const $content = $('#mw-content-text');
    const $panel = $('<div>', { id: 'ips-panel', class: 'mw-ui-panel mw-ui-progressive' })
        .css({
            marginBottom: '1em',
            padding: '1em',
            border: '1px solid #ccc',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            borderRadius: '4px'
        });
    $panel.append('<center><h2>IPSHelper.js – v2.0</h2></center>');
    const $headerContainer = $('<div>', { id: 'ips-header-container' });
    const headers = $content.find('h3');
    if (headers.length === 0) {
        $headerContainer.text('Saat ini belum ada kasus yang dilaporkan')
            .css({ fontStyle: 'italic', color: '#555', marginBottom: '1em' });
    } else {
        $headerContainer.append('<h3>Pilih kasus yang ingin ditangani:</h3>');
        headers.each(function(i) {
            const text = $(this).text().trim();
            const $radio = $('<label>', { class: 'mw-ui-radio', css: { display: 'block', margin: '0.2em 0' } });
            $radio.append(
                $('<input>', { type: 'radio', name: 'ips-header', value: text }),
                ` ${text}`
            );
            $headerContainer.append($radio);
        });
    }
    $panel.append($headerContainer);
    const disableMap = {
    	'change-case-status': ['close-case', 'archive-case'],
    	'block-and-tag': ['archive-case'],
    	'note-or-comment': ['archive-case'],
    	'close-case': ['change-case-status', 'archive-case'],
    	'archive-case': ['change-case-status', 'note-or-comment', 'close-case']
    };
    function updateDisabledActions() {
    	const allCheckboxes = $('#ips-checklist input[type="checkbox"]');
    	allCheckboxes.prop('disabled', false);
    	const active = $('#ips-checklist input:checked').map((_, el) => el.value).get();
    	const toDisable = new Set();
    	active.forEach(a => {
    		(disableMap[a] || []).forEach(d => toDisable.add(d));
    	});
    	toDisable.forEach(key => {
    		$(`#ips-checklist input[value="${key}"]`)
    		.prop('disabled', true)
    		.prop('checked', false);
    	});
    	const requiresNote = active.includes('change-case-status') || active.includes('close-case');
    	const $noteBox = $('#ips-checklist input[value="note-or-comment"]');
    	if (requiresNote) {
    		$noteBox.prop('checked', true).prop('disabled', true);
    	} else {
    		if (!toDisable.has('note-or-comment')) {
    			$noteBox.prop('disabled', false);
    			if ($noteBox.data('wasRequired')) {
    				$noteBox.prop('checked', false);
    			}
    		}
    	}
    	$noteBox.data('wasRequired', requiresNote);
    }
    const modules = [
        { name: 'Ubah status kasus<small>#</small>', key: 'change-case-status' },
        { name: 'Blokir/tandai siluman<small>#</small>', key: 'block-and-tag' },
        { name: 'Catatan/komentar<small>#</small>', key: 'note-or-comment' },
        { name: 'Tutup kasus<small>*</small>', key: 'close-case' },
        { name: 'Arsipkan kasus<small>*</small>', key: 'archive-case' }
    ];
    const $checklistContainer = $('<div>', { id: 'ips-checklist', css: { marginTop: '1em' } });
    $checklistContainer.append('<h3>Pilih aksi yang ingin dijalankan:</h3>');
    modules.forEach(mod => {
        const $label = $('<label>', { class: 'mw-ui-checkbox', css: { display: 'block', margin: '0.2em 0' } });
        $label.append(
            $('<input>', { type: 'checkbox', value: mod.key }),
            ` ${mod.name}`
        );
        $checklistContainer.append($label);
    });
    $panel.append($checklistContainer);
    $panel.on('change', '#ips-checklist input[type="checkbox"]', updateDisabledActions);
    function syncModulePanels(selectedHeader, selectedModules) {
    	const $container = $('#ips-module-container');
    	$container.children().each(function() {
    		const id = $(this).attr('id');
    		const matches = id.match(/^ips-(.*?)-/);
    		if (!matches) return;
    		const modKey = matches[1];
    		if (!selectedModules.includes(modKey)) {
    			$(this).remove();
    		}
    	});
    	modules.forEach(m => {
    		if (!selectedModules.includes(m.key)) return;
    		const panelId = `ips-${m.key}-${selectedHeader.replace(/\s+/g, '-')}`;
    		if ($(`#${panelId}`).length) return;
    		$(document).trigger(`ips:open-module-${m.key}`, [selectedHeader]);
    	});
    }
    const $confirmBtn = $('<button>', { text: 'Muat aksi', class: 'mw-ui-button mw-ui-progressive', css: { marginTop: '0.5em' } });
    $confirmBtn.on('click', () => {
        const selectedHeader = $('input[name="ips-header"]:checked').val();
        if (!selectedHeader) return mw.notify('⚠️ Pilih kasus yang perlu ditangani!');
        const selectedModules = $('#ips-checklist input:checked').map((_, el) => el.value).get();
        if (selectedModules.length === 0) return mw.notify('⚠️ Pilih setidaknya satu aksi!');
        syncModulePanels(selectedHeader, selectedModules);
    });
    const $applyBtn = $('<button>', { text: 'Terapkan', class: 'mw-ui-button mw-ui-destructive', css: { marginTop: '0.5em' } });
    $applyBtn.on('click', async () => {
    	const selectedHeader = $('input[name="ips-header"]:checked').val();
    	if (!selectedHeader) return mw.notify('⚠️ Pilih kasus yang perlu ditangani!');
    	const selectedModules = $('#ips-checklist input:checked').map((_, el) => el.value).get();
    	if (selectedModules.length === 0) return mw.notify('⚠️ Pilih setidaknya satu aksi!');
    	try {
    		await IPSHelper.api.applyModules(selectedHeader, selectedModules);
    		mw.notify('🟢 Tindakan yang diminta telah selesai');
    	} catch (e) {
    		mw.notify(`⚠️ Terjadi kesalahan dalam menjalankan tindakan yang diminta: ${e.message}`);
    	}
    });
    $panel.append($confirmBtn);
    $panel.append('<br>');
    $panel.append($applyBtn);
    $panel.append('<br><br><small>Keterangan:<br><strong>* Bisa terapkan tanpa muat aksi<br># Perlu muat aksi terlebih dahulu</strong></small>');
    $panel.append('<br><hr>');
    const $moduleContainer = $('<div>', { id: 'ips-module-container' });
    $panel.append($moduleContainer);
    $content.prepend($panel);
})();
// </nowiki>

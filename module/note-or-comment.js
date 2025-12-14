// <nowiki>
(function() {
    const moduleObj = {
        selectedTemplate: {},
        init() {
            $(document).on('ips:open-module-note-or-comment', function(event, header) {
                if (!header) return mw.notify('⚠️ Kasus tidak valid!');
                const panelId = `ips-note-or-comment-${header.replace(/\s+/g,'-')}`;
                if ($('#' + panelId).length) return;
                const $panel = $('<div>', {
                    id: panelId,
                    class: 'mw-ui-panel mw-ui-progressive',
                    css: { marginBottom: '0.5em', padding: '0.5em' }
                });
                $panel.append($('<h4>').text('Tambahkan catatan / komentar:'));
                const groups = mw.config.get('wgUserGroups') || [];
                let templates = [
                    { name: '--- Pilih ---', value: '' },
                    { name: 'Diblokir dan ditandai', value: '{{Bnt}}' },
                    { name: 'IP diblokir', value: '{{IPblock}}' },
                    { name: 'Rentang IP diblokir', value: '{{Rblock}}' },
                    { name: 'Akun sementara diblokir', value: '{{Anon block}}' },
                    { name: 'Aksi dan tutup', value: '{{}}' },
                    { name: 'Penguncian global telah diminta', value: '{{Glr}}' },
                    { name: 'Tidak mungkin', value: '{{Impossible}}' },
                    { name: 'Ditolak (IP / Akun sementara)', value: '{{Decline-IP}}' }
                ];
                if (groups.includes('sysop')) {
                    templates.push(
                    	{ name: 'Mendukung', value: '{{Endorse}}' },
                    	{ name: 'Menolak', value: '{{Decline}}' },
                        { name: 'Catatan pengurus', value: '{{Catatan pengurus}}' },
                        { name: 'Bebek', value: '{{Bebek}}' }
                    );
                }
                if (groups.includes('checkuser')) {
                    templates.push(
                        { name: 'Terkonfirmasi', value: '{{Confirmed}}' },
                        { name: 'Sepertinya berhubungan', value: '{{Likely}}' },
                        { name: 'Bisa jadi', value: '{{Possible}}' },
                        { name: 'Sepertinya tidak berhubungan', value: '{{Unlikely}}' },
                        { name: 'Sepertinya bisa jadi berhubungan', value: '{{Possilikely}}' },
                        { name: 'Tidak konklusif', value: '{{Inkonklusif}}' },
                        { name: 'Catatan pemeriksa', value: '{{CUnote}}' }
                    );
                }
                const $select = $('<select>', { class: 'mw-ui-input' });
                templates.forEach(t => $select.append($('<option>', { value: t.value, text: t.name })));
                $panel.append($('<label>').text('Pilih templat (opsional): ').append($select));
                const $textarea = $('<textarea>', {
                    class: 'mw-ui-input',
                    rows: 4,
                    css: { width: '100%', marginTop: '0.5em' }
                }).val('*');
                $panel.append($('<br>')).append($textarea);
                $select.on('change', function() {
                    const val = $(this).val();
                    const cur = $textarea.val();
                    $textarea.val(cur + ' ' + val);
                    moduleObj.selectedTemplate[header] = $textarea.val();
                });
                $textarea.on('input', function() {
                	moduleObj.selectedTemplate[header] = $(this).val();
                });
                if (moduleObj.selectedTemplate[header]) {
                    $textarea.val(moduleObj.selectedTemplate[header]);
                }
                $('#ips-module-container').append($panel);
            });
        }
    };
    IPSHelper.register('note-or-comment', moduleObj);
})();
// </nowiki>

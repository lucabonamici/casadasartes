/* =========================================================
   MEIA VOLTA DO ÚRANO — admin editor logic
   ========================================================= */
(() => {
  'use strict';

  if (!window.MVUEvents) {
    console.error('MVUEvents not loaded');
    return;
  }

  const form     = document.getElementById('adminForm');
  const saveBtn  = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const statusEl = document.getElementById('status');
  const MAX      = window.MVUEvents.MAX_EVENTS;

  const setStatus = (msg, kind = 'ok') => {
    statusEl.textContent = msg;
    statusEl.className = `admin-status admin-status--${kind}`;
  };

  const escAttr = (s) => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');

  const escText = (s) => String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('FileReader error'));
    reader.readAsDataURL(file);
  });

  const buildBlock = (i, ev) => {
    const fs = document.createElement('fieldset');
    fs.className = 'admin-event';
    fs.dataset.index = String(i);
    fs.innerHTML = `
      <legend>Evento ${i + 1}</legend>
      <div class="admin-row admin-row--split">
        <label>Dia
          <input name="day" type="text" maxlength="3" value="${escAttr(ev.day)}" placeholder="18" />
        </label>
        <label>Mês
          <input name="month" type="text" maxlength="6" value="${escAttr(ev.month)}" placeholder="Abr" />
        </label>
      </div>
      <label>Título
        <input name="title" type="text" value="${escAttr(ev.title)}" placeholder="Nome do evento" />
      </label>
      <label>Descrição
        <textarea name="description" rows="2" placeholder="Breve descrição">${escText(ev.description)}</textarea>
      </label>
      <label>Hora · Local · Notas
        <input name="meta" type="text" value="${escAttr(ev.meta)}" placeholder="21h30 · Sala principal · Entrada livre" />
      </label>
      <label>Imagem — URL
        <input name="image" type="url" value="${escAttr(ev.image)}" placeholder="https://..." />
      </label>
      <label>Ou carregar do dispositivo
        <input name="imageFile" type="file" accept="image/*" />
      </label>
      <div class="admin-preview">
        ${ev.image
          ? `<img src="${escAttr(ev.image)}" alt="" />`
          : `<span class="admin-preview__empty">Sem imagem</span>`}
      </div>
    `;

    const urlInput  = fs.querySelector('input[name="image"]');
    const fileInput = fs.querySelector('input[name="imageFile"]');
    const preview   = fs.querySelector('.admin-preview');

    const updatePreview = (src) => {
      if (src) {
        preview.innerHTML = `<img src="${escAttr(src)}" alt="" />`;
      } else {
        preview.innerHTML = `<span class="admin-preview__empty">Sem imagem</span>`;
      }
    };

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        setStatus(`Imagem demasiado grande (>${'2'}MB). Use uma imagem mais pequena ou um URL.`, 'err');
        e.target.value = '';
        return;
      }
      try {
        const dataUrl = await fileToDataUrl(file);
        urlInput.value = dataUrl;
        updatePreview(dataUrl);
        setStatus('Imagem carregada. Não esqueça de guardar.', 'ok');
      } catch (err) {
        setStatus('Erro ao ler o ficheiro: ' + err.message, 'err');
      }
    });

    urlInput.addEventListener('input', () => updatePreview(urlInput.value.trim()));

    return fs;
  };

  const renderForm = (events) => {
    form.innerHTML = '';
    for (let i = 0; i < MAX; i++) {
      const ev = events[i] || { day: '', month: '', title: '', description: '', meta: '', image: '' };
      form.appendChild(buildBlock(i, ev));
    }
  };

  const collect = () => {
    return Array.from(form.querySelectorAll('.admin-event')).map((b) => ({
      day:         b.querySelector('[name="day"]').value.trim(),
      month:       b.querySelector('[name="month"]').value.trim(),
      title:       b.querySelector('[name="title"]').value.trim(),
      description: b.querySelector('[name="description"]').value.trim(),
      meta:        b.querySelector('[name="meta"]').value.trim(),
      image:       b.querySelector('[name="image"]').value.trim()
    }));
  };

  saveBtn.addEventListener('click', () => {
    try {
      window.MVUEvents.saveEvents(collect());
      setStatus('Alterações guardadas. Abra a página principal para ver o resultado.', 'ok');
    } catch (err) {
      const msg = (err && err.name === 'QuotaExceededError')
        ? 'Espaço de armazenamento esgotado. Use URLs em vez de ficheiros grandes.'
        : 'Erro ao guardar: ' + (err && err.message);
      setStatus(msg, 'err');
    }
  });

  resetBtn.addEventListener('click', () => {
    if (!window.confirm('Repor todos os eventos para os valores por defeito?')) return;
    window.MVUEvents.resetEvents();
    renderForm(window.MVUEvents.DEFAULT_EVENTS);
    setStatus('Eventos repostos.', 'ok');
  });

  renderForm(window.MVUEvents.getEvents());
})();

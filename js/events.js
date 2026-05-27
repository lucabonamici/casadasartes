/* =========================================================
   MEIA VOLTA DO ÚRANO — events store + renderer
   Persists to localStorage. Always returns up to 4 events.
   ========================================================= */
(() => {
  'use strict';

  const STORAGE_KEY = 'mvu_events_v1';
  const MAX_EVENTS = 4;

  const DEFAULT_EVENTS = [
    {
      day: '18',
      month: 'Abr',
      title: 'Noite de Fado & Guitarra',
      description: 'Um serão íntimo com o guitarrista Miguel Ramos e a fadista Joana Alves.',
      meta: '21h30 · Sala principal · Entrada livre',
      image: 'https://res.cloudinary.com/glide/image/fetch/f_auto,w_800,c_limit/https%3A%2F%2Fstorage.googleapis.com%2Fglide-prod.appspot.com%2Fuploads-v2%2F2Gl25MqjgnaRMIDIaXLp%2Fpub%2Fn4fBXltDro4sKHoaxqRh.jpeg'
    },
    {
      day: '26',
      month: 'Abr',
      title: 'Lançamento do livro "Atlas Interior"',
      description: 'Conversa com a autora Marta Vilar, seguida de brinde e sessão de autógrafos.',
      meta: '19h00 · Livraria · Inscrição gratuita',
      image: 'https://res.cloudinary.com/glide/image/fetch/f_auto,w_800,c_limit/https%3A%2F%2Fstorage.googleapis.com%2Fglide-prod.appspot.com%2Fuploads-v2%2F2Gl25MqjgnaRMIDIaXLp%2Fpub%2F4KCz00V8oss99o2XRRvT.jpeg'
    },
    {
      day: '03',
      month: 'Mai',
      title: 'Exposição "Silêncio em Carbono"',
      description: 'Inauguração da mostra individual do artista plástico André Coutinho.',
      meta: '18h30 · Galeria · Patente até 30 Junho',
      image: 'https://res.cloudinary.com/glide/image/fetch/f_auto,w_800,c_limit/https%3A%2F%2Fstorage.googleapis.com%2Fglide-prod.appspot.com%2Fuploads-v2%2F76VwTQBI9lM1RFMJel0n%2Fpub%2FPoV8ApblMkyPnPBvhG4g.png'
    },
    {
      day: '10',
      month: 'Mai',
      title: 'Jantar Vínico — Vinhos do Dão',
      description: 'Cinco andamentos, cinco castas. Com a presença do enólogo convidado.',
      meta: '20h00 · Mesa comum · Reserva obrigatória',
      image: 'https://res.cloudinary.com/glide/image/fetch/f_auto,w_800,c_limit/https%3A%2F%2Fstorage.googleapis.com%2Fglide-prod.appspot.com%2Fuploads-v2%2F2Gl25MqjgnaRMIDIaXLp%2Fpub%2F4KCz00V8oss99o2XRRvT.jpeg'
    }
  ];

  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const normalize = (ev) => ({
    day: String(ev?.day ?? '').trim(),
    month: String(ev?.month ?? '').trim(),
    title: String(ev?.title ?? '').trim(),
    description: String(ev?.description ?? '').trim(),
    meta: String(ev?.meta ?? '').trim(),
    image: String(ev?.image ?? '').trim()
  });

  const getEvents = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_EVENTS.map(normalize);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return DEFAULT_EVENTS.map(normalize);
      return parsed.slice(0, MAX_EVENTS).map(normalize);
    } catch {
      return DEFAULT_EVENTS.map(normalize);
    }
  };

  const saveEvents = (events) => {
    const list = Array.isArray(events) ? events : [];
    const cleaned = list.slice(0, MAX_EVENTS).map(normalize);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  };

  const resetEvents = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const renderEvents = (container) => {
    if (!container) return;
    const events = getEvents().filter(e => e.title || e.description || e.day);
    container.innerHTML = events.map((ev) => `
      <article class="evento reveal">
        <div class="evento__date">
          <span class="evento__day">${escapeHtml(ev.day)}</span>
          <span class="evento__month">${escapeHtml(ev.month)}</span>
        </div>
        <div class="evento__body">
          <h3>${escapeHtml(ev.title)}</h3>
          <p>${escapeHtml(ev.description)}</p>
          <span class="evento__meta">${escapeHtml(ev.meta)}</span>
        </div>
        ${ev.image ? `<div class="evento__img"><img src="${escapeHtml(ev.image)}" alt="${escapeHtml(ev.title)}" loading="lazy" /></div>` : ''}
      </article>
    `).join('');
  };

  window.MVUEvents = {
    DEFAULT_EVENTS,
    MAX_EVENTS,
    getEvents,
    saveEvents,
    resetEvents,
    renderEvents
  };
})();

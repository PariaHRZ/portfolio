(function () {
  const form = document.getElementById('contactForm');
  const responseDiv = document.getElementById('response');

  if (!form) return;
  const _response = responseDiv || (function () {
    const d = document.createElement('div');
    d.id = 'response';
    d.className = 'response-message';
    form.appendChild(d);
    return d;
  })();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    _response.textContent = 'Envoi en cours...';
    const formData = new FormData(form);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch('https://api.ryan.pixicode.dev/contact', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.status === 429) {
        const retry = res.headers.get('Retry-After') || '60';
        _response.innerHTML = `<span style='color:#dc2626;'>Trop de requêtes. Réessayez dans ${retry} secondes.</span>`;
      } else if (!res.ok) {
        let errMsg = 'Erreur lors de l’envoi du message.';
        try {
          const err = await res.json();
          if (err && err.detail) errMsg = err.detail;
        } catch (_) {}
        _response.innerHTML = `<span style='color:#dc2626;'>${errMsg}</span>`;
      } else {
        const data = await res.json();
        if (data && data.success) {
          _response.innerHTML = "<span style='color:#16a34a;'>Message envoyé avec succès !</span>";
          form.reset();
        } else {
          const msg = (data && data.error) ? JSON.stringify(data.error) : 'Erreur lors de l’envoi du message.';
          _response.innerHTML = `<span style='color:#dc2626;'>${msg}</span>`;
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        _response.innerHTML = "<span style='color:#dc2626;'>Délai d'attente dépassé. Réessayez.</span>";
      } else {
        _response.innerHTML = "<span style='color:#dc2626;'>Erreur de connexion au serveur.</span>";
        console.error(err);
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      clearTimeout(timeoutId);
    }
  });
})();
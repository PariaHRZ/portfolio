(function () {
  // Récupère le formulaire et la div de réponse
  const form = document.getElementById('contactForm');
  const responseDiv = document.getElementById('response');

  // Si le formulaire n'existe pas, on arrête le script
  if (!form) return;

  // Crée dynamiquement la div de réponse si elle n'existe pas déjà
  const _response = responseDiv || (function () {
    const d = document.createElement('div');
    d.id = 'response';
    d.className = 'response-message';
    form.appendChild(d);
    return d;
  })();

  // Événement lors de la soumission du formulaire
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Désactive le bouton d’envoi pendant le traitement
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    _response.textContent = 'Envoi en cours...'; // Message d’attente

    const formData = new FormData(form); // Récupère les données du formulaire

    // Contrôle du timeout (15 secondes)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Envoi de la requête POST à ton API
      const res = await fetch('https://api.ryan.pixicode.dev/contact', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Annule le timeout si la requête est terminée

      // Gestion du rate limit (trop de requêtes)
      if (res.status === 429) {
        const retry = res.headers.get('Retry-After') || '60';
        _response.innerHTML = `<span style='color:#dc2626;'>Trop de requêtes. Réessayez dans ${retry} secondes.</span>`;
      }
      // Gestion d’une erreur serveur ou client
      else if (!res.ok) {
        let errMsg = 'Erreur lors de l’envoi du message.';
        try {
          const err = await res.json();
          if (err && err.detail) errMsg = err.detail;
        } catch (_) {}
        _response.innerHTML = `<span style='color:#dc2626;'>${errMsg}</span>`;
      }
      // Si la requête est un succès
      else {
        const data = await res.json();
        if (data && data.success) {
          _response.innerHTML = "<span style='color:#16a34a;'>Message envoyé avec succès !</span>";
          form.reset(); // Réinitialise le formulaire
        } else {
          // En cas d’erreur inattendue côté API
          const msg = (data && data.error) ? JSON.stringify(data.error) : 'Erreur lors de l’envoi du message.';
          _response.innerHTML = `<span style='color:#dc2626;'>${msg}</span>`;
        }
      }
    } catch (err) {
      // Timeout (AbortError)
      if (err.name === 'AbortError') {
        _response.innerHTML = "<span style='color:#dc2626;'>Délai d'attente dépassé. Réessayez.</span>";
      } 
      // Erreur de connexion ou autre exception
      else {
        _response.innerHTML = "<span style='color:#dc2626;'>Erreur de connexion au serveur.</span>";
        console.error(err);
      }
    } finally {
      // Réactive le bouton d’envoi et nettoie le timeout
      if (submitBtn) submitBtn.disabled = false;
      clearTimeout(timeoutId);
    }
  });
})();

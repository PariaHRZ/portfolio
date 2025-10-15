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
    _response.textContent = 'Envoi en cours...';
    const formData = new FormData(form);

    try {
      const res = await fetch('https://api.ryan.pixicode.dev/contact', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data && data.success) {
        _response.innerHTML = "<span style='color:#16a34a;'>Message envoyé avec succès !</span>";
        form.reset();
      } else {
        _response.innerHTML = "<span style='color:#dc2626;'>Erreur lors de l’envoi du message.</span>";
      }
    } catch (err) {
      _response.innerHTML = "<span style='color:#dc2626;'>Erreur de connexion au serveur.</span>";
      console.error(err);
    }
  });
})();
         const burger = document.querySelector('.burger');
         const nav = document.querySelector('.nav-links');
         burger.addEventListener('click', () => {
           burger.classList.toggle('active');
           nav.classList.toggle('active');
         });
         
         const form = document.getElementById('contactForm');
         const responseDiv = document.getElementById('response');
         
         form.addEventListener('submit', async (e) => {
           e.preventDefault();
           responseDiv.innerHTML = "Envoi en cours...";
           const formData = new FormData(form);
           try {
             const res = await fetch("https://api.ryan.pixicode.dev/contact", {
               method: "POST",
               body: formData
             });
             const data = await res.json();
             if (data.success) {
               responseDiv.innerHTML = "<span style='color:#16a34a;'>Message envoyé avec succès !</span>";
               form.reset();
             } else {
               responseDiv.innerHTML = "<span style='color:#dc2626;'>Erreur lors de l’envoi du message.</span>";
             }
           } catch (err) {
             responseDiv.innerHTML = "<span style='color:#dc2626;'>Erreur de connexion au serveur.</span>";
             console.error(err);
           }
         });
         
         window.dataLayer = window.dataLayer || [];
         function gtag(){dataLayer.push(arguments);}
         gtag('js', new Date());
         gtag('config', 'G-LNDKFNJ4D3');

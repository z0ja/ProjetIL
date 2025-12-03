        // Simulation basique de la synchronisation et du chat (à remplacer par WebSockets pour le temps réel)
        document.getElementById('playBtn').addEventListener('click', function() {
            // Logique pour jouer la vidéo (via YouTube API si intégré)
            alert('Vidéo lancée ! (Synchronisation simulée)');
        });
        document.getElementById('pauseBtn').addEventListener('click', function() {
            alert('Vidéo en pause ! (Synchronisation simulée)');
        });
        document.getElementById('syncBtn').addEventListener('click', function() {
            alert('Synchronisation effectuée !');
        });
        document.getElementById('sendBtn').addEventListener('click', function() {
            const message = document.getElementById('chatInput').value;
            if (message) {
                const chatMessages = document.getElementById('chatMessages');
                chatMessages.innerHTML += `<div class="mb-2"><strong>Vous :</strong> ${message}</div>`;
                document.getElementById('chatInput').value = '';
                chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
            }
        });
        // Pour charger une nouvelle vidéo (simulé)
        document.getElementById('loadVideoBtn').addEventListener('click', function() {
            const url = document.getElementById('videoUrl').value;
            if (url.includes('youtube.com')) {
                const videoId = url.split('v=')[1].split('&')[0];
                document.getElementById('videoPlayer').src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
                alert('Nouvelle vidéo chargée !');
            } else {
                alert('URL YouTube invalide.');
            }
        });

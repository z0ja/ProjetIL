/**
 * auth-nav.js — W2G
 * Gère l'affichage de la navbar selon l'état de connexion.
 * Compatible avec toutes les pages du projet :
 *   - index.html        (racine)
 *   - pages/*.html      (sous-dossier /pages/)
 *
 * Détecte automatiquement la profondeur du fichier courant
 * pour construire les hrefs relatifs corrects.
 */

document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("nav-auth");
    if (!nav) return;

    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");

    // ── Détection du chemin relatif ──
    // Si on est dans /pages/, le chemin vers la racine est "../"
    // Si on est à la racine, c'est "./"
    const inPages = window.location.pathname.includes("/pages/");
    const root    = inPages ? "../"        : "./";
    const pages   = inPages ? "./"         : "./pages/";

    // ── Styles injectés (alignés sur les tokens CSS de chaque page) ──
    // On réutilise les classes déjà définies dans chaque page (.nav-links a, .btn-nav)
    // + on ajoute les styles spécifiques au nom d'utilisateur et déconnexion

    if (token && user) {
        // ════════════════════════════════════════
        // UTILISATEUR CONNECTÉ
        // ════════════════════════════════════════
        nav.innerHTML = `
            <a href="${pages}filtres.html"
               style="display:inline-flex;align-items:center;gap:6px;
                      color:var(--muted);text-decoration:none;font-size:.84rem;
                      padding:7px 14px;border-radius:6px;
                      transition:background .15s,color .15s;"
               onmouseover="this.style.background='var(--surface2)';this.style.color='var(--text)'"
               onmouseout="this.style.background='transparent';this.style.color='var(--muted)'">
                <i class="bi bi-funnel"></i> Recherche notes
            </a>

            <a href="${pages}room-make.html"
               style="display:inline-flex;align-items:center;gap:6px;
                      color:var(--muted);text-decoration:none;font-size:.84rem;
                      padding:7px 14px;border-radius:6px;
                      transition:background .15s,color .15s;"
               onmouseover="this.style.background='var(--surface2)';this.style.color='var(--text)'"
               onmouseout="this.style.background='transparent';this.style.color='var(--muted)'">
                <i class="bi bi-plus-circle"></i> Créer
            </a>

            <span style="display:inline-flex;align-items:center;gap:6px;
                         font-family:var(--mono);font-size:.78rem;
                         color:var(--navy);font-weight:600;
                         background:var(--surface2);border:1px solid var(--border);
                         padding:6px 12px;border-radius:6px;">
                <i class="bi bi-person-circle" style="color:var(--accent)"></i>
                ${user.username || user.name || "Utilisateur"}
            </span>

            <button id="logoutBtn"
               style="display:inline-flex;align-items:center;gap:6px;
                      background:transparent;border:1px solid var(--border);
                      color:var(--muted);font-family:var(--mono);font-size:.78rem;
                      padding:7px 14px;border-radius:6px;cursor:pointer;
                      transition:all .15s;"
               onmouseover="this.style.borderColor='var(--danger)';this.style.color='var(--danger)'"
               onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--muted)'">
                <i class="bi bi-box-arrow-right"></i> Déconnexion
            </button>
        `;

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("roomObject");
            localStorage.removeItem("listeParticipant");
            window.location.href = root + "index.html";
        });

    } else {
        // ════════════════════════════════════════
        // UTILISATEUR NON CONNECTÉ
        // ════════════════════════════════════════
        nav.innerHTML = `
            <a href="${pages}login.html"
               style="color:var(--muted);text-decoration:none;font-size:.84rem;
                      padding:7px 14px;border-radius:6px;
                      transition:background .15s,color .15s;"
               onmouseover="this.style.background='var(--surface2)';this.style.color='var(--text)'"
               onmouseout="this.style.background='transparent';this.style.color='var(--muted)'">
                Connexion
            </a>

            <a href="${pages}register.html"
               style="background:var(--navy);color:#fff;
                      font-weight:700;font-size:.8rem;letter-spacing:.06em;
                      text-transform:uppercase;border-radius:6px;
                      padding:8px 18px;text-decoration:none;
                      transition:background .15s;"
               onmouseover="this.style.background='var(--navy2)'"
               onmouseout="this.style.background='var(--navy)'">
                S'inscrire
            </a>
        `;
    }
});
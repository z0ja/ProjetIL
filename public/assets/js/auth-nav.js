document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("nav-auth");

    if (!nav) return;

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    // Utilisateur connecté
    if (token && user) {
        nav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="../index.html">Accueil</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="pages/room.html">Room</a>
            </li>
            <li class="nav-item">
                <span class="nav-link fw-bold text-primary text-capitalize">
                    ${user.username}
                </span>
            </li>
            <li class="nav-item">
                <button class="btn btn-outline-danger btn-sm" id="logoutBtn">
                    Déconnexion
                </button>
            </li>
        `;

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "../index.html";
        });

    } 
    // Utilisateur NON connecté
    else {
        nav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="../index.html">Accueil</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="pages/room.html">Room</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="pages/login.html">Connexion</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="pages/register.html">S'inscrire</a>
            </li>
        `;
    }
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("registerMessage");

    // Vérification mot de passe
    if (password !== confirmPassword) {
        message.innerText = "Les mots de passe ne correspondent pas.";
        return;
    }

    try {
        const API_URL = window.location.origin;
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.innerText = data.error;
            return;
        }

        message.classList.remove("text-danger");
        message.classList.add("text-success");
        message.innerText = "Inscription réussie ! Redirection...";

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (err) {
        console.error(err);
        message.innerText = "Erreur serveur.";
    }
});

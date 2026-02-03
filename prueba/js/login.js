const button = document.getElementById('button');
const email_user = document.getElementById('user');
const password_user = document.getElementById('password');
const registro = document.getElementById('registro');
const formRegistro = document.getElementById('formRegistro');


button.addEventListener('click', (event) => {
    event.preventDefault();

    fetch(`http://localhost:5000/registros?correo=${email_user.value}&password=${password_user.value}`)
        .then(response => response.json())
        .then(data => {

            if (data.length > 0) {
                const user = data[0];

                // Guardar sesión
                localStorage.setItem('session', 'yes');
                localStorage.setItem('role', user.role);
                localStorage.setItem('correo', user.correo);

                // Redirección según rol
                if (user.role === "Administrador") {
                    window.location.href = "./index.html";
                } else {
                    window.location.href = "./index.html";
                }

            } else {
                alert("Usuario o contraseña incorrectos");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error al conectar con el servidor");
        });
});


registro.addEventListener('click', () => {
    const modal = new bootstrap.Modal(
        document.getElementById('modalRegistro')
    );
    modal.show();
});


formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoRegistro = {
        nombre: document.getElementById('reg_nombre').value,
        correo: document.getElementById('reg_correo').value,
        password: document.getElementById('reg_password').value,
        role: document.getElementById('reg_role').value
    };

    try {
        await fetch('http://localhost:5000/registros', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoRegistro)
        });

        alert("Usuario registrado correctamente");

        formRegistro.reset();

        bootstrap.Modal.getInstance(
            document.getElementById('modalRegistro')
        ).hide();

    } catch (error) {
        console.error("Error:", error);
        alert("Error al registrar usuario");
    }
});
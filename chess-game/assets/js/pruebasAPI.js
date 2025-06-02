const server = 'http://localhost:3000';

async function NewUser(){
    const userData = {
        email: document.getElementById('newEmail').value,
        password: document.getElementById('newPassword').value,
    };

    if (!userData.email || !userData.password) {
        console.log('Todos los campos son requeridos');
        return;
    }
    try {
        const response = await fetch(server + '/api/playerstats', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear usuario');
        }

        const result = await response.json();
        console.log(result.message || 'Usuario creado exitosamente');

    } catch (error) {
        console.error('Error añadiendo usuario:', error);
    }
}

async function main() {
    // For USERS

    // Sign-up
    const buttonNewUser = document.getElementById("NewUser");
    buttonNewUser.addEventListener('click', NewUser);
   
}

main();
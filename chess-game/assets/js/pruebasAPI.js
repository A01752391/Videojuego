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
        const response = await fetch(`${server}/api/playerstats/`, {
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

async function UpdateUser() {
    const currentEmail = document.getElementById('currentEmail').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newEmail = document.getElementById('updatedEmail').value;
    const newPassword = document.getElementById('updatedPassword').value;

    if (!currentEmail || !currentPassword) {
        console.error('Email actual y contraseña actual son obligatorios');
        return;
    }

    const requestBody = {
        oldPassword: currentPassword
    };

    // Añadir campos opcionales solo si tienen valor
    if (newEmail) requestBody.newEmail = newEmail;
    if (newPassword) requestBody.newPassword = newPassword;

    try {
        const response = await fetch(`${server}/api/playerstats/${currentEmail}`, {
            method: "PATCH",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error al actualizar usuario');
        }

        console.log('Usuario actualizado exitosamente:', result);
        
        if (newEmail) {
            document.getElementById('currentEmail').value = newEmail;
        }

    } catch (error) {
        console.error('Error actualizando usuario:', error.message);
    }
}

async function main() {
    // For USERS

    // Sign-up
    const buttonNewUser = document.getElementById("NewUser");
    buttonNewUser.addEventListener('click', NewUser);

    // Update user data
    const buttonUpdateUser = document.getElementById("UpdateUser");
    buttonUpdateUser.addEventListener('click', UpdateUser);
   
}

main();
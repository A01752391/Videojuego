const server = 'http://localhost:3000';

//To show results using the new GameModal system
async function showResult(message, isError) {
    const title = isError ? 'Error' : 'Éxito';
    if (isError) {
        return GameModal.error(title, message);
    } else {
        return GameModal.success(title, message);
    }
}

// Helper function to clear form
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

// Helper function to show confirmation
function showConfirmation(title, message) {
    return GameModal.confirm(title, message);
}

async function NewUser(){
    const userData = {
        email: document.getElementById('newEmail').value,
        password: document.getElementById('newPassword').value,
    };

    if (!userData.email || !userData.password) {
        console.log('Todos los campos son requeridos');
        showResult('Todos los campos son requeridos', true);
        return;
    }
    try {
        const response = await fetch(`${server}/api/playerstats`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            showResult(errorData.message, true);
            throw new Error(errorData.message || 'Error añadiendo usuario');
        }        const result = await response.json();
        showResult(result.message, false);
        console.log(result.message || 'Usuario creado exitosamente');
        
        // Clear form on success
        clearForm('formaSignUpUser');

    } catch (error) {
        showResult(error.message, true);
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
        showResult('Email actual y contraseña actual son obligatorios', true);
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
            showResult(result.message, true);
            throw new Error(result.message || 'Error al actualizar usuario');
        }        console.log('Usuario actualizado exitosamente:', result);
        showResult(result.message, false);
        
        // Clear form on success
        clearForm('formaUpdateUser');
        
        if (newEmail) {
            document.getElementById('currentEmail').value = newEmail;
        }

    } catch (error) {
        console.error('Error actualizando usuario:', error.message);
        showResult(error.message, true);
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
    
    // Main menu button
    const mainMenuBtn = document.getElementById('usersMainMenuBtn');
    if (mainMenuBtn) {
        mainMenuBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

main();
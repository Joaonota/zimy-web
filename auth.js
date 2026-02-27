/**
 * Zimy Authentication System
 */

const Auth = {
    login: async (email, password) => {
        const { auth, db, doc, getDoc } = window.zimyFirebase || {};

        if (!auth) {
            // Fallback (e.g. while testing)
            console.warn("Firebase Auth not initialized");
            return { success: false, message: "Erro de configuração." };
        }

        try {
            // 1. AUTHENTICATE WITH FIREBASE AUTH
            const authData = await auth.signIn(email, password);
            const uid = authData.localId;

            // 2. FETCH PROFILE FROM FIRESTORE USING UID
            const therapistRef = doc(db, "therapists", uid);
            const docSnap = await getDoc(therapistRef);

            if (docSnap && docSnap.exists) {
                const user = docSnap.data();
                // Store session without the need for manual password check
                window.Zimy.db.setSession(user);
                return { success: true };
            }

            return { success: false, message: "Perfil não encontrado no banco de dados." };
        } catch (error) {
            console.error("Error logging in: ", error);
            let message = "Erro ao entrar.";
            if (error.message === "INVALID_PASSWORD" || error.message === "EMAIL_NOT_FOUND") {
                message = "Email ou senha incorretos.";
            } else if (error.message === "USER_DISABLED") {
                message = "Esta conta foi desativada.";
            }
            return { success: false, message: message };
        }
    },

    logout: () => {
        window.Zimy.db.clearSession();
        window.location.href = 'login.html';
    },

    isAuthenticated: () => {
        return !!window.Zimy.db.getSession();
    }
};

window.ZimyAuth = Auth;

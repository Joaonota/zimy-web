/**
 * Zimy Authentication System (Email/Password)
 */

const Auth = {
    login: async (email, password) => {
        const { auth, db, doc, getDoc } = window.zimyFirebase || {};

        if (!auth) {
            console.error("Firebase Auth not initialized");
            return { success: false, message: "Erro de configuração do Firebase." };
        }

        try {
            // 1. AUTHENTICATE WITH FIREBASE AUTH
            const authData = await auth.signIn(email, password);
            const uid = authData.localId;

            // 2. FETCH PROFILE FROM FIRESTORE
            const therapistRef = doc(db, "therapists", uid);
            const docSnap = await getDoc(therapistRef);

            if (docSnap && docSnap.exists) {
                const user = docSnap.data();
                // Store session
                window.Zimy.db.setSession(user);
                return { success: true };
            }

            return { success: false, message: "Perfil não encontrado." };
        } catch (error) {
            console.error("Login error:", error);
            let message = "Erro ao entrar.";
            if (error.message === "INVALID_LOGIN_CREDENTIALS" || error.message === "EMAIL_NOT_FOUND" || error.message === "INVALID_PASSWORD") {
                message = "Email ou senha incorretos.";
            }
            return { success: false, message: message };
        }
    },

    logout: () => {
        if (window.Zimy && window.Zimy.db) {
            window.Zimy.db.clearSession();
        }
        window.location.href = 'login.html';
    },

    isAuthenticated: () => {
        if (window.Zimy && window.Zimy.db) {
            return !!window.Zimy.db.getSession();
        }
        return false;
    }
};

window.ZimyAuth = Auth;

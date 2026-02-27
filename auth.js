/**
 * Zimy Authentication System (Google-only)
 */

const Auth = {
    // Legacy support (will now fail or can be redirected)
    login: async (email, password) => {
        return { success: false, message: "Este método de login foi desativado. Use o Google Sign-In." };
    },

    loginWithGoogle: async (idToken) => {
        const { auth, db, doc, getDoc } = window.zimyFirebase || {};

        if (!auth) {
            console.error("Firebase Auth not initialized");
            return { success: false, message: "Erro de configuração do Firebase." };
        }

        try {
            // 1. AUTHENTICATE WITH FIREBASE AUTH VIA GOOGLE TOKEN
            const authData = await auth.signInWithGoogle(idToken);
            const uid = authData.localId;

            // 2. FETCH PROFILE FROM FIRESTORE USING UID
            const therapistRef = doc(db, "therapists", uid);
            const docSnap = await getDoc(therapistRef);

            if (docSnap && docSnap.exists) {
                const user = docSnap.data();
                // Store session
                window.Zimy.db.setSession(user);
                return { success: true };
            }

            return { success: false, message: "Perfil não encontrado. Por favor, realize o cadastro." };
        } catch (error) {
            console.error("Error logging in with Google: ", error);
            return { success: false, message: "Erro ao autenticar com Google." };
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

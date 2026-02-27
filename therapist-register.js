/**
 * Therapist Registration Logic (Google-only)
 */

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const dot1 = document.getElementById('dot1');
    const dot2 = document.getElementById('dot2');
    const btnNext = document.getElementById('btnNext');
    const btnBack = document.getElementById('btnBack');

    // photo preview
    const imagePreview = document.getElementById('imagePreview');

    let firebaseUID = null;
    let googleIdToken = null;

    // Multi-select logic
    const setupChips = (containerId) => {
        const container = document.getElementById(containerId);
        container.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                chip.classList.toggle('active');
            });
        });
    };

    setupChips('langChips');
    setupChips('specialtyChips');

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const updateInitialsPreview = (name) => {
        const initials = getInitials(name);
        const container = document.querySelector('.profile-preview');
        let overlay = document.getElementById('initialsOverlay');

        if (!initials) {
            if (overlay) overlay.innerText = "";
            return;
        }

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'initialsOverlay';
            overlay.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:var(--glass-bg); color:var(--neon-blue); font-size:2rem; font-weight:bold; border-radius:50%; border:2px solid var(--neon-blue);";
            container.appendChild(overlay);
        }

        overlay.innerText = initials;
    };

    // Google Identity Callback
    window.handleGoogleResponse = async (response) => {
        const googleAuthError = document.getElementById('googleAuthError');
        googleAuthError.classList.add('d-none');

        try {
            const { auth } = window.zimyFirebase || {};
            if (!auth) throw new Error("Firebase Auth not initialized");

            googleIdToken = response.credential;
            const authData = await auth.signInWithGoogle(googleIdToken);

            firebaseUID = authData.localId;
            const email = authData.email;
            const fullName = authData.displayName || "";
            const photoURL = authData.photoUrl || "";

            // Pre-fill fields
            document.getElementById('fullName').value = fullName;
            document.getElementById('email').value = email;
            if (photoURL) {
                imagePreview.src = photoURL;
                imagePreview.classList.remove('d-none');
            } else {
                updateInitialsPreview(fullName);
            }

            // Show hidden fields and "Next" button
            document.getElementById('googleDataFields').classList.remove('d-none');
            document.querySelector('.g_id_signin').classList.add('d-none');
            document.getElementById('googleIntro').innerText = currentLang === 'pt' ? "Conta Google conectada!" : "Google account connected!";

        } catch (error) {
            console.error("Google Auth Error:", error);
            googleAuthError.innerText = currentLang === 'pt' ? "Erro ao autenticar com Google." : "Google auth error.";
            googleAuthError.classList.remove('d-none');
        }
    };

    // Navigation
    btnNext.addEventListener('click', () => {
        if (!firebaseUID) return;
        step1.classList.remove('active');
        step2.classList.add('active');
        dot2.classList.add('active');
    });

    btnBack.addEventListener('click', () => {
        step2.classList.remove('active');
        step1.classList.add('active');
        dot2.classList.remove('active');
    });

    // Language Toggle logic
    let currentLang = 'pt';
    const translations = {
        pt: {
            titleMain: 'Criar sua Conta',
            subtitleMain: 'Comece a acompanhar seus pacientes globalmente.',
            lblFullName: 'Nome',
            lblEmail: 'Email',
            lblPhone: 'Telefone',
            lblCountry: 'País',
            lblCity: 'Cidade',
            lblLanguages: 'Idiomas que fala',
            lblSpecialties: 'Especialidades',
            lblBioPt: 'Biografia (Português)',
            lblBioEn: 'Biografia (Inglês)',
            lblAvailability: 'Disponibilidade',
            lblOnline: 'Online',
            lblPresential: 'Presencial',
            lblPrice: 'Preço da Sessão',
            btnNext: 'Próximo',
            btnBack: 'Voltar',
            btnSubmit: 'Finalizar Cadastro',
            txtHasAccount: 'Já tem conta?',
            linkLogin: 'Entrar aqui',
            optSelectCountry: 'Selecionar país',
            uploadLabel: 'Upload',
            lblRegNumber: 'Nº de Registro Profissional',
            googleIntro: 'Faça login com sua conta Google para começar.'
        },
        en: {
            titleMain: 'Create your Account',
            subtitleMain: 'Start tracking your patients globally.',
            lblFullName: 'Name',
            lblEmail: 'Email',
            lblPhone: 'Phone',
            lblCountry: 'Country',
            lblCity: 'City',
            lblLanguages: 'Languages you speak',
            lblSpecialties: 'Specialties',
            lblBioPt: 'Biography (Portuguese)',
            lblBioEn: 'Biography (English)',
            lblAvailability: 'Availability',
            lblOnline: 'Online',
            lblPresential: 'In-person',
            lblPrice: 'Session Price',
            btnNext: 'Next',
            btnBack: 'Back',
            btnSubmit: 'Finish Signup',
            txtHasAccount: 'Already have an account?',
            linkLogin: 'Login here',
            optSelectCountry: 'Select country',
            uploadLabel: 'Upload',
            lblRegNumber: 'Professional Reg. Number',
            googleIntro: 'Log in with your Google account to get started.'
        }
    };

    document.getElementById('langToggle').addEventListener('click', () => {
        currentLang = currentLang === 'pt' ? 'en' : 'pt';
        applyTranslations();
    });

    const applyTranslations = () => {
        const t = translations[currentLang];
        for (const [key, value] of Object.entries(t)) {
            const el = document.getElementById(key);
            if (el) el.innerText = value;
        }
    };

    // Form Submit
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const errorMsg = document.getElementById('errorMsg');
        errorMsg.classList.add('d-none');

        // Collect Multi-select values
        const selectedLangs = Array.from(document.querySelectorAll('#langChips .chip.active')).map(c => c.dataset.value);
        const selectedSpecialties = Array.from(document.querySelectorAll('#specialtyChips .chip.active')).map(c => c.dataset.value);

        if (selectedLangs.length === 0) {
            errorMsg.innerText = currentLang === 'pt' ? "Selecione pelo menos um idioma." : "Select at least one language.";
            errorMsg.classList.remove('d-none');
            return;
        }

        // Create therapist object
        const newTherapist = {
            uid: firebaseUID,
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            country: document.getElementById('country').value,
            city: document.getElementById('city').value,
            regNumber: document.getElementById('regNumber').value,
            languages: selectedLangs,
            specialties: selectedSpecialties,
            bio: {
                pt: document.getElementById('bioPt').value,
                en: document.getElementById('bioEn').value
            },
            availability: {
                online: document.getElementById('onlineAvailable').checked,
                presential: document.getElementById('presentialAvailable').checked
            },
            sessionPrice: document.getElementById('sessionPrice').value,
            currency: document.getElementById('currency').value,
            photoURL: imagePreview.classList.contains('d-none') ? null : imagePreview.src,
            initials: getInitials(document.getElementById('fullName').value),
            createdAt: new Date().toISOString(),
            provider: 'google.com'
        };

        const finishSignup = () => {
            alert(currentLang === 'pt' ? 'Cadastro realizado com sucesso!' : 'Registration successful!');
            window.location.href = 'login.html';
        };

        const saveToFirestore = async () => {
            try {
                const { db, doc, setDoc } = window.zimyFirebase || {};

                errorMsg.innerText = currentLang === 'pt' ? "Salvando perfil..." : "Saving profile...";
                errorMsg.classList.remove('d-none', 'text-danger');
                errorMsg.classList.add('text-info');

                const therapistRef = doc(db, "therapists", firebaseUID);
                await setDoc(therapistRef, newTherapist);

                finishSignup();
            } catch (error) {
                console.error("Error during registration: ", error);
                errorMsg.classList.remove('text-info', 'd-none');
                errorMsg.classList.add('text-danger');
                errorMsg.innerText = currentLang === 'pt' ? "Erro ao salvar no banco de dados." : "Error saving to database.";
            }
        };

        if (firebaseUID) {
            saveToFirestore();
        } else {
            errorMsg.innerText = currentLang === 'pt' ? "Por favor, autentique-se primeiro." : "Please authenticate first.";
            errorMsg.classList.remove('d-none');
        }
    });
});

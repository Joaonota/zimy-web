/**
 * Therapist Registration Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const dot1 = document.getElementById('dot1');
    const dot2 = document.getElementById('dot2');
    const btnNext = document.getElementById('btnNext');
    const btnBack = document.getElementById('btnBack');

    // photo upload
    const photoInput = document.getElementById('photoInput');
    const imagePreview = document.getElementById('imagePreview');
    const cameraIcon = document.getElementById('cameraIcon');

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

    // Photo Preview
    photoInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('d-none');
                cameraIcon.classList.add('d-none');
                // Remove initials if photo is uploaded
                const initialsOverlay = document.getElementById('initialsOverlay');
                if (initialsOverlay) initialsOverlay.remove();
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Helper to get initials
    const getInitials = (name) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // Update initials on name input
    const fullNameInput = document.getElementById('fullName');
    fullNameInput.addEventListener('input', () => {
        if (photoInput.files.length === 0) {
            updateInitialsPreview(fullNameInput.value);
        }
    });

    const updateInitialsPreview = (name) => {
        const initials = getInitials(name);
        const container = document.querySelector('.profile-preview');
        let overlay = document.getElementById('initialsOverlay');

        if (!initials) {
            if (overlay) overlay.remove();
            cameraIcon.classList.remove('d-none');
            imagePreview.classList.add('d-none');
            return;
        }

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'initialsOverlay';
            overlay.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:var(--glass-bg); color:var(--neon-blue); font-size:2rem; font-weight:bold; border-radius:50%; border:2px solid var(--neon-blue);";
            container.appendChild(overlay);
        }

        overlay.innerText = initials;
        cameraIcon.classList.add('d-none');
        imagePreview.classList.add('d-none');
    };

    // Navigation
    btnNext.addEventListener('click', () => {
        // Simple validation for step 1
        const requiredFields = step1.querySelectorAll('[required]');
        let valid = true;
        requiredFields.forEach(field => {
            if (!field.value) {
                field.classList.add('is-invalid');
                valid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) {
            alert(currentLang === 'pt' ? 'Senhas não coincidem' : 'Passwords do not match');
            valid = false;
        }

        if (valid) {
            step1.classList.remove('active');
            step2.classList.add('active');
            dot2.classList.add('active');
        }
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
            lblFullName: 'Nome Completo',
            lblEmail: 'Email Profissional',
            lblPhone: 'Telefone',
            lblCountry: 'País',
            lblCity: 'Cidade',
            lblPassword: 'Senha',
            lblConfirmPassword: 'Confirmar Senha',
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
            lblRegNumber: 'Nº de Registro Profissional'
        },
        en: {
            titleMain: 'Create your Account',
            subtitleMain: 'Start tracking your patients globally.',
            lblFullName: 'Full Name',
            lblEmail: 'Professional Email',
            lblPhone: 'Phone',
            lblCountry: 'Country',
            lblCity: 'City',
            lblPassword: 'Password',
            lblConfirmPassword: 'Confirm Password',
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
            lblRegNumber: 'Professional Reg. Number'
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
            name: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            country: document.getElementById('country').value,
            city: document.getElementById('city').value,
            regNumber: document.getElementById('regNumber').value,
            password: document.getElementById('password').value,
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
            createdAt: new Date().toISOString()
        };

        const finishSignup = () => {
            alert(currentLang === 'pt' ? 'Cadastro realizado com sucesso!' : 'Registration successful!');
            window.location.href = 'login.html';
        };

        // SAVE TO FIRESTORE
        const { db, doc, setDoc, getDoc } = window.zimyFirebase || {};
        if (!db) {
            errorMsg.innerText = currentLang === 'pt' ? "Erro: Configuração do Firebase não encontrada." : "Error: Firebase configuration not found.";
            errorMsg.classList.remove('d-none');
            return;
        }

        const saveToFirestore = async () => {
            try {
                const { auth, db, doc, setDoc, getDoc } = window.zimyFirebase || {};

                // 1. SIGN UP WITH FIREBASE AUTH
                errorMsg.innerText = currentLang === 'pt' ? "Criando conta..." : "Creating account...";
                errorMsg.classList.remove('d-none', 'text-danger');
                errorMsg.classList.add('text-info');

                const authData = await auth.signUp(newTherapist.email, newTherapist.password);
                const uid = authData.localId;

                // 2. PREPARE PROFILE DATA (Remove password for security)
                const { password: _, ...profileData } = newTherapist;
                profileData.uid = uid;

                // 3. SAVE TO FIRESTORE USING UID
                const therapistRef = doc(db, "therapists", uid);
                await setDoc(therapistRef, profileData);

                finishSignup();
            } catch (error) {
                console.error("Error during registration: ", error);
                errorMsg.classList.remove('text-info', 'd-none');
                errorMsg.classList.add('text-danger');

                let message = currentLang === 'pt' ? "Erro ao realizar cadastro." : "Error during registration.";
                if (error.message === "EMAIL_EXISTS") {
                    message = currentLang === 'pt' ? "Este email já está cadastrado." : "Email already in use.";
                } else if (error.message.includes("WEAK_PASSWORD")) {
                    message = currentLang === 'pt' ? "A senha deve ter pelo menos 6 caracteres." : "Password should be at least 6 characters.";
                } else if (error.message === "INVALID_EMAIL") {
                    message = currentLang === 'pt' ? "Email inválido." : "Invalid email.";
                }

                errorMsg.innerText = message;
            }
        };

        saveToFirestore();
    });
});

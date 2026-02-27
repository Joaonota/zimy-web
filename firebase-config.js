// Firebase Configuration (REST API - Pure JS / No SDK / file:// compatible)
const firebaseConfig = {
    apiKey: "AIzaSyDn77IiC0O0wXuqVSgThRY_uWG3Y1D6Gxc",
    projectId: "bazataxi-2a9fb",
    googleClientId: "46519926937-avbmuhuavge9bi8euhqnd75sr6m1glom.apps.googleusercontent.com"
};

// Simple Firestore REST Client
const firestoreRest = {
    baseUrl: `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`,

    // Map JS Object to Firestore REST Format (simple version)
    _toRest: (obj) => {
        const fields = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') fields[key] = { stringValue: value };
            else if (typeof value === 'boolean') fields[key] = { booleanValue: value };
            else if (typeof value === 'number') fields[key] = { doubleValue: value };
            else if (Array.isArray(value)) fields[key] = { arrayValue: { values: value.map(v => ({ stringValue: v })) } };
            else if (typeof value === 'object' && value !== null) fields[key] = { mapValue: firestoreRest._toRest(value) };
        }
        return { fields };
    },

    // Map Firestore REST Format to JS Object
    _fromRest: (doc) => {
        if (!doc || !doc.fields) return null;
        const res = {};
        for (const [key, val] of Object.entries(doc.fields)) {
            if ('stringValue' in val) res[key] = val.stringValue;
            else if ('booleanValue' in val) res[key] = val.booleanValue;
            else if ('doubleValue' in val) res[key] = val.doubleValue;
            else if ('integerValue' in val) res[key] = parseInt(val.integerValue);
            else if ('arrayValue' in val) res[key] = (val.arrayValue.values || []).map(v => v.stringValue);
            else if ('mapValue' in val) res[key] = firestoreRest._fromRest({ fields: val.mapValue.fields });
        }
        return res;
    },

    setDoc: async (collection, docId, data) => {
        const url = `${firestoreRest.baseUrl}/${collection}/${docId}?key=${firebaseConfig.apiKey}`;
        const body = firestoreRest._toRest(data);
        const response = await fetch(url, {
            method: 'PATCH', // PATCH with document ID performs an upsert
            body: JSON.stringify(body)
        });
        return response.ok;
    },

    getDoc: async (collection, docId) => {
        const url = `${firestoreRest.baseUrl}/${collection}/${docId}?key=${firebaseConfig.apiKey}`;
        const response = await fetch(url);
        if (response.status === 404) return { exists: false };
        const data = await response.json();
        return { exists: true, data: () => firestoreRest._fromRest(data) };
    }
};

// Simple Firebase Auth REST Client
const authRest = {
    baseUrl: "https://identitytoolkit.googleapis.com/v1/accounts",

    // Exchange Google ID Token for Firebase UID
    signInWithGoogle: async (idToken) => {
        const url = `${authRest.baseUrl}:signInWithIdp?key=${firebaseConfig.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                postBody: `id_token=${idToken}&providerId=google.com`,
                requestUri: window.location.origin,
                returnIdpCredential: true,
                returnSecureToken: true
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);
        return data; // contains localId (UID), email, displayName, etc.
    },

    // Legacy email/password (optional, keep for compatibility)
    signUp: async (email, password) => {
        const url = `${authRest.baseUrl}:signUp?key=${firebaseConfig.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ email, password, returnSecureToken: true })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);
        return data;
    },

    signIn: async (email, password) => {
        const url = `${authRest.baseUrl}:signInWithPassword?key=${firebaseConfig.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ email, password, returnSecureToken: true })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);
        return data;
    }
};

// Global reference
window.zimyFirebase = {
    db: true, // flag
    config: firebaseConfig,
    doc: (db, coll, id) => ({ coll, id }),
    getDoc: (ref) => firestoreRest.getDoc(ref.coll, ref.id),
    setDoc: (ref, data) => firestoreRest.setDoc(ref.coll, ref.id, data),
    auth: authRest
};

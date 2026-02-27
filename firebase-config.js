// Firebase Configuration (REST API - Pure JS / No SDK / file:// compatible)
const firebaseConfig = {
    apiKey: "AIzaSyDn77IiC0O0wXuqVSgThRY_uWG3Y1D6Gxc",
    projectId: "bazataxi-2a9fb"
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
        if (!doc || !doc.fields) return {};
        const res = {};
        for (const [key, val] of Object.entries(doc.fields)) {
            if ('stringValue' in val) res[key] = val.stringValue;
            else if ('booleanValue' in val) res[key] = val.booleanValue;
            else if ('doubleValue' in val) res[key] = val.doubleValue;
            else if ('integerValue' in val) res[key] = parseInt(val.integerValue);
            else if ('timestampValue' in val) res[key] = val.timestampValue;
            else if ('arrayValue' in val) res[key] = (val.arrayValue.values || []).map(v => v.stringValue || v.integerValue || v.doubleValue || v.booleanValue || v);
            else if ('mapValue' in val) res[key] = firestoreRest._fromRest({ fields: val.mapValue.fields });
        }
        return res;
    },

    setDoc: async (collection, docId, data, merge = false) => {
        let url = `${firestoreRest.baseUrl}/${collection}/${docId}?key=${firebaseConfig.apiKey}`;

        if (merge) {
            // Firestore REST PATCH requires updateMask.fieldPaths for partial updates
            Object.keys(data).forEach(key => {
                url += `&updateMask.fieldPaths=${key}`;
            });
        }

        const body = firestoreRest._toRest(data);

        const response = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("[setDoc] Error:", err);
        }
        return response.ok;
    },

    getDoc: async (collection, docId) => {
        const url = `${firestoreRest.baseUrl}/${collection}/${docId}?key=${firebaseConfig.apiKey}`;
        const response = await fetch(url);
        if (response.status === 404) return { exists: false };
        const data = await response.json();
        return { exists: true, data: () => firestoreRest._fromRest(data), id: docId };
    },

    getDocs: async (collection) => {
        const url = `${firestoreRest.baseUrl}/${collection}?key=${firebaseConfig.apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!data.documents) return [];
        return data.documents.map(doc => ({
            id: doc.name.split('/').pop(),
            data: () => firestoreRest._fromRest(doc)
        }));
    },

    runQuery: async (collection, filters = []) => {
        const url = `${firestoreRest.baseUrl}:runQuery?key=${firebaseConfig.apiKey}`;

        let filter = undefined;
        if (filters.length === 1) {
            filter = {
                fieldFilter: {
                    field: { fieldPath: filters[0].field },
                    op: filters[0].op,
                    value: firestoreRest._toRest({ val: filters[0].value }).fields.val
                }
            };
        } else if (filters.length > 1) {
            filter = {
                compositeFilter: {
                    op: "AND",
                    filters: filters.map(f => ({
                        fieldFilter: {
                            field: { fieldPath: f.field },
                            op: f.op,
                            value: firestoreRest._toRest({ val: f.value }).fields.val
                        }
                    }))
                }
            };
        }

        const body = {
            structuredQuery: {
                from: [{ collectionId: collection }],
                where: filter
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body)
        });
        const data = await response.json();

        if (!response.ok) {
            console.error(`Firestore Query Error [${collection}]:`, data);
            return [];
        }

        return (data || []).filter(item => item.document).map(item => ({
            id: item.document.name.split('/').pop(),
            data: () => firestoreRest._fromRest(item.document)
        }));
    }
};

// Simple Firebase Auth REST Client
const authRest = {
    baseUrl: "https://identitytoolkit.googleapis.com/v1/accounts",

    // Sign up with Email and Password
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
    },

    sendPasswordReset: async (email) => {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseConfig.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ requestType: "PASSWORD_RESET", email })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);
        return data;
    }
};

// Global reference
window.zimyFirebase = {
    db: true,
    config: firebaseConfig,
    collection: (db, coll) => coll,
    doc: (db, coll, id) => ({ coll, id }),
    getDoc: (arg1, arg2) => {
        if (typeof arg1 === 'string') return firestoreRest.getDoc(arg1, arg2);
        return firestoreRest.getDoc(arg1.coll, arg1.id);
    },
    getDocs: (coll) => firestoreRest.getDocs(coll),
    setDoc: (arg1, arg2, arg3, arg4) => {
        // Handle setDoc(ref, data, merge)
        if (typeof arg1 === 'object' && arg1.coll) {
            return firestoreRest.setDoc(arg1.coll, arg1.id, arg2, arg3); // arg3 is merge
        }
        // Handle setDoc(coll, id, data, merge)
        return firestoreRest.setDoc(arg1, arg2, arg3, arg4);
    },
    query: firestoreRest.runQuery,
    auth: authRest
};

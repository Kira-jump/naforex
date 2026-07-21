const STORAGE_KEY = 'naforex_biometric';

export const isBiometricSupported = () => {
  return window.PublicKeyCredential !== undefined;
};

export const isBiometricEnabled = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return !!saved;
};

export const getBiometricUser = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

const bufferToBase64 = (buffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

const base64ToBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

export const registerBiometric = async (user) => {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'NaforeX' },
        user: {
          id: userId,
          name: user.username,
          displayName: user.username,
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
      },
    });

    if (!credential) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      userId: user.id,
      username: user.username,
      credentialId: bufferToBase64(credential.rawId),
    }));

    return true;
  } catch (e) {
    console.error('Erreur activation biométrie:', e);
    return false;
  }
};

export const verifyBiometric = async () => {
  const saved = getBiometricUser();
  if (!saved) return null;

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{
          id: base64ToBuffer(saved.credentialId),
          type: 'public-key',
        }],
        userVerification: 'required',
        timeout: 60000,
      },
    });

    if (assertion) return saved;
    return null;
  } catch (e) {
    console.error('Erreur vérification biométrie:', e);
    return null;
  }
};

export const disableBiometric = () => {
  localStorage.removeItem(STORAGE_KEY);
};

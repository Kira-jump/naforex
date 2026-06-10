const CLIENT_ID = '463898797761-tjbqdv1bkd556osh5gfpjhe814k37n22.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file'\;
const FILE_NAME = 'naforex_data.json';
const TOKEN_DURATION = 55 * 60 * 1000;

let tokenClient = null;
let accessToken = null;
let tokenExpiry = null;

export const initGoogleDrive = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client'\;
    script.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            accessToken = response.access_token;
            tokenExpiry = Date.now() + TOKEN_DURATION;
            localStorage.setItem('naforex_drive_token', accessToken);
            localStorage.setItem('naforex_drive_expiry', tokenExpiry.toString());
          }
        },
      });
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

export const signInDrive = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) { reject('Drive not initialized'); return; }
    tokenClient.callback = (response) => {
      if (response.access_token) {
        accessToken = response.access_token;
        tokenExpiry = Date.now() + TOKEN_DURATION;
        localStorage.setItem('naforex_drive_token', accessToken);
        localStorage.setItem('naforex_drive_expiry', tokenExpiry.toString());
        resolve(accessToken);
      } else {
        reject('No token');
      }
    };
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

const refreshToken = () => {
  return new Promise((resolve) => {
    if (!tokenClient) { resolve(false); return; }
    tokenClient.callback = (response) => {
      if (response.access_token) {
        accessToken = response.access_token;
        tokenExpiry = Date.now() + TOKEN_DURATION;
        localStorage.setItem('naforex_drive_token', accessToken);
        localStorage.setItem('naforex_drive_expiry', tokenExpiry.toString());
        resolve(true);
      } else {
        resolve(false);
      }
    };
    tokenClient.requestAccessToken({ prompt: '' });
  });
};

const ensureValidToken = async () => {
  const storedExpiry = localStorage.getItem('naforex_drive_expiry');
  if (storedExpiry) tokenExpiry = parseInt(storedExpiry);
  if (!accessToken) {
    const stored = localStorage.getItem('naforex_drive_token');
    if (stored) accessToken = stored;
  }
  if (!accessToken) return false;
  if (!tokenExpiry || Date.now() > tokenExpiry) {
    const refreshed = await refreshToken();
    if (!refreshed) {
      accessToken = null;
      localStorage.removeItem('naforex_drive_token');
      localStorage.removeItem('naforex_drive_expiry');
      return false;
    }
  }
  return true;
};

export const isSignedIn = () => {
  const token = localStorage.getItem('naforex_drive_token');
  const expiry = localStorage.getItem('naforex_drive_expiry');
  if (token) {
    accessToken = token;
    tokenExpiry = expiry ? parseInt(expiry) : null;
    return true;
  }
  return false;
};

export const signOutDrive = () => {
  accessToken = null;
  tokenExpiry = null;
  localStorage.removeItem('naforex_drive_token');
  localStorage.removeItem('naforex_drive_expiry');
  localStorage.removeItem('naforex_drive_file_id');
};

const getHeaders = () => ({
  Authorization: 'Bearer ' + accessToken,
  'Content-Type': 'application/json',
});

export const findOrCreateFile = async () => {
  const fileId = localStorage.getItem('naforex_drive_file_id');
  if (fileId) return fileId;
  try {
    const search = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=name='" + FILE_NAME + "'+and+trashed=false&fields=files(id,name)",
      { headers: getHeaders() }
    );
    if (!search.ok) return null;
    const result = await search.json();
    if (result.files && result.files.length > 0) {
      const id = result.files[0].id;
      localStorage.setItem('naforex_drive_file_id', id);
      return id;
    }
    const create = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: FILE_NAME, mimeType: 'application/json' }),
      }
    );
    if (!create.ok) return null;
    const file = await create.json();
    localStorage.setItem('naforex_drive_file_id', file.id);
    return file.id;
  } catch (e) {
    console.error('findOrCreateFile error:', e);
    return null;
  }
};

export const saveDataToDrive = async (data) => {
  try {
    const valid = await ensureValidToken();
    if (!valid) return false;
    const fileId = await findOrCreateFile();
    if (!fileId) return false;
    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media',
      {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (res.status === 401) {
      const refreshed = await refreshToken();
      if (!refreshed) return false;
      await fetch(
        'https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media',
        {
          method: 'PATCH',
          headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
    }
    return true;
  } catch (e) {
    console.error('Drive save error:', e);
    return false;
  }
};

export const loadDataFromDrive = async () => {
  try {
    const valid = await ensureValidToken();
    if (!valid) return null;
    const fileId = await findOrCreateFile();
    if (!fileId) return null;
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media',
      { headers: getHeaders() }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Drive load error:', e);
    return null;
  }
};

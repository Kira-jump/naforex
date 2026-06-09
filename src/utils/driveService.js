const CLIENT_ID = '463898797761-tjbqdv1bkd556osh5gfpjhe814k37n22.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file'\;
const FILE_NAME = 'naforex_data.json';

let tokenClient = null;
let accessToken = null;

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
            localStorage.setItem('naforex_drive_token', accessToken);
          }
        },
      });
      resolve(true);
    };
    document.head.appendChild(script);
  });
};

export const signInDrive = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) { reject('Drive not initialized'); return; }
    tokenClient.callback = (response) => {
      if (response.access_token) {
        accessToken = response.access_token;
        localStorage.setItem('naforex_drive_token', accessToken);
        resolve(accessToken);
      } else {
        reject('No token');
      }
    };
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

export const isSignedIn = () => {
  const token = localStorage.getItem('naforex_drive_token');
  if (token) { accessToken = token; return true; }
  return false;
};

export const signOutDrive = () => {
  accessToken = null;
  localStorage.removeItem('naforex_drive_token');
  localStorage.removeItem('naforex_drive_file_id');
};

const getHeaders = () => ({
  Authorization: 'Bearer ' + accessToken,
  'Content-Type': 'application/json',
});

export const findOrCreateFile = async () => {
  const fileId = localStorage.getItem('naforex_drive_file_id');
  if (fileId) return fileId;

  const search = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=name='" + FILE_NAME + "'+and+trashed=false&fields=files(id,name)",
    { headers: getHeaders() }
  );
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
  const file = await create.json();
  localStorage.setItem('naforex_drive_file_id', file.id);
  return file.id;
};

export const saveDataToDrive = async (data) => {
  if (!accessToken) return false;
  try {
    const fileId = await findOrCreateFile();
    await fetch(
      'https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media',
      {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    return true;
  } catch (e) {
    console.error('Drive save error:', e);
    return false;
  }
};

export const loadDataFromDrive = async () => {
  if (!accessToken) return null;
  try {
    const fileId = await findOrCreateFile();
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

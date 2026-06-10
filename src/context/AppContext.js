import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initGoogleDrive, signInDrive, signOutDrive,
  isSignedIn, saveDataToDrive, loadDataFromDrive,
  saveAuthToDrive, loadAuthFromDrive
} from '../utils/driveService';
import {
  requestNotificationPermission,
  checkBrowserNotifications,
  scheduleEmailAt1230
} from '../utils/notificationService';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

const STORAGE_KEY = 'naforex_data';
const AUTH_KEY = 'naforex_auth';
const SESSION_KEY = 'naforex_session';

const defaultData = { comptes: [], clients: [], resetBase: [] };

export const AppProvider = ({ children }) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveSyncing, setDriveSyncing] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initGoogleDrive();

      let authData = null;
      let appData = null;

      if (isSignedIn()) {
        setDriveConnected(true);
        authData = await loadAuthFromDrive();
        if (authData) {
          localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        }
        appData = await loadDataFromDrive();
        if (appData) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        }
      }

      if (!authData) {
        const saved = localStorage.getItem(AUTH_KEY);
        if (saved) authData = JSON.parse(saved);
      }

      if (!appData) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) appData = JSON.parse(saved);
      }

      if (authData) {
        setUsers(authData.users || []);
        setIsConfigured(authData.configured || false);
      }

      if (appData) {
        setData(appData);
        await requestNotificationPermission();
        checkBrowserNotifications(appData);
        scheduleEmailAt1230(appData);
      }

      const session = sessionStorage.getItem(SESSION_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        setIsLoggedIn(true);
        setCurrentUser(parsed.user);
      }

      setLoading(false);
    };
    init();
  }, []);

  const saveData = async (newData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    if (driveConnected) {
      setDriveSyncing(true);
      await saveDataToDrive(newData);
      setDriveSyncing(false);
    }
  };

  const saveAuth = async (authData) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    if (driveConnected) {
      await saveAuthToDrive(authData);
    }
  };

  const connectDrive = async () => {
    try {
      await signInDrive();
      setDriveConnected(true);
      setDriveSyncing(true);
      const auth = localStorage.getItem(AUTH_KEY);
      if (auth) await saveAuthToDrive(JSON.parse(auth));
      await saveDataToDrive(data);
      setDriveSyncing(false);
      return true;
    } catch (e) {
      console.error('Drive connect error:', e);
      return false;
    }
  };

  const disconnectDrive = () => {
    signOutDrive();
    setDriveConnected(false);
  };

  const syncFromDrive = async () => {
    if (!driveConnected) return;
    setDriveSyncing(true);
    const authData = await loadAuthFromDrive();
    if (authData) {
      setUsers(authData.users || []);
      setIsConfigured(authData.configured || false);
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    }
    const driveData = await loadDataFromDrive();
    if (driveData) {
      setData(driveData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(driveData));
    }
    setDriveSyncing(false);
  };

  const setupUsers = async (user1, user2) => {
    const newUsers = [
      { id: 1, username: user1.username, password: user1.password },
      { id: 2, username: user2.username, password: user2.password },
    ];
    const authData = { users: newUsers, configured: true };
    setUsers(newUsers);
    setIsConfigured(true);
    await saveAuth(authData);
  };

  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const updateUser = async (id, newUsername, newPassword) => {
    const updated = users.map(u => u.id === id ? { ...u, username: newUsername, password: newPassword } : u);
    setUsers(updated);
    const authData = { users: updated, configured: true };
    await saveAuth(authData);
    if (currentUser?.id === id) {
      const updatedUser = { ...currentUser, username: newUsername, password: newPassword };
      setCurrentUser(updatedUser);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: updatedUser }));
    }
  };

  const addCompte = (compte) => {
    const newCompte = { ...compte, id: Date.now().toString() };
    saveData({ ...data, comptes: [...data.comptes, newCompte] });
  };

  const updateCompte = (id, updates) => {
    saveData({ ...data, comptes: data.comptes.map(c => c.id === id ? { ...c, ...updates } : c) });
  };

  const deleteCompte = (id) => {
    saveData({ ...data, comptes: data.comptes.filter(c => c.id !== id) });
  };

  const addClient = (client) => {
    const newClient = { ...client, id: Date.now().toString() };
    saveData({ ...data, clients: [...data.clients, newClient] });
  };

  const updateClient = (id, updates) => {
    saveData({ ...data, clients: data.clients.map(c => c.id === id ? { ...c, ...updates } : c) });
  };

  const transfererClient = (clientId, serviceIndex, newCompteId) => {
    const updated = data.clients.map(c => {
      if (c.id !== clientId) return c;
      const newServices = c.services.map((s, i) =>
        i === serviceIndex ? { ...s, compteId: newCompteId } : s
      );
      return { ...c, services: newServices };
    });
    saveData({ ...data, clients: updated });
  };

  const resetClient = (clientId) => {
    const client = data.clients.find(c => c.id === clientId);
    if (!client) return;
    saveData({
      ...data,
      clients: data.clients.filter(c => c.id !== clientId),
      resetBase: [...data.resetBase, { ...client, resetDate: new Date().toISOString() }],
    });
  };

  const restoreClient = (clientId) => {
    const client = data.resetBase.find(c => c.id === clientId);
    if (!client) return;
    const { resetDate, ...restored } = client;
    saveData({
      ...data,
      clients: [...data.clients, restored],
      resetBase: data.resetBase.filter(c => c.id !== clientId),
    });
  };

  const deleteDefinitif = (clientId) => {
    saveData({ ...data, resetBase: data.resetBase.filter(c => c.id !== clientId) });
  };

  const getJoursRestants = (dateExpiration) => {
    return Math.ceil((new Date(dateExpiration) - new Date()) / (1000 * 60 * 60 * 24));
  };

  const getStatutService = (dateExpiration) => {
    const jours = getJoursRestants(dateExpiration);
    if (jours < 0) return 'rouge';
    if (jours <= 5) return 'warning';
    return 'actif';
  };

  const getStatutClient = (client) => {
    if (!client.services || client.services.length === 0) return 'actif';
    const statuts = client.services.map(s => getStatutService(s.dateExpiration));
    if (statuts.includes('rouge')) return 'rouge';
    if (statuts.includes('warning')) return 'warning';
    return 'actif';
  };

  const getStatutCompte = (compte) => {
    const jours = getJoursRestants(compte.dateReabonnement);
    if (jours < 0) return 'rouge';
    if (jours <= 5) return 'warning';
    return 'actif';
  };

  const getSeatsInfo = (compteId, service) => {
    const maxSeats = service === 'netflix' ? 5 : 6;
    const used = data.clients.filter(c =>
      c.services && c.services.some(s => s.compteId === compteId)
    ).length;
    return { used, max: maxSeats, available: maxSeats - used };
  };

  return (
    <AppContext.Provider value={{
      isConfigured, isLoggedIn, currentUser, users,
      data, loading, driveConnected, driveSyncing,
      setupUsers, login, logout, updateUser,
      connectDrive, disconnectDrive, syncFromDrive,
      addCompte, updateCompte, deleteCompte,
      addClient, updateClient, transfererClient,
      resetClient, restoreClient, deleteDefinitif,
      getJoursRestants, getStatutService, getStatutClient, getStatutCompte, getSeatsInfo,
    }}>
      {children}
    </AppContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  saveDataToFirebase, loadDataFromFirebase,
  saveAuthToFirebase, loadAuthFromFirebase,
  subscribeToData
} from '../utils/firebaseService';
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

const defaultData = { comptes: [], clients: [], resetBase: [], corbeilleComptes: [] };

export const AppProvider = ({ children }) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const isLocalUpdate = useRef(false);

  useEffect(() => {
    const init = async () => {
      setSyncing(true);
      try {
        const authData = await loadAuthFromFirebase();
        if (authData) {
          setUsers(authData.users || []);
          setIsConfigured(authData.configured || false);
          localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        } else {
          const saved = localStorage.getItem(AUTH_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            setUsers(parsed.users || []);
            setIsConfigured(parsed.configured || false);
          }
        }

        const appData = await loadDataFromFirebase();
        if (appData) {
          const merged = { ...defaultData, ...appData };
          setData(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          await requestNotificationPermission();
          checkBrowserNotifications(merged);
          scheduleEmailAt1230(merged);
        } else {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) setData({ ...defaultData, ...JSON.parse(saved) });
        }
      } catch (e) {
        console.error('Init error:', e);
        const savedAuth = localStorage.getItem(AUTH_KEY);
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          setUsers(parsed.users || []);
          setIsConfigured(parsed.configured || false);
        }
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) setData({ ...defaultData, ...JSON.parse(savedData) });
      }

      const session = sessionStorage.getItem(SESSION_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        setIsLoggedIn(true);
        setCurrentUser(parsed.user);
      }

      setSyncing(false);
      setLoading(false);
    };
    init();
  }, []);

  // Sync temps réel depuis Firebase
  useEffect(() => {
    const unsubscribe = subscribeToData((newData) => {
      if (isLocalUpdate.current) return;
      const merged = { ...defaultData, ...newData };
      setData(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    });
    return () => unsubscribe();
  }, []);

  const saveData = async (newData) => {
    isLocalUpdate.current = true;
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setSyncing(true);
    await saveDataToFirebase(newData);
    setSyncing(false);
    setTimeout(() => { isLocalUpdate.current = false; }, 1000);
  };

  const saveAuth = async (authData) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    await saveAuthToFirebase(authData);
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

  // COMPTES
  const addCompte = (compte) => {
    const newCompte = { ...compte, id: Date.now().toString() };
    saveData({ ...data, comptes: [...data.comptes, newCompte] });
  };

  const updateCompte = (id, updates) => {
    saveData({ ...data, comptes: data.comptes.map(c => c.id === id ? { ...c, ...updates } : c) });
  };

  const deleteCompte = (id) => {
    const compte = data.comptes.find(c => c.id === id);
    if (!compte) return;
    saveData({
      ...data,
      comptes: data.comptes.filter(c => c.id !== id),
      corbeilleComptes: [...(data.corbeilleComptes || []), { ...compte, deletedDate: new Date().toISOString() }],
    });
  };

  const restoreCompte = (id) => {
    const compte = (data.corbeilleComptes || []).find(c => c.id === id);
    if (!compte) return;
    const { deletedDate, ...restored } = compte;
    saveData({
      ...data,
      comptes: [...data.comptes, restored],
      corbeilleComptes: (data.corbeilleComptes || []).filter(c => c.id !== id),
    });
  };

  const deleteCompteDefinitif = (id) => {
    saveData({
      ...data,
      corbeilleComptes: (data.corbeilleComptes || []).filter(c => c.id !== id),
    });
  };

  // CLIENTS
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
      data, loading, syncing,
      setupUsers, login, logout, updateUser,
      addCompte, updateCompte, deleteCompte, restoreCompte, deleteCompteDefinitif,
      addClient, updateClient, transfererClient,
      resetClient, restoreClient, deleteDefinitif,
      getJoursRestants, getStatutService, getStatutClient, getStatutCompte, getSeatsInfo,
    }}>
      {children}
    </AppContext.Provider>
  );
};

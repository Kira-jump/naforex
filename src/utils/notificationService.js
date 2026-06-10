import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_fgrm966';
const EMAILJS_TEMPLATE_ID = 'template_cavmdjk';
const EMAILJS_PUBLIC_KEY = 'D8CVMPK8o3o27J2Uk';
const NOTIFY_EMAIL = 'naforexstream@gmail.com';
const ALERT_DAYS = 5;
const NOTIFY_HOUR = 12;
const NOTIFY_MINUTE = 30;

emailjs.init(EMAILJS_PUBLIC_KEY);

const serviceLabels = { netflix: 'Netflix', spotify: 'Spotify', prime: 'Prime' };

const getJoursRestants = (dateExpiration) => {
  return Math.ceil((new Date(dateExpiration) - new Date()) / (1000 * 60 * 60 * 24));
};

export const checkAndNotify = (data) => {
  if (!data) return;

  const alertsClients = [];
  const alertsComptes = [];

  data.clients.forEach(client => {
    if (!client.services) return;
    client.services.forEach(srv => {
      const jours = getJoursRestants(srv.dateExpiration);
      if (jours >= 0 && jours <= ALERT_DAYS) {
        alertsClients.push(
          `Client: ${client.nom} | ${serviceLabels[srv.service]} | ${jours}j restants`
        );
      } else if (jours < 0) {
        alertsClients.push(
          `Client: ${client.nom} | ${serviceLabels[srv.service]} | EXPIRÉ depuis ${Math.abs(jours)}j`
        );
      }
    });
  });

  data.comptes.forEach(compte => {
    const jours = getJoursRestants(compte.dateReabonnement);
    if (jours >= 0 && jours <= ALERT_DAYS) {
      alertsComptes.push(
        `Compte: ${compte.nom} | ${serviceLabels[compte.service]} | Réabonnement dans ${jours}j`
      );
    } else if (jours < 0) {
      alertsComptes.push(
        `Compte: ${compte.nom} | ${serviceLabels[compte.service]} | EXPIRÉ depuis ${Math.abs(jours)}j`
      );
    }
  });

  return { alertsClients, alertsComptes };
};

export const sendEmailAlert = async (data) => {
  const result = checkAndNotify(data);
  if (!result) return false;

  const { alertsClients, alertsComptes } = result;
  if (alertsClients.length === 0 && alertsComptes.length === 0) return false;

  let message = '';
  if (alertsClients.length > 0) {
    message += '🔴 CLIENTS:\n' + alertsClients.join('\n') + '\n\n';
  }
  if (alertsComptes.length > 0) {
    message += '📦 COMPTES:\n' + alertsComptes.join('\n');
  }

  const date = new Date().toLocaleDateString('fr-FR');

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      date,
      message,
      name: 'NaforeX',
      title: 'Alertes expiration',
      email: NOTIFY_EMAIL,
    });
    return true;
  } catch (e) {
    console.error('EmailJS error:', e);
    return false;
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showBrowserNotification = (title, body) => {
  if (Notification.permission !== 'granted') return;
  new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
  });
};

export const checkBrowserNotifications = (data) => {
  if (!data) return;
  const result = checkAndNotify(data);
  if (!result) return;

  const { alertsClients, alertsComptes } = result;
  const total = alertsClients.length + alertsComptes.length;

  if (total === 0) return;

  showBrowserNotification(
    'NaforeX - ' + total + ' alerte(s) !',
    alertsClients.slice(0, 3).join('\n') || alertsComptes.slice(0, 3).join('\n')
  );
};

export const scheduleEmailAt1230 = (data) => {
  const now = new Date();
  const target = new Date();
  target.setHours(NOTIFY_HOUR, NOTIFY_MINUTE, 0, 0);

  if (now > target) {
    target.setDate(target.getDate() + 1);
  }

  const delay = target - now;
  const lastSent = localStorage.getItem('naforex_last_email');
  const today = new Date().toDateString();

  if (lastSent === today) return;

  setTimeout(async () => {
    const sent = await sendEmailAlert(data);
    if (sent) {
      localStorage.setItem('naforex_last_email', today);
    }
    setInterval(async () => {
      const newToday = new Date().toDateString();
      const newLastSent = localStorage.getItem('naforex_last_email');
      if (newLastSent !== newToday) {
        const ok = await sendEmailAlert(data);
        if (ok) localStorage.setItem('naforex_last_email', newToday);
      }
    }, 24 * 60 * 60 * 1000);
  }, delay);
};

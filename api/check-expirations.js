module.exports = async function handler(req, res) {
  try {
    const firebaseUrl = 'https://firestore.googleapis.com/v1/projects/naforex-b26f3/databases/(default)/documents/naforex/data';
    const response = await fetch(firebaseUrl);
    const result = await response.json();

    const fields = result.fields;
    const clientsRaw = fields.clients?.arrayValue?.values || [];

    const serviceLabels = { netflix: 'Netflix', spotify: 'Spotify', prime: 'Prime' };
    const expiringClients = [];

    const parseClient = (clientValue) => {
      const f = clientValue.mapValue.fields;
      const nom = f.nom?.stringValue || '';
      const whatsapp = f.whatsapp?.stringValue || '';
      const services = (f.services?.arrayValue?.values || []).map(sv => {
        const sf = sv.mapValue.fields;
        return {
          service: sf.service?.stringValue,
          dateExpiration: sf.dateExpiration?.stringValue,
        };
      });
      return { nom, whatsapp, services };
    };

    const now = new Date();

    clientsRaw.forEach(cv => {
      const client = parseClient(cv);
      client.services.forEach(s => {
        if (!s.dateExpiration) return;
        const expDate = new Date(s.dateExpiration);
        const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 5) {
          expiringClients.push({
            nom: client.nom,
            whatsapp: client.whatsapp,
            service: serviceLabels[s.service] || s.service,
            jours: diffDays,
          });
        }
      });
    });

    if (expiringClients.length === 0) {
      return res.status(200).json({ message: 'Aucune expiration proche', count: 0 });
    }

    const listHtml = expiringClients
      .sort((a, b) => a.jours - b.jours)
      .map(c => {
        const statut = c.jours < 0 ? `Expiré depuis ${Math.abs(c.jours)}j` : `${c.jours}j restants`;
        return `${c.nom} (${c.service}) - ${statut} - ${c.whatsapp || 'pas de numéro'}`;
      })
      .join('\n');

    const emailBody = `Rapport quotidien NaforeX\n\n${expiringClients.length} abonnement(s) à surveiller :\n\n${listHtml}`;

    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_fgrm966',
        template_id: 'template_cavmdjk',
        user_id: 'D8CVMPK8o3o27J2Uk',
        template_params: {
          message: emailBody,
          to_email: 'naforexstream@gmail.com',
        },
      }),
    });

    return res.status(200).json({ message: 'Email envoyé', count: expiringClients.length });
  } catch (error) {
    console.error('Erreur cron:', error);
    return res.status(500).json({ error: error.message });
  }
};

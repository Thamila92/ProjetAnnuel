import express, { Request, Response } from 'express';
import { EmailService } from '../../services/EmailService';
 
export const initEmailRoutes = (app: express.Express) => {
  const emailService = new EmailService();

  // Route pour envoyer un e-mail
  app.post('/send-email', async (req: Request, res: Response) => {
    const { to, subject, text, html } = req.body;

    try {
      await emailService.sendEmail({ to, subject, text, html });
      res.status(200).json({ message: 'E-mail envoyé avec succès.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'e-mail.' });
    }
  });
};

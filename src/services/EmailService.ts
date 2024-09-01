import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  private transporter;

  constructor() {
    // Initialiser le transporteur avec Nodemailer et les paramètres SMTP
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Utilisation de Gmail pour l'envoi d'e-mails
      auth: {
        user: 'pacompanion8@gmail.com', // Remplace par ton adresse email Gmail
        pass: 'doxna1-zisriv-Mowjiw', // Remplace par ton mot de passe Gmail ou un mot de passe d'application
      },
    });
  }

  // Fonction d'envoi d'e-mail
  async sendEmail(params: SendEmailParams): Promise<void> {
    const { to, subject, text, html } = params;

    const mailOptions = {
      from: 'pacomapnion@gmail.com', // Adresse e-mail de l'expéditeur
      to,
      subject,
      text,
      html, // Optionnel : Pour un contenu HTML dans l'email
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`E-mail envoyé à ${to}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
      throw new Error('Erreur lors de l\'envoi de l\'e-mail');
    }
  }
}

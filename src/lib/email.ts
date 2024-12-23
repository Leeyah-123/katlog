import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface Transaction {
  signature: string;
  from: string;
  to: string;
  action: string;
  timestamp: number;
}

export async function sendEmail(userId: string, transaction: Transaction) {
  // In a real application, you would fetch the user's email address from your database
  const userEmail = `${userId}@example.com`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: 'Watchlist Account Transaction Alert',
    html: `
      <h1>Transaction Alert</h1>
      <p>A transaction involving an account on your watchlist has occurred:</p>
      <ul>
        <li>From: ${transaction.from}</li>
        <li>To: ${transaction.to}</li>
        <li>Action: ${transaction.action}</li>
        <li>Timestamp: ${new Date(transaction.timestamp).toLocaleString()}</li>
        <li>Signature: ${transaction.signature}</li>
      </ul>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

import User from '@/models/User';
import { AccountAction } from '@/types';
import { SeaMailerClient } from 'seamailer-nodejs';
import dbConnect from './mongodb';

const SeaMailer = new SeaMailerClient(process.env.SEAMAILER_API_KEY!);

export async function sendEmail(userId: string, transaction: AccountAction) {
  await dbConnect();

  const user = await User.findOne({ id: userId });
  try {
    await SeaMailer.sendMail({
      from: {
        email: process.env.EMAIL_FROM!,
        name: 'Katlog',
      },
      to: [
        {
          email: user.email,
        },
      ],
      subject: 'Watchlist Account Transaction Alert',
      htmlPart: `
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
    });
    console.log(`Email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

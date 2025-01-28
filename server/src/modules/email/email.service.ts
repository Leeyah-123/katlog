import * as nodemailer from 'nodemailer';
import { config } from '../../config';
import { AccountAction } from '../../core/types';
import { AppError } from '../../middlewares';
import logger from '../../utils/logger';

export class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.secure,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.password,
      },
    });
  }

  async sendTransactionAlert({
    email,
    account,
    accountLabel,
    transaction,
  }: {
    email: string;
    account: string;
    accountLabel: string;
    transaction: AccountAction;
  }) {
    try {
      await this.transporter.sendMail({
        from: `Katlog <${config.email.from}>`,
        to: email,
        subject: `${transaction.network} Transaction Alert for '${accountLabel}'`,
        html: this.emailTemplate(accountLabel, account, transaction),
      });

      logger.info(`Transaction alert sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send email notification:', error);
      throw new AppError(500, 'Failed to send email notification');
    }
  }

  private readonly emailTemplate = (
    accountLabel: string,
    account: string,
    transaction: AccountAction
  ) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background: #ffffff;
          padding: 20px;
          border-radius: 0 0 10px 10px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .transaction-details {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .detail-label {
          color: #64748b;
          font-weight: 500;
        }
        .detail-value {
          color: #334155;
          font-weight: 600;
          margin-left: 3px;
        }
        .highlight {
          color: #4f46e5;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Transaction Alert</h1>
      </div>
      <div class="content">
        <p>A transaction involving <a class="highlight" href="https://katlog.vercel.app/account/${account}">${accountLabel}</a> has been detected:</p>
        
        <div class="transaction-details">
          <div class="detail-row">
            <span class="detail-label">Signature:</span>
            <span class="detail-value">${transaction.signature}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">From:</span>
            <span class="detail-value">${transaction.from}${
    transaction.from === account ? ` (${accountLabel})` : ''
  }</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">To:</span>
            <span class="detail-value">${transaction.to}${
    transaction.to === account ? ` (${accountLabel})` : ''
  }</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount:</span>
            <span class="detail-value">${transaction.amount} SOL</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Action:</span>
            <span class="detail-value">${transaction.action}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Network:</span>
            <span class="detail-value">${transaction.network}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Timestamp:</span>
            <span class="detail-value">${transaction.timestamp}</span>
          </div>
        </div>
        
        <p>View more details about this transaction on <a href="https://solscan.io/tx/${
          transaction.signature
        }?cluster=devnet" style="color: #4f46e5;">Solscan</a></p>
      </div>
    </body>
    </html>
  `;
}

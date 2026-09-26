import nodemailer from 'nodemailer';
import { GMAIL_APP_PASSWORD, GMAIL_USER } from '../config/env';

const transporter = GMAIL_USER && GMAIL_APP_PASSWORD
	? nodemailer.createTransport({
		service: 'gmail',
		auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
	})
	: null;

const escapeHtml = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const sendNotificationEmail = async (
	to: string,
	title: string,
	message: string
) => {
	if (!transporter || !to) return;

	await transporter.sendMail({
		from: GMAIL_USER,
		to,
		subject: title,
		text: message,
		html: `<h2>${escapeHtml(title)}</h2><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
	});
};
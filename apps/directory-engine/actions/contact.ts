'use server';

import { CONTACT_EMAIL } from '@/lib/constants';
import { ActionsResponse } from '@/lib/types';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function handleContactForm({
  name,
  email,
  message,
  site,
}: {
  name: string;
  email: string;
  message: string;
  site: string;
}): Promise<ActionsResponse<string>> {
  try {
    const isValidSubmission = [name, email, message].every(
      (field) =>
        field && typeof field === 'string' && field.trim().length < 4000
    );

    if (!isValidSubmission) {
      return {
        ok: false,
        error: 'Invalid input. Please check your entries and try again.',
      };
    }

    // TODO: update with your desired recipient email
    const { data } = await resend.emails.send({
      from: 'Contact Form <contact@10xdev.io>',
      to: CONTACT_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission on ${site}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (data) {
      return {
        ok: true,
        data: 'Message sent successfully',
      };
    }

    return {
      ok: false,
      error: 'Failed to send message. Please try again later.',
    };
  } catch (error) {
    console.error('Error sending contact form message:', error);
    return {
      ok: false,
      error: 'Failed to send message. Please try again later.',
    };
  }
}

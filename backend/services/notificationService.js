import webPush from 'web-push';
import nodemailer from 'nodemailer';
import { PushSubscription } from '../models/Notification.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

// Setup VAPID keys if provided
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    webPush.setVapidDetails(
      `mailto:${process.env.VAPID_EMAIL || 'admin@productivityapp.local'}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (err) {
    console.warn('WebPush VAPID config notice:', err.message);
  }
}

/**
 * Send motivational / schedule push notification to user
 */
export const sendMotivationalNotification = async (userId, title, message, type = 'motivation', actionUrl = '') => {
  try {
    // 1. Create in-app notification
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      actionUrl,
    });

    // 2. Fetch User & check quiet hours
    const user = await User.findById(userId);
    if (!user) return notification;

    if (user.preferences?.quietHours?.enabled) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [startH, startM] = (user.preferences.quietHours.start || '22:00').split(':').map(Number);
      const [endH, endM] = (user.preferences.quietHours.end || '07:00').split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      let isQuiet = false;
      if (startMinutes > endMinutes) {
        // Overnight (e.g. 22:00 to 07:00)
        isQuiet = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      } else {
        isQuiet = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      }

      if (isQuiet) {
        console.log(`[Notification Suppressed - Quiet Hours]: ${user.name}`);
        return notification;
      }
    }

    // 3. Send Push Notification if enabled
    if (user.preferences?.pushNotifications) {
      const subscriptions = await PushSubscription.find({ userId });
      const payload = JSON.stringify({
        title,
        body: message,
        icon: '/logo192.png',
        data: { url: actionUrl || '/' },
      });

      for (const sub of subscriptions) {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys.p256dh,
                auth: sub.keys.auth,
              },
            },
            payload
          );
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription expired or gone
            await PushSubscription.deleteOne({ _id: sub._id });
          }
        }
      }
    }

    // 4. Send Email Notification if enabled
    if (user.preferences?.emailNotifications && process.env.SMTP_HOST) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Productivity Hub" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: title,
          text: message,
          html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4f46e5;">${title}</h2>
            <p style="font-size: 16px;">${message}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">Stay consistent and build great habits every day!</p>
          </div>`,
        });
      } catch (emailErr) {
        console.warn('Email notification skipped/failed:', emailErr.message);
      }
    }

    return notification;
  } catch (error) {
    console.error('Error in sendMotivationalNotification:', error);
  }
};

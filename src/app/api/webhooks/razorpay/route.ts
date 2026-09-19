import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { LocalStore } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'demo_webhook_secret';

    if (signature && secret) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyText)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid HMAC webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(bodyText);

    if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
      const orderId = payload.payload?.payment?.entity?.notes?.order_id || payload.payload?.order?.entity?.receipt?.replace('rcpt_', '');
      if (orderId) {
        LocalStore.updateOrderPaymentStatus(orderId, 'paid');
      }
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (err: any) {
    console.error('Razorpay Webhook Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

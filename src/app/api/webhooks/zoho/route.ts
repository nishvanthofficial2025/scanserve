import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { LocalStore } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-zoho-webhook-signature');
    const webhookSecret = process.env.ZOHO_PAYMENTS_WEBHOOK_SECRET;

    if (signature && webhookSecret) {
      const computedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (computedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid Zoho Webhook signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);

    // Process Zoho Payments event
    if (event.event_type === 'payment_order.paid' || event.event_type === 'payment.success') {
      const orderId = event.data?.payment_order?.reference_id || event.data?.reference_id;
      if (orderId) {
        LocalStore.updateOrderPaymentStatus(orderId, 'paid');
      }
    }

    return NextResponse.json({ status: 'success', received: true });
  } catch (error: any) {
    console.error('Zoho Webhook Error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}

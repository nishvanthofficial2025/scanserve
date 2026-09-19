import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { LocalStore } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo12345';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'demo_secret_key_67890';

    // If using real keys
    if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const razorpay = new Razorpay({ key_id, key_secret });
      const orders = LocalStore.getOrders();
      const order = orders.find(o => o.id === order_id);

      const amountInPaise = Math.round((order?.total || 100) * 100);

      const rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${order_id}`,
      });

      return NextResponse.json({
        id: rzpOrder.id,
        currency: rzpOrder.currency,
        amount: rzpOrder.amount,
        key_id,
      });
    }

    // Demo fallback for instant local testing
    return NextResponse.json({
      id: `rzp_ord_${Date.now()}`,
      currency: 'INR',
      amount: 10000,
      key_id: 'rzp_test_demo12345',
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
  }
}

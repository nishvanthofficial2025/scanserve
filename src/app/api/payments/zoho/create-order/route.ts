import { NextResponse } from 'next/server';
import { LocalStore } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const orders = LocalStore.getOrders();
    const order = orders.find(o => o.id === order_id);
    const amount = order?.total || 100.0;

    const clientId = process.env.NEXT_PUBLIC_ZOHO_PAYMENTS_CLIENT_ID;
    const clientSecret = process.env.ZOHO_PAYMENTS_CLIENT_SECRET;
    const accountId = process.env.ZOHO_PAYMENTS_ACCOUNT_ID;

    // If live Zoho Payments credentials exist
    if (clientId && clientSecret && accountId) {
      const response = await fetch(`https://payments.zoho.com/api/v1/paymentorders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Zoho-oauthtoken ${clientSecret}`,
          'X-Zoho-Account-Id': accountId,
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
          description: `ScanServe Order #${order_id}`,
          reference_id: order_id,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/${order_id}`,
        }),
      });

      const data = await response.json();
      return NextResponse.json({
        id: data.payment_order_id || `zoho_po_${Date.now()}`,
        payment_url: data.payment_url || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/${order_id}?zoho_success=true`,
        amount,
        provider: 'zoho',
      });
    }

    // Demo Mode Response for instant testing
    return NextResponse.json({
      id: `zoho_po_demo_${Date.now()}`,
      payment_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order/${order_id}?zoho_success=true`,
      amount,
      provider: 'zoho',
    });
  } catch (error: any) {
    console.error('Zoho Payments Error:', error);
    return NextResponse.json({ error: error.message || 'Zoho Payments initiation failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceRoleClient } from '@white-crow/shared';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const siteBusinessId = session.metadata?.siteBusinessId;

      if (!siteBusinessId || !session.customer || !session.subscription) {
        break;
      }

      const customerId =
        typeof session.customer === 'string'
          ? session.customer
          : session.customer.id;
      const subscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription.id;

      const { error: updateError } = await supabase
        .from('site_businesses')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_subscription_status: 'active',
          plan: 'premium',
        })
        .eq('id', siteBusinessId);

      if (updateError) {
        console.error('Error updating site_business:', updateError);
        return NextResponse.json(
          { error: 'Database update failed' },
          { status: 500 }
        );
      }

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const siteBusinessId = subscription.metadata?.siteBusinessId;

      if (!siteBusinessId) break;

      const status = subscription.status;

      await supabase
        .from('site_businesses')
        .update({
          stripe_subscription_status: status,
          plan: status === 'active' ? 'premium' : null,
        })
        .eq('id', siteBusinessId);

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const siteBusinessId = subscription.metadata?.siteBusinessId;

      if (!siteBusinessId) break;

      await supabase
        .from('site_businesses')
        .update({
          stripe_subscription_id: null,
          stripe_subscription_status: null,
          plan: null,
        })
        .eq('id', siteBusinessId);

      break;
    }
  }

  return NextResponse.json({ received: true });
}

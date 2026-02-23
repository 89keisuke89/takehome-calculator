import { getServiceSupabaseClient } from "@/lib/supabase";

type UpsertMemberInput = {
  email: string;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string;
  priceId: string | null;
  currentPeriodEnd: string | null;
};

export async function upsertMember(input: UpsertMemberInput) {
  const supabase = getServiceSupabaseClient();

  const { error } = await supabase.from("members").upsert(
    {
      email: input.email,
      status: input.status,
      stripe_customer_id: input.stripeCustomerId,
      stripe_subscription_id: input.stripeSubscriptionId,
      stripe_price_id: input.priceId,
      current_period_end: input.currentPeriodEnd
    },
    {
      onConflict: "email"
    }
  );

  if (error) {
    throw error;
  }
}

export async function findMemberByEmail(email: string) {
  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from("members")
    .select("email, status, current_period_end")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/require-user";
import { getCartSummary } from "@/lib/data/cart";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser("/checkout");
  const { error } = await searchParams;
  const cart = await getCartSummary();

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  return (
    <CheckoutFlow
      cart={cart}
      initialUser={{ name: user.name, email: user.email }}
      serverError={error}
    />
  );
}


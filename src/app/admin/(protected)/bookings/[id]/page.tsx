import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/data/admin/bookings";
import { BookingDetailView } from "@/components/admin/booking-detail-view";
import { requirePermission } from "@/lib/require-user";

export const metadata: Metadata = {
  title: "Booking Details | Admin | VACAY Florence",
  robots: { index: false },
};

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("bookings.view", `/admin/bookings/${id}`);
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  return <BookingDetailView order={order} />;
}

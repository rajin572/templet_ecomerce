import { Calendar, CheckCircle2, Clock, LucideIcon, User, XCircle } from "lucide-react";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { Button } from "@/Components/ui/button";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { DashboardBookingStatus, IRecentBooking } from "@/types";
import { getAvatar } from "@/utils/getAvatar";

interface BookingDetailPreviewModalProps {
  open: boolean;
  onClose: () => void;
  booking: IRecentBooking | null;
  onContactCustomer: (booking: IRecentBooking) => void;
  onConfirm: (booking: IRecentBooking) => void;
  onCancel: (booking: IRecentBooking) => void;
}

const STATUS_THEME: Record<
  DashboardBookingStatus,
  { label: string; bannerClass: string; textClass: string; pillClass: string; icon: LucideIcon }
> = {
  confirmed: {
    label: "Confirmed Booking",
    bannerClass: "bg-emerald-50 border-emerald-200",
    textClass: "text-emerald-700",
    pillClass: "bg-emerald-100 text-emerald-700 border border-emerald-300",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending Booking",
    bannerClass: "bg-amber-50 border-amber-200",
    textClass: "text-amber-700",
    pillClass: "bg-amber-100 text-amber-700 border border-amber-300",
    icon: Clock,
  },
  completed: {
    label: "Completed Booking",
    bannerClass: "bg-blue-50 border-blue-200",
    textClass: "text-blue-700",
    pillClass: "bg-blue-100 text-blue-700 border border-blue-300",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled Booking",
    bannerClass: "bg-red-50 border-red-200",
    textClass: "text-red-700",
    pillClass: "bg-red-100 text-red-700 border border-red-300",
    icon: XCircle,
  },
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs text-secondbase-color">{label}</p>
    <p className="text-sm font-medium text-base-color mt-0.5">{value}</p>
  </div>
);

const BookingDetailPreviewModal = ({
  open,
  onClose,
  booking,
  onContactCustomer,
  onConfirm,
  onCancel,
}: BookingDetailPreviewModalProps) => {
  if (!booking) {
    return (
      <ReusableModal open={open} onOpenChange={(v) => !v && onClose()} title="Booking Details" maxWidth="sm:max-w-md">
        <div />
      </ReusableModal>
    );
  }

  const theme = STATUS_THEME[booking.status];
  const StatusIcon = theme.icon;
  const serviceFee = Math.round(booking.basePrice * 0.15);
  const tax = Math.round(booking.basePrice * 0.08);
  const total = booking.basePrice + serviceFee + tax;

  return (
    <ReusableModal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Booking Details"
      description={`Complete information for booking ${booking.bookingCode}`}
      maxWidth="sm:max-w-2xl"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={() => onContactCustomer(booking)}>
            <User className="size-4" />
            Contact Customer
          </Button>
          {booking.status === "pending" && (
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => onConfirm(booking)}>
              Confirm Booking
            </Button>
          )}
          {(booking.status === "confirmed" || booking.status === "pending") && (
            <Button className="bg-destructive hover:bg-destructive/90 text-white" onClick={() => onCancel(booking)}>
              Cancel Booking
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className={`flex items-center justify-between gap-3 rounded-lg border p-4 ${theme.bannerClass}`}>
          <div className="flex items-center gap-2">
            <StatusIcon className={`size-5 shrink-0 ${theme.textClass}`} />
            <div>
              <p className={`text-sm font-semibold ${theme.textClass}`}>{theme.label}</p>
              <p className="text-xs text-base-color">Booking ID: {booking.bookingCode}</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 ${theme.pillClass}`}>
            {booking.transportType}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-[#F1F5F9] p-4 rounded-lg">
            <Avatar className="size-9">
              <AvatarFallback className="bg-secondary-color text-white font-semibold text-xs">
                {getAvatar(booking.customerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-base-color">{booking.customerName}</p>
              <p className="text-sm text-secondbase-color">{booking.customerEmail}</p>
            </div>
          </div>
          <div className="bg-[#F1F5F9] p-4 rounded-lg space-y-2">
            <p className="text-xs text-base-color/70">Booking Date</p>
            <p className="flex items-start gap-1.5 text-sm font-medium text-base-color mt-0.5">
              <Calendar className="size-5 text-secondary-color" />
              <div>
                {booking.bookingDate}
                <p className="text-xs text-base-color/70">{booking.bookedDaysAgoLabel}</p>
              </div>
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-[#E2E8F0] p-4">
          <p className="text-sm font-semibold text-base-color mb-4">Listing Information</p>

          <div className="flex items-center justify-between mb-3 border-b border-[#E2E8F0] pb-3">
            <p className="text-base font-medium text-base-color mb-3">
              {booking.listingTitle}
            </p>
            {booking.featured && (
              <span className="rounded-full bg-secondary-color/10 text-secondary-color text-xs font-semibold px-2.5 py-0.5">
                Featured
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Type" value={booking.transportType} />
            <Field label="Duration" value={booking.duration} />
            <Field label="Guests" value={`${booking.guests} People`} />
          </div>
        </div>

        <div className="rounded-lg bg-background-color p-4">
          <p className="text-sm font-semibold text-base-color mb-3">Payment Summary</p>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-secondbase-color">Base Price</span>
              <span className="text-base-color">${booking.basePrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondbase-color">Service Fee (15%)</span>
              <span className="text-base-color">${serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondbase-color">Tax (8%)</span>
              <span className="text-base-color">${tax.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border font-semibold">
              <span className="text-base-color">Total Amount</span>
              <span className="text-emerald-600">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#E2E8F0] p-4">
          <p className="text-sm font-semibold text-base-color mb-3">Booking Timeline</p>
          <div className="flex flex-col gap-3">
            {booking.timeline.map((event) => (
              <div key={event.label} className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm text-base-color">{event.label}</p>
                  <p className="text-xs text-base-color/70">{event.dateLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ReusableModal>
  );
};

export default BookingDetailPreviewModal;

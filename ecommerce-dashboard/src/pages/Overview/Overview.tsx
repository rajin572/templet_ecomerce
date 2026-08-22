import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import RevenueAreaChart from "@/Components/Charts/RevenueAreaChart";
import CategorySplitChart from "@/Components/Charts/CategorySplitChart";
import DashboardStatCards from "@/Components/Dashboard/Overview/DashboardStatCards";
import PendingVerificationsCard from "@/Components/Dashboard/Overview/PendingVerificationsCard";
import PendingVerificationReviewModal from "@/Components/Dashboard/Overview/PendingVerificationReviewModal";
import RecentBookingsCard from "@/Components/Dashboard/Overview/RecentBookingsCard";
import BookingDetailPreviewModal from "@/Components/Dashboard/Overview/BookingDetailPreviewModal";
import TopListingsCard from "@/Components/Dashboard/Overview/TopListingsCard";
import { IDashboardOverviewData, IPendingVerification, IRecentBooking } from "@/types";
// import {
//   useGetDashboardOverviewQuery,
//   useApproveVerificationMutation,
//   useRejectVerificationMutation,
//   useConfirmBookingMutation,
//   useCancelBookingMutation,
// } from "@/redux/features/dashboard/dashboardApi";
// import tryCatchWrapper from "@/utils/tryCatchWrapper";

// TODO: replace with real dashboard-overview API data once the endpoint exists.
const DUMMY_OVERVIEW: IDashboardOverviewData = {
  stats: {
    totalRevenue: 1245000,
    totalBookings: 2010,
    activeUsers: 12458,
    totalListings: 1847,
  },
  revenueBookingsTrend: [
    { month: "Jan", Revenue: 118000 },
    { month: "Feb", Revenue: 138000 },
    { month: "Mar", Revenue: 152000 },
    { month: "Apr", Revenue: 185000 },
    { month: "May", Revenue: 228000 },
    { month: "Jun", Revenue: 245000 },
  ],
  transportDistribution: [
    { category: "Boats", percentage: 60 },
    { category: "Aircraft", percentage: 40 },
  ],
  pendingVerifications: [
    {
      _id: "1",
      ownerName: "Marina Elite Ltd",
      documentType: "Business License",
      submittedLabel: "2 hours ago",
      files: [
        { name: "Boat License.JPG", status: "completed" },
        { name: "Boat Registration.PDF", status: "completed" },
        { name: "Inspection Report.PDF", status: "completed" },
        { name: "Safety Compliance.PDF", status: "completed" },
        { name: "Insurance Certificate.JPG", status: "completed" },
      ],
    },
    {
      _id: "2",
      ownerName: "Luxury Air Services",
      documentType: "Aircraft Certificate",
      submittedLabel: "5 hours ago",
      files: [
        { name: "Airworthiness Certificate.PDF", status: "completed" },
        { name: "Pilot License.JPG", status: "completed" },
        { name: "Insurance Certificate.PDF", status: "completed" },
      ],
    },
    {
      _id: "3",
      ownerName: "Premium Motors",
      documentType: "Insurance Document",
      submittedLabel: "1 day ago",
      files: [
        { name: "Insurance Policy.PDF", status: "completed" },
        { name: "Vehicle Registration.PDF", status: "completed" },
      ],
    },
    {
      _id: "4",
      ownerName: "Ocean Adventures",
      documentType: "Captain License",
      submittedLabel: "2 days ago",
      files: [
        { name: "Captain License.JPG", status: "completed" },
        { name: "Safety Training Certificate.PDF", status: "completed" },
      ],
    },
  ],
  recentBookings: [
    {
      _id: "1",
      bookingCode: "BK-10234",
      customerName: "John Smith",
      customerEmail: "john.smith@example.com",
      listingTitle: "Luxury Yacht - Mediterranean",
      transportType: "Boat",
      featured: true,
      amount: 12500,
      status: "confirmed",
      bookingDate: "2026-05-20",
      bookedDaysAgoLabel: "Booked 3 days ago",
      duration: "3 Days",
      guests: 4,
      basePrice: 12500,
      timeline: [
        { label: "Booking Created", dateLabel: "2026-05-20 at 10:30 AM" },
        { label: "Payment Received", dateLabel: "2026-05-20 at 10:32 AM" },
        { label: "Booking Confirmed", dateLabel: "2026-05-20 at 10:35 AM" },
      ],
    },
    {
      _id: "2",
      bookingCode: "BK-10233",
      customerName: "Sarah Johnson",
      customerEmail: "sarah.johnson@example.com",
      listingTitle: "Private Jet - Gulfstream G650",
      transportType: "Air",
      featured: true,
      amount: 45000,
      status: "pending",
      bookingDate: "2026-05-22",
      bookedDaysAgoLabel: "Booked 3 days ago",
      duration: "3 Days",
      guests: 4,
      basePrice: 45000,
      timeline: [
        { label: "Booking Created", dateLabel: "2026-05-22 at 10:30 AM" },
        { label: "Payment Received", dateLabel: "2026-05-22 at 10:32 AM" },
      ],
    },
    {
      _id: "3",
      bookingCode: "BK-10232",
      customerName: "Michael Chen",
      customerEmail: "michael.chen@example.com",
      listingTitle: "Lamborghini Aventador",
      transportType: "Land",
      featured: false,
      amount: 3200,
      status: "confirmed",
      bookingDate: "2026-05-19",
      bookedDaysAgoLabel: "Booked 4 days ago",
      duration: "1 Day",
      guests: 2,
      basePrice: 3200,
      timeline: [
        { label: "Booking Created", dateLabel: "2026-05-19 at 09:15 AM" },
        { label: "Payment Received", dateLabel: "2026-05-19 at 09:18 AM" },
        { label: "Booking Confirmed", dateLabel: "2026-05-19 at 09:20 AM" },
      ],
    },
    {
      _id: "4",
      bookingCode: "BK-10231",
      customerName: "Emma Davis",
      customerEmail: "emma.davis@example.com",
      listingTitle: "Catamaran - Caribbean",
      transportType: "Boat",
      featured: true,
      amount: 8750,
      status: "completed",
      bookingDate: "2026-05-15",
      bookedDaysAgoLabel: "Booked 3 days ago",
      duration: "3 Days",
      guests: 4,
      basePrice: 8750,
      timeline: [
        { label: "Booking Created", dateLabel: "2026-05-15 at 10:30 AM" },
        { label: "Payment Received", dateLabel: "2026-05-15 at 10:32 AM" },
      ],
    },
    {
      _id: "5",
      bookingCode: "BK-10230",
      customerName: "David Wilson",
      customerEmail: "david.wilson@example.com",
      listingTitle: "Helicopter Tour",
      transportType: "Air",
      featured: true,
      amount: 2800,
      status: "cancelled",
      bookingDate: "2026-05-14",
      bookedDaysAgoLabel: "Booked 3 days ago",
      duration: "3 Days",
      guests: 4,
      basePrice: 2800,
      timeline: [
        { label: "Booking Created", dateLabel: "2026-05-14 at 10:30 AM" },
        { label: "Payment Received", dateLabel: "2026-05-14 at 10:32 AM" },
      ],
    },
  ],
  topListings: [
    { _id: "1", rank: 1, name: "Sunseeker 88 Yacht", bookings: 45, revenue: 562500, rating: 4.9 },
    { _id: "2", rank: 2, name: "Gulfstream G650", bookings: 38, revenue: 1710000, rating: 5.0 },
    { _id: "3", rank: 3, name: "Ferrari 812 Superfast", bookings: 67, revenue: 214400, rating: 4.8 },
    { _id: "4", rank: 4, name: "Lagoon 450 Catamaran", bookings: 29, revenue: 187200, rating: 4.7 },
  ],
};

const OverviewPage = () => {
  const navigate = useNavigate();

  const [selectedVerification, setSelectedVerification] = useState<IPendingVerification | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<IRecentBooking | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // const { data } = useGetDashboardOverviewQuery();
  // const overview = data?.data;
  const overview = DUMMY_OVERVIEW;

  // const [approveVerification] = useApproveVerificationMutation();
  const handleApproveVerification = async (_verification: IPendingVerification) => {
    // const res = await tryCatchWrapper(
    //   approveVerification,
    //   { params: { id: _verification._id } },
    //   { toastLoadingMessage: "Approving document..." }
    // );
    // if (res?.success) {
    setIsVerificationOpen(false);
    // }
  };

  // const [rejectVerification] = useRejectVerificationMutation();
  const handleRejectVerification = async (_verification: IPendingVerification) => {
    // const res = await tryCatchWrapper(
    //   rejectVerification,
    //   { params: { id: _verification._id }, body: {} },
    //   { toastLoadingMessage: "Rejecting document..." }
    // );
    // if (res?.success) {
    setIsVerificationOpen(false);
    // }
  };

  const handleContactCustomer = (booking: IRecentBooking) => {
    window.location.href = `mailto:${booking.customerEmail}`;
  };

  // const [confirmBooking] = useConfirmBookingMutation();
  const handleConfirmBooking = async (_booking: IRecentBooking) => {
    // const res = await tryCatchWrapper(
    //   confirmBooking,
    //   { params: { id: _booking._id } },
    //   { toastLoadingMessage: "Confirming booking..." }
    // );
    // if (res?.success) {
    setIsBookingOpen(false);
    // }
  };

  // const [cancelBooking] = useCancelBookingMutation();
  const handleCancelBooking = async (_booking: IRecentBooking) => {
    // const res = await tryCatchWrapper(
    //   cancelBooking,
    //   { params: { id: _booking._id } },
    //   { toastLoadingMessage: "Cancelling booking..." }
    // );
    // if (res?.success) {
    setIsBookingOpen(false);
    // }
  };

  return (
    <PageWraper title="Dashboard Overview" description="Monitor your platform performance and key metrics">
      <DashboardStatCards stats={overview.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-base font-semibold text-base-color">Revenue & Bookings Trend</h2>
          <p className="text-sm text-secondbase-color mb-2">Last 6 months performance</p>
          <RevenueAreaChart data={overview.revenueBookingsTrend} color="#6366f1" />
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-base font-semibold text-base-color">Transport Distribution</h2>
          <p className="text-sm text-secondbase-color mb-2">Booking by category</p>
          <CategorySplitChart data={overview.transportDistribution} />
        </div>
      </div>

      <PendingVerificationsCard
        verifications={overview.pendingVerifications}
        onViewAll={() => navigate("/admin/owner-management")}
        onReview={(verification) => {
          setSelectedVerification(verification);
          setIsVerificationOpen(true);
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentBookingsCard
          bookings={overview.recentBookings}
          onView={(booking) => {
            setSelectedBooking(booking);
            setIsBookingOpen(true);
          }}
        />

        <TopListingsCard listings={overview.topListings} />
      </div>

      <PendingVerificationReviewModal
        open={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        verification={selectedVerification}
        onApprove={handleApproveVerification}
        onReject={handleRejectVerification}
      />

      <BookingDetailPreviewModal
        open={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        booking={selectedBooking}
        onContactCustomer={handleContactCustomer}
        onConfirm={handleConfirmBooking}
        onCancel={handleCancelBooking}
      />
    </PageWraper>
  );
};

export default OverviewPage;

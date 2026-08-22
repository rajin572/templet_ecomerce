import { Eye } from "lucide-react";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { DashboardBookingStatus, IRecentBooking } from "@/types";

interface RecentBookingsCardProps {
  bookings: IRecentBooking[];
  onView: (booking: IRecentBooking) => void;
}

const statusBadgeClass: Record<DashboardBookingStatus, string> = {
  confirmed: "bg-green-500 text-white",
  pending: "bg-amber-500 text-white",
  completed: "bg-blue-500 text-white",
  cancelled: "bg-red-500 text-white",
};

const RecentBookingsCard = ({ bookings, onView }: RecentBookingsCardProps) => {
  const headerClassName = "text-xs font-semibold px-2 py-2.5";
  const cellClassName = "px-2 py-2.5 text-xs";

  const columns: Column<IRecentBooking>[] = [
    {
      header: "Booking ID",
      accessorKey: "bookingCode",
      headerClassName,
      cellClassName,
      render: (value: string) => <span className="text-xs text-secondary-color">{value}</span>,
    },
    {
      header: "Customer",
      accessorKey: "customerName",
      headerClassName,
      cellClassName,
      render: (value: string) => <span className="text-xs">{value}</span>,
    },
    {
      header: "Listing",
      accessorKey: "listingTitle",
      headerClassName,
      cellClassName,
      render: (value: string) => <span className="text-xs">{value}</span>,
    },
    {
      header: "Type",
      accessorKey: "transportType",
      headerClassName,
      cellClassName,
      render: (value: string) => <span className="text-xs text-secondbase-color">{value}</span>,
    },
    {
      header: "Amount",
      accessorKey: "amount",
      headerClassName,
      cellClassName,
      render: (value: number) => <span className="text-xs font-semibold">${value.toLocaleString()}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      headerClassName,
      cellClassName,
      render: (value: DashboardBookingStatus) => <Tag className={statusBadgeClass[value]}>{value}</Tag>,
    },
    {
      header: "Action",
      accessorKey: "_id",
      headerClassName: `${headerClassName} whitespace-nowrap pr-3`,
      cellClassName: `${cellClassName} pr-3`,
      render: (_, row) => (
        <button
          type="button"
          className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-pointer"
          onClick={() => onView(row)}
        >
          <Eye className="size-4 text-base-color" />
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm">
      <div className="p-5 pb-4">
        <h2 className="text-base font-semibold text-base-color">Recent Bookings</h2>
        <p className="text-sm text-secondbase-color">Latest booking activity</p>
      </div>

      <ReusableTable data={bookings} columns={columns} scroll={false} />
    </div>
  );
};

export default RecentBookingsCard;

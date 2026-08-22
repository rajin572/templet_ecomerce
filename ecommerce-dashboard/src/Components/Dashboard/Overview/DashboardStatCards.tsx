import { DollarSign, Calendar, Users, Tag } from "lucide-react";
import { IDashboardStats } from "@/types";

interface DashboardStatCardsProps {
  stats: IDashboardStats;
}

const DashboardStatCards = ({ stats }: DashboardStatCardsProps) => {
  const cards = [
    { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, iconColor: "text-emerald-500" },
    { label: "Total Bookings", value: stats.totalBookings.toLocaleString(), icon: Calendar, iconColor: "text-blue-500" },
    { label: "Active Users", value: stats.activeUsers.toLocaleString(), icon: Users, iconColor: "text-indigo-500" },
    { label: "Total Listings", value: stats.totalListings.toLocaleString(), icon: Tag, iconColor: "text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, iconColor }) => (
        <div key={label} className="bg-white rounded-xl border border-border p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-secondbase-color">{label}</p>
            <p className="text-2xl font-bold text-base-color mt-2">{value}</p>
          </div>
          <Icon className={`size-6 ${iconColor}`} />
        </div>
      ))}
    </div>
  );
};

export default DashboardStatCards;

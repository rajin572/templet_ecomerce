import { Star } from "lucide-react";
import { ITopListing } from "@/types";

interface TopListingsCardProps {
  listings: ITopListing[];
}

const TopListingsCard = ({ listings }: TopListingsCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-5">
      <h2 className="text-base font-semibold text-base-color">Top Listings</h2>
      <p className="text-sm text-secondbase-color mb-4">Best performing rentals</p>

      <div className="flex flex-col gap-4">
        {listings.map((listing, i) => (
          <div key={listing._id} className={`flex items-start gap-3 ${listings?.length !== i + 1 ? "border-b border-border pb-3" : ""}`}>
            <span className="flex mt-1 items-center justify-center size-6 rounded-full bg-secondary-color text-white text-xs font-semibold shrink-0">
              {listing.rank}
            </span>
            <div className="flex flex-col gap-3 w-full">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-base-color truncate">{listing.name}</p>
                <p className="text-xs ">
                  {listing.bookings} bookings • <span className="text-success">${listing.revenue.toLocaleString()}</span>
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-base-color shrink-0">
                {listing.rating}
                <Star className="size-3.5 fill-amber-500 text-amber-500" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopListingsCard;

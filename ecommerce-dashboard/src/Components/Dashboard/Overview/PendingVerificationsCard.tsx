import { AlertCircle } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { IPendingVerification } from "@/types";
import { getAvatar } from "@/utils/getAvatar";

interface PendingVerificationsCardProps {
  verifications: IPendingVerification[];
  onViewAll: () => void;
  onReview: (verification: IPendingVerification) => void;
}

const PendingVerificationsCard = ({ verifications, onViewAll, onReview }: PendingVerificationsCardProps) => {
  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-base-color">Pending Verifications ({verifications.length})</p>
            <p className="text-xs text-secondbase-color mt-0.5">Owner documents requiring immediate attention</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          View All
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {verifications.map((verification) => (
          <div
            key={verification._id}
            className="flex items-center justify-between gap-3 rounded-lg bg-white p-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-secondary-color text-white font-semibold text-xs">
                  {getAvatar(verification.ownerName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-base-color truncate">{verification.ownerName}</p>
                <p className="text-xs text-secondbase-color truncate">{verification.documentType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-secondbase-color">{verification.submittedLabel}</span>
              <Button variant="secondary" size="sm" onClick={() => onReview(verification)}>
                Review
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingVerificationsCard;

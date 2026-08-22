import { CheckCircle2, FileText, XCircle } from "lucide-react";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { Button } from "@/Components/ui/button";
import { IPendingVerification } from "@/types";

interface PendingVerificationReviewModalProps {
  open: boolean;
  onClose: () => void;
  verification: IPendingVerification | null;
  onApprove: (verification: IPendingVerification) => void;
  onReject: (verification: IPendingVerification) => void;
}

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-secondbase-color">{label}</p>
    <p className="text-sm font-medium text-base-color mt-0.5">{value}</p>
  </div>
);

const PendingVerificationReviewModal = ({
  open,
  onClose,
  verification,
  onApprove,
  onReject,
}: PendingVerificationReviewModalProps) => {
  return (
    <ReusableModal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Review Verification Document"
      description="Review and approve or reject the submitted verification document"
      maxWidth="sm:max-w-md"
      footer={
        verification && (
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => onReject(verification)}
            >
              Reject
            </Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => onApprove(verification)}>
              <CheckCircle2 className="size-4" />
              Approve
            </Button>
          </div>
        )
      }
    >
      {verification && (
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-[#F1F5F9] rounded-lg flex flex-col gap-4">
            <InfoField label="Owner" value={verification.ownerName} />

            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Document Type" value={verification.documentType} />
              <InfoField label="Submitted" value={verification.submittedLabel} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {verification.files.map((file) => (
              <div key={file.name} className="flex items-center gap-3 rounded-lg bg-background-color p-3">
                <FileText className="size-6 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-base-color truncate">{file.name}</p>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 mt-0.5">
                    {file.status === "completed" ? (
                      <>
                        <CheckCircle2 className="size-3.5" />
                        Completed
                      </>
                    ) : (
                      <>
                        <XCircle className="size-3.5 text-amber-500" />
                        <span className="text-amber-500">Pending</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ReusableModal>
  );
};

export default PendingVerificationReviewModal;

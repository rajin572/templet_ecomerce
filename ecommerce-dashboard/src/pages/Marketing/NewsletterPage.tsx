import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Checkbox } from "@/Components/ui/checkbox";
import { Button } from "@/Components/ui/button";
import { Mail, Trash2 } from "lucide-react";
import ComposeEmailModal from "@/Components/Dashboard/Marketing/ComposeEmailModal";
import { DUMMY_NEWSLETTER_SUBSCRIBERS } from "@/data/dummyStore";
import type { INewsletterSubscriber, INewsletterCampaignValues } from "@/types";
// import { useGetNewsletterSubscribersQuery, useSendNewsletterCampaignMutation, useRemoveNewsletterSubscriberMutation } from "@/redux/features/newsletter/newsletterApi";
// import tryCatchWrapper from "@/utils/tryCatchWrapper";

// TODO: wire to useGetNewsletterSubscribersQuery once GET /newsletter/subscribers
// exists — this list lives in local component state until then, per AGENTS.md §2.8.
const NewsletterPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [subscribers, setSubscribers] = useState<INewsletterSubscriber[]>(DUMMY_NEWSLETTER_SUBSCRIBERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [composeOpen, setComposeOpen] = useState(false);
  const [removing, setRemoving] = useState<INewsletterSubscriber | null>(null);

  const activeSubscribers = subscribers.filter((s) => s.status === "subscribed");
  const filtered = subscribers.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()));
  // Only subscribed contacts can be picked — no point selecting someone who opted out.
  const selectableIds = useMemo(() => filtered.filter((s) => s.status === "subscribed").map((s) => s._id), [filtered]);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(selectableIds));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSend = (values: INewsletterCampaignValues) => {
    toast.success(`"${values.subject}" queued for ${selectedIds.size} subscriber${selectedIds.size === 1 ? "" : "s"}`);
    setSelectedIds(new Set());
  };

  const handleRemove = () => {
    if (!removing) return;
    setSubscribers((prev) => prev.filter((s) => s._id !== removing._id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(removing._id);
      return next;
    });
    toast.success("Subscriber removed");
    setRemoving(null);
  };

  const columns: Column<INewsletterSubscriber>[] = [
    {
      header: <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all subscribed" />,
      accessorKey: "_id",
      width: 48,
      render: (_val, row) => (
        <Checkbox
          checked={selectedIds.has(row._id)}
          disabled={row.status !== "subscribed"}
          onCheckedChange={() => toggleOne(row._id)}
          aria-label={`Select ${row.email}`}
        />
      ),
    },
    { header: "Email", accessorKey: "email", render: (val) => <span className="font-medium">{val}</span> },
    { header: "Status", accessorKey: "status", render: (val) => <Tag theme={val === "subscribed" ? "success" : "error"} className="capitalize">{val}</Tag> },
    { header: "Subscribed On", accessorKey: "subscribedAt", render: (val) => new Date(val).toLocaleDateString() },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 bg-red-50" onClick={() => setRemoving(row)}>
          <Trash2 className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <PageWraper
      title="Newsletter"
      description={`${activeSubscribers.length} active subscribers on the storefront newsletter.`}
      actions={
        <Button onClick={() => setComposeOpen(true)} disabled={selectedIds.size === 0}>
          <Mail className="mr-2 size-4" /> Send Email {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
        </Button>
      }
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search subscriber email..." className="max-w-md" />
          <button type="button" onClick={toggleAll} className="text-sm font-medium text-secondary-color hover:underline" disabled={selectableIds.length === 0}>
            {allSelected ? "Deselect all" : `Select all ${selectableIds.length} subscribed`}
          </button>
        </div>
        <ReusableTable
          data={filtered}
          columns={columns}
          pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={10}
          total={filtered.length}
        />
      </div>

      <ComposeEmailModal
        open={composeOpen}
        onOpenChange={setComposeOpen}
        title="Send Email to Subscribers"
        description={`This will be sent to all ${selectedIds.size} selected subscriber${selectedIds.size === 1 ? "" : "s"}.`}
        submitLabel={`Send to ${selectedIds.size}`}
        onSend={handleSend}
      />

      <ConfirmModal
        open={!!removing}
        onCancel={() => setRemoving(null)}
        currentRecord={removing}
        onConfirm={handleRemove}
        title="Remove this subscriber?"
        description="They will no longer receive newsletter emails."
        confirmText="Remove"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default NewsletterPage;

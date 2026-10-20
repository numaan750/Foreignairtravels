import { FiMessageSquare } from "react-icons/fi";
import EmptyState from "@/components/dashboard/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";

export default function InquiriesPage() {
  return (
    <div>
      <PageHeader
        title="Inquiries"
        description="Customer questions and travel requests will appear here."
      />

      <EmptyState
        icon={FiMessageSquare}
        title="No inquiries yet"
        text="When customers send an inquiry, you’ll be able to review it here."
      />
    </div>
  );
}

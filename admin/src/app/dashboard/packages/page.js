import { FiMap } from "react-icons/fi";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";

export default function PackagesPage() {
  return (
    <div>
      <PageHeader title="Packages" description="Travel packages yahan manage honge." />
      <EmptyState icon={FiMap} title="Abhi koi package nahi" text="Packages ki list yahan nazar aayegi." />
    </div>
  );
}
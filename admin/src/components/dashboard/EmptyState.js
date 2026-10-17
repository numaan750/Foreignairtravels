export default function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6B35]/10 text-2xl text-[#FF6B35]">
          <Icon />
        </div>
      )}
      <h2 className="text-base font-semibold text-[#003366] sm:text-lg">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-[#003366]/60">{text}</p>
    </div>
  );
}
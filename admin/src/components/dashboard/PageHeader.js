export default function PageHeader({ title, description, action, className = "mb-6" }) {
  return (
    <div className={`${className} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold text-[#003366] sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-[#003366]/60">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
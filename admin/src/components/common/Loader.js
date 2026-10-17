export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EDEEE9] text-[#003366]">
      {text}
    </div>
  );
}
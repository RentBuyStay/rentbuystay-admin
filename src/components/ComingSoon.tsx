import { Hammer } from "lucide-react";

/** Placeholder for admin sections not yet built out. */
export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-[16px] bg-white py-24 px-6" style={{ border: "1px solid #ededed" }}>
      <span className="flex items-center justify-center rounded-full mb-4" style={{ width: 56, height: 56, background: "#EAF2FA" }}>
        <Hammer size={26} strokeWidth={1.6} color="#305e82" />
      </span>
      <h2 className="text-[20px] font-semibold text-[#121212]">{title}</h2>
      <p className="text-[14px] text-[#807e7e] mt-1 max-w-sm">
        This section is being built out next. The layout and navigation are in place.
      </p>
    </div>
  );
}

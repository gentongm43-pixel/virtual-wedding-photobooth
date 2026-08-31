import { Camera, Heart } from "lucide-react";

type PageLoadingProps = {
  label?: string;
  admin?: boolean;
};

export default function PageLoading({ label = "Menyiapkan momenmu...", admin = false }: PageLoadingProps) {
  return (
    <main
      className={`grid min-h-screen place-items-center px-6 text-center ${
        admin ? "bg-[#f8f6f2] text-[#302b28]" : "bg-[#f7f1e9] text-[#252321]"
      }`}
      aria-busy="true"
      aria-live="polite"
    >
      <div>
        <span
          className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${
            admin ? "bg-[#f5eadb] text-[#a77943]" : "bg-[#ead8c6] text-[#b99261]"
          }`}
        >
          {admin ? <Heart size={25} fill="currentColor" /> : <Camera size={25} />}
        </span>
        <div
          className={`mx-auto mt-5 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent ${
            admin ? "border-[#b99261]" : "border-[#c99a62]"
          }`}
          aria-hidden="true"
        />
        <p className="mt-4 text-sm font-medium text-[#837b74]">{label}</p>
      </div>
    </main>
  );
}

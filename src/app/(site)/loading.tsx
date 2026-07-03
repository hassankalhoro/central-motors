import Image from "next/image";

/* Shown instantly while a page renders on the server, navigation feels
   immediate instead of frozen. Header/footer stay in place. */
export default function Loading() {
  return (
    <div className="grid min-h-[62vh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <span className="relative grid h-16 w-16 place-items-center">
          <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-line border-t-suzuki-red" />
          <Image src="/brand/suzuki.png" alt="Suzuki" width={431} height={512} priority className="h-8 w-auto" />
        </span>
        <span className="text-[12.5px] font-bold uppercase tracking-[0.18em] text-ink-faint">Loading</span>
      </div>
    </div>
  );
}

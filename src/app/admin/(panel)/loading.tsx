import Image from "next/image";

export default function Loading() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <span className="relative grid h-14 w-14 place-items-center">
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-line border-t-suzuki-red" />
        <Image src="/brand/suzuki-mark.png" alt="Suzuki" width={606} height={606} priority className="h-7 w-auto" />
      </span>
    </div>
  );
}

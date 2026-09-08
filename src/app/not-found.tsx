import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-5xl font-extrabold">Không tìm thấy trang</h1>
      <p className="font-sans text-muted-foreground">
        Cột mốc này chưa có, hoặc đường dẫn bị gõ nhầm.
      </p>
      <Link href="/" className="font-sans text-primary hover:underline">
        Về trang chủ
      </Link>
    </main>
  );
}

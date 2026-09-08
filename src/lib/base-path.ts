// GitHub Pages phục vụ site ở /<repo>. next/image và <Link> tự thêm tiền tố,
// nhưng URL viết tay (srcSet, ảnh truyền vào shader) thì không — phải qua đây.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(pathname: string): string {
  if (!pathname.startsWith("/")) {
    throw new Error(`Đường dẫn phải bắt đầu bằng "/": ${pathname}`);
  }
  if (!basePath) return pathname;
  if (pathname === basePath || pathname.startsWith(`${basePath}/`)) return pathname;
  return `${basePath}${pathname}`;
}

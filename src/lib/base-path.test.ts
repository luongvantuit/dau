import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL = process.env.NEXT_PUBLIC_BASE_PATH;

async function load(basePath: string | undefined) {
  vi.resetModules();
  if (basePath === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
  else process.env.NEXT_PUBLIC_BASE_PATH = basePath;
  return (await import("./base-path")).withBasePath;
}

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
  else process.env.NEXT_PUBLIC_BASE_PATH = ORIGINAL;
});

describe("withBasePath", () => {
  it("giữ nguyên khi chạy ở gốc tên miền", async () => {
    const withBasePath = await load(undefined);
    expect(withBasePath("/photos/a.webp")).toBe("/photos/a.webp");
  });

  it("thêm tiền tố khi deploy trong thư mục con", async () => {
    const withBasePath = await load("/dau");
    expect(withBasePath("/photos/a.webp")).toBe("/dau/photos/a.webp");
  });

  it("không thêm tiền tố hai lần", async () => {
    const withBasePath = await load("/dau");
    expect(withBasePath("/dau/photos/a.webp")).toBe("/dau/photos/a.webp");
  });

  it("từ chối đường dẫn tương đối", async () => {
    const withBasePath = await load("/dau");
    expect(() => withBasePath("photos/a.webp")).toThrow(/bắt đầu bằng/);
  });
});

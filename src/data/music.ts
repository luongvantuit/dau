/**
 * Bài hát phát trên trang sự kiện. File đặt trong public/music/ nên đường dẫn
 * viết tay phải đi qua withBasePath — GitHub Pages phục vụ site ở /dau.
 */
export const MUSIC = {
  src: "/music/khuc-hat-mung-sinh-nhat.mp3",
  title: "Khúc Hát Mừng Sinh Nhật",
  /** Người trình bày bản thu. */
  artist: "Phan Đinh Tùng",
  /**
   * Ảnh bìa trong public/music/. Để null thì card dùng logo hạt đậu, vẫn quay
   * như đĩa than nên không trống trải.
   */
  cover: "/music/phan-dinh-tung.webp" as string | null,
} as const;

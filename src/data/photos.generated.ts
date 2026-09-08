// TỆP TỰ SINH — đừng sửa tay.
// Chạy `pnpm photos` để tạo lại từ photos/<slug>/.

export type GeneratedPhoto = {
  /** Tên file gốc bỏ phần đuôi. Khoá để events.ts gắn caption/hiệu ứng. */
  id: string;
  /** Kích thước bản lớn nhất, đã xoay theo EXIF. Đưa vào <img> để khỏi giật layout. */
  width: number;
  height: number;
  /** WebP 16px base64, làm nền mờ trong lúc ảnh thật đang tải. */
  blurDataURL: string;
  srcSet: { w: number; src: string }[];
};

export const PHOTO_MANIFEST: Record<string, GeneratedPhoto[]> = {
  "sinh-nhat-1-tuoi": [
    {
      "id": "DSC05289",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAAAwBACdASoQABgAPu1iqU2ppaOiMAgBMB2JbACdMoAKXC40lOoQUBXYSZgA/vlux1vJA/tfTf6OvZj5ZyyLIiKLGUvhiPE37uGA1KXc8/syvv48GvQerjbGLTgomKZuXETWIV23qfqtmXiVe5z0BEbzl331aNA6iKEibJ0YJHrfqwAA",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05289-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05289-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05289-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05308",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRqIAAABXRUJQVlA4IJYAAACQBACdASoQABgAPu1orU2ppqSiMAgBMB2JbACdMoAKSFtvHfohgo7IsAJzcbAA/vluqcAhaPwvdBfmRr3m2qqOD5Zbl4WHyZ7do66OfWPzk4yQPMw2dl1wI/H2x2nxdnC+x//oyEjW2j4kITtGn2nj9pQ6/7nubdhQ9bjYLy6sLrOvWEKNdLv+5KBP1yUFbNQqBOf4AAA=",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05308-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05308-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05308-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05375",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRp4AAABXRUJQVlA4IJIAAAAwBACdASoQABgAPu1iqU2ppaOiMAgBMB2JbACdAGlw0oHmGeA0a9izB4QA/voZn5Q0zgXsYX3bhAje5VKF0Er3L2jS9joqERuEevc01NZq4V2i4/kyLW/z1dpJgd0uhjH8/m91z1DDtTopDfpq7FRaX6x6QQXXPEG+SEC4x3WQ2IS9esvQEK5h+0OGEeE9bRQAAA==",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05375-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05375-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05375-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05384",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAAAwBACdASoQABgAPu1orU6ppiSiMAgBMB2JbACdAYwSx1sTucSzDgBi6eAA/tRjhCJwImkEHHqyMMJ1IdluwYQmSy9eUbk0BgOsm/dAW8FBcKJEAiJ+GdoeDTmQatyliGt1IB4uEiL0Qp1uL1BLW9KeOyLIgeb83DVLWefj75+yI+efNk2gz9Iy5IdpIAAA",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05384-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05384-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05384-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05417",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRpQAAABXRUJQVlA4IIgAAABwBACdASoQABgAPu1iqk4ppaQiMAgBMB2JYgCsIE3J/gPFzNSSVaHd74OzsAD+mmBSRTkVUgn96YXZHzzq9QHVFWyvW0BvDx+rdiOL2CGUry9qWYqciXKcPN3KjkVYoGEmt5u8ZaBbGzhIB+evZ7GD9KloD58tNjZpRjqcZtSQSPEorC7pSwAA",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05417-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05417-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05417-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05421",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAAAwBACdASoQABgAPu1iqk2ppaQiMAgBMB2JYwB/fwH0ebqfZ+cSp9NxdgAA/sVapDcWEo8HakEsNr7WWoJWkIBFLPorK29jCQcYooYN5GFhcknTjKjO2RrlfB29lgIuMkZgMpkC8fP+88AA",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05421-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05421-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05421-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05428",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRnQAAABXRUJQVlA4IGgAAAAwBACdASoQABgAPu1iqU2ppaOiMAgBMB2JZQDCgCHe2mDB/UD45Llg8gAA/tSGbNctfTy4GYEl+zXeBXQ8TCBIVXWfirLczjm8vBRmo0k8fge6vJrgO12H6HdJdsZkAgvNzBE/24AAAA==",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05428-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05428-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05428-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05429",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRngAAABXRUJQVlA4IGwAAADwAwCdASoQABgAPu1kq04ppaQiMAgBMB2JZQC/OCHfUV86WEWvgSAAAP7FRq0Q9sIjna/45VBVSfax+yY6edeqMBq/5D99YKyGZoBaD01nfjghf6CN/6HdGLTxbBpOOLm5rxaVY0Vb1qKQAAA=",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05429-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05429-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05429-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05459",
      "width": 1600,
      "height": 2240,
      "blurDataURL": "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAABwBACdASoQABYAPu1iqk2ppaQiMAgBMB2JYwC7IMgDE2imJHYm3yF2EXpMAAD+w4mZRg0+9IqSJKcwjjT0lQp2yxw1uWsk7hDeoj2vHOfSyOKzfBENFXqQDP4CEQA0Rtxyl8/UFefpAZURGI0BOZgAAAA=",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05459-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05459-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05459-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05461",
      "width": 1600,
      "height": 2240,
      "blurDataURL": "data:image/webp;base64,UklGRngAAABXRUJQVlA4IGwAAAAQBACdASoQABYAPu1iqk2ppaQiMAgBMB2JYwAAXenxpkz2E2LeBsRPMAD+0xt2bxlH4VxEH22D9SGz9aRdIChg9dK9OzM5+Mrli50Wspad+Mz02d+N3vIiIk681sZTrzAVskPmWRKGbFzAAAA=",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05461-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05461-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05461-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05480",
      "width": 1600,
      "height": 2240,
      "blurDataURL": "data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAADQAwCdASoQABYAPu1mqk4ppaOiMAgBMB2JYwAAW+KrO07Rfm6z8fQA/tMKClhA9E1a/Md2+E1nckK6W3U7gcILbOG13dXnLxAfFh5Vmo+sBQZtr0T/6zjrxAC1PNfxhMnkjMy3fvCMhAAA",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05480-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05480-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05480-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05497",
      "width": 1600,
      "height": 2240,
      "blurDataURL": "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAABwBACdASoQABYAPu1iqk2ppaQiMAgBMB2JZQDCu/7AxOFZWf89MSgoDuWlAAD+w4joHS/2VPilUwekz9q44jgP1Nyw7/qW8ZEOopdR/dalsyC057JN8AAA",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05497-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05497-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05497-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05577",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAACwBACdASoQABgAPu1iqU2ppaOiMAgBMB2JZAC7MoMjiYZgS+roavlCBzlBdTz4AP7UIrPIH7iqKj06DnAdlwWK7DJQaZ1a8lhHMTOgbuMC+XgjXAYqZ6VJlnKamJAdnNq5NvDICXF9B2l7xeZ1X+ax2XY1CbZ1EaYu02+jzHTxZiDl1NIUBCp7zpxFZU6D0MEze0rFT3ce0XS52CKHEH2SGAAAAA==",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05577-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05577-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05577-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05592",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAADwAwCdASoQABgAPu1yrU+pp6QiMAgBMB2JbACdACHZ/b9xJpPc7A/6AP7eerzoE5839JnBNsneSAgnSY3I4DXeZZmjOJv8Eof+LKILZOLag8BDjAngqGhvSnq/r79Mw4kqhz3QGkHvVl4In2xp/ZA3JmvBwxgQ2IP7DvDGRXROOl6QAAA=",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05592-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05592-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05592-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05602_1",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRpIAAABXRUJQVlA4IIYAAAAwBACdASoQABgAPu1iqU2ppaQiMAgBMB2JbACdAGoV/yzypz+oVWLiHmQA/vlw8gNQYeSzOxUHsNYPVQxivkNxdRJYCieql7/hrZC4QT88besM4SrZxJGU3X0Dggl3THe6sopkNWfi+EAx3yTDnAhHe4QT6MsPJyTMcJL2+PuCx07KICAYAA==",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05602_1-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05602_1-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05602_1-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05615",
      "width": 1600,
      "height": 2240,
      "blurDataURL": "data:image/webp;base64,UklGRpIAAABXRUJQVlA4IIYAAAAwBACdASoQABYAPu1kqk4ppaQiMAgBMB2JbACdAGmj2pYHwqN11d2NFQAA/vsvzCPvfmOx0302mF+1p4yBbRuHvlwkCk/aD4O/NsZ5o9K7pEscCa/3glKGFmMRW6WTfrNNd+S7m1UAmSC3n61LJL9nJAnmdhEGHFqhFZzDGa3aJosvmAkAAA==",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05615-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05615-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05615-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05635",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRsYAAABXRUJQVlA4ILoAAACwBACdASoQABgAPu1kqU2ppaQiMAgBMB2JQBOmUAS1wv9TBxbdtyypwpaUe2sAAP7nHicE6p+Dh9wHLyCm6mfdkPvT4mZR3kKZhjmgii7rmvYeOCikqbm4wqS2e2Hh2b4/pqh9sITeex2iuentaAwK/3dZZKzJq2z17a9B7dDvh1ZaeF7ov9Pnd1A8trr3r4/GSZ5RCjV2/30AcWYN5tZSO9OyourKMVa8o3Yoqlogzt3wcMMDLt2E0AA=",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05635-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05635-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05635-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05696",
      "width": 1600,
      "height": 1143,
      "blurDataURL": "data:image/webp;base64,UklGRngAAABXRUJQVlA4IGwAAADwAQCdASoQAAsAA4BaJQBOgBuVmcd28IAA/vBB+cBYYqeFYosRHyBDKEHruvkPgKrvxX+cvbOYEBmCzRSC0JE69DODLRpipBuUM6X4f1m5vu8I7sB3TL/6hwCnYVu5QOT/QGWEQR99AFLAAAA=",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05696-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05696-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05696-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05813",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRnwAAABXRUJQVlA4IHAAAADQAwCdASoQABgAPu1iqU2ppaOiMAgBMB2JYwAAWoab386DcGZoNEAA/raiRV0ROcWzYTlJ3oe59UJ3SHRqsuFLYd8DI6HKFLBypzb1Be/s0Q/bhqgBUHKVKr5Tpsw0avFefWxIlqGehcJTrBoXrZAA",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05813-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05813-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05813-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05826",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAADwAwCdASoQABgAPu1iqU2ppaOiMAgBMB2JZQCo9CHf6oJZfjlu1hnAAP7efotsiu78jVXROeJQRxPiExCevf130Kw0tD9n5mLa58xCAJ8Qhqx2g63xJbhbMAdT7qID7FALgD8wAAA=",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05826-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05826-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05826-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05838",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAAAwBACdASoQABgAPu1iqU2ppaQiMAgBMB2JYwCdMoADTrBFZwhf9mr/XAAA/t5kBSAytD+gQQjs5XQpe3ur2guTwstqchXQsudEfEbNObTv1O/lTgWXyApATf9kq+lo15qle92cdODymcWWCYSbdMfsTUfVmx+rO7vMQE+79y+x5og0AAA=",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05838-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05838-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05838-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05902",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRqAAAABXRUJQVlA4IJQAAADQBACdASoQABgAPu1iqk4ppaQiMAgBMB2JZQCdMoAlsBf6gUMWT9DPJhViIQDQAAD+3lbGtguwKCRXhFBGvC3SEWlG07kxotcT0WnUN8g3mXC70/EHskWxBz1UduEPJwIYDb3qP5LEf0URON+MuYaW2nL4Ggq5R5dKLZJB0yqyizI+/eQS+XDSMp7GKIHJpNOLAAAA",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05902-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05902-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05902-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05926",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRqgAAABXRUJQVlA4IJwAAAAwBACdASoQABgAPu1iqU2ppaQiMAgBMB2JYwCdAYyA32lrxVPNbx8J46AA/t5kDll56gb7w6vQVHneLzDTDsAXehGxxWBqqvKUmLcXW5kVFgt6BEjCZp10dbYnpHDddUUTUusLsQ3cHlbK4Ja6ucfmzNPoIEpEm4iv42qQefT9nlQ0caWePQnZP1TcPN+KFKXMVugDJxZcRTEYQAA=",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05926-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05926-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05926-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05952",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRowAAABXRUJQVlA4IIAAAAAQBACdASoQABgAPu1iqk2ppaQiMAgBMB2JYwCdMoAlpxf6//dkILXs6AD+00TEPdj9CSfALTkJCo2h3XVgVMemZc3UvRZFLh89q0d7wF4HO6VlA9UQz3Ocb34i27eMBXwU/fAS6r4Zz/JPzrJghfDoAy+Et/fRhYio7wWTIkfIAA==",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05952-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05952-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05952-1600.webp"
        }
      ]
    },
    {
      "id": "DSC05995",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAACwAwCdASoQABgAPu1iqU2ppaOiMAgBMB2JYwC7ACHhbFEj4drzuAD+00+exB9A8qMNJ0bZHxp9XD1OgbRKuaeZjpdhqhXAzC1EGlbuBDRU7bPD7Z5VgCp9f8z6j1AA",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05995-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05995-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC05995-1600.webp"
        }
      ]
    },
    {
      "id": "DSC06013",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRqAAAABXRUJQVlA4IJQAAAAwBACdASoQABgAPu1iqU2ppaOiMAgBMB2JQBOmUFH/AWHVgqUMLFmn2GwA/tMBHFzjpL5AqBPfbn7UvCgoF1OhIpoqU2LxJ6f2N/bA80O9E2kBrpy2vbL927kdvYvzw3FsJllrbj0CfOh6nsEYp8M7KTd4BxvnA8azcAHct6h2O5pGM5e1zRehnDhmI42X8iQs/SAA",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC06013-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC06013-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC06013-1600.webp"
        }
      ]
    },
    {
      "id": "DSC06016",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRpwAAABXRUJQVlA4IJAAAABQBACdASoQABgAPu1iqU2ppaOiMAgBMB2JQBOmUABp1Eie2wWgH7bRRpQAAP7TQ0n6BETnmLZQ/bQiWz+ynBFkGx2NjOaZEAwEjGhw0KVVhBMLQIUEieShbOztUeziL2UdET54ZbwqWbp23fBv/TS/rzRTWKEfXYJS8pTLMaPPIVG954mAPTD8W21KZJZHIAA=",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC06016-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC06016-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC06016-1600.webp"
        }
      ]
    },
    {
      "id": "DSC06024",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRrQAAABXRUJQVlA4IKgAAACQBACdASoQABgAPu1iqU2ppaOiMAgBMB2JYwCdMoAlsxf7JIor91wF3PtBUgAA/t6qNH1rtPHoEPPq9juCJIdLygfJUrtnCD17guG9GjY6tiF1utMzFx00RMqcBAElWRXVBA/evxB8lvEZtZKG/9kSX4P4p+Z4qPrXFonrnlaywCr/BPhXrNpedmyi8YA8yrpTXW2oNpMfKRyK4oCFmSBOkuJvk/E7AAA=",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/DSC06024-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/DSC06024-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/DSC06024-1600.webp"
        }
      ]
    },
    {
      "id": "IMG_8286",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAAAQBACdASoQABgAPu1iqk2ppaQiMAgBMB2JYwCdACHfNas40WFFYCdGMAD+3mQE1pvc3N8Vq5cw3fU43WKLp9EmkJ3/XqgIjTk7hSNGNY5qNT4Slxwf/g+/MPB/R7GkegAAAA==",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/IMG_8286-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/IMG_8286-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/IMG_8286-1600.webp"
        }
      ]
    },
    {
      "id": "IMG_8287",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAQBACdASoQABgAPu1iqU2ppaQiMAgBMB2JYwCdACHfNdv5eWbCW+kcwAD+00SjAYBahc+myvkOQgcbRbM3K0QxLSuh7wvSIPsKISRWrneNjoYwXlihy/giYsc5yaP41Ts3AAAA",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/IMG_8287-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/IMG_8287-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/IMG_8287-1600.webp"
        }
      ]
    },
    {
      "id": "IMG_8288",
      "width": 1600,
      "height": 2400,
      "blurDataURL": "data:image/webp;base64,UklGRpwAAABXRUJQVlA4IJAAAAAQBACdASoQABgAPu1iqU2ppaOiMAgBMB2JZQCdACHfcWbpIK0FDCmnQAD+5wnej0sZ/iScziuBMGorH9D+aoqyBNnoeQtggYvatzIxGOwva+1OMHmNwFdghqMS2wPxIY1tIBfP94/q1frDNJqkG6OmqmLMP/3/P/zaSLctXfmMzK/HjNBRV8N/b8jBIcwUwAA=",
      "srcSet": [
        {
          "w": 400,
          "src": "/photos/sinh-nhat-1-tuoi/IMG_8288-400.webp"
        },
        {
          "w": 800,
          "src": "/photos/sinh-nhat-1-tuoi/IMG_8288-800.webp"
        },
        {
          "w": 1600,
          "src": "/photos/sinh-nhat-1-tuoi/IMG_8288-1600.webp"
        }
      ]
    }
  ]
};

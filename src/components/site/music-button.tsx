"use client";

import { Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { AudioLinesIcon } from "@/components/ui/audio-lines";
import { playHappyBirthday } from "@/lib/happy-birthday";

export function MusicButton() {
  const [playing, setPlaying] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  // Dừng nhạc khi rời trang, nếu không oscillator vẫn kêu sau khi component
  // đã unmount.
  useEffect(() => () => stopRef.current?.(), []);

  const toggle = async () => {
    if (playing) {
      stopRef.current?.();
      stopRef.current = null;
      setPlaying(false);
      return;
    }

    // AudioContext chỉ được tạo trong một cử chỉ của người dùng, nếu không
    // trình duyệt tự treo nó ở trạng thái suspended.
    contextRef.current ??= new AudioContext();
    if (contextRef.current.state === "suspended") await contextRef.current.resume();

    setPlaying(true);
    stopRef.current = playHappyBirthday(contextRef.current, () => {
      stopRef.current = null;
      setPlaying(false);
    });
  };

  return (
    <Button
      size="lg"
      onClick={toggle}
      aria-label={playing ? "Dừng nhạc" : "Phát nhạc Happy Birthday"}
      aria-pressed={playing}
      className="fixed right-4 bottom-4 z-50 size-12 rounded-full p-0 shadow-lg md:right-6 md:bottom-6"
    >
      {playing ? <Square className="fill-current" /> : <AudioLinesIcon size={20} />}
    </Button>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { songs } from "@/lib/songs";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export default function MusicPlayer() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [logoutError, setLogoutError] = useState("");
  const currentSong = songs[currentSongIndex];

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  function playSong(index: number) {
    const nextSongIndex = (index + songs.length) % songs.length;
    const audio = audioRef.current;
    setCurrentSongIndex(nextSongIndex);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);

    if (!audio) return;
    audio.src = songs[nextSongIndex].audio;
    audio.load();
    void audio.play().catch(() => {
      setIsPlaying(false);
      setIsLoading(false);
    });
  }

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      setIsLoading(true);
      void audio.play().catch(() => {
        setIsPlaying(false);
        setIsLoading(false);
      });
    } else {
      audio.pause();
    }
  }

  function handleSeek(value: number) {
    setCurrentTime(value);
    if (audioRef.current) audioRef.current.currentTime = value;
  }

  async function handleLogout() {
    setLogoutError("");
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      audioRef.current?.pause();
      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError("No se pudo cerrar sesión. Inténtalo de nuevo.");
    }
  }

  return (
    <main className="min-h-screen bg-[#111713] text-[#f2f0e8]">
      <div className="mx-auto w-full max-w-6xl px-5 pb-12 pt-6 sm:px-8 sm:pt-8">
        <header className="mb-9 flex items-center justify-between border-b border-white/10 pb-5">
          <a className="flex items-center gap-3" href="/player" aria-label="Frecuencia, reproductor">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#b8e36b] text-xl text-[#172018]" aria-hidden="true">♫</span>
            <span className="text-sm font-semibold uppercase tracking-[0.2em]">Frecuencia</span>
          </a>
          <div className="flex items-center gap-4">
            {logoutError && <span className="hidden text-sm text-[#ff9e8c] sm:block" role="alert">{logoutError}</span>}
            <button
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-[#d8ded7] transition hover:border-[#b8e36b] hover:text-white"
              onClick={handleLogout}
              type="button"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-16">
          <section aria-label="Reproductor" className="mx-auto w-full max-w-xl lg:mx-0">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#27332a] shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
              <Image
                alt={`Portada de ${currentSong.title}`}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                src={currentSong.cover}
              />
            </div>

            <div className="mt-7 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8e36b]">Reproduciendo ahora</p>
                <h1 className="truncate text-2xl font-semibold sm:text-3xl">{currentSong.title}</h1>
                <p className="mt-1 text-base text-[#a9b1aa]">{currentSong.artist}</p>
              </div>
              <span className="shrink-0 pb-1 text-sm tabular-nums text-[#a9b1aa]">{currentSongIndex + 1} / {songs.length}</span>
            </div>

            <audio
              ref={audioRef}
              onCanPlay={() => setIsLoading(false)}
              onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
              onEnded={() => playSong((currentSongIndex + 1) % songs.length)}
              onLoadStart={() => setIsLoading(true)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
              preload="metadata"
              src={currentSong.audio}
            />

            <div className="mt-7">
              <input
                aria-label="Progreso de la canción"
                className="h-1.5 w-full cursor-pointer accent-[#b8e36b]"
                max={duration || 0}
                min={0}
                onChange={(event) => handleSeek(event.currentTarget.valueAsNumber)}
                step={0.1}
                type="range"
                value={Math.min(currentTime, duration || 0)}
              />
              <div className="mt-2 flex justify-between text-xs tabular-nums text-[#8d9990]">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-7">
              <button
                aria-label="Canción anterior"
                className="flex size-12 items-center justify-center rounded-full text-2xl text-[#c7d0c8] transition hover:bg-white/10 hover:text-white"
                onClick={() => playSong(currentSongIndex - 1)}
                title="Canción anterior"
                type="button"
              >
                |◀
              </button>
              <button
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
                className="flex size-16 items-center justify-center rounded-full bg-[#b8e36b] text-2xl text-[#172018] shadow-lg shadow-[#b8e36b]/10 transition hover:scale-105 hover:bg-[#caef86]"
                onClick={togglePlayback}
                type="button"
              >
                {isPlaying ? "Ⅱ" : "▶"}
              </button>
              <button
                aria-label="Siguiente canción"
                className="flex size-12 items-center justify-center rounded-full text-2xl text-[#c7d0c8] transition hover:bg-white/10 hover:text-white"
                onClick={() => playSong(currentSongIndex + 1)}
                title="Siguiente canción"
                type="button"
              >
                ▶|
              </button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3 text-[#a9b1aa]">
              <span aria-hidden="true" className="text-sm">−</span>
              <input
                aria-label="Volumen"
                className="h-1 w-28 cursor-pointer accent-[#b8e36b]"
                max={1}
                min={0}
                onChange={(event) => setVolume(event.currentTarget.valueAsNumber)}
                step={0.01}
                type="range"
                value={volume}
              />
              <span aria-hidden="true" className="text-sm">+</span>
              {isLoading && <span className="ml-3 text-xs" role="status">Cargando audio…</span>}
            </div>
          </section>

          <section aria-label="Lista de canciones" className="pt-1">
            <div className="mb-5 flex items-end justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8e36b]">Tu selección</p>
                <h2 className="mt-2 text-xl font-semibold">Todas las canciones</h2>
              </div>
              <span className="text-sm text-[#8d9990]">{songs.length} pistas</span>
            </div>
            <ol className="divide-y divide-white/8">
              {songs.map((song, index) => {
                const isCurrent = index === currentSongIndex;
                return (
                  <li key={song.id}>
                    <button
                      aria-current={isCurrent ? "true" : undefined}
                      className={`flex min-h-20 w-full items-center gap-4 px-2 py-3 text-left transition hover:bg-white/4 ${isCurrent ? "text-[#c9ee8b]" : "text-[#e5e9e3]"}`}
                      onClick={() => playSong(index)}
                      type="button"
                    >
                      <span className="w-6 shrink-0 text-center text-sm tabular-nums text-[#8d9990]">
                        {isCurrent && isPlaying ? "♫" : String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-[#27332a]">
                        <Image alt="" className="object-cover" fill sizes="48px" src={song.cover} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{song.title}</span>
                        <span className="mt-1 block truncate text-sm text-[#929d94]">{song.artist}</span>
                      </span>
                      <span aria-hidden="true" className="text-sm text-[#8d9990]">{isCurrent ? "●" : ""}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>
    </main>
  );
}
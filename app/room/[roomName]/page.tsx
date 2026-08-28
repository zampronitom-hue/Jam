"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const roomName = String(params.roomName || "").toUpperCase();
  const userName = searchParams.get("name") || "Visitante";

  const [micOn, setMicOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isSharing) return;
    if (!streamRef.current) return;
    if (!videoRef.current) return;

    videoRef.current.srcObject = streamRef.current;

    videoRef.current
      .play()
      .catch((error) => console.log("Erro ao iniciar preview:", error));
  }, [isSharing]);

  async function startScreenShare() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30,
        },
        audio: true,
      });

      streamRef.current = stream;

      setIsSharing(true);

      const videoTrack = stream.getVideoTracks()[0];

      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }
    } catch (error) {
      console.log("Compartilhamento cancelado ou falhou:", error);
    }
  }

  function stopScreenShare() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsSharing(false);
  }

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link da sala copiado!");
    } catch {
      alert("Não foi possível copiar o link.");
    }
  }

  return (
    <main className="min-h-screen bg-[#030706] text-white p-4 md:p-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-white/10 bg-[#07100f] shadow-2xl">

        {/* Barra superior da janela */}
        <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
        </div>

        <div className="relative min-h-[850px] p-6 md:p-10">
          {/* Glow de fundo */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,255,150,0.07),transparent_55%)]" />

          <div className="relative">

            {/* HEADER */}
            <header className="mb-10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                  <div className="flex h-5 items-end gap-[3px]">
                    <span className="h-2 w-[3px] rounded-full bg-lime-400" />
                    <span className="h-4 w-[3px] rounded-full bg-emerald-400" />
                    <span className="h-5 w-[3px] rounded-full bg-cyan-400" />
                    <span className="h-3 w-[3px] rounded-full bg-emerald-400" />
                    <span className="h-2 w-[3px] rounded-full bg-lime-400" />
                  </div>
                </div>

                <span className="bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-4xl font-black text-transparent">
                  JAM
                </span>
              </div>

              <div className="text-center">
                <p className="text-sm text-white/40">
                  Sala
                </p>

                <h2 className="bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-4xl font-black tracking-wider text-transparent">
                  {roomName}
                </h2>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/5 px-4 py-2 text-sm text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,1)]" />
                ONLINE
              </div>
            </header>

            {/* ÁREA DE COMPARTILHAMENTO */}
            <section className="mx-auto max-w-5xl rounded-[26px] border border-white/10 bg-black/20 p-5 md:p-8">

              {!isSharing ? (
                <div className="flex min-h-[430px] flex-col items-center justify-center text-center">

                  <div className="mb-8 flex h-32 w-48 items-center justify-center rounded-2xl border-2 border-emerald-400/60 bg-emerald-400/5 shadow-[0_0_35px_rgba(52,211,153,0.12)]">
                    <div className="text-6xl text-emerald-400">
                      ↑
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold">
                    Nada sendo compartilhado
                  </h3>

                  <p className="mt-3 text-white/40">
                    Compartilhe sua tela para que todos na sala possam ver.
                  </p>

                  <button
                    onClick={startScreenShare}
                    className="mt-8 w-full max-w-md rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-400 px-8 py-5 text-lg font-black text-black shadow-[0_0_35px_rgba(52,211,153,0.25)] transition hover:scale-[1.02]"
                  >
                    ▣ COMPARTILHAR TELA
                  </button>

                  <button
                    onClick={() => setMicOn(!micOn)}
                    className="mt-5 text-sm text-white/50"
                  >
                    🎤 Microfone:{" "}
                    <span
                      className={
                        micOn ? "text-green-400" : "text-red-400"
                      }
                    >
                      {micOn ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>
              ) : (
                <div>
                  <div className="overflow-hidden rounded-2xl border border-emerald-400/40 bg-black shadow-[0_0_25px_rgba(16,185,129,0.08)]">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="aspect-video w-full bg-black object-contain"
                    />
                  </div>

                  <div className="mt-5 text-center">
                    <span className="font-semibold text-lime-400">
                      {userName}
                    </span>

                    <span className="text-white/50">
                      {" "}está compartilhando
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* PARTICIPANTES */}
            <section className="mx-auto mt-7 max-w-5xl rounded-[24px] border border-white/10 bg-white/[0.025] p-5">

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-emerald-400">
                    ●
                  </span>

                  <span className="ml-2 font-semibold">
                    Participantes
                  </span>
                </div>

                <span className="text-sm text-white/40">
                  <span className="text-cyan-400">
                    1
                  </span>{" "}
                  / 6 participantes
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-lime-400/40 text-lime-400">
                    ♪
                  </div>

                  <div>
                    <p>{userName}</p>

                    <p className="text-xs text-white/30">
                      Você
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={
                      micOn ? "text-green-400" : "text-red-400"
                    }
                  >
                    {micOn ? "🎤" : "🔇"}
                  </span>

                  <span className="h-2 w-2 rounded-full bg-green-400" />
                </div>

              </div>
            </section>

            {/* CONTROLES */}
            <div className="mx-auto mt-7 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-4">

              <button
                onClick={() => setMicOn(!micOn)}
                className={`rounded-2xl border px-5 py-4 font-semibold transition ${
                  micOn
                    ? "border-green-400/30 text-green-400 hover:bg-green-400/5"
                    : "border-red-400/30 text-red-400 hover:bg-red-400/5"
                }`}
              >
                {micOn ? "🎤 MUTE" : "🔇 ATIVAR MIC"}
              </button>

              {!isSharing ? (
                <button
                  onClick={startScreenShare}
                  className="rounded-2xl border border-cyan-400/30 px-5 py-4 font-semibold text-cyan-400 transition hover:bg-cyan-400/5"
                >
                  ▣ TELA
                </button>
              ) : (
                <button
                  onClick={stopScreenShare}
                  className="rounded-2xl border border-red-400/30 px-5 py-4 font-semibold text-red-400 transition hover:bg-red-400/5"
                >
                  ■ PARAR TELA
                </button>
              )}

              <button
                onClick={copyInvite}
                className="rounded-2xl border border-cyan-400/30 px-5 py-4 font-semibold text-cyan-400 transition hover:bg-cyan-400/5"
              >
                🔗 CONVIDAR
              </button>

              <button
                className="rounded-2xl border border-white/10 px-5 py-4 font-semibold text-white/60 transition hover:bg-white/5"
              >
                ⚙ CONFIG
              </button>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
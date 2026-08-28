"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useLocalParticipant,
  useParticipants,
  useTracks,
} from "@livekit/components-react";

import { Track } from "livekit-client";

type TokenResponse = {
  token: string;
  serverUrl: string;
};

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const roomName = String(params.roomName || "").toUpperCase();
  const participantName = searchParams.get("name") || "Visitante";

  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function connectToRoom() {
      try {
        setLoading(true);

        const response = await fetch("/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName,
            participantName,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao conectar ao LiveKit.");
        }

        setTokenData(data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível conectar à sala."
        );
      } finally {
        setLoading(false);
      }
    }

    if (roomName) {
      connectToRoom();
    }
  }, [roomName, participantName]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030706] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-black text-lime-400">JAM</h1>

          <p className="mt-5 text-white/50">
            Conectando à sala {roomName}...
          </p>
        </div>
      </main>
    );
  }

  if (error || !tokenData) {
    return (
      <main className="min-h-screen bg-[#030706] text-white flex items-center justify-center p-6">
        <div className="max-w-lg rounded-3xl border border-red-400/20 bg-red-400/5 p-8 text-center">
          <h1 className="text-4xl font-black text-red-400">
            Não foi possível conectar
          </h1>

          <p className="mt-4 text-white/60">
            {error || "Token do LiveKit não disponível."}
          </p>

          <a
            href="/"
            className="mt-8 inline-block rounded-xl border border-white/20 px-6 py-3"
          >
            Voltar
          </a>
        </div>
      </main>
    );
  }

  return (
    <LiveKitRoom
      token={tokenData.token}
      serverUrl={tokenData.serverUrl}
      connect={true}
      audio={true}
      video={false}
      data-lk-theme="default"
      className="min-h-screen"
      onDisconnected={() => {
        console.log("Desconectado da sala.");
      }}
    >
      <JamRoom
        roomName={roomName}
        participantName={participantName}
      />

      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function JamRoom({
  roomName,
  participantName,
}: {
  roomName: string;
  participantName: string;
}) {
  const participants = useParticipants();

  const { localParticipant } = useLocalParticipant();

  const screenTracks = useTracks(
    [Track.Source.ScreenShare],
    {
      onlySubscribed: false,
    }
  );

  const [micOn, setMicOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [message, setMessage] = useState("");

  const activeScreenTrack =
    screenTracks.length > 0 ? screenTracks[0] : undefined;

  useEffect(() => {
    setMicOn(localParticipant.isMicrophoneEnabled);
    setIsSharing(localParticipant.isScreenShareEnabled);
  }, [
    localParticipant,
    localParticipant.isMicrophoneEnabled,
    localParticipant.isScreenShareEnabled,
  ]);

  async function toggleMicrophone() {
    try {
      const nextState = !localParticipant.isMicrophoneEnabled;

      await localParticipant.setMicrophoneEnabled(nextState);

      setMicOn(nextState);
    } catch (error) {
      console.error("Erro no microfone:", error);

      setMessage("Não foi possível acessar o microfone.");
    }
  }

  async function startScreenShare() {
    try {
      setMessage("");

      await localParticipant.setScreenShareEnabled(true, {
        audio: true,
      });

      setIsSharing(true);
    } catch (error) {
      console.error("Erro ao compartilhar tela:", error);

      setMessage(
        "Compartilhamento cancelado ou não permitido pelo navegador."
      );
    }
  }

  async function stopScreenShare() {
    try {
      await localParticipant.setScreenShareEnabled(false);

      setIsSharing(false);
    } catch (error) {
      console.error("Erro ao parar compartilhamento:", error);
    }
  }

  async function copyInvite() {
    try {
      const inviteUrl =
        `${window.location.origin}/room/${roomName}`;

      await navigator.clipboard.writeText(inviteUrl);

      setMessage("Link copiado! Envie para seu amigo.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch {
      setMessage("Não foi possível copiar o link.");
    }
  }

  return (
    <main className="min-h-screen bg-[#030706] text-white p-4 md:p-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-white/10 bg-[#07100f] shadow-2xl">

        {/* Barra da janela */}

        <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
        </div>

        <div className="relative min-h-[850px] p-6 md:p-10">

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,255,150,0.07),transparent_55%)]" />

          <div className="relative">

            {/* HEADER */}

            <header className="mb-8 flex flex-wrap items-center justify-between gap-5">

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

              <div className="flex items-center gap-4">

                <div className="flex items-center gap-2 text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,1)]" />

                  LIVE
                </div>

                <div className="h-6 w-px bg-white/10" />

                <div>
                  <span className="text-white/40">
                    Sala{" "}
                  </span>

                  <span className="font-bold text-cyan-400">
                    {roomName}
                  </span>
                </div>

              </div>

              <div className="text-white/50">
                👤{" "}
                <span className="text-white">
                  {participants.length}
                </span>{" "}
                / 6
              </div>

            </header>

            {/* MENSAGEM */}

            {message && (
              <div className="mx-auto mb-5 max-w-5xl rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-center text-sm text-cyan-300">
                {message}
              </div>
            )}

            {/* TELA COMPARTILHADA */}

            <section className="mx-auto max-w-5xl rounded-[26px] border border-white/10 bg-black/20 p-4 md:p-6">

              {activeScreenTrack ? (
                <div>

                  <div className="overflow-hidden rounded-2xl border border-emerald-400/40 bg-black">

                    <VideoTrack
                      trackRef={activeScreenTrack}
                      className="aspect-video w-full bg-black object-contain"
                    />

                  </div>

                  <p className="mt-5 text-center text-white/50">

                    <span className="font-semibold text-lime-400">
                      {activeScreenTrack.participant.name ||
                        activeScreenTrack.participant.identity}
                    </span>

                    {" "}está compartilhando

                  </p>

                </div>
              ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">

                  <div className="mb-7 flex h-32 w-48 items-center justify-center rounded-2xl border-2 border-emerald-400/50 bg-emerald-400/5 shadow-[0_0_35px_rgba(52,211,153,0.10)]">

                    <span className="text-6xl text-emerald-400">
                      ↑
                    </span>

                  </div>

                  <h2 className="text-2xl font-semibold">
                    Nada sendo compartilhado
                  </h2>

                  <p className="mt-3 text-white/40">
                    Compartilhe seu Ableton para todos na sala.
                  </p>

                  <button
                    onClick={startScreenShare}
                    className="mt-8 w-full max-w-md rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-400 px-8 py-5 text-lg font-black text-black shadow-[0_0_35px_rgba(52,211,153,0.25)] transition hover:scale-[1.02]"
                  >
                    ▣ COMPARTILHAR TELA
                  </button>

                </div>
              )}

            </section>

            {/* PARTICIPANTES */}

            <section className="mx-auto mt-6 max-w-5xl rounded-[24px] border border-white/10 bg-white/[0.025] p-5">

              <div className="mb-4 flex items-center justify-between">

                <span className="font-semibold">
                  ♫ Participantes
                </span>

                <span className="text-sm text-white/40">
                  <span className="text-cyan-400">
                    {participants.length}
                  </span>{" "}
                  / 6 participantes
                </span>

              </div>

              <div className="space-y-2">

                {participants.map((participant) => {

                  const isLocal =
                    participant.identity ===
                    localParticipant.identity;

                  const microphoneOn =
                    participant.isMicrophoneEnabled;

                  return (
                    <div
                      key={participant.identity}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-lime-400/40 text-lime-400">
                          ♪
                        </div>

                        <div>

                          <p>
                            {participant.name ||
                              participant.identity}
                          </p>

                          <p className="text-xs text-white/30">
                            {isLocal ? "Você" : "Conectado"}
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-3">

                        <span>
                          {microphoneOn ? "🎤" : "🔇"}
                        </span>

                        <span className="h-2 w-2 rounded-full bg-green-400" />

                      </div>

                    </div>
                  );
                })}

              </div>

            </section>

            {/* CONTROLES */}

            <div className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-4">

              <button
                onClick={toggleMicrophone}
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

            <p className="mt-6 text-center text-xs text-white/20">
              Conectado como {participantName}
            </p>

          </div>
        </div>

      </div>
    </main>
  );
}
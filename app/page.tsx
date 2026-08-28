"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("Tom");
  const [roomCode, setRoomCode] = useState("");

  function createRoom() {
    const code = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();

    window.location.href = `/room/${code}?name=${encodeURIComponent(name)}`;
  }

  function joinRoom() {
    if (!roomCode.trim()) return;

    window.location.href = `/room/${roomCode
      .trim()
      .toUpperCase()}?name=${encodeURIComponent(name)}`;
  }

  return (
    <main className="min-h-screen bg-[#050807] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl rounded-[32px] border border-white/10 bg-[#07100f] shadow-2xl overflow-hidden">
        {/* Barra superior estilo janela */}
        <div className="flex gap-2 px-6 py-5 border-b border-white/10">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>

        <section className="relative px-8 py-16 md:px-20 md:py-20">
          {/* Glow de fundo */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,255,150,0.08),transparent_50%)] pointer-events-none" />

          <div className="relative mx-auto max-w-xl">
            {/* Logo */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.25)]">
                  <div className="flex items-end gap-1 h-7">
                    <span className="w-1 h-3 bg-lime-400 rounded-full" />
                    <span className="w-1 h-6 bg-emerald-400 rounded-full" />
                    <span className="w-1 h-7 bg-cyan-400 rounded-full" />
                    <span className="w-1 h-5 bg-emerald-400 rounded-full" />
                    <span className="w-1 h-3 bg-lime-400 rounded-full" />
                  </div>
                </div>

                <h1 className="text-6xl font-black tracking-tight bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  JAM
                </h1>
              </div>

              <p className="mt-4 text-lg text-white/50">
                studio sessions em tempo real
              </p>
            </div>

            {/* Formulário */}
            <div className="space-y-7">
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Seu nome
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-lg outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/10"
                  placeholder="Seu nome"
                />
              </div>

              <button
                onClick={createRoom}
                className="w-full rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-400 py-5 text-lg font-bold text-black shadow-[0_0_35px_rgba(52,211,153,0.25)] transition hover:scale-[1.01]"
              >
                + CRIAR SALA
              </button>

              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-white/40">ou</span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Código da sala
                </label>

                <input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      joinRoom();
                    }
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-lg uppercase tracking-[0.25em] outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                  placeholder="8K3F"
                  maxLength={8}
                />
              </div>

              <button
                onClick={joinRoom}
                className="w-full rounded-2xl border border-cyan-400/60 bg-cyan-400/5 py-5 text-lg font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
              >
                ENTRAR NA SALA →
              </button>
            </div>

            {/* Rodapé */}
            <div className="mt-10 text-center text-sm text-white/40">
              ⚡ Compartilhe seu Ableton em 1 clique
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
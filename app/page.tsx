"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
  }

  function validateName() {
    const cleanName = name.trim();

    if (!cleanName) {
      alert("Escreva seu nome para continuar.");
      return null;
    }

    return cleanName;
  }

  function createRoom() {
    const cleanName = validateName();

    if (!cleanName) {
      return;
    }

    const newRoom = generateRoomCode();

    router.push(
      `/room/${newRoom}?name=${encodeURIComponent(cleanName)}`
    );
  }

  function enterRoom() {
    const cleanName = validateName();

    if (!cleanName) {
      return;
    }

    const cleanRoom = roomCode.trim().toUpperCase();

    if (!cleanRoom) {
      alert("Digite o código da sala.");
      return;
    }

    router.push(
      `/room/${cleanRoom}?name=${encodeURIComponent(cleanName)}`
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020706] px-5 py-10 text-white">

      {/* FUNDO */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/[0.045] blur-[120px]" />

        <div className="absolute bottom-[-150px] left-[-100px] h-[400px] w-[400px] rounded-full bg-lime-400/[0.025] blur-[100px]" />

        <div className="absolute right-[-100px] top-[-100px] h-[400px] w-[400px] rounded-full bg-cyan-400/[0.025] blur-[100px]" />
      </div>

      {/* CARD */}

      <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/10 bg-[#07100f]/95 shadow-2xl">

        {/* BARRA SUPERIOR */}

        <div className="flex items-center gap-2 border-b border-white/[0.07] px-6 py-4">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
        </div>

        <div className="p-7 md:p-10">

          {/* LOGO */}

          <div className="flex flex-col items-center text-center">

            <div className="flex items-center gap-3">

              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.18)]">

                <div className="flex h-6 items-end gap-[3px]">
                  <span className="h-2 w-[3px] rounded-full bg-lime-400" />
                  <span className="h-4 w-[3px] rounded-full bg-emerald-400" />
                  <span className="h-6 w-[3px] rounded-full bg-cyan-400" />
                  <span className="h-3 w-[3px] rounded-full bg-emerald-400" />
                  <span className="h-2 w-[3px] rounded-full bg-lime-400" />
                </div>

              </div>

              <h1 className="bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 bg-clip-text text-5xl font-black tracking-tight text-transparent">
                JAM
              </h1>

            </div>

            <p className="mt-3 text-sm text-white/35">
              studio sessions em tempo real
            </p>

          </div>

          {/* FORMULÁRIO */}

          <div className="mt-9">

            {/* NOME */}

            <div>
              <label className="mb-2 block text-xs font-medium text-white/45">
                Seu nome
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    createRoom();
                  }
                }}
                placeholder="escreva seu nome aqui"
                autoComplete="off"
                className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/40 focus:bg-emerald-400/[0.025]"
              />
            </div>

            {/* CRIAR */}

            <button
              type="button"
              onClick={createRoom}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-lime-400 to-emerald-400 px-5 py-4 font-black text-black shadow-[0_0_35px_rgba(70,255,150,0.15)] transition hover:scale-[1.01]"
            >
              + CRIAR SALA
            </button>

            {/* DIVISOR */}

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />

              <span className="text-xs text-white/25">
                OU
              </span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* CÓDIGO */}

            <div>
              <label className="mb-2 block text-xs font-medium text-white/45">
                Código da sala
              </label>

              <input
                type="text"
                value={roomCode}
                onChange={(event) =>
                  setRoomCode(event.target.value.toUpperCase())
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    enterRoom();
                  }
                }}
                placeholder="Ex: 8K3F"
                maxLength={8}
                autoComplete="off"
                className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-4 uppercase text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/40"
              />
            </div>

            <button
              type="button"
              onClick={enterRoom}
              className="mt-4 w-full rounded-xl border border-cyan-400/30 px-5 py-4 font-bold text-cyan-400 transition hover:bg-cyan-400/5"
            >
              ENTRAR NA SALA →
            </button>

          </div>

          {/* FRASE */}

          <div className="mt-8 text-center">
            <p className="bg-gradient-to-r from-lime-300 via-emerald-300 to-cyan-300 bg-clip-text text-sm font-semibold tracking-wide text-transparent">
              Colocando o Papo e Feedback em dia
            </p>
          </div>

          {/* DAIMON LABS */}

          <div className="mt-5 flex justify-center">
            <div className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">

              <p className="text-[9px] font-medium tracking-[0.12em] text-white/20">
                DAIMON LABS · CREATE BY ITALO ZAMPRONI
              </p>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
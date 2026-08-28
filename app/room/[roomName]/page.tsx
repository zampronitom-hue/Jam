"use client";

import { useEffect, useRef, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  AudioTrack,
  LiveKitRoom,
  VideoTrack,
  useConnectionState,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";

import {
  ConnectionState,
  Track,
} from "livekit-client";

type TokenResponse = {
  token: string;
  serverUrl: string;
};

const AUDIO_PREFS_KEY = "jam-audio-preferences";

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const roomName = String(
    params.roomName || ""
  ).toUpperCase();

  const participantName =
    searchParams.get("name") || "Visitante";

  const [tokenData, setTokenData] =
    useState<TokenResponse | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function connectToRoom() {
      try {
        setLoading(true);
        setError("");

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
          throw new Error(
            data.error ||
              "Erro ao conectar ao LiveKit."
          );
        }

        setTokenData(data);
      } catch (err) {
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
      <main className="flex min-h-screen items-center justify-center bg-[#030706] text-white">
        <div className="text-center">
          <h1 className="text-5xl font-black text-lime-400">
            JAM
          </h1>

          <p className="mt-5 text-white/50">
            Conectando à sala {roomName}...
          </p>
        </div>
      </main>
    );
  }

  if (error || !tokenData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030706] p-6 text-white">
        <div className="max-w-lg rounded-3xl border border-red-400/20 bg-red-400/5 p-8 text-center">

          <h1 className="text-3xl font-black text-red-400">
            Não foi possível conectar
          </h1>

          <p className="mt-4 text-white/60">
            {error || "Token indisponível."}
          </p>

          <a
            href="/"
            className="mt-8 inline-block rounded-xl border border-white/20 px-6 py-3"
          >
            Voltar ao menu
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
      audio={false}
      video={false}
      className="min-h-screen"
    >
      <JamRoom
        roomName={roomName}
        participantName={participantName}
      />
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
  const router = useRouter();

  const room = useRoomContext();

  const connectionState =
    useConnectionState(room);

  const isConnected =
    connectionState ===
    ConnectionState.Connected;

  const participants =
    useParticipants();

  const {
    localParticipant,
  } = useLocalParticipant();

  const screenTracks = useTracks(
    [Track.Source.ScreenShare],
    {
      onlySubscribed: false,
    }
  );

  const microphoneTracks = useTracks(
    [Track.Source.Microphone],
    {
      onlySubscribed: true,
    }
  );

  const screenAudioTracks = useTracks(
    [Track.Source.ScreenShareAudio],
    {
      onlySubscribed: true,
    }
  );

  /*
   * ESTADOS
   */

  const [micOn, setMicOn] =
    useState(false);

  const [
    isSharing,
    setIsSharing,
  ] = useState(false);

  const [
    shiuuu,
    setShiuuu,
  ] = useState(false);

  const [
    configOpen,
    setConfigOpen,
  ] = useState(false);

  /*
   * CONFIGURAÇÕES DE ÁUDIO
   */

  const [
    noiseSuppression,
    setNoiseSuppression,
  ] = useState(true);

  const [
    echoCancellation,
    setEchoCancellation,
  ] = useState(false);

  const [
    autoGainControl,
    setAutoGainControl,
  ] = useState(false);

  const [
    sensitivity,
    setSensitivity,
  ] = useState(-45);

  /*
   * PUSH TO TALK
   */

  const [
    pushToTalk,
    setPushToTalk,
  ] = useState(false);

  const [
    pushToTalkActive,
    setPushToTalkActive,
  ] = useState(false);

  /*
   * MEDIDOR
   */

  const [
    micLevel,
    setMicLevel,
  ] = useState(-60);

  const [
    isSpeaking,
    setIsSpeaking,
  ] = useState(false);

  const [
    monitoring,
    setMonitoring,
  ] = useState(false);

  const [
    preferencesLoaded,
    setPreferencesLoaded,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const audioContextRef =
    useRef<AudioContext | null>(
      null
    );

  const animationRef =
    useRef<number | null>(
      null
    );

  const monitorTrackRef =
    useRef<MediaStreamTrack | null>(
      null
    );

  const sensitivityRef =
    useRef(sensitivity);

  /*
   * CARREGAR PREFERÊNCIAS
   */

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          AUDIO_PREFS_KEY
        );

      if (saved) {
        const prefs =
          JSON.parse(saved);

        if (
          typeof prefs.noiseSuppression ===
          "boolean"
        ) {
          setNoiseSuppression(
            prefs.noiseSuppression
          );
        }

        if (
          typeof prefs.echoCancellation ===
          "boolean"
        ) {
          setEchoCancellation(
            prefs.echoCancellation
          );
        }

        if (
          typeof prefs.autoGainControl ===
          "boolean"
        ) {
          setAutoGainControl(
            prefs.autoGainControl
          );
        }

        if (
          typeof prefs.sensitivity ===
          "number"
        ) {
          setSensitivity(
            Math.max(
              -60,
              Math.min(
                -25,
                prefs.sensitivity
              )
            )
          );
        }

        if (
          typeof prefs.pushToTalk ===
          "boolean"
        ) {
          setPushToTalk(
            prefs.pushToTalk
          );
        }

        if (
          typeof prefs.shiuuu ===
          "boolean"
        ) {
          setShiuuu(
            prefs.shiuuu
          );
        }
      }
    } catch (error) {
      console.error(
        "Erro ao carregar preferências:",
        error
      );
    } finally {
      setPreferencesLoaded(true);
    }
  }, []);

  /*
   * SALVAR PREFERÊNCIAS
   */

  useEffect(() => {
    if (!preferencesLoaded) {
      return;
    }

    const preferences = {
      noiseSuppression,
      echoCancellation,
      autoGainControl,
      sensitivity,
      pushToTalk,
      shiuuu,
    };

    try {
      window.localStorage.setItem(
        AUDIO_PREFS_KEY,
        JSON.stringify(
          preferences
        )
      );
    } catch (error) {
      console.error(
        "Erro ao salvar preferências:",
        error
      );
    }
  }, [
    preferencesLoaded,
    noiseSuppression,
    echoCancellation,
    autoGainControl,
    sensitivity,
    pushToTalk,
    shiuuu,
  ]);

  /*
   * SENSIBILIDADE EM TEMPO REAL
   */

  useEffect(() => {
    sensitivityRef.current =
      sensitivity;
  }, [sensitivity]);

  /*
   * SINCRONIZA LIVEKIT
   */

  useEffect(() => {
    if (!pushToTalk) {
      setMicOn(
        localParticipant
          .isMicrophoneEnabled
      );
    }

    setIsSharing(
      localParticipant
        .isScreenShareEnabled
    );
  }, [
    localParticipant,
    localParticipant
      .isMicrophoneEnabled,
    localParticipant
      .isScreenShareEnabled,
    pushToTalk,
  ]);

  /*
   * LIMPEZA
   */

  useEffect(() => {
    return () => {
      stopMicMonitor();
    };
  }, []);

  const activeScreenTrack =
    screenTracks.length > 0
      ? screenTracks[0]
      : undefined;

  const someoneElseSharing =
    screenTracks.some(
      (track) =>
        track.participant
          .identity !==
        localParticipant.identity
    );

  /*
   * OPÇÕES DO MICROFONE
   */

  function getMicOptions() {
    return {
      noiseSuppression,
      echoCancellation,
      autoGainControl,
      latency: 0,
      channelCount: 1,
    };
  }

  function canPublishMedia() {
    if (!isConnected) {
      setMessage(
        connectionState ===
          ConnectionState.Reconnecting
          ? "Reconectando ao servidor..."
          : "Conectando ao servidor..."
      );

      return false;
    }

    return true;
  }

  function getLocalMicTrack() {
    return localParticipant
      .getTrackPublication(
        Track.Source.Microphone
      )
      ?.track;
  }

  /*
   * MICROFONE NORMAL
   */

  async function toggleMicrophone() {
    if (pushToTalk) {
      setMessage(
        "Aperte para Falar está ativo. Segure ESPAÇO para falar."
      );

      return;
    }

    if (!canPublishMedia()) {
      return;
    }

    try {
      setMessage("");

      if (
        localParticipant
          .isMicrophoneEnabled
      ) {
        stopMicMonitor();

        await localParticipant
          .setMicrophoneEnabled(
            false
          );

        setMicOn(false);
      } else {
        await localParticipant
          .setMicrophoneEnabled(
            true,
            getMicOptions()
          );

        setMicOn(true);
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Não foi possível alterar o microfone."
      );
    }
  }

  /*
   * PUSH TO TALK
   */

  async function setPushToTalkMode(
    enabled: boolean
  ) {
    if (!isConnected) {
      setMessage(
        "Aguarde a sala ficar LIVE."
      );

      return;
    }

    try {
      stopMicMonitor();

      if (enabled) {
        let micTrack =
          getLocalMicTrack();

        if (!micTrack) {
          await localParticipant
            .setMicrophoneEnabled(
              true,
              getMicOptions()
            );

          micTrack =
            getLocalMicTrack();
        }

        if (micTrack) {
          await micTrack.mute();
        }

        setPushToTalk(true);
        setPushToTalkActive(false);
        setMicOn(false);

        setMessage(
          "Aperte para Falar ativado. Segure ESPAÇO para falar."
        );
      } else {
        const micTrack =
          getLocalMicTrack();

        if (micTrack) {
          await micTrack.mute();
        }

        setPushToTalk(false);
        setPushToTalkActive(false);
        setMicOn(false);

        setMessage(
          "Aperte para Falar desativado."
        );
      }

      window.setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error(error);

      setMessage(
        "Não foi possível alterar o Push-to-Talk."
      );
    }
  }

  /*
   * ATALHO ESPAÇO
   */

  useEffect(() => {
    if (!pushToTalk) {
      return;
    }

    async function openPTT() {
      if (!isConnected) {
        return;
      }

      try {
        let micTrack =
          getLocalMicTrack();

        if (!micTrack) {
          await localParticipant
            .setMicrophoneEnabled(
              true,
              getMicOptions()
            );

          micTrack =
            getLocalMicTrack();
        }

        if (micTrack) {
          await micTrack.unmute();

          setPushToTalkActive(
            true
          );

          setMicOn(true);
        }
      } catch (error) {
        console.error(
          "Erro abrindo PTT:",
          error
        );
      }
    }

    async function closePTT() {
      try {
        const micTrack =
          getLocalMicTrack();

        if (micTrack) {
          await micTrack.mute();
        }

        setPushToTalkActive(
          false
        );

        setMicOn(false);
      } catch (error) {
        console.error(
          "Erro fechando PTT:",
          error
        );
      }
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      const target =
        event.target as HTMLElement;

      if (
        target.tagName ===
          "INPUT" ||
        target.tagName ===
          "TEXTAREA" ||
        target.tagName ===
          "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (
        event.code !== "Space"
      ) {
        return;
      }

      event.preventDefault();

      if (event.repeat) {
        return;
      }

      openPTT();
    }

    function handleKeyUp(
      event: KeyboardEvent
    ) {
      if (
        event.code !== "Space"
      ) {
        return;
      }

      event.preventDefault();

      closePTT();
    }

    function handleBlur() {
      closePTT();
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    window.addEventListener(
      "keyup",
      handleKeyUp
    );

    window.addEventListener(
      "blur",
      handleBlur
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );
    };
  }, [
    pushToTalk,
    isConnected,
    localParticipant,
    noiseSuppression,
    echoCancellation,
    autoGainControl,
  ]);

  /*
   * APLICAR CONFIGURAÇÕES
   */

  async function applyMicrophoneSettings() {
    if (!canPublishMedia()) {
      return;
    }

    try {
      stopMicMonitor();

      if (pushToTalk) {
        await localParticipant
          .setMicrophoneEnabled(
            false
          );

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              150
            )
        );

        await localParticipant
          .setMicrophoneEnabled(
            true,
            getMicOptions()
          );

        const micTrack =
          getLocalMicTrack();

        if (micTrack) {
          await micTrack.mute();
        }

        setMicOn(false);
      } else {
        const wasEnabled =
          localParticipant
            .isMicrophoneEnabled;

        if (wasEnabled) {
          await localParticipant
            .setMicrophoneEnabled(
              false
            );

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                150
              )
          );

          await localParticipant
            .setMicrophoneEnabled(
              true,
              getMicOptions()
            );

          setMicOn(true);
        }
      }

      setConfigOpen(false);

      setMessage(
        "Configurações salvas."
      );

      window.setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error(error);

      setMessage(
        "Não foi possível aplicar as configurações."
      );
    }
  }

  /*
   * RESTAURAR PADRÕES
   */

  async function resetAudioPreferences() {
    try {
      window.localStorage.removeItem(
        AUDIO_PREFS_KEY
      );

      setNoiseSuppression(true);
      setEchoCancellation(false);
      setAutoGainControl(false);
      setSensitivity(-45);
      setShiuuu(false);

      if (pushToTalk) {
        await setPushToTalkMode(
          false
        );
      } else {
        setPushToTalk(false);
      }

      setMessage(
        "Configurações padrão restauradas."
      );

      window.setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error(error);
    }
  }

  /*
   * COMPARTILHAMENTO
   */

  async function startScreenShare() {
    if (!canPublishMedia()) {
      return;
    }

    try {
      setMessage("");

      const remoteSharer =
        screenTracks.find(
          (track) =>
            track.participant
              .identity !==
            localParticipant
              .identity
        );

      if (remoteSharer) {
        const sharerName =
          remoteSharer
            .participant.name ||
          remoteSharer
            .participant
            .identity ||
          "Outro participante";

        setMessage(
          `${sharerName} já está compartilhando a tela.`
        );

        return;
      }

      await localParticipant
        .setScreenShareEnabled(
          true,
          {
            audio: true,
          }
        );

      setIsSharing(true);
    } catch (error) {
      console.error(error);

      setMessage(
        "Compartilhamento cancelado ou não permitido."
      );
    }
  }

  async function stopScreenShare() {
    try {
      await localParticipant
        .setScreenShareEnabled(
          false
        );

      setIsSharing(false);
    } catch {
      setMessage(
        "Não foi possível interromper o compartilhamento."
      );
    }
  }

  /*
   * VOLTAR AO MENU
   */

  async function leaveRoom() {
    try {
      stopMicMonitor();

      if (
        localParticipant
          .isScreenShareEnabled
      ) {
        await localParticipant
          .setScreenShareEnabled(
            false
          );
      }

      const micTrack =
        getLocalMicTrack();

      if (micTrack) {
        try {
          await micTrack.mute();
        } catch {}
      }

      if (
        localParticipant
          .isMicrophoneEnabled
      ) {
        try {
          await localParticipant
            .setMicrophoneEnabled(
              false
            );
        } catch {}
      }

      try {
        await room.disconnect();
      } catch {}

      router.push("/");
    } catch (error) {
      console.error(
        "Erro ao sair da sala:",
        error
      );

      router.push("/");
    }
  }

  /*
   * CONVIDAR
   */

  async function copyInvite() {
    try {
      const inviteUrl =
        `${window.location.origin}/room/${roomName}`;

      await navigator.clipboard
        .writeText(inviteUrl);

      setMessage(
        "Link copiado! Envie para seus amigos."
      );

      window.setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch {
      setMessage(
        "Não foi possível copiar o link."
      );
    }
  }

  /*
   * MEDIDOR
   */

  async function startMicMonitor() {
    if (!canPublishMedia()) {
      return;
    }

    try {
      setMessage("");

      stopMicMonitor();

      let publication =
        localParticipant
          .getTrackPublication(
            Track.Source.Microphone
          );

      if (!publication?.track) {
        await localParticipant
          .setMicrophoneEnabled(
            true,
            getMicOptions()
          );

        publication =
          localParticipant
            .getTrackPublication(
              Track.Source.Microphone
            );
      }

      if (!publication?.track) {
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              300
            )
        );

        publication =
          localParticipant
            .getTrackPublication(
              Track.Source.Microphone
            );
      }

      const livekitTrack =
        publication?.track;

      if (!livekitTrack) {
        setMessage(
          "Não foi possível acessar o microfone."
        );

        return;
      }

      if (pushToTalk) {
        await livekitTrack.unmute();

        setPushToTalkActive(
          true
        );
      }

      const originalMediaTrack =
        livekitTrack
          .mediaStreamTrack;

      if (!originalMediaTrack) {
        setMessage(
          "Não foi possível acessar o sinal do microfone."
        );

        return;
      }

      const monitorTrack =
        originalMediaTrack.clone();

      monitorTrackRef.current =
        monitorTrack;

      const audioContext =
        new AudioContext();

      audioContextRef.current =
        audioContext;

      if (
        audioContext.state ===
        "suspended"
      ) {
        await audioContext.resume();
      }

      const stream =
        new MediaStream([
          monitorTrack,
        ]);

      const source =
        audioContext
          .createMediaStreamSource(
            stream
          );

      const analyser =
        audioContext
          .createAnalyser();

      analyser.fftSize = 2048;

      analyser.smoothingTimeConstant =
        0.45;

      source.connect(analyser);

      const samples =
        new Float32Array(
          analyser.fftSize
        );

      setMonitoring(true);

      function readLevel() {
        analyser
          .getFloatTimeDomainData(
            samples
          );

        let sum = 0;

        for (
          let i = 0;
          i < samples.length;
          i++
        ) {
          sum +=
            samples[i] *
            samples[i];
        }

        const rms =
          Math.sqrt(
            sum /
              samples.length
          );

        let db =
          rms > 0
            ? 20 *
              Math.log10(rms)
            : -60;

        db = Math.max(
          -60,
          Math.min(
            0,
            db
          )
        );

        setMicLevel(
          Math.round(db)
        );

        setIsSpeaking(
          db >=
            sensitivityRef.current
        );

        animationRef.current =
          requestAnimationFrame(
            readLevel
          );
      }

      readLevel();
    } catch (error) {
      console.error(error);

      setMessage(
        "Não foi possível iniciar o teste do microfone."
      );
    }
  }

  function stopMicMonitor() {
    if (
      animationRef.current !==
      null
    ) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current =
        null;
    }

    if (
      monitorTrackRef.current
    ) {
      monitorTrackRef.current
        .stop();

      monitorTrackRef.current =
        null;
    }

    if (
      audioContextRef.current
    ) {
      const context =
        audioContextRef.current;

      audioContextRef.current =
        null;

      if (
        context.state !==
        "closed"
      ) {
        context
          .close()
          .catch(() => {});
      }
    }

    setMonitoring(false);
    setMicLevel(-60);
    setIsSpeaking(false);

    if (pushToTalk) {
      const micTrack =
        getLocalMicTrack();

      if (micTrack) {
        micTrack
          .mute()
          .catch(() => {});
      }

      setPushToTalkActive(
        false
      );

      setMicOn(false);
    }
  }

  /*
   * ÁUDIOS REMOTOS
   */

  const remoteMicrophones =
    microphoneTracks.filter(
      (track) =>
        track.participant
          .identity !==
        localParticipant.identity
    );

  const remoteScreenAudio =
    screenAudioTracks.filter(
      (track) =>
        track.participant
          .identity !==
        localParticipant.identity
    );

  const meterWidth =
    Math.max(
      0,
      Math.min(
        100,
        ((micLevel + 60) /
          60) *
          100
      )
    );

  const thresholdPosition =
    Math.max(
      0,
      Math.min(
        100,
        ((sensitivity + 60) /
          60) *
          100
      )
    );

  return (
    <main className="min-h-screen bg-[#030706] p-4 text-white md:p-8">

      {/* ÁUDIO REMOTO */}

      <div className="hidden">

        {remoteScreenAudio.map(
          (track) => (
            <AudioTrack
              key={`${track.participant.identity}-screen`}
              trackRef={track}
              volume={1}
              muted={false}
            />
          )
        )}

        {remoteMicrophones.map(
          (track) => (
            <AudioTrack
              key={`${track.participant.identity}-mic`}
              trackRef={track}
              volume={1}
              muted={shiuuu}
            />
          )
        )}

      </div>

      <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-white/10 bg-[#07100f] shadow-2xl">

        {/* TOPO */}

        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </div>

          <button
            type="button"
            onClick={leaveRoom}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/50 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
          >
            ← VOLTAR AO MENU
          </button>

        </div>

        <div className="relative min-h-[850px] p-6 md:p-10">

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,255,150,0.07),transparent_55%)]" />

          <div className="relative">

            {/* HEADER */}

            <header className="mb-8 flex flex-wrap items-center justify-between gap-5">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-400">

                  <div className="flex h-5 items-end gap-[3px]">
                    <span className="h-2 w-[3px] rounded-full bg-lime-400" />
                    <span className="h-4 w-[3px] rounded-full bg-emerald-400" />
                    <span className="h-5 w-[3px] rounded-full bg-cyan-400" />
                    <span className="h-3 w-[3px] rounded-full bg-emerald-400" />
                  </div>

                </div>

                <span className="bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-4xl font-black text-transparent">
                  JAM
                </span>

              </div>

              <div className="flex items-center gap-4">

                <div
                  className={
                    isConnected
                      ? "text-green-400"
                      : "text-yellow-300"
                  }
                >
                  ●{" "}
                  {connectionState ===
                  ConnectionState.Connected
                    ? "LIVE"
                    : connectionState ===
                      ConnectionState.Reconnecting
                    ? "RECONECTANDO"
                    : "CONECTANDO"}
                </div>

                <div className="h-6 w-px bg-white/10" />

                <div>
                  Sala{" "}
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
                / 10
              </div>

            </header>

            {/* MENSAGEM */}

            {message && (
              <div className="mx-auto mb-5 max-w-5xl rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-center text-sm text-cyan-300">
                {message}
              </div>
            )}

            {/* TRANSMISSÃO */}

            <section className="mx-auto max-w-5xl rounded-[26px] border border-white/10 bg-black/20 p-4 md:p-6">

              {activeScreenTrack ? (
                <div>

                  <div className="overflow-hidden rounded-2xl border border-emerald-400/40 bg-black">

                    <VideoTrack
                      trackRef={
                        activeScreenTrack
                      }
                      className="aspect-video w-full bg-black object-contain"
                    />

                  </div>

                  <p className="mt-5 text-center text-white/50">

                    <span className="font-semibold text-lime-400">
                      {activeScreenTrack
                        .participant.name ||
                        activeScreenTrack
                          .participant
                          .identity}
                    </span>

                    {" "}está compartilhando

                  </p>

                </div>
              ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">

                  <div className="mb-7 flex h-32 w-48 items-center justify-center rounded-2xl border-2 border-emerald-400/50 bg-emerald-400/5">
                    <span className="text-6xl text-emerald-400">
                      ↑
                    </span>
                  </div>

                  <h2 className="text-2xl font-semibold">
                    Nada sendo compartilhado
                  </h2>

                  <p className="mt-3 text-white/40">
                    Compartilhe seu Ableton com a sala.
                  </p>

                  <button
                    type="button"
                    onClick={
                      startScreenShare
                    }
                    disabled={
                      someoneElseSharing ||
                      !isConnected
                    }
                    className={`mt-8 w-full max-w-md rounded-2xl px-8 py-5 text-lg font-black transition ${
                      someoneElseSharing ||
                      !isConnected
                        ? "cursor-not-allowed border border-white/5 bg-white/[0.03] text-white/20"
                        : "bg-gradient-to-r from-lime-400 to-emerald-400 text-black"
                    }`}
                  >
                    {!isConnected
                      ? "CONECTANDO..."
                      : someoneElseSharing
                      ? "▣ TELA EM USO"
                      : "▣ COMPARTILHAR TELA"}
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
                  / 10 participantes
                </span>

              </div>

              <div className="space-y-2">

                {participants.map(
                  (participant) => {

                    const isLocal =
                      participant.identity ===
                      localParticipant
                        .identity;

                    return (
                      <div
                        key={
                          participant.identity
                        }
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
                              {isLocal
                                ? "Você"
                                : "Conectado"}
                            </p>

                          </div>

                        </div>

                        <div className="flex items-center gap-3">

                          <span>
                            {participant
                              .isMicrophoneEnabled
                              ? "🎤"
                              : "🔇"}
                          </span>

                          <span className="h-2 w-2 rounded-full bg-green-400" />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </section>

            {/* CONTROLES */}

            <div className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-5">

              <button
                type="button"
                onClick={
                  toggleMicrophone
                }
                disabled={
                  !isConnected ||
                  pushToTalk
                }
                className={`rounded-2xl border px-5 py-4 font-semibold transition ${
                  pushToTalk
                    ? pushToTalkActive
                      ? "cursor-not-allowed border-lime-400/40 bg-lime-400/10 text-lime-400"
                      : "cursor-not-allowed border-cyan-400/30 bg-cyan-400/5 text-cyan-400"
                    : !isConnected
                    ? "cursor-not-allowed border-white/5 text-white/20"
                    : micOn
                    ? "border-green-400/30 text-green-400 hover:bg-green-400/5"
                    : "border-red-400/30 text-red-400 hover:bg-red-400/5"
                }`}
              >
                {pushToTalk
                  ? pushToTalkActive
                    ? "🎙 FALANDO"
                    : "🎙 PTT ATIVO"
                  : !isConnected
                  ? "CONECTANDO"
                  : micOn
                  ? "🎤 MUTE"
                  : "🎤 ATIVAR MIC"}
              </button>

              {!isSharing ? (
                <button
                  type="button"
                  onClick={
                    startScreenShare
                  }
                  disabled={
                    someoneElseSharing ||
                    !isConnected
                  }
                  className={`rounded-2xl border px-5 py-4 font-semibold ${
                    someoneElseSharing ||
                    !isConnected
                      ? "cursor-not-allowed border-white/5 text-white/20"
                      : "border-cyan-400/30 text-cyan-400"
                  }`}
                >
                  {someoneElseSharing
                    ? "▣ TELA EM USO"
                    : "▣ TELA"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    stopScreenShare
                  }
                  className="rounded-2xl border border-red-400/30 px-5 py-4 font-semibold text-red-400"
                >
                  ■ PARAR TELA
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setShiuuu(
                    !shiuuu
                  )
                }
                className={`rounded-2xl border px-5 py-4 font-semibold ${
                  shiuuu
                    ? "border-yellow-300 bg-yellow-300/10 text-yellow-300"
                    : "border-white/10 text-white/60"
                }`}
              >
                🤫{" "}
                {shiuuu
                  ? "SHIIUUU ON"
                  : "SHIIUUU"}
              </button>

              <button
                type="button"
                onClick={copyInvite}
                className="rounded-2xl border border-cyan-400/30 px-5 py-4 font-semibold text-cyan-400"
              >
                🔗 CONVIDAR
              </button>

              <button
                type="button"
                onClick={() =>
                  setConfigOpen(true)
                }
                className="rounded-2xl border border-white/10 px-5 py-4 font-semibold text-white/60"
              >
                ⚙ CONFIG
              </button>

            </div>

            {pushToTalk && (
              <div className="mx-auto mt-5 max-w-5xl rounded-xl border border-cyan-400/15 bg-cyan-400/[0.03] px-4 py-3 text-center text-sm">

                <span
                  className={
                    pushToTalkActive
                      ? "font-bold text-lime-400"
                      : "text-white/40"
                  }
                >
                  {pushToTalkActive
                    ? "🎙 Você está falando"
                    : "Segure ESPAÇO para falar"}
                </span>

              </div>
            )}

          </div>
        </div>
      </div>

      {/* CONFIG */}

      {configOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5">

          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-emerald-400/30 bg-[#07100f] p-7">

            <div className="flex items-center justify-between gap-4">

              <div>
                <h2 className="text-2xl font-bold">
                  Configurações do microfone
                </h2>

                <p className="mt-1 text-sm text-white/40">
                  Salvas automaticamente neste navegador.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopMicMonitor();
                  setConfigOpen(false);
                }}
                className="text-2xl text-white/40"
              >
                ×
              </button>

            </div>

            <div className="mt-7 space-y-6">

              <SettingToggle
                label="Aperte para Falar"
                description="Segure ESPAÇO para abrir seu microfone."
                value={
                  pushToTalk
                }
                onChange={(value) => {
                  setPushToTalkMode(
                    value
                  );
                }}
              />

              {pushToTalk && (
                <div className={`rounded-2xl border p-4 ${
                  pushToTalkActive
                    ? "border-lime-400/30 bg-lime-400/5"
                    : "border-cyan-400/20 bg-cyan-400/5"
                }`}>

                  <div className="flex items-center justify-between gap-4">

                    <div>
                      <p className="font-medium">
                        Push-to-Talk
                      </p>

                      <p className="mt-1 text-sm text-white/40">
                        Segure ESPAÇO enquanto estiver falando.
                      </p>
                    </div>

                    <span className={`rounded-lg border px-4 py-2 text-sm font-bold ${
                      pushToTalkActive
                        ? "border-lime-400/40 bg-lime-400/10 text-lime-400"
                        : "border-white/10 text-white/50"
                    }`}>
                      {pushToTalkActive
                        ? "FALANDO"
                        : "ESPAÇO"}
                    </span>

                  </div>

                </div>
              )}

              <SettingToggle
                label="Supressão de ruído"
                description="Reduz ruído ambiente do microfone."
                value={
                  noiseSuppression
                }
                onChange={
                  setNoiseSuppression
                }
              />

              <SettingToggle
                label="Cancelamento de eco"
                description="Útil se estiver usando caixas de som."
                value={
                  echoCancellation
                }
                onChange={
                  setEchoCancellation
                }
              />

              <SettingToggle
                label="Ganho automático"
                description="Ajusta automaticamente o volume da voz."
                value={
                  autoGainControl
                }
                onChange={
                  setAutoGainControl
                }
              />

              <div>

                <div className="flex justify-between gap-4">

                  <div>
                    <p className="font-medium">
                      Sensibilidade da voz
                    </p>

                    <p className="text-sm text-white/40">
                      Ajuste o nível mínimo para detectar sua voz.
                    </p>
                  </div>

                  <span className="whitespace-nowrap text-cyan-400">
                    {sensitivity} dB
                  </span>

                </div>

                <input
                  type="range"
                  min="-60"
                  max="-25"
                  step="1"
                  value={
                    sensitivity
                  }
                  onChange={(e) =>
                    setSensitivity(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="mt-5 w-full"
                />

                <div className="mt-2 flex justify-between text-xs text-white/30">
                  <span>
                    Mais sensível
                  </span>

                  <span>
                    Menos sensível
                  </span>
                </div>

              </div>

              {/* TESTE DO MICROFONE */}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                <div className="flex flex-wrap items-start justify-between gap-3">

                  <div>
                    <p className="font-medium">
                      Teste do microfone
                    </p>

                    <p className="mt-1 text-sm text-white/40">
                      Fale normalmente para ajustar.
                    </p>
                  </div>

                  <span className={`text-sm font-semibold ${
                    isSpeaking
                      ? "text-lime-400"
                      : "text-white/30"
                  }`}>
                    {isSpeaking
                      ? "VOZ DETECTADA"
                      : monitoring
                      ? "SILÊNCIO"
                      : "PARADO"}
                  </span>

                </div>

                <div className="relative mt-5 h-4 overflow-hidden rounded-full bg-white/10">

                  <div
                    className={`h-full ${
                      isSpeaking
                        ? "bg-gradient-to-r from-lime-400 to-emerald-400"
                        : "bg-white/20"
                    }`}
                    style={{
                      width:
                        `${meterWidth}%`,
                    }}
                  />

                  <div
                    className="absolute top-0 h-full w-[2px] bg-cyan-300"
                    style={{
                      left:
                        `${thresholdPosition}%`,
                    }}
                  />

                </div>

                <div className="mt-2 flex justify-between text-xs text-white/30">

                  <span>-60 dB</span>

                  <span className={
                    isSpeaking
                      ? "text-lime-400"
                      : "text-white/50"
                  }>
                    {micLevel} dB
                  </span>

                  <span>0 dB</span>

                </div>

                <div className="mt-4 flex gap-3">

                  <button
                    type="button"
                    onClick={
                      startMicMonitor
                    }
                    disabled={
                      !isConnected
                    }
                    className="flex-1 rounded-xl border border-emerald-400/30 px-4 py-3 text-sm font-semibold text-emerald-400 disabled:opacity-30"
                  >
                    🎤 TESTAR MICROFONE
                  </button>

                  <button
                    type="button"
                    onClick={
                      stopMicMonitor
                    }
                    className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/50"
                  >
                    PARAR
                  </button>

                </div>

              </div>

              {/* RESTAURAR */}

              <button
                type="button"
                onClick={
                  resetAudioPreferences
                }
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/40 transition hover:border-red-400/20 hover:bg-red-400/5 hover:text-red-300"
              >
                ↺ RESTAURAR CONFIGURAÇÕES PADRÃO
              </button>

            </div>

            <div className="mt-8 flex gap-3">

              <button
                type="button"
                onClick={() => {
                  stopMicMonitor();
                  setConfigOpen(false);
                }}
                className="flex-1 rounded-xl border border-white/10 px-5 py-4 text-white/50"
              >
                CANCELAR
              </button>

              <button
                type="button"
                onClick={
                  applyMicrophoneSettings
                }
                disabled={
                  !isConnected
                }
                className="flex-1 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-400 px-5 py-4 font-bold text-black disabled:opacity-30"
              >
                SALVAR
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

function SettingToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <div>
        <p className="font-medium">
          {label}
        </p>

        <p className="mt-1 text-sm text-white/40">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!value)
        }
        className={`relative h-7 w-14 shrink-0 rounded-full transition ${
          value
            ? "bg-emerald-400"
            : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
            value
              ? "left-8"
              : "left-1"
          }`}
        />
      </button>

    </div>
  );
}
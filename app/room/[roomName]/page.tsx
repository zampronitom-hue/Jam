"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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
  AudioPresets,
  ConnectionState,
  LocalAudioTrack,
  LocalVideoTrack,
  Track,
} from "livekit-client";

type TokenResponse = {
  token: string;
  serverUrl: string;
};

type IntegratedBlock = {
  energy: number;
  lufs: number;
};

type SpectrumPoint = {
  x: number;
  y: number;
  value: number;
};

const AUDIO_PREFS_KEY =
  "jam-audio-preferences";

const LUFS_FLOOR = -70;

/* =====================================================
   PAGE
   ===================================================== */

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const roomName = String(
    params.roomName || ""
  ).toUpperCase();

  const participantName =
    searchParams.get("name") ||
    "Visitante";

  const [tokenData, setTokenData] =
    useState<TokenResponse | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function connectToRoom() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/token",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              roomName,
              participantName,
            }),
          }
        );

        const data =
          await response.json();

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
  }, [
    roomName,
    participantName,
  ]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030706] text-white">

        <div className="text-center">

          <h1 className="bg-gradient-to-r from-purple-400 via-emerald-400 to-cyan-400 bg-clip-text text-5xl font-black text-transparent">
            JAM
          </h1>

          <p className="mt-5 text-white/50">
            Conectando à sala{" "}
            {roomName}...
          </p>

        </div>

      </main>
    );
  }

  if (
    error ||
    !tokenData
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030706] p-6 text-white">

        <div className="max-w-lg rounded-3xl border border-purple-400/20 bg-purple-400/5 p-8 text-center">

          <h1 className="text-3xl font-black text-purple-300">
            Não foi possível conectar
          </h1>

          <p className="mt-4 text-white/60">
            {error ||
              "Token indisponível."}
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
      serverUrl={
        tokenData.serverUrl
      }
      connect
      audio={false}
      video={false}
      className="min-h-screen"
    >

      <JamRoom
        roomName={roomName}
      />

    </LiveKitRoom>
  );
}

/* =====================================================
   JAM ROOM
   ===================================================== */

function JamRoom({
  roomName,
}: {
  roomName: string;
}) {
  const router = useRouter();

  const room =
    useRoomContext();

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

  /* =====================================================
     TRACKS
     ===================================================== */

  const screenTracks =
    useTracks(
      [
        Track.Source.ScreenShare,
      ],
      {
        onlySubscribed: false,
      }
    );

  const microphoneTracks =
    useTracks(
      [
        Track.Source.Microphone,
      ],
      {
        onlySubscribed: true,
      }
    );

  const screenAudioTracks =
    useTracks(
      [
        Track.Source
          .ScreenShareAudio,
      ],
      {
        onlySubscribed: true,
      }
    );

  /* =====================================================
     BASIC STATES
     ===================================================== */

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

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    preferencesLoaded,
    setPreferencesLoaded,
  ] = useState(false);

  /* =====================================================
     MIC SETTINGS
     ===================================================== */

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

  /* =====================================================
     TRANSMISSION
     ===================================================== */

  const [
    transmissionVolume,
    setTransmissionVolume,
  ] = useState(100);

  /* =====================================================
     PUSH TO TALK
     ===================================================== */

  const [
    pushToTalk,
    setPushToTalk,
  ] = useState(false);

  const [
    pushToTalkActive,
    setPushToTalkActive,
  ] = useState(false);

  /* =====================================================
     MIC METER
     ===================================================== */

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

  /* =====================================================
     PROFESSIONAL ANALYZER STATES
     ===================================================== */

  const [
    analyzerActive,
    setAnalyzerActive,
  ] = useState(false);

  const [
    analyzerPeak,
    setAnalyzerPeak,
  ] = useState(-60);

  const [
    truePeak,
    setTruePeak,
  ] = useState(-60);

  const [
    lufsMomentary,
    setLufsMomentary,
  ] = useState(-70);

  const [
    lufsShort,
    setLufsShort,
  ] = useState(-70);

  const [
    lufsIntegrated,
    setLufsIntegrated,
  ] = useState(-70);

  const [
    correlation,
    setCorrelation,
  ] = useState(1);

  const [
    clipDetected,
    setClipDetected,
  ] = useState(false);

  /* =====================================================
     FULLSCREEN
     ===================================================== */

  const [
    isFullscreen,
    setIsFullscreen,
  ] = useState(false);

  /* =====================================================
     MIC REFS
     ===================================================== */

  const micAudioContextRef =
    useRef<AudioContext | null>(
      null
    );

  const micAnimationRef =
    useRef<number | null>(
      null
    );

  const micMonitorTrackRef =
    useRef<MediaStreamTrack | null>(
      null
    );

  const sensitivityRef =
    useRef(sensitivity);

  /* =====================================================
     ANALYZER REFS
     ===================================================== */

  const analyzerCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const analyzerAudioContextRef =
    useRef<AudioContext | null>(
      null
    );

  const analyzerAnimationRef =
    useRef<number | null>(
      null
    );

  const analyzerCloneRef =
    useRef<MediaStreamTrack | null>(
      null
    );

  const spectrumHoldRef =
    useRef<number[]>([]);

  const spectrumHoldTimeRef =
    useRef<number[]>([]);

  /*
   * LUFS histories are stored as
   * linear energy, not dB.
   */

  const momentaryEnergyRef =
    useRef<number[]>([]);

  const shortEnergyRef =
    useRef<number[]>([]);

  const integratedBlocksRef =
    useRef<IntegratedBlock[]>(
      []
    );

  const peakHoldValueRef =
    useRef(-60);

  const truePeakHoldRef =
    useRef(-60);

  /* =====================================================
     FULLSCREEN REF
     ===================================================== */

  const transmissionRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /* =====================================================
     LOAD PREFERENCES
     ===================================================== */

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
          typeof
            prefs.noiseSuppression ===
          "boolean"
        ) {
          setNoiseSuppression(
            prefs.noiseSuppression
          );
        }

        if (
          typeof
            prefs.echoCancellation ===
          "boolean"
        ) {
          setEchoCancellation(
            prefs.echoCancellation
          );
        }

        if (
          typeof
            prefs.autoGainControl ===
          "boolean"
        ) {
          setAutoGainControl(
            prefs.autoGainControl
          );
        }

        if (
          typeof
            prefs.sensitivity ===
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
          typeof
            prefs.pushToTalk ===
          "boolean"
        ) {
          setPushToTalk(
            prefs.pushToTalk
          );
        }

        if (
          typeof
            prefs.shiuuu ===
          "boolean"
        ) {
          setShiuuu(
            prefs.shiuuu
          );
        }

        if (
          typeof
            prefs.transmissionVolume ===
          "number"
        ) {
          setTransmissionVolume(
            Math.max(
              0,
              Math.min(
                100,
                prefs.transmissionVolume
              )
            )
          );
        }
      }
    } catch (error) {
      console.error(
        "Erro ao carregar preferências:",
        error
      );
    } finally {
      setPreferencesLoaded(
        true
      );
    }
  }, []);

  /* =====================================================
     SAVE PREFERENCES
     ===================================================== */

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
      transmissionVolume,
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
    transmissionVolume,
  ]);

  useEffect(() => {
    sensitivityRef.current =
      sensitivity;
  }, [sensitivity]);

  /* =====================================================
     LIVEKIT STATE
     ===================================================== */

  useEffect(() => {
    if (!pushToTalk) {
      setMicOn(
        localParticipant
          .isMicrophoneEnabled
      );
    }

    const hasScreen =
      !!localParticipant
        .getTrackPublication(
          Track.Source.ScreenShare
        );

    setIsSharing(
      localParticipant
        .isScreenShareEnabled ||
        hasScreen
    );
  }, [
    localParticipant,
    localParticipant
      .isMicrophoneEnabled,
    localParticipant
      .isScreenShareEnabled,
    screenTracks,
    pushToTalk,
  ]);

  /* =====================================================
     CLEANUP
     ===================================================== */

  useEffect(() => {
    return () => {
      stopMicMonitor();
      stopAnalyzer();
    };
  }, []);

  /* =====================================================
     SCREEN STATUS
     ===================================================== */

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

  /* =====================================================
     MIC HELPERS
     ===================================================== */

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

  /* =====================================================
     MIC NORMAL
     ===================================================== */

  async function toggleMicrophone() {
    if (pushToTalk) {
      setMessage(
        "Push-to-Talk está ativo. Segure ESPAÇO."
      );

      return;
    }

    if (!canPublishMedia()) {
      return;
    }

    try {
      if (
        localParticipant
          .isMicrophoneEnabled
      ) {
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
      console.error(
        "Erro no microfone:",
        error
      );
    }
  }

  /* =====================================================
     M = MUTE
     ===================================================== */

  useEffect(() => {
    async function handleMuteShortcut(
      event: KeyboardEvent
    ) {
      const target =
        event.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (
        event.code !== "KeyM" ||
        event.repeat
      ) {
        return;
      }

      if (!isConnected) {
        return;
      }

      if (pushToTalk) {
        setMessage(
          "Desative o Push-to-Talk para usar M."
        );

        return;
      }

      try {
        if (
          localParticipant
            .isMicrophoneEnabled
        ) {
          await localParticipant
            .setMicrophoneEnabled(
              false
            );

          setMicOn(false);

          setMessage(
            "🔇 Microfone mutado"
          );
        } else {
          await localParticipant
            .setMicrophoneEnabled(
              true,
              getMicOptions()
            );

          setMicOn(true);

          setMessage(
            "🎤 Microfone ativado"
          );
        }

        window.setTimeout(
          () => {
            setMessage("");
          },
          1200
        );
      } catch (error) {
        console.error(
          "Erro no atalho M:",
          error
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleMuteShortcut
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleMuteShortcut
      );
    };
  }, [
    isConnected,
    pushToTalk,
    localParticipant,
    noiseSuppression,
    echoCancellation,
    autoGainControl,
  ]);

  /* =====================================================
     PUSH TO TALK
     ===================================================== */

  async function setPushToTalkMode(
    enabled: boolean
  ) {
    if (!isConnected) {
      return;
    }

    try {
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
      } else {
        const micTrack =
          getLocalMicTrack();

        if (micTrack) {
          await micTrack.mute();
        }

        setPushToTalk(false);
        setPushToTalkActive(false);
        setMicOn(false);
      }
    } catch (error) {
      console.error(
        "Erro PTT:",
        error
      );
    }
  }

  /* =====================================================
     SPACE = PUSH TO TALK
     ===================================================== */

  useEffect(() => {
    if (!pushToTalk) {
      return;
    }

    async function openPTT() {
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

        setPushToTalkActive(true);
        setMicOn(true);
      }
    }

    async function closePTT() {
      const micTrack =
        getLocalMicTrack();

      if (micTrack) {
        await micTrack.mute();
      }

      setPushToTalkActive(false);
      setMicOn(false);
    }

    function down(
      event: KeyboardEvent
    ) {
      const target =
        event.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (
        event.code !== "Space" ||
        event.repeat
      ) {
        return;
      }

      event.preventDefault();

      openPTT();
    }

    function up(
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

    function blur() {
      closePTT();
    }

    window.addEventListener(
      "keydown",
      down
    );

    window.addEventListener(
      "keyup",
      up
    );

    window.addEventListener(
      "blur",
      blur
    );

    return () => {
      window.removeEventListener(
        "keydown",
        down
      );

      window.removeEventListener(
        "keyup",
        up
      );

      window.removeEventListener(
        "blur",
        blur
      );
    };
  }, [
    pushToTalk,
    localParticipant,
    noiseSuppression,
    echoCancellation,
    autoGainControl,
  ]);

  /* =====================================================
     APPLY MIC CONFIG
     ===================================================== */

  async function applyMicrophoneSettings() {
    try {
      stopMicMonitor();

      if (pushToTalk) {
        await localParticipant
          .setMicrophoneEnabled(
            false
          );

        await wait(150);

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

          await wait(150);

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

      window.setTimeout(
        () => {
          setMessage("");
        },
        1500
      );
    } catch (error) {
      console.error(
        "Erro ao salvar config:",
        error
      );
    }
  }

  async function resetAudioPreferences() {
    window.localStorage.removeItem(
      AUDIO_PREFS_KEY
    );

    setNoiseSuppression(true);
    setEchoCancellation(false);
    setAutoGainControl(false);
    setSensitivity(-45);
    setTransmissionVolume(100);
    setShiuuu(false);

    if (pushToTalk) {
      await setPushToTalkMode(
        false
      );
    }

    setMessage(
      "Preferências restauradas."
    );

    window.setTimeout(
      () => {
        setMessage("");
      },
      1600
    );
  }

  /* =====================================================
     SCREEN SHARE HI-FI
     ===================================================== */

  async function startScreenShare() {
    if (!canPublishMedia()) {
      return;
    }

    try {
      const remoteSharer =
        screenTracks.find(
          (track) =>
            track.participant
              .identity !==
            localParticipant
              .identity
        );

      if (remoteSharer) {
        setMessage(
          "Outra pessoa já está compartilhando."
        );

        return;
      }

      /*
       * O microfone NÃO é alterado.
       * Tela e voz continuam independentes.
       */

      const createdTracks =
        await localParticipant
          .createScreenTracks({
            video: true,

            audio: {
              echoCancellation:
                false,

              noiseSuppression:
                false,

              autoGainControl:
                false,

              channelCount: 2,

              sampleRate: 48000,
            },

            systemAudio:
              "include",

            contentHint:
              "detail",
          });

      const videoTrack =
        createdTracks.find(
          (track) =>
            track.kind ===
            Track.Kind.Video
        ) as
          | LocalVideoTrack
          | undefined;

      const audioTrack =
        createdTracks.find(
          (track) =>
            track.kind ===
            Track.Kind.Audio
        ) as
          | LocalAudioTrack
          | undefined;

      if (videoTrack) {
        await localParticipant
          .publishTrack(
            videoTrack,
            {
              source:
                Track.Source
                  .ScreenShare,
            }
          );
      }

      if (audioTrack) {
        await localParticipant
          .publishTrack(
            audioTrack,
            {
              source:
                Track.Source
                  .ScreenShareAudio,

              audioPreset:
                AudioPresets
                  .musicHighQualityStereo,

              forceStereo: true,

              dtx: false,

              red: false,
            }
          );
      } else {
        setMessage(
          "Tela compartilhada sem áudio. Ative Compartilhar áudio do sistema."
        );
      }

      resetMeters();

      setIsSharing(true);
    } catch (error) {
      console.error(
        "Erro screen share:",
        error
      );

      setMessage(
        "Compartilhamento cancelado."
      );
    }
  }

  async function stopScreenShare() {
    stopAnalyzer();

    const screenPublication =
      localParticipant
        .getTrackPublication(
          Track.Source.ScreenShare
        );

    const audioPublication =
      localParticipant
        .getTrackPublication(
          Track.Source
            .ScreenShareAudio
        );

    if (
      screenPublication?.track
    ) {
      try {
        await localParticipant
          .unpublishTrack(
            screenPublication.track
          );

        screenPublication
          .track
          .stop();
      } catch {}
    }

    if (
      audioPublication?.track
    ) {
      try {
        await localParticipant
          .unpublishTrack(
            audioPublication.track
          );

        audioPublication
          .track
          .stop();
      } catch {}
    }

    setIsSharing(false);
  }

  /* =====================================================
     RESET METERS
     ===================================================== */

  function resetMeters() {
    momentaryEnergyRef.current =
      [];

    shortEnergyRef.current =
      [];

    integratedBlocksRef.current =
      [];

    spectrumHoldRef.current =
      [];

    spectrumHoldTimeRef.current =
      [];

    peakHoldValueRef.current =
      -60;

    truePeakHoldRef.current =
      -60;

    setAnalyzerPeak(-60);
    setTruePeak(-60);

    setLufsMomentary(
      -70
    );

    setLufsShort(
      -70
    );

    setLufsIntegrated(
      -70
    );

    setCorrelation(1);

    setClipDetected(
      false
    );

    setMessage(
      "Medidores resetados."
    );

    window.setTimeout(
      () => {
        setMessage("");
      },
      1200
    );
  }

  /* =====================================================
     STOP ANALYZER
     ===================================================== */

  function stopAnalyzer() {
    if (
      analyzerAnimationRef
        .current !== null
    ) {
      cancelAnimationFrame(
        analyzerAnimationRef
          .current
      );

      analyzerAnimationRef
        .current = null;
    }

    if (
      analyzerCloneRef.current
    ) {
      analyzerCloneRef
        .current
        .stop();

      analyzerCloneRef.current =
        null;
    }

    const context =
      analyzerAudioContextRef
        .current;

    analyzerAudioContextRef
      .current = null;

    if (
      context &&
      context.state !==
        "closed"
    ) {
      context
        .close()
        .catch(() => {});
    }

    setAnalyzerActive(
      false
    );
  }

  /* =====================================================
     PROFESSIONAL ANALYZER
     ===================================================== */

  useEffect(() => {
    const remoteTrackRef =
      screenAudioTracks.find(
        (track) =>
          !!track.publication
            .track
            ?.mediaStreamTrack
      );

    const localTrack =
      localParticipant
        .getTrackPublication(
          Track.Source
            .ScreenShareAudio
        )
        ?.track;

    const mediaTrack =
      remoteTrackRef
        ?.publication
        .track
        ?.mediaStreamTrack ||
      localTrack
        ?.mediaStreamTrack;

    if (!mediaTrack) {
      stopAnalyzer();
      return;
    }

    stopAnalyzer();

    const clonedTrack =
      mediaTrack.clone();

    analyzerCloneRef.current =
      clonedTrack;

    const stream =
      new MediaStream([
        clonedTrack,
      ]);

    const audioContext =
      new AudioContext();

    analyzerAudioContextRef.current =
      audioContext;

    const source =
      audioContext
        .createMediaStreamSource(
          stream
        );

    /*
     * =========================================
     * ANALYSIS-ONLY K-WEIGHTING
     *
     * Isto NÃO entra no áudio transmitido.
     *
     * É apenas a cadeia de medição.
     * =========================================
     */

    const kHighPass =
      audioContext
        .createBiquadFilter();

    kHighPass.type =
      "highpass";

    kHighPass.frequency.value =
      38;

    kHighPass.Q.value =
      0.5;

    const kHighShelf =
      audioContext
        .createBiquadFilter();

    kHighShelf.type =
      "highshelf";

    kHighShelf.frequency.value =
      1682;

    kHighShelf.gain.value =
      4;

    source.connect(
      kHighPass
    );

    kHighPass.connect(
      kHighShelf
    );

    /*
     * =========================================
     * MASTER ANALYZER
     * =========================================
     */

    const masterAnalyser =
      audioContext
        .createAnalyser();

    masterAnalyser.fftSize =
      8192;

    masterAnalyser.minDecibels =
      -90;

    masterAnalyser.maxDecibels =
      0;

    masterAnalyser
      .smoothingTimeConstant =
      0.08;

    kHighShelf.connect(
      masterAnalyser
    );

    /*
     * =========================================
     * UNWEIGHTED L/R
     * for stereo correlation / waves
     * =========================================
     */

    const splitter =
      audioContext
        .createChannelSplitter(2);

    source.connect(
      splitter
    );

    const leftAnalyser =
      audioContext
        .createAnalyser();

    const rightAnalyser =
      audioContext
        .createAnalyser();

    leftAnalyser.fftSize =
      4096;

    rightAnalyser.fftSize =
      4096;

    leftAnalyser
      .smoothingTimeConstant =
      0.5;

    rightAnalyser
      .smoothingTimeConstant =
      0.5;

    splitter.connect(
      leftAnalyser,
      0
    );

    try {
      splitter.connect(
        rightAnalyser,
        1
      );
    } catch {
      splitter.connect(
        rightAnalyser,
        0
      );
    }

    /*
     * =========================================
     * BUFFERS
     * =========================================
     */

    const frequencyData =
      new Float32Array(
        masterAnalyser
          .frequencyBinCount
      );

    const weightedTimeData =
      new Float32Array(
        masterAnalyser.fftSize
      );

    const leftData =
      new Float32Array(
        leftAnalyser.fftSize
      );

    const rightData =
      new Float32Array(
        rightAnalyser.fftSize
      );

    let previousSpectrum:
      number[] = [];

    let previousMono:
      number[] = [];

    let previousStereo:
      number[] = [];

    let lastMeterUpdate =
      performance.now();

    setAnalyzerActive(true);

    /* =========================================
       MAIN DRAW LOOP
       ========================================= */

    function drawAnalyzer() {
      const canvas =
        analyzerCanvasRef.current;

      if (!canvas) {
        return;
      }

      const ctx =
        canvas.getContext(
          "2d"
        );

      if (!ctx) {
        return;
      }

      const rect =
        canvas
          .getBoundingClientRect();

      const dpr =
        window.devicePixelRatio ||
        1;

      const width =
        Math.max(
          1,
          Math.floor(
            rect.width *
              dpr
          )
        );

      const height =
        Math.max(
          1,
          Math.floor(
            rect.height *
              dpr
          )
        );

      if (
        canvas.width !==
          width ||
        canvas.height !==
          height
      ) {
        canvas.width =
          width;

        canvas.height =
          height;
      }

      masterAnalyser
        .getFloatFrequencyData(
          frequencyData
        );

      masterAnalyser
        .getFloatTimeDomainData(
          weightedTimeData
        );

      leftAnalyser
        .getFloatTimeDomainData(
          leftData
        );

      rightAnalyser
        .getFloatTimeDomainData(
          rightData
        );

      /* =========================================
         SAMPLE PEAK
         ========================================= */

      let samplePeak =
        0;

      for (
        let i = 0;
        i <
        weightedTimeData.length;
        i++
      ) {
        samplePeak =
          Math.max(
            samplePeak,
            Math.abs(
              weightedTimeData[i]
            )
          );
      }

      const samplePeakDb =
        amplitudeToDb(
          samplePeak
        );

      /* =========================================
         TRUE PEAK ESTIMATION
         4x interpolation
         ========================================= */

      const truePeakAmplitude =
        estimateTruePeak4x(
          weightedTimeData
        );

      const truePeakDb =
        amplitudeToDb(
          truePeakAmplitude
        );

      /*
       * Hold the highest detected
       * value until RESET METERS.
       */

      if (
        samplePeakDb >
        peakHoldValueRef.current
      ) {
        peakHoldValueRef.current =
          samplePeakDb;
      }

      if (
        truePeakDb >
        truePeakHoldRef.current
      ) {
        truePeakHoldRef.current =
          truePeakDb;
      }

      /*
       * Clip warning.
       *
       * Visual only.
       */

      if (
        truePeakDb >=
        -0.01
      ) {
        setClipDetected(
          true
        );
      }

      /* =========================================
         WEIGHTED ENERGY
         ========================================= */

      let weightedEnergy =
        0;

      for (
        let i = 0;
        i <
        weightedTimeData.length;
        i++
      ) {
        const sample =
          weightedTimeData[i];

        weightedEnergy +=
          sample *
          sample;
      }

      weightedEnergy /=
        Math.max(
          1,
          weightedTimeData.length
        );

      /* =========================================
         CORRELATION
         ========================================= */

      const sampleCount =
        Math.min(
          leftData.length,
          rightData.length
        );

      let sumLR = 0;
      let sumL2 = 0;
      let sumR2 = 0;

      for (
        let i = 0;
        i <
        sampleCount;
        i++
      ) {
        const l =
          leftData[i];

        const r =
          rightData[i];

        sumLR +=
          l * r;

        sumL2 +=
          l * l;

        sumR2 +=
          r * r;
      }

      const corrDenominator =
        Math.sqrt(
          sumL2 *
            sumR2
        );

      let currentCorrelation =
        corrDenominator > 0
          ? sumLR /
            corrDenominator
          : 1;

      currentCorrelation =
        Math.max(
          -1,
          Math.min(
            1,
            currentCorrelation
          )
        );

      /* =========================================
         METERS UPDATE — 100ms
         ========================================= */

      const now =
        performance.now();

      if (
        now -
          lastMeterUpdate >=
        100
      ) {
        lastMeterUpdate =
          now;

        /*
         * Store 100ms energy slices.
         */

        momentaryEnergyRef
          .current
          .push(
            weightedEnergy
          );

        shortEnergyRef
          .current
          .push(
            weightedEnergy
          );

        /*
         * ~400 ms
         */

        while (
          momentaryEnergyRef
            .current
            .length > 4
        ) {
          momentaryEnergyRef
            .current
            .shift();
        }

        /*
         * ~3 sec
         */

        while (
          shortEnergyRef
            .current
            .length > 30
        ) {
          shortEnergyRef
            .current
            .shift();
        }

        const momentaryEnergy =
          averageEnergy(
            momentaryEnergyRef
              .current
          );

        const shortEnergy =
          averageEnergy(
            shortEnergyRef
              .current
          );

        const momentaryLufs =
          energyToLufs(
            momentaryEnergy
          );

        const shortLufs =
          energyToLufs(
            shortEnergy
          );

        /*
         * Integrated blocks.
         *
         * Wait until roughly 400ms
         * of history exists.
         */

        if (
          momentaryEnergyRef
            .current.length >= 4
        ) {
          const blockLufs =
            energyToLufs(
              momentaryEnergy
            );

          integratedBlocksRef
            .current
            .push({
              energy:
                momentaryEnergy,

              lufs:
                blockLufs,
            });

          /*
           * Keep memory bounded.
           * 3 hours at 10 blocks/s
           * is already far beyond
           * normal JAM sessions.
           */

          if (
            integratedBlocksRef
              .current.length >
            108000
          ) {
            integratedBlocksRef
              .current.shift();
          }
        }

        const integratedLufs =
          calculateIntegratedLufs(
            integratedBlocksRef
              .current
          );

        setAnalyzerPeak(
          round1(
            samplePeakDb
          )
        );

        setTruePeak(
          round1(
            truePeakDb
          )
        );

        setLufsMomentary(
          round1(
            momentaryLufs
          )
        );

        setLufsShort(
          round1(
            shortLufs
          )
        );

        setLufsIntegrated(
          round1(
            integratedLufs
          )
        );

        setCorrelation(
          Math.round(
            currentCorrelation *
              100
          ) /
            100
        );
      }

      /* =========================================
         PLOT DIMENSIONS
         ========================================= */

      const plotLeft =
        54 *
        dpr;

      const plotRight =
        width -
        12 *
        dpr;

      const plotTop =
        12 *
        dpr;

      const plotBottom =
        height -
        28 *
        dpr;

      const plotWidth =
        plotRight -
        plotLeft;

      const plotHeight =
        plotBottom -
        plotTop;

      /* =========================================
         BACKGROUND
         ========================================= */

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      const background =
        ctx.createLinearGradient(
          0,
          0,
          width,
          height
        );

      background.addColorStop(
        0,
        "rgba(2,7,9,1)"
      );

      background.addColorStop(
        0.5,
        "rgba(2,8,9,1)"
      );

      background.addColorStop(
        1,
        "rgba(5,4,12,1)"
      );

      ctx.fillStyle =
        background;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      /* =========================================
         DB GRID
         ========================================= */

      const dbMarks = [
        0,
        -12,
        -24,
        -36,
        -48,
        -60,
        -72,
      ];

      ctx.font =
        `${9 * dpr}px Arial`;

      ctx.textAlign =
        "right";

      ctx.textBaseline =
        "middle";

      for (
        const db of dbMarks
      ) {
        const normalized =
          (db + 72) /
          72;

        const y =
          plotBottom -
          normalized *
            plotHeight;

        ctx.beginPath();

        ctx.moveTo(
          plotLeft,
          y
        );

        ctx.lineTo(
          plotRight,
          y
        );

        ctx.strokeStyle =
          db === 0
            ? "rgba(139,92,246,0.20)"
            : "rgba(255,255,255,0.055)";

        ctx.lineWidth =
          dpr;

        ctx.stroke();

        ctx.fillStyle =
          "rgba(255,255,255,0.28)";

        ctx.fillText(
          `${db}`,
          plotLeft -
            8 *
              dpr,
          y
        );
      }

      /* =========================================
         FREQUENCY GRID
         ========================================= */

      const minFreq = 20;

      const maxFreq =
        Math.min(
          20000,
          audioContext.sampleRate /
            2
        );

      const frequencyMarks =
        [
          20,
          50,
          100,
          200,
          500,
          1000,
          2000,
          5000,
          10000,
          20000,
        ];

      function frequencyToX(
        frequency: number
      ) {
        const normalized =
          Math.log(
            frequency /
              minFreq
          ) /
          Math.log(
            maxFreq /
              minFreq
          );

        return (
          plotLeft +
          normalized *
            plotWidth
        );
      }

      for (
        const frequency of
          frequencyMarks
      ) {
        if (
          frequency >
          maxFreq
        ) {
          continue;
        }

        const x =
          frequencyToX(
            frequency
          );

        ctx.beginPath();

        ctx.moveTo(
          x,
          plotTop
        );

        ctx.lineTo(
          x,
          plotBottom
        );

        ctx.strokeStyle =
          "rgba(255,255,255,0.04)";

        ctx.lineWidth =
          dpr;

        ctx.stroke();
      }

      /* =========================================
         SPECTRUM DATA
         ========================================= */

      const spectrumPoints =
        160;

      const nyquist =
        audioContext.sampleRate /
        2;

      const spectrumValues:
        number[] = [];

      for (
        let point = 0;
        point <
        spectrumPoints;
        point++
      ) {
        const position =
          point /
          (
            spectrumPoints -
            1
          );

        const frequency =
          minFreq *
          Math.pow(
            maxFreq /
              minFreq,
            position
          );

        const bin =
          Math.min(
            frequencyData.length -
              1,

            Math.max(
              0,

              Math.round(
                frequency /
                  nyquist *
                  frequencyData.length
              )
            )
          );

        const db =
          frequencyData[
            bin
          ];

        const normalized =
          Number.isFinite(
            db
          )
            ? Math.max(
                0,
                Math.min(
                  1,
                  (db + 72) /
                    72
                )
              )
            : 0;

        const previous =
          previousSpectrum[
            point
          ] ??
          normalized;

        /*
         * Fast attack
         * Slow release
         */

        const attack =
          0.56;

        const release =
          0.085;

        const smooth =
          normalized >
          previous
            ? previous +
              (
                normalized -
                previous
              ) *
                attack
            : previous +
              (
                normalized -
                previous
              ) *
                release;

        spectrumValues.push(
          smooth
        );

        /* Peak Hold */

        const oldHold =
          spectrumHoldRef
            .current[
            point
          ] ??
          smooth;

        const oldTime =
          spectrumHoldTimeRef
            .current[
            point
          ] ??
          now;

        if (
          smooth >
          oldHold
        ) {
          spectrumHoldRef
            .current[
            point
          ] =
            smooth;

          spectrumHoldTimeRef
            .current[
            point
          ] =
            now;
        } else if (
          now -
            oldTime >
          900
        ) {
          spectrumHoldRef
            .current[
            point
          ] =
            Math.max(
              smooth,
              oldHold -
                0.003
            );
        }
      }

      previousSpectrum =
        spectrumValues;

      /* =========================================
         SPECTRUM COLORS
         ========================================= */

      const spectrumGradient =
        ctx.createLinearGradient(
          plotLeft,
          0,
          plotRight,
          0
        );

      spectrumGradient.addColorStop(
        0,
        "rgba(139,92,246,0.62)"
      );

      spectrumGradient.addColorStop(
        0.24,
        "rgba(168,85,247,0.62)"
      );

      spectrumGradient.addColorStop(
        0.43,
        "rgba(52,211,153,0.68)"
      );

      spectrumGradient.addColorStop(
        0.67,
        "rgba(34,211,238,0.70)"
      );

      spectrumGradient.addColorStop(
        0.85,
        "rgba(59,130,246,0.66)"
      );

      spectrumGradient.addColorStop(
        1,
        "rgba(139,92,246,0.60)"
      );

      const spectrumLineGradient =
        ctx.createLinearGradient(
          plotLeft,
          0,
          plotRight,
          0
        );

      spectrumLineGradient.addColorStop(
        0,
        "#8B5CF6"
      );

      spectrumLineGradient.addColorStop(
        0.25,
        "#A855F7"
      );

      spectrumLineGradient.addColorStop(
        0.44,
        "#34D399"
      );

      spectrumLineGradient.addColorStop(
        0.68,
        "#22D3EE"
      );

      spectrumLineGradient.addColorStop(
        0.85,
        "#3B82F6"
      );

      spectrumLineGradient.addColorStop(
        1,
        "#8B5CF6"
      );

      /* =========================================
         COORDINATES
         ========================================= */

      const spectrumCoordinates:
        SpectrumPoint[] =
          spectrumValues.map(
            (
              value,
              index
            ) => {
              const x =
                plotLeft +
                index /
                  (
                    spectrumValues.length -
                    1
                  ) *
                  plotWidth;

              const y =
                plotBottom -
                value *
                  plotHeight;

              return {
                x,
                y,
                value,
              };
            }
          );

      /* =========================================
         TRANSLUCENT BARS
         ========================================= */

      const spacing =
        plotWidth /
        spectrumPoints;

      ctx.fillStyle =
        spectrumGradient;

      ctx.globalAlpha =
        0.27;

      for (
        const point of
          spectrumCoordinates
      ) {
        const barWidth =
          Math.max(
            dpr,

            spacing *
              0.5
          );

        ctx.fillRect(
          point.x -
            barWidth /
              2,

          point.y,

          barWidth,

          plotBottom -
            point.y
        );
      }

      ctx.globalAlpha =
        1;

      /* =========================================
         FILLED SPECTRUM AREA
         ========================================= */

      const verticalFill =
        ctx.createLinearGradient(
          0,
          plotTop,
          0,
          plotBottom
        );

      verticalFill.addColorStop(
        0,
        "rgba(139,92,246,0.20)"
      );

      verticalFill.addColorStop(
        0.45,
        "rgba(34,211,238,0.105)"
      );

      verticalFill.addColorStop(
        1,
        "rgba(52,211,153,0.012)"
      );

      drawSpectrumArea(
        ctx,
        spectrumCoordinates,
        plotBottom,
        verticalFill
      );

      /* =========================================
         MAIN CURVE
         ========================================= */

      drawSpectrumCurve(
        ctx,
        spectrumCoordinates,
        spectrumLineGradient,
        2.1 *
          dpr,
        13 *
          dpr,
        "rgba(34,211,238,0.38)"
      );

      /* =========================================
         PEAK HOLD CURVE
         ========================================= */

      const holdCoordinates =
        spectrumCoordinates.map(
          (
            point,
            index
          ) => {
            const hold =
              spectrumHoldRef
                .current[
                index
              ] ??
              point.value;

            return {
              x: point.x,

              y:
                plotBottom -
                hold *
                  plotHeight,

              value:
                hold,
            };
          }
        );

      ctx.save();

      ctx.globalAlpha =
        0.48;

      drawSpectrumCurve(
        ctx,
        holdCoordinates,
        spectrumLineGradient,
        0.75 *
          dpr,
        4 *
          dpr,
        "rgba(139,92,246,0.38)"
      );

      ctx.restore();

      /* =========================================
         MONO / STEREO WAVES
         ========================================= */

      const visualPoints =
        180;

      const monoValues:
        number[] = [];

      const stereoValues:
        number[] = [];

      for (
        let point = 0;
        point <
        visualPoints;
        point++
      ) {
        const index =
          Math.min(
            sampleCount -
              1,

            Math.floor(
              point /
                (
                  visualPoints -
                  1
                ) *
                (
                  sampleCount -
                  1
                )
            )
          );

        const left =
          leftData[
            index
          ];

        const right =
          rightData[
            index
          ];

        const mono =
          (
            left +
            right
          ) *
          0.5;

        const stereo =
          (
            left -
            right
          ) *
          0.5;

        const previousMonoValue =
          previousMono[
            point
          ] ??
          mono;

        const previousStereoValue =
          previousStereo[
            point
          ] ??
          stereo;

        monoValues.push(
          previousMonoValue *
            0.72 +
          mono *
            0.28
        );

        stereoValues.push(
          previousStereoValue *
            0.72 +
          stereo *
            0.28
        );
      }

      previousMono =
        monoValues;

      previousStereo =
        stereoValues;

      /*
       * Waves near bottom,
       * behind/under spectrum.
       */

      const waveCenter =
        plotBottom -
        26 *
          dpr;

      drawSmoothWave(
        ctx,
        monoValues,
        plotLeft,
        plotRight,
        waveCenter,
        36 *
          dpr,
        dpr,
        "rgba(52,211,153,0.92)",
        "rgba(52,211,153,0.50)"
      );

      drawSmoothWave(
        ctx,
        stereoValues,
        plotLeft,
        plotRight,
        waveCenter,
        43 *
          dpr,
        dpr,
        "rgba(34,211,238,0.92)",
        "rgba(59,130,246,0.52)"
      );

      analyzerAnimationRef.current =
        requestAnimationFrame(
          drawAnalyzer
        );
    }

    if (
      audioContext.state ===
      "suspended"
    ) {
      audioContext
        .resume()
        .catch(() => {});
    }

    drawAnalyzer();

    return () => {
      if (
        analyzerAnimationRef
          .current !== null
      ) {
        cancelAnimationFrame(
          analyzerAnimationRef
            .current
        );

        analyzerAnimationRef
          .current = null;
      }

      clonedTrack.stop();

      if (
        analyzerCloneRef.current ===
        clonedTrack
      ) {
        analyzerCloneRef.current =
          null;
      }

      if (
        audioContext.state !==
        "closed"
      ) {
        audioContext
          .close()
          .catch(() => {});
      }

      if (
        analyzerAudioContextRef
          .current ===
        audioContext
      ) {
        analyzerAudioContextRef
          .current = null;
      }
    };
  }, [
    screenAudioTracks,
    localParticipant,
    isSharing,
  ]);

  /* =====================================================
     FULLSCREEN
     ===================================================== */

  async function toggleFullscreen() {
    try {
      if (
        document.fullscreenElement
      ) {
        await document
          .exitFullscreen();

        return;
      }

      if (!activeScreenTrack) {
        setMessage(
          "Nenhuma transmissão ativa."
        );

        return;
      }

      await transmissionRef
        .current
        ?.requestFullscreen();
    } catch (error) {
      console.error(
        "Erro fullscreen:",
        error
      );
    }
  }

  useEffect(() => {
    function change() {
      setIsFullscreen(
        !!document
          .fullscreenElement
      );
    }

    document.addEventListener(
      "fullscreenchange",
      change
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        change
      );
    };
  }, []);

  useEffect(() => {
    function key(
      event: KeyboardEvent
    ) {
      const target =
        event.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (
        event.code !== "KeyF" ||
        event.repeat
      ) {
        return;
      }

      event.preventDefault();

      toggleFullscreen();
    }

    window.addEventListener(
      "keydown",
      key
    );

    return () => {
      window.removeEventListener(
        "keydown",
        key
      );
    };
  }, [
    activeScreenTrack,
  ]);

  /* =====================================================
     MIC TEST
     ===================================================== */

  async function startMicMonitor() {
    try {
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

      const track =
        publication?.track;

      if (!track) {
        return;
      }

      const original =
        track.mediaStreamTrack;

      if (!original) {
        return;
      }

      const clone =
        original.clone();

      micMonitorTrackRef.current =
        clone;

      const context =
        new AudioContext();

      micAudioContextRef.current =
        context;

      const stream =
        new MediaStream([
          clone,
        ]);

      const source =
        context
          .createMediaStreamSource(
            stream
          );

      const analyser =
        context
          .createAnalyser();

      analyser.fftSize =
        2048;

      analyser
        .smoothingTimeConstant =
        0.45;

      source.connect(
        analyser
      );

      const samples =
        new Float32Array(
          analyser.fftSize
        );

      setMonitoring(true);

      function draw() {
        analyser
          .getFloatTimeDomainData(
            samples
          );

        let energy = 0;

        for (
          let i = 0;
          i <
          samples.length;
          i++
        ) {
          energy +=
            samples[i] *
            samples[i];
        }

        const rms =
          Math.sqrt(
            energy /
              samples.length
          );

        const db =
          Math.max(
            -60,
            Math.min(
              0,
              amplitudeToDb(
                rms
              )
            )
          );

        setMicLevel(
          Math.round(db)
        );

        setIsSpeaking(
          db >=
            sensitivityRef.current
        );

        micAnimationRef.current =
          requestAnimationFrame(
            draw
          );
      }

      draw();
    } catch (error) {
      console.error(
        "Erro mic meter:",
        error
      );
    }
  }

  function stopMicMonitor() {
    if (
      micAnimationRef.current !==
      null
    ) {
      cancelAnimationFrame(
        micAnimationRef.current
      );

      micAnimationRef.current =
        null;
    }

    if (
      micMonitorTrackRef.current
    ) {
      micMonitorTrackRef
        .current
        .stop();

      micMonitorTrackRef.current =
        null;
    }

    const context =
      micAudioContextRef.current;

    micAudioContextRef.current =
      null;

    if (
      context &&
      context.state !==
        "closed"
    ) {
      context
        .close()
        .catch(() => {});
    }

    setMonitoring(false);
    setMicLevel(-60);
    setIsSpeaking(false);
  }

  /* =====================================================
     INVITE
     ===================================================== */

  async function copyInvite() {
    try {
      await navigator
        .clipboard
        .writeText(
          `${window.location.origin}/room/${roomName}`
        );

      setMessage(
        "Link copiado."
      );

      window.setTimeout(
        () => {
          setMessage("");
        },
        1800
      );
    } catch {}
  }

  /* =====================================================
     LEAVE
     ===================================================== */

  async function leaveRoom() {
    try {
      stopMicMonitor();
      stopAnalyzer();

      if (
        document.fullscreenElement
      ) {
        try {
          await document
            .exitFullscreen();
        } catch {}
      }

      if (isSharing) {
        try {
          await stopScreenShare();
        } catch {}
      }

      try {
        await localParticipant
          .setMicrophoneEnabled(
            false
          );
      } catch {}

      try {
        await room.disconnect();
      } catch {}

      router.push("/");
    } catch {
      router.push("/");
    }
  }

  /* =====================================================
     REMOTE AUDIO
     ===================================================== */

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

  /* =====================================================
     UI
     ===================================================== */

  return (
    <main className="min-h-screen bg-[#030706] p-4 text-white md:p-8">

      {/* AUDIO PLAYBACK */}

      <div className="hidden">

        {remoteScreenAudio.map(
          (track) => (
            <AudioTrack
              key={`${track.participant.identity}-screen`}
              trackRef={track}
              volume={
                transmissionVolume /
                100
              }
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

      {/* MAIN WINDOW */}

      <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-white/10 bg-[#07100f] shadow-2xl">

        {/* TOP BAR */}

        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">

          <div className="flex items-center gap-2">

            <span className="h-3 w-3 rounded-full bg-purple-500" />

            <span className="h-3 w-3 rounded-full bg-cyan-400" />

            <span className="h-3 w-3 rounded-full bg-emerald-400" />

          </div>

          <button
            type="button"
            onClick={
              leaveRoom
            }
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            ← VOLTAR AO MENU
          </button>

        </div>

        <div className="relative p-6 md:p-10">

          {/* HEADER */}

          <header className="mb-8 flex flex-wrap items-center justify-between gap-5">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-400">

                <div className="flex h-5 items-end gap-[3px]">

                  <span className="h-2 w-[3px] rounded-full bg-purple-400" />

                  <span className="h-4 w-[3px] rounded-full bg-emerald-400" />

                  <span className="h-5 w-[3px] rounded-full bg-cyan-400" />

                  <span className="h-3 w-[3px] rounded-full bg-purple-400" />

                </div>

              </div>

              <span className="bg-gradient-to-r from-purple-400 via-emerald-400 to-cyan-400 bg-clip-text text-4xl font-black text-transparent">
                JAM
              </span>

            </div>

            <div className="flex items-center gap-4">

              <span
                className={
                  isConnected
                    ? "text-emerald-400"
                    : "text-purple-300"
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
              </span>

              <span>
                Sala{" "}

                <b className="text-cyan-400">
                  {roomName}
                </b>
              </span>

            </div>

            <div className="text-white/50">
              👤{" "}
              {participants.length}
              {" "}/ 10
            </div>

          </header>

          {message && (
            <div className="mx-auto mb-5 max-w-5xl rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-center text-sm text-cyan-300">
              {message}
            </div>
          )}

          {/* =================================================
              TRANSMISSION
              ================================================= */}

          <section
            ref={
              transmissionRef
            }
            className={`mx-auto max-w-5xl overflow-hidden bg-[#020605] ${
              isFullscreen
                ? "flex h-screen max-w-none flex-col p-4"
                : "rounded-[26px] border border-white/10 p-4 md:p-6"
            }`}
          >

            {activeScreenTrack ? (
              <div
                className={
                  isFullscreen
                    ? "flex h-full min-h-0 flex-col"
                    : ""
                }
              >

                <div className="mb-3 flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />

                    <span className="text-xs font-semibold tracking-wide text-white/30">
                      LIVE TRANSMISSION
                    </span>

                  </div>

                  <button
                    type="button"
                    onClick={
                      toggleFullscreen
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs text-cyan-300"
                  >
                    {isFullscreen
                      ? "✕ SAIR FULLSCREEN"
                      : "⛶ FULLSCREEN"}
                  </button>

                </div>

                <div
                  className={`overflow-hidden rounded-2xl border border-emerald-400/40 bg-black ${
                    isFullscreen
                      ? "flex min-h-0 flex-1 items-center justify-center"
                      : ""
                  }`}
                >

                  <VideoTrack
                    trackRef={
                      activeScreenTrack
                    }
                    className={
                      isFullscreen
                        ? "h-full w-full object-contain"
                        : "aspect-video w-full object-contain"
                    }
                  />

                </div>

              </div>
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">

                <div className="mb-7 flex h-32 w-48 items-center justify-center rounded-2xl border-2 border-emerald-400/50 bg-emerald-400/5">

                  <span className="text-6xl text-cyan-400">
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
                  className={`mt-8 rounded-2xl px-10 py-5 font-black ${
                    someoneElseSharing ||
                    !isConnected
                      ? "cursor-not-allowed border border-white/10 text-white/20"
                      : "bg-gradient-to-r from-purple-500 via-emerald-400 to-cyan-400 text-black"
                  }`}
                >
                  {someoneElseSharing
                    ? "▣ TELA EM USO"
                    : "▣ COMPARTILHAR TELA"}
                </button>

              </div>
            )}

          </section>

          {/* =================================================
              PROFESSIONAL ANALYZER
              ================================================= */}

          <section className="mx-auto mt-4 max-w-5xl rounded-[24px] border border-emerald-400/15 bg-black/30 p-5">

            {/* Analyzer header */}

            <div className="flex flex-wrap items-start justify-between gap-5">

              <div>

                <div className="flex items-center gap-2">

                  <span
                    className={`h-2 w-2 rounded-full ${
                      analyzerActive
                        ? "animate-pulse bg-emerald-400"
                        : "bg-white/20"
                    }`}
                  />

                  <p className="font-semibold tracking-wide">
                    JAM AUDIO ANALYZER
                  </p>

                </div>

                <p className="mt-1 text-xs text-white/30">
                  Spectrum • Loudness • True Peak • Stereo Field
                </p>

              </div>

              <button
                type="button"
                onClick={
                  resetMeters
                }
                className="rounded-lg border border-purple-400/20 bg-purple-400/[0.03] px-3 py-2 text-xs font-semibold text-purple-300 transition hover:bg-purple-400/[0.08]"
              >
                ↺ RESET METERS
              </button>

            </div>

            {/* Meter cards */}

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">

              <AnalyzerValue
                label="PEAK"
                value={`${analyzerPeak.toFixed(
                  1
                )}`}
                unit="dBFS"
              />

              <AnalyzerValue
                label="TRUE PEAK"
                value={`${truePeak.toFixed(
                  1
                )}`}
                unit="dBTP"
                warning={
                  truePeak >
                  -0.1
                }
              />

              <AnalyzerValue
                label="LUFS-M"
                value={
                  lufsMomentary.toFixed(
                    1
                  )
                }
                unit="LUFS"
              />

              <AnalyzerValue
                label="LUFS-S"
                value={
                  lufsShort.toFixed(
                    1
                  )
                }
                unit="LUFS"
              />

              <AnalyzerValue
                label="LUFS-I"
                value={
                  lufsIntegrated.toFixed(
                    1
                  )
                }
                unit="LUFS"
              />

              <AnalyzerValue
                label="CORR"
                value={
                  correlation.toFixed(
                    2
                  )
                }
                warning={
                  correlation < 0
                }
              />

              {/* CLIP */}

              <div
                className={`rounded-xl border px-3 py-2 ${
                  clipDetected
                    ? "border-purple-400/50 bg-purple-500/10"
                    : "border-emerald-400/15 bg-emerald-400/[0.025]"
                }`}
              >

                <p className="text-[9px] tracking-widest text-white/25">
                  CLIP
                </p>

                <div className="mt-2 flex items-center gap-2">

                  <span
                    className={`h-2 w-2 rounded-full ${
                      clipDetected
                        ? "animate-pulse bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                        : "bg-emerald-400"
                    }`}
                  />

                  <p
                    className={`font-mono text-sm font-bold ${
                      clipDetected
                        ? "text-purple-300"
                        : "text-emerald-300"
                    }`}
                  >
                    {clipDetected
                      ? "CLIP"
                      : "SAFE"}
                  </p>

                </div>

              </div>

            </div>

            {/* Legend */}

            <div className="mt-5 flex flex-wrap items-center gap-5 text-xs">

              <AnalyzerLegend
                label="SPECTRUM"
                className="bg-gradient-to-r from-purple-500 via-emerald-400 to-cyan-400"
              />

              <AnalyzerLegend
                label="PEAK HOLD"
                className="bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
              />

              <AnalyzerLegend
                label="MONO"
                className="bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]"
              />

              <AnalyzerLegend
                label="STEREO"
                className="bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.55)]"
              />

            </div>

            {/* Canvas */}

            <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-black">

              <canvas
                ref={
                  analyzerCanvasRef
                }
                className="h-[330px] w-full"
              />

              {!analyzerActive && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                  <p className="text-xs tracking-wide text-white/20">
                    AGUARDANDO ÁUDIO DA TRANSMISSÃO
                  </p>

                </div>
              )}

            </div>

            {/* Frequency legend */}

            <div className="ml-[54px] mt-2 flex justify-between font-mono text-[9px] text-white/25">

              <span>20</span>
              <span>50</span>
              <span>100</span>
              <span>200</span>
              <span>500</span>
              <span>1k</span>
              <span>2k</span>
              <span>5k</span>
              <span>10k</span>
              <span>20k</span>

            </div>

            <div className="mt-3 flex flex-wrap justify-between gap-3 text-[9px] tracking-widest text-white/20">

              <span>
                FFT 8192
              </span>

              <span>
                20 Hz – 20 kHz
              </span>

              <span>
                RANGE 0 / -72 dB
              </span>

              <span>
                K-WEIGHTED LOUDNESS
              </span>

              <span>
                TRUE PEAK 4X EST.
              </span>

            </div>

          </section>

          {/* =================================================
              VOLUME
              ================================================= */}

          <section className="mx-auto mt-4 max-w-5xl rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4">

            <div className="flex flex-col gap-4 md:flex-row md:items-center">

              <div className="min-w-[170px]">

                <p className="font-semibold">
                  🔊 TRANSMISSÃO
                </p>

                <p className="text-xs text-white/30">
                  Volume somente para você
                </p>

              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={
                  transmissionVolume
                }
                onChange={(event) =>
                  setTransmissionVolume(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="flex-1 accent-cyan-400"
              />

              <span className="min-w-[60px] text-right font-bold text-cyan-400">
                {transmissionVolume}%
              </span>

            </div>

          </section>

          {/* =================================================
              PARTICIPANTS
              ================================================= */}

          <section className="mx-auto mt-6 max-w-5xl rounded-[24px] border border-white/10 bg-white/[0.025] p-5">

            <div className="mb-4 flex items-center justify-between">

              <span>
                ♫ Participantes
              </span>

              <span className="text-sm text-white/40">
                {participants.length}
                {" "}/ 10
              </span>

            </div>

            <div className="space-y-2">

              {participants.map(
                (participant) => (
                  <div
                    key={
                      participant.identity
                    }
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4"
                  >

                    <div>

                      <p>
                        {participant.name ||
                          participant.identity}
                      </p>

                      {participant.identity ===
                        localParticipant.identity && (
                        <p className="mt-1 text-xs text-white/25">
                          Você
                        </p>
                      )}

                    </div>

                    <span>
                      {participant
                        .isMicrophoneEnabled
                        ? "🎤"
                        : "🔇"}
                    </span>

                  </div>
                )
              )}

            </div>

          </section>

          {/* =================================================
              CONTROLS
              ================================================= */}

          <div className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-5">

            <button
              type="button"
              onClick={
                toggleMicrophone
              }
              disabled={
                pushToTalk
              }
              className={`rounded-2xl border px-5 py-4 font-semibold ${
                pushToTalk
                  ? "border-purple-400/30 text-purple-300"
                  : micOn
                  ? "border-emerald-400/30 text-emerald-400"
                  : "border-cyan-400/20 text-cyan-300"
              }`}
            >
              {pushToTalk
                ? pushToTalkActive
                  ? "🎙 FALANDO"
                  : "🎙 PTT ATIVO"
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
                className="rounded-2xl border border-cyan-400/30 px-5 py-4 text-cyan-400 disabled:opacity-30"
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
                className="rounded-2xl border border-purple-400/30 px-5 py-4 text-purple-300"
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
              className={`rounded-2xl border px-5 py-4 ${
                shiuuu
                  ? "border-purple-400 bg-purple-400/5 text-purple-300"
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
              onClick={
                copyInvite
              }
              className="rounded-2xl border border-cyan-400/30 px-5 py-4 text-cyan-400"
            >
              🔗 CONVIDAR
            </button>

            <button
              type="button"
              onClick={() =>
                setConfigOpen(
                  true
                )
              }
              className="rounded-2xl border border-white/10 px-5 py-4 text-white/60"
            >
              ⚙ CONFIG
            </button>

          </div>

          {/* SHORTCUTS */}

          <div className="mx-auto mt-5 flex max-w-5xl flex-wrap justify-center gap-3 text-xs text-white/30">

            <span className="rounded-lg border border-purple-400/15 px-3 py-2">
              M · MUTE
            </span>

            <span className="rounded-lg border border-emerald-400/15 px-3 py-2">
              ESPAÇO · PTT
            </span>

            <span className="rounded-lg border border-cyan-400/15 px-3 py-2">
              F · FULLSCREEN
            </span>

            <span className="rounded-lg border border-purple-400/15 px-3 py-2">
              ESC · SAIR
            </span>

          </div>

          {pushToTalk && (
            <div className="mx-auto mt-5 max-w-5xl rounded-xl border border-cyan-400/15 bg-cyan-400/[0.03] px-4 py-3 text-center text-sm">

              <span
                className={
                  pushToTalkActive
                    ? "font-bold text-emerald-400"
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

      {/* =================================================
          CONFIG
          ================================================= */}

      {configOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5">

          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-emerald-400/30 bg-[#07100f] p-7">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold">
                  Configurações do microfone
                </h2>

                <p className="mt-1 text-sm text-white/40">
                  Preferências individuais salvas.
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  stopMicMonitor();

                  setConfigOpen(
                    false
                  );
                }}
                className="text-xl text-white/40"
              >
                ×
              </button>

            </div>

            <div className="mt-7 space-y-6">

              <SettingToggle
                label="Aperte para Falar"
                description="Segure ESPAÇO para falar."
                value={
                  pushToTalk
                }
                onChange={
                  setPushToTalkMode
                }
              />

              <SettingToggle
                label="Supressão de ruído"
                description="Somente no microfone."
                value={
                  noiseSuppression
                }
                onChange={
                  setNoiseSuppression
                }
              />

              <SettingToggle
                label="Cancelamento de eco"
                description="Somente no microfone."
                value={
                  echoCancellation
                }
                onChange={
                  setEchoCancellation
                }
              />

              <SettingToggle
                label="Ganho automático"
                description="Somente no microfone."
                value={
                  autoGainControl
                }
                onChange={
                  setAutoGainControl
                }
              />

              {/* SENSITIVITY */}

              <div>

                <div className="flex justify-between">

                  <span>
                    Sensibilidade
                  </span>

                  <span className="text-cyan-400">
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
                  onChange={(event) =>
                    setSensitivity(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="mt-4 w-full accent-purple-400"
                />

              </div>

              {/* MIC TEST */}

              <div className="rounded-xl border border-white/10 p-5">

                <div className="flex items-center justify-between">

                  <span>
                    Teste do microfone
                  </span>

                  <span
                    className={
                      isSpeaking
                        ? "text-emerald-400"
                        : "text-white/30"
                    }
                  >
                    {isSpeaking
                      ? "VOZ DETECTADA"
                      : monitoring
                      ? "SILÊNCIO"
                      : "PARADO"}
                  </span>

                </div>

                <div className="relative mt-4 h-4 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-emerald-400 to-cyan-400"
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

                <div className="mt-2 flex justify-between text-xs text-white/25">

                  <span>
                    -60 dB
                  </span>

                  <span>
                    {micLevel} dB
                  </span>

                  <span>
                    0 dB
                  </span>

                </div>

                <div className="mt-4 flex gap-3">

                  <button
                    type="button"
                    onClick={
                      startMicMonitor
                    }
                    className="flex-1 rounded-xl border border-emerald-400/30 px-4 py-3 text-emerald-400"
                  >
                    TESTAR MIC
                  </button>

                  <button
                    type="button"
                    onClick={
                      stopMicMonitor
                    }
                    className="rounded-xl border border-white/10 px-4 py-3 text-white/50"
                  >
                    PARAR
                  </button>

                </div>

              </div>

              {/* ANALYZER INFO */}

              <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.03] p-5">

                <p className="font-semibold text-cyan-300">
                  🎧 JAM Analyzer
                </p>

                <div className="mt-4 space-y-2 text-sm text-white/40">

                  <p>
                    ✓ LUFS Momentary
                  </p>

                  <p>
                    ✓ LUFS Short-Term
                  </p>

                  <p>
                    ✓ LUFS Integrated
                  </p>

                  <p>
                    ✓ K-Weighting na medição
                  </p>

                  <p>
                    ✓ True Peak estimado 4x
                  </p>

                  <p>
                    ✓ CLIP somente visual
                  </p>

                  <p>
                    ✓ Spectrum FFT 8192
                  </p>

                  <p>
                    ✓ Peak Hold
                  </p>

                  <p>
                    ✓ Nenhum processamento é aplicado ao áudio transmitido
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  resetAudioPreferences
                }
                className="w-full rounded-xl border border-purple-400/15 px-4 py-3 text-white/40"
              >
                RESTAURAR PADRÕES
              </button>

            </div>

            <div className="mt-8 flex gap-3">

              <button
                type="button"
                onClick={() => {
                  stopMicMonitor();

                  setConfigOpen(
                    false
                  );
                }}
                className="flex-1 rounded-xl border border-white/10 py-4"
              >
                CANCELAR
              </button>

              <button
                type="button"
                onClick={
                  applyMicrophoneSettings
                }
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 via-emerald-400 to-cyan-400 py-4 font-bold text-black"
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

/* =====================================================
   HELPERS
   ===================================================== */

function wait(
  ms: number
) {
  return new Promise<void>(
    (resolve) =>
      setTimeout(
        resolve,
        ms
      )
  );
}

/* =====================================================
   DB
   ===================================================== */

function amplitudeToDb(
  amplitude: number
) {
  if (
    amplitude <= 0
  ) {
    return -60;
  }

  return Math.max(
    -60,
    20 *
      Math.log10(
        amplitude
      )
  );
}

function round1(
  value: number
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return -70;
  }

  return (
    Math.round(
      value *
        10
    ) /
    10
  );
}

/* =====================================================
   TRUE PEAK ESTIMATION

   Linear 4x oversampling approximation.

   This is measurement only.
   ===================================================== */

function estimateTruePeak4x(
  samples: Float32Array
) {
  let peak =
    0;

  for (
    let i = 0;
    i <
    samples.length -
      1;
    i++
  ) {
    const a =
      samples[i];

    const b =
      samples[
        i +
        1
      ];

    peak =
      Math.max(
        peak,
        Math.abs(a),
        Math.abs(b)
      );

    /*
     * Three inserted samples
     * between original samples.
     */

    for (
      let step = 1;
      step < 4;
      step++
    ) {
      const t =
        step /
        4;

      const interpolated =
        a +
        (
          b -
          a
        ) *
          t;

      peak =
        Math.max(
          peak,
          Math.abs(
            interpolated
          )
        );
    }
  }

  return peak;
}

/* =====================================================
   LUFS
   ===================================================== */

function averageEnergy(
  values: number[]
) {
  if (
    values.length ===
    0
  ) {
    return 0;
  }

  let total = 0;

  for (
    const value of values
  ) {
    total +=
      value;
  }

  return (
    total /
    values.length
  );
}

function energyToLufs(
  energy: number
) {
  if (
    energy <= 0
  ) {
    return LUFS_FLOOR;
  }

  return Math.max(
    LUFS_FLOOR,

    -0.691 +
      10 *
        Math.log10(
          energy
        )
  );
}

/*
 * Approximate BS.1770-style
 * integrated gating:
 *
 * 1. Absolute gate at -70 LUFS
 * 2. Calculate ungated loudness
 * 3. Relative gate at -10 LU
 * 4. Recalculate final energy
 */

function calculateIntegratedLufs(
  blocks: IntegratedBlock[]
) {
  if (
    blocks.length ===
    0
  ) {
    return LUFS_FLOOR;
  }

  const absoluteGated =
    blocks.filter(
      (block) =>
        block.lufs >
        -70
    );

  if (
    absoluteGated.length ===
    0
  ) {
    return LUFS_FLOOR;
  }

  const ungatedEnergy =
    averageEnergy(
      absoluteGated.map(
        (block) =>
          block.energy
      )
    );

  const ungatedLufs =
    energyToLufs(
      ungatedEnergy
    );

  const relativeGate =
    ungatedLufs -
    10;

  const relativeGated =
    absoluteGated.filter(
      (block) =>
        block.lufs >=
        relativeGate
    );

  if (
    relativeGated.length ===
    0
  ) {
    return ungatedLufs;
  }

  const finalEnergy =
    averageEnergy(
      relativeGated.map(
        (block) =>
          block.energy
      )
    );

  return energyToLufs(
    finalEnergy
  );
}

/* =====================================================
   DRAW SPECTRUM AREA
   ===================================================== */

function drawSpectrumArea(
  ctx: CanvasRenderingContext2D,
  points: SpectrumPoint[],
  bottom: number,
  fill:
    | string
    | CanvasGradient
) {
  if (
    points.length <
    2
  ) {
    return;
  }

  ctx.beginPath();

  ctx.moveTo(
    points[0].x,
    bottom
  );

  ctx.lineTo(
    points[0].x,
    points[0].y
  );

  for (
    let i = 0;
    i <
    points.length -
      1;
    i++
  ) {
    const current =
      points[i];

    const next =
      points[
        i +
        1
      ];

    const middleX =
      (
        current.x +
        next.x
      ) /
      2;

    const middleY =
      (
        current.y +
        next.y
      ) /
      2;

    ctx.quadraticCurveTo(
      current.x,
      current.y,
      middleX,
      middleY
    );
  }

  const last =
    points[
      points.length -
        1
    ];

  ctx.lineTo(
    last.x,
    last.y
  );

  ctx.lineTo(
    last.x,
    bottom
  );

  ctx.closePath();

  ctx.fillStyle =
    fill;

  ctx.fill();
}

/* =====================================================
   DRAW SPECTRUM CURVE
   ===================================================== */

function drawSpectrumCurve(
  ctx: CanvasRenderingContext2D,
  points: SpectrumPoint[],
  stroke:
    | string
    | CanvasGradient,
  lineWidth: number,
  shadowBlur: number,
  shadowColor: string
) {
  if (
    points.length <
    2
  ) {
    return;
  }

  ctx.save();

  ctx.beginPath();

  ctx.moveTo(
    points[0].x,
    points[0].y
  );

  for (
    let i = 0;
    i <
    points.length -
      1;
    i++
  ) {
    const current =
      points[i];

    const next =
      points[
        i +
        1
      ];

    const middleX =
      (
        current.x +
        next.x
      ) /
      2;

    const middleY =
      (
        current.y +
        next.y
      ) /
      2;

    ctx.quadraticCurveTo(
      current.x,
      current.y,
      middleX,
      middleY
    );
  }

  const last =
    points[
      points.length -
        1
    ];

  ctx.lineTo(
    last.x,
    last.y
  );

  ctx.strokeStyle =
    stroke;

  ctx.lineWidth =
    lineWidth;

  ctx.lineCap =
    "round";

  ctx.lineJoin =
    "round";

  ctx.shadowBlur =
    shadowBlur;

  ctx.shadowColor =
    shadowColor;

  ctx.stroke();

  ctx.restore();
}

/* =====================================================
   DRAW MONO / STEREO WAVE
   ===================================================== */

function drawSmoothWave(
  ctx: CanvasRenderingContext2D,
  values: number[],
  left: number,
  right: number,
  centerY: number,
  scale: number,
  dpr: number,
  strokeColor: string,
  glowColor: string
) {
  if (
    values.length <
    2
  ) {
    return;
  }

  const width =
    right -
    left;

  const points =
    values.map(
      (
        value,
        index
      ) => ({
        x:
          left +
          index /
            (
              values.length -
              1
            ) *
            width,

        y:
          centerY -
          value *
            scale,
      })
    );

  ctx.save();

  ctx.beginPath();

  ctx.moveTo(
    points[0].x,
    points[0].y
  );

  for (
    let i = 0;
    i <
    points.length -
      1;
    i++
  ) {
    const current =
      points[i];

    const next =
      points[
        i +
        1
      ];

    const middleX =
      (
        current.x +
        next.x
      ) /
      2;

    const middleY =
      (
        current.y +
        next.y
      ) /
      2;

    ctx.quadraticCurveTo(
      current.x,
      current.y,
      middleX,
      middleY
    );
  }

  const last =
    points[
      points.length -
        1
    ];

  ctx.lineTo(
    last.x,
    last.y
  );

  ctx.lineCap =
    "round";

  ctx.lineJoin =
    "round";

  ctx.strokeStyle =
    strokeColor;

  ctx.lineWidth =
    1.7 *
    dpr;

  ctx.shadowBlur =
    9 *
    dpr;

  ctx.shadowColor =
    glowColor;

  ctx.stroke();

  ctx.restore();
}

/* =====================================================
   ANALYZER VALUE CARD
   ===================================================== */

function AnalyzerValue({
  label,
  value,
  unit,
  warning = false,
}: {
  label: string;
  value: string;
  unit?: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        warning
          ? "border-purple-400/40 bg-purple-500/[0.07]"
          : "border-white/[0.07] bg-black/25"
      }`}
    >

      <p className="text-[8px] tracking-widest text-white/25">
        {label}
      </p>

      <div className="mt-1 flex items-baseline gap-1">

        <p
          className={`font-mono text-sm font-bold ${
            warning
              ? "text-purple-300"
              : "text-cyan-300"
          }`}
        >
          {value}
        </p>

        {unit && (
          <span className="text-[8px] text-white/25">
            {unit}
          </span>
        )}

      </div>

    </div>
  );
}

/* =====================================================
   ANALYZER LEGEND
   ===================================================== */

function AnalyzerLegend({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div className="flex items-center gap-2">

      <span
        className={`h-[3px] w-8 rounded-full ${className}`}
      />

      <span className="font-semibold text-white/50">
        {label}
      </span>

    </div>
  );
}

/* =====================================================
   SETTING TOGGLE
   ===================================================== */

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

        <p className="text-sm text-white/40">
          {description}
        </p>

      </div>

      <button
        type="button"
        onClick={() =>
          onChange(
            !value
          )
        }
        className={`relative h-7 w-14 shrink-0 rounded-full ${
          value
            ? "bg-gradient-to-r from-purple-500 via-emerald-400 to-cyan-400"
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
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Radio,
  Users,
  Send,
  Sparkles,
  Share2,
  Heart,
  Search,
  Video,
  ArrowLeft,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/videohub/Logo";
import { ThemeToggle } from "@/components/videohub/ThemeToggle";
import { BottomNav } from "@/components/videohub/BottomNav";
import { LIVE_STREAMS, type LiveStream } from "@/data/live";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Streaming & Broadcast Studio — FaceTube" },
      {
        name: "description",
        content:
          "Watch verified live broadcasts or stream live with real-time camera and microphone test studio on FaceTube.",
      },
    ],
  }),
  component: LivePage,
});

const LIVE_CATEGORIES = ["All Live", "Coding & Tech", "Gaming", "Music", "Science & Tech"];

export function LivePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All Live");
  const [activeStream, setActiveStream] = useState<LiveStream>(LIVE_STREAMS[0]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState(activeStream.chatMessages);
  const [liked, setLiked] = useState(false);

  // Real WebRTC Camera Broadcast Studio State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [broadcastResolution, setBroadcastResolution] = useState("1080p 60fps");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startBroadcastStudio = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Camera broadcasting is not supported in this browser environment.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsBroadcasting(true);
      toast.success("Broadcast camera activated! You are previewing live.");
    } catch (err: any) {
      console.warn("Could not access camera/mic:", err);
      toast.error(
        err?.name === "NotAllowedError"
          ? "Camera/Microphone permission denied."
          : "Could not access camera. Please verify device permissions.",
      );
    }
  };

  const stopBroadcastStudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsBroadcasting(false);
    toast.info("Broadcast camera stopped.");
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = !micEnabled));
      setMicEnabled(!micEnabled);
    }
  };

  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach((t) => (t.enabled = !cameraEnabled));
      setCameraEnabled(!cameraEnabled);
    }
  };

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const filteredStreams =
    selectedCategory === "All Live"
      ? LIVE_STREAMS
      : LIVE_STREAMS.filter((s) => s.category === selectedCategory);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const authorName =
      profile?.full_name || profile?.username || user?.email?.split("@")[0] || "You";
    setChatMessages((prev) => [
      ...prev,
      {
        user: authorName,
        text: chatInput.trim(),
        color: "text-brand font-bold",
      },
    ]);
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-brand selection:text-white pb-24 md:pb-28">
      {/* Top Navbar with Back Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate({ to: "/" });
                }
              }}
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Logo size={30} />
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-red-500">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Live
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isBroadcasting ? (
              <button
                type="button"
                onClick={startBroadcastStudio}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
              >
                <Camera className="h-3.5 w-3.5" />
                Go Live
              </button>
            ) : (
              <button
                type="button"
                onClick={stopBroadcastStudio}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-red-500/40 px-3.5 py-1.5 text-xs font-bold text-red-400 shadow-sm transition hover:bg-zinc-700 active:scale-95"
              >
                <VideoOff className="h-3.5 w-3.5" />
                End Stream
              </button>
            )}
            <ThemeToggle showLabelsOnWide={false} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-4 space-y-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LIVE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? "bg-brand text-white font-semibold shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Live Stream & Live Chat Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Stream Container (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-xl border border-border">
              {isBroadcasting ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                  {/* Camera overlay status */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                      Broadcasting Live
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      {broadcastResolution}
                    </span>
                  </div>

                  {/* Broadcast In-Stream Controls */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Host Preview Active</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleMic}
                        className={`p-2 rounded-lg text-xs font-bold transition ${
                          micEnabled ? "bg-white/10 text-white" : "bg-red-600 text-white"
                        }`}
                        title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
                      >
                        {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={toggleCamera}
                        className={`p-2 rounded-lg text-xs font-bold transition ${
                          cameraEnabled ? "bg-white/10 text-white" : "bg-red-600 text-white"
                        }`}
                        title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
                      >
                        {cameraEnabled ? (
                          <Camera className="h-4 w-4" />
                        ) : (
                          <VideoOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={activeStream.thumb}
                    alt={activeStream.title}
                    className="h-full w-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Pulsing Live Badge and Real Broadcast Status */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                      Live Stream
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      {activeStream.statusLabel}
                    </span>
                  </div>

                  {/* Category tag on stream */}
                  <div className="absolute top-4 right-4">
                    <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
                      {activeStream.category}
                    </span>
                  </div>

                  {/* Stream bottom overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white font-bold text-xs ring-2 ring-white/50">
                        {activeStream.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white drop-shadow-md">
                          {activeStream.streamer}
                        </h3>
                        <p className="text-xs text-white/80">{activeStream.startedTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLiked((l) => !l)}
                        className={`grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition active:scale-95 ${
                          liked
                            ? "bg-red-600 text-white"
                            : "bg-black/60 text-white hover:bg-black/80"
                        }`}
                        aria-label="Like stream"
                      >
                        <Heart className={`h-4 w-4 ${liked ? "fill-white" : ""}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.share) {
                            navigator
                              .share({ title: activeStream.title, url: window.location.href })
                              .catch(() => {});
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Stream link copied!");
                          }
                        }}
                        className="grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition active:scale-95"
                        aria-label="Share stream"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Stream Title & Details */}
            <div className="p-1">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                {isBroadcasting
                  ? `🔴 Live Broadcast: ${profile?.full_name || profile?.username || "Creator Stream"}`
                  : activeStream.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {activeStream.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Live Chat Panel (1 col) */}
          <div className="flex flex-col h-[460px] lg:h-[500px] rounded-2xl border border-border bg-card overflow-hidden shadow-card">
            <div className="p-3.5 border-b border-border flex items-center justify-between bg-secondary/30">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-sm font-bold text-foreground">Live Stream Chat</h2>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                Community Chat
              </span>
            </div>

            {/* Messages container */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground text-xs p-4">
                  <p>Welcome to FaceTube Live chat!</p>
                  <p className="mt-1 text-[11px]">Say hi to start the conversation.</p>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className={`shrink-0 font-bold ${msg.color}`}>{msg.user}:</span>
                    <span className="text-foreground/90 break-words">{msg.text}</span>
                  </div>
                ))
              )}
            </div>

            {/* Send chat input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-border bg-secondary/20 flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Chat as creator..."
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:border-brand"
              />
              <button
                type="submit"
                className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-white hover:bg-brand-dark transition shrink-0 active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Channels Broadcasting on FaceTube */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Featured Live Channels</h2>
            <span className="text-xs text-muted-foreground">Verified Creator Streams</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredStreams.map((stream) => (
              <button
                key={stream.id}
                type="button"
                onClick={() => {
                  setActiveStream(stream);
                  setChatMessages(stream.chatMessages);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`text-left rounded-2xl border transition-all duration-200 overflow-hidden bg-card hover:-translate-y-1 hover:shadow-lift ${
                  activeStream.id === stream.id
                    ? "border-brand ring-2 ring-brand/30"
                    : "border-border"
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-secondary">
                  <img
                    src={stream.thumb}
                    alt={stream.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                    Live
                  </div>
                  <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white font-mono">
                    {stream.statusLabel}
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <h3 className="text-xs font-bold text-foreground line-clamp-1">{stream.title}</h3>
                  <p className="text-[11px] text-muted-foreground truncate">{stream.streamer}</p>
                  <p className="text-[10px] text-muted-foreground font-medium pt-0.5">
                    {stream.startedTime}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

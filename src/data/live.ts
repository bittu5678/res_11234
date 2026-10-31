import thumb1 from "@/assets/thumb-1.jpg";
import thumb2 from "@/assets/thumb-2.jpg";
import thumb3 from "@/assets/thumb-3.jpg";
import thumb4 from "@/assets/thumb-4.jpg";
import thumb5 from "@/assets/thumb-5.jpg";
import thumb6 from "@/assets/thumb-6.jpg";

export interface LiveStream {
  id: string;
  title: string;
  streamer: string;
  streamerHandle: string;
  initials: string;
  category: string;
  tags: string[];
  thumb: string;
  isLive: boolean;
  statusLabel: string;
  startedTime: string;
  chatMessages: { user: string; text: string; isMod?: boolean; color: string }[];
}

export const LIVE_STREAMS: LiveStream[] = [
  {
    id: "live-1",
    title: "LIVE: Lo-Fi Coding & System Architecture Sprint (Q&A)",
    streamer: "DevForge Live",
    streamerHandle: "@devforge",
    initials: "DF",
    category: "Coding & Tech",
    tags: ["typescript", "fullstack", "react"],
    thumb: thumb1,
    isLive: true,
    statusLabel: "Broadcast Active",
    startedTime: "Started 2 hours ago",
    chatMessages: [
      {
        user: "ModeratorBot",
        text: "Welcome to FaceTube Live! Keep chat friendly 🎉",
        isMod: true,
        color: "text-brand",
      },
    ],
  },
  {
    id: "live-2",
    title: "World Championship Esports Finals — Commentary & Analysis",
    streamer: "Apex Arena Esports",
    streamerHandle: "@apexarena",
    initials: "AA",
    category: "Gaming",
    tags: ["esports", "gaming", "finals"],
    thumb: thumb5,
    isLive: true,
    statusLabel: "Tournament Stream",
    startedTime: "Started 45 mins ago",
    chatMessages: [],
  },
  {
    id: "live-3",
    title: "Ambient Electronic Studio Jam Session: Modular Synthesizers",
    streamer: "SubHarmonic",
    streamerHandle: "@subharmonic",
    initials: "SH",
    category: "Music",
    tags: ["ambient", "synth", "modular"],
    thumb: thumb6,
    isLive: true,
    statusLabel: "Studio Session",
    startedTime: "Started 1 hour ago",
    chatMessages: [],
  },
  {
    id: "live-4",
    title: "Global Space Mission Launch Live Coverage & Multi-cam Feed",
    streamer: "AeroSpace Now",
    streamerHandle: "@aerospacenow",
    initials: "AN",
    category: "Science & Tech",
    tags: ["space", "rocket", "live"],
    thumb: thumb3,
    isLive: true,
    statusLabel: "Public Feed",
    startedTime: "Started 3 hours ago",
    chatMessages: [],
  },
];

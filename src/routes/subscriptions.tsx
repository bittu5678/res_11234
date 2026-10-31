import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Clapperboard,
  Bell,
  BellRing,
  BellOff,
  Radio,
  Check,
  Users,
  Search,
  Plus,
  X,
  UserPlus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { VideoHubLayout } from "@/components/videohub/VideoHubLayout";
import { VideoCard } from "@/components/videohub/VideoCard";
import { creators, allVideos } from "@/data/videos";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscriptions & Channel Management — FaceTube" },
      {
        name: "description",
        content:
          "Catch the latest uploads, live streams, and manage channel subscriptions with notification preferences on FaceTube.",
      },
    ],
  }),
  component: SubscriptionsPage,
});

interface SubscribedChannel {
  name: string;
  handle: string;
  initials: string;
  subscribers: string;
  notifications: "all" | "personalized" | "none";
}

const DEFAULT_CHANNELS: SubscribedChannel[] = creators.map((c) => ({
  name: c.name,
  handle: `@${c.name.toLowerCase().replace(/\s+/g, "")}`,
  initials: c.initials,
  subscribers: c.subscribers || "120K",
  notifications: "all",
}));

export function SubscriptionsPage() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<"All" | "Today" | "Live" | "Continue">(
    "All",
  );
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newChannelInput, setNewChannelInput] = useState("");

  const [subscribedChannels, setSubscribedChannels] = useState<SubscribedChannel[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("facetube_user_subscriptions");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // ignore
        }
      }
    }
    return DEFAULT_CHANNELS;
  });

  const saveChannels = (updated: SubscribedChannel[]) => {
    setSubscribedChannels(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("facetube_user_subscriptions", JSON.stringify(updated));
    }
  };

  const handleSubscribeNewChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const handleOrName = newChannelInput.trim();
    if (!handleOrName) return;

    const normalizedName = handleOrName.replace(/^@/, "");
    const exists = subscribedChannels.some(
      (c) =>
        c.name.toLowerCase() === normalizedName.toLowerCase() ||
        c.handle.toLowerCase() === `@${normalizedName.toLowerCase()}`,
    );

    if (exists) {
      toast.info(`You are already subscribed to ${handleOrName}`);
      return;
    }

    const newChannel: SubscribedChannel = {
      name: normalizedName,
      handle: `@${normalizedName.toLowerCase()}`,
      initials: normalizedName.slice(0, 2).toUpperCase(),
      subscribers: "1 subscriber",
      notifications: "all",
    };

    const updated = [newChannel, ...subscribedChannels];
    saveChannels(updated);
    setNewChannelInput("");
    toast.success(`Subscribed to ${newChannel.name}! Added to your feed.`);
  };

  const handleToggleNotifications = (handle: string) => {
    const updated = subscribedChannels.map((c) => {
      if (c.handle === handle) {
        const nextMode =
          c.notifications === "all"
            ? "personalized"
            : c.notifications === "personalized"
              ? "none"
              : "all";
        const label =
          nextMode === "all"
            ? "All notifications"
            : nextMode === "personalized"
              ? "Personalized notifications"
              : "Notifications muted";
        toast.info(`${c.name}: ${label}`);
        return { ...c, notifications: nextMode as "all" | "personalized" | "none" };
      }
      return c;
    });
    saveChannels(updated);
  };

  const handleUnsubscribe = (handle: string, name: string) => {
    const updated = subscribedChannels.filter((c) => c.handle !== handle);
    saveChannels(updated);
    if (selectedCreator === name) {
      setSelectedCreator(null);
    }
    toast.info(`Unsubscribed from ${name}`);
  };

  const filteredChannels = subscribedChannels.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredVideos = allVideos.filter((v) => {
    if (selectedCreator) {
      return v.channel === selectedCreator;
    }
    return true;
  });

  return (
    <VideoHubLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand">
              <Clapperboard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Subscriptions
              </h1>
              <p className="text-sm text-muted-foreground">
                Latest videos from your subscribed channels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsManageOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/80 px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary active:scale-95 shadow-xs"
            >
              <Users className="h-3.5 w-3.5 text-brand" />
              Manage ({subscribedChannels.length})
            </button>
            <Link
              to="/live"
              className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3.5 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-500/20 active:scale-95"
            >
              <Radio className="h-3.5 w-3.5" />
              Live Now
            </Link>
          </div>
        </div>

        {/* Channels Stories / Avatars Bar */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setSelectedCreator(null)}
            className={`flex flex-col items-center gap-1.5 shrink-0 transition ${
              selectedCreator === null ? "opacity-100" : "opacity-70 hover:opacity-100"
            }`}
          >
            <div
              className={`grid h-14 w-14 place-items-center rounded-full border-2 transition ${
                selectedCreator === null
                  ? "border-brand bg-brand text-white shadow-md"
                  : "border-border bg-secondary text-foreground"
              }`}
            >
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-foreground max-w-[64px] truncate">
              All
            </span>
          </button>

          {subscribedChannels.map((c, i) => {
            const isSelected = selectedCreator === c.name;
            const isLive = i === 1; // demo live indicator
            return (
              <button
                key={c.handle}
                type="button"
                onClick={() => setSelectedCreator(isSelected ? null : c.name)}
                className={`relative flex flex-col items-center gap-1.5 shrink-0 group transition ${
                  isSelected ? "opacity-100 scale-105" : "opacity-80 hover:opacity-100"
                }`}
              >
                <div
                  className={`relative grid h-14 w-14 place-items-center rounded-full font-bold text-sm text-white shadow-sm transition-all ${
                    isSelected
                      ? "ring-4 ring-brand bg-gradient-to-br from-brand to-brand-dark"
                      : isLive
                        ? "ring-2 ring-red-500 bg-gradient-to-br from-red-600 to-amber-600"
                        : "ring-2 ring-border bg-gradient-to-br from-neutral-800 to-neutral-700 group-hover:ring-brand/50"
                  }`}
                >
                  {c.initials}
                  {isLive && (
                    <span className="absolute -bottom-1 rounded-full bg-red-600 px-1.5 py-0.2 text-[8px] font-black uppercase text-white tracking-widest ring-2 ring-background">
                      LIVE
                    </span>
                  )}
                  {!isLive && i % 2 === 0 && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-background" />
                  )}
                </div>
                <span className="text-[11px] font-medium text-foreground max-w-[64px] truncate">
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 border-b border-border/70 pb-3">
          {(["All", "Today", "Live", "Continue"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                selectedFilter === filter
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Subscribed Feed Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground sm:text-lg">
              {selectedCreator ? `Uploads from ${selectedCreator}` : "Recent Uploads"}
            </h2>
            <span className="text-xs text-muted-foreground">
              {filteredVideos.length} videos available
            </span>
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredVideos.map((v) => (
              <VideoCard key={`sub-video-${v.id}`} video={v} />
            ))}
          </div>
        </section>

        {/* Manage Subscriptions & Subscriber Form Dialog Modal */}
        {isManageOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Manage Subscriptions</h3>
                    <p className="text-xs text-muted-foreground">
                      {subscribedChannels.length} channels followed (Free, no payment required)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsManageOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Subscribe Form */}
              <form onSubmit={handleSubscribeNewChannel} className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Subscribe to a New Channel
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newChannelInput}
                    onChange={(e) => setNewChannelInput(e.target.value)}
                    placeholder="Enter channel name or @handle (e.g. @techguru)..."
                    className="flex-1 rounded-xl border border-border bg-secondary/50 px-3.5 py-2 text-xs text-foreground focus:border-brand focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-dark transition active:scale-95 shrink-0"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Subscribe
                  </button>
                </div>
              </form>

              {/* Search Filter */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter followed channels..."
                  className="w-full rounded-xl border border-border bg-secondary/30 pl-8 pr-3.5 py-1.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              {/* Channel List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredChannels.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-6">
                    No matching channels found.
                  </p>
                ) : (
                  filteredChannels.map((c) => (
                    <div
                      key={c.handle}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border/70 bg-secondary/20 hover:bg-secondary/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-neutral-800 text-white font-bold text-xs ring-1 ring-border">
                          {c.initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {c.handle} · {c.subscribers}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleNotifications(c.handle)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                          title={`Notifications: ${c.notifications}`}
                        >
                          {c.notifications === "all" ? (
                            <BellRing className="h-4 w-4 text-brand" />
                          ) : c.notifications === "personalized" ? (
                            <Bell className="h-4 w-4 text-foreground" />
                          ) : (
                            <BellOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUnsubscribe(c.handle, c.name)}
                          className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-border transition active:scale-95"
                        >
                          Following
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-border flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsManageOpen(false)}
                  className="rounded-full bg-secondary px-5 py-2 text-xs font-bold text-foreground hover:bg-secondary/80 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </VideoHubLayout>
  );
}

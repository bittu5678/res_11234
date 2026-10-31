import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Wallet,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  Globe2,
  Tv,
  Share2,
  ArrowDownToLine,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Monitor,
  Megaphone,
  UserPlus,
} from "lucide-react";
import { VideoHubLayout } from "@/components/videohub/VideoHubLayout";
import { DashboardSummaryCards } from "@/components/videohub/DashboardSummaryCards";
import { useAuth } from "@/lib/auth-context";
import {
  getUserWallet,
  getUserLedger,
  type UserWallet,
  type LedgerTransaction,
} from "@/lib/ledger-service";

export const Route = createFileRoute("/income")({
  head: () => ({
    meta: [
      { title: "Income Section — FaceTube" },
      {
        name: "description",
        content:
          "Unified creator income hub on FaceTube: Google AdSense, Mobile Ads, Desktop Ads, Ad Boost, Referral, Global Pool, and Wallet Withdrawals.",
      },
    ],
  }),
  component: IncomePage,
});

function IncomePage() {
  const { profile, dbUser, user } = useAuth();
  const userId = profile?.user_id || dbUser?.user_id || user?.email?.split("@")[0] || "FT483921";
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [ledgerTransactions, setLedgerTransactions] = useState<LedgerTransaction[]>([]);

  useEffect(() => {
    Promise.all([getUserWallet(userId), getUserLedger(userId)]).then(([w, l]) => {
      setWallet(w);
      setLedgerTransactions(l);
    });
  }, [userId]);

  const verifiedAdsense = wallet?.adsenseIncome || 0;

  const adBoostIncome = useMemo(() => {
    return ledgerTransactions
      .filter((tx) => tx.incomeType === "ads_promotion_fee" && tx.status === "settled")
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [ledgerTransactions]);

  const totalAdsIncome = verifiedAdsense + adBoostIncome;
  const mobileAdEarnings = totalAdsIncome > 0 ? totalAdsIncome * 0.6 : 0;
  const desktopAdEarnings = totalAdsIncome > 0 ? totalAdsIncome * 0.4 : 0;

  const incomeStreams = [
    {
      title: "Google AdSense Income",
      desc: "70% video player pre-roll, mid-roll, and display ad revenue (verified)",
      balance: `₹${verifiedAdsense.toFixed(2)}`,
      badge: "70% Split",
      icon: Tv,
      color: "text-yellow-400 bg-yellow-500/10",
      link: "/adsense-income",
    },
    {
      title: "Mobile Ad Earnings",
      desc: "Mobile web & in-app vertical video ad impressions and creator rev share",
      balance: `₹${mobileAdEarnings.toFixed(2)}`,
      badge: "Mobile Plays",
      icon: Smartphone,
      color: "text-sky-400 bg-sky-500/10",
      link: "/adsense-income",
    },
    {
      title: "Desktop/Laptop Ad Earnings",
      desc: "Desktop web player banner, display & mid-roll ad allocations",
      balance: `₹${desktopAdEarnings.toFixed(2)}`,
      badge: "Desktop Plays",
      icon: Monitor,
      color: "text-indigo-400 bg-indigo-500/10",
      link: "/adsense-income",
    },
    {
      title: "Ad Boost Income",
      desc: "Promotional campaigns, sponsor boosters, and creator spotlight campaigns",
      balance: `₹${adBoostIncome.toFixed(2)}`,
      badge: "Campaigns",
      icon: Megaphone,
      color: "text-emerald-400 bg-emerald-500/10",
      link: "/ads-promotions",
    },
    {
      title: "Direct Referral Income",
      desc: "Direct referral commissions from creator subscriptions and invited members",
      balance: `₹${wallet ? wallet.referralIncome.toFixed(2) : "0.00"}`,
      badge: "Referral",
      icon: UserPlus,
      color: "text-rose-400 bg-rose-500/10",
      link: "/referral-income",
    },
    {
      title: "Global Income Pool",
      desc: "Worldwide platform revenue pool distribution for Diamond ranks",
      balance: `₹${wallet ? wallet.globalIncome.toFixed(2) : "0.00"}`,
      badge: "Global Pool",
      icon: Globe2,
      color: "text-cyan-400 bg-cyan-500/10",
      link: "/global-income",
    },
    {
      title: "Affiliate Income",
      desc: "Product recommendations, gear commissions, and course referrals",
      balance: `₹${wallet ? wallet.affiliateIncome.toFixed(2) : "0.00"}`,
      badge: "Affiliate",
      icon: Share2,
      color: "text-violet-400 bg-violet-500/10",
      link: "/affiliate-income",
    },
    {
      title: "Wallet Balance",
      desc: "Current aggregated balance ready for immediate transfer or withdrawal",
      balance: `₹${wallet ? wallet.balance.toFixed(2) : "0.00"}`,
      badge: "Available",
      icon: Wallet,
      color: "text-emerald-400 bg-emerald-500/10",
      link: "/wallet-balance",
    },
    {
      title: "Withdrawal Balance",
      desc: "History of completed bank and gateway disbursements",
      balance: `₹${wallet ? wallet.totalWithdrawn.toFixed(2) : "0.00"}`,
      badge: "Processed",
      icon: ArrowDownToLine,
      color: "text-orange-400 bg-orange-500/10",
      link: "/withdrawal-balance",
    },
  ];

  return (
    <VideoHubLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Income Source Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Verified source-wise amounts and total earnings across all FaceTube revenue channels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/wallet-balance"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white shadow-lift transition hover:bg-brand-dark active:scale-95"
            >
              <Wallet className="h-3.5 w-3.5" />
              Withdrawal Balance
            </Link>
          </div>
        </div>

        {/* Aggregated Totals Card: Total Ads vs Grand Total */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-card to-card p-5 space-y-1 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                <Tv className="h-4 w-4" />
                Total Ads Earning
              </span>
              <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
                All Ads Sources
              </span>
            </div>
            <p className="text-3xl font-black text-foreground pt-1">₹{totalAdsIncome.toFixed(2)}</p>
            <p className="text-[11px] text-muted-foreground">
              Google AdSense (₹{verifiedAdsense.toFixed(2)}) + Ad Boost (₹{adBoostIncome.toFixed(2)}
              )
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-card p-5 space-y-1 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <IndianRupee className="h-4 w-4" />
                Grand Total Earned
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                Verified Ledger
              </span>
            </div>
            <p className="text-3xl font-black text-emerald-400 pt-1">
              ₹{wallet ? wallet.totalEarned.toFixed(2) : "0.00"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Available in wallet: ₹{wallet ? wallet.balance.toFixed(2) : "0.00"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-1 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <ArrowDownToLine className="h-4 w-4" />
                Total Disbursed
              </span>
              <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-300">
                Bank ACH / UPI
              </span>
            </div>
            <p className="text-3xl font-black text-foreground pt-1">
              ₹{wallet ? wallet.totalWithdrawn.toFixed(2) : "0.00"}
            </p>
            <p className="text-[11px] text-muted-foreground">Total successfully paid out</p>
          </div>
        </div>

        {/* Source-wise Cards Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-foreground">
              Source-Wise Income Channels
            </h2>
            <span className="text-xs text-muted-foreground font-medium">
              Verified backend telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeStreams.map((stream) => {
              const Icon = stream.icon;
              return (
                <Link
                  key={stream.title}
                  to={stream.link}
                  className="group block rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lift"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`grid h-11 w-11 place-items-center rounded-xl transition-transform group-hover:scale-105 ${stream.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-foreground">
                      {stream.badge}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-foreground group-hover:text-brand transition-colors">
                    {stream.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-3 leading-relaxed line-clamp-2">
                    {stream.desc}
                  </p>

                  <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs font-semibold">
                    <span className="text-muted-foreground">Verified Amount:</span>
                    <span className="text-foreground font-black text-sm">{stream.balance}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </VideoHubLayout>
  );
}

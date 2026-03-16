"use client";

import { useState, useEffect } from "react";
import Stars from "@/components/Stars";
import ConfettiContainer, { useConfetti } from "@/components/Confetti";
import Toast, { useToast } from "@/components/Toast";
import { useAuction } from "@/lib/useAuction";

export default function Home() {
  const auction = useAuction();
  const { containerRef, fire } = useConfetti();
  const toast = useToast();
  const [tab, setTab] = useState<"init" | "bid">("init");
  const [initVal, setInitVal] = useState("");
  const [bidVal, setBidVal] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    auction.refreshStatus();
  }, []);

  const xlm = (stroops: bigint) => (Number(stroops) / 1e7).toFixed(2);

  const copyId = () => {
    navigator.clipboard.writeText(auction.contractId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleConnect = async () => {
    try {
      await auction.connectWallet();
      toast.show("Wallet connected!");
    } catch {
      toast.show("Connection failed — check Freighter");
    }
  };

  const handleInit = async () => {
    const v = parseFloat(initVal);
    if (isNaN(v) || v <= 0) { toast.show("Enter a valid starting bid"); return; }
    if (!auction.walletAddr) { toast.show("Connect Freighter first"); return; }
    try {
      await auction.initialize(v);
      toast.show("Auction initialized on-chain!");
    } catch {
      toast.show("Transaction failed — see feed");
    }
  };

  const handleBid = async () => {
    const v = parseFloat(bidVal);
    if (!auction.walletAddr) { toast.show("Connect Freighter first"); return; }
    if (isNaN(v) || v <= 0) { toast.show("Enter a valid bid"); return; }
    if (auction.highestBid !== null && v * 1e7 <= Number(auction.highestBid)) {
      toast.show(`Bid must exceed ${xlm(auction.highestBid)} XLM`);
      return;
    }
    try {
      await auction.bid(v);
      fire();
      toast.show("Bid placed on-chain! You're leading 👑");
      setBidVal("");
    } catch {
      toast.show("Bid failed — see feed");
    }
  };

  const pulseFill = auction.highestBid !== null
    ? Math.min(100, Number(auction.highestBid) / 1e7 / 10)
    : 0;

  return (
    <main style={{ background: "#0D0D1A", minHeight: "100vh" }}>
      <Stars />
      <ConfettiContainer containerRef={containerRef} />
      <Toast msg={toast.msg} visible={toast.visible} />

      <div className="relative z-10 max-w-xl mx-auto pb-16">

        {/* HERO */}
        <div className="text-center px-6 pt-11 pb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: "#1A1A30", border: "1px solid #7B2FBE44", fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#A78BDE" }}>
            <span className="w-2 h-2 rounded-full animate-livepulse" style={{ background: "#A855F7" }} />
            LIVE ON TESTNET
          </div>
          <h1 className="font-bold leading-tight mb-3" style={{ fontSize: "clamp(32px,8vw,52px)", letterSpacing: "-1.5px" }}>
            Stellar<br /><span style={{ color: "#A855F7" }}>Auction House</span>
          </h1>
          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#7A78A0" }}>
            Powered by Soroban smart contracts
          </p>
          <div className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl"
            style={{ background: "#13132A", border: "1px solid #2A2850", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#6B68A0", maxWidth: "100%" }}>
            <span>CONTRACT</span>
            <span style={{ color: "#A78BDE", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>
              {auction.contractId}
            </span>
            <button onClick={copyId}
              className="px-2 py-1 rounded transition-all"
              style={{ background: copied ? "#A855F7" : "#1E1C3A", border: "1px solid #3A3870", color: copied ? "#fff" : "#A78BDE", fontSize: 10 }}>
              {copied ? "COPIED!" : "COPY"}
            </button>
          </div>
        </div>

        {/* WALLET BANNER */}
        <div className="mx-4 mb-5 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap transition-all"
          style={{ background: auction.walletAddr ? "#130F22" : "#0F0F22", border: `1px solid ${auction.walletAddr ? "#A855F744" : "#2A2850"}` }}>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full transition-all"
              style={{ background: auction.walletAddr ? "#6FCF97" : "#3A3870", animation: auction.walletAddr ? "livepulse 1.4s ease-in-out infinite" : "none" }} />
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11 }}>
              <div className="font-bold mb-0.5" style={{ color: "#A78BDE", fontSize: 12 }}>
                {auction.walletAddr ? "Wallet connected" : "Wallet not connected"}
              </div>
              <div style={{ color: "#7A78A0" }}>
                {auction.walletAddr ? `${auction.tr(auction.walletAddr)} (testnet)` : "Connect Freighter to interact with the contract"}
              </div>
            </div>
          </div>
          <button onClick={handleConnect} disabled={!!auction.walletAddr}
            className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: auction.walletAddr ? "#1E1C3A" : "#A855F7", color: auction.walletAddr ? "#6FCF97" : "#fff", border: auction.walletAddr ? "1px solid #6FCF9744" : "none", cursor: auction.walletAddr ? "default" : "pointer" }}>
            {auction.walletAddr ? "Connected ✓" : "Connect Freighter"}
          </button>
        </div>

        {/* BID-O-METER */}
        <div className="mx-4 mb-6 rounded-2xl p-7 relative overflow-hidden"
          style={{ background: "#0F0F22", border: "1px solid #2A2850" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%,#A855F718 0%,transparent 70%)" }} />
          <div className="absolute rounded-full animate-orbit"
            style={{ width: 180, height: 180, right: -24, top: -24, border: "1px solid #A855F722" }} />
          <div className="absolute rounded-full animate-orbit-rev"
            style={{ width: 110, height: 110, right: 12, top: 12, border: "1px dashed #7B2FBE33" }} />
          <div className="relative">
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#5A5880", letterSpacing: "0.12em", marginBottom: 10 }}>
              HIGHEST BID
            </div>
            <div className="font-bold" style={{ fontSize: "clamp(44px,12vw,72px)", letterSpacing: "-2px", lineHeight: 1 }}>
              {auction.highestBid !== null ? xlm(auction.highestBid) : "—"}
              <span style={{ fontSize: "0.38em", color: "#A855F7", marginLeft: 6, verticalAlign: "middle" }}>XLM</span>
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#5A5880", marginTop: 10 }}>
              {auction.highestBid !== null
                ? auction.highestBidder ? `Leading: ${auction.tr(auction.highestBidder)}` : "Floor set — awaiting first bid"
                : "Auction not yet initialized"}
            </div>
            <div className="mt-5 h-1 rounded-full overflow-hidden" style={{ background: "#1A1835" }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${pulseFill}%`, background: "#A855F7" }} />
            </div>
          </div>
        </div>

        {/* CHIPS */}
        <div className="grid grid-cols-2 gap-3 mx-4 mb-6">
          {[
            { ico: "🎯", label: "TOTAL BIDS", val: auction.bids.length.toString(), big: true },
            { ico: "👑", label: "LEADING BIDDER", val: auction.highestBidder ? auction.tr(auction.highestBidder) : "No bids yet", addr: true },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl p-4 transition-all"
              style={{ background: "#0F0F22", border: `1px solid ${c.big && auction.bids.length > 0 ? "#A855F744" : "#1E1C3A"}` }}>
              <div className="text-2xl mb-2">{c.ico}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#5A5880", letterSpacing: "0.1em", marginBottom: 4 }}>{c.label}</div>
              {c.big
                ? <div style={{ fontSize: 24, fontWeight: 700, color: "#A855F7" }}>{c.val}</div>
                : <div style={{ fontFamily: c.addr ? "'Space Mono',monospace" : undefined, fontSize: c.addr ? 11 : 14, color: auction.highestBidder ? "#A78BDE" : "#3A3870" }}>{c.val}</div>
              }
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="mx-4 mb-4 flex gap-1 p-1 rounded-xl" style={{ background: "#0F0F22", border: "1px solid #1E1C3A" }}>
          {(["init", "bid"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: tab === t ? "#1E1C3A" : "transparent", color: tab === t ? "#F0EEF8" : "#5A5880" }}>
              {t === "init" ? "Initialize" : "Place Bid"}
            </button>
          ))}
        </div>

        {/* INIT PANEL */}
        {tab === "init" && (
          <div className="px-4">
            <div className="mb-4">
              <label style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#5A5880", letterSpacing: "0.1em", marginBottom: 7 }}>
                STARTING BID (XLM)
              </label>
              <input type="number" value={initVal} onChange={(e) => setInitVal(e.target.value)}
                placeholder="e.g. 100" min="0"
                className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={{ background: "#0F0F22", border: "1px solid #1E1C3A", fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#F0EEF8" }}
                onFocus={(e) => (e.target.style.borderColor = "#A855F7")}
                onBlur={(e) => (e.target.style.borderColor = "#1E1C3A")}
              />
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#3A3870", marginTop: 7 }}>
                Calls initialize(starting_bid: i128) on-chain via Freighter
              </div>
            </div>
            <button onClick={auction.refreshStatus} disabled={auction.loading === "refresh"}
              className="w-full py-4 rounded-xl font-bold text-sm mb-2.5 transition-all"
              style={{ background: "#1E1C3A", color: "#A78BDE", border: "none" }}>
              {auction.loading === "refresh" ? "Fetching…" : "↻ Refresh from chain"}
            </button>
            <button onClick={handleInit} disabled={auction.loading === "init"}
              className="w-full py-4 rounded-xl font-bold text-sm transition-all"
              style={{ background: "#A855F7", color: "#fff", border: "none", opacity: auction.loading === "init" ? 0.5 : 1 }}>
              {auction.loading === "init" ? "Waiting for Freighter…" : "Initialize auction"}
            </button>
          </div>
        )}

        {/* BID PANEL */}
        {tab === "bid" && (
          <div className="px-4">
            <div className="mb-4">
              <label style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#5A5880", letterSpacing: "0.1em", marginBottom: 7 }}>
                YOUR WALLET
              </label>
              <input readOnly value={auction.walletAddr || ""}
                placeholder="Connect Freighter to auto-fill"
                className="w-full rounded-xl px-4 py-3"
                style={{ background: "#0F0F22", border: "1px solid #1E1C3A", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#A78BDE", outline: "none" }}
              />
            </div>
            <div className="mb-4">
              <label style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#5A5880", letterSpacing: "0.1em", marginBottom: 7 }}>
                BID AMOUNT (XLM)
              </label>
              <input type="number" value={bidVal} onChange={(e) => setBidVal(e.target.value)}
                placeholder="Must exceed current highest" min="0"
                className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={{ background: "#0F0F22", border: "1px solid #1E1C3A", fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#F0EEF8" }}
                onFocus={(e) => (e.target.style.borderColor = "#A855F7")}
                onBlur={(e) => (e.target.style.borderColor = "#1E1C3A")}
              />
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#3A3870", marginTop: 7 }}>
                {auction.highestBid !== null ? `Current floor: ${xlm(auction.highestBid)} XLM — bid higher` : "Calls bid(bidder, amount) — requires Freighter signature"}
              </div>
            </div>
            <button onClick={handleBid} disabled={auction.loading === "bid"}
              className="w-full py-4 rounded-xl font-bold text-sm transition-all"
              style={{ background: "#A855F7", color: "#fff", border: "none", opacity: auction.loading === "bid" ? 0.5 : 1 }}>
              {auction.loading === "bid" ? "Waiting for Freighter…" : "Drop the bid ⚡"}
            </button>
          </div>
        )}

        {/* BID HISTORY */}
        {auction.bids.length > 0 && (
          <>
            <div className="mx-4 mt-7 mb-3 flex items-center gap-3"
              style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#3A3870", letterSpacing: "0.12em" }}>
              BID HISTORY
              <div className="flex-1 h-px" style={{ background: "#1A1835" }} />
            </div>
            <div className="mx-4 flex flex-col gap-2">
              {[...auction.bids].reverse().map((b, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3 animate-slidein"
                  style={{ background: i === 0 ? "#130F22" : "#0F0F22", border: `1px solid ${i === 0 ? "#A855F744" : "#1E1C3A"}` }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#A855F7" }}>{xlm(b.amount)} XLM</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#5A5880", marginTop: 2 }}>{b.addr}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold"
                    style={i === 0
                      ? { background: "#1E0A35", color: "#A855F7", border: "1px solid #A855F744" }
                      : { background: "#1A0F0F", color: "#F87171", border: "1px solid #F8717133" }}>
                    {i === 0 ? "LEADING" : "OUTBID"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ACTIVITY FEED */}
        <div className="mx-4 mt-7 mb-3 flex items-center gap-3"
          style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#3A3870", letterSpacing: "0.12em" }}>
          ACTIVITY FEED
          <div className="flex-1 h-px" style={{ background: "#1A1835" }} />
        </div>
        <div className="mx-4 rounded-2xl p-3.5 overflow-y-auto" style={{ background: "#0A0A18", border: "1px solid #1A1835", maxHeight: 240 }}>
          {auction.logs.map((l, i) => (
            <div key={i} className="flex gap-2.5 py-1.5 border-b last:border-b-0" style={{ borderColor: "#12122A" }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#2A2850", flexShrink: 0 }}>{l.time}</span>
              <span style={{
                fontFamily: "'Space Mono',monospace", fontSize: 11, lineHeight: 1.5,
                color: { ok: "#6FCF97", err: "#F87171", inf: "#A78BDE", wrn: "#FBBF24", sys: "#3A3870" }[l.type]
              }}>{l.msg}</span>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}

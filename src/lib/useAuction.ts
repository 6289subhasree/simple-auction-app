"use client";

import { useState, useCallback } from "react";
import {
  getHighestBid,
  getHighestBidder,
  initializeAuction,
  placeBid,
  CONTRACT_ID,
} from "@/lib/contract";

export type LogEntry = { time: string; msg: string; type: "ok" | "err" | "inf" | "wrn" | "sys" };
export type BidRecord = { addr: string; amount: bigint };

function ts() {
  return new Date().toTimeString().slice(0, 5);
}

function tr(a: string) {
  return a.length > 10 ? a.slice(0, 6) + "…" + a.slice(-4) : a;
}

export function useAuction() {
  const [walletAddr, setWalletAddr] = useState<string | null>(null);
  const [highestBid, setHighestBid] = useState<bigint | null>(null);
  const [highestBidder, setHighestBidder] = useState<string | null>(null);
  const [bids, setBids] = useState<BidRecord[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: "--:--", msg: "Connecting to Soroban testnet RPC…", type: "inf" },
  ]);
  const [loading, setLoading] = useState<string | null>(null);

  const log = useCallback((msg: string, type: LogEntry["type"] = "sys") => {
    setLogs((prev) => [...prev, { time: ts(), msg, type }]);
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const { setAllowed, requestAccess } = await import("@stellar/freighter-api");
      await setAllowed();
      const publicKey = await requestAccess();
      if (!publicKey) throw new Error("Could not get public key from Freighter");
      setWalletAddr(publicKey);
      log(`Wallet connected: ${tr(publicKey)}`, "ok");
      return publicKey;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      log("Wallet connection failed: " + msg, "err");
      throw err;
    }
  }, [log]);

  const refreshStatus = useCallback(async () => {
    setLoading("refresh");
    log("Fetching on-chain state…", "inf");
    try {
      const bid = await getHighestBid();
      setHighestBid(bid);
      log(`get_highest_bid() → ${(Number(bid) / 1e7).toFixed(2)} XLM`, "ok");
    } catch {
      log("Contract not initialized yet", "wrn");
    }
    try {
      const bidder = await getHighestBidder();
      setHighestBidder(bidder);
      log(`get_highest_bidder() → ${tr(bidder)}`, "ok");
    } catch {
      log("No bidder on chain yet", "wrn");
    }
    setLoading(null);
  }, [log]);

  const initialize = useCallback(async (startingBidXLM: number) => {
    if (!walletAddr) throw new Error("Connect wallet first");
    setLoading("init");
    log(`Calling initialize(${startingBidXLM} XLM) — approve in Freighter…`, "inf");
    try {
      const hash = await initializeAuction(walletAddr, startingBidXLM);
      setHighestBid(BigInt(Math.round(startingBidXLM * 1e7)));
      log(`✓ Auction initialized! TX: ${hash}`, "ok");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      log("Initialize failed: " + msg, "err");
      throw err;
    } finally {
      setLoading(null);
    }
  }, [walletAddr, log]);

  const bid = useCallback(async (amountXLM: number) => {
    if (!walletAddr) throw new Error("Connect wallet first");
    setLoading("bid");
    log(`Calling bid(${tr(walletAddr)}, ${amountXLM} XLM) — approve in Freighter…`, "inf");
    try {
      const hash = await placeBid(walletAddr, amountXLM);
      const amountStroops = BigInt(Math.round(amountXLM * 1e7));
      setHighestBid(amountStroops);
      setHighestBidder(walletAddr);
      setBids((prev) => [...prev, { addr: tr(walletAddr), amount: amountStroops }]);
      log(`✓ Bid placed! TX: ${hash}`, "ok");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      log("Bid failed: " + msg, "err");
      throw err;
    } finally {
      setLoading(null);
    }
  }, [walletAddr, log]);

  return {
    walletAddr,
    highestBid,
    highestBidder,
    bids,
    logs,
    loading,
    contractId: CONTRACT_ID,
    connectWallet,
    refreshStatus,
    initialize,
    bid,
    tr,
  };
}

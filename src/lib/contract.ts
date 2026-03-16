import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";

export const CONTRACT_ID =
  "CBQYE25DEZ72FCQ5CTYR5RQGBHCDIBK3NTTCJOG6SXSVKHV7CZDTMP4R";
export const SOROBAN_RPC = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

// read-only helper account (just for simulations)
const HELPER = "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN";

function getServer() {
  return new SorobanRpc.Server(SOROBAN_RPC);
}

async function simulate(operation: ReturnType<Contract["call"]>) {
  const server = getServer();
  const account = await server.getAccount(HELPER);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();
  return server.simulateTransaction(tx);
}

// ── READ: highest bid in stroops ──────────────────────────
export async function getHighestBid(): Promise<bigint> {
  const contract = new Contract(CONTRACT_ID);
  const result = await simulate(contract.call("get_highest_bid"));
  if (SorobanRpc.Api.isSimulationError(result)) throw new Error(result.error);
  return scValToNative(result.result!.retval) as bigint;
}

// ── READ: highest bidder address ──────────────────────────
export async function getHighestBidder(): Promise<string> {
  const contract = new Contract(CONTRACT_ID);
  const result = await simulate(contract.call("get_highest_bidder"));
  if (SorobanRpc.Api.isSimulationError(result)) throw new Error(result.error);
  return String(scValToNative(result.result!.retval));
}

// ── WRITE helpers (sign + submit via Freighter) ───────────
async function signAndSubmit(publicKey: string, operation: ReturnType<Contract["call"]>): Promise<string> {
  const { signTransaction } = await import("@stellar/freighter-api");
  const server = getServer();
  const account = await server.getAccount(publicKey);
  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simResult)) throw new Error(simResult.error);

  const prepared = SorobanRpc.assembleTransaction(tx, simResult).build();

  const { signedTxXdr } = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const { TransactionBuilder: TB } = await import("@stellar/stellar-sdk");
  const signed = TB.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  const send = await server.sendTransaction(signed);
  if (send.status === "ERROR") throw new Error(JSON.stringify(send.errorResult));

  // wait for confirmation
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await server.getTransaction(send.hash);
    if (res.status === "SUCCESS") return send.hash;
    if (res.status === "FAILED") throw new Error("Transaction failed on chain");
  }
  throw new Error("Confirmation timeout");
}

// ── WRITE: initialize ─────────────────────────────────────
export async function initializeAuction(publicKey: string, startingBidXLM: number): Promise<string> {
  const contract = new Contract(CONTRACT_ID);
  const op = contract.call(
    "initialize",
    nativeToScVal(BigInt(Math.round(startingBidXLM * 1e7)), { type: "i128" })
  );
  return signAndSubmit(publicKey, op);
}

// ── WRITE: bid ────────────────────────────────────────────
export async function placeBid(publicKey: string, amountXLM: number): Promise<string> {
  const contract = new Contract(CONTRACT_ID);
  const op = contract.call(
    "bid",
    nativeToScVal(publicKey, { type: "address" }),
    nativeToScVal(BigInt(Math.round(amountXLM * 1e7)), { type: "i128" })
  );
  return signAndSubmit(publicKey, op);
}

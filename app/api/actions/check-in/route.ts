/**
 * Solana Action – Registrar Check-In Emocional
 *
 * Cumple con el estándar de Solana Actions:
 *  GET  → metadatos de la acción
 *  POST → transacción Memo firmable con datos del check-in
 *  OPTIONS → headers CORS para preflight
 *
 * Referencia: https://solana.com/developers/guides/advanced/actions
 */

import {
  ACTIONS_CORS_HEADERS,
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createPostResponse,
} from "@solana/actions";

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js";

// Constantes
const SOLANA_RPC = clusterApiUrl("devnet");

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

// Helpers
function parseParams(url: URL): {
  city: string;
  initialMood: string;
  finalMood: string;
  agent: string;
  sentiment: string;
  date: string;
} {
  const city = (url.searchParams.get("city") ?? "Ciudad desconocida").slice(0, 50);
  const initialMood = url.searchParams.get("initialMood") ?? "0";
  const finalMood = url.searchParams.get("finalMood") ?? "0";
  const agent = url.searchParams.get("agent") ?? "reflexive";
  const sentiment = url.searchParams.get("sentiment") ?? "neutro";
  const date = url.searchParams.get("date") ?? new Date().toISOString();
  
  return { city, initialMood, finalMood, agent, sentiment, date };
}

// GET
export async function GET(req: Request) {
  const url = new URL(req.url);
  const baseHref = `${url.origin}${url.pathname}`;

  const payload: ActionGetResponse = {
    icon: `${url.origin}/reflect-icon.svg`,
    title: "Registrar Check-In en Solana",
    description:
      "Guarda tu check-in emocional como un registro inmutable en Solana Devnet.",
    label: "Registrar en Devnet",
    links: {
      actions: [
        {
          type: "transaction",
          label: "Registrar Check-In",
          href: `${baseHref}?city={city}&initialMood={initialMood}&finalMood={finalMood}&agent={agent}&sentiment={sentiment}&date={date}`,
          parameters: [
            {
              name: "city",
              label: "Ciudad",
              required: true,
            },
            {
              name: "initialMood",
              label: "Ánimo Inicial (0-100)",
              required: true,
            },
            {
              name: "finalMood",
              label: "Ánimo Final (0-100)",
              required: true,
            },
            {
              name: "agent",
              label: "Agente IA (compassionate/analytical/reflective)",
              required: false,
            },
            {
              name: "sentiment",
              label: "Sentimiento",
              required: false,
            },
            {
              name: "date",
              label: "Fecha",
              required: false,
            },
          ],
        },
      ],
    },
  };

  return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
}

// OPTIONS = GET
export const OPTIONS = GET;

// POST
export async function POST(req: Request) {
  try {
    const body: ActionPostRequest = await req.json();

    let feePayer: PublicKey;
    try {
      feePayer = new PublicKey(body.account);
    } catch {
      return Response.json(
        { message: 'El campo "account" no es una clave pública válida.' },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      );
    }

    // Extraer parámetros
    const url = new URL(req.url);
    const { city, initialMood, finalMood, agent, sentiment, date } = parseParams(url);

    // Construir el contenido del Memo
    // Formato: [Reflect] ciudad | ánimo inicial→final | agente | date
    const memoText = `[Reflect] ${city} | 😊 ${initialMood}→${finalMood} | ${agent} | ${sentiment} | ${date.slice(0, 10)}`;

    // Conectar a Devnet y obtener el blockhash reciente
    const connection = new Connection(SOLANA_RPC, "confirmed");
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    // Construir la instrucción Memo
    const memoInstruction = new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [
        {
          pubkey: feePayer,
          isSigner: true,
          isWritable: false,
        },
      ],
      data: Buffer.from(memoText, "utf-8"),
    });

    // Construir la transacción
    const transaction = new Transaction({
      feePayer,
      blockhash,
      lastValidBlockHeight,
    }).add(memoInstruction);

    // Serializar con createPostResponse
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
        message: `Check-in de ${city} registrado en Solana Devnet (${initialMood}→${finalMood})`,
      },
    });

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
  } catch (err) {
    console.error("[Action /check-in POST]", err);
    return Response.json(
      { message: "Error interno al construir la transacción." },
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    );
  }
}

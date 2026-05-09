/**
 * Solana Action – Check-in Emocional Memo
 *
 * Cumple con el estándar de Solana Actions:
 *  GET  → metadatos de la acción
 *  POST → transacción Memo con datos del check-in
 *  OPTIONS → headers CORS
 */

import {
  ACTIONS_CORS_HEADERS,
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createPostResponse,
} from "@solana/actions"

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} from "@solana/web3.js"

// Solana Devnet RPC
const SOLANA_RPC = clusterApiUrl("devnet")

// Memo Program ID (v2)
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
)

interface CheckInParams {
  city: string
  initialMood: string
  finalMood: string
  agent: string
  sentiment: string
}

function parseCheckInParams(url: URL): CheckInParams {
  return {
    city: (url.searchParams.get("city") ?? "Desconocida").slice(0, 30),
    initialMood: (url.searchParams.get("initialMood") ?? "0").slice(0, 3),
    finalMood: (url.searchParams.get("finalMood") ?? "0").slice(0, 3),
    agent: (url.searchParams.get("agent") ?? "desconocido").slice(0, 20),
    sentiment: (url.searchParams.get("sentiment") ?? "neutro").slice(0, 50),
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const baseHref = `${url.origin}${url.pathname}`

  const payload: ActionGetResponse = {
    icon: `${url.origin}/icon.svg`,
    title: "Registrar Check-in Emocional",
    description:
      "Guarda tu check-in emocional como un Memo inmutable en Solana Devnet. Tu viaje emocional en blockchain.",
    label: "Registrar en Devnet",
    links: {
      actions: [
        {
          type: "transaction",
          label: "Registrar Check-in",
          href: `${baseHref}?city={city}&initialMood={initialMood}&finalMood={finalMood}&agent={agent}&sentiment={sentiment}`,
          parameters: [
            { name: "city", label: "Ciudad", required: true },
            { name: "initialMood", label: "Ánimo Inicial (0-100)", required: true },
            { name: "finalMood", label: "Ánimo Final (0-100)", required: true },
            { name: "agent", label: "Guía IA", required: true },
            { name: "sentiment", label: "Sentimiento", required: false },
          ],
        },
      ],
    },
  }

  return Response.json(payload, { headers: ACTIONS_CORS_HEADERS })
}

export const OPTIONS = GET

export async function POST(req: Request) {
  try {
    const body: ActionPostRequest = await req.json()

    let feePayer: PublicKey
    try {
      feePayer = new PublicKey(body.account)
    } catch {
      return Response.json(
        { message: "Dirección de wallet inválida" },
        { status: 400, headers: ACTIONS_CORS_HEADERS }
      )
    }

    const url = new URL(req.url)
    const { city, initialMood, finalMood, agent, sentiment } =
      parseCheckInParams(url)

    // Formato del memo: [Reflect] Ciudad | Ánimo: 50→78 (+28) | Guía: Nova | Sentimiento: optimista
    const memoText = `[Reflect] ${city} | Ánimo: ${initialMood}→${finalMood} (+${parseInt(finalMood) - parseInt(initialMood)}) | Guía: ${agent} | ${sentiment}`

    const connection = new Connection(SOLANA_RPC, "confirmed")
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash()

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
    })

    const transaction = new Transaction({
      feePayer,
      blockhash,
      lastValidBlockHeight,
    }).add(memoInstruction)

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
        message: `Check-in de ${city} registrado en Solana Devnet ✨ Tu viaje emocional es inmutable.`,
      },
    })

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS })
  } catch (err) {
    console.error("[Action /check-in-memo POST]", err)
    return Response.json(
      { message: "Error al crear la transacción" },
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    )
  }
}

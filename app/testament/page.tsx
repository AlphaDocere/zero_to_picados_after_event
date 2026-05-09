import { Web3Testament } from '@/components/solana/web3-testament'

export const metadata = {
  title: 'Testamento Colectivo | Reflect',
  description: 'Tu viaje emocional permanentemente registrado en Web3',
}

export default function TestamentPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Web3Testament />
      </div>
    </main>
  )
}

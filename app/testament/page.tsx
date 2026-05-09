import { Web3Testament } from '@/components/solana/web3-testament'
import { SolanaTxValidator } from '@/components/solana/solana-tx-validator'

export const metadata = {
  title: 'Testamento Colectivo | Reflect',
  description: 'Tu viaje emocional permanentemente registrado en Web3',
}

export default function TestamentPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        <Web3Testament />

        <div className="border-t border-border/50 pt-12">
          <div className="bg-gradient-to-br from-purple-950/30 to-pink-950/30 border border-purple-500/20 rounded-2xl p-8">
            <SolanaTxValidator />
          </div>
        </div>
      </div>
    </main>
  )
}

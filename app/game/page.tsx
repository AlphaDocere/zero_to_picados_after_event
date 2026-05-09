import { GameFlow } from "@/components/game/game-flow"
import { CopilotSidebarWrapper } from "@/components/copilot-sidebar-wrapper"

export const metadata = {
  title: "Ruleta Emocional — Reflect",
  description: "Un reto emocional generado por IA para mover tu estado de ánimo.",
}

export default function GamePage() {
  return (
    <>
      <GameFlow />
      <CopilotSidebarWrapper />
    </>
  )
}

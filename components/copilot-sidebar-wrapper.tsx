"use client"

import { CopilotSidebar } from "@copilotkit/react-ui"

export function CopilotSidebarWrapper() {
  return (
    <CopilotSidebar
      defaultOpen={false}
      labels={{
        title: "Reflect AI",
        initial: "Hola! Soy tu asistente de Reflect. Puedo ayudarte a entender tus emociones, explorar tus reflexiones y acompañarte en tu check-in emocional. ¿En qué te puedo ayudar hoy?",
      }}
    />
  )
}

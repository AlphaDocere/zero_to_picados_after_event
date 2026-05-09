import { RequestCityForm } from '@/components/city/request-city-form'
import { Globe, Sparkles, Users } from 'lucide-react'

export const metadata = {
  title: 'Solicita tu Ciudad | Reflect',
  description: 'Pide que agreguemos tu ciudad a Reflect',
}

export default function SolicitaTuCiudadPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Globe className="w-16 h-16 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Solicita tu Ciudad</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ¿Tu ciudad no está en Reflect? Nos encantaría agregarla. Cuéntanos dónde vives y qué ciudad te gustaría explorar emocionalmente.
          </p>
        </div>

        {/* Form */}
        <div className="flex justify-center">
          <RequestCityForm />
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-bold text-foreground">Noticias Relevantes</h3>
            <p className="text-sm text-muted-foreground">
              Obtendrás noticias locales seleccionadas para tu ciudad
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-bold text-foreground">Comunidad Local</h3>
            <p className="text-sm text-muted-foreground">
              Conecta con otras personas de tu ciudad que usan Reflect
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Globe className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-bold text-foreground">Experiencia Local</h3>
            <p className="text-sm text-muted-foreground">
              Refleja sobre eventos y noticias que importan en tu lugar
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-6 mt-16">
          <h2 className="text-2xl font-bold text-foreground">Preguntas Frecuentes</h2>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6 space-y-2">
              <h3 className="font-bold text-foreground">¿Cuánto tarda en agregarse mi ciudad?</h3>
              <p className="text-sm text-muted-foreground">
                Las ciudades se agregan según demanda. Recibirás un email cuando tu ciudad esté lista.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-2">
              <h3 className="font-bold text-foreground">¿De dónde vienen las noticias?</h3>
              <p className="text-sm text-muted-foreground">
                Las noticias se seleccionan cuidadosamente para representar diversos sentimientos y temas relevantes en cada ciudad.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-2">
              <h3 className="font-bold text-foreground">¿Puedo sugerir noticias para mi ciudad?</h3>
              <p className="text-sm text-muted-foreground">
                Sí, al solicitar tu ciudad puedes incluir comentarios sobre qué tipo de noticias te gustaría ver.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

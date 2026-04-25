import Calendar from "@/components/Calendar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Agenda de Cultos</h1>
        <p className="text-gray-500 text-sm">
          Clique em uma quarta, sábado ou domingo para ver o pregador agendado.
        </p>
      </header>

      <main className="w-full max-w-lg">
        <Calendar />
      </main>
    </div>
  );
}

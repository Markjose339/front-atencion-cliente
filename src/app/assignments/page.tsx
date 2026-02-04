import { TicketCreate } from "@/components/assignments/ticket-create"
import { ModeToggle } from "@/components/mode-toggle"

export default function AssignmentsPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-muted/40 relative">
      <div className="absolute right-6 top-6 z-50 scale-125">
        <ModeToggle />
      </div>
      <TicketCreate />
    </main>
  )
}

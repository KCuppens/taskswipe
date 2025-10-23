import Link from "next/link"
import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Inbox, Calendar, Clock, LogOut, User } from "lucide-react"
import { redirect } from "next/navigation"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Desktop Navigation */}
      <nav className="hidden border-b md:block">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/triage" className="text-xl font-bold">
              TaskSwipe
            </Link>
            <div className="flex gap-1">
              <Link href="/triage">
                <Button variant="ghost" size="sm">
                  <Inbox className="mr-2 h-4 w-4" />
                  Triage
                </Button>
              </Link>
              <Link href="/today">
                <Button variant="ghost" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Today
                </Button>
              </Link>
              <Link href="/later">
                <Button variant="ghost" size="sm">
                  <Clock className="mr-2 h-4 w-4" />
                  Later
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user?.name || session.user?.email}
            </span>
            <form
              action={async () => {
                "use server"
                await signOut()
              }}
            >
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/triage" className="text-lg font-bold">
            TaskSwipe
          </Link>
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
          >
            <Button variant="ghost" size="sm" type="submit">
              <User className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </nav>

      <main className="min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden safe-area-inset-bottom">
        <div className="grid h-16 grid-cols-3 gap-1 px-2">
          <Link
            href="/triage"
            className="flex flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors hover:bg-accent active:scale-95"
          >
            <Inbox className="h-5 w-5" />
            <span>Triage</span>
          </Link>
          <Link
            href="/today"
            className="flex flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors hover:bg-accent active:scale-95"
          >
            <Calendar className="h-5 w-5" />
            <span>Today</span>
          </Link>
          <Link
            href="/later"
            className="flex flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors hover:bg-accent active:scale-95"
          >
            <Clock className="h-5 w-5" />
            <span>Later</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

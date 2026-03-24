import { Suspense } from "react"
import { LearnSlovakTabs } from "@/components/ui/learn-slovak-tabs"
import { UserButton } from "@/components/ui/user-button"

export const metadata = {
  title: "Play — Slovak Learning Game",
}

export default function GamePage() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black">Slovak Learning Game</h1>
          <UserButton />
        </div>
        <Suspense>
          <LearnSlovakTabs />
        </Suspense>
      </div>
    </main>
  )
}

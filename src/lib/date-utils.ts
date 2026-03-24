/**
 * Date utilities using Europe/Bratislava timezone.
 * Raw `toISOString().split("T")[0]` returns UTC, which causes false streak
 * resets for users playing after 10 PM (UTC+1) or 11 PM (UTC+2 in summer).
 */

export function getTodayBratislava(): string {
  return new Date().toLocaleDateString("sv-SE", {
    timeZone: "Europe/Bratislava",
  }) // sv-SE locale always returns "YYYY-MM-DD"
}

export function getYesterdayBratislava(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Bratislava" })
}

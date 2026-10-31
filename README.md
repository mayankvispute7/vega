# VEGA — Emergency Mobility Intelligence Platform
> **Tagline:** *Every Second Matters. Every Road Responds.*  
> **Challenge:** SEVA Innovation Challenge · Infrastructure & Mobility · Automation in Traffic Management  
> **Team:** Devora  

---

> [!IMPORTANT]
> **SIMULATED DEMO DATA NOTICE:** Every vehicle, junction, operator, timestamp, and performance metric in this prototype is **simulated demo data** and is explicitly labelled as such inside the user interface. No real-world performance or deployment claims are made.

---

## 1. What VEGA Is

VEGA is **not** an ambulance tracker. It is a **junction-coordination platform** that orchestrates the humans and traffic signals along an emergency vehicle's path.

Urban green corridors fail not because vehicles lack GPS, but because the **human coordination chain** is fragile:
- *Which junction must act next?*
- *Who is responsible at that post?*
- *When must they begin preparing?* (`ETA − lead_time`)
- *Has readiness been explicitly confirmed?*

VEGA answers these questions in real time:
1. **Predicts preparation windows** from dynamic ETAs and intersection clearance lead times.
2. **Dispatches junction-specific task cards** to traffic controllers before the vehicle arrives.
3. **Escalates on silence** through an accountable escalation ladder (L1 re-alert → L2 supervisor takeover → L3 At Risk corridor warning).
4. **Calculates alternate bypass corridors** using an in-engine Dijkstra graph search when roadblocks appear.
5. **Generates immutable, cryptographically-verifiable audit logs** and post-mission debriefs.

---

## 2. Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **State Management:** Zustand (domain slices with derived metrics)
- **Cross-Tab Sync:** Native `BroadcastChannel` API (`vega-sync`)
- **Mapping:** MapLibre GL JS + CARTO Dark Matter tiles (with graceful offline vector fallback)
- **Animations:** Framer Motion (slide-overs, animated pills, radar pulses)
- **Charts:** Recharts (benchmarks, transit times, wait-time distribution)
- **Icons & Design System:** Lucide React, HSL tailored CSS tokens, JetBrains Mono & Inter typography
- **Testing:** Vitest + React Testing Library (14 deterministic engine unit tests)

---

## 3. Quick Start & Prerequisites

### Prerequisites
- Node.js 18.17+ or 20+
- npm 9+

### Installation & Run

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Run unit tests
npx vitest run

# 3. Start local development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 4. Key Prototype Routes

| Route | View | Description |
|---|---|---|
| `/command` | **Command Centre** | Live corridor map, junction coordination rail, KPI metrics, event timeline, sim controls |
| `/junction/[id]` | **Junction Operator Console** | Mobile-first controller HUD (`/junction/J1` ... `/junction/J5`), big ETA ring, action buttons, decision support |
| `/activate` | **Trip Activation Stepper** | 4-stage mission dispatch wizard with road-user alert preview |
| `/exceptions` | **Exception & Reroute Hub** | Roadblock reporting modal, Dijkstra alternate path comparison, dispatcher approval |
| `/driver` | **Driver HUD View** | Full-screen high-contrast pilot display (large traffic light circle, countdown, proceed/hold instructions) |
| `/sim` | **Simulation Benchmarks** | Recharts comparisons across Baseline, VEGA-Assisted, and Failure scenarios |
| `/review` | **Post-Trip Review** | Audit debrief with verifiable citations `[→ Event #N]` that jump to timeline events |
| `/dev/engine` | **Engine Debugger** | Real-time state machine inspector, tick monitor, and live audit stream |
| `/dev/ui-kit` | **Design System UI Kit** | Showcase of all StatusChips, CountdownRings, KpiTiles, Panels, and Badges |

---

## 5. 60-Second Demo Script (Judge Walkthrough)

Follow this step-by-step walkthrough to demonstrate the prototype:

1. **Open Command Centre & Junction Console side-by-side:**
   - Window 1 (Left): Open `http://localhost:3000/command`
   - Window 2 (Right): Open `http://localhost:3000/junction/J2` (or mobile device/narrow window)

2. **Start the Corridor Simulation:**
   - In Window 1, click **▶ Play** on the bottom `Sim Controls` bar (or select `2×` speed).
   - Watch the ambulance smoothly traverse the Pune corridor from Deccan Gymkhana towards Karve Nagar.
   - Notice the ETA countdown updating continuously across both windows.

3. **Demonstrate Cross-Tab Synchronization:**
   - In Window 2 (`/junction/J2`), tap **1. Acknowledge**, then **2. Preparing**, then **CONFIRM SIGNAL READY**.
   - Notice that Window 1 (`/command`) updates its junction card, map marker, and audit timeline **in <100ms** via native `BroadcastChannel`.

4. **Show Automated Escalation Ladder:**
   - Click **↺ Reset** on the Sim Controls.
   - Click **▶ Play** and let the clock run without acknowledging J2.
   - At `sentAt + 20s`, watch J2 trigger an **L1 Escalation** (amber pulse).
   - At `sentAt + 40s`, watch J2 trigger an **L2 Escalation** (supervisor alerted).
   - In Window 2, switch your role to `Supervisor` in the top bar to see the supervisor control takeover banner.

5. **Simulate a Roadblock & Alternate Corridor Reroute:**
   - In Window 1, click **⚠ Report Roadblock / Detour** (or navigate to `/exceptions`).
   - Click **Simulate Roadblock at J3 (Alka Talkies)**.
   - The Dijkstra engine calculates an alternate bypass segment.
   - Click **✓ Authorize & Activate Alternate Corridor**.
   - Return to `/command`: notice the alternate route layer turns teal, J3 is marked **Cancelled**, and J4/J5 ETAs are re-sequenced.

6. **Review Grounded Audit Log & AI Debrief:**
   - Navigate to `/review`.
   - Read the debrief sentences. Click any citation link (e.g. `[→ Event #... ]`) to watch the timeline instantly scroll and highlight that verifiable ledger event.

---

## 6. Verification & Test Suite

Run the full coordination engine test suite:

```bash
npx vitest run
```

Tests cover:
- `eta.ts`: ETA distance/speed calculations at 0%, 50%, and 100% progress
- `escalation.ts`: L1 (20s), L2 (40s), and L3 lead-time threshold triggers
- `safety.ts`: Lead time envelope safety, stale telemetry detection (>30s)
- `reroute.ts`: Dijkstra alternate graph pathfinding skipping blocked segments
- `scheduler.ts`: Deterministic state transitions (Scheduled → Sent → Received → Preparing → Ready → Cleared)

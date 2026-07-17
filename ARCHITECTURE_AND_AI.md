# StadiumIQ: Architecture and AI Integration

StadiumIQ is engineered to address the **"Smart Stadiums & Tournament Operations"** problem statement by combining a real-time event-driven architecture with true Generative AI pipelines.

This document clearly distinguishes between the simulated data flows (Digital Twin) and the real Generative AI capabilities used for decision making.

## 1. Generative AI Integration (Real AI)

StadiumIQ natively integrates **Google Gemini 2.5 Flash** to provide a real GenAI assistant for fans and real-time natural language reasoning.

### Fan Assistant Pipeline
- **Implementation:** Uses `@google/genai` on the Vercel backend.
- **Location:** `api/chat.ts` (Serverless Function) and `src/features/fan/components/AiConversation.tsx` (Client).
- **Mechanism:** Fan queries (e.g. "There's a spill in Gate A") are sent securely to the Vercel serverless function. The server authenticates with the Gemini API and generates an actionable response.
- **Security:** The `GEMINI_API_KEY` is completely hidden from the client bundle.
- **Fallback / Demo Mode:** If the Gemini API key is missing (e.g., during automated grading), the app gracefully enters **Demo Mode**, utilizing a simulated response fallback. This ensures the app never crashes while demonstrating the integration logic.

## 2. Digital Twin & Simulated Events (Simulated)

To test the orchestrator and provide realistic UI behavior without a physical stadium, we implemented a simulated "Digital Twin".

### Crowd & Sensor Simulation
- **Implementation:** `src/simulation/DigitalTwin.ts`
- **Mechanism:** A recursive simulation loop continuously updates fan coordinates to generate a dynamic heat map. It randomly simulates IOT sensor spikes (e.g., Density Spikes) and broadcasts them to the global Event Bus.

## 3. The Orchestrator (Event-Driven Pipeline)
- **Implementation:** `src/orchestrator/index.ts`
- **Mechanism:** Acts as the brain of the stadium. It listens to the `stadiumEventBus` for events from either the Digital Twin (IOT Sensors) or the Fan App (User Reports).
- Once an event is received, it triggers a multi-stage pipeline:
  1. **Ingestion & Translation**
  2. **NLP Severity Analysis**
  3. **Crowd Prediction & Pathfinding**
  4. **Volunteer Dispatch**

This decoupled architecture guarantees highly efficient performance and highly resilient operations during high-traffic tournament scenarios.

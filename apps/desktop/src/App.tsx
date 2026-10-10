import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type AgentView = { agentId: string; state: string; lastTaskId?: string; updatedAt?: string };
type RuntimeEvent = { id: string; type: string; source: string; timestamp: string; payload: Record<string, unknown> };
type TelemetryView = { hostname: string; platform: string; uptimeSeconds: number; memory: { totalBytes: number; freeBytes: number; usedBytes: number }; loadAverage: number[] };
const fallbackAgents = ["CORE", "RESEARCH", "CODING", "BROWSER", "SYSTEM", "SECURITY"];

function CoreVisual() {
  const particles = useMemo(() => Array.from({ length: 70 }, (_, i) => ({
    x: Math.sin(i * 1.7) * 3.4, y: Math.cos(i * 2.3) * 2.4, z: (i % 12) * .22 - 1.2
  })), []);
  return <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
    <ambientLight intensity={.5}/><pointLight position={[0, 0, 3]} intensity={12}/>
    {particles.map((p, i) => <mesh key={i} position={[p.x, p.y, p.z]}>
      <sphereGeometry args={[.025 + (i % 3) * .012, 8, 8]}/>
      <meshStandardMaterial emissive="#63d9ff" emissiveIntensity={3} color="#16334a"/>
    </mesh>)}
  </Canvas>;
}

export default function App() {
  const [runtime, setRuntime] = useState("CONNECTING");
  const [activeTasks, setActiveTasks] = useState(0);
  const [queuedTasks, setQueuedTasks] = useState(0);
  const [agents, setAgents] = useState<AgentView[]>([]);
  const [events, setEvents] = useState<RuntimeEvent[]>([]);
  const [lastUpdate, setLastUpdate] = useState("");
  const [telemetry, setTelemetry] = useState<TelemetryView | null>(null);

  useEffect(() => {
    let mounted = true;
    const applyStatus = (status: Awaited<ReturnType<NonNullable<Window["jarvis"]>["getStatus"]>>) => {
      if (!mounted) return;
      setRuntime(status.state.toUpperCase());
      setActiveTasks(status.activeTasks);
      setQueuedTasks(status.queuedTasks);
      setAgents(status.agents.map((agent) => ({ agentId: agent.agentId, state: agent.state, lastTaskId: agent.lastTaskId, updatedAt: agent.updatedAt })));
      setLastUpdate(status.updatedAt);
      setTelemetry(status.telemetry ?? null);
    };
    const refresh = async () => {
      if (!window.jarvis) { setRuntime("BROWSER MODE"); return; }
      try { applyStatus(await window.jarvis.getStatus()); } catch { if (mounted) setRuntime("DISCONNECTED"); }
    };
    void refresh();
    const unsubscribe = window.jarvis?.onEvent((event) => {
      setEvents((previous) => [event, ...previous.filter((item) => item.id !== event.id)].slice(0, 8));
      void refresh();
    });
    const timer = window.setInterval(() => void refresh(), 2000);
    return () => { mounted = false; unsubscribe?.(); window.clearInterval(timer); };
  }, []);

  const visibleAgents: AgentView[] = agents.length ? agents : fallbackAgents.map((agentId) => ({ agentId, state: "NOT REGISTERED" }));

  return <main className="jarvis">
    <header>
      <div><div className="eyebrow">J.A.R.V.I.S.</div><h1>Artificial Intelligence Command System</h1></div>
      <div className="status"><span/> RUNTIME · {runtime}</div>
    </header>
    <section className="core"><div className="core-visual"><CoreVisual/></div>
      <div className="core-overlay"><motion.div className="core-ring" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}/>
        <div className="core-label">JARVIS CORE</div><div className="core-state">{runtime}</div>
      </div>
    </section>
    <section className="metric-grid">
      <article><div className="panel-label">ACTIVE TASKS</div><div className="metric">{activeTasks}</div><div className="panel-note">Currently executing</div></article>
      <article><div className="panel-label">QUEUED TASKS</div><div className="metric">{queuedTasks}</div><div className="panel-note">Waiting for a worker</div></article>
      <article><div className="panel-label">REGISTERED AGENTS</div><div className="metric">{agents.length}</div><div className="panel-note">Runtime registry snapshot</div></article>
      <article><div className="panel-label">PC CONTROL</div><div className="metric locked">LOCKED</div><div className="panel-note">Privileged actions disabled by default</div></article>
    </section>
    {telemetry && <section className="telemetry-panel">
      <div className="panel-heading"><span>SYSTEM TELEMETRY</span><span>{telemetry.hostname} · {telemetry.platform}</span></div>
      <div className="telemetry-grid">
        <div><div className="panel-label">MEMORY USED</div><div className="telemetry-value">{(telemetry.memory.usedBytes / 1024 ** 3).toFixed(2)} GB</div><div className="panel-note">{(telemetry.memory.totalBytes / 1024 ** 3).toFixed(2)} GB total</div></div>
        <div><div className="panel-label">MEMORY PRESSURE</div><div className="telemetry-value">{telemetry.memory.totalBytes ? Math.round(telemetry.memory.usedBytes / telemetry.memory.totalBytes * 100) : 0}%</div><div className="panel-note">Current system snapshot</div></div>
        <div><div className="panel-label">LOAD AVERAGE</div><div className="telemetry-value">{telemetry.loadAverage.map((value) => value.toFixed(2)).join(" / ")}</div><div className="panel-note">Platform-reported 1 / 5 / 15 min</div></div>
        <div><div className="panel-label">SYSTEM UPTIME</div><div className="telemetry-value">{Math.floor(telemetry.uptimeSeconds / 3600)}h {Math.floor(telemetry.uptimeSeconds % 3600 / 60)}m</div><div className="panel-note">Since last system boot</div></div>
      </div>
    </section>}
    <section className="agents">{visibleAgents.slice(0, 6).map(({ agentId, state, lastTaskId }, i) =>
      <motion.article key={agentId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .08 }}>
        <div className="agent-name">{agentId.toUpperCase()}</div><div className="agent-state">{state}</div>
        {lastTaskId && <div className="panel-note">Last task: {lastTaskId}</div>}
      </motion.article>
    )}</section>
    <section className="event-panel">
      <div className="panel-heading"><span>RUNTIME EVENT STREAM</span><span>{events.length} RECENT EVENTS</span></div>
      {events.length ? events.map((event) => <div className="event-row" key={event.id}>
        <span className="event-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
        <span className="event-type">{event.type}</span><span className="event-source">{event.source}</span>
      </div>) : <div className="empty-events">Waiting for runtime events. Events appear here when the runtime publishes them.</div>}
    </section>
    <footer><span>EVENT BUS: {events.length ? "ACTIVE" : "WAITING"}</span><span>ACTIVE: {activeTasks}</span><span>QUEUE: {queuedTasks}</span><span>SECURITY: RESTRICTED</span><span>SYNC: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : "WAITING"}</span></footer>
  </main>;
}

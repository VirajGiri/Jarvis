import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

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
  const [agents, setAgents] = useState<Array<{ agentId: string; state: string }>>([]);
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    let mounted = true;
    const applyStatus = (status: Awaited<ReturnType<NonNullable<Window["jarvis"]>["getStatus"]>>) => {
      if (!mounted) return;
      setRuntime(status.state.toUpperCase());
      setActiveTasks(status.activeTasks);
      setQueuedTasks(status.queuedTasks);
      setAgents(status.agents.map((agent) => ({ agentId: agent.agentId, state: agent.state })));
      setLastUpdate(status.updatedAt);
    };

    const refresh = async () => {
      if (!window.jarvis) {
        setRuntime("BROWSER MODE");
        return;
      }
      applyStatus(await window.jarvis.getStatus());
    };

    void refresh();
    const unsubscribe = window.jarvis?.onEvent(() => void refresh());
    const timer = window.setInterval(() => void refresh(), 2000);

    return () => {
      mounted = false;
      unsubscribe?.();
      window.clearInterval(timer);
    };
  }, []);

  const visibleAgents = agents.length ? agents : fallbackAgents.map((agentId) => ({ agentId, state: "UNKNOWN" }));

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
    <section className="agents">{visibleAgents.slice(0, 6).map(({ agentId, state }, i) =>
      <motion.article key={agentId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .08 }}>
        <div className="agent-name">{agentId.toUpperCase()}</div><div className="agent-state">{state}</div>
      </motion.article>
    )}</section>
    <footer><span>EVENT BUS: LIVE</span><span>ACTIVE: {activeTasks}</span><span>QUEUE: {queuedTasks}</span><span>PC CONTROL: LOCKED</span><span>SYNC: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : "WAITING"}</span></footer>
  </main>;
}

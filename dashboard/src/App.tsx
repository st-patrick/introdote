import { useEffect, useState } from "react";

const API = "/api";

interface Provider {
  name: string;
  role: string;
  account?: string;
  status?: string;
  credential_keys?: string[];
  domains?: Array<{ name: string; id?: number }>;
}

interface LaunchedProject {
  name: string;
  url: string;
  itch?: string;
  type: string;
  tags: string[];
  description: string;
}

interface BuriedProject {
  name: string;
  framework: string;
  hasBuild?: boolean;
}

interface LiveSubdomain {
  name: string;
  url: string;
}

interface SnapshotData {
  status: { installed: boolean };
  providers: Provider[];
  capabilities: { configured: boolean; capabilities: Record<string, unknown> };
  launched?: LaunchedProject[];
  buried?: BuriedProject[];
  liveSubdomains?: LiveSubdomain[];
}

const typeColors: Record<string, string> = {
  game: "#f59e0b",
  creative: "#a78bfa",
  business: "#22c55e",
  tool: "#60a5fa",
  event: "#f472b6",
  subdomain: "#888",
};

function thumb(url: string) {
  return `https://image.thum.io/get/width/600/crop/400/https://${url.replace(/^https?:\/\//, "")}`;
}

function ProjectCard({ name, url, type, description, tags, itch }: {
  name: string;
  url: string;
  type: string;
  description?: string;
  tags?: string[];
  itch?: string;
}) {
  const color = typeColors[type] || "#888";
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        background: "#1a1a2e",
        borderRadius: 12,
        border: "1px solid #2a2a4a",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#2a2a4a";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "3/2",
          background: "#12121f",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          src={thumb(url)}
          alt={name}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 6,
            background: color + "33",
            color: color,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            backdropFilter: "blur(8px)",
          }}
        >
          {type}
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
          {name}
        </div>
        {description && (
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#888", lineHeight: 1.4 }}>
            {description}
          </p>
        )}
        {tags && tags.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {tags.slice(0, 4).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 10,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: "#12121f",
                  color: "#555",
                  border: "1px solid #2a2a4a",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {itch && (
          <div style={{ marginTop: 6, fontSize: 11, color: "#555" }}>
            Also on <span style={{ color: "#f472b6" }}>itch.io</span>
          </div>
        )}
      </div>
    </a>
  );
}

function App() {
  const [data, setData] = useState<SnapshotData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/status`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return Promise.all([
          r.json(),
          fetch(`${API}/providers`).then((r) => r.json()),
          fetch(`${API}/capabilities`).then((r) => r.json()),
        ]);
      })
      .then(([status, providers, capabilities]) => {
        fetch("/snapshot.json")
          .then((r) => r.json())
          .then((snap) =>
            setData({ ...snap, status, providers, capabilities })
          )
          .catch(() => setData({ status, providers, capabilities }));
      })
      .catch(() => {
        fetch("/snapshot.json")
          .then((r) => r.json())
          .then((snap: SnapshotData) => setData(snap))
          .catch(() => setError("No data available."));
      });
  }, []);

  if (error) {
    return (
      <div style={rootStyle}>
        <h1 style={{ fontSize: 24 }}>Introdote</h1>
        <p style={{ color: "#ef4444", marginTop: 16 }}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={rootStyle}>
        <p style={{ color: "#888" }}>Loading...</p>
      </div>
    );
  }

  const launched = data.launched || [];
  const buried = data.buried || [];
  const liveSubdomains = data.liveSubdomains || [];
  const providers = data.providers || [];

  return (
    <div style={rootStyle}>
      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, margin: "0 0 4px 0", fontWeight: 700 }}>
          Introdote
        </h1>
        <p style={{ margin: 0, color: "#888", fontSize: 14 }}>
          Your projects don't stay buried.
        </p>
      </header>

      {/* Services — compact bar at top */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        {providers.map((p) => (
          <div
            key={p.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              background: "#1a1a2e",
              borderRadius: 10,
              border: "1px solid #2a2a4a",
              fontSize: 13,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: p.status === "ok" ? "#22c55e" : "#ef4444",
                flexShrink: 0,
              }}
            />
            <strong>{p.name}</strong>
            <span style={{ color: "#555" }}>{p.role}</span>
            {p.domains && (
              <span style={{ color: "#444", fontSize: 11 }}>
                {p.domains.length} domains
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Launched Projects — grid with screenshots */}
      <h2 style={sectionTitle}>Launched ({launched.length})</h2>
      <div style={gridStyle}>
        {launched.map((p) => (
          <ProjectCard key={p.name} {...p} />
        ))}
      </div>

      {/* Live Subdomains — grid with screenshots */}
      {liveSubdomains.length > 0 && (
        <>
          <h2 style={{ ...sectionTitle, marginTop: 40 }}>
            Live on patrickreinbold.com ({liveSubdomains.length})
          </h2>
          <div style={gridStyle}>
            {liveSubdomains.map((s) => (
              <ProjectCard
                key={s.name}
                name={s.name}
                url={s.url}
                type="subdomain"
              />
            ))}
          </div>
        </>
      )}

      {/* Buried Projects */}
      {buried.length > 0 && (
        <>
          <h2 style={{ ...sectionTitle, marginTop: 40 }}>
            Buried — ready to ship ({buried.length}+)
          </h2>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {buried.map((p) => (
              <div
                key={p.name}
                style={{
                  padding: "6px 12px",
                  background: "#1a1a2e",
                  borderRadius: 8,
                  border: "1px solid #2a2a4a",
                  fontSize: 13,
                  color: "#888",
                }}
              >
                {p.name}
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 10,
                    color: "#444",
                    fontFamily: "monospace",
                  }}
                >
                  {p.framework}
                </span>
              </div>
            ))}
            <div
              style={{
                padding: "6px 12px",
                background: "transparent",
                borderRadius: 8,
                border: "1px dashed #2a2a4a",
                fontSize: 13,
                color: "#444",
              }}
            >
              +12 more in ~/code/ and ~/Desktop/appaday
            </div>
          </div>
        </>
      )}

      <footer
        style={{
          marginTop: 48,
          paddingTop: 20,
          borderTop: "1px solid #2a2a4a",
          color: "#555",
          fontSize: 12,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Introdote — your projects don't stay buried</span>
        <a
          href="https://github.com/st-patrick/introdote"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#555", textDecoration: "none" }}
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}

const rootStyle: React.CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: 32,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: "#e0e0e0",
  background: "#0f0f1a",
  minHeight: "100vh",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 14,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "#888",
  margin: "0 0 16px 0",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 16,
};

export default App;

import React, { useState, useEffect, useCallback } from 'react';

const API = "";  // same domain on Vercel, localhost:3001 in dev via proxy

// ── Utilities ────────────────────────────────────────────────────────────────
function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#0f1117',
  surface: '#1a1d27',
  surfaceHover: '#21253a',
  border: '#2a2d3e',
  borderLight: '#333652',
  primary: '#6366f1',
  primaryHover: '#4f51d4',
  primaryMuted: 'rgba(99,102,241,0.12)',
  secondary: '#a855f7',
  secondaryMuted: 'rgba(168,85,247,0.12)',
  green: '#22c55e',
  greenMuted: 'rgba(34,197,94,0.12)',
  red: '#ef4444',
  redMuted: 'rgba(239,68,68,0.1)',
  text: '#e2e8f0',
  textMuted: '#64748b',
  textDim: '#94a3b8',
};

// ── Atoms ────────────────────────────────────────────────────────────────────
const Pill = ({ children, variant = 'primary' }) => {
  const map = {
    primary: { bg: C.primaryMuted, color: C.primary },
    secondary: { bg: C.secondaryMuted, color: C.secondary },
    green: { bg: C.greenMuted, color: C.green },
    red: { bg: C.redMuted, color: C.red },
  };
  const s = map[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 99,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
      textTransform: 'uppercase',
      background: s.bg, color: s.color,
    }}>{children}</span>
  );
};

const Mono = ({ children }) => (
  <code style={{
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 12, background: 'rgba(255,255,255,0.06)',
    padding: '1px 6px', borderRadius: 4, color: C.textDim,
  }}>{children}</code>
);

const Divider = () => (
  <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
);

// ── Input ────────────────────────────────────────────────────────────────────
const Input = ({ label, icon, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textDim, marginBottom: 6, letterSpacing: '0.04em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none', opacity: 0.5 }}>
          {icon}
        </span>
        <input
          {...props}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 12px 10px 38px',
            background: C.surface,
            border: `1.5px solid ${focused ? C.primary : C.border}`,
            borderRadius: 10, fontSize: 13, color: C.text,
            outline: 'none', transition: 'border-color 0.15s',
            boxShadow: focused ? `0 0 0 3px ${C.primaryMuted}` : 'none',
          }}
        />
      </div>
    </div>
  );
};

// ── Response panel ────────────────────────────────────────────────────────────
const ResponsePanel = ({ data }) => {
  const { contact } = data;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Primary ID</span>
        <span style={{ fontSize: 32, fontWeight: 900, color: C.primary, lineHeight: 1 }}>#{contact.primaryContatctId}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* Emails */}
        <div style={{ background: C.surface, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>✉ Emails</div>
          {contact.emails.length === 0
            ? <span style={{ fontSize: 12, color: C.textMuted }}>none</span>
            : contact.emails.map((e, i) => (
              <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: C.text, fontFamily: 'monospace', wordBreak: 'break-all' }}>{e}</span>
                {i === 0 && <Pill variant="primary">primary</Pill>}
              </div>
            ))}
        </div>

        {/* Phones */}
        <div style={{ background: C.surface, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>📞 Phones</div>
          {contact.phoneNumbers.length === 0
            ? <span style={{ fontSize: 12, color: C.textMuted }}>none</span>
            : contact.phoneNumbers.map((p, i) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: C.text, fontFamily: 'monospace' }}>{p}</span>
                {i === 0 && <Pill variant="primary">primary</Pill>}
              </div>
            ))}
        </div>
      </div>

      {/* Secondary IDs */}
      <div style={{ background: C.surface, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>🔗 Secondary Contact IDs</div>
        {contact.secondaryContactIds.length === 0
          ? <span style={{ fontSize: 12, color: C.textMuted }}>none — this is the only contact</span>
          : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {contact.secondaryContactIds.map(id => (
                <span key={id} style={{
                  background: C.secondaryMuted, color: C.secondary,
                  padding: '3px 10px', borderRadius: 6,
                  fontSize: 13, fontWeight: 700, fontFamily: 'monospace',
                }}>#{id}</span>
              ))}
            </div>
        }
      </div>
    </div>
  );
};

// ── Contact Table ─────────────────────────────────────────────────────────────
const ContactTable = ({ contacts, loading, onRefresh }) => {
  const th = {
    padding: '10px 14px', fontSize: 10, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: C.textMuted, background: C.surface,
    borderBottom: `1px solid ${C.border}`, textAlign: 'left',
    whiteSpace: 'nowrap',
  };
  const td = { padding: '11px 14px', fontSize: 12, color: C.text, verticalAlign: 'middle' };

  // Group by primary
  const primaries = contacts.filter(c => c.linkPrecedence === 'primary');
  const byPrimary = primaries.map(p => ({
    primary: p,
    secondaries: contacts.filter(c => c.linkedId === p.id),
  }));

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Contact Database</span>
          <span style={{ marginLeft: 8, fontSize: 12, color: C.textMuted }}>
            {contacts.length} row{contacts.length !== 1 ? 's' : ''} · {primaries.length} cluster{primaries.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button onClick={onRefresh} disabled={loading} style={{
          fontSize: 12, padding: '6px 14px', borderRadius: 8,
          border: `1px solid ${C.border}`, background: 'transparent',
          color: C.textDim, cursor: 'pointer', fontWeight: 600,
          transition: 'all 0.15s',
        }}>
          {loading ? '...' : '↻ Refresh'}
        </button>
      </div>

      {contacts.length === 0
        ? <div style={{ padding: '48px 24px', textAlign: 'center', color: C.textMuted, fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🗄️</div>
            No contacts yet. Make your first <Mono>/identify</Mono> request.
          </div>
        : <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['ID', 'Email', 'Phone', 'Linked To', 'Precedence', 'Created', 'Updated'].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byPrimary.map(({ primary, secondaries }) => (
                  <React.Fragment key={primary.id}>
                    {/* Primary row */}
                    <tr style={{ background: 'rgba(99,102,241,0.04)', borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ ...td, fontWeight: 800, color: C.primary, fontFamily: 'monospace' }}>#{primary.id}</td>
                      <td style={td}><span style={{ fontFamily: 'monospace', fontSize: 11 }}>{primary.email || <span style={{ color: C.textMuted }}>—</span>}</span></td>
                      <td style={td}><span style={{ fontFamily: 'monospace' }}>{primary.phoneNumber || <span style={{ color: C.textMuted }}>—</span>}</span></td>
                      <td style={{ ...td, color: C.textMuted }}>—</td>
                      <td style={td}><Pill variant="primary">primary</Pill></td>
                      <td style={{ ...td, color: C.textMuted, fontSize: 11 }}>{fmt(primary.createdAt)}</td>
                      <td style={{ ...td, color: C.textMuted, fontSize: 11 }}>{fmt(primary.updatedAt)}</td>
                    </tr>
                    {/* Secondary rows */}
                    {secondaries.map(s => (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: 'rgba(168,85,247,0.02)' }}>
                        <td style={{ ...td, paddingLeft: 28, color: C.textDim, fontFamily: 'monospace' }}>↳ #{s.id}</td>
                        <td style={td}><span style={{ fontFamily: 'monospace', fontSize: 11 }}>{s.email || <span style={{ color: C.textMuted }}>—</span>}</span></td>
                        <td style={td}><span style={{ fontFamily: 'monospace' }}>{s.phoneNumber || <span style={{ color: C.textMuted }}>—</span>}</span></td>
                        <td style={{ ...td, color: C.primary, fontFamily: 'monospace', fontWeight: 700 }}>#{s.linkedId}</td>
                        <td style={td}><Pill variant="secondary">secondary</Pill></td>
                        <td style={{ ...td, color: C.textMuted, fontSize: 11 }}>{fmt(s.createdAt)}</td>
                        <td style={{ ...td, color: C.textMuted, fontSize: 11 }}>{fmt(s.updatedAt)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
      }
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────
const SCENARIOS = [
  { label: '① New customer',        email: 'lorraine@hillvalley.edu', phone: '123456' },
  { label: '② New email, same phone', email: 'mcfly@hillvalley.edu',   phone: '123456' },
  { label: '③ Two primaries merge',  email: 'george@hillvalley.edu',  phone: '717171' },
];

export default function App() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const res = await fetch(`${API}/contacts`);
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch {}
    setContactsLoading(false);
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleIdentify = async (e) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      setError('Provide at least one of email or phone number.');
      return;
    }
    setError(''); setResult(null); setSuccessMsg('');
    setLoading(true);
    try {
      const body = {};
      if (email.trim()) body.email = email.trim();
      if (phone.trim()) body.phoneNumber = phone.trim();
      const res = await fetch(`${API}/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data);
      setSuccessMsg('Identity resolved successfully');
      fetchContacts();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!window.confirm('Delete all contacts?')) return;
    setResetting(true);
    try {
      await fetch(`${API}/contacts/reset`, { method: 'DELETE' });
      setContacts([]); setResult(null); setError('');
      setSuccessMsg('Database reset successfully');
    } catch (err) { setError('Reset failed: ' + err.message); }
    setResetting(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Top nav */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>👁</span>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em' }}>Bitespeed</span>
          <span style={{ color: C.textMuted, fontSize: 13 }}>/</span>
          <span style={{ color: C.textMuted, fontSize: 13 }}>Identity Reconciliation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mono>POST /identify</Mono>
          <span style={{ fontSize: 12, color: C.textMuted }}>Node.js · Express · SQLite</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── LEFT PANEL ─────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Identify Form */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Identify Request</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Link customer identities across purchases</div>
            </div>

            <div style={{ padding: '16px 20px 4px' }}>
              {/* Scenario buttons */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Demo scenarios</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SCENARIOS.map(s => (
                    <button key={s.label}
                      onClick={() => { setEmail(s.email); setPhone(s.phone); setResult(null); setError(''); }}
                      style={{
                        textAlign: 'left', padding: '8px 12px', borderRadius: 8,
                        border: `1px solid ${C.border}`, background: C.bg,
                        color: C.textDim, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.target.style.borderColor = C.primary; e.target.style.color = C.text; }}
                      onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.textDim; }}
                    >
                      <span style={{ fontWeight: 700, color: C.primary }}>{s.label.split(' ')[0]}</span>{' '}
                      {s.label.split(' ').slice(1).join(' ')}
                    </button>
                  ))}
                </div>
              </div>

              <Divider />
              <div style={{ height: 12 }} />

              <form onSubmit={handleIdentify}>
                <Input
                  label="Email"
                  icon="✉"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. lorraine@hillvalley.edu"
                />
                <Input
                  label="Phone Number"
                  icon="📞"
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 123456"
                />

                {error && (
                  <div style={{
                    background: C.redMuted, border: `1px solid rgba(239,68,68,0.3)`,
                    borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#f87171', marginBottom: 12,
                  }}>
                    ⚠ {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '11px', marginBottom: 16,
                  background: loading ? C.primaryMuted : C.primary,
                  color: loading ? C.primary : '#fff',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s', letterSpacing: '0.01em',
                }}>
                  {loading ? 'Identifying…' : 'Identify →'}
                </button>
              </form>
            </div>
          </div>

          {/* Response */}
          {result && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', borderLeftWidth: 3, borderLeftColor: C.green }}>
              <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Pill variant="green">200 OK</Pill>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Response</span>
                </div>
                <button onClick={() => setShowRaw(v => !v)} style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 6,
                  border: `1px solid ${C.border}`, background: 'transparent',
                  color: C.textDim, cursor: 'pointer',
                }}>
                  {showRaw ? 'Pretty' : 'Raw JSON'}
                </button>
              </div>
              <div style={{ padding: '16px 20px' }}>
                {showRaw
                  ? <pre style={{ fontSize: 11, background: C.bg, color: '#a5f3fc', padding: 14, borderRadius: 8, overflow: 'auto', margin: 0, lineHeight: 1.6 }}>
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  : <ResponsePanel data={result} />
                }
              </div>
            </div>
          )}

          {/* Reset */}
          <button onClick={handleReset} disabled={resetting} style={{
            padding: '9px', border: `1px solid rgba(239,68,68,0.3)`,
            borderRadius: 10, background: C.redMuted,
            color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            {resetting ? 'Resetting…' : '🗑  Reset database'}
          </button>

          {successMsg && (
            <div style={{ fontSize: 12, color: C.green, textAlign: 'center', padding: '4px 0' }}>
              ✓ {successMsg}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────── */}
        <ContactTable contacts={contacts} loading={contactsLoading} onRefresh={fetchContacts} />
      </div>
    </div>
  );
}
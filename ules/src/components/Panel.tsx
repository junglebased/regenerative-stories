import type { Profile, Entry } from '../types';
import { calcCredits, fmt } from '../lib/credits';

interface Props {
  currentProfile: Profile;
  otherProfile: Profile | null;
  entries: Entry[];
}

export default function Panel({ currentProfile, otherProfile, entries }: Props) {
  const settled = entries.filter((e) => e.status === 'Confirmed' || e.status === 'Resolved');

  function earned(id: string) {
    return settled.filter((e) => e.contributor_id === id).reduce((s, e) => s + calcCredits(e), 0);
  }
  function received(id: string) {
    return settled.filter((e) => e.recipient_id === id).reduce((s, e) => s + calcCredits(e), 0);
  }
  function netFor(id: string) { return earned(id) - received(id); }

  const myNet  = netFor(currentProfile.id);
  const gap    = Math.abs(myNet); // In a 2-person system net(A) = -net(B)
  const behind = myNet < 0 ? currentProfile : otherProfile;

  const members = [currentProfile, otherProfile].filter(Boolean) as Profile[];

  return (
    <div className="view">
      <h2>Panel</h2>
      <p className="sub">
        Sadece <b>onaylanmış</b> kayıtlar bakiyeye sayılır. Anlık güncellenir.
      </p>

      <div className="duo">
        {members.map((p, i) => {
          const n = netFor(p.id);
          const avCls = p.name.startsWith('B') ? 'b' : 'g';
          return (
            <div key={p.id} className={`mcard${i === 0 ? ' me' : ''}`}>
              <div className="mhead">
                <div className={`mav ${avCls}`}>{p.name[0]}</div>
                <div>
                  <div className="mname">
                    {p.name}
                    {i === 0 && (
                      <span style={{ fontSize: 11, color: 'var(--mut)', marginLeft: 6 }}>
                        (sen)
                      </span>
                    )}
                  </div>
                  <div className="mtier">Güven: {p.tier}</div>
                </div>
              </div>
              <div className={`net ${n >= 0 ? 'pos' : 'neg'}`}>
                {n >= 0 ? '+' : ''}{fmt(n)}
              </div>
              <div className="netlbl">net bakiye (puan)</div>
              <div className="stat2">
                <div>
                  <span>Verdiği</span>
                  <b>{fmt(earned(p.id))}</b>
                </div>
                <div>
                  <span>Aldığı</span>
                  <b>{fmt(received(p.id))}</b>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="balbox">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b>Aradaki puan farkı</b>
          <span style={{ fontWeight: 800, fontSize: 18 }}>{fmt(gap)} / 15</span>
        </div>
        <div className="bar">
          <div className="fill" style={{ width: `${Math.min(100, (gap / 22) * 100)}%` }} />
          <div className="mark" />
        </div>
        <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--bad)', marginBottom: 8 }}>
          ↑ kırmızı çizgi = 15 (dengeleme eşiği)
        </div>
        <div className={`balmsg ${gap > 15 ? 'warn' : 'ok'}`}>
          {gap > 15
            ? `⚠️ Fark 15'i aştı → dengeleme konuşması zamanı. ${behind?.name ?? '?'} bir iş üstlenmeli.`
            : '✅ Denge sağlıklı. İş akışına devam.'}
        </div>
      </div>

      <RecentActivity entries={entries} currentProfile={currentProfile} />
    </div>
  );
}

function RecentActivity({ entries, currentProfile }: { entries: Entry[]; currentProfile: Profile }) {
  const recent = entries.slice(0, 5);
  if (!recent.length) return null;

  return (
    <div>
      <h3 style={{ fontSize: 14, color: 'var(--mut)', marginBottom: 10, fontWeight: 600 }}>
        Son aktivite
      </h3>
      {recent.map((e) => {
        const isMe = e.contributor_id === currentProfile.id;
        const st = e.status.toLowerCase();
        return (
          <div
            key={e.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 0', borderBottom: '1px solid var(--line)',
              fontSize: 13,
            }}
          >
            <span className={`badge ${st}`} style={{ flexShrink: 0 }}>
              {e.status === 'Pending' ? 'Bekliyor' : e.status === 'Confirmed' ? 'Onaylandı' : e.status === 'Disputed' ? 'İtirazlı' : 'Uzlaşıldı'}
            </span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {e.name}
            </span>
            <span style={{ color: 'var(--mut)', flexShrink: 0 }}>
              {isMe ? '↑ sen' : '↓ sana'} · {fmt(calcCredits(e))}p
            </span>
          </div>
        );
      })}
    </div>
  );
}

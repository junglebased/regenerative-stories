import { supabase } from '../supabase';
import type { Profile, Entry } from '../types';
import { calcCredits, fmt, isStale } from '../lib/credits';

interface Props {
  currentProfile: Profile;
  entries: Entry[];
  showToast: (msg: string) => void;
  onRefresh: () => Promise<void>;
}

const STATUS_MAP: Record<string, string> = {
  Pending:   'Onay bekliyor',
  Confirmed: 'Onaylandı',
  Disputed:  'İtirazlı',
  Resolved:  'Uzlaşıldı',
};

export default function Ledger({ currentProfile, entries, showToast, onRefresh }: Props) {
  async function resolve(entry: Entry) {
    const { error } = await supabase
      .from('entries')
      .update({ status: 'Resolved' })
      .eq('id', entry.id);

    if (error) { showToast('Hata: ' + error.message); return; }
    await onRefresh();
    showToast('Uzlaşıldı · puan bakiyeye yazıldı');
  }

  return (
    <div className="view">
      <h2>Kayıt Defteri</h2>
      <p className="sub">
        Tüm iş kayıtları.{' '}
        <span className="badge stale">14g+</span> = gecikmiş, yarım puan.
      </p>

      {!entries.length ? (
        <div className="empty">Defter boş.</div>
      ) : (
        entries.map((entry) => {
          const st    = entry.status.toLowerCase();
          const stale = isStale(entry.date);
          const pts   = calcCredits(entry);
          const isMe  = entry.contributor_id === currentProfile.id;

          return (
            <div key={entry.id} className={`entry ${st}`}>
              <div className="ehead">
                <div>
                  <div className="etitle">
                    #{entry.id} · {entry.name} {entry.gen && '⭐'}
                  </div>
                  <div className="eflow">
                    {entry.contributor?.name ?? '?'} → {entry.recipient?.name ?? '?'} · {entry.skill}
                    {isMe && (
                      <span style={{ marginLeft: 6, color: 'var(--acc)', fontSize: 11 }}>sen</span>
                    )}
                  </div>
                </div>
                <div className="ecred">
                  <b>{fmt(pts)}</b>
                  <span>puan</span>
                </div>
              </div>

              <div className="emeta">
                <span className={`badge ${st}`}>{STATUS_MAP[entry.status] ?? entry.status}</span>
                {stale && <span className="badge stale">14g+ ·½</span>}
                <span className="pill">📁 {entry.project}</span>
                <span className="pill">📦 {entry.units}×{entry.rate}</span>
                <span className="pill">✖️ {fmt(Math.min(entry.m1 * entry.m2 * entry.m3, 1.5))}</span>
                <span className="pill">📅 {entry.date}</span>
                <a className="evlink" href={entry.evidence} target="_blank" rel="noreferrer">
                  🔗
                </a>
              </div>

              {entry.notes && (
                <div style={{ fontSize: 12, color: 'var(--mut)', marginTop: -4, marginBottom: 6 }}>
                  📝 {entry.notes}
                </div>
              )}

              {entry.status === 'Disputed' && (
                <div className="eactions">
                  <button className="btn sm" onClick={() => resolve(entry)}>
                    🤝 Uzlaş & onayla
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

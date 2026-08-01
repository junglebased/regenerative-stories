import { useState } from 'react';
import { supabase } from '../supabase';
import type { Profile, Entry } from '../types';
import { calcCredits, fmt } from '../lib/credits';

interface Props {
  currentProfile: Profile;
  entries: Entry[];
  showToast: (msg: string) => void;
  onRefresh: () => Promise<void>;
}

type Adj = { m1: number; m2: number; m3: number };

export default function Approvals({ currentProfile, entries, showToast, onRefresh }: Props) {
  const pending = entries.filter(
    (e) => e.recipient_id === currentProfile.id && e.status === 'Pending'
  );

  const [adjustments, setAdjustments] = useState<Record<number, Adj>>({});

  function getAdj(e: Entry): Adj {
    return adjustments[e.id] ?? { m1: e.m1, m2: e.m2, m3: e.m3 };
  }

  function setAdj(e: Entry, key: keyof Adj, val: number) {
    setAdjustments((prev) => ({
      ...prev,
      [e.id]: { ...getAdj(e), [key]: val },
    }));
  }

  async function approve(entry: Entry) {
    const adj = getAdj(entry);
    const { error } = await supabase
      .from('entries')
      .update({ ...adj, status: 'Confirmed' })
      .eq('id', entry.id);

    if (error) { showToast('Hata: ' + error.message); return; }

    setAdjustments((prev) => { const n = { ...prev }; delete n[entry.id]; return n; });
    const pts = calcCredits({ ...entry, ...adj });
    await onRefresh();
    showToast(`Onaylandı · +${fmt(pts)} puan → ${entry.contributor?.name ?? '?'}`);
  }

  async function dispute(entry: Entry) {
    const { error } = await supabase
      .from('entries')
      .update({ status: 'Disputed' })
      .eq('id', entry.id);

    if (error) { showToast('Hata: ' + error.message); return; }
    await onRefresh();
    showToast("İtiraz edildi — defterde 'İtirazlı' olarak işaretlendi");
  }

  return (
    <div className="view">
      <h2>Onay bekleyenler</h2>
      <p className="sub">
        <b>{currentProfile.name}</b> olarak senin onayını bekleyenler.
        Çarpanları kontrol et, gerekirse ayarla, sonra onayla.
      </p>

      {!pending.length ? (
        <div className="empty">🎉 Onay bekleyen kayıt yok.</div>
      ) : (
        pending.map((entry) => {
          const adj = getAdj(entry);
          const pts = calcCredits({ ...entry, ...adj });

          return (
            <div key={entry.id} className="entry pending">
              <div className="ehead">
                <div>
                  <div className="etitle">
                    {entry.name} {entry.gen && '⭐'}
                  </div>
                  <div className="eflow">
                    {entry.contributor?.name ?? '?'} → {entry.recipient?.name ?? '?'} · {entry.skill}
                  </div>
                </div>
                <div className="ecred">
                  <b>{fmt(pts)}</b>
                  <span>puan (öneri)</span>
                </div>
              </div>

              <div className="emeta">
                <span className="pill">📁 {entry.project}</span>
                <span className="pill">📦 {entry.units} birim</span>
                <span className="pill">📅 {entry.date}</span>
                <a className="evlink" href={entry.evidence} target="_blank" rel="noreferrer">
                  🔗 Kanıt
                </a>
              </div>

              {entry.notes && (
                <div style={{ fontSize: 13, color: 'var(--mut)', marginBottom: 8 }}>
                  📝 {entry.notes}
                </div>
              )}

              <div className="adjust">
                <div style={{ fontSize: 12, color: 'var(--mut)', marginBottom: 8 }}>
                  Çarpanları onaylamadan önce ayarlayabilirsin:
                </div>
                <div className="three">
                  {((['m1', 'm2', 'm3'] as const)).map((key, i) => (
                    <div key={key} className="mslider">
                      <label>
                        {['Zorluk', 'Aciliyet', 'Sahiplik'][i]}
                        <span>{adj[key].toFixed(1)}</span>
                      </label>
                      <input
                        type="range" min={1} max={1.5} step={0.1}
                        value={adj[key]}
                        onChange={(e) => setAdj(entry, key, +e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'right', fontSize: 13, marginTop: 8 }}>
                  Onaylanacak puan:{' '}
                  <b style={{ color: 'var(--acc2)' }}>{fmt(pts)}</b>
                </div>
              </div>

              <div className="eactions">
                <button className="btn ok sm" onClick={() => approve(entry)}>
                  ✅ Onayla
                </button>
                <button className="btn bad sm" onClick={() => dispute(entry)}>
                  ⚠️ İtiraz et
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

import type { Profile, Entry } from '../types';
import { calcCredits, fmt, daysSince } from '../lib/credits';

interface Props {
  currentProfile: Profile;
  otherProfile: Profile | null;
  entries: Entry[];
}

export default function Weekly({ currentProfile, otherProfile, entries }: Props) {
  const thisWeek    = entries.filter((e) => daysSince(e.date) <= 7);
  const settled     = entries.filter((e) => e.status === 'Confirmed' || e.status === 'Resolved');
  const weekCredits = thisWeek
    .filter((e) => e.status === 'Confirmed' || e.status === 'Resolved')
    .reduce((s, e) => s + calcCredits(e), 0);
  const pendingCount  = entries.filter((e) => e.status === 'Pending').length;
  const disputedCount = entries.filter((e) => e.status === 'Disputed').length;

  const myEarned   = settled.filter((e) => e.contributor_id === currentProfile.id).reduce((s, e) => s + calcCredits(e), 0);
  const myReceived = settled.filter((e) => e.recipient_id   === currentProfile.id).reduce((s, e) => s + calcCredits(e), 0);
  const myNet      = myEarned - myReceived;
  const gap        = Math.abs(myNet);
  const behind     = myNet < 0 ? currentProfile : otherProfile;

  return (
    <div className="view">
      <h2>Haftalık uzlaşma</h2>
      <p className="sub">Son 7 günün özeti — haftada bir 10 dakikalık bakış.</p>

      <div className="week">
        <div className="wrow">
          <span>Bu hafta girilen kayıt</span><b>{thisWeek.length}</b>
        </div>
        <div className="wrow">
          <span>Bu hafta onaylanan puan</span><b>{fmt(weekCredits)}</b>
        </div>
        <div className="wrow">
          <span>Bekleyen onay</span>
          <b style={{ color: pendingCount ? 'var(--warn)' : 'var(--acc2)' }}>{pendingCount}</b>
        </div>
        <div className="wrow">
          <span>İtirazlı kayıt</span>
          <b style={{ color: disputedCount ? 'var(--bad)' : 'var(--acc2)' }}>{disputedCount}</b>
        </div>
        <div className="wrow">
          <span>Net fark</span><b>{fmt(gap)} / 15</b>
        </div>
      </div>

      <div className={`balmsg ${gap > 15 ? 'warn' : 'ok'}`}>
        {gap > 15
          ? `⚠️ Dengeleme gerek: ${behind?.name ?? '?'} bir sonraki işi üstlensin ya da puan farkı konuşulsun.`
          : '✅ 10 dakikalık bakış tamam — denge sağlıklı, devam.'}
      </div>

      {pendingCount > 0 && (
        <div className="balmsg" style={{ color: 'var(--warn)', marginTop: 12 }}>
          ⏳ {pendingCount} kayıt onay bekliyor. "Onaylar" sekmesinden kapatın (kural: 48 saat içinde).
        </div>
      )}

      {disputedCount > 0 && (
        <div className="balmsg" style={{ color: 'var(--bad)', marginTop: 12 }}>
          ⚠️ {disputedCount} kayıt itirazlı. "Defter"den "Uzlaş & onayla" ile kapatın.
        </div>
      )}

      <SkillBreakdown entries={entries} currentProfile={currentProfile} />
    </div>
  );
}

function SkillBreakdown({ entries, currentProfile }: { entries: Entry[]; currentProfile: Profile }) {
  const settled = entries.filter((e) => e.status === 'Confirmed' || e.status === 'Resolved');
  if (!settled.length) return null;

  const bySkill: Record<string, number> = {};
  settled
    .filter((e) => e.contributor_id === currentProfile.id)
    .forEach((e) => {
      bySkill[e.skill] = (bySkill[e.skill] ?? 0) + calcCredits(e);
    });

  const sorted = Object.entries(bySkill).sort(([, a], [, b]) => b - a);
  if (!sorted.length) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ fontSize: 14, color: 'var(--mut)', marginBottom: 10, fontWeight: 600 }}>
        Senin katkın yeteneğe göre (toplam)
      </h3>
      {sorted.map(([skill, pts]) => (
        <div
          key={skill}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '7px 0', borderBottom: '1px solid var(--line)', fontSize: 13,
          }}
        >
          <span>{skill}</span>
          <b style={{ color: 'var(--acc2)' }}>{fmt(pts)} p</b>
        </div>
      ))}
    </div>
  );
}

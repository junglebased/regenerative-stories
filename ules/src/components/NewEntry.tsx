import { useState } from 'react';
import { supabase } from '../supabase';
import type { Profile } from '../types';
import { SKILLS, PROJECTS } from '../types';
import { fmt } from '../lib/credits';

interface Props {
  currentProfile: Profile;
  otherProfile: Profile | null;
  showToast: (msg: string) => void;
  onRefresh: () => Promise<void>;
  onSubmitted: () => void;
}

const DEFAULT_SKILL = SKILLS[0];

export default function NewEntry({ currentProfile, otherProfile, showToast, onRefresh, onSubmitted }: Props) {
  const [name, setName]         = useState('');
  const [skill, setSkill]       = useState<string>(DEFAULT_SKILL.name);
  const [project, setProject]   = useState<string>(PROJECTS[0]);
  const [units, setUnits]       = useState(1);
  const [m1, setM1]             = useState(1.0);
  const [m2, setM2]             = useState(1.0);
  const [m3, setM3]             = useState(1.0);
  const [evidence, setEvidence] = useState('');
  const [gen, setGen]           = useState(false);
  const [notes, setNotes]       = useState('');
  const [error, setError]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const currentSkill = SKILLS.find((s) => s.name === skill) ?? DEFAULT_SKILL;
  const rate = currentSkill.rate;
  const rawMult = m1 * m2 * m3;
  const mult = Math.min(rawMult, 1.5);
  const preview = rate * units * mult;

  const handleSubmit = async () => {
    if (!name.trim())      { setError('⚠️ İşin adını yaz.'); return; }
    if (!evidence.trim())  { setError('⚠️ Kanıt linki zorunlu — link yoksa puan yok (kural #1).'); return; }
    if (units < 1)         { setError('⚠️ Adet en az 1 olmalı.'); return; }
    if (!otherProfile)     { setError('⚠️ Diğer kullanıcı henüz sisteme girmemiş.'); return; }

    setError('');
    setSubmitting(true);

    const { error: dbErr } = await supabase.from('entries').insert({
      name:           name.trim(),
      contributor_id: currentProfile.id,
      recipient_id:   otherProfile.id,
      skill,
      rate,
      project,
      units,
      m1, m2, m3,
      evidence:       evidence.trim(),
      gen,
      notes:          notes.trim(),
      date:           new Date().toISOString().slice(0, 10),
      status:         'Pending',
    });

    setSubmitting(false);

    if (dbErr) { setError('Hata: ' + dbErr.message); return; }

    setName(''); setEvidence(''); setNotes('');
    setGen(false); setUnits(1);
    setM1(1.0); setM2(1.0); setM3(1.0);

    await onRefresh();
    showToast(`Kayıt ${otherProfile.name}'ın onayına düştü ✓`);
    onSubmitted();
  };

  return (
    <div className="view">
      <h2>Yeni iş kaydı</h2>
      <p className="sub">
        Kaydı giren: <b>{currentProfile.name}</b> → teslim alan:{' '}
        <b>{otherProfile?.name ?? '—'}</b>
      </p>

      <div className="field">
        <label>İşin adı <span className="req">*</span></label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="örn. RS Böl.3 — 2 dk kaba kurgu"
        />
      </div>

      <div className="two">
        <div className="field">
          <label>Yetenek <span className="hint">(taban oranı belirler)</span></label>
          <select value={skill} onChange={(e) => setSkill(e.target.value)}>
            {SKILLS.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} · taban {s.rate}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Proje</label>
          <select value={project} onChange={(e) => setProject(e.target.value)}>
            {PROJECTS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="two">
        <div className="field">
          <label>Kime teslim edildi? <span className="hint">(onaylayacak kişi)</span></label>
          <input value={otherProfile?.name ?? '—'} disabled />
        </div>
        <div className="field">
          <label>Adet <span className="hint">(kaç birim teslim)</span></label>
          <input
            type="number"
            min={1}
            value={units}
            onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
      </div>

      <div className="field">
        <label>
          Kanıt linki <span className="req">*</span>{' '}
          <span className="hint">(yoksa puan yok)</span>
        </label>
        <input
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          placeholder="https://frame.io/... veya Drive linki"
        />
      </div>

      <div className="field">
        <label style={{ marginBottom: 10 }}>
          Değer çarpanları{' '}
          <span className="hint">(çarpımı en fazla 1.5×, son onay alıcıda)</span>
        </label>
        <div className="three">
          <div className="mslider">
            <label>Zorluk (M1)<span>{m1.toFixed(1)}</span></label>
            <input type="range" min={1} max={1.5} step={0.1} value={m1}
              onChange={(e) => setM1(+e.target.value)} />
          </div>
          <div className="mslider">
            <label>Aciliyet (M2)<span>{m2.toFixed(1)}</span></label>
            <input type="range" min={1} max={1.5} step={0.1} value={m2}
              onChange={(e) => setM2(+e.target.value)} />
          </div>
          <div className="mslider">
            <label>Sahiplik (M3)<span>{m3.toFixed(1)}</span></label>
            <input type="range" min={1} max={1.5} step={0.1} value={m3}
              onChange={(e) => setM3(+e.target.value)} />
          </div>
        </div>
      </div>

      <div className="field">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={gen}
            onChange={(e) => setGen(e.target.checked)}
            style={{ width: 'auto' }}
          />
          ⭐ Cömertlik — beklenenden fazlasını verdim
        </label>
      </div>

      <div className="field">
        <label>Not <span className="hint">(opsiyonel)</span></label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="kısa açıklama"
        />
      </div>

      <div className="preview">
        <div>
          <div className="pv-big">{fmt(preview)}</div>
          <div className="pv-lbl">hesaplanan katkı puanı (onaylanınca kesinleşir)</div>
        </div>
        <div className="pv-formula">
          taban {rate} × adet {units} × çarpan {fmt(mult)}
          {rawMult > 1.5 && (
            <span style={{ color: 'var(--warn)' }}> (1.5 sınırı)</span>
          )}
        </div>
      </div>

      <button className="btn primary" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Gönderiliyor…' : 'Kaydı gönder → onaya düşer'}
      </button>
      {error && <div className="err" style={{ marginTop: 10 }}>{error}</div>}
    </div>
  );
}

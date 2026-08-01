import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile, Entry } from './types';
import Auth from './components/Auth';
import TopBar from './components/TopBar';
import Panel from './components/Panel';
import NewEntry from './components/NewEntry';
import Approvals from './components/Approvals';
import Ledger from './components/Ledger';
import Weekly from './components/Weekly';

type Tab = 'panel' | 'yeni' | 'onay' | 'defter' | 'uzlasma';

const TAB_LABELS: Record<Tab, string> = {
  panel:    '📊 Panel',
  yeni:     '➕ Yeni Kayıt',
  onay:     '✅ Onaylar',
  defter:   '📒 Defter',
  uzlasma:  '📅 Haftalık',
};

export default function App() {
  const [session, setSession]               = useState<Session | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles]             = useState<Profile[]>([]);
  const [entries, setEntries]               = useState<Entry[]>([]);
  const [activeTab, setActiveTab]           = useState<Tab>('panel');
  const [loading, setLoading]               = useState(true);
  const [toast, setToast]                   = useState('');
  const [toastVisible, setToastVisible]     = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  const fetchData = useCallback(async (userId: string) => {
    const [{ data: profilesData }, { data: entriesData }] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase
        .from('entries')
        .select(`
          *,
          contributor:contributor_id ( id, name, tier, created_at ),
          recipient:recipient_id ( id, name, tier, created_at )
        `)
        .order('created_at', { ascending: false }),
    ]);

    if (profilesData) {
      setProfiles(profilesData as Profile[]);
      const me = (profilesData as Profile[]).find((p) => p.id === userId);
      if (me) setCurrentProfile(me);
    }
    if (entriesData) {
      setEntries(entriesData as unknown as Entry[]);
    }
  }, []);

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        fetchData(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, s) => {
      setSession(s);
      if (s) fetchData(s.user.id);
    });

    return () => subscription.unsubscribe();
  }, [fetchData]);

  // Real-time subscription for entries table
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('ules-entries-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, () => {
        fetchData(session.user.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session, fetchData]);

  // Browser notification when new pending entries arrive
  useEffect(() => {
    if (!currentProfile || !entries.length) return;
    const myPending = entries.filter(
      (e) => e.recipient_id === currentProfile.id && e.status === 'Pending'
    );
    if (!myPending.length) return;

    const latestId = myPending[0].id.toString();
    const lastNotified = localStorage.getItem('ules_last_notified');
    if (latestId === lastNotified) return;
    localStorage.setItem('ules_last_notified', latestId);

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('ULES — Onay Bekliyor', {
        body: `"${myPending[0].name}" onayınızı bekliyor.`,
        icon: '/icon.svg',
      });
    }
  }, [entries, currentProfile]);

  const refresh = useCallback(async () => {
    if (session) await fetchData(session.user.id);
  }, [session, fetchData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentProfile(null);
    setProfiles([]);
    setEntries([]);
  };

  const requestNotifications = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  if (loading) {
    return <div className="loading-screen">Yükleniyor…</div>;
  }

  if (!session || !currentProfile) {
    return <Auth />;
  }

  const otherProfile = profiles.find((p) => p.id !== currentProfile.id) ?? null;
  const pendingCount = entries.filter(
    (e) => e.recipient_id === currentProfile.id && e.status === 'Pending'
  ).length;

  const shared = { currentProfile, otherProfile, profiles, entries, showToast, onRefresh: refresh };

  return (
    <>
      <TopBar
        currentProfile={currentProfile}
        onSignOut={handleSignOut}
        onRequestNotifications={requestNotifications}
      />

      <div className="app">
        <div className="tabs">
          {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`tab-btn${activeTab === tab ? ' on' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {TAB_LABELS[tab]}
              {tab === 'onay' && pendingCount > 0 && (
                <span className="dot">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'panel'   && <Panel    {...shared} />}
        {activeTab === 'yeni'   && (
          <NewEntry {...shared} onSubmitted={() => setActiveTab('onay')} />
        )}
        {activeTab === 'onay'   && <Approvals {...shared} />}
        {activeTab === 'defter' && <Ledger    {...shared} />}
        {activeTab === 'uzlasma' && <Weekly   {...shared} />}
      </div>

      <div className={`toast${toastVisible ? ' show' : ''}`}>{toast}</div>
    </>
  );
}

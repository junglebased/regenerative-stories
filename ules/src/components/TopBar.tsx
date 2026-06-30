import type { Profile } from '../types';

interface Props {
  currentProfile: Profile;
  onSignOut: () => void;
  onRequestNotifications: () => void;
}

export default function TopBar({ currentProfile, onSignOut, onRequestNotifications }: Props) {
  const showNotifBtn =
    'Notification' in window && Notification.permission === 'default';
  const avClass = currentProfile.name.startsWith('B') ? 'b' : 'g';

  return (
    <div className="top">
      <div className="top-in">
        <div className="logo">
          ULES <small>Emek Takas Sistemi</small>
        </div>
        <div className="spacer" />
        {showNotifBtn && (
          <button
            className="btn sm ghost"
            onClick={onRequestNotifications}
            title="Bildirim iznine izin ver"
            style={{ fontSize: 12, color: 'var(--mut)', padding: '6px 10px' }}
          >
            🔔 Bildirimler
          </button>
        )}
        <div className="user-chip">
          <div className={`av ${avClass}`}>{currentProfile.name[0]}</div>
          <span style={{ fontWeight: 600 }}>{currentProfile.name}</span>
          <span
            style={{ fontSize: 11, color: 'var(--mut)', marginLeft: 2 }}
          >
            {currentProfile.tier}
          </span>
        </div>
        <button className="btn sm" onClick={onSignOut}>
          Çıkış
        </button>
      </div>
    </div>
  );
}

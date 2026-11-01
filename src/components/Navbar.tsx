import React from 'react';
import { User, ThemeKey, DeviceMode } from '../types';
import {
  Bell,
  Palette,
  LogOut,
  Flame,
  Code2,
  HelpCircle,
  Camera,
  LayoutDashboard,
  Target,
  CheckSquare,
  Calendar,
  BarChart3,
  FolderOpen,
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { DeviceModeToggle } from './DeviceModeToggle';

interface NavbarProps {
  user: User | null;
  currentTab: string;
  onTabChange: (tab: string) => void;
  unreadNotifsCount: number;
  deviceMode: DeviceMode;
  onChangeDeviceMode: (mode: DeviceMode) => void;
  onOpenNotifications: () => void;
  onOpenThemes: () => void;
  onOpenRewards: () => void;
  onOpenAvatarPicker: () => void;
  onOpenGuide: () => void;
  onOpenBackendExport: () => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentTab,
  onTabChange,
  unreadNotifsCount,
  deviceMode,
  onChangeDeviceMode,
  onOpenNotifications,
  onOpenThemes,
  onOpenRewards,
  onOpenAvatarPicker,
  onOpenGuide,
  onOpenBackendExport,
  onLogout,
  onOpenAuth,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'Learning Goals', icon: Target },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'exams', label: 'Exams & Deadlines', icon: Calendar },
    { id: 'documents', label: 'My Documents', icon: FolderOpen },
    { id: 'progress', label: 'My Progress', icon: BarChart3 },
    { id: 'heatmap', label: 'Consistency', icon: Activity },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={() => onTabChange('dashboard')}
            className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white hover:text-purple-700 transition-colors"
          >
            StudyMate
          </button>
          <button
            type="button"
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <nav
            id="mobile-navigation-menu"
            aria-label="Main navigation and settings"
            className="absolute left-0 right-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:hidden"
          >
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                      isActive
                        ? 'bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-200'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
              <div className="col-span-2">
                <DeviceModeToggle deviceMode={deviceMode} onChangeMode={onChangeDeviceMode} />
              </div>
              <button
                type="button"
                onClick={() => {
                  onOpenNotifications();
                  setIsMobileMenuOpen(false);
                }}
                className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications{unreadNotifsCount > 0 ? ` (${unreadNotifsCount})` : ''}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenThemes();
                  setIsMobileMenuOpen(false);
                }}
                className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Palette className="h-4 w-4" />
                Appearance
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenGuide();
                  setIsMobileMenuOpen(false);
                }}
                className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <HelpCircle className="h-4 w-4" />
                How to use
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenBackendExport();
                  setIsMobileMenuOpen(false);
                }}
                className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Code2 className="h-4 w-4" />
                Flask/MySQL
              </button>
              {user && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAvatarPicker();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Camera className="h-4 w-4" />
                    Profile · {user.xp} XP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenRewards();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-amber-800 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/40"
                  >
                    <Flame className="h-4 w-4" />
                    {user.streakDays} day streak
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="col-span-2 flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </>
              )}
              {!user && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuth();
                    setIsMobileMenuOpen(false);
                  }}
                  className="col-span-2 min-h-11 rounded-xl bg-purple-700 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-800"
                >
                  Sign in
                </button>
              )}
            </div>
          </nav>
        )}
      </header>

      <aside className="fixed left-0 top-16 bottom-0 z-30 hidden lg:flex w-64 flex-col overflow-y-auto border-r border-slate-200/80 bg-white/90 px-4 py-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        {deviceMode === 'laptop' && (
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-purple-100/80 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        <div className="mt-6 flex flex-col gap-2 border-t border-slate-200/80 pt-4 dark:border-slate-700">
          <DeviceModeToggle deviceMode={deviceMode} onChangeMode={onChangeDeviceMode} />
          <PWAInstallButton />
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-slate-800"
            title="How to Use StudyMate Guide"
          >
            <HelpCircle className="w-4 h-4" />
            How to use
          </button>
          <button
            onClick={onOpenThemes}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Change Study Space Theme (including Dark Mode)"
          >
            <Palette className="w-4 h-4" />
            Appearance
          </button>
          <button
            onClick={onOpenBackendExport}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title="View Python Flask Backend & MySQL Schema"
          >
            <Code2 className="h-4 w-4" />
            Flask/MySQL
          </button>
          {user && (
            <button
              onClick={onOpenRewards}
              className="flex items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-left text-sm text-amber-800 transition-colors hover:bg-amber-100/70 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
              title="View XP & Study Badges"
            >
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span className="font-bold tabular-nums">{user.streakDays} day streak</span>
            </button>
          )}
          <button
            onClick={onOpenNotifications}
            className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Open Notification Center"
          >
            <Bell className="w-4 h-4" />
            Notifications
            {unreadNotifsCount > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white tabular-nums shadow-xs">
                {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-auto border-t border-slate-200/80 pt-4 dark:border-slate-700">
          {user ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={onOpenAvatarPicker}
                className="group relative flex items-center gap-2 text-left"
                title="Change Avatar Icon / Photo"
              >
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-purple-200 bg-purple-100">
                  {user.avatar ? (
                    user.avatar.startsWith('data:image/') || user.avatar.startsWith('/') ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-extrabold text-purple-700">
                        {user.name?.[0]?.toUpperCase()}
                      </span>
                    )
                  ) : (
                    <img
                      src="/src/assets/images/student_avatar_user_1793461321943.jpg"
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Micro camera indicator */}
                  <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Camera className="w-3 h-3" />
                  </span>
                </div>
                <div className="min-w-0 text-left">
                  <span className="block truncate text-xs font-bold leading-tight text-slate-900 dark:text-white">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold tabular-nums block">
                    {user.xp} XP
                  </span>
                </div>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full rounded-xl bg-purple-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-purple-800"
            >
              Sign In
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

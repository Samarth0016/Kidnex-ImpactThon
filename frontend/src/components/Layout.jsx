import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  BeakerIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid,
  BeakerIcon as BeakerIconSolid,
  ClockIcon as ClockIconSolid,
  UserIcon as UserIconSolid,
  HeartIcon as HeartIconSolid,
  ClipboardDocumentListIcon as ClipboardIconSolid,
  DocumentTextIcon as DocumentTextIconSolid
} from '@heroicons/react/24/solid';

const Layout = () => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: HomeIcon, solidIcon: HomeIconSolid, color: 'blue' },
    { name: 'Detection', href: '/app/detection', icon: BeakerIcon, solidIcon: BeakerIconSolid, color: 'purple' },
    { name: 'History', href: '/app/history', icon: ClockIcon, solidIcon: ClockIconSolid, color: 'indigo' },
    { name: 'Health Logs', href: '/app/health-logs', icon: HeartIcon, solidIcon: HeartIconSolid, color: 'pink' },
    { name: 'Report Simplifier', href: '/app/report-simplifier', icon: DocumentTextIcon, solidIcon: DocumentTextIconSolid, color: 'emerald' },
    { name: 'Medications', href: '/app/medications', icon: ClipboardDocumentListIcon, solidIcon: ClipboardIconSolid, color: 'purple' },
    { name: 'Profile', href: '/app/profile', icon: UserIcon, solidIcon: UserIconSolid, color: 'blue' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-blue-50 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">HealthAI</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300 hover:shadow-md">
                {user?.profile?.profilePicture ? (
                  <img
                    src={user.profile.profilePicture}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-300 shadow-md"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-blue-300 shadow-md">
                    {user?.profile?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">Active Account</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md font-semibold"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100 sticky top-28">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Navigation</h2>
                <p className="text-xs text-gray-500">Manage your health journey</p>
              </div>
              <nav className="space-y-2">
                {navigation.map((item, index) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-300 animate-fadeIn ${
                        isActive
                          ? `bg-${item.color}-50 text-${item.color}-700 shadow-md ring-2 ring-${item.color}-200 scale-105`
                          : 'text-gray-700 hover:bg-gray-50 hover:scale-105 hover:shadow-md'
                      }`
                    }
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive ? (
                          <item.solidIcon className={`mr-3 h-6 w-6 text-${item.color}-600`} />
                        ) : (
                          <item.icon className="mr-3 h-6 w-6 text-gray-500 group-hover:text-gray-700" />
                        )}
                        <span>{item.name}</span>
                        {isActive && (
                          <span className="ml-auto">
                            <svg className="w-5 h-5 text-${item.color}-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  UserCircle, 
//   LogIn, 
  LogOut, 
  MessageCircle, 
//   Sparkles, 
//   Lightbulb,
  Menu,
  X,
  Home,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const mainNavLinks = [
    { path: '/hackathons', label: 'Hackathons' },
    { path: '/publish-hackathon', label: 'Publish Hackathon' },
    { path: '/about', label: 'About' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/support', label: 'Support' },
    { path: '/profile', label: 'Profile' }
  ];

  const sidebarLinks = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/teams', icon: Users, label: 'My Teams' },
    { path: '/team-chat', icon: MessageCircle, label: 'Messages' },
    { path: '/profile', icon: UserCircle, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/help', icon: HelpCircle, label: 'Help & Support' }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="w-full h-fit md:h-20 flex items-center justify-center bg-transparent fixed top-3 md:top-0 left-0 z-[1000]">
        <header className="flex flex-col items-center justify-center w-[95%] md:max-w-[1400px] h-fit md:h-16 bg-black rounded-xl px-2 md:px-6 py-[14px] md:py-[19px]">
          <div className="w-full h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user && (
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Menu className="h-6 w-6 text-white" />
                </button>
              )}
              <Link className="flex items-center gap-1 text-xs" to="/">
                <img src="/images/Logo (2).png" className="w-30 h-20" alt="Logo" />
              </Link>
            </div>

            <nav className="hidden md:block">
              <ul className="flex items-center gap-4">
                {mainNavLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={cn(
                        "text-sm font-normal font-poppins hover:text-white transition-all duration-200 ease-in-out",
                        isActive(link.path) ? "text-white" : "text-white/70"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {user ? (
              <Button
                variant="outline"
                onClick={() => auth.signOut()}
                className="!bg-white hidden md:flex text-black"
              >
                <LogOut className="mr-2 h-5 w-5" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            ) : (
              <Link to="/login">
                <Button className="!bg-white hidden md:flex text-black">
                  Sign Up
                </Button>
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex md:hidden flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "w-10 h-[2.5px] bg-white rounded-full transition-all duration-300 ease-in-out",
                  isMenuOpen && "rotate-45 translate-y-[7px]"
                )}
              />
              <div
                className={cn(
                  "w-10 h-[2.5px] bg-white rounded-full transition-all duration-300 ease-in-out",
                  isMenuOpen && "-rotate-45 -translate-y-[0px]"
                )}
              />
            </button>
          </div>

          {/* Mobile Menu */}
          <nav
            className={cn(
              "md:hidden transition-all duration-300 ease-in-out w-full",
              isMenuOpen ? "mt-3 h-fit opacity-100" : "mt-0 h-0 opacity-0 overflow-hidden"
            )}
          >
            <ul className="flex flex-col items-center gap-4">
              {mainNavLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      "text-sm font-normal font-poppins hover:text-white transition-all duration-200 ease-in-out",
                      isActive(link.path) ? "text-white" : "text-white/70"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Button className="!bg-white flex md:hidden mt-3 !w-full">
              Download App
            </Button>
          </nav>
        </header>
      </div>

      {/* Sidebar */}
      {user && (
        <div
          className={cn(
            "fixed top-0 left-0 h-full bg-black/95 backdrop-blur-md w-64 transform transition-transform duration-300 ease-in-out z-[999]",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full p-4">
            <div className="flex justify-between items-center mb-8">
              <span className="text-white text-lg font-semibold">Menu</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <nav className="flex-1">
              <ul className="space-y-2">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          isActive(link.path)
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-auto">
              <Button
                variant="outline"
                onClick={() => {
                  auth.signOut();
                  setIsSidebarOpen(false);
                }}
                className="w-full !bg-white text-black"
              >
                <LogOut className="mr-2 h-5 w-5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[998]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Navigation;
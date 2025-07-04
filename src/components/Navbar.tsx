import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCircle,
  LogIn,
  LogOut,
  MessageCircle,
  Sparkles,
  Lightbulb,
  Menu,
  X,
  User,
  Telescope,
  Award,
  Paperclip,
  PaperclipIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { Button } from './ui/Button';
import RequestNotifications from './RequestNotifications';
import { DropdownMenu, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';
import { motion } from 'framer-motion';

// Define the NavLink component with proper types
const NavLink = ({
  to,
  icon: Icon,
  children,
  onClick
}: {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <Link to={to} onClick={onClick}>
    <Button
      variant="ghost"
      className="w-full justify-start hover:bg-blue-50 transition-colors"
    >
      <Icon className="mr-2 h-5 w-5 text-blue-500" />
      <span>{children}</span>
    </Button>
  </Link>
);


export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const getNavItems = () => {
    if (!user) {
      return [
        { to: "/explore", icon: Telescope, label: "Explore" },
        { to: "/hackathons", icon: Lightbulb, label: "Competitions" },
      ];
    }
    
    if (isAdmin) {
      return [
        { to: "/hackathons", icon: Lightbulb, label: "Competitions" },
        { to: "/Leaderboard", icon: Award, label: "LeaderBoard" },
      ];
    }
    
    return [
      { to: "/explore", icon: Telescope, label: "Explore" },
      { to: "/hackathons", icon: Lightbulb, label: "Competitions" },
      { to: "/teams", icon: Sparkles, label: "Find Teammates" },
      { to: "/team-chat", icon: MessageCircle, label: "Team Chat" },
      { to: "/Leaderboard", icon: Award, label: "LeaderBoard" },
      // { to: "/Dashboard", icon: Award, label: "Dashboard" },
      { to: "/ResumeAnalyzer", icon: PaperclipIcon, label: "ATS" },
    ];
  };

  const navItems = getNavItems();

  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          {/* <Link className="flex items-center gap-1 text-xs" to="/Dashboard">
            <img src="/images/Crevo.png" className="w-30 h-20" alt="Logo" />
          </Link> */}
          <div className="flex items-center justify-center sm:space-x-6 space-x-4">
     
        <Link to="/Dashboard">
        <motion.img
          src="/images/Crevo.png"
          alt="Crevo Logo"
          className="sm:w-24 w-16 cursor-pointer"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          />
          </Link>
      </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">

            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
            {
              user ? (
                <>
                  <RequestNotifications />
                  {/* <Link to="/">
                  <Button className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => auth.signOut()}>
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign out
                  </Button>
                </Link> */}
                  <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild className='bg-white'>
                      <Avatar>
                        <AvatarImage src={user.photoURL || undefined } />
                        <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white mt-3 text-black mr-2" align="end" forceMount>
                      <Link to="/profile" className='cursor-pointer'>
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <Link to="/" onClick={() => auth.signOut()}>
                        <DropdownMenuItem className='cursor-pointer'>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link to="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </Button>
                </Link>
              )
            }

          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
  <div className="md:hidden py-4 space-y-2 border-t border-gray-100">
    {user ? (
      <>
        {navItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to} 
            icon={item.icon} 
            onClick={() => setIsMenuOpen(false)} // Close menu when clicked
          >
            {item.label}
          </NavLink>
        ))}
        <RequestNotifications />
        <Button
          variant="outline"
          onClick={() => {
            auth.signOut();
            setIsMenuOpen(false); // Close menu on sign out
          }}
          className="w-full justify-start"
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </>
    ) : (
      <Link to="/login" className="block" onClick={() => setIsMenuOpen(false)}>
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <LogIn className="mr-2 h-5 w-5" />
          Sign In
        </Button>
      </Link>
    )}
  </div>
)}

      </div>
    </nav>
  );
}
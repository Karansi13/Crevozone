import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation(); 

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className='w-full h-fit md:h-20 flex items-center justify-center bg-transparent fixed top-3 md:top-0 left-0 z-[1000]'>
      <header className='flex flex-col items-center justify-center w-[95%] md:max-w-[1400px] h-fit md:h-16 bg-black rounded-xl px-2 md:px-6 py-[14px] md:py-[19px]'>
        <div className='w-full h-full flex items-center justify-between'>
          <Link className="flex items-center gap-1 text-xs" to="/">
            <img src="/images/Logo (2).png" className="w-30 h-20" alt="Logo" />
          </Link>

          <nav className='hidden md:block'>
            <ul className='flex items-center gap-4'>
              <li>
                <Link
                  to='/hackathons'
                  className={`text-sm font-normal font-poppins hover:text-white transition-all duration-200 ease-in-out ${
                    isActive('/hackathons') ? 'text-white' : 'text-white/70'
                  }`}
                >
                  Hackathons
                </Link>
              </li>
              <li>
                <Link
                  to='/publish-hackathon'
                  className={`text-sm font-normal font-poppins hover:text-white transition-all duration-200 ease-in-out ${
                    isActive('/publish-hackathon') ? 'text-white' : 'text-white/70'
                  }`}
                >
                  Publish Hackathon
                </Link>
              </li>
              <li>
                <Link
                  to='/about'
                  className={`text-sm font-normal font-poppins hover:text-white transition-all duration-200 ease-in-out ${
                    isActive('/about') ? 'text-white' : 'text-white/70'
                  }`}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to='/pricing'
                  className={`text-sm font-normal font-poppins hover:text-white transition-all duration-200 ease-in-out ${
                    isActive('/pricing') ? 'text-white' : 'text-white/70'
                  }`}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to='/support'
                  className={`text-sm font-normal font-poppins hover:text-white transition-all duration-200 ease-in-out ${
                    isActive('/support') ? 'text-white' : 'text-white/70'
                  }`}
                >
                  Support
                </Link>
              </li>
            </ul>
          </nav>

          {user ? (
            <Link to="/">
              <Button
                variant="outline"
                onClick={() => auth.signOut()}
                className="!bg-white hidden md:flex text-black"
              >
                <LogOut className="mr-2 h-5 w-5" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button className='!bg-white hidden md:flex text-black'>
                SignUp
              </Button>
            </Link>
          )}

          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className='flex md:hidden flex-col items-center gap-1'
          >
            <div
              className={`w-10 h-[2.5px] bg-white rounded-full ${
                isMenuOpen ? 'rotate-[45deg]' : ''
              } transition-all duration-300 ease-in-out`}
            />
            <div
              className={`w-10 h-[2.5px] bg-white rounded-full ${
                isMenuOpen ? 'rotate-[-45deg]' : ''
              } transition-all duration-300 ease-in-out`}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <nav
          className={`${
            isMenuOpen ? 'mt-3 h-fit overflow-auto opacity-100' : 'mt-0 h-0 overflow-hidden opacity-0'
          } transition-all duration-300 ease-in-out`}
        >
          <ul className='flex flex-col items-center gap-4'>
            <li>
              <Link
                to='/hackathons'
                className={`text-sm font-normal font-poppins hover:text-white transition-all duration-200 ease-in-out ${
                  isActive('/hackathons') ? 'text-white' : 'text-white/70'
                }`}
              >
                Hackathons
              </Link>
            </li>
            <li>
              <Link
                to='/publish-hackathon'
                className={`text-sm font-normal font-poppins hover:text-white transition-all duration-200 ease-in-out ${
                  isActive('/publish-hackathon') ? 'text-white' : 'text-white/70'
                }`}
              >
                Publish Hackathon
              </Link>
            </li>
            <li>
              <Link
                to='/about'
                className={`text-sm font-normal font-poppins hover:text-white transition-all duration-200 ease-in-out ${
                  isActive('/about') ? 'text-white' : 'text-white/70'
                }`}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to='/pricing'
                className={`text-sm font-normal font-poppins hover:text-white transition-all duration-200 ease-in-out ${
                  isActive('/pricing') ? 'text-white' : 'text-white/70'
                }`}
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                to='/support'
                className={`text-sm font-normal font-poppins hover:text-white transition-all duration-200 ease-in-out ${
                  isActive('/support') ? 'text-white' : 'text-white/70'
                }`}
              >
                Support
              </Link>
            </li>
          </ul>
          <Button className='!bg-white flex md:hidden mt-3 !w-full'>
            Download App
          </Button>
        </nav>
      </header>
    </div>
  );
};

export default Header;
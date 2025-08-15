import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  CalendarIcon, 
  TagIcon,
  ChartBarIcon, 
  CogIcon, 
  QuestionMarkCircleIcon,
  InboxIcon
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const router = useRouter();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon },
    { name: 'Bookings', href: '/bookings', icon: CalendarIcon },
    { name: 'Services', href: '/services', icon: TagIcon },
    { name: 'Orders', href: '/orders', icon: InboxIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
    { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-grow flex-col overflow-y-auto bg-white border-r border-gray-200">
        <div className="flex flex-shrink-0 items-center px-4 h-16">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-lg font-bold text-primary-600">PetPro Vendor</span>
          </Link>
        </div>
        <div className="mt-5 flex flex-grow flex-col">
          <nav className="flex-1 space-y-1 px-2 pb-4">
            {navigation.map((item) => {
              const isActive = router.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <div className="w-full">
            <div className="text-sm font-medium text-gray-700">Vendor Status</div>
            <div className="mt-1 flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-2"></span>
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

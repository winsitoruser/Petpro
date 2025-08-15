import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, ShoppingCartIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  simple?: boolean;
}

const Header: React.FC<HeaderProps> = ({ simple = false }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Replace with actual auth state

  const navigation = [
    { name: 'Home', href: '/', current: true },
    { name: 'Shop', href: '/shop', current: false },
    { name: 'Services', href: '/services', current: false },
    { name: 'About', href: '/about', current: false },
    { name: 'Contact', href: '/contact', current: false },
  ];

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="flex items-center">
                    <span className="text-xl font-bold text-primary-600">PetPro</span>
                  </Link>
                </div>
                {!simple && (
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                          item.current
                            ? 'border-primary-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                <Link href="/cart" className="relative p-1 rounded-full text-gray-600 hover:text-gray-800">
                  <ShoppingCartIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary-600 rounded-full">3</span>
                </Link>
                
                {isLoggedIn ? (
                  <Link href="/account" className="p-1 rounded-full text-gray-600 hover:text-gray-800">
                    <UserCircleIcon className="h-6 w-6" />
                  </Link>
                ) : (
                  <Link href="/auth/login" className="btn-primary text-sm">
                    Sign In
                  </Link>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                    item.current
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                {isLoggedIn ? (
                  <>
                    <div className="flex-shrink-0">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">John Smith</div>
                      <div className="text-sm font-medium text-gray-500">john@example.com</div>
                    </div>
                  </>
                ) : (
                  <Link href="/auth/login" className="btn-primary text-sm w-full text-center">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Header;

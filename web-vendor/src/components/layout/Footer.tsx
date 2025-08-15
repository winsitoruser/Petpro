import React from 'react';
import Link from 'next/link';

interface FooterProps {
  simple?: boolean;
}

const Footer: React.FC<FooterProps> = ({ simple = false }) => {
  const currentYear = new Date().getFullYear();

  if (simple) {
    return (
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {currentYear} PetPro. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-gray-600 hover:text-gray-900">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">For Vendors</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/vendor-signup" className="text-sm text-gray-600 hover:text-gray-900">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link href="/vendor-resources" className="text-sm text-gray-600 hover:text-gray-900">
                  Vendor Resources
                </Link>
              </li>
              <li>
                <Link href="/vendor-success" className="text-sm text-gray-600 hover:text-gray-900">
                  Success Stories
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-600 hover:text-gray-900">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Subscribe to our newsletter</h3>
            <p className="mt-4 text-sm text-gray-600">Get the latest news and updates from PetPro.</p>
            <form className="mt-4">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="min-w-0 flex-1 appearance-none rounded-md border border-gray-300 bg-white py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="ml-3 inline-flex flex-shrink-0 items-center justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-10 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500">&copy; {currentYear} PetPro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

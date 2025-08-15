import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Head>
        <title>PetPro | Your Pet&apos;s Health Partner</title>
        <meta name="description" content="PetPro - Quality pet care services and products" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Quality Pet Healthcare at Your Fingertips</h1>
              <p className="text-xl mb-8">Schedule veterinary appointments, shop for pet products, and access pet care resources all in one place.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/services" className="btn-success px-8 py-3 text-center">
                  Book an Appointment
                </Link>
                <Link href="/shop" className="bg-white text-primary-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg shadow-sm transition-colors text-center">
                  Shop Now
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative h-96 w-full">
                <div className="absolute inset-0 bg-white rounded-lg overflow-hidden">
                  {/* Replace with actual image */}
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-500">Hero Image</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
            <p className="mt-4 text-xl text-gray-600">Comprehensive care for your furry family members</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Veterinary Checkups',
                description: 'Regular health examinations to keep your pet in top condition.',
                icon: '🩺',
              },
              {
                title: 'Grooming Services',
                description: 'Professional grooming to keep your pet looking and feeling great.',
                icon: '✂️',
              },
              {
                title: 'Training Programs',
                description: 'Behavior training for a well-mannered and happy pet.',
                icon: '🦮',
              },
              {
                title: 'Dental Care',
                description: 'Complete dental services to maintain your pet\'s oral health.',
                icon: '🦷',
              },
              {
                title: 'Vaccination',
                description: 'Essential vaccines to protect your pet from common diseases.',
                icon: '💉',
              },
              {
                title: 'Pet Boarding',
                description: 'Safe and comfortable accommodation when you\'re away.',
                icon: '🏠',
              },
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <Link href="/services" className="text-primary-600 hover:text-primary-800 font-medium">
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="mt-4 text-xl text-gray-600">Quality products for your beloved pets</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((product) => (
              <div key={product} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-48 bg-gray-200">
                  {/* Replace with actual product image */}
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500">Product Image</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">Premium Pet Food</h3>
                  <p className="text-gray-600 text-sm mb-2">High-quality nutrition for your pet</p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-600 font-bold">$24.99</span>
                    <button className="btn-primary text-sm">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/shop" className="btn-primary px-8 py-2.5">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
            <p className="mt-4 text-xl text-gray-600">Read testimonials from pet parents like you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                pet: 'Max, Golden Retriever',
                quote: 'The veterinary care at PetPro is exceptional. Dr. Reynolds has been treating my dog Max for years, and I wouldn\'t trust anyone else with his care!',
              },
              {
                name: 'Michael Chen',
                pet: 'Luna, Siamese Cat',
                quote: 'The grooming services are amazing! Luna looks beautiful after every visit, and the staff is so gentle with her. Highly recommend!',
              },
              {
                name: 'Emily Rodriguez',
                pet: 'Bella, French Bulldog',
                quote: 'The convenience of ordering Bella\'s special food through PetPro has been a lifesaver. Fast delivery and great prices!',
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-300 mr-4">
                    {/* Replace with actual avatar */}
                  </div>
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.pet}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the PetPro Family?</h2>
          <p className="text-xl mb-6">Sign up today and get 10% off your first service booking!</p>
          <Link href="/auth/register" className="bg-white text-primary-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg shadow-lg transition-colors inline-block">
            Sign Up Now
          </Link>
        </div>
      </section>
    </>
  );
}

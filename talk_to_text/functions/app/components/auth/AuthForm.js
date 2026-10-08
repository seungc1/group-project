'use client';

import Link from 'next/link';

export default function AuthForm({ 
  title, 
  onSubmit, 
  error, 
  children,
  linkText,
  linkHref,
  buttonText 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {children}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {buttonText}
            </button>
          </div>

          <div className="text-center">
            <Link href={linkHref} className="text-sm text-indigo-600 hover:text-indigo-500">
              {linkText}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 
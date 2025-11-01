export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
          <div className="mt-6">
            <a
              href="/"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

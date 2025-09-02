export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Navbar */}
      <header className="bg-gray-900 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <h1 className="text-2xl font-bold">NovaInvest</h1>

          {/* Links */}
          <nav>
            <ul className="flex space-x-6">
              <li><a href="/" className="hover:underline">Home</a></li>
              <li><a href="/plans" className="hover:underline">Plans</a></li>
              <li><a href="/dashboard" className="hover:underline">Dashboard</a></li>
              <li><a href="/login" className="hover:underline">Login</a></li>
              <li><a href="/signup" className="hover:underline">Sign Up</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-6">
        <h2 className="text-4xl font-bold mb-4">Welcome to NovaInvest</h2>
        <p className="text-lg text-gray-600 mb-6">
          Smart investment management made simple and accessible for everyone.
        </p>
        <div className="space-x-4">
          <a
            href="/plans"
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Plans
          </a>
          <a
            href="/signup"
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
          >
            Get Started
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-4">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} NovaInvest. All rights reserved.</p>
      </footer>
    </div>
  );
}
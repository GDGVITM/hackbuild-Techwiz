export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Freelance Marketplace for Students
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Connect students with businesses for freelance opportunities
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Login
            </a>
            <a href="/register" className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition">
              Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
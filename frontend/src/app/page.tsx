export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          WhatsApp Chatbot Platform
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Multi-tenant chatbot platform for government and enterprises
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </a>
          <a
            href="/superadmin-login"
            className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            SuperAdmin Login
          </a>
        </div>
      </div>
    </div>
  )
}

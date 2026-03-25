import Navbar from "../components/Navbar";

function AdminSubscriptions() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Subscriptions
        </h1>
        <p className="text-slate-600 mb-8">
          View active and expired subscriptions.
        </p>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-slate-600">
            Subscription data will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminSubscriptions;

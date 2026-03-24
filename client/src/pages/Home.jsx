import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* your navbar */}

      <section className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
        <h1 className="text-5xl font-bold mb-6 text-slate-900">
          Play. Win. Give Back.
        </h1>

        <p className="text-lg text-slate-600 max-w-xl mb-6">
          Subscribe, enter your scores, and participate in monthly draws
          while supporting meaningful charities.
        </p>

        <button
          onClick={handleGetStarted}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700"
        >
          Get Started
        </button>
      </section>
    </div>
  );
}

export default Home;
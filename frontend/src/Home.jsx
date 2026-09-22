import { Link } from "react-router-dom";
import { Activity, ShieldCheck, History, FileText, Sparkles, Upload, UserPlus, LineChart } from "lucide-react";

export default function Home() {
  return (
    <div
      className="relative bg-gradient-to-br from-indigo-50 via-white to-emerald-50"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
        backgroundSize: "28px 28px",
      }}
    >
      <Hero />
      <FeatureGrid />
      <BenefitSection />
      <GetStartedSection />
    </div>
  );
}

/** Reusable decorative blur, positioned relative to the full page width —
 * not the narrower centered content column — so it actually reaches the
 * screen edges on wide monitors instead of leaving flat empty margins. */
function Blob({ className }) {
  return <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />;
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Blob className="-top-32 -right-32 w-[28rem] h-[28rem] bg-indigo-200/50" />
      <Blob className="top-20 -left-32 w-80 h-80 bg-emerald-200/50" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-100 px-3 py-1.5 rounded-full">
            <Sparkles size={13} />
            AI-powered health record
          </span>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-5 leading-tight">
            Your health record,
            <br />
            <span className="text-teal-700">finally understandable.</span>
          </h1>

          <p className="mt-5 text-gray-500 text-base max-w-md">
            Upload a lab report and CONTINUUM reads it, flags what's outside your normal range, and
            explains what that means in plain language — all in one private, patient-owned record.
          </p>

          <div className="flex gap-3 mt-7">
            <Link
              to="/login"
              className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-700 hover:opacity-90 transition"
            >
              Get started
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-3 rounded-lg font-medium text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition"
            >
              See how it works
            </a>
          </div>
        </div>

        <HeroMockup />
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      <div className="absolute -top-4 -right-4 bg-white shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-medium text-gray-600 border border-gray-100 z-10">
        <ShieldCheck size={14} className="text-emerald-600" />
        Private by design
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 rotate-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
        </div>

        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 mb-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Threshold
          </div>
          <p className="text-sm text-gray-700">
            Hemoglobin is below the standard reference range. Not a diagnosis — discuss with a doctor.
          </p>
        </div>

        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Trend
          </div>
          <p className="text-sm text-gray-700">
            RDW has narrowed since your last report, moving closer to a typical range.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureGrid() {
  const features = [
    { icon: <Activity size={18} />, title: "Automatic extraction", body: "Upload a PDF or photo — values are pulled out and organized." },
    { icon: <ShieldCheck size={18} />, title: "Plain-language insights", body: "Out-of-range results explained without medical jargon." },
    { icon: <History size={18} />, title: "Full history, per report", body: "Every upload kept separate and easy to revisit." },
    { icon: <FileText size={18} />, title: "One private record", body: "Nothing shared unless you choose to share it." },
  ];

  return (
    <section className="relative">
      <Blob className="top-10 right-0 w-72 h-72 bg-teal-200/40 translate-x-1/3" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="max-w-xl mb-10">
          <h2 className="text-2xl font-bold text-gray-900">How CONTINUUM works</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Four things it does, without asking you to become your own lab technician.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitSection() {
  return (
    <section id="how-it-works" className="relative">
      <Blob className="-bottom-10 -left-32 w-80 h-80 bg-indigo-200/40" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="bg-teal-700 text-white rounded-2xl p-8">
            <h3 className="text-2xl font-bold">Every report, one timeline.</h3>
            <p className="mt-3 text-teal-50 text-sm leading-relaxed">
              Lab results usually end up scattered across PDFs, portals, and photos on your phone.
              CONTINUUM pulls every value into one place, so you can see how a number has moved over
              time instead of comparing printouts by hand.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              hemoglobin
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">8 Jun 2026</td>
                  <td className="py-2 text-red-600 font-medium text-right">11.1 g/dL</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-500">2 Dec 2026</td>
                  <td className="py-2 text-gray-800 text-right">12.5 g/dL</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function GetStartedSection() {
  const steps = [
    { icon: <UserPlus size={16} />, text: "Create a free account" },
    { icon: <Upload size={16} />, text: "Upload a lab report" },
    { icon: <LineChart size={16} />, text: "See your insights instantly" },
  ];

  return (
    <section className="relative">
      <Blob className="bottom-0 right-1/4 w-96 h-96 bg-emerald-200/40" />

      <div className="relative max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Get started in three steps</h2>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {steps.map((s, i) => (
            <div key={s.text} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="w-8 h-8 mx-auto rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-semibold mb-3">
                {i + 1}
              </div>
              <p className="text-sm text-gray-600 flex items-center justify-center gap-1.5">
                {s.icon}
                {s.text}
              </p>
            </div>
          ))}
        </div>

        <Link
          to="/login"
          className="inline-block px-7 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-700 hover:opacity-90 transition"
        >
          Get started
        </Link>
      </div>
    </section>
  );
}
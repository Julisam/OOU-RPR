import Header from "../components/Header";
import Footer from "../components/Footer";
import UnderDevelopment from "../components/UnderDevelopment";

function ProductivityMetrics() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <UnderDevelopment
        title="Productivity Metrics"
        subtitle="Metrics and analytics are being assembled."
      />
      <Footer />
    </div>
  );
}

export default ProductivityMetrics;

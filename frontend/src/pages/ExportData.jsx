import Header from "../components/Header";
import Footer from "../components/Footer";
import UnderDevelopment from "../components/UnderDevelopment";

function ExportData() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <UnderDevelopment
        title="Export Data"
        subtitle="Export options are being finalized."
      />
      <Footer />
    </div>
  );
}

export default ExportData;

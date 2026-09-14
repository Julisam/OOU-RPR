const currentYear = new Date().getFullYear();

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-center text-xs text-slate-400 sm:text-left">
            &copy; {currentYear} Olabisi Onabanjo University. All rights reserved.
          </p>
          <a
            href="https://oouagoiwoye.edu.ng"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            oouagoiwoye.edu.ng ↗
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

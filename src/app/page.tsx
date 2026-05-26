export default function Home() {
  return (
    <main style={{ fontFamily: "var(--font-body)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b-4 border-lime-500 sticky top-0 z-10">
        <span style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-black text-lime-700 tracking-tight uppercase">
          Reportly
        </span>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" className="bg-lime-600 text-white px-5 py-2 font-bold uppercase tracking-wide text-sm hover:bg-lime-700 transition">
            📅 Réserver un créneau →
          </a>
          <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20Reportly%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer" className="bg-lime-600 text-white px-5 py-2 font-bold uppercase tracking-wide text-sm hover:bg-lime-700 transition" style={{ background: "#25d366", borderColor: "#25d366" }}>
            💬 WhatsApp →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-block bg-lime-200 text-lime-800 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest mb-6">
          Reporting automatisé
        </div>
        <h1 style={{ fontFamily: "var(--font-display)" }} className="text-6xl md:text-7xl font-black text-slate-900 leading-none tracking-tight mb-6 uppercase">
          Vos KPIs.<br />
          <span className="text-lime-600">Chaque lundi.</span><br />
          Automatiquement.
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
          Reportly génère et livre vos rapports business personnalisés — sans manipulation manuelle, sans oublier une seule semaine.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" className="inline-block bg-lime-600 text-white px-10 py-4 font-black text-lg uppercase tracking-wider hover:bg-lime-700 transition shadow-lg">
            📅 Réserver un créneau →
          </a>
          <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20Reportly%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer" className="inline-block bg-lime-600 text-white px-10 py-4 font-black text-lg uppercase tracking-wider hover:bg-lime-700 transition shadow-lg" style={{ background: "#25d366", borderColor: "#25d366" }}>
            💬 WhatsApp →
          </a>
        </div>
      </section>

      {/* Email Preview Mockup */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <div className="bg-white rounded-lg shadow-2xl border border-lime-200 overflow-hidden">
          {/* Email header */}
          <div className="bg-lime-600 px-6 py-4">
            <div className="text-white text-xs mb-1 opacity-75">De: reports@reportly.app · Lundi 08:00</div>
            <div style={{ fontFamily: "var(--font-display)" }} className="text-white text-xl font-bold uppercase tracking-wide">
              Rapport hebdo — Semaine 21
            </div>
          </div>
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-px bg-lime-100 border-b border-lime-100">
            {[
              { label: "Chiffre d'affaires", value: "142K€", delta: "+8%", up: true },
              { label: "Nouveaux clients", value: "34", delta: "+3", up: true },
              { label: "Taux de churn", value: "1.2%", delta: "-0.3%", up: false },
            ].map(({ label, value, delta, up }) => (
              <div key={label} className="bg-white px-4 py-4 text-center">
                <div style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-black text-slate-900">{value}</div>
                <div className={`text-xs font-bold ${up ? "text-lime-600" : "text-red-500"}`}>{up ? "▲" : "▼"} {delta}</div>
                <div className="text-xs text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
          {/* Insight text */}
          <div className="px-6 py-5 space-y-3">
            <p className="text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-lime-700">Points clés de la semaine :</span> Le CA progresse pour la 4e semaine consécutive (+8%). La région Sud a surperformé de 23%. Le segment PME représente désormais 61% des nouvelles acquisitions.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-lime-50 border border-lime-200 text-lime-700 text-xs px-3 py-1 rounded font-semibold">PDF joint</span>
              <span className="bg-lime-50 border border-lime-200 text-lime-700 text-xs px-3 py-1 rounded font-semibold">Rapport Slack envoyé</span>
              <span className="bg-lime-50 border border-lime-200 text-lime-700 text-xs px-3 py-1 rounded font-semibold">Dashboard mis à jour</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 border-t-4 border-lime-500">
        <div className="max-w-5xl mx-auto px-6">
          <h2 style={{ fontFamily: "var(--font-display)" }} className="text-4xl font-black text-slate-900 text-center uppercase tracking-tight mb-12">
            Ce que Reportly fait pour vous
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Templates intelligents", desc: "Choisissez parmi 30+ templates ou créez le vôtre. Reportly adapte le format à votre audience — dirigeants, équipes ou investisseurs." },
              { num: "02", title: "Multi-canal natif", desc: "Email, Slack, PDF, Notion, Google Drive — votre rapport arrive là où votre équipe travaille, selon la cadence que vous choisissez." },
              { num: "03", title: "Alertes sur seuils", desc: "Définissez des seuils critiques sur vos métriques. Reportly envoie une alerte immédiate si un KPI sort de la zone verte." },
            ].map(({ num, title, desc }) => (
              <div key={num} className="border-l-4 border-lime-500 pl-5">
                <div style={{ fontFamily: "var(--font-display)" }} className="text-5xl font-black text-lime-200 leading-none mb-2">{num}</div>
                <h3 style={{ fontFamily: "var(--font-display)" }} className="text-xl font-bold text-slate-900 uppercase mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-lime-600 py-14 text-center px-6">
        <h2 style={{ fontFamily: "var(--font-display)" }} className="text-4xl font-black text-white uppercase tracking-tight mb-3">
          Le prochain rapport s&rsquo;écrit tout seul.
        </h2>
        <p className="text-lime-100 mb-8">Setup en 15 minutes. Aucune carte bancaire requise.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-lime-700 px-10 py-4 font-black text-lg uppercase tracking-wider hover:bg-lime-50 transition">
            📅 Réserver un créneau →
          </a>
          <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20Reportly%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-lime-700 px-10 py-4 font-black text-lg uppercase tracking-wider hover:bg-lime-50 transition" style={{ background: "#25d366", borderColor: "#25d366" }}>
            💬 WhatsApp →
          </a>
        </div>
      </section>

      <footer className="text-center py-5 text-slate-400 text-sm bg-white border-t border-lime-100">
        &copy; 2025 Reportly — Un produit Wikolabs
      </footer>
    </main>
  );
}

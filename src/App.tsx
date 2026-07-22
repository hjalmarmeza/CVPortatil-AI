import { useState } from 'react';
import { Briefcase, FileText, Settings, Loader2, Download, Upload } from 'lucide-react';
import { defaultBaseCV } from './data/baseCV';
import type { BaseCV } from './data/baseCV';
import { generateTailoredCV } from './services/ai';
// @ts-ignore
import html2pdf from 'html2pdf.js';

function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'base'>('generator');
  const [baseCV, setBaseCV] = useState<BaseCV>(defaultBaseCV);
  
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tailoredData, setTailoredData] = useState<{tailoredCV?: Partial<BaseCV>, coverLetter?: string} | null>(null);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateTailoredCV(jobDescription, baseCV);
      setTailoredData(result);
    } catch (error) {
      alert("Error al generar el CV. Revisa la consola para más detalles.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('cv-pdf-content');
    if (!element) return;
    
    // Mostramos el elemento oculto para renderizar el PDF
    element.style.display = 'block';

    const opt = {
      margin: 10,
      filename: `CV_${baseCV.name.replace(/\s+/g, '_')}_Tailored.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      // Ocultamos de nuevo
      element.style.display = 'none';
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-amber-500/30">
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-lg shadow-black/50">
              <img src="/icon.jpg" alt="Logo" className="w-6 h-6 rounded-md object-cover" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">CV Portátil <span className="text-amber-500 font-light">AI</span></h1>
          </div>
          
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 shadow-inner">
            <button 
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${activeTab === 'generator' ? 'bg-amber-500/10 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              <Briefcase size={16} />
              Generador
            </button>
            <button 
              onClick={() => setActiveTab('base')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${activeTab === 'base' ? 'bg-amber-500/10 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              <Settings size={16} />
              Mi CV Base
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === 'generator' ? (
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left Column: Input */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Analizador de Ofertas</h2>
                <p className="text-slate-400 text-sm">Pega el texto de la oferta de trabajo y nuestra IA adaptará tu CV Base para hacer un match perfecto.</p>
              </div>
              
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-1 shadow-lg shadow-black/20">
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Pega aquí la descripción del puesto..."
                  className="w-full h-80 bg-slate-900/50 text-slate-200 placeholder-slate-500 rounded-xl p-5 border border-transparent focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/30 focus:outline-none resize-none transition-all"
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !jobDescription.trim()}
                className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 transition-all shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isGenerating ? (
                  <><Loader2 className="animate-spin" size={20} /> Analizando y Generando...</>
                ) : (
                  <><FileText size={20} /> Generar CV Adaptado</>
                )}
              </button>
            </div>

            {/* Right Column: Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col h-[700px]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Vista Previa
                </h3>
                {tailoredData && (
                  <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors">
                    <Download size={14} /> Descargar PDF
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {tailoredData ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <section>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Carta de Presentación</h4>
                      <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {tailoredData.coverLetter}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Resumen Adaptado</h4>
                      <p className="text-sm text-slate-300 leading-relaxed pl-4 border-l-2 border-amber-500/50">
                        {tailoredData.tailoredCV?.summary}
                      </p>
                    </section>
                    
                    <section>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Experiencia Destacada</h4>
                      <div className="space-y-4">
                        {tailoredData.tailoredCV?.experience?.map((exp, idx) => (
                          <div key={idx} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                            <h5 className="font-semibold text-white text-sm">{exp.title}</h5>
                            <p className="text-xs text-slate-400 mb-2">{exp.company} | {exp.period}</p>
                            <ul className="space-y-1">
                              {exp.description?.map((desc, i) => (
                                <li key={i} className="text-xs text-slate-300 flex gap-2"><span className="text-amber-500">•</span> {desc}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                      <FileText size={24} className="text-slate-600" />
                    </div>
                    <p className="text-sm">El resultado aparecerá aquí</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Tu CV Base</h2>
              <p className="text-slate-400 text-sm">Estos datos son la fuente de la verdad para la IA. Mantenlos actualizados para mejores resultados.</p>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Nombre Completo</label>
                  <input type="text" value={baseCV.name} onChange={(e) => setBaseCV({...baseCV, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase">Título Profesional</label>
                  <input type="text" value={baseCV.title} onChange={(e) => setBaseCV({...baseCV, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase">Resumen Profesional</label>
                <textarea value={baseCV.summary} onChange={(e) => setBaseCV({...baseCV, summary: e.target.value})} className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors resize-none" />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-sm">
                  <Upload size={16} /> Guardar Cambios Locales
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Renderizado Oculto para el PDF */}
      <div id="cv-pdf-content" style={{ display: 'none', backgroundColor: 'white', color: 'black', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #f59e0b', paddingBottom: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24pt', margin: 0, color: '#0f172a' }}>{baseCV.name}</h1>
            <p style={{ fontSize: '14pt', margin: '5px 0 0', color: '#475569' }}>{baseCV.title}</p>
          </div>
          <div style={{ width: '40mm', height: '40mm', borderRadius: '50%', overflow: 'hidden', border: '3px solid #f59e0b' }}>
            <img src="/profile.png" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #cbd5e1', paddingBottom: '5px', color: '#0f172a' }}>Perfil Ejecutivo Adaptado</h2>
          <p style={{ fontSize: '10pt', lineHeight: '1.5', color: '#334155' }}>
            {tailoredData?.tailoredCV?.summary || baseCV.summary}
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #cbd5e1', paddingBottom: '5px', color: '#0f172a' }}>Experiencia Destacada</h2>
          {(tailoredData?.tailoredCV?.experience || baseCV.experience).map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '11pt', margin: '0 0 2px', color: '#0f172a' }}>{exp.title}</h3>
                <span style={{ fontSize: '9pt', color: '#d97706', fontWeight: 'bold' }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: '9.5pt', margin: '0 0 5px', color: '#475569', fontWeight: 'bold' }}>{exp.company} | {exp.location}</p>
              <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '9.5pt', color: '#334155', lineHeight: '1.4' }}>
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #cbd5e1', paddingBottom: '5px', color: '#0f172a' }}>Habilidades Clave</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
             {(tailoredData?.tailoredCV?.skills || baseCV.skills).map((skill, idx) => (
               <span key={idx} style={{ fontSize: '9pt', padding: '4px 8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', color: '#0f172a' }}>
                 {skill}
               </span>
             ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;

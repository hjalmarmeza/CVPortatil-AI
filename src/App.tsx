import { useState } from 'react';
import { Briefcase, FileText, Settings, Loader2, Download, Upload, Sparkles } from 'lucide-react';
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
    
    element.style.display = 'block';

    const opt = {
      margin: 10,
      filename: `CV_${baseCV.name.replace(/\s+/g, '_')}_Tailored.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      element.style.display = 'none';
    });
  };

  const handleDownloadCoverLetterPDF = () => {
    const element = document.getElementById('cover-letter-pdf-content');
    if (!element) return;
    
    element.style.display = 'block';

    const opt = {
      margin: 15,
      filename: `Carta_Presentacion_${baseCV.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      element.style.display = 'none';
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-amber-500/30">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-inner overflow-hidden">
              <img src="/icon.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                CV Portátil <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-sm font-semibold border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">AI</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Generador Ejecutivo Inteligente</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 bg-[#0f172a] p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
            <button 
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'generator' ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
              <Briefcase size={16} />
              Analizador
            </button>
            <button 
              onClick={() => setActiveTab('base')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'base' ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
              <Settings size={16} />
              Datos Base
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {activeTab === 'generator' ? (
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Left Column: Input (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={24} />
                  Adaptación Inteligente
                </h2>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Pega el requerimiento del puesto. Nuestra IA analizará las palabras clave, adaptará tu experiencia y redactará una carta persuasiva.
                </p>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-b from-amber-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
                <div className="relative bg-[#0f172a] border border-slate-800 rounded-2xl p-1 shadow-2xl">
                  <div className="flex items-center px-4 py-3 border-b border-slate-800/50 bg-slate-900/50 rounded-t-xl">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    </div>
                    <span className="ml-4 text-xs font-semibold text-slate-500 tracking-wider uppercase">Job Description</span>
                  </div>
                  <textarea 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Ej: Buscamos un Gerente de Operaciones con 5 años de experiencia en el sector tecnológico..."
                    className="w-full h-80 bg-transparent text-slate-200 placeholder-slate-600 p-5 focus:outline-none resize-none text-sm leading-relaxed custom-scrollbar"
                  />
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !jobDescription.trim()}
                className="w-full group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-slate-950 bg-amber-500 rounded-xl overflow-hidden transition-all duration-300 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-[0_10px_40px_-10px_rgba(245,158,11,0.5)]"
              >
                {isGenerating ? (
                  <><Loader2 className="animate-spin" size={20} /> Procesando con IA...</>
                ) : (
                  <><FileText size={20} className="transition-transform group-hover:scale-110" /> Generar Perfil Adaptado</>
                )}
              </button>
            </div>

            {/* Right Column: Preview (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col h-[800px] relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>

                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                      <div className="relative flex h-3 w-3">
                        {tailoredData ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </>
                        ) : (
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-600"></span>
                        )}
                      </div>
                      Resultado Final
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Vista previa del documento generado</p>
                  </div>
                  
                  {tailoredData && (
                    <div className="flex items-center gap-3">
                      <button onClick={handleDownloadCoverLetterPDF} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        <Download size={16} className="text-amber-500" /> PDF Carta
                      </button>
                      <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        <Download size={16} className="text-amber-500" /> PDF CV
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar relative z-10">
                  {tailoredData ? (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      {/* Cover Letter */}
                      <section>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                            <FileText size={16} className="text-amber-500" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Carta de Presentación</h4>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                          {tailoredData.coverLetter}
                        </div>
                      </section>

                      {/* Summary */}
                      <section>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                            <Briefcase size={16} className="text-amber-500" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Resumen Ejecutivo</h4>
                        </div>
                        <div className="pl-5 border-l-2 border-amber-500/50 py-1">
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {tailoredData.tailoredCV?.summary}
                          </p>
                        </div>
                      </section>
                      
                      {/* Experience */}
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                            <Settings size={16} className="text-amber-500" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Experiencia Match</h4>
                        </div>
                        <div className="space-y-5">
                          {tailoredData.tailoredCV?.experience?.map((exp, idx) => (
                            <div key={idx} className="bg-slate-800/20 rounded-xl p-5 border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-slate-100 text-base">{exp.title}</h5>
                                <span className="text-xs font-mono text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 whitespace-nowrap">
                                  {exp.period}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-400 mb-4">{exp.company} <span className="mx-2 text-slate-600">|</span> {exp.location}</p>
                              <ul className="space-y-2">
                                {exp.description?.map((desc, i) => (
                                  <li key={i} className="text-sm text-slate-300 flex items-start gap-3 leading-relaxed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div> 
                                    {desc}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </section>
                      
                      {/* Technical & Operational Domains */}
                      <section className="bg-[#0f172a] rounded-3xl p-8 border border-slate-800 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                            <Settings size={16} className="text-amber-500" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Dominios Técnicos y Operativos</h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          {(tailoredData?.tailoredCV?.domainAreas || baseCV.domainAreas).map((domain, idx) => (
                            <div key={idx} className="bg-slate-800/20 rounded-xl p-4 border border-slate-700/30">
                              <h5 className="font-bold text-slate-100 text-sm mb-2 text-amber-500">{domain.title}</h5>
                              <p className="text-xs text-slate-300 leading-relaxed">{domain.skills.join(', ')}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Certifications */}
                      <section className="bg-[#0f172a] rounded-3xl p-8 border border-slate-800 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                            <FileText size={16} className="text-amber-500" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Certificaciones Destacadas</h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          {(tailoredData?.tailoredCV?.certifications || baseCV.certifications.slice(0, 8)).map((cert, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div> 
                              <span className="text-xs text-slate-300 leading-relaxed">{cert}</span>
                            </div>
                          ))}
                        </div>
                        {(!tailoredData?.tailoredCV?.certifications && baseCV.certifications.length > 8) && (
                          <p className="text-xs text-slate-500 mt-4 text-center italic">
                            * Y {baseCV.certifications.length - 8} certificaciones adicionales en el perfil base.
                          </p>
                        )}
                      </section>

                      {/* Education and Languages */}
                      <div className="grid md:grid-cols-2 gap-8">
                        <section className="bg-[#0f172a] rounded-3xl p-8 border border-slate-800 shadow-xl">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                              <Settings size={16} className="text-amber-500" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Educación</h4>
                          </div>
                          <div className="space-y-4">
                            {baseCV.education.map((edu, idx) => (
                              <div key={idx}>
                                <h5 className="font-bold text-slate-100 text-sm">{edu.degree}</h5>
                                <p className="text-xs text-slate-400 mt-1">{edu.institution} <span className="text-amber-500 ml-2">{edu.period}</span></p>
                              </div>
                            ))}
                          </div>
                        </section>
                        
                        <section className="bg-[#0f172a] rounded-3xl p-8 border border-slate-800 shadow-xl">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                              <Settings size={16} className="text-amber-500" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Idiomas</h4>
                          </div>
                          <div className="space-y-3">
                            {baseCV.languages.map((lang, idx) => (
                              <div key={idx} className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                                <span className="text-sm text-slate-200">{lang.language}</span>
                                <span className="text-xs text-amber-500 font-medium bg-amber-500/10 px-2 py-1 rounded">{lang.level}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>

                      {/* Portfolio */}
                      <section className="bg-[#0f172a] rounded-3xl p-8 border border-slate-800 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                            <Sparkles size={16} className="text-amber-500" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{tailoredData?.tailoredCV?.portfolioTitle || "Portafolio de Innovación Tecnológica"}</h4>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {(tailoredData?.tailoredCV?.portfolio || baseCV.portfolio.slice(0, 6)).map((item, idx) => (
                            <div key={idx} className="bg-slate-800/20 rounded-xl p-4 border border-slate-700/30">
                              <h5 className="font-bold text-slate-100 text-sm mb-2">{item.title}</h5>
                              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                            </div>
                          ))}
                        </div>
                        {(!tailoredData?.tailoredCV?.portfolio && baseCV.portfolio.length > 6) && (
                          <p className="text-xs text-slate-500 mt-4 text-center italic">
                            * Y {baseCV.portfolio.length - 6} proyectos adicionales en el portafolio completo.
                          </p>
                        )}
                      </section>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6">
                      <div className="w-24 h-24 rounded-3xl bg-slate-800/50 flex items-center justify-center border border-slate-700/50 shadow-inner">
                        <FileText size={40} className="text-slate-600" />
                      </div>
                      <div className="text-center">
                        <h4 className="text-lg font-medium text-slate-300">Esperando Análisis</h4>
                        <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">Ingresa una descripción de puesto y haz clic en generar para ver el resultado aquí.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Base CV Editor Tab */
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Tu Perfil Base</h2>
              <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
                Esta es la "fuente de la verdad". La inteligencia artificial utilizará estos datos como base para redactar tus cartas de presentación y adaptar tu CV a cada oferta.
              </p>
            </div>
            
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-10 shadow-2xl space-y-12">
              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">Información Principal</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Nombre Completo</label>
                    <input type="text" value={baseCV.name} onChange={(e) => setBaseCV({...baseCV, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Título Ejecutivo</label>
                    <input type="text" value={baseCV.title} onChange={(e) => setBaseCV({...baseCV, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Resumen Profesional Master</label>
                  <textarea value={baseCV.summary} onChange={(e) => setBaseCV({...baseCV, summary: e.target.value})} className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner resize-none leading-relaxed custom-scrollbar" />
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h3 className="text-lg font-bold text-slate-200">Experiencia Laboral</h3>
                  <button onClick={() => setBaseCV({...baseCV, experience: [...baseCV.experience, {title: '', company: '', period: '', location: '', description: ['']}]})} className="text-xs font-bold text-amber-500 hover:text-amber-400">
                    + Añadir Experiencia
                  </button>
                </div>
                <div className="space-y-6">
                  {baseCV.experience.map((exp, idx) => (
                    <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 relative group">
                      <button onClick={() => setBaseCV({...baseCV, experience: baseCV.experience.filter((_, i) => i !== idx)})} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        &times; Quitar
                      </button>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Cargo</label>
                          <input type="text" value={exp.title} onChange={(e) => { const newExp = [...baseCV.experience]; newExp[idx].title = e.target.value; setBaseCV({...baseCV, experience: newExp}); }} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Empresa</label>
                          <input type="text" value={exp.company} onChange={(e) => { const newExp = [...baseCV.experience]; newExp[idx].company = e.target.value; setBaseCV({...baseCV, experience: newExp}); }} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Periodo</label>
                          <input type="text" value={exp.period} onChange={(e) => { const newExp = [...baseCV.experience]; newExp[idx].period = e.target.value; setBaseCV({...baseCV, experience: newExp}); }} placeholder="Ej: 2018 - Presente" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Ubicación</label>
                          <input type="text" value={exp.location} onChange={(e) => { const newExp = [...baseCV.experience]; newExp[idx].location = e.target.value; setBaseCV({...baseCV, experience: newExp}); }} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Logros / Funciones (separados por nueva línea)</label>
                        <textarea value={exp.description.join('\n')} onChange={(e) => { const newExp = [...baseCV.experience]; newExp[idx].description = e.target.value.split('\n').filter(Boolean); setBaseCV({...baseCV, experience: newExp}); }} className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none custom-scrollbar" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education & Languages */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-lg font-bold text-slate-200">Educación</h3>
                  </div>
                  <div className="space-y-4">
                    {baseCV.education.map((edu, idx) => (
                      <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-2">
                        <input type="text" value={edu.degree} onChange={(e) => { const newEdu = [...baseCV.education]; newEdu[idx].degree = e.target.value; setBaseCV({...baseCV, education: newEdu}); }} placeholder="Título" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50" />
                        <div className="flex gap-2">
                          <input type="text" value={edu.institution} onChange={(e) => { const newEdu = [...baseCV.education]; newEdu[idx].institution = e.target.value; setBaseCV({...baseCV, education: newEdu}); }} placeholder="Institución" className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50" />
                          <input type="text" value={edu.period} onChange={(e) => { const newEdu = [...baseCV.education]; newEdu[idx].period = e.target.value; setBaseCV({...baseCV, education: newEdu}); }} placeholder="Periodo" className="w-32 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-lg font-bold text-slate-200">Idiomas</h3>
                  </div>
                  <div className="space-y-4">
                    {baseCV.languages.map((lang, idx) => (
                      <div key={idx} className="flex gap-4">
                        <input type="text" value={lang.language} onChange={(e) => { const newL = [...baseCV.languages]; newL[idx].language = e.target.value; setBaseCV({...baseCV, languages: newL}); }} placeholder="Idioma" className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50" />
                        <input type="text" value={lang.level} onChange={(e) => { const newL = [...baseCV.languages]; newL[idx].level = e.target.value; setBaseCV({...baseCV, languages: newL}); }} placeholder="Nivel" className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dominio y Portafolio */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">Dominios Técnicos</h3>
                  <textarea value={baseCV.domainAreas.map(d => `${d.title}: ${d.skills.join(', ')}`).join('\n\n')} readOnly className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-xs text-slate-400 focus:outline-none resize-none custom-scrollbar leading-relaxed" />
                  <p className="text-[10px] text-slate-500 mt-1">Representación de solo lectura en la UI (editar en baseCV.ts directamente).</p>
                </div>
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">Portafolio de Innovación</h3>
                  <textarea value={baseCV.portfolio.map(p => `${p.title} - ${p.description}`).join('\n\n')} readOnly className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-xs text-slate-400 focus:outline-none resize-none custom-scrollbar leading-relaxed" />
                </div>
              </div>

              {/* Arrays: Skills & Certs */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">Ecosistema Tech (Skills)</h3>
                  <textarea value={baseCV.skills.join('\n')} onChange={(e) => setBaseCV({...baseCV, skills: e.target.value.split('\n').filter(Boolean)})} placeholder="Una habilidad por línea..." className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none custom-scrollbar leading-relaxed" />
                </div>
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">Certificaciones</h3>
                  <textarea value={baseCV.certifications.join('\n')} onChange={(e) => setBaseCV({...baseCV, certifications: e.target.value.split('\n').filter(Boolean)})} placeholder="Una certificación por línea..." className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none custom-scrollbar leading-relaxed" />
                </div>
              </div>

              {/* Base Cover Letter */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">Carta de Presentación Base</h3>
                <textarea value={baseCV.baseCoverLetter} onChange={(e) => setBaseCV({...baseCV, baseCoverLetter: e.target.value})} className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none custom-scrollbar leading-relaxed" />
              </div>

              <div className="pt-8 border-t border-slate-800/50 flex justify-end">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-100 bg-slate-800 hover:bg-slate-700 transition-all border border-slate-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  <Upload size={18} className="text-amber-500" /> Guardar Perfil Local
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Renderizado Oculto para el PDF */}
      <div id="cv-pdf-content" style={{ display: 'none', backgroundColor: '#F4F1EB', color: '#1F1F1F', fontFamily: '"Arial", sans-serif', margin: 0, padding: 0, boxSizing: 'border-box' }}>
        
        {/* ROW 1: Name (Dark) / Contact (Light) */}
        <div style={{ display: 'flex', minHeight: '160px' }}>
          <div style={{ width: '40%', backgroundColor: '#1F1F1F', borderBottomRightRadius: '70px', padding: '30px 25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img src={baseCV.contact?.photoUrl} alt="Hjalmar Meza" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #F4F1EB', objectFit: 'cover' }} />
            <div>
              <h1 style={{ fontSize: '26pt', margin: 0, color: '#FFFFFF', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-0.5px' }}>{baseCV.name.split(' ')[0]}<br/>{baseCV.name.split(' ').slice(1).join(' ')}</h1>
            </div>
          </div>
          <div style={{ width: '60%', padding: '30px 25px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10.5pt', color: '#444', fontWeight: '600' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✉️ {baseCV.contact?.email}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📱 {baseCV.contact?.phone}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>📍 {baseCV.contact?.location}</span>
            </div>
          </div>
        </div>

        {/* ROW 2: Education (Light) / Summary (Dark) */}
        <div style={{ display: 'flex', marginTop: '15px' }}>
          <div style={{ width: '40%', padding: '15px 25px' }}>
            <h3 style={{ fontSize: '12pt', color: '#1F1F1F', fontWeight: '900', marginBottom: '12px' }}>Educación</h3>
            {baseCV.education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '9pt', margin: '0 0 2px', color: '#1F1F1F', fontWeight: '800' }}>{edu.degree}</p>
                <p style={{ fontSize: '8.5pt', margin: 0, color: '#444' }}>{edu.institution}</p>
              </div>
            ))}

            <h3 style={{ fontSize: '12pt', color: '#1F1F1F', fontWeight: '900', marginTop: '20px', marginBottom: '12px' }}>Idiomas</h3>
            {baseCV.languages.map((lang, idx) => (
              <div key={idx} style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '9pt', color: '#1F1F1F', fontWeight: '800' }}>{lang.language}</span>
                <span style={{ fontSize: '9pt', color: '#666' }}>{lang.level}</span>
              </div>
            ))}
          </div>

          <div style={{ width: '60%', backgroundColor: '#1F1F1F', borderTopLeftRadius: '70px', borderBottomLeftRadius: '70px', padding: '30px 30px 30px 40px', display: 'flex', alignItems: 'center' }}>
            <p style={{ fontSize: '10pt', lineHeight: '1.6', color: '#F4F1EB', fontWeight: '400' }}>
              {tailoredData?.tailoredCV?.summary || baseCV.summary}
            </p>
          </div>
        </div>

        {/* ROW 3: Experience (Full Width) */}
        <div style={{ padding: '20px 25px 10px', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: '14pt', color: '#1F1F1F', fontWeight: '900', marginBottom: '15px' }}>Experiencia Destacada</h3>
          {(tailoredData?.tailoredCV?.experience || baseCV.experience).map((exp, idx) => (
            <div key={idx} style={{ marginBottom: '15px', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '11pt', margin: 0, color: '#1F1F1F', fontWeight: '800' }}>{exp.title} en {exp.company}</h4>
                <span style={{ fontSize: '9pt', color: '#666', fontWeight: '600', fontStyle: 'italic' }}>{exp.period}</span>
              </div>
              <ul style={{ margin: '6px 0 0', paddingLeft: '18px', fontSize: '9.5pt', color: '#222', lineHeight: '1.5' }}>
                {exp.description.map((desc, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ROW 4: Portfolio (Full Width) */}
        <div style={{ padding: '10px 25px', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: '13pt', color: '#1F1F1F', fontWeight: '900', marginBottom: '12px' }}>{tailoredData?.tailoredCV?.portfolioTitle || "Proyectos Destacados"}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {(tailoredData?.tailoredCV?.portfolio || baseCV.portfolio.slice(0, 4)).map((item, idx) => (
              <div key={idx} style={{ padding: '10px', backgroundColor: '#EAE6DD', borderRadius: '8px', pageBreakInside: 'avoid' }}>
                <h4 style={{ fontSize: '9.5pt', margin: '0 0 4px', color: '#1F1F1F', fontWeight: '800' }}>{item.title}</h4>
                <p style={{ fontSize: '8.5pt', margin: 0, color: '#444', lineHeight: '1.4' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 5: Dominios & Certificaciones */}
        <div style={{ display: 'flex', padding: '15px 25px', gap: '25px', pageBreakInside: 'avoid' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '12pt', color: '#1F1F1F', fontWeight: '900', marginBottom: '10px' }}>Dominios Técnicos</h3>
            {(tailoredData?.tailoredCV?.domainAreas || baseCV.domainAreas).map((domain, idx) => (
              <div key={idx} style={{ marginBottom: '8px', pageBreakInside: 'avoid' }}>
                <h4 style={{ fontSize: '9.5pt', margin: '0 0 2px', color: '#1F1F1F', fontWeight: '800' }}>{domain.title}</h4>
                <p style={{ fontSize: '8.5pt', margin: 0, color: '#444', lineHeight: '1.4' }}>{domain.skills.join(', ')}</p>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '12pt', color: '#1F1F1F', fontWeight: '900', marginBottom: '10px' }}>Certificaciones</h3>
            <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '8.5pt', color: '#444', lineHeight: '1.4' }}>
              {(tailoredData?.tailoredCV?.certifications || baseCV.certifications.slice(0, 6)).map((cert, i) => (
                <li key={i} style={{ marginBottom: '3px', pageBreakInside: 'avoid' }}>{cert}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ROW 6: Footer (Skills on left / Contact on right dark block) */}
        <div style={{ display: 'flex', marginTop: '10px' }}>
          <div style={{ width: '60%', padding: '20px 25px' }}>
            <h3 style={{ fontSize: '12pt', color: '#1F1F1F', fontWeight: '900', marginBottom: '12px' }}>Habilidades Clave</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
               {(tailoredData?.tailoredCV?.skills || baseCV.skills).slice(0, 10).map((skill, idx) => (
                 <span key={idx} style={{ fontSize: '8.5pt', padding: '5px 12px', backgroundColor: '#1F1F1F', color: '#F4F1EB', borderRadius: '15px', fontWeight: '700' }}>
                   {skill}
                 </span>
               ))}
            </div>
          </div>
          <div style={{ width: '40%', backgroundColor: '#1F1F1F', borderTopLeftRadius: '70px', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
             <h3 style={{ fontSize: '13pt', margin: '0 0 8px', color: '#F4F1EB', fontWeight: '900' }}>Contacto</h3>
             <p style={{ fontSize: '9pt', margin: '0 0 4px', color: '#DDD' }}>{baseCV.contact?.linkedin}</p>
             <p style={{ fontSize: '9pt', margin: 0, color: '#DDD' }}>{baseCV.contact?.location}</p>
          </div>
        </div>

      </div>

      {/* Renderizado Oculto para PDF - CARTA DE PRESENTACION */}
      <div id="cover-letter-pdf-content" style={{ display: 'none', backgroundColor: '#FFFFFF', color: '#1F1F1F', fontFamily: '"Arial", sans-serif', margin: 0, padding: '40px', boxSizing: 'border-box' }}>
        <div style={{ borderBottom: '2px solid #EAE6DD', paddingBottom: '20px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '24pt', margin: '0 0 15px', color: '#1F1F1F', fontWeight: '900', letterSpacing: '-0.5px' }}>{baseCV.name}</h1>
          <div style={{ display: 'flex', gap: '20px', fontSize: '10pt', color: '#666' }}>
            <span>{baseCV.contact?.email}</span>
            <span>{baseCV.contact?.phone}</span>
            <span>{baseCV.contact?.location}</span>
          </div>
        </div>
        
        <h3 style={{ fontSize: '12pt', fontWeight: '800', marginBottom: '25px', color: '#1F1F1F' }}>CARTA DE PRESENTACIÓN</h3>
        
        <div style={{ fontSize: '11pt', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
          {tailoredData?.coverLetter}
        </div>
      </div>

    </div>
  );
}

export default App;

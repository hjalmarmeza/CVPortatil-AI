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
      margin: 0,
      filename: `CV_${baseCV.name.replace(/\s+/g, '_')}_Tailored.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
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
      margin: 0,
      filename: `Carta_Presentacion_${baseCV.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, windowWidth: 794 },
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
                  <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">Competencias</h3>
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
                  <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">Habilidades</h3>
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
      <div id="cv-pdf-content" style={{ display: 'none', backgroundColor: '#FFFFFF', color: '#333333', fontFamily: '"Arial", sans-serif', margin: 0, padding: 0, width: '794px', minHeight: '2244px', boxSizing: 'border-box' }}>
        <style>{`
          #cv-pdf-content, #cv-pdf-content * {
            box-sizing: border-box !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
          }
        `}</style>
        
        <table style={{ width: '794px', minHeight: '2244px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '516px' }} />
            <col style={{ width: '278px' }} />
          </colgroup>
          <tbody>
            <tr>
              {/* LEFT COLUMN (White) - 516px */}
              <td style={{ width: '516px', padding: 0, backgroundColor: '#FFFFFF', verticalAlign: 'top' }}>
                <div style={{ padding: '45px 35px 45px 35px', width: '100%', boxSizing: 'border-box' }}>
                  {/* Header / Name */}
                  <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '32pt', margin: '0 0 5px', color: '#333333', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', lineHeight: '1' }}>{baseCV.name}</h1>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 18px', fontSize: '9pt', color: '#666', fontWeight: '500', marginTop: '15px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📞 {baseCV.contact?.phone}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>✉️ {baseCV.contact?.email}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🔗 {baseCV.contact?.linkedin}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {baseCV.contact?.location}</span>
                    </div>
                  </div>

                  {/* Profile */}
                  <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '12pt', color: '#333333', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', borderBottom: '1px solid #CCC', paddingBottom: '5px' }}>Perfil Profesional</h3>
                    <div style={{ fontSize: '9.5pt', lineHeight: '1.5', color: '#444', textAlign: 'justify' }}>
                      {tailoredData?.tailoredCV?.summary || baseCV.summary}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '12pt', color: '#333333', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', borderBottom: '1px solid #CCC', paddingBottom: '5px' }}>Certificación</h3>
                    <div style={{ columns: '2', columnGap: '20px', fontSize: '9pt', color: '#444', lineHeight: '1.5' }}>
                      {(tailoredData?.tailoredCV?.certifications || baseCV.certifications).map((cert, idx) => (
                        <div key={idx} style={{ breakInside: 'avoid', marginBottom: '5px' }}>• {cert}</div>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '12pt', color: '#333333', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase', borderBottom: '1px solid #CCC', paddingBottom: '5px' }}>Experiencia</h3>
                    {(tailoredData?.tailoredCV?.experience || baseCV.experience).map((exp, idx) => {
                      // El trabajo en idx >= 3 es el que se renderiza en la Hoja 2
                      const isPage2Start = idx === 3;
                      return (
                        <div key={idx} style={{ marginBottom: '18px', pageBreakInside: 'avoid', marginTop: isPage2Start ? '45px' : '0px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                            <h4 style={{ fontSize: '11pt', margin: 0, color: '#333333', fontWeight: '700' }}>{exp.title}</h4>
                            <span style={{ fontSize: '9pt', color: '#666' }}>{exp.period}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                            <span style={{ fontSize: '10pt', color: '#005C53', fontWeight: '600' }}>{exp.company}</span>
                            <span style={{ fontSize: '9pt', color: '#666' }}>{exp.location}</span>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '9pt', color: '#444', lineHeight: '1.45' }}>
                            {exp.description.map((desc, i) => (
                              <li key={i} style={{ marginBottom: '4px' }}>{desc}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  {/* Proyectos Personales */}
                  {(tailoredData?.tailoredCV?.portfolio && tailoredData.tailoredCV.portfolio.length > 0) && (
                    <div style={{ marginTop: '25px', pageBreakInside: 'avoid' }}>
                      <h3 style={{ fontSize: '12pt', color: '#333333', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase', borderBottom: '1px solid #CCC', paddingBottom: '5px' }}>
                        {tailoredData.tailoredCV.portfolioTitle || 'Proyectos Personales'}
                      </h3>
                      {tailoredData.tailoredCV.portfolio.slice(0, 4).map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '14px' }}>
                          <h4 style={{ fontSize: '10pt', margin: '0 0 4px', color: '#005C53', fontWeight: '700' }}>★ {item.title}</h4>
                          <p style={{ fontSize: '9pt', margin: 0, color: '#555', lineHeight: '1.45', textAlign: 'justify' }}>{item.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>

              {/* RIGHT COLUMN (Teal) - 278px continuo de 2244px de altura */}
              <td style={{ width: '278px', backgroundColor: '#005C53', padding: 0, color: '#FFFFFF', verticalAlign: 'top', height: '100%' }}>
                <div style={{ width: '278px', padding: '45px 25px', boxSizing: 'border-box' }}>
                  {/* Photo - centrada perfectamente */}
                  <div style={{ marginBottom: '35px', width: '100%', textAlign: 'center' }}>
                    <div style={{ width: '140px', height: '140px', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.4)', borderRadius: '4px', margin: '0 auto', display: 'block' }}>
                      <img src={baseCV.contact?.photoUrl} alt="Foto" style={{ width: '140px', height: '140px', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
                    </div>
                  </div>

                  {/* Habilidades */}
                  <div style={{ marginBottom: '35px' }}>
                    <h3 style={{ fontSize: '10pt', color: '#FFFFFF', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '6px', margin: '0 0 12px 0' }}>Habilidades</h3>
                    <div style={{ fontSize: '9pt', color: 'rgba(255,255,255,0.95)', lineHeight: '1.8' }}>
                      {(tailoredData?.tailoredCV?.skills || baseCV.skills).slice(0, 8).map((skill, i) => (
                        <div key={i} style={{ marginBottom: '5px' }}>▸ {skill}</div>
                      ))}
                    </div>
                  </div>

                  {/* Competencias */}
                  <div style={{ marginBottom: '35px' }}>
                    <h3 style={{ fontSize: '10pt', color: '#FFFFFF', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '6px', margin: '0 0 12px 0' }}>Competencias</h3>
                    <div style={{ fontSize: '9pt', color: 'rgba(255,255,255,0.95)', lineHeight: '1.8' }}>
                      {(tailoredData?.tailoredCV?.domainAreas || baseCV.domainAreas).map((area, i) => (
                        <div key={i} style={{ marginBottom: '6px' }}>
                          <span style={{ fontWeight: '700', color: '#FFFFFF' }}>▸ {area.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Idiomas */}
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '10pt', color: '#FFFFFF', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '6px', margin: '0 0 12px 0' }}>Idiomas</h3>
                    <div style={{ marginTop: '10px' }}>
                      {baseCV.languages?.map((lang, idx) => (
                        <div key={idx} style={{ marginBottom: '8px', fontSize: '9pt', color: 'rgba(255,255,255,0.95)' }}>
                          <span>{lang.language}</span>
                          <span style={{ fontWeight: '700', color: '#FFD580', marginLeft: '6px' }}>— {lang.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Renderizado Oculto para PDF - CARTA DE PRESENTACION */}
      {/* Margen externo 0 en html2pdf + ancho fijo 794px + contenedor centrado 630px garantizan margen derecho impecable sin cortes */}
      <div id="cover-letter-pdf-content" style={{ display: 'none', backgroundColor: '#FFFFFF', color: '#333333', fontFamily: '"Arial", sans-serif', margin: 0, padding: 0, width: '794px', boxSizing: 'border-box' }}>
        <div style={{ width: '630px', margin: '0 auto', padding: '50px 0', boxSizing: 'border-box' }}>
          {/* Date top right */}
          <div style={{ textAlign: 'right', fontSize: '10pt', color: '#777777', marginBottom: '25px' }}>
            {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          {/* Title */}
          <h3 style={{ fontSize: '16pt', fontWeight: '800', marginBottom: '25px', color: '#005C53', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 25px 0' }}>CARTA DE PRESENTACIÓN</h3>
          
          {/* Body - párrafos separados */}
          <div style={{ fontSize: '10.5pt', color: '#333333', lineHeight: '1.65', marginBottom: '30px', width: '100%' }}>
            {tailoredData?.coverLetter?.split('\n\n').map((paragraph, idx) => (
              <p key={idx} style={{ margin: '0 0 16px 0', textAlign: 'justify', wordBreak: 'normal', overflowWrap: 'break-word', width: '100%' }}>
                {paragraph.trim()}
              </p>
            ))}
          </div>

          {/* Signature Block */}
          <div style={{ fontSize: '9.5pt', color: '#333333', lineHeight: '1.6', borderTop: '1px solid #E2E8F0', paddingTop: '18px' }}>
            <p style={{ margin: '0 0 4px', color: '#666', fontStyle: 'italic' }}>Atentamente,</p>
            <p style={{ margin: '0 0 3px', fontWeight: '800', fontSize: '11.5pt', color: '#005C53' }}>{baseCV.name}</p>
            <p style={{ margin: '0 0 2px', fontSize: '9pt', color: '#666' }}>📞 {baseCV.contact?.phone} &nbsp;|&nbsp; ✉️ {baseCV.contact?.email}</p>
            <p style={{ margin: '0', fontSize: '9pt', color: '#666' }}>🔗 {baseCV.contact?.linkedin} &nbsp;|&nbsp; 📍 {baseCV.contact?.location}</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;

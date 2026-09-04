import { useState, useEffect } from 'react';
import domtoimage from 'dom-to-image-more';
import jsPDF from 'jspdf';
import { Briefcase, FileText, Settings, Loader2, Download, Sparkles, Building2, Target } from 'lucide-react';
import { defaultBaseCV } from './data/baseCV';
import type { BaseCV } from './data/baseCV';
import { generateTailoredCV, generateTailoredCoverLetter } from './services/ai';

function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'base'>('generator');
  const [baseCV, setBaseCV] = useState<BaseCV>(() => {
    const saved = localStorage.getItem('cv_portatil_base_cv');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return defaultBaseCV;
  });


  const [photoBase64, setPhotoBase64] = useState<string>('');
  
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [seniorityLevel, setSeniorityLevel] = useState<'auto' | 'operational' | 'middle' | 'executive'>('auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tailoredData, setTailoredData] = useState<{
    tailoredCV: BaseCV | null;
    coverLetter: string[] | null;
  }>({
    tailoredCV: null,
    coverLetter: null
  });

  useEffect(() => {
    if (baseCV.contact?.photoUrl) {
      if (baseCV.contact.photoUrl.startsWith('data:')) {
        setPhotoBase64(baseCV.contact.photoUrl);
      } else {
        const url = baseCV.contact.photoUrl.startsWith('http') 
          ? baseCV.contact.photoUrl 
          : `${import.meta.env.BASE_URL}${baseCV.contact.photoUrl.replace(/^\//, '')}`;
        
        fetch(url)
          .then(response => response.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
              setPhotoBase64(reader.result as string);
            };
            reader.readAsDataURL(blob);
          })
          .catch(err => {
            console.error("Error preloading photo:", err);
            setPhotoBase64(baseCV.contact.photoUrl);
          });
      }
    }
  }, [baseCV.contact?.photoUrl]);

  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateTailoredCV(jobDescription, baseCV, companyName, seniorityLevel);
      setTailoredData(prev => ({ ...prev, tailoredCV: result.tailoredCV }));
    } catch (error) {
      alert("Error al generar el CV. Revisa la consola para más detalles.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) return;
    setIsGeneratingLetter(true);
    try {
      const letterParagraphs = await generateTailoredCoverLetter(jobDescription, baseCV, companyName, seniorityLevel);
      setTailoredData(prev => ({ ...prev, coverLetter: letterParagraphs }));
    } catch (error) {
      alert("Error al generar la Carta de Presentación.");
      console.error(error);
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const generatePdfWithDomToImage = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Obtener el contenedor oculto padre
    const wrapper = element.parentElement;
    if (!wrapper) return;

    // Hacerlo visible temporalmente fuera de pantalla
    const originalDisplay = wrapper.style.display;
    wrapper.style.display = 'block';
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '-9999px';

    // Pequeña pausa para asegurar que el navegador pinte el elemento (evitar blanco)
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // Usar dom-to-image-more con un scale alto para excelente calidad.
      // A diferencia de html2canvas, esto usa SVG foreignObject y respeta al 100% el kerning nativo.
      const scale = 2;
      const dataUrl = await domtoimage.toJpeg(element, {
        quality: 0.98,
        width: element.offsetWidth * scale,
        height: element.offsetHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${element.offsetWidth}px`,
          height: `${element.offsetHeight}px`
        }
      });

      // Dimensiones A4 multipágina
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      const calculatedHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      if (elementId === 'cv-pdf-content') {
        const hasPortfolio = tailoredData?.tailoredCV?.portfolio && tailoredData.tailoredCV.portfolio.length > 0;
        const maxLimit = hasPortfolio ? 891 : 594;
        const imgHeight = Math.min(calculatedHeight, maxLimit);
        pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, imgHeight);
        if (calculatedHeight > 300) {
          pdf.addPage();
          pdf.addImage(dataUrl, 'JPEG', 0, -297, pdfWidth, imgHeight);
        }
        if (calculatedHeight > 600 && hasPortfolio) {
          pdf.addPage();
          pdf.addImage(dataUrl, 'JPEG', 0, -594, pdfWidth, imgHeight);
        }
      } else {
        let heightLeft = calculatedHeight;
        let position = 0;
        pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, calculatedHeight);
        heightLeft -= pdfHeight;
        while (heightLeft > 5) {
          position = heightLeft - calculatedHeight;
          pdf.addPage();
          pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, calculatedHeight);
          heightLeft -= pdfHeight;
        }
      }

      pdf.save(filename);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error al generar el PDF. Verifica la consola.");
    } finally {
      // Restaurar estado oculto
      wrapper.style.display = originalDisplay;
      wrapper.style.position = '';
      wrapper.style.left = '';
      wrapper.style.top = '';
    }
  };

  const handleDownloadPDF = () => {
    generatePdfWithDomToImage('cv-pdf-content', `CV_${baseCV.name.replace(/\s+/g, '_')}_Tailored.pdf`);
  };

  const handleDownloadCoverLetterPDF = () => {
    generatePdfWithDomToImage('cover-letter-pdf-content', `Carta_Presentacion_${baseCV.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-amber-500/30 overflow-x-hidden w-full max-w-full">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-[#020617]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-0 sm:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                <img src={`${import.meta.env.BASE_URL}icon.jpg`} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-100 flex items-center gap-1.5 sm:gap-2">
                  CV Portátil <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-xs sm:text-sm font-semibold border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">AI</span>
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:block">Generador Ejecutivo Inteligente</p>
              </div>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 bg-[#0f172a] p-1 rounded-xl border border-slate-800/80 shadow-inner w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('generator')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${activeTab === 'generator' ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
              <Briefcase size={15} />
              <span>Analizador</span>
            </button>
            <button 
              onClick={() => setActiveTab('base')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${activeTab === 'base' ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
              <Settings size={15} />
              <span>Datos Base</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {activeTab === 'generator' ? (
          <div className="grid lg:grid-cols-12 gap-6 sm:gap-10">
            {/* Left Column: Input (5 cols) */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={22} />
                  Adaptación Inteligente
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1.5 sm:mt-2 leading-relaxed">
                  Pega el requerimiento del puesto. Nuestra IA analizará las palabras clave, adaptará tu experiencia y redactará una carta persuasiva.
                </p>
              </div>

              {/* Optional Company Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                  <Building2 size={13} className="text-amber-500" /> Empresa u Organización (Opcional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej: Inditex, Telefónica (O dejar en blanco si es agencia/ETT como Grafton)..."
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner"
                />
              </div>

              {/* Seniority Calibration Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                  <Target size={13} className="text-amber-500" /> Calibración de Senioridad (Anti-Sobrecualificación)
                </label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#0f172a] border border-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSeniorityLevel('auto')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left flex flex-col justify-center ${seniorityLevel === 'auto' ? 'bg-slate-800 text-amber-400 border border-slate-700/50 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <span>⚡ Auto-Detectar</span>
                    <span className="text-[9px] font-normal text-slate-500">Según la oferta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeniorityLevel('operational')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left flex flex-col justify-center ${seniorityLevel === 'operational' ? 'bg-slate-800 text-amber-400 border border-slate-700/50 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <span>🛒 Operativo / Tienda</span>
                    <span className="text-[9px] font-normal text-slate-500">Dependiente, Caja, Reposición</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeniorityLevel('middle')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left flex flex-col justify-center ${seniorityLevel === 'middle' ? 'bg-slate-800 text-amber-400 border border-slate-700/50 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <span>👔 Mando Medio</span>
                    <span className="text-[9px] font-normal text-slate-500">Encargado, Coordinador</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeniorityLevel('executive')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left flex flex-col justify-center ${seniorityLevel === 'executive' ? 'bg-slate-800 text-amber-400 border border-slate-700/50 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <span>📊 Ejecutivo / Directivo</span>
                    <span className="text-[9px] font-normal text-slate-500">Estrategia & IA</span>
                  </button>
                </div>
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
                    className="w-full h-56 sm:h-80 bg-transparent text-slate-200 placeholder-slate-600 p-4 sm:p-5 focus:outline-none resize-none text-sm leading-relaxed custom-scrollbar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || isGeneratingLetter || !jobDescription.trim()}
                  className="w-full group relative inline-flex items-center justify-center gap-2 px-5 py-3.5 font-bold text-slate-950 bg-amber-500 rounded-xl overflow-hidden transition-all duration-300 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.5)] text-sm"
                >
                  {isGenerating ? (
                    <><Loader2 className="animate-spin" size={16} /> Procesando CV...</>
                  ) : (
                    <><FileText size={16} className="transition-transform group-hover:scale-110" /> Adaptar CV con IA</>
                  )}
                </button>

                <button 
                  onClick={handleGenerateCoverLetter}
                  disabled={isGenerating || isGeneratingLetter || !jobDescription.trim()}
                  className="w-full group relative inline-flex items-center justify-center gap-2 px-5 py-3.5 font-bold text-white bg-teal-600 rounded-xl overflow-hidden transition-all duration-300 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(13,148,136,0.5)] text-sm border border-teal-500/30"
                >
                  {isGeneratingLetter ? (
                    <><Loader2 className="animate-spin" size={16} /> Generando Carta...</>
                  ) : (
                    <><Sparkles size={16} className="transition-transform group-hover:scale-110" /> Adaptar Carta con IA</>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Preview (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl flex flex-col h-[550px] sm:h-[800px] relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800 relative z-10">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-3">
                      <div className="relative flex h-3 w-3">
                        {tailoredData?.tailoredCV ? (
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
                  
                  {tailoredData?.tailoredCV && (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button onClick={handleDownloadCoverLetterPDF} className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-600 transition-all shadow-sm hover:shadow-md">
                        <Download size={15} className="text-amber-500" /> PDF Carta
                      </button>
                      <button onClick={handleDownloadPDF} className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-600 transition-all shadow-sm hover:shadow-md">
                        <Download size={15} className="text-amber-500" /> PDF CV
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar relative z-10">
                  {tailoredData?.tailoredCV ? (
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
                          {Array.isArray(tailoredData.coverLetter) ? tailoredData.coverLetter.join('\n\n') : tailoredData.coverLetter}
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
                          {(tailoredData?.tailoredCV?.certifications || baseCV.certifications).slice(0, 10).map((cert, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div> 
                              <span className="text-xs text-slate-300 leading-relaxed">{cert}</span>
                            </div>
                          ))}
                        </div>
                        {(!tailoredData?.tailoredCV?.certifications && baseCV.certifications.length > 10) && (
                          <p className="text-xs text-slate-500 mt-4 text-center italic">
                            * Y {baseCV.certifications.length - 10} certificaciones adicionales en el perfil base.
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
                      {(!tailoredData?.tailoredCV || (tailoredData.tailoredCV.portfolio && tailoredData.tailoredCV.portfolio.length > 0)) && (
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
                      )}
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
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Foto de Perfil (Ruta o URL)</label>
                    <input type="text" value={baseCV.contact?.photoUrl || ''} onChange={(e) => setBaseCV({...baseCV, contact: {...baseCV.contact, photoUrl: e.target.value}})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner" placeholder="profile.png o URL de imagen" />
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
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      localStorage.setItem('cvportatil_baseCV', JSON.stringify(baseCV));
                      alert('¡Perfil local guardado con éxito! Tus cambios se mantendrán aunque cierres el navegador.');
                    }}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '10px 15px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      flex: 1
                    }}
                  >
                    💾 Guardar Perfil Local
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de que deseas restaurar el perfil a su estado original? Esto borrará tus cambios locales no guardados en el código.')) {
                        localStorage.removeItem('cvportatil_baseCV');
                        window.location.reload();
                      }
                    }}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '10px 15px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      flex: 1
                    }}
                  >
                    🔄 Restaurar Original
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Renderizado Oculto para el PDF */}
      <div style={{ display: 'none' }}>
        <div id="cv-pdf-content" style={{ backgroundColor: '#FFFFFF', color: '#333333', fontFamily: 'Arial, Helvetica, sans-serif', margin: 0, padding: 0, width: '794px', minHeight: (tailoredData?.tailoredCV?.portfolio && tailoredData.tailoredCV.portfolio.length > 0) ? '3366px' : '2244px', boxSizing: 'border-box' }}>
        <style>{`
          #cv-pdf-content, #cv-pdf-content *, #cover-letter-pdf-content, #cover-letter-pdf-content * {
            box-sizing: border-box !important;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
            letter-spacing: 0px !important;
            word-spacing: 0px !important;
            text-rendering: optimizeLegibility !important;
            -webkit-font-smoothing: antialiased !important;
            font-feature-settings: "liga" 0, "clig" 0 !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
          }
        `}</style>
        
        <table style={{ width: '794px', height: '3366px', maxHeight: '3366px', borderCollapse: 'collapse', tableLayout: 'fixed', overflow: 'hidden' }}>
          <colgroup>
            <col style={{ width: '516px' }} />
            <col style={{ width: '278px' }} />
          </colgroup>
          <tbody>
            <tr>
              {/* LEFT COLUMN (White) - 516px */}
              <td style={{ width: '516px', padding: 0, backgroundColor: '#FFFFFF', verticalAlign: 'top' }}>
                {/* --- HOJA 1 --- */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '45px 35px 45px 35px', width: '100%', boxSizing: 'border-box', height: '1122px', overflow: 'hidden' }}>
                  {/* Header / Name */}
                  <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '28pt', margin: '0 0 5px', color: '#333333', fontWeight: '900', letterSpacing: 'normal', textTransform: 'uppercase', lineHeight: '1.1' }}>{baseCV.name}</h1>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 18px', fontSize: '9pt', color: '#666', fontWeight: '500', marginTop: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📞 {baseCV.contact?.phone}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>✉️ {baseCV.contact?.email}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🔗 {baseCV.contact?.linkedin}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {baseCV.contact?.location}</span>
                    </div>
                  </div>

                  {/* Profile */}
                  <div style={{ marginBottom: '15px', pageBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '12pt', color: '#333333', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #CCC', paddingBottom: '3px' }}>Perfil Profesional</h3>
                    <div style={{ fontSize: '9.5pt', lineHeight: '1.4', color: '#444', textAlign: 'left' }}>
                      {(() => {
                        const s = tailoredData?.tailoredCV?.summary || baseCV.summary;
                        return (s && s.split(/\s+/).length >= 10)
                          ? s
                          : `${s} Trayectoria directiva y estratégica enfocada en la optimización de procesos, gestión de equipos de alto rendimiento y excelencia operativa para elevar la rentabilidad y el cumplimiento de objetivos corporativos.`;
                      })()}
                    </div>
                  </div>

                  {/* Experience - Parte 1 (Hoja 1) */}
                  <div style={{ marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '12pt', color: '#333333', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', borderBottom: '1px solid #CCC', paddingBottom: '3px' }}>Experiencia</h3>
                    <div style={{ width: '100%' }}>
                      {(tailoredData?.tailoredCV?.experience || baseCV.experience).slice(0, 4).map((exp, idx) => {
                        return (
                          <div key={idx} style={{ paddingBottom: '10px', pageBreakInside: 'avoid', width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px', width: '100%' }}>
                              <h4 style={{ fontSize: '11pt', margin: 0, color: '#333333', fontWeight: '700' }}>{exp.title}</h4>
                              <span style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap', marginLeft: '10px' }}>{exp.period}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px', width: '100%' }}>
                              <span style={{ fontSize: '10pt', color: '#005C53', fontWeight: '600' }}>{exp.company}</span>
                              <span style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap', marginLeft: '10px' }}>{exp.location}</span>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '8.5pt', color: '#444', lineHeight: '1.3' }}>
                              {exp.description.filter((d: string) => d.trim() !== '').map((desc, i) => (
                                <li key={i} style={{ marginBottom: '3px' }}>{desc}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ flexGrow: 1 }} />
                  <div style={{ width: '100%', borderTop: '1px solid #EEEEEE', paddingTop: '10px', textAlign: 'center', fontSize: '8pt', color: '#999999' }}>Hjalmar Meza - Currículum Vitae</div>
                </div>

                {/* --- HOJA 2 --- */}
                <div style={{ display: 'flex', flexDirection: 'column', padding: '45px 35px 45px 35px', width: '100%', boxSizing: 'border-box', height: '1122px', overflow: 'hidden' }}>
                  {/* Experience - Parte 2 (Hoja 2) */}
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ width: '100%' }}>
                      {(tailoredData?.tailoredCV?.experience || baseCV.experience).slice(4).map((exp, idx) => {
                        return (
                          <div key={idx} style={{ paddingBottom: '10px', pageBreakInside: 'avoid', width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px', width: '100%' }}>
                              <h4 style={{ fontSize: '11pt', margin: 0, color: '#333333', fontWeight: '700' }}>{exp.title}</h4>
                              <span style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap', marginLeft: '10px' }}>{exp.period}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px', width: '100%' }}>
                              <span style={{ fontSize: '10pt', color: '#005C53', fontWeight: '600' }}>{exp.company}</span>
                              <span style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap', marginLeft: '10px' }}>{exp.location}</span>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '8.5pt', color: '#444', lineHeight: '1.3' }}>
                              {exp.description.filter((d: string) => d.trim() !== '').map((desc, i) => (
                                <li key={i} style={{ marginBottom: '3px' }}>{desc}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Certifications - Movido a Hoja 2 */}
                  <div style={{ marginTop: '5px', pageBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '12pt', color: '#333333', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #CCC', paddingBottom: '5px' }}>Certificación</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '9pt', color: '#444', lineHeight: '1.4' }}>
                      {(tailoredData?.tailoredCV?.certifications || baseCV.certifications).slice(0, 4).map((cert, idx) => (
                        <div key={idx} style={{ breakInside: 'avoid' }}>• {cert}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ flexGrow: 1 }} />
                  <div style={{ width: '100%', borderTop: '1px solid #EEEEEE', paddingTop: '10px', textAlign: 'center', fontSize: '8pt', color: '#999999' }}>Hjalmar Meza - Currículum Vitae</div>
                </div>

                {/* --- HOJA 3 --- */}
                <div style={{ padding: '45px 35px 45px 35px', width: '100%', boxSizing: 'border-box', height: '1122px', overflow: 'hidden' }}>
                  {/* Proyectos Personales */}
                  {(tailoredData?.tailoredCV?.portfolio && tailoredData.tailoredCV.portfolio.length > 0) && (
                    <div style={{ pageBreakInside: 'avoid' }}>
                      <h3 style={{ fontSize: '12pt', color: '#333333', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase', borderBottom: '1px solid #CCC', paddingBottom: '5px' }}>
                        {tailoredData.tailoredCV.portfolioTitle || 'Proyectos Personales'}
                      </h3>
                      {tailoredData.tailoredCV.portfolio.slice(0, 4).map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '14px' }}>
                          <h4 style={{ fontSize: '10pt', margin: '0 0 4px', color: '#005C53', fontWeight: '700' }}>★ {item.title}</h4>
                          <p style={{ fontSize: '9pt', margin: 0, color: '#555', lineHeight: '1.45', textAlign: 'left' }}>{item.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>

              {/* RIGHT COLUMN (Teal) */}
              <td style={{ width: '278px', backgroundColor: '#005C53', padding: 0, color: '#FFFFFF', verticalAlign: 'top' }}>
                {/* --- HOJA 1 RIGHT --- */}
                <div style={{ padding: '45px 25px 45px 25px', width: '100%', boxSizing: 'border-box', height: '1122px', overflow: 'hidden' }}>
                  {/* Photo - centrada perfectamente */}
                  <div style={{ marginBottom: '35px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ 
                      width: '140px', 
                      height: '140px', 
                      borderRadius: '4px', 
                      border: '3px solid rgba(255,255,255,0.4)', 
                      backgroundColor: '#fff',
                      backgroundImage: `url(${photoBase64 || baseCV.contact?.photoUrl || ''})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }} />
                  </div>

                  {/* Habilidades */}
                  <div style={{ marginBottom: '35px' }}>
                    <h3 style={{ fontSize: '10pt', color: '#FFFFFF', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '6px', margin: '0 0 12px 0' }}>Habilidades</h3>
                    <div style={{ fontSize: '9pt', color: 'rgba(255,255,255,0.95)', lineHeight: '1.8' }}>
                      {(tailoredData?.tailoredCV?.skills || baseCV.skills).slice(0, 5).map((skill, i) => (
                        <div key={i} style={{ marginBottom: '5px' }}>▸ {skill}</div>
                      ))}
                    </div>
                  </div>

                  {/* Competencias */}
                  <div style={{ marginBottom: '35px' }}>
                    <h3 style={{ fontSize: '10pt', color: '#FFFFFF', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '6px', margin: '0 0 12px 0' }}>Competencias</h3>
                    <div style={{ fontSize: '9pt', color: 'rgba(255,255,255,0.95)', lineHeight: '1.8' }}>
                      {(() => {
                        const currentSkills = (tailoredData?.tailoredCV?.skills || baseCV.skills).slice(0, 5);
                        const hasLeadershipSkill = currentSkills.some(s => s.toLowerCase().includes('liderazgo'));
                        const rawAreas = (tailoredData?.tailoredCV?.domainAreas && tailoredData.tailoredCV.domainAreas.length >= 3)
                          ? tailoredData.tailoredCV.domainAreas
                          : baseCV.domainAreas;
                        
                        let cleanAreas = rawAreas.filter(area => !(hasLeadershipSkill && area.title.toLowerCase().includes('liderazgo')));
                        
                        // Si quedan menos de 4 por el filtro, auto-completar con competencias del CV base
                        for (const baseArea of baseCV.domainAreas) {
                          if (cleanAreas.length >= 4) break;
                          if (!cleanAreas.some(a => a.title.toLowerCase() === baseArea.title.toLowerCase()) && !(hasLeadershipSkill && baseArea.title.toLowerCase().includes('liderazgo'))) {
                            cleanAreas.push(baseArea);
                          }
                        }

                        return cleanAreas.slice(0, 5).map((area, i) => (
                          <div key={i} style={{ marginBottom: '6px' }}>
                            <span style={{ fontWeight: '700', color: '#FFFFFF' }}>▸ {area.title}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                  {/* Educación / Estudios */}
                  <div style={{ marginBottom: '35px' }}>
                    <h3 style={{ fontSize: '10pt', color: '#FFFFFF', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '6px', margin: '0 0 12px 0' }}>Estudios</h3>
                    {baseCV.education.map((edu, idx) => (
                      <div key={idx} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '9pt', fontWeight: '700', color: '#FFFFFF' }}>{edu.degree}</span>
                          <span style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.9)' }}>{edu.period}</span>
                        </div>
                        <div style={{ fontSize: '8.5pt', color: 'rgba(255,255,255,0.8)' }}>{edu.institution}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- HOJA 2 RIGHT --- */}
                <div style={{ padding: '45px 25px 45px 25px', width: '100%', boxSizing: 'border-box', height: '1122px', overflow: 'hidden' }}>
                  {/* Idiomas */}
                  <div style={{ marginBottom: '25px' }}>
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
      </div>

      {/* Renderizado Oculto para PDF - CARTA DE PRESENTACION */}
      {/* Margen externo 0 en html2pdf + ancho fijo 794px + contenedor centrado 630px garantizan margen derecho impecable sin cortes */}
      <div style={{ display: 'none' }}>
        <div id="cover-letter-pdf-content" style={{ backgroundColor: '#FFFFFF', color: '#333333', fontFamily: 'Arial, Helvetica, sans-serif', margin: 0, padding: 0, width: '794px', boxSizing: 'border-box' }}>
        <style>{`
          #cover-letter-pdf-content, #cover-letter-pdf-content * {
            box-sizing: border-box !important;
            font-family: Arial, Helvetica, sans-serif !important;
            letter-spacing: normal !important;
            word-spacing: normal !important;
            text-rendering: auto !important;
            -webkit-font-smoothing: auto !important;
            font-feature-settings: normal !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
          }
        `}</style>
        <table style={{ width: '100%', margin: '0', borderCollapse: 'collapse', borderSpacing: 0 }}>
          <tbody>
            <tr>
              <td style={{ width: '100%', padding: '30px 60px', boxSizing: 'border-box', verticalAlign: 'top' }}>
                
                {/* Date top right */}
                <div style={{ textAlign: 'right', fontSize: '10pt', color: '#777777', marginBottom: '25px' }}>
                  {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                
                {/* Title */}
                <h3 style={{ fontSize: '16pt', fontWeight: '800', marginBottom: '25px', color: '#005C53', textTransform: 'uppercase', letterSpacing: 'normal', margin: '0 0 25px 0' }}>CARTA DE PRESENTACIÓN</h3>
                
                {/* Body - párrafos separados por tablas */}
                <table style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0, marginBottom: '30px' }}>
                  <tbody>
                    {Array.isArray(tailoredData?.coverLetter) ? tailoredData.coverLetter.filter(p => !p.trim().toLowerCase().startsWith('atentamente')).map((paragraph, idx) => (
                      <tr key={idx}>
                        <td style={{ paddingBottom: '16px', fontSize: '10.5pt', color: '#333333', lineHeight: '1.65', textAlign: 'left', wordBreak: 'normal', overflowWrap: 'break-word' }}>
                          {paragraph.trim()}
                        </td>
                      </tr>
                    )) : null}
                  </tbody>
                </table>

                {/* Signature Block */}
                <table style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0, marginTop: '30px' }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'middle', textAlign: 'left' }}>
                        <p style={{ margin: '0 0 3px', fontWeight: '800', fontSize: '11.5pt', color: '#005C53' }}>{baseCV.name}</p>
                        <p style={{ margin: '0 0 2px', fontSize: '9pt', color: '#666' }}>📞 {baseCV.contact?.phone} &nbsp;|&nbsp; ✉️ {baseCV.contact?.email}</p>
                        <p style={{ margin: '0', fontSize: '9pt', color: '#666' }}>🔗 {baseCV.contact?.linkedin} &nbsp;|&nbsp; 📍 {baseCV.contact?.location}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>

              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default App;

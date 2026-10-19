import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { question: '¿Trabajan con empresas y emprendedores?', answer: 'Sí. Adaptamos el alcance y el proceso a la etapa de cada proyecto, desde una primera versión hasta una plataforma para una operación consolidada.' },
  { question: '¿Cómo empieza un proyecto?', answer: 'Conversamos sobre el problema, los usuarios y los objetivos. Con esa información definimos un alcance inicial y los siguientes pasos.' },
  { question: '¿Pueden mejorar un sistema existente?', answer: 'Podemos revisar la experiencia, la arquitectura y las necesidades actuales para proponer una mejora gradual y viable.' },
  { question: '¿Cómo se define el presupuesto?', answer: 'Depende del alcance, las integraciones y el tiempo de desarrollo. Tras una conversación inicial podemos preparar una propuesta específica.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return <section id="faq" className="section-pad border-t border-border-subtle" aria-labelledby="faq-titulo"><div className="container-wide grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24"><div><p className="eyebrow">RESPUESTAS CLARAS</p><h2 id="faq-titulo" className="section-title mt-5">Antes de empezar, <em>hablemos claro.</em></h2></div><div className="faq-list">{faqs.map((faq, index) => <div className="faq-item" key={faq.question}><h3><button type="button" id={`faq-trigger-${index}`} aria-expanded={openIndex === index} aria-controls={`faq-panel-${index}`} onClick={() => setOpenIndex(openIndex === index ? null : index)} className="faq-trigger"><span>{faq.question}</span><ChevronDown size={22} aria-hidden="true" className={openIndex === index ? 'rotate-180 transition-transform' : 'transition-transform'} /></button></h3><div id={`faq-panel-${index}`} role="region" aria-labelledby={`faq-trigger-${index}`} hidden={openIndex !== index} className="faq-panel">{faq.answer}</div></div>)}</div></div></section>;
}

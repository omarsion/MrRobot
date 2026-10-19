import { ArrowUpRight, BadgeCheck, Lightbulb, Workflow } from 'lucide-react';
import { whatsappUrl } from '../lib/contact';

const values = [
  { icon: Lightbulb, title: 'Pensamos antes de construir', text: 'Entendemos el problema y elegimos la solución que tiene sentido para tu operación.' },
  { icon: Workflow, title: 'Trabajamos contigo', text: 'Tu equipo participa en las decisiones clave, desde la primera idea hasta cada iteración.' },
  { icon: BadgeCheck, title: 'Cuidamos los detalles', text: 'Diseño, accesibilidad y calidad técnica forman parte del producto desde el inicio.' },
];

export default function About() {
  return (
    <section id="nosotros" className="section-pad border-t border-border-subtle" aria-labelledby="nosotros-titulo">
      <div className="container-wide grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
        <div><p className="eyebrow">SOBRE MR. ROBOT</p><h2 id="nosotros-titulo" className="section-title mt-5">La tecnología es mejor cuando <em>se siente humana.</em></h2><p className="section-copy mt-6">Somos un equipo que combina ingeniería y diseño para convertir necesidades reales en productos digitales claros, útiles y duraderos.</p><a className="button button--outline mt-8" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">Conoce cómo trabajamos <ArrowUpRight size={18} aria-hidden="true" /></a></div>
        <div className="space-y-4">{values.map((value, index) => { const Icon = value.icon; return <div className="value-card" key={value.title}><div className="value-number">0{index + 1}</div><div><Icon className="mb-5 text-accent" size={26} strokeWidth={1.6} aria-hidden="true" /><h3 className="text-xl font-semibold">{value.title}</h3><p className="mt-2 leading-relaxed text-text-muted">{value.text}</p></div></div>; })}</div>
      </div>
    </section>
  );
}

import { ArrowUpRight, Blocks, Globe2, Smartphone } from 'lucide-react';
import { whatsappUrl } from '../lib/contact';

const services = [
  { number: '01', icon: Blocks, title: 'Software a medida', description: 'Sistemas de gestión y plataformas que se adaptan a tus procesos, no al revés.', message: 'Hola, quiero cotizar un sistema a medida.' },
  { number: '02', icon: Smartphone, title: 'Aplicaciones móviles', description: 'Experiencias intuitivas para conectar tu servicio con las personas que lo necesitan.', message: 'Hola, quiero cotizar una aplicación móvil.' },
  { number: '03', icon: Globe2, title: 'Web y experiencias digitales', description: 'Sitios y productos digitales rápidos, claros y pensados para convertir visitas en oportunidades.', message: 'Hola, quiero cotizar un proyecto web.' },
];

export default function Services() {
  return (
    <section id="servicios" className="section-pad border-t border-border-subtle" aria-labelledby="servicios-titulo">
      <div className="container-wide">
        <div className="section-heading"><div><p className="eyebrow">QUÉ HACEMOS</p><h2 id="servicios-titulo" className="section-title mt-5">Tu próximo avance<br /><em>empieza aquí.</em></h2></div><p className="section-copy max-w-md">Unimos estrategia, diseño y desarrollo para crear herramientas que resuelven problemas concretos.</p></div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {services.map(service => {
            const Icon = service.icon;
            return <article className="service-card" key={service.number}>
              <div className="flex items-start justify-between"><span className="service-icon"><Icon size={25} strokeWidth={1.6} aria-hidden="true" /></span><span className="service-number">{service.number} / 03</span></div>
              <div className="mt-14"><h3 className="text-2xl font-semibold tracking-tight">{service.title}</h3><p className="mt-4 min-h-24 leading-relaxed text-text-muted">{service.description}</p></div>
              <a className="service-link" href={whatsappUrl(service.message)} target="_blank" rel="noopener noreferrer">Conversemos <ArrowUpRight size={18} aria-hidden="true" /></a>
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}

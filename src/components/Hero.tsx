import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { whatsappUrl } from '../lib/contact';
import BrandLogo from './BrandLogo';

export default function Hero() {
  return (
    <section id="inicio" className="hero-shell relative isolate flex min-h-svh items-center overflow-hidden pt-28 pb-20 sm:pt-32">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="container-wide relative z-10 grid w-full items-center gap-14 lg:grid-cols-[1.12fr_.88fr] lg:gap-8">
        <div className="max-w-3xl">
          <p className="eyebrow mb-7"><Sparkles size={15} aria-hidden="true" /> TECNOLOGÍA QUE MUEVE NEGOCIOS</p>
          <h1 className="hero-title">Ideas complejas.<br /><span>Soluciones claras.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-text-muted sm:text-xl">
            Diseñamos software a medida, plataformas web y aplicaciones que automatizan procesos y abren nuevas oportunidades para tu negocio.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a className="button button--light" href={whatsappUrl('Hola, quiero cotizar un proyecto de software con Mr. Robot Bolivia.')} target="_blank" rel="noopener noreferrer">
              Hablemos de tu proyecto <ArrowUpRight size={19} aria-hidden="true" />
            </a>
            <a className="button button--outline" href="#proyectos">Explorar proyectos <ArrowDown size={18} aria-hidden="true" /></a>
          </div>
          <p className="mt-7 text-sm text-text-muted">Estrategia, diseño y desarrollo · Bolivia y proyectos internacionales</p>
        </div>
        <div className="hero-art relative mx-auto hidden w-full max-w-[560px] lg:block" aria-hidden="true">
          <div className="hero-orbit hero-orbit--one" />
          <div className="hero-orbit hero-orbit--two" />
          <div className="hero-art-core"><BrandLogo showWordmark={false} /><i /><b>BUILD WHAT'S NEXT</b></div>
          <div className="hero-art-chip hero-art-chip--top">01 / DISCOVER</div>
          <div className="hero-art-chip hero-art-chip--bottom">02 / ENGINEER</div>
        </div>
      </div>
      <a href="#experiencia" className="hero-scroll" aria-label="Descubrir nuestra forma de trabajar"><span>DESLIZA PARA EXPLORAR</span><ArrowDown size={17} aria-hidden="true" /></a>
    </section>
  );
}

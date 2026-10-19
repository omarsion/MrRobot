import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight, CircleCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const device = deviceRef.current;
    const glow = glowRef.current;
    if (!section || !device || !glow) return;

    const media = gsap.matchMedia();
    media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });
      timeline.fromTo(device,
        { rotateY: -22, rotateX: 12, rotateZ: -4, scale: 0.82, xPercent: -4 },
        { rotateY: 13, rotateX: -5, rotateZ: 2, scale: 1.08, xPercent: 2, ease: 'none' }, 0);
      timeline.fromTo(glow, { opacity: 0.25, scale: 0.8 }, { opacity: 0.75, scale: 1.25, ease: 'none' }, 0);
    });
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('.story-reveal').forEach(element => {
        gsap.fromTo(element, { opacity: 0, y: 24 }, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        });
      });
    });
    return () => media.revert();
  }, []);

  return (
    <section id="experiencia" ref={sectionRef} className="experience-section section-pad" aria-labelledby="experiencia-titulo">
      <div className="container-wide">
        <div className="mb-14 max-w-3xl story-reveal">
          <p className="eyebrow">DEL PROBLEMA AL PRODUCTO</p>
          <h2 id="experiencia-titulo" className="section-title mt-5">Tecnología que toma forma <em>contigo.</em></h2>
          <p className="section-copy mt-6">De una idea inicial a una herramienta que tu equipo quiere usar. Cada interacción está pensada para hacer el trabajo más simple.</p>
        </div>
        <div className="experience-layout">
          <div className="experience-copy">
            <div className="story-step story-reveal"><span>01 / ENTENDER</span><h3>Empezamos por tu desafío.</h3><p>Escuchamos cómo trabajas y detectamos los puntos donde la tecnología puede generar valor real.</p></div>
            <div className="story-step story-reveal"><span>02 / DISEÑAR</span><h3>Convertimos complejidad en claridad.</h3><p>Diseñamos recorridos simples y una arquitectura preparada para crecer junto a tu operación.</p></div>
            <div className="story-step story-reveal"><span>03 / CONSTRUIR</span><h3>Lanzamos algo que funciona.</h3><p>Desarrollamos, probamos e iteramos contigo para que el producto sea útil desde el primer día.</p></div>
          </div>
          <div className="experience-stage" aria-hidden="true">
            <div className="experience-glow" ref={glowRef} />
            <div className="device-perspective">
              <div className="product-device" ref={deviceRef}>
                <div className="device-toolbar"><div className="device-dots"><i /><i /><i /></div><span>MR / CONTROL CENTER</span><span className="device-status">● LIVE</span></div>
                <div className="device-body">
                  <div className="device-sidebar"><div className="device-logo">MR.</div><span className="selected" /><span /><span /><span /><span /><b /></div>
                  <div className="device-content">
                    <div className="device-topline"><span>VISIÓN GENERAL</span><CircleCheck size={18} /></div>
                    <strong>Todo en movimiento.</strong>
                    <div className="device-chart"><div className="device-chart-grid" /><div className="chart-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div>
                    <div className="device-metrics"><div><span>PROCESOS</span><b>Integrados</b><small>en un solo lugar</small></div><div><span>DATOS</span><b>Conectados</b><small>para decidir mejor</small></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="experience-float">IDEAS <ArrowDownRight size={16} /> IMPACTO</div>
          </div>
        </div>
        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-text-muted">Visualización conceptual del proceso de trabajo; no representa la interfaz de un cliente.</p>
      </div>
    </section>
  );
}

import { ArrowUpRight } from 'lucide-react';
import { whatsappUrl } from '../lib/contact';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return <footer className="footer-shell"><div className="container-wide"><p className="eyebrow">EL SIGUIENTE PASO</p><h2 className="footer-title mt-6">Hagamos que tu idea<br /><em>se mueva.</em></h2><p className="section-copy mt-6 max-w-xl">Cuéntanos qué necesitas. Construyamos una solución con dirección, detalle e impacto.</p><a className="button button--light mt-9" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">Conversemos sobre tu proyecto <ArrowUpRight size={19} aria-hidden="true" /></a><div className="footer-bottom"><a className="brand" href="#inicio" aria-label="Mr. Robot Bolivia, volver al inicio"><BrandLogo institutional /></a><span>© {new Date().getFullYear()} Mr. Robot Bolivia</span><a href="#inicio" className="footer-top">Volver arriba ↑</a></div></div></footer>;
}

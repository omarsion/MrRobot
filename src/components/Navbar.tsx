import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { whatsappUrl } from '../lib/contact';
import BrandLogo from './BrandLogo';

const links = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Proyectos', href: '#proyectos' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Preguntas', href: '#faq' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled || open ? 'site-header--solid' : ''}`}>
      <nav className="container-wide flex h-20 items-center justify-between gap-6" aria-label="Navegación principal">
        <a href="#inicio" className="brand" aria-label="Mr. Robot Bolivia, ir al inicio" onClick={() => setOpen(false)}>
          <BrandLogo />
        </a>
        <div className="hidden items-center gap-8 lg:flex">
          {links.map(link => <a className="nav-link" href={link.href} key={link.href}>{link.label}</a>)}
        </div>
        <a className="button button--light desktop-cta" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
          Hablemos de tu proyecto <ArrowUpRight size={17} aria-hidden="true" />
        </a>
        <button className="menu-toggle lg:hidden" type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open} aria-controls="menu-movil" onClick={() => setOpen(value => !value)}>
          {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </nav>
      <div id="menu-movil" className={`mobile-menu lg:hidden ${open ? 'mobile-menu--open' : ''}`} hidden={!open}>
        <div className="container-wide flex flex-col gap-1 py-5">
          {links.map(link => <a className="mobile-link" href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}
          <a className="button button--light mt-4" href={whatsappUrl()} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            Cotizar proyecto <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}

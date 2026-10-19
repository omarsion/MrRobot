import { ArrowUpRight } from 'lucide-react';
import { whatsappUrl } from '../lib/contact';
import SmartSvgImage from './SmartSvgImage';

const projects = [
  {
    number: '01', type: 'EXPERIENCIA WEB', image: `${import.meta.env.BASE_URL}images/fiea-web-redesign.jpg`, width: 1600, height: 733,
    alt: 'Portal institucional de FIEA Ecuador, con fotografía de paisaje y navegación principal',
    title: 'Rediseño Web & Transformación Digital – FIEA Ecuador',
    subtitle: 'CMS Institucional y Gestión de Contenidos a Medida',
    description: 'Reestructuración integral y modernización del portal institucional utilizando WordPress, optimizando la experiencia del usuario y el rendimiento del sitio. Desarrollo de plugins personalizados a medida para la gestión dinámica de imágenes y noticias de alto tráfico. Trabajo colaborativo directo con el equipo de comunicación de la FIEA para la alineación de marca y flujos editoriales ágiles.',
  },
  {
    number: '02', type: 'GESTIÓN EDUCATIVA', image: `${import.meta.env.BASE_URL}images/centro-infantil-datilera.jpg`, width: 921, height: 415,
    alt: 'Panel de Datilera para la sede Cochabamba con indicadores de inscripciones, ingresos y pagos pendientes',
    title: 'Sistema de Gestión de Información – Centro Infantil Datilera',
    subtitle: 'Operación integrada para las sedes de Cochabamba y Oruro',
    description: 'Plataforma de gestión para el Centro Infantil Datilera y sus sedes de Cochabamba y Oruro. Organiza la información de inscripciones, seguimiento académico, finanzas y pagos en una interfaz clara para el equipo administrativo.',
  },
  {
    number: '03', type: 'AUTOMATIZACIÓN', image: `${import.meta.env.BASE_URL}images/fiea-budgets.jpg`, width: 1600, height: 723,
    alt: 'Panel de control financiero de FIEA con indicadores de presupuesto, comprobantes y reglas activas',
    title: 'Sistema de Presupuestos y Automatización Financiera – FIEA',
    subtitle: 'Integración Global y Automatización API',
    description: 'Desarrollo de una plataforma automatizada de presupuestos y facturación ("Budgets") adaptada para proyectos e inversionistas de EE.UU. Implementación de flujos de comunicación automáticos en tiempo real mediante la integración de la API de WhatsApp y servicios de correo electrónico, reduciendo la fricción en la gestión y acelerando la toma de decisiones.',
  },
  {
    number: '04', type: 'SOFTWARE ERP', image: `${import.meta.env.BASE_URL}images/ferreteria-aroma.jpg`, width: 1600, height: 730,
    alt: 'Panel operativo de Ferretería Aroma con métricas de ventas, inventario y sucursales',
    title: 'Sistema ERP de Inventarios y Control Comercial – Ferretería y Fábrica “Aroma”',
    subtitle: 'Gestión de Operaciones e Ingresos-Egresos',
    description: 'Solución a medida para el control operativo, de producción y financiero de la ferretería y fábrica de calaminas "Aroma". Automatización del inventario en tiempo real, gestión de flujos de ventas y control estricto de ingresos y egresos, digitalizando procesos clave para mejorar la rentabilidad de la planta y de sucursales.',
  },
  {
    number: '05', type: 'IMPACTO SOCIAL', image: `${import.meta.env.BASE_URL}images/sedes-cochabamba.png`, width: 682, height: 400,
    alt: 'Inicio del sistema de registro de personas con discapacidad para SEDES Cochabamba',
    title: 'Sistema de Registro y Gestión Social – SEDES Cochabamba',
    subtitle: 'Digitalización Inclusiva y Seguridad de Datos',
    description: 'Plataforma digital segura y accesible para el registro y gestión de personas con discapacidad, desarrollada para el Servicio Departamental de Salud (SEDES) Cochabamba. Optimización del flujo de captura de datos, garantía de privacidad de información sensible y simplificación de procesos gubernamentales para el beneficio ciudadano.',
  },
];

export default function Portfolio() {
  return (
    <section id="proyectos" className="section-pad projects-section" aria-labelledby="proyectos-titulo">
      <div className="container-wide">
        <div className="section-heading"><div><p className="eyebrow">TRABAJO QUE HABLA POR SÍ SOLO</p><h2 id="proyectos-titulo" className="section-title mt-5">Proyectos <em>destacados.</em></h2></div><p className="section-copy max-w-md">Soluciones digitales creadas para desafíos y equipos distintos.</p></div>
        <div className="projects-grid mt-12">
          {projects.map(project => <article className="project-card" key={project.number}>
            <div className="project-image-wrap"><SmartSvgImage src={project.image} width={project.width} height={project.height} alt={project.alt} className="project-image" /><span className="project-index">{project.number} / {String(projects.length).padStart(2, '0')}</span></div>
            <div className="project-content"><p className="project-type">{project.type}</p><h3>{project.title}</h3><p className="project-subtitle">{project.subtitle}</p><p className="project-description">{project.description}</p><a href={whatsappUrl(`Hola, quiero conversar sobre un proyecto similar a ${project.title}.`)} target="_blank" rel="noopener noreferrer" className="project-action">Hablemos de un proyecto similar <ArrowUpRight size={18} aria-hidden="true" /></a></div>
          </article>)}
        </div>
      </div>
    </section>
  );
}

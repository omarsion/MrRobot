import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ScrollExperience from './components/ScrollExperience';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import About from './components/About';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen overflow-x-clip bg-bg-main text-text-main">
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <Navbar />
      <main id="contenido">
        <Hero />
        <ScrollExperience />
        <Services />
        <Portfolio />
        <About />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

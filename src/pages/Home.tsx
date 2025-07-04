
import Hero from '../components/Hero';

import Sponsors from '../components/Sponsors';
import Footer from '../components/Footer';
import Faq from '../components/Faq';
import PaymentSection from '../components/PaymentSection';
import OverlappingText from '../components/OverlappingText';

export default function Home() {


  return (
    <main className='min-h-screen bg-secondarygray relative'>
   
    <Hero />
    <Sponsors />
    <PaymentSection />
   
    <Faq />
    <Footer />
    <OverlappingText />
</main>


  );
}

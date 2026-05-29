import Hero from "./components/Hero";
import Tabs from "./components/Tabs";
import Footer from "./components/Footer";



export default function Home() {
  return (
    <main className="min-h-screen text-gray-900 dark:text-gray-100 transition-colors">
      <Hero />
      <Tabs />
      <Footer />
    </main>
  );
}
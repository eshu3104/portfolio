import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Tabs from "./components/Tabs";
import Footer from "./components/Footer";



export default function Home() {
  return (
    <main className="min-h-screen text-gray-900">
      <Navbar />
      <Hero />
      <Tabs />
      <Footer />
    </main>
  );
}
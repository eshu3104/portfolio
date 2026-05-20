import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen text-gray-900">
      <Navbar />
      <Hero />
    </main>
  );
}
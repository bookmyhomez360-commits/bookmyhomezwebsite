import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProperties from "@/components/FeaturedProperties";
import LocationShowcase from "@/components/LocationShowcase";
import Manifesto from "@/components/Manifesto";
import { ListPropertySection } from "@/components/ListProperty";
import { getCities } from "@/lib/api";

export default function Home({ onListClick }) {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    getCities()
      .then(setCities)
      .catch(() => {});
  }, []);

  return (
    <main>
      <Hero cities={cities} />
      <CategoryGrid />
      <FeaturedProperties />
      <LocationShowcase cities={cities} />
      <div id="manifesto">
        <Manifesto />
      </div>
      <ListPropertySection onOpen={onListClick} />
    </main>
  );
}

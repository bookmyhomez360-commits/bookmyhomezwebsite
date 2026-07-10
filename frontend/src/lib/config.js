export const BRAND = {
  name: "BookMyHomez",
  tagline: "Your Happy Home Partner",
  logo: "https://customer-assets.emergentagent.com/job_property-showcase-440/artifacts/5enm92pw_bmh%20logo.jpeg",
  whatsapp: "9916475749",
  whatsappIntl: "919916475749",
  instagram: "https://www.instagram.com/book.myhomez",
  facebook: "https://facebook.com",
  youtube: "https://youtube.com",
  email: "hello@bookmyhomez.com",
  address: "WeWork Prestige Central, Bengaluru, Karnataka 560001",
};

export const CATEGORY_IMAGES = {
  "homes-to-buy":
    "https://images.unsplash.com/photo-1564078516393-cf04bd966897?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsaXZpbmclMjByb29tJTIwaW50ZXJpb3IlMjBsdXh1cnl8ZW58MHx8fHwxNzgzNjc3Njk1fDA&ixlib=rb-4.1.0&q=85",
  rentals:
    "https://images.unsplash.com/photo-1719266084633-24981ecdc417?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBiYWxjb255JTIwdmlld3xlbnwwfHx8fDE3ODM2Nzc2OTV8MA&ixlib=rb-4.1.0&q=85",
  "short-stays":
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbSUyMGx1eHVyeXxlbnwwfHx8fDE3ODM2Nzc2OTV8MA&ixlib=rb-4.1.0&q=85",
  "land-plots":
    "https://images.unsplash.com/photo-1667344238075-c3742c5f86a1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMGxhbmQlMjBwbG90JTIwZ3JlZW4lMjBmaWVsZHxlbnwwfHx8fDE3ODM2Nzc2OTV8MA&ixlib=rb-4.1.0&q=85",
};

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZWFsJTIwZXN0YXRlJTIwbW9kZXJuJTIwaG9tZSUyMG5pZ2h0JTIwZXh0ZXJpb3J8ZW58MHx8fHwxNzgzNjc3Njk1fDA&ixlib=rb-4.1.0&q=85";

export function whatsappLink(text) {
  const msg = encodeURIComponent(text || "Hi BookMyHomez, I'd like to know more.");
  return `https://wa.me/${BRAND.whatsappIntl}?text=${msg}`;
}

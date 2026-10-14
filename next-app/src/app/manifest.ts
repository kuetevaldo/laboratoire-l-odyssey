import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Laboratoire L’Odyssey", short_name: "L’Odyssey", description: "Laboratoire médical à Douala", start_url: "/", display: "standalone", background_color: "#f7faf8", theme_color: "#19764b", lang: "fr", icons: [{ src: "/images/logo.jpg", sizes: "any", type: "image/jpeg" }] };
}

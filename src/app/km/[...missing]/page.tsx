import { notFound } from "next/navigation";

// Unknown URLs render this language's 404 page inside the site layout.
export default function Missing() {
  notFound();
}

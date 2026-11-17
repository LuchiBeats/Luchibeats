import type { Metadata } from "next";
import StudioScene from "@/components/StudioScene";
import HomeFX from "@/components/HomeFX";

// Hidden preview of the "studio as the menu" concept: not linked anywhere, not indexed.
export const metadata: Metadata = {
  title: "The Studio (preview)",
  robots: { index: false, follow: false },
};

export default function StudioPreviewPage() {
  return (
    <>
      <HomeFX />
      <StudioScene />
    </>
  );
}

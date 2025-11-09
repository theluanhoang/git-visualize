'use client';

import BottomCTAV3 from "@/components/common/home/BottomCTAV3";
import FeaturesV3 from "@/components/common/home/FeaturesV3";
import HeroV3 from "@/components/common/home/HeroV3";
import StatsSectionV3 from "@/components/common/home/StatsSectionV3";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <HeroV3 />
      <StatsSectionV3 />
      <FeaturesV3 />
      <BottomCTAV3 /> 
    </div>
  );
}
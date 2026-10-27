'use client';

import dynamic from 'next/dynamic';

const InstitutionalLandingPage = dynamic(
  () =>
    import('@/features/institutional').then((m) => m.InstitutionalLandingPage),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0D10]">
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#8AB5A8] animate-spin" />
      </div>
    ),
  }
);

export default function HomePage() {
  return <InstitutionalLandingPage />;
}

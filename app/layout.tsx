import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://romar-m.github.io'),
  title: 'Твоя служба | Направления и социальные льготы',
  description: 'Пять отдельных разделов о направлениях службы и социальной поддержке.',
  openGraph: {
    title: 'Твоя служба | Направления и социальные льготы',
    description: 'Пять направлений. Одна команда. Выберите свой путь.',
    type: 'website',
    images: [{ url: '/og.webp', width: 1536, height: 1024, alt: 'Твоя сила. Твой выбор.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Твоя служба | Направления и социальные льготы',
    description: 'Пять направлений. Одна команда. Выберите свой путь.',
    images: ['/og.webp'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* The local vinext preview serves the stylesheet from public/. */}
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/globals.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var key='service-theme';var saved=localStorage.getItem(key);var dark=window.matchMedia('(prefers-color-scheme: dark)').matches;var theme=saved||(dark?'dark':'light');var root=document.documentElement;root.dataset.theme=theme;root.style.colorScheme=theme;var link=document.createElement('link');link.rel='preload';link.as='image';link.href=theme==='dark'?'/flag-fabric-night.webp':'/flag-fabric-day.webp';document.head.appendChild(link);}catch(e){document.documentElement.dataset.theme='dark';}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

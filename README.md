# AudioVibes v2 🎵

**Free High-Quality Music Downloader | 320kbps MP3 Songs from JioSaavn**

AudioVibes is a modern web application that enables users to search, stream, and download high-quality music from JioSaavn. Built with Next.js 15 and optimized for performance, it provides a seamless music discovery and download experience with zero ads and no registration required.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## 🎯 What It Does

AudioVibes solves the problem of accessing high-quality music downloads by providing:

- **Music Search**: Search through millions of songs from JioSaavn's extensive catalog
- **Instant Streaming**: Play songs directly in your browser with built-in audio player
- **High-Quality Downloads**: Download songs in 320kbps MP3 format with proper metadata (artist, album, artwork)
- **Progressive Web App**: Install as a native-like app on any device for offline access
- **Download Tracking**: Monitor total downloads across all users via Supabase analytics

## 🔧 How It Works

### Architecture Overview

AudioVibes is a full-stack Next.js application using the App Router with server-side rendering and API routes.

```
User Interface (React) → Next.js API Routes → JioSaavn API → Audio Processing → Download
                                          ↓
                                   Supabase (Analytics)
```

### Core Technical Implementation

#### 1. **Music Search Flow**

- **Frontend**: User enters search query in [`SearchForm.tsx`](src/app/SearchForm.tsx)
- **API Route**: Request sent to [`/api/search/route.ts`](src/app/api/search/route.ts)
- **External API**: Makes proxied request to JioSaavn's web API with proper headers:
  ```typescript
  https://www.jiosaavn.com/api.php?__call=search.getResults
  ```
- **Response Caching**: Results cached for 1 hour using Next.js ISR (`revalidate: 3600`)
- **Data Transformation**: Raw API response flattened and normalized via `flattenSongsData()`
- **Display**: Results rendered in [`SearchResults.tsx`](src/components/SearchResults.tsx)

#### 2. **Audio Streaming**

- **Player Hook**: [`useAudioPlayer.tsx`](src/components/hooks/useAudioPlayer.tsx) manages HTML5 audio element
- **Audio Manager**: Singleton [`audioManager.ts`](src/components/hooks/audioManager.ts) ensures only one song plays at a time
- **Buffer Management**: Implements `canplaythrough` event to prevent playback until sufficient audio is buffered
- **Error Handling**: Comprehensive error handling for network issues, codec problems, and timeout scenarios
- **User Feedback**: Toast notifications for play/pause/error states using Sonner

#### 3. **Download & Audio Processing**

The download process involves multiple steps handled in [`PlayCard.tsx`](src/components/PlayCard.tsx):

**Step 1: Audio Fetching with Progress Tracking**
```typescript
// Fetch audio with ReadableStream for progress monitoring
const reader = response.body.getReader();
const chunks: Uint8Array[] = [];
let receivedLength = 0;

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  chunks.push(value);
  receivedLength += value.length;
  setDownloadProgress((receivedLength / contentLength) * 100);
}
```

**Step 2: FFmpeg Conversion**
- **FFmpeg Loading**: WebAssembly-based FFmpeg loaded on-demand via [`useFfmpeg.tsx`](src/components/hooks/useFfmpeg.tsx)
- **Format Conversion**: Audio transcoded to MP3 format with proper codec settings
- **In-Browser Processing**: All conversion happens client-side, no server processing required

**Step 3: Metadata Embedding**
- **ID3 Tags**: Song title, artist, album, and artwork embedded using `music-metadata-browser`
- **Sanitization**: Filenames sanitized to remove invalid characters
- **Album Art**: Cover image fetched and converted to JPEG buffer for embedding

**Step 4: Browser Download**
```typescript
const blob = new Blob([outputData], { type: 'audio/mpeg' });
const url = URL.createObjectURL(blob);
downloadBlob(url, `${sanitizedTitle}.mp3`);
```

#### 4. **Database Analytics**

- **Supabase Integration**: [`supabase.ts`](src/lib/supabase.ts) client for serverless PostgreSQL
- **Download Counter**: [`incrementDownloads()`](src/lib/actions.ts) increments global counter on each download
- **Server Actions**: Uses Next.js server actions for secure database operations

#### 5. **Performance Optimizations**

**Caching Strategy**
- API responses cached for 1 hour with stale-while-revalidate
- Static assets served with long-term cache headers
- Dynamic metadata for SEO with search query support

**Code Splitting**
- FFmpeg (large dependency) loaded only when download initiated
- Components lazy-loaded using React Suspense
- Separate loading states with [`SongCardListSkeleton`](src/app/loaders/loader.tsx)

**State Management**
- React hooks for local state (playback, downloads)
- Singleton audio manager prevents memory leaks
- Debounced search input via [`useDebounce.ts`](src/components/hooks/useDebounce.ts)

### 6. **SEO & Discoverability**

- **Dynamic Metadata**: Search-specific meta tags generated in [`page.tsx`](src/app/page.tsx)
- **Structured Data**: JSON-LD schema for WebApplication and Organization
- **Open Graph**: Rich social media previews with images
- **Sitemap**: Auto-generated [`sitemap.ts`](src/app/sitemap.ts)
- **Robots.txt**: Search results marked `noindex` to prevent thin content penalties

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | React framework with SSR, API routes, and ISR |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS 4 | Utility-first styling with JIT compiler |
| **UI Components** | Radix UI | Accessible, unstyled component primitives |
| **Audio Processing** | FFmpeg.wasm | Client-side audio conversion and metadata |
| **Database** | Supabase | PostgreSQL for analytics tracking |
| **State Management** | React Hooks | useState, useCallback, useRef, custom hooks |
| **HTTP Client** | Fetch API | Native browser networking with streams |
| **Deployment** | Vercel | Edge functions and CDN hosting |

## 📦 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm, yarn, pnpm, or bun
- (Optional) Supabase account for analytics

### Installation

```bash
# Clone the repository
git clone https://github.com/cygnuxxs/audiovibesv2.git
cd audiovibesv2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your SUPABASE_URL and SUPABASE_ANON_KEY
```

### Development

```bash
# Run development server
npm run dev

# Run with HTTPS (for PWA testing)
npm run dev-https
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/search/route.ts      # JioSaavn API proxy
│   ├── page.tsx                  # Homepage with SEO metadata
│   ├── SearchForm.tsx            # Search input component
│   └── layout.tsx                # Root layout with providers
│
├── components/
│   ├── PlayCard.tsx              # Play/download controls
│   ├── SearchResults.tsx         # Results grid display
│   ├── SongCard.tsx              # Individual song card
│   └── hooks/
│       ├── useAudioPlayer.tsx    # Audio playback logic
│       ├── useFfmpeg.tsx         # FFmpeg loading/conversion
│       ├── audioManager.ts       # Global audio singleton
│       └── useDebounce.ts        # Search input debouncing
│
└── lib/
    ├── actions.ts                # Server actions (DB operations)
    ├── supabase.ts               # Supabase client config
    └── utils.ts                  # Helper functions
```

## 🚀 Key Features Explained

### Progressive Web App (PWA)
- Service worker ([`sw.js`](public/sw.js)) for offline caching
- Web manifest ([`manifest.ts`](src/app/manifest.ts)) for installability
- Theme color adaptation based on user preference

### Dark Mode & Themes
- System preference detection
- Manual toggle via [`DarkModeToggler.tsx`](src/components/DarkModeToggler.tsx)
- Multiple color themes in [`theme-color-toggler.tsx`](src/components/theme-color-toggler.tsx)

### Accessibility
- Keyboard navigation support via [`useKeyPress.ts`](src/components/hooks/useKeyPress.ts)
- ARIA labels and semantic HTML
- Focus management for modals and dropdowns

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Ashok Atragadda (Cygnuxxs)**
- LinkedIn: [@ashok-atragadda](https://linkedin.com/in/ashok-atragadda)
- GitHub: [@cygnuxxs](https://github.com/cygnuxxs)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React framework with excellent DX
- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) - WebAssembly port of FFmpeg
- [Radix UI](https://www.radix-ui.com) - Accessible component primitives
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Supabase](https://supabase.com) - Open-source Firebase alternative

## 🔗 Links

- **Live Demo**: [https://audiovibes.vercel.app](https://audiovibes.vercel.app)
- **GitHub**: [https://github.com/cygnuxxs/audiovibesv2](https://github.com/cygnuxxs/audiovibesv2)

---

**Version**: 2.0 | **Status**: Active Development | Made with ❤️ by [Cygnuxxs](https://github.com/cygnuxxs)

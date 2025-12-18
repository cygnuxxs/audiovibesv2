import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'AudioVibes - Free Music Downloader | Download 320kbps MP3 Songs'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              marginBottom: 20,
              textShadow: '0 4px 6px rgba(0,0,0,0.3)',
            }}
          >
            🎵 AudioVibes
          </div>
          <div
            style={{
              fontSize: 40,
              marginBottom: 30,
              opacity: 0.95,
            }}
          >
            Download Free 320kbps MP3 Songs
          </div>
          <div
            style={{
              fontSize: 28,
              opacity: 0.9,
              maxWidth: '900px',
            }}
          >
            Stream & Download Millions of High-Quality Songs • No Ads • No Registration
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 24,
            opacity: 0.8,
          }}
        >
          audiovibes.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

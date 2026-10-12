import { ImageResponse } from 'next/og'

export const alt = 'Mukund Murali — Technical Product Manager & AI Product Builder'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: '#0a0a0a', color: '#fafafa' }}>
        <div style={{ fontSize: 28, color: '#a1a1aa', marginBottom: 24 }}>Technical Product Manager / AI Builder</div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>I build products for complex systems.</div>
        <div style={{ fontSize: 32, color: '#a1a1aa', marginTop: 40 }}>Mukund Murali · mukundmurali.in</div>
      </div>
    ),
    size,
  )
}

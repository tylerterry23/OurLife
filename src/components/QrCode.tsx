import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function QrCode({
  value,
  size = 180,
}: {
  value: string
  size?: number
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, { width: size, margin: 1 }).then((url) => {
      if (!cancelled) setDataUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [value, size])

  if (!dataUrl) return null

  return (
    <img
      src={dataUrl}
      alt="QR code to join"
      width={size}
      height={size}
      className="rounded-lg"
    />
  )
}

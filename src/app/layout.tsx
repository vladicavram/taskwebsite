import './globals.css'

export const metadata = {
  title: 'TaskSite',
  description: 'Minimal Task marketplace scaffold'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

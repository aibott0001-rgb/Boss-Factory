import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Boss Factory | KeyMaster Vault',
  description: 'Autonomous API Key Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <div className="fixed inset-0 bg-gradient-to-br from-background via-surface to-background opacity-50 pointer-events-none" />
        {children}
      </body>
    </html>
  )
}

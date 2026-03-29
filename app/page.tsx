import { AuthProvider } from '@/components/auth-provider'
import { AppShell } from '@/components/app-shell'

export default function Home() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

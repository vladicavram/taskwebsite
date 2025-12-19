import Header from '../../components/Header'
import Footer from '../../components/Footer'
import AuthProvider from '../../components/AuthProvider'
import ErrorBoundary from '../../components/ErrorBoundary'

type Props = { children: React.ReactNode; params: { locale: string } }

export default function LocaleLayout({ children, params }: Props) {
  return (
    <AuthProvider>
      <ErrorBoundary fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Header error - please refresh</div>}>
        <Header />
      </ErrorBoundary>
      <main style={{ minHeight: 'calc(100vh - 200px)', paddingTop: '82px' }}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <Footer />
    </AuthProvider>
  )
}

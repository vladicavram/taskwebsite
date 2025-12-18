import Header from '../../components/Header'
import Footer from '../../components/Footer'
import AuthProvider from '../../components/AuthProvider'

type Props = { children: React.ReactNode; params: { locale: string } }

export default function LocaleLayout({ children, params }: Props) {
  return (
    <AuthProvider>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 200px)', paddingTop: '82px' }}>
        {children}
      </main>
      <Footer />
    </AuthProvider>
  )
}

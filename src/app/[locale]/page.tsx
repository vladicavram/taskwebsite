'use client'
import Link from 'next/link'
import BookTaskButton from '../../components/BookTaskButton'
import PostTaskButton from '../../components/PostTaskButton'
import useLocale from '../../lib/locale'
import { Smile, BadgeCheck, Headphones, Hammer, Monitor, Truck, Sparkles, Wrench, Image as ImageIcon } from 'lucide-react'

export default function HomePage() {
  const { locale, t } = useLocale()
  return (
    <div>
      {/* Hero Section */}
      <section className="liquid-hero" style={{
        padding: '100px 24px 80px',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', color: 'var(--text)', fontWeight: 700 }}>
            {t('home.hero') || 'Book trusted help for home tasks'}
          </h1>
          <p style={{ fontSize: '1.3rem', marginBottom: '40px', opacity: 0.95, maxWidth: '700px', margin: '0 auto 40px' }}>
            {t('home.heroSubtitle') || 'Same day service. Backed by our Happiness Pledge.'}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <BookTaskButton />
              <PostTaskButton style={{
                fontSize: '1.1rem',
                padding: '16px 40px',
                fontWeight: 600,
                minWidth: '220px'
              }} />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{
        background: 'white',
        borderBottom: '1px solid var(--border)',
        padding: '40px 24px'
      }}>
        <div className="container">
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: 700,
                color: 'var(--accent)',
                marginBottom: '8px'
              }}>
                3.4M+
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {t('home.stats.furniture') || 'Furniture Assemblies'}
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: 700,
                color: 'var(--accent)',
                marginBottom: '8px'
              }}>
                1.5M+
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {t('home.stats.moving') || 'Moving Tasks'}
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: 700,
                color: 'var(--accent)',
                marginBottom: '8px'
              }}>
                890K+
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {t('home.stats.cleaning') || 'Homes Cleaned'}
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: 700,
                color: 'var(--accent)',
                marginBottom: '8px'
              }}>
                700K+
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {t('home.stats.repairs') || 'Home Repairs'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Projects with Pricing */}
      <section className="container" style={{ marginTop: '64px', marginBottom: '64px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '16px', fontSize: '2.25rem' }}>
          {t('home.popularTitle') || 'Popular Projects'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '48px', fontSize: '1.1rem' }}>
          {t('home.popularSubtitle') || 'Get help fast with same-day service'}
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px'
        }}>
          {[
            { Icon: Hammer, name: t('home.project.furnitureAssembly') || 'Furniture Assembly', price: 90 },
            { Icon: Monitor, name: t('home.project.mountTV') || 'Mount a TV', price: 120 },
            { Icon: Truck, name: t('home.project.moving') || 'Help Moving', price: 110 },
            { Icon: Sparkles, name: t('home.project.cleaning') || 'Home Cleaning', price: 90 },
            { Icon: Wrench, name: t('home.project.repairs') || 'Minor Repairs', price: 130 },
            { Icon: ImageIcon, name: t('home.project.hangPictures') || 'Hang Pictures', price: 110 },
          ].map((project) => (
            <Link 
              key={project.name}
              href={`/${locale}/tasks`}
              className="card" 
              style={{ 
                textAlign: 'center', 
                padding: '32px 24px',
                textDecoration: 'none',
                display: 'block',
                position: 'relative'
              }}
            >
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <project.Icon size={36} color="var(--accent)" />
              </div>
              <h3 style={{ margin: '0 0 12px 0', color: 'var(--text)', fontSize: '1.25rem' }}>
                {project.name}
              </h3>
              <div style={{ 
                color: 'var(--accent)', 
                fontWeight: 600,
                fontSize: '1.1rem'
              }}>
                {t('home.project.startingAt') || 'Starting at'} {project.price} MDL
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: 'white', padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '56px', fontSize: '2.25rem' }}>
            {t('home.howItWorksTitle') || 'How it works'}
          </h2>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '48px',
            marginBottom: '48px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'var(--accent-light)', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--accent)'
              }}>1</div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>{t('home.step1.title') || 'Choose a Tasker'}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                {t('home.step1.text') || 'By price, skills, and reviews'}
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'var(--accent-light)', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--accent)'
              }}>2</div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>{t('home.step2.title') || 'Schedule a Tasker'}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                {t('home.step2.text') || 'As early as today'}
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: 'var(--accent-light)', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--accent)'
              }}>3</div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>{t('home.step3.title') || 'Chat, pay, tip, review'}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                {t('home.step3.text') || 'All in one place'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Tasker CTA */}
      <section className="liquid-hero" style={{
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--text)' }}>
            {t('home.earnTitle') || 'Earn money your way'}
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '32px', color: 'var(--text-secondary)' }}>
            {t('home.earnSubtitle') || 'Be your own boss. Work when you want, set your own rates, and build your business.'}
          </p>
          <Link href={`/${locale}/tasks`} className="btn" style={{ 
            background: 'var(--accent)',
            color: 'white',
            fontSize: '1.1rem',
            padding: '16px 40px',
            fontWeight: 600
          }}>
            {t('home.becomeTasker') || 'Become a Tasker'}
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'var(--bg)',
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ marginBottom: '16px', fontSize: '2.25rem' }}>{t('home.ctaTitle') || 'Ready to Get Started?'}</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
            {t('home.ctaSubtitle') || 'Join thousands of people getting things done every day'}
          </p>
          <PostTaskButton label={t('home.ctaButton') || 'Post Your First Task'} style={{ fontSize: '1.1rem', padding: '16px 40px', fontWeight: 600 }} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="container" style={{ marginTop: '80px', marginBottom: '80px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '56px', fontSize: '2.25rem' }}>
          {t('home.testimonialsTitle') || 'See what happy customers are saying'}
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '32px'
        }}>
          {[
            {
              name: 'Elizabeth P.',
              task: 'Furniture Assembly',
              review: 'Assembled the IKEA drawer chest for me in less than 30 minutes, and fixed a drawer on an already assembled desk. Highly recommend!',
              rating: 5
            },
            {
              name: 'Tiffany B.',
              task: 'Furniture Assembly',
              review: 'Did an awesome job assembling crib and dresser for nursery. Really appreciate this! Cleaned up the area after work and organized the boxes.',
              rating: 5
            },
            {
              name: 'Amanda L.',
              task: 'Home Repairs',
              review: 'Great with communication, was fast, professional and did a fantastic job. Even came back to do a second layer to make it look seamless.',
              rating: 5
            }
          ].map((testimonial, i) => (
            <div 
              key={i}
              className="card" 
              style={{ padding: '32px' }}
            >
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--accent)'
                }}>
                  {testimonial.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{testimonial.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {testimonial.task}
                  </div>
                </div>
              </div>
              <div style={{ 
                color: 'var(--accent)',
                marginBottom: '12px',
                fontSize: '1.25rem'
              }}>
                {'⭐'.repeat(testimonial.rating)}
              </div>
              <p style={{ 
                color: 'var(--text-secondary)',
                lineHeight: '1.7',
                margin: 0
              }}>
                "{testimonial.review}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section style={{ background: 'var(--bg-secondary)', padding: '80px 24px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '56px', fontSize: '2.25rem' }}>
            {t('home.guaranteeTitle') || 'Your satisfaction, guaranteed'}
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '48px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px',
                height: '80px',
                background: 'var(--accent)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Smile size={36} color="#fff" />
              </div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>{t('home.happiness.title') || 'Happiness Pledge'}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                {t('home.happiness.text') || "If you're not satisfied, we'll work to make it right."}
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px',
                height: '80px',
                background: 'var(--accent)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <BadgeCheck size={36} color="#fff" />
              </div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>{t('home.vetted.title') || 'Vetted Taskers'}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                {t('home.vetted.text') || 'Taskers are always background checked before joining the platform.'}
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px',
                height: '80px',
                background: 'var(--accent)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Headphones size={36} color="#fff" />
              </div>
              <h3 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>{t('home.support.title') || 'Dedicated Support'}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                {t('home.support.text') || 'Friendly service when you need us – every day of the week.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

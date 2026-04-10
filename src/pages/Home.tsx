export default function Home() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Scavender</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>Building the future of exploration...</p>
      <a 
        href="/sandbox" 
        style={{
          padding: '12px 24px',
          background: '#333',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          border: '1px solid #444',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#444'}
        onMouseOut={(e) => e.currentTarget.style.background = '#333'}
      >
        Enter Sandbox
      </a>
    </div>
  )
}

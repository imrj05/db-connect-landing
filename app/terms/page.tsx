import React from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';

export const metadata = {
  title: 'Terms of Service | DBConnect',
  description: 'Terms of Service for DBConnect.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <div className="section-container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Terms of Service
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose" style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>
              1. Acceptance of Terms
            </h2>
            <p style={{ marginBottom: '16px' }}>
              By accessing or using DBConnect ("the Software"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use the Software.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>
              2. License
            </h2>
            <p style={{ marginBottom: '16px' }}>
              DBConnect is open-source software licensed under the MIT License. You are free to use, modify, and distribute the Software in accordance with the terms of the MIT License, which is available in the GitHub repository.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>
              3. Disclaimer of Warranties
            </h2>
            <p style={{ marginBottom: '16px' }}>
              The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. 
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>
              4. Limitation of Liability
            </h2>
            <p style={{ marginBottom: '16px' }}>
              In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings in the Software. 
            </p>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>
              5. User Responsibilities
            </h2>
            <p style={{ marginBottom: '16px' }}>
              You are entirely responsible for the security and integrity of the database connections, credentials, and actions you perform using DBConnect. We cannot recover deleted data or lost passwords resulting from your use of the application.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

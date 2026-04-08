import React from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';

export const metadata = {
  title: 'Privacy Policy | DBConnect',
  description: 'Privacy Policy for DBConnect.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '100vh', background: 'var(--bg-base)' }}>
        <div className="section-container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose" style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>
              1. Introduction
            </h2>
            <p style={{ marginBottom: '16px' }}>
              DBConnect ("we", "our", or "us") respects your privacy. This Privacy Policy explains our practices regarding the collection, use, and disclosure of information when you use our desktop application and website.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>
              2. Data Collection
            </h2>
            <p style={{ marginBottom: '16px' }}>
              Because DBConnect is a native desktop application, <strong>we do not collect, transmit, or store any of your database credentials, connection strings, or query data</strong> on our servers. All database connections are made directly from your local machine to your database server.
            </p>
            <p style={{ marginBottom: '16px' }}>
              The only data we collect is minimal anonymous telemetry (such as crash reports and basic usage metrics) to help us improve the application if you explicitly opt-in during installation.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>
              3. Analytics & Telemetry
            </h2>
            <p style={{ marginBottom: '16px' }}>
              We use standard, privacy-friendly analytics on our landing page. This does not track individual users across the web or sell data to third parties. Our desktop application allows you to toggle telemetry completely off via the Settings menu.
            </p>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>
              4. Contact Us
            </h2>
            <p style={{ marginBottom: '16px' }}>
              If you have any questions about this Privacy Policy, please contact us by opening an issue on our GitHub repository.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

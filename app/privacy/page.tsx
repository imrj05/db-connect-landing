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
            <main className="legal-shell pt-32">
                <div className="section-container max-w-3xl">
                    <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-foreground">
                        Privacy Policy
                    </h1>
                    <p className="mb-10 text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                    <div className="legal-prose">
                        <h2>
                            1. Introduction
                        </h2>
                        <p>
                            DBConnect (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy. This Privacy Policy explains our practices regarding the collection, use, and disclosure of information when you use our desktop application and website.
                        </p>

                        <h2>
                            2. Data Collection
                        </h2>
                        <p>
                            Because DBConnect is a native desktop application, <strong>we do not collect, transmit, or store any of your database credentials, connection strings, or query data</strong> on our servers. All database connections are made directly from your local machine to your database server.
                        </p>
                        <p>
                            The only data we collect is minimal anonymous telemetry (such as crash reports and basic usage metrics) to help us improve the application if you explicitly opt-in during installation.
                        </p>

                        <h2>
                            3. Analytics & Telemetry
                        </h2>
                        <p>
                            We use standard, privacy-friendly analytics on our landing page. This does not track individual users across the web or sell data to third parties. Our desktop application allows you to toggle telemetry completely off via the Settings menu.
                        </p>

                        <h2>
                            4. Contact Us
                        </h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us by opening an issue on our GitHub repository.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

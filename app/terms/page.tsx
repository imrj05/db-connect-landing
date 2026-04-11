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
            <main className="legal-shell pt-32">
                <div className="section-container max-w-3xl">
                    <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-foreground">
                        Terms of Service
                    </h1>
                    <p className="mb-10 text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                    <div className="legal-prose">
                        <h2>
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing or using DBConnect (&quot;the Software&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use the Software.
                        </p>

                        <h2>
                            2. License
                        </h2>
                        <p>
                            DBConnect is open-source software licensed under the MIT License. You are free to use, modify, and distribute the Software in accordance with the terms of the MIT License, which is available in the GitHub repository.
                        </p>

                        <h2>
                            3. Disclaimer of Warranties
                        </h2>
                        <p>
                            The Software is provided &quot;as is&quot;, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement.
                        </p>

                        <h2>
                            4. Limitation of Liability
                        </h2>
                        <p>
                            In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings in the Software.
                        </p>

                        <h2>
                            5. User Responsibilities
                        </h2>
                        <p>
                            You are entirely responsible for the security and integrity of the database connections, credentials, and actions you perform using DBConnect. We cannot recover deleted data or lost passwords resulting from your use of the application.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

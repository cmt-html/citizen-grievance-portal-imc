import './globals.scss';
import Navbar from '@/components/Navbar';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800'] });

export const metadata = {
  title: 'Citizen Grievance Portal',
  description: 'Submit and track civic issues effectively.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} min-h-screen flex flex-col`}>
        <div className="top-strip">
          <div className="container top-strip-content">
            <p>Citizen Grievance Portal - Proof of Concept (IMC)</p>
            <p>Demo Mode: Mobile & OTP are simulated</p>
          </div>
        </div>

        <Navbar />

        <main className="flex-grow">{children}</main>

        <footer className="site-footer">
          <div className="container footer-content">
            <p>© {new Date().getFullYear()} Indore Municipal Corporation - Citizen Grievance Portal</p>
            <p>POC for transparent complaint tracking, SLA compliance, and accountability.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}

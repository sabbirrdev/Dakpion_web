import { Route, Routes } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { HomePage } from './pages/HomePage';
import { ComposePage } from './pages/ComposePage';
import { LetterSentPage } from './pages/LetterSentPage';
import { EnvelopePage } from './pages/EnvelopePage';
import { PricingPage } from './pages/PricingPage';
import { SignInPage } from './pages/SignInPage';
import { InboxPage } from './pages/InboxPage';
import { AccountPage } from './pages/AccountPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { PaymentResultPage } from './pages/PaymentResultPage';

import { AdminPage } from './pages/AdminPage';
import { TrackingPage } from './pages/TrackingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/write" element={<ComposePage />} />
        <Route path="/sent/:id" element={<LetterSentPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/track" element={<TrackingPage />} />
        <Route path="/track/:trackingCode" element={<TrackingPage />} />
        <Route path="/payment-success" element={<PaymentResultPage result="success" />} />
        <Route path="/payment-fail" element={<PaymentResultPage result="fail" />} />
        <Route path="/payment-cancel" element={<PaymentResultPage result="cancel" />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignInPage />} />
        <Route path="/register" element={<SignInPage />} />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <InboxPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SYSTEM_ADMIN', 'MODERATOR', 'DEVELOPER']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      {/* The recipient's envelope-opening experience is intentionally
          outside the standard header/footer chrome for full-bleed staging. */}
      <Route path="/letter/:id" element={<EnvelopePage />} />
      <Route path="/l/:id" element={<EnvelopePage />} />
    </Routes>
  );
}

export default App;

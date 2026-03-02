import { useState } from 'react';

export function SecureCheckout() {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<{
    cardName?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setCardName(value);
    if (errors.cardName) setErrors((prev) => ({ ...prev, cardName: undefined }));
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9\s]/g, '');
    const formatted = formatCardNumber(digitsOnly);
    setCardNumber(formatted);
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: undefined }));
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
    if (errors.expiryDate) setErrors((prev) => ({ ...prev, expiryDate: undefined }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCvv(value);
    if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: undefined }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!cardName.trim()) newErrors.cardName = 'Cardholder name is required.';
    const rawCard = cardNumber.replace(/\s/g, '');
    if (!rawCard) newErrors.cardNumber = 'Card number is required.';
    else if (rawCard.length !== 16) newErrors.cardNumber = 'Card number must be 16 digits.';
    if (!expiryDate) {
      newErrors.expiryDate = 'Expiry date is required.';
    } else {
      const [mm, yy] = expiryDate.split('/');
      const month = parseInt(mm, 10);
      const year = parseInt('20' + yy, 10);
      const now = new Date();
      const expiry = new Date(year, month - 1);
      if (month < 1 || month > 12) newErrors.expiryDate = 'Invalid month.';
      else if (expiry < new Date(now.getFullYear(), now.getMonth())) newErrors.expiryDate = 'Card has expired.';
    }
    if (!cvv) newErrors.cvv = 'CVV is required.';
    else if (cvv.length !== 3) newErrors.cvv = 'CVV must be 3 digits.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayNow = async () => {
    setApiError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await fetch('https://securepay.free.beeceptor.com/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardName,
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryDate,
          cvv,
          amount: 14900,
          currency: 'INR',
        }),
      });
      if (response.ok) {
        setPaymentSuccess(true);
      } else {
        const data = await response.json().catch(() => ({}));
        setApiError(data?.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, position: 'relative', width: '100%', maxWidth: '390px', minHeight: '100vh', background: '#F6F6F8', margin: '0 auto' }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '884px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '358px', boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Payment Successful!</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>Your order has been placed successfully.</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 700, color: '#135BEC', marginBottom: '28px' }}>₹14,900</p>
            <button
              onClick={() => setPaymentSuccess(false)}
              style={{ width: '100%', height: '56px', background: '#135BEC', color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, isolation: 'isolate', position: 'relative', width: '100%', maxWidth: '390px', minHeight: '100vh', background: '#F6F6F8', margin: '0 auto' }}>

      <header style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', gap: '67.7px', width: '100%', height: '65px', background: 'rgba(246,246,248,0.8)', borderBottom: '1px solid #E2E8F0', backdropFilter: 'blur(6px)', flexShrink: 0, alignSelf: 'stretch', zIndex: 2 }}>
        <button style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 0, width: '40px', height: '40px', borderRadius: '9999px', border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 0, width: '11.77px', height: '20px' }}>
            <svg width="11.77" height="20" viewBox="0 0 12 20" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="10 18 2 10 10 2"/>
            </svg>
          </div>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, width: '142.64px', height: '28px' }}>
          <span style={{ width: '142.64px', height: '28px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '18px', lineHeight: '28px', display: 'flex', alignItems: 'center', letterSpacing: '-0.45px', color: '#0F172A' }}>
            Secure Checkout
          </span>
        </div>
        <div style={{ width: '40px', height: '40px', flexShrink: 0 }} />
      </header>

      <main style={{ width: '100%', flex: 1, position: 'relative', paddingBottom: '105px' }}>

        <section style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '16px', isolation: 'isolate', position: 'absolute', left: '16px', right: '16px', top: '24px', background: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, background: 'rgba(255,255,255,0.002)', boxShadow: '0px 4px 6px -1px rgba(0,0,0,0.05), 0px 2px 4px -2px rgba(0,0,0,0.05)', borderRadius: '12px', zIndex: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 0, gap: '16px', width: '100%', zIndex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: 0, width: '80px', height: '80px', background: '#F1F5F9', borderRadius: '8px', flexShrink: 0 }}>
              <img
                src="data:image/jpeg;base64,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"
                alt="Premium Wireless Headphones"
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, gap: '4px', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, alignSelf: 'stretch' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '16px', letterSpacing: '0.6px', textTransform: 'uppercase', color: '#64748B' }}>Item Summary</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, alignSelf: 'stretch' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '16px', lineHeight: '20px', color: '#0F172A' }}>Premium Wireless Headphones</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, alignSelf: 'stretch' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px', lineHeight: '28px', color: '#135BEC' }}>₹14,900</span>
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', position: 'absolute', height: '28px', left: '16px', right: '16px', top: '182px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px', lineHeight: '28px', letterSpacing: '-0.45px', color: '#0F172A' }}>Card Payment</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', padding: 0, gap: '8px' }}>
            <svg width="16.67" height="13.33" viewBox="0 0 20 16" fill="none">
              <rect x="1" y="1" width="18" height="14" rx="2" stroke="#94A3B8" strokeWidth="1.5"/>
              <rect x="1" y="5" width="18" height="3" fill="#94A3B8"/>
            </svg>
            <svg width="15.83" height="15" viewBox="0 0 16 15" fill="none">
              <path d="M14 5H2a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 2 15h12a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14 5z" stroke="#94A3B8" strokeWidth="1.2"/>
              <circle cx="12" cy="9.5" r="1" fill="#94A3B8"/>
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, gap: '16px', position: 'absolute', left: '16px', right: '16px', top: '226px' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, gap: '6px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 0 0 4px', width: '100%' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#334155' }}>Cardholder Name</label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', padding: '17px 16px', boxSizing: 'border-box', width: '100%', height: '56px', background: '#FFFFFF', border: `1px solid ${errors.cardName ? '#ef4444' : '#E2E8F0'}`, borderRadius: '12px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Enter name on card"
                value={cardName}
                onChange={handleCardNameChange}
                style={{ width: '100%', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '19px', color: '#0F172A', background: 'transparent' }}
              />
            </div>
            {errors.cardName && <p style={{ margin: 0, fontSize: '12px', color: '#ef4444', fontFamily: 'Inter, sans-serif' }}>{errors.cardName}</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, gap: '6px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 0 0 4px', width: '100%' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#334155' }}>Card Number</label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 0, isolation: 'isolate', width: '100%', height: '56px', position: 'relative' }}>
              <div style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '17px 48px 17px 16px', width: '100%', height: '56px', background: '#FFFFFF', border: `1px solid ${errors.cardNumber ? '#ef4444' : '#E2E8F0'}`, borderRadius: '12px', zIndex: 0 }}>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  style={{ width: '100%', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '19px', color: '#0F172A', background: 'transparent' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, position: 'absolute', width: '20px', height: '20px', right: '16px', top: '18px', zIndex: 1 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8">
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/>
                  <circle cx="12" cy="12" r="2" fill="#94A3B8" stroke="none"/>
                  <path d="M8.5 8.5a5 5 0 0 0 0 7" strokeLinecap="round"/>
                  <path d="M15.5 8.5a5 5 0 0 1 0 7" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            {errors.cardNumber && <p style={{ margin: 0, fontSize: '12px', color: '#ef4444', fontFamily: 'Inter, sans-serif' }}>{errors.cardNumber}</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', padding: 0, gap: '16px', width: '100%' }}>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, gap: '6px', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 0 0 4px', width: '100%' }}>
                <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#334155' }}>Expiry Date</label>
              </div>
              <div style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '17px 16px', width: '100%', height: '56px', background: '#FFFFFF', border: `1px solid ${errors.expiryDate ? '#ef4444' : '#E2E8F0'}`, borderRadius: '12px' }}>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  style={{ width: '100%', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '19px', color: '#0F172A', background: 'transparent' }}
                />
              </div>
              {errors.expiryDate && <p style={{ margin: 0, fontSize: '12px', color: '#ef4444', fontFamily: 'Inter, sans-serif' }}>{errors.expiryDate}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, gap: '6px', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 0 0 4px', width: '100%' }}>
                <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#334155' }}>CVV</label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 0, isolation: 'isolate', width: '100%', height: '56px', position: 'relative' }}>
                <div style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '17px 48px 17px 16px', width: '100%', height: '56px', background: '#FFFFFF', border: `1px solid ${errors.cvv ? '#ef4444' : '#E2E8F0'}`, borderRadius: '12px', zIndex: 0 }}>
                  <input
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    style={{ width: '100%', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: '19px', color: '#0F172A', background: 'transparent' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 0, position: 'absolute', width: '11.67px', height: '11.67px', right: '16px', top: '22px', zIndex: 1 }}>
                  <svg width="11.67" height="11.67" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round"/>
                    <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              {errors.cvv && <p style={{ margin: 0, fontSize: '12px', color: '#ef4444', fontFamily: 'Inter, sans-serif' }}>{errors.cvv}</p>}
            </div>

          </div>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: '8px 0', gap: '7.99px', width: '100%', height: '32px' }}>
            <svg width="9.33" height="12.25" viewBox="0 0 10 13" fill="none">
              <rect x="1" y="5.5" width="8" height="7" rx="1" stroke="#16A34A" strokeWidth="1.5"/>
              <path d="M3 5.5V3.5a2 2 0 0 1 4 0v2" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '16px', letterSpacing: '-0.3px', textTransform: 'uppercase', color: '#64748B' }}>
              Your payment is secured with 256-bit encryption
            </span>
          </div>

          {apiError && (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '8px 14px', gap: '8px', width: '100%', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#dc2626' }}>{apiError}</span>
            </div>
          )}

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 0, gap: '8px', position: 'absolute', left: '16px', right: '16px', top: '588px' }}>
          <button style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 0, gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', lineHeight: '20px', textAlign: 'center', color: '#135BEC' }}>Other Payment Methods</span>
            <svg width="4.32" height="7" viewBox="0 0 5 8" fill="none">
              <path d="M1 1l3 3-3 3" stroke="#135BEC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 32px', width: '100%' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '10px', lineHeight: '15px', textAlign: 'center', color: '#94A3B8' }}>
              By tapping Pay Now, you agree to our Terms of Service and Privacy Policy.
            </span>
          </div>
        </div>

      </main>

      <div style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '16px 16px 32px', position: 'absolute', left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.9)', borderTop: '1px solid #E2E8F0', backdropFilter: 'blur(12px)', zIndex: 1 }}>
        <button
          onClick={handlePayNow}
          disabled={isLoading}
          style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 0, gap: '8px', isolation: 'isolate', width: '100%', height: '56px', background: isLoading ? '#93c5fd' : '#135BEC', borderRadius: '12px', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', position: 'relative' }}
        >
          <div style={{ position: 'absolute', height: '56px', left: 0, right: 0, top: 0, background: 'rgba(255,255,255,0.002)', boxShadow: '0px 10px 15px -3px rgba(19,91,236,0.2), 0px 4px 6px -4px rgba(19,91,236,0.2)', borderRadius: '12px', zIndex: 0 }} />
          {isLoading ? (
            <>
              <svg style={{ animation: 'spin 0.7s linear infinite', width: 20, height: 20, zIndex: 1 }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                <path style={{ opacity: 0.75 }} fill="white" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px', color: '#FFFFFF', zIndex: 1 }}>Processing...</span>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 0, zIndex: 1 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px', lineHeight: '28px', color: '#FFFFFF' }}>Pay Now</span>
              </div>
              <div style={{ width: '4px', height: '4px', background: 'rgba(255,255,255,0.4)', borderRadius: '9999px', zIndex: 2 }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 0, zIndex: 3 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '18px', lineHeight: '28px', color: '#FFFFFF' }}>₹14,900</span>
              </div>
            </>
          )}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

    </div>
  );
}

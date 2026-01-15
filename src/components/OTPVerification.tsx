import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, RefreshCw, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { generateOTP, validateOTP, formatPhoneNumber } from '@/utils/validation';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
  onRestart: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  onVerificationSuccess,
  onBack,
  onRestart
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [attempts, setAttempts] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [mockOTP] = useState(generateOTP());

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto-focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedData.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);

      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex(val => val === '');
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      setTimeout(() => {
        if (inputRefs.current[focusIndex]) {
          inputRefs.current[focusIndex]?.focus();
        }
      }, 0);
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input
      if (value && index < 5) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 0);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    handleInputChange(0, pastedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    const validation = validateOTP(otpString);

    if (!validation.isValid) {
      setError(validation.error || 'Invalid OTP format');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (otpString === mockOTP) {
        setIsVerified(true);
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        setAttempts(attempts + 1);
        if (attempts >= 2) {
          setError('Too many failed attempts. Please restart the process.');
          setTimeout(() => {
            onRestart();
          }, 2000);
        } else {
          setError(`Incorrect OTP. ${3 - attempts - 1} attempts remaining. For testing, use: ${mockOTP}`);
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;

    setIsResending(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setTimeLeft(60);
      setAttempts(0);
      setIsResending(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageSquare size={40} className="text-elkawera-accent" />
            <h1 className="text-2xl font-display font-bold text-white uppercase tracking-tight">
              Verify Your Phone
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Enter the 6-digit code sent to<br />
            <span className="text-elkawera-accent font-bold">
              {formatPhoneNumber(phoneNumber)}
            </span>
          </p>
        </div>

        {isVerified ? (
          <div className="text-center py-8">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Verification Successful!</h2>
            <p className="text-gray-400">Redirecting to complete registration...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className={`p-3 rounded-lg mb-6 text-sm text-center flex items-center gap-2 ${error.includes('restart')
                ? 'bg-red-500/10 border border-red-500/50 text-red-500'
                : 'bg-yellow-500/10 border border-yellow-500/50 text-yellow-500'
                }`}>
                {error.includes('restart') ? <XCircle size={16} /> : <Clock size={16} />}
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-4 font-bold tracking-wider text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 bg-black/50 border border-white/20 rounded-xl text-white text-center text-xl font-bold focus:border-elkawera-accent focus:outline-none transition-colors"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 py-3 bg-black/50 border border-white/20 text-gray-400 font-bold uppercase rounded-xl hover:border-white transition-all flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  <ArrowLeft size={18} /> Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-elkawera-accent text-black font-bold uppercase rounded-xl hover:bg-white transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,255,157,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || otp.join('').length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm mb-3">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={timeLeft > 0 || isResending}
                className="text-elkawera-accent hover:underline font-bold text-sm disabled:text-gray-500 disabled:no-underline flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={16} className={isResending ? 'animate-spin' : ''} />
                {isResending ? 'Sending...' : timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : 'Resend Code'}
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-300 text-center">
              <strong>Testing Mode:</strong> OTP is {mockOTP}
            </div>
          </>
        )}
      </div>
    </div>
  );
};


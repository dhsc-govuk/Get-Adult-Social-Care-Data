'use client';
import { useEffect, useState } from 'react';

export default function ServiceBusyNotice() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const onBusy = (event: Event) => {
      const { status, seconds } = (
        event as CustomEvent<{ status: number; seconds?: number }>
      ).detail;
      setMessage(
        status === 429 && seconds
          ? `Too many requests. Please wait ${seconds} seconds before trying again.`
          : 'The service is busy. Please try again shortly.'
      );
    };
    window.addEventListener('gascd-service-busy', onBusy);
    return () => window.removeEventListener('gascd-service-busy', onBusy);
  }, []);
  if (!message) return null;
  return (
    <div
      className="govuk-notification-banner"
      role="alert"
      aria-label="Service availability"
    >
      <div className="govuk-notification-banner__content">
        <p className="govuk-body">{message}</p>
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          onClick={() => setMessage('')}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

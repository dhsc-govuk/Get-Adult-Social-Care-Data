import CookiesService from '@/services/cookies/CookiesService';

describe('CookiesService', () => {
  it('Sets the consent cookie to be true', () => {
    CookiesService.setConsentCookieTrue();
    expect(document.cookie).toBe('GASCDConsentGDPR=true');
  });

  it('Sets the consent cookie to be false', () => {
    document.cookie = 'ai_session=some_value';
    expect(document.cookie).toBe(
      'GASCDConsentGDPR=true; ai_session=some_value'
    );
    CookiesService.setConsentCookieFalse();
    expect(document.cookie).toBe('GASCDConsentGDPR=false');
  });
});

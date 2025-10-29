import CookiesService from '@/services/cookies/CookiesService';

describe('CookiesService', () => {
  it('Sets the consent cookie to be true', () => {
    CookiesService.setConsentCookie('true');
    expect(document.cookie).toBe('GASCDConsentGDPR=true');
  });

  it('Sets the consent cookie to be false', () => {
    CookiesService.setConsentCookie('false');
    expect(document.cookie).toBe('GASCDConsentGDPR=false');
  });

  it('Clears analytics cookies', () => {
    document.cookie = 'ai_session=some_value';
    expect(document.cookie).toBe(
      'GASCDConsentGDPR=false; ai_session=some_value'
    );

    CookiesService.removeAnalyticsCookies();
    expect(document.cookie).toBe('GASCDConsentGDPR=false');
  });
});

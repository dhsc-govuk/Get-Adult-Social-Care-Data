import CookiesService from '@/services/cookies/CookiesService';

describe('CookiesService', () => {
  it('Sets the consent cookie to be true', () => {
    CookiesService.setConsentCookie('true');
    expect(document.cookie).toBe('GASCDConsentGDPR=true');
  });

  it('Clears analytics cookies', () => {
    document.cookie = 'ai_session=some_value';
    expect(document.cookie).toBe(
      'GASCDConsentGDPR=true; ai_session=some_value'
    );

    CookiesService.removeAnalyticsCookies();
    expect(document.cookie).toBe('GASCDConsentGDPR=true');
  });
});

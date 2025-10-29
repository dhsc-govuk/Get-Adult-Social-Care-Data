import Cookies from 'js-cookie';
import { COOKIE_CONSENT_NAME } from '@/constants';

class CookiesService {
  public static setConsentCookie(value: string): void {
    Cookies.set(COOKIE_CONSENT_NAME, value, { expires: 365 });
  }

  public static removeAnalyticsCookies(): void {
    Cookies.remove('ai_session');
    Cookies.remove('ai_user');
  }
}

export default CookiesService;

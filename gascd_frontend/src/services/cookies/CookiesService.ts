import Cookies from 'js-cookie';
import { COOKIE_CONSENT_NAME } from '@/constants';
import AnalyticsService from '../analytics/analyticsService';

class CookiesService {
  public static setConsentCookieTrue(): void {
    Cookies.set(COOKIE_CONSENT_NAME, 'true', { expires: 365 });
  }

  public static setConsentCookieFalse(): void {
    Cookies.set(COOKIE_CONSENT_NAME, 'false', { expires: 365 });
    Cookies.remove('ai_session');
    Cookies.remove('ai_user');
    AnalyticsService.trackOptOut();
  }
}

export default CookiesService;

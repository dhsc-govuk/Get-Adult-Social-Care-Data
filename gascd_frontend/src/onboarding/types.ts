export type WhoamiFormData = {
  id: string | null;
};

export type LookupEmailFormData = {
  regmail: string | null;
};

export type SignupLAFormData = {
  regfullname: string | null;
  regla: string | null;
  regorgname: string | null;
  regrole: string | null;
  regmail: string | null;
};

export type OnboardingResult<T = unknown> =
  | { type: 'navigate'; path: string }
  | { type: 'external'; url: string }
  | {
      type: 'error';
      description: string;
      errors?: Partial<T>;
      values?: Partial<T>;
    };

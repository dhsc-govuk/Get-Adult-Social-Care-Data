export type ActionResponse<T> =
  | { error: string; errors?: Partial<T> }
  | { error?: null; fields: Partial<T>; next: string | null };

export type WhoamiFormData = {
  id: string;
};

export type LookupLAFormData = {
  regmail: string;
};

export type SignupLAFormData = {
  regfullname: string;
  regla: string;
  regorgname: string;
  regrole: string;
  regmail: string;
};

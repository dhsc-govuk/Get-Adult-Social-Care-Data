export type ActionResponse<T> = {
  type: 'error';
  description: string;
  errors?: Partial<T>;
  values?: Partial<T>; // form-fields
};

export type WhoamiErrors = Partial<WhoamiFormData>;

export type WhoamiFormData = {
  id: string | null;
};

export type SignupLAData = {
  regfullname: string | null;
  regla: string | null;
  regorgname: string | null;
  regrole: string | null;
  regmail: string | null;
};

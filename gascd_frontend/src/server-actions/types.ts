export type ActionResponse<T> =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      description: string;
      errors: Partial<T>;
      values: Partial<T>;
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

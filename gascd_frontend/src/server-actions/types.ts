export type ActionResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      description: string;
      errors: WhoamiErrors;
      values: Partial<WhoamiFormData>;
    };

export type WhoamiErrors = Partial<WhoamiFormData>;
export type WhoamiFormData = {
  id: string;
};

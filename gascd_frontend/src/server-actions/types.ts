// export type ActionResponse<T> = {
//   type?: 'error';
//   description?: string;
//   errors?: Partial<T>;
//   values?: Partial<T>; // form-fields
// };
export type ActionResponse<T> =
  | { error: string; errors?: Partial<T> }
  | { error?: null; fields: Partial<T>; next: string | null };
// | { error?: null; goto: string }
// | { error: string; errors?: Partial<T> };

type Foo<T> = { error?: null } | { error: string; fields?: Partial<T> };
function foo(): Foo<{ aaa: string; bbb: number }> {
  return {};
}

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

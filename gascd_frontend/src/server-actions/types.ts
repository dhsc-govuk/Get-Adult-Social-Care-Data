// export type ActionResponse<T> = {
//   type?: 'error';
//   description?: string;
//   errors?: Partial<T>;
//   values?: Partial<T>; // form-fields
// };
export type ActionResponse<T> =
  | { error: string; errors?: Partial<T> }
  | { error?: null; fields: Partial<T> };
// | { error?: null; goto: string }
// | { error: string; errors?: Partial<T> };

type Foo<T> = { error?: null } | { error: string; fields?: Partial<T> };
function foo(): Foo<{ aaa: string; bbb: number }> {
  return {};
}

export type WhoamiFormData = {
  id: string | null;
};

export type LookupLAFormData = {
  regmail: string | null;
};

export type SignupLAFormData = {
  regfullname: string | null;
  regla: string | null;
  regorgname: string | null;
  regrole: string | null;
  regmail: string | null;
};

export function validateInsertFields<T extends object>(
  body: Record<string, any>,
  allowedFields: readonly (keyof T)[]
): Partial<T> {
  const validData: Partial<T> = {};
  for (const key of allowedFields) {
    if (key in body) {
      validData[key] = body[key as string] as T[typeof key];
    }
  }
  return validData;
}

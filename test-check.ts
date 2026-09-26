// test-check.ts
export const checkEnvironment = (): string => {
  const typescriptVersion: string = "TypeScript Activo";
  return `[SUCCESS] ${typescriptVersion}: Entorno de tipado corriendo correctamente.`;
};

console.log(checkEnvironment());

/**
 * Reglas de validación reutilizables para formularios.
 * Cada regla devuelve un mensaje de error o una cadena vacía.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// letras (con tildes y ñ), espacios, apóstrofes y guiones
const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
// caracteres que podrían usarse para inyectar HTML / scripts
const DANGEROUS_RE = /[<>{}]/;

export const required = (msg = 'Este campo es obligatorio.') => (value) =>
  value.trim() ? '' : msg;

export const minLength = (n, msg) => (value) =>
  value.trim().length >= n ? '' : msg || `Debe tener al menos ${n} caracteres.`;

export const maxLength = (n, msg) => (value) =>
  value.length <= n ? '' : msg || `No puede superar los ${n} caracteres.`;

export const email = (msg = 'Ingresa un correo electrónico válido (ej: nombre@dominio.com).') => (value) =>
  EMAIL_RE.test(value.trim()) ? '' : msg;

export const personName = (msg = 'El nombre sólo puede contener letras y espacios.') => (value) =>
  NAME_RE.test(value.trim()) ? '' : msg;

export const safeText = (msg = 'El texto no puede contener los caracteres < > { }.') => (value) =>
  DANGEROUS_RE.test(value) ? msg : '';

/** Ejecuta una lista de reglas y devuelve el primer error encontrado. */
export const validate = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return '';
};

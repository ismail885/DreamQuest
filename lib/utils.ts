/**
 * Combine plusieurs noms de classes CSS, en filtrant les valeurs falsy.
 * Equivalent de la librairie `clsx` mais en plus léger.
 */
export function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

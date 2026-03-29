import { classNames } from '@/lib/utils'

describe('Utils - classNames', () => {
  describe('classNames', () => {
    it('devrait combiner plusieurs classes', () => {
      const result = classNames('foo', 'bar', 'baz')
      expect(result).toBe('foo bar baz')
    })

    it('devrait filtrer les classes falsy', () => {
      const result = classNames('foo', '', 'bar', null as unknown as string, 'baz', undefined as unknown as string)
      expect(result).toBe('foo bar baz')
    })

    it('devrait gérer les valeurs boolean', () => {
      const isActive = true
      const isDisabled = false
      
      // Using unknown as intermediate type for boolean to string conversion
      const result = classNames('base', (isActive && 'active') as unknown as string, (isDisabled && 'disabled') as unknown as string)
      expect(result).toBe('base active')
    })

    it('devrait gérer les chaînes vides', () => {
      const result = classNames('', '')
      expect(result).toBe('')
    })

    it('devrait gérer un seul argument', () => {
      const result = classNames('single-class')
      expect(result).toBe('single-class')
    })

    it('devrait gérer aucun argument', () => {
      const result = classNames()
      expect(result).toBe('')
    })

    it('devrait gérer les classes avec des espaces multiples', () => {
      const result = classNames('class1', 'class2', 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('devrait gérer les classes avec des tirets', () => {
      const result = classNames('btn-primary', 'btn-large', 'mt-4')
      expect(result).toBe('btn-primary btn-large mt-4')
    })

    it('devrait gérer les classes conditionnelles avec ternaire', () => {
      const variant = 'primary'
      const size = 'large'
      
      const result = classNames(
        'btn',
        variant === 'primary' ? 'btn-primary' : 'btn-secondary',
        size === 'large' ? 'btn-lg' : 'btn-sm'
      )
      
      expect(result).toBe('btn btn-primary btn-lg')
    })
  })
})

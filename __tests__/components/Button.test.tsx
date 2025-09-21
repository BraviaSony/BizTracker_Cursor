import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('applies primary variant by default', () => {
    render(<Button>Primary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary-600')
  })

  it('applies secondary variant when specified', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-secondary-100')
  })

  it('applies outline variant when specified', () => {
    render(<Button variant="outline">Outline Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border')
  })

  it('applies destructive variant when specified', () => {
    render(<Button variant="destructive">Destructive Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-error-600')
  })

  it('applies ghost variant when specified', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-secondary-100')
  })

  it('applies small size when specified', () => {
    render(<Button size="sm">Small Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-8')
  })

  it('applies large size when specified', () => {
    render(<Button size="lg">Large Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-12')
  })

  it('shows loading state when loading prop is true', () => {
    render(<Button loading>Loading Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when loading prop is true', () => {
    render(<Button loading>Loading Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })
})

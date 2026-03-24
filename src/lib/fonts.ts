import { Literata, Outfit } from 'next/font/google'

export const fontSans = Outfit({
    subsets: ['latin'],
    variable: '--font-sans',
})

export const fontHeading = Literata({
    subsets: ['latin'],
    variable: '--font-heading',
    weight: ['400', '500', '600', '700'],
})

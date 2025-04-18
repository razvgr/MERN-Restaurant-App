'use client'
import { IconButton, Skeleton, Box } from '@chakra-ui/react' // Span -> Box
import { ThemeProvider, useTheme } from 'next-themes'
import * as React from 'react'
import { LuMoon, LuSun } from 'react-icons/lu'

// Componentă custom pentru a înlocui ClientOnly
const ClientOnlyWrapper = ({ children, fallback }) => {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return fallback || null
  return children
}

// ThemeProvider pentru next-themes
export function ColorModeProvider(props) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  )
}

// Hook pentru gestionarea modului de culoare
export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme()
  const toggleColorMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }
  return {
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

// Utilitar pentru valori bazate pe modul de culoare
export function useColorModeValue(light, dark) {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? dark : light
}

// Iconița pentru modul de culoare
export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? <LuMoon /> : <LuSun />
}

// Buton pentru toggle mod culoare
export const ColorModeButton = React.forwardRef(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode()
  return (
    <ClientOnlyWrapper fallback={<Skeleton boxSize="8" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle color mode"
        size="sm"
        ref={ref}
        {...props}
        icon={<ColorModeIcon />}
        sx={{
          '& svg': { // Stilizare directă pentru iconiță
            width: '5',
            height: '5',
          },
        }}
      />
    </ClientOnlyWrapper>
  )
})

// Componentă LightMode
export const LightMode = React.forwardRef(function LightMode(props, ref) {
  return (
    <Box
      color="fg"
      display="contents"
      className="chakra-theme light"
      colorPalette="gray"
      ref={ref}
      {...props}
    />
  )
})

// Componentă DarkMode
export const DarkMode = React.forwardRef(function DarkMode(props, ref) {
  return (
    <Box
      color="fg"
      display="contents"
      className="chakra-theme dark"
      colorPalette="gray"
      ref={ref}
      {...props}
    />
  )
})
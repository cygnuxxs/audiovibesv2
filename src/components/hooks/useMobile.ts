import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
    // Start with undefined to avoid hydration mismatch errors during SSR
    const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

    React.useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

        const onChange = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        }

        // Listen for screen size changes
        mql.addEventListener("change", onChange)

        // Set initial value on mount
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

        // Clean up event listener
        return () => mql.removeEventListener("change", onChange)
    }, [])

    return !!isMobile
}

"use client"

import { useState, useEffect } from "react"

export function useWebGLSupport(): boolean {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const checkWebGLSupport = () => {
      // Check if we're in a browser environment
      if (typeof window === "undefined" || typeof document === "undefined") {
        console.log("WebGL check: Not in browser environment")
        setIsSupported(false)
        return
      }

      try {
        // Create a test canvas
        const canvas = document.createElement("canvas")
        canvas.width = 1
        canvas.height = 1

        // Try different WebGL context options with progressively less strict requirements
        const contextOptions = [
          // Most permissive first
          {
            alpha: false,
            antialias: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            powerPreference: "default",
            failIfMajorPerformanceCaveat: false,
          },
          // Slightly more permissive
          {
            alpha: true,
            antialias: false,
            premultipliedAlpha: false,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
          },
          // Most basic
          {},
        ]

        const contextTypes = ["webgl2", "webgl", "experimental-webgl"]

        let gl: WebGLRenderingContext | null = null

        // Try each context type with each set of options
        for (const contextType of contextTypes) {
          for (const options of contextOptions) {
            try {
              gl = canvas.getContext(contextType, options) as WebGLRenderingContext
              if (gl) {
                console.log(`WebGL context created successfully with: ${contextType}`, options)
                break
              }
            } catch (e) {
              console.warn(`Failed to create ${contextType} context with options:`, options, e)
            }
          }
          if (gl) break
        }

        if (!gl) {
          console.warn("WebGL: No context could be created with any configuration")
          setIsSupported(false)
          return
        }

        // Test basic WebGL functionality
        try {
          const version = gl.getParameter(gl.VERSION)
          const renderer = gl.getParameter(gl.RENDERER)
          const vendor = gl.getParameter(gl.VENDOR)

          console.log("WebGL Info:", { version, renderer, vendor })

          // Try to create a simple shader to test compilation
          const vertexShader = gl.createShader(gl.VERTEX_SHADER)
          if (vertexShader) {
            gl.shaderSource(
              vertexShader,
              `
              attribute vec2 position;
              void main() {
                gl_Position = vec4(position, 0.0, 1.0);
              }
            `,
            )
            gl.compileShader(vertexShader)

            if (gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
              console.log("WebGL: Basic shader compilation successful")
              setIsSupported(true)
            } else {
              console.warn("WebGL: Shader compilation failed")
              setIsSupported(false)
            }

            gl.deleteShader(vertexShader)
          } else {
            console.warn("WebGL: Could not create shader")
            setIsSupported(false)
          }
        } catch (e) {
          console.warn("WebGL: Basic functionality test failed:", e)
          setIsSupported(false)
        }

        // Clean up test canvas
        canvas.width = 0
        canvas.height = 0
      } catch (e) {
        console.warn("WebGL detection failed:", e)
        setIsSupported(false)
      }
    }

    // Delay the check to ensure DOM is ready
    const timeoutId = setTimeout(checkWebGLSupport, 200)

    return () => clearTimeout(timeoutId)
  }, [])

  return isSupported
}

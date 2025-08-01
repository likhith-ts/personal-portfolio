"use client"

import React from "react"
import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { WebGLRenderer } from "./webgl/webgl-renderer"
import { CanvasRenderer } from "./webgl/canvas-renderer"
import { useWebGLSupport } from "./webgl/use-webgl-support"

interface NeuralNetworkVisualizerProps {
  layers?: number[]
  nodeColor?: string
  signalColor?: string
  particleColor?: string
  errorColor?: string
  animationSpeed?: "slow" | "medium" | "fast"
  glowIntensity?: number
  connectionDensity?: number
  isAnimating?: boolean
  showTraining?: boolean
  learningRate?: number
  forceCanvas?: boolean
  className?: string
}

interface Node {
  id: string
  x: number
  y: number
  layer: number
  index: number
  activation: number
  error: number
  bias: number
}

interface Connection {
  id: string
  fromIndex: number
  toIndex: number
  weight: number
  previousWeight: number
  gradient: number
  weightChange: number
}

interface Particle {
  id: string
  connectionIndex: number
  progress: number
  type: "forward" | "backward"
  intensity: number
  active: boolean
}

interface TrainingState {
  isTraining: boolean
  epoch: number
  loss: number
  accuracy: number
  learningRate: number
}

interface AnimationState {
  activeNodes: Set<number>
  activeConnections: Set<number>
  backpropConnections: Set<number>
}

// Memoized particle pool for performance
class ParticlePool {
  private pool: Particle[] = []
  private activeParticles: Particle[] = []
  private nextId = 0

  getParticle(connectionIndex: number, type: "forward" | "backward", intensity: number): Particle {
    let particle = this.pool.pop()
    if (!particle) {
      particle = {
        id: `particle-${this.nextId++}`,
        connectionIndex,
        progress: type === "forward" ? 0 : 1,
        type,
        intensity,
        active: true,
      }
    } else {
      particle.connectionIndex = connectionIndex
      particle.progress = type === "forward" ? 0 : 1
      particle.type = type
      particle.intensity = intensity
      particle.active = true
    }
    this.activeParticles.push(particle)
    return particle
  }

  releaseParticle(particle: Particle): void {
    particle.active = false
    const index = this.activeParticles.indexOf(particle)
    if (index > -1) {
      this.activeParticles.splice(index, 1)
      this.pool.push(particle)
    }
  }

  getActiveParticles(): Particle[] {
    return this.activeParticles
  }

  cleanup(): void {
    this.activeParticles = this.activeParticles.filter((p) => p.active)
  }
}

// Optimized component with React.memo
const NeuralNetworkVisualizer = React.memo<NeuralNetworkVisualizerProps>(
  ({
    layers = [4, 6, 4, 2],
    nodeColor,
    signalColor,
    particleColor,
    errorColor,
    animationSpeed = "medium",
    glowIntensity = 0.8,
    connectionDensity = 0.7,
    isAnimating = true,
    showTraining = true,
    learningRate = 0.01,
    forceCanvas = false,
    className = "",
  }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const webglRendererRef = useRef<WebGLRenderer | null>(null)
    const canvasRendererRef = useRef<CanvasRenderer | null>(null)
    const animationFrameRef = useRef<number>()
    const particlePoolRef = useRef(new ParticlePool())
    const lastFrameTimeRef = useRef(0)
    const fpsRef = useRef(0)
    const frameCountRef = useRef(0)

    // WebGL support detection
    const isWebGLSupported = useWebGLSupport()
    const [webglInitialized, setWebglInitialized] = useState(false)
    const [rendererError, setRendererError] = useState<string | null>(null)

    // Determine which renderer to use
    const useWebGL = isWebGLSupported && !forceCanvas && webglInitialized

    // Stable references for animation state
    const animationStateRef = useRef<AnimationState>({
      activeNodes: new Set(),
      activeConnections: new Set(),
      backpropConnections: new Set(),
    })

    const [dimensions, setDimensions] = useState({ width: 800, height: 400 })
    const [trainingState, setTrainingState] = useState<TrainingState>({
      isTraining: false,
      epoch: 0,
      loss: 1.0,
      accuracy: 0.1,
      learningRate,
    })
    const [renderStats, setRenderStats] = useState({
      fps: 0,
      drawCalls: 0,
      particleCount: 0,
      renderTime: 0,
      renderer: "Canvas",
    })

    // Memoized network structure
    const networkStructure = useMemo(() => {
      const nodes: Node[] = []
      const connections: Connection[] = []
      const layerSpacing = dimensions.width / (layers.length + 1)

      // Create nodes
      layers.forEach((layerSize, layerIndex) => {
        const nodeSpacing = dimensions.height / (layerSize + 1)
        for (let nodeIndex = 0; nodeIndex < layerSize; nodeIndex++) {
          nodes.push({
            id: `node-${layerIndex}-${nodeIndex}`,
            x: layerSpacing * (layerIndex + 1),
            y: nodeSpacing * (nodeIndex + 1),
            layer: layerIndex,
            index: nodeIndex,
            activation: Math.random() * 0.5,
            error: 0,
            bias: Math.random() * 0.2 - 0.1,
          })
        }
      })

      // Create connections with indices for performance
      let connectionIndex = 0
      for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
        const currentLayerStart = layers.slice(0, layerIndex).reduce((sum, size) => sum + size, 0)
        const nextLayerStart = layers.slice(0, layerIndex + 1).reduce((sum, size) => sum + size, 0)

        for (let i = 0; i < layers[layerIndex]; i++) {
          for (let j = 0; j < layers[layerIndex + 1]; j++) {
            if (Math.random() < connectionDensity) {
              const weight = Math.random() * 2 - 1
              connections.push({
                id: `conn-${connectionIndex}`,
                fromIndex: currentLayerStart + i,
                toIndex: nextLayerStart + j,
                weight,
                previousWeight: weight,
                gradient: 0,
                weightChange: 0,
              })
              connectionIndex++
            }
          }
        }
      }

      return { nodes, connections }
    }, [layers, dimensions, connectionDensity])

    // Memoized speed configuration
    const speedConfig = useMemo(
      () => ({
        slow: { particle: 0.004, training: 4000, fps: 30 },
        medium: { particle: 0.008, training: 2500, fps: 60 },
        fast: { particle: 0.012, training: 1500, fps: 60 },
      }),
      [],
    )

    const currentSpeed = speedConfig[animationSpeed]

    // Optimized resize handler with debouncing
    const handleResize = useCallback(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const newDimensions = { width: rect.width, height: rect.height }

        setDimensions((prev) => {
          if (prev.width !== newDimensions.width || prev.height !== newDimensions.height) {
            // Update renderer dimensions
            if (useWebGL && webglRendererRef.current) {
              webglRendererRef.current.resize(newDimensions.width, newDimensions.height)
            } else if (canvasRendererRef.current) {
              canvasRendererRef.current.resize(newDimensions.width, newDimensions.height)
            }
            return newDimensions
          }
          return prev
        })
      }
    }, [useWebGL])

    useEffect(() => {
      let timeoutId: NodeJS.Timeout
      const debouncedResize = () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(handleResize, 100)
      }

      handleResize()
      window.addEventListener("resize", debouncedResize)
      return () => {
        window.removeEventListener("resize", debouncedResize)
        clearTimeout(timeoutId)
      }
    }, [handleResize])

    // Initialize renderers
    useEffect(() => {
      if (!canvasRef.current) {
        console.log("Canvas ref not available, skipping renderer initialization")
        return
      }

      // Clean up existing renderers
      if (webglRendererRef.current) {
        try {
          webglRendererRef.current.dispose()
        } catch (e) {
          console.warn("Error disposing WebGL renderer:", e)
        }
        webglRendererRef.current = null
      }
      if (canvasRendererRef.current) {
        try {
          canvasRendererRef.current.dispose()
        } catch (e) {
          console.warn("Error disposing Canvas renderer:", e)
        }
        canvasRendererRef.current = null
      }

      setRendererError(null)
      setWebglInitialized(false)

      const colorSettings = {
        nodeColor: nodeColor || "#3b82f6",
        signalColor: signalColor || "#3b82f6",
        particleColor: particleColor || "#60a5fa",
        errorColor: errorColor || "#ef4444",
        glowIntensity,
      }

      // Always initialize Canvas renderer first as fallback
      try {
        canvasRendererRef.current = new CanvasRenderer(canvasRef.current, colorSettings)
        setRenderStats((prev) => ({ ...prev, renderer: "Canvas" }))
        console.log("Canvas renderer initialized successfully")
      } catch (error) {
        console.error("Canvas renderer failed:", error)
        setRendererError(`Canvas renderer failed: ${error}`)
        return // If Canvas fails, we have bigger problems
      }

      // Try WebGL only if supported and not forced to use Canvas
      if (isWebGLSupported && !forceCanvas) {
        try {
          console.log("Attempting WebGL renderer initialization...")
          webglRendererRef.current = new WebGLRenderer(canvasRef.current, colorSettings)

          if (webglRendererRef.current.isReady()) {
            setWebglInitialized(true)
            setRenderStats((prev) => ({ ...prev, renderer: "WebGL" }))
            console.log("WebGL renderer initialized successfully")
          } else {
            throw new Error("WebGL renderer not ready after initialization")
          }
        } catch (error) {
          console.warn("WebGL renderer failed, using Canvas fallback:", error)
          setRendererError(null) // Don't show error since we have Canvas fallback
          if (webglRendererRef.current) {
            try {
              webglRendererRef.current.dispose()
            } catch (e) {
              console.warn("Error disposing failed WebGL renderer:", e)
            }
            webglRendererRef.current = null
          }
          // Canvas renderer is already initialized above
        }
      } else {
        console.log("WebGL not supported or forced to use Canvas")
      }

      return () => {
        if (webglRendererRef.current) {
          try {
            webglRendererRef.current.dispose()
          } catch (e) {
            console.warn("Error disposing WebGL renderer on cleanup:", e)
          }
          webglRendererRef.current = null
        }
        if (canvasRendererRef.current) {
          try {
            canvasRendererRef.current.dispose()
          } catch (e) {
            console.warn("Error disposing Canvas renderer on cleanup:", e)
          }
          canvasRendererRef.current = null
        }
      }
    }, [isWebGLSupported, forceCanvas, nodeColor, signalColor, particleColor, errorColor, glowIntensity])

    // Animation loop with requestAnimationFrame
    const animate = useCallback(
      (timestamp: number) => {
        if (!isAnimating) return

        const startTime = performance.now()

        // Throttle to target FPS
        // const targetFrameTime = 1000 / currentSpeed.fps
        // if (timestamp - lastFrameTimeRef.current < targetFrameTime) {
        //   animationFrameRef.current = requestAnimationFrame(animate)
        //   return
        // }

        const { nodes, connections } = networkStructure
        const particles = particlePoolRef.current.getActiveParticles()
        const animState = animationStateRef.current

        // Update particles
        particles.forEach((particle) => {
          if (!particle.active) return

          if (particle.type === "forward") {
            particle.progress += currentSpeed.particle
            if (particle.progress >= 1) {
              particlePoolRef.current.releaseParticle(particle)
            }
          } else {
            particle.progress -= currentSpeed.particle
            if (particle.progress <= 0) {
              particlePoolRef.current.releaseParticle(particle)
            }
          }
        })

        // Render frame
        try {
          if (useWebGL && webglRendererRef.current && webglRendererRef.current.isReady()) {
            webglRendererRef.current.render(
              nodes,
              connections,
              particles,
              animState.activeNodes,
              animState.activeConnections,
              animState.backpropConnections,
            )
          } else if (canvasRendererRef.current) {
            canvasRendererRef.current.render(
              nodes,
              connections,
              particles,
              animState.activeNodes,
              animState.activeConnections,
              animState.backpropConnections,
            )
          } else {
            console.warn("No renderer available for rendering")
          }
        } catch (error) {
          console.error("Render error:", error)
          // Try to fall back to Canvas if WebGL fails during rendering
          if (useWebGL && canvasRendererRef.current) {
            console.log("Falling back to Canvas renderer due to WebGL render error")
            try {
              canvasRendererRef.current.render(
                nodes,
                connections,
                particles,
                animState.activeNodes,
                animState.activeConnections,
                animState.backpropConnections,
              )
            } catch (canvasError) {
              console.error("Canvas fallback also failed:", canvasError)
            }
          }
        }

        // FPS calculation
        frameCountRef.current++
        if (timestamp - lastFrameTimeRef.current >= 1000) {
          fpsRef.current = frameCountRef.current

          // Update render stats
          setRenderStats((prev) => ({
            ...prev,
            fps: frameCountRef.current,
            drawCalls: useWebGL && webglRendererRef.current ? webglRendererRef.current.getDrawCalls() : 0,
            particleCount: particles.length,
            renderTime: performance.now() - startTime,
          }))

          frameCountRef.current = 0
          lastFrameTimeRef.current = timestamp
        }

        animationFrameRef.current = requestAnimationFrame(animate)
      },
      [isAnimating, networkStructure, currentSpeed, useWebGL],
    )

    // Start animation loop
    useEffect(() => {
      if (isAnimating) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }, [isAnimating, animate])

    // Optimized training cycle
    const runTrainingCycle = useCallback(() => {
      if (!trainingState.isTraining) return

      const { connections } = networkStructure
      const animState = animationStateRef.current

      // Forward pass
      const inputConnections = connections.filter((_, index) => {
        const fromNode = networkStructure.nodes[connections[index].fromIndex]
        return fromNode.layer === 0
      })

      // Clear previous state
      animState.activeNodes.clear()
      animState.activeConnections.clear()
      animState.backpropConnections.clear()

      // Activate input layer
      networkStructure.nodes.forEach((node, index) => {
        if (node.layer === 0) {
          animState.activeNodes.add(index)
        }
      })

      // Create forward particles
      inputConnections.forEach((_, index) => {
        const connectionIndex = connections.indexOf(inputConnections[index])
        animState.activeConnections.add(connectionIndex)
        particlePoolRef.current.getParticle(connectionIndex, "forward", Math.random() * 0.8 + 0.2)
      })

      // Backward pass after delay
      setTimeout(() => {
        const outputConnections = connections.filter((_, index) => {
          const toNode = networkStructure.nodes[connections[index].toIndex]
          return toNode.layer === layers.length - 1
        })

        outputConnections.forEach((_, index) => {
          const connectionIndex = connections.indexOf(outputConnections[index])
          animState.backpropConnections.add(connectionIndex)
          particlePoolRef.current.getParticle(connectionIndex, "backward", Math.random() * 0.8 + 0.2)
        })

        // Weight update after another delay
        setTimeout(() => {
          setTrainingState((prev) => ({
            ...prev,
            epoch: prev.epoch + 1,
            loss: Math.max(0.01, prev.loss * (0.98 + Math.random() * 0.04)),
            accuracy: Math.min(0.99, prev.accuracy + Math.random() * 0.02),
          }))

          // Clear animation state
          animState.activeConnections.clear()
          animState.backpropConnections.clear()
        }, 800)
      }, 1200)
    }, [trainingState.isTraining, networkStructure, layers.length])

    // Training interval with cleanup
    useEffect(() => {
      let intervalId: NodeJS.Timeout
      if (trainingState.isTraining) {
        intervalId = setInterval(runTrainingCycle, currentSpeed.training)
      }
      return () => {
        if (intervalId) clearInterval(intervalId)
      }
    }, [trainingState.isTraining, runTrainingCycle, currentSpeed.training])

    // Memoized control functions
    const startTraining = useCallback(() => {
      setTrainingState((prev) => ({ ...prev, isTraining: true }))
    }, [])

    const stopTraining = useCallback(() => {
      setTrainingState((prev) => ({ ...prev, isTraining: false }))
    }, [])

    const resetTraining = useCallback(() => {
      setTrainingState({
        isTraining: false,
        epoch: 0,
        loss: 1.0,
        accuracy: 0.1,
        learningRate,
      })
      particlePoolRef.current.cleanup()
      animationStateRef.current.activeNodes.clear()
      animationStateRef.current.activeConnections.clear()
      animationStateRef.current.backpropConnections.clear()
    }, [learningRate])

    // Memoized node initial position
    const getNodeInitialPosition = useCallback(
      (node: Node) => {
        const directions = ["top", "bottom", "left", "right"]
        const direction = directions[node.index % directions.length]

        switch (direction) {
          case "top":
            return { x: node.x, y: -100 }
          case "bottom":
            return { x: node.x, y: dimensions.height + 100 }
          case "left":
            return { x: -100, y: node.y }
          case "right":
            return { x: dimensions.width + 100, y: node.y }
          default:
            return { x: node.x, y: node.y }
        }
      },
      [dimensions],
    )

    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full min-h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden ${className}`}
        style={{ willChange: "transform" }}
      >
        {/* WebGL/Canvas Renderer */}
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0 pointer-events-none"
          style={{
            willChange: "transform",
            transform: "translateZ(0)", // Force GPU acceleration
          }}
        />

        {/* Error Display */}
        {rendererError && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-20">
            <strong className="font-bold">Renderer Error: </strong>
            <span className="block sm:inline">{rendererError}</span>
          </div>
        )}

        {/* SVG for nodes only (fewer elements) */}
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0 pointer-events-none"
          style={{
            willChange: "transform",
            transform: "translateZ(0)",
          }}
        >
          {/* Optimized nodes rendering */}
          {networkStructure.nodes.map((node, index) => {
            const initialPos = getNodeInitialPosition(node)
            const isActive = animationStateRef.current.activeNodes.has(index)
            const nodeSize = 8 + node.activation * 4

            return (
              <motion.g key={node.id}>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeSize}
                  fill={node.error > 0 ? errorColor || "#ef4444" : nodeColor || (isActive ? "#3b82f6" : "#f1f5f9")}
                  stroke={isActive ? "#1d4ed8" : "#cbd5e1"}
                  strokeWidth={2}
                  initial={{
                    cx: initialPos.x,
                    cy: initialPos.y,
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    cx: node.x,
                    cy: node.y,
                    scale: 1,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.05, // Reduced delay for better performance
                    ease: "easeOut",
                  }}
                  style={{
                    willChange: "transform",
                    transform: "translateZ(0)",
                  }}
                />

                {/* Optimized node labels */}
                <text
                  x={node.x}
                  y={node.y + 2}
                  textAnchor="middle"
                  className="text-[8px] fill-current pointer-events-none"
                  fill={node.error > 0 ? "white" : "black"}
                  style={{ willChange: "transform" }}
                >
                  {node.error > 0 ? node.error.toFixed(2) : node.activation.toFixed(2)}
                </text>
              </motion.g>
            )
          })}
        </svg>

        {/* Optimized Training Controls */}
        {showTraining && (
          <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  onClick={startTraining}
                  disabled={trainingState.isTraining}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
                >
                  Start
                </button>
                <button
                  onClick={stopTraining}
                  disabled={!trainingState.isTraining}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm rounded transition-colors"
                >
                  Stop
                </button>
                <button
                  onClick={resetTraining}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Reset
                </button>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Epoch:</span>
                  <span className="font-mono">{trainingState.epoch}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loss:</span>
                  <span className="font-mono">{trainingState.loss.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-mono">{(trainingState.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>FPS:</span>
                  <span className="font-mono">{renderStats.fps}</span>
                </div>
                <div className="flex justify-between">
                  <span>Renderer:</span>
                  <span
                    className={`font-mono ${renderStats.renderer === "WebGL" ? "text-green-600" : "text-blue-600"}`}
                  >
                    {renderStats.renderer}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span>LR:</span>
                <input
                  type="range"
                  min="0.001"
                  max="0.1"
                  step="0.001"
                  value={trainingState.learningRate}
                  onChange={(e) =>
                    setTrainingState((prev) => ({ ...prev, learningRate: Number.parseFloat(e.target.value) }))
                  }
                  className="flex-1"
                />
                <span className="font-mono w-12">{trainingState.learningRate.toFixed(3)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Performance optimized legend */}
        <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Forward Signal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Error/Gradient</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500"></div>
              <span>Positive Weight</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-orange-500"></div>
              <span>Negative Weight</span>
            </div>
          </div>
        </div>

        {/* WebGL Stats */}
        {renderStats.renderer === "WebGL" && (
          <div className="absolute bottom-4 right-4 z-10 bg-black/70 text-white text-xs p-2 rounded">
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span>Draw calls:</span>
                <span className="font-mono">{renderStats.drawCalls}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Particles:</span>
                <span className="font-mono">{renderStats.particleCount}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Render time:</span>
                <span className="font-mono">{renderStats.renderTime.toFixed(2)}ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Training status */}
        {trainingState.isTraining && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Training in Progress...
            </div>
          </div>
        )}

        {/* Layer labels */}
        <div className="absolute bottom-4 left-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex gap-4">
            {layers.map((layerSize, index) => (
              <div key={index} className="text-center">
                <div className="font-mono">{layerSize}</div>
                <div className="text-[10px] opacity-70">
                  {index === 0 ? "Input" : index === layers.length - 1 ? "Output" : `Hidden ${index}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
)

NeuralNetworkVisualizer.displayName = "NeuralNetworkVisualizer"

export default NeuralNetworkVisualizer

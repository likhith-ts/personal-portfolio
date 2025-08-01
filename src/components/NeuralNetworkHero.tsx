"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import gsap from "gsap"

interface HeroNeuralNetworkProps {
  className?: string
  nodeColor?: string
  signalColor?: string
  particleColor?: string
  connectionColor?: string
  glowIntensity?: number
  animationSpeed?: number
  initialWidth?: number
  initialHeight?: number
  networkLayers?: number[] // Default structure
}

interface Node {
  id: string
  x: number
  y: number
  targetX: number
  targetY: number
  layer: number
  index: number
  size: number
  opacity: number
  active: boolean
  activeIntensity: number
  entryDelay: number
  entryDirection: "top" | "bottom" | "left" | "right"
  element?: SVGCircleElement | null
}

interface Connection {
  id: string
  fromNode: string
  toNode: string
  opacity: number
  weight: number
  active: boolean
  element?: SVGLineElement | null
}

interface Signal {
  id: string
  connectionId: string
  progress: number
  speed: number
  active: boolean
  intensity: number
  element?: SVGCircleElement | null
}

const HeroNeuralNetwork: React.FC<HeroNeuralNetworkProps> = ({
  className = "",
  nodeColor,
  signalColor,
  particleColor,
  connectionColor,
  glowIntensity = 0.8,
  animationSpeed = 1,
  initialWidth,
  initialHeight,
  networkLayers = [5, 10, 10, 8, 6, 2], // Default structure
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const waveTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const [dimensions, setDimensions] = useState({
    width: initialWidth || 400,
    height: initialHeight || 400
  })
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  // const [signals, setSignals] = useState<Signal[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isFormationComplete, setIsFormationComplete] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const nodeRefs = useRef<Map<string, SVGCircleElement>>(new Map())
  const connectionRefs = useRef<Map<string, SVGLineElement>>(new Map())
  const signalRefs = useRef<Map<string, SVGCircleElement>>(new Map())

  // Theme detection
  useEffect(() => {
    const checkTheme = () => {
      const htmlElement = document.documentElement
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const dataTheme = htmlElement.getAttribute('data-theme')

      // Check if explicitly set to light/dark or use system preference
      const isDark = dataTheme === 'dark' || (dataTheme === 'system' && isSystemDark) || (!dataTheme && isSystemDark)
      // console.log('🎨 Theme detection:', { dataTheme, isSystemDark, isDark })
      setIsDarkMode(isDark)
    }

    checkTheme()

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    })

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', checkTheme)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', checkTheme)
    }
  }, [])

  // Color scheme based on theme
  const colors = isDarkMode ? {
    // Dark mode colors matching the image (mint green, teal, cyan)
    node: nodeColor || "#38f6c6", // mint green
    signal: signalColor || "#00ffd0", // bright cyan
    particle: particleColor || "#38f6c6", // mint green
    connection: connectionColor || "#1b9a7c", // teal
    activeNodeCenter: "#aaffee" // light mint
  } : {
    // Light mode colors (darker, more contrasted colors for visibility)
    node: nodeColor || "#0f766e", // dark teal for better contrast
    signal: signalColor || "#0891b2", // darker cyan
    particle: particleColor || "#0f766e", // dark teal
    connection: connectionColor || "#374151", // dark gray for subtle connections
    activeNodeCenter: "#06b6d4" // sky blue for active nodes
  }

  // Generate labels for layers
  const getLayerLabel = (index: number) => {
    if (index === 0) return "Input"
    if (index === networkLayers.length - 1) return "Output"
    return `Hidden ${index}`
  }

  // Generate entry direction for nodes
  const getEntryDirection = (layerIndex: number): "top" | "bottom" | "left" | "right" => {
    const directions: ("top" | "bottom" | "left" | "right")[] = ["top", "bottom", "left", "right"]
    return directions[layerIndex % 4]
  }

  // Calculate entry position based on direction
  const getEntryPosition = (direction: "top" | "bottom" | "left" | "right", targetX: number, targetY: number) => {
    const offset = 200
    switch (direction) {
      case "top":
        return { x: targetX, y: -offset }
      case "bottom":
        return { x: targetX, y: dimensions.height + offset }
      case "left":
        return { x: -offset, y: targetY }
      case "right":
        return { x: dimensions.width + offset, y: targetY }
    }
  }

  // Initialize network structure
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const newDimensions = {
          width: rect.width,
          height: rect.height,
        }
        // console.log('📐 Dimensions updated:', newDimensions)
        setDimensions(newDimensions)
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Generate nodes and connections
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    // Prevent double generation by checking if already initialized with same dimensions
    // const currentDimKey = `${dimensions.width}x${dimensions.height}`
    if (nodes.length > 0) {
      // console.log('� Skipping duplicate network generation for:', currentDimKey)
      return
    }

    // console.log('�🔧 Generating network with dimensions:', dimensions)

    const newNodes: Node[] = []
    const newConnections: Connection[] = []

    // Calculate layer positions with fixed precision
    const layerSpacing = (dimensions.width / (networkLayers.length + 1))
    const padding = 80

    // console.log('🏗️ Network structure:', { networkLayers, layerSpacing, padding })

    // Create nodes for each layer
    networkLayers.forEach((layerSize, layerIndex) => {
      const layerX = layerSpacing * (layerIndex + 1)
      const nodeSpacing = (dimensions.height - padding * 2) / (layerSize + 1)
      const direction = getEntryDirection(layerIndex)

      for (let nodeIndex = 0; nodeIndex < layerSize; nodeIndex++) {
        const targetY = padding + nodeSpacing * (nodeIndex + 1)
        const entryPos = getEntryPosition(direction, layerX, targetY)

        const node: Node = {
          id: `node-${layerIndex}-${nodeIndex}`,
          x: entryPos.x,
          y: entryPos.y,
          targetX: Math.round(layerX), // Fix floating point precision
          targetY: Math.round(targetY),
          layer: layerIndex,
          index: nodeIndex,
          size: 8,
          opacity: 0,
          active: false,
          activeIntensity: 0,
          entryDelay: Math.round((layerIndex * 0.15 + nodeIndex * 0.02) * 1000) / 1000, // Fix timing precision
          entryDirection: direction,
        }
        newNodes.push(node)
      }
    })

    // Create connections between adjacent layers with proper weight distribution
    for (let layerIndex = 0; layerIndex < networkLayers.length - 1; layerIndex++) {
      const currentLayerNodes = newNodes.filter((n) => n.layer === layerIndex)
      const nextLayerNodes = newNodes.filter((n) => n.layer === layerIndex + 1)

      currentLayerNodes.forEach((fromNode) => {
        nextLayerNodes.forEach((toNode) => {
          // Create connections with gaussian weight distribution
          const weight = (Math.random() - 0.5) * 2 // Range: -1 to 1
          const connection: Connection = {
            id: `conn-${fromNode.id}-${toNode.id}`,
            fromNode: fromNode.id,
            toNode: toNode.id,
            opacity: 0,
            weight: Math.round(weight * 1000) / 1000, // Fix precision
            active: false,
          }
          newConnections.push(connection)
        })
      })
    }

    setNodes(newNodes)
    setConnections(newConnections)
    setIsInitialized(true)
  }, [dimensions])

  // Initialize GSAP animations for network formation
  useEffect(() => {
    if (!isInitialized || !svgRef.current || nodes.length === 0) return

    // Clear previous timelines
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    // console.log("🚀 Starting animation with nodes:", nodes.length)

    const tl = gsap.timeline({
      onComplete: () => {
        // console.log('🎬 Network formation animation complete')
        setIsFormationComplete(true)
      }
    })

    // Animate nodes entering from entry positions to target positions
    nodes.forEach((node) => {
      const nodeEl = nodeRefs.current.get(node.id)
      if (!nodeEl) {
        console.warn(`❌ Node element not found for ${node.id}`)
        return
      }

      // Set initial properties at entry positions
      gsap.set(nodeEl, {
        cx: node.x,
        cy: node.y,
        opacity: 0,
        scale: 0,
        transformOrigin: "center",
      })

      tl.to(nodeEl, {
        cx: node.targetX,
        cy: node.targetY,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.2)",
      }, node.entryDelay)
    })
    // Optimize connection animation - group by layers
    const layerConnections = new Map<number, Connection[]>()
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.fromNode)
      if (fromNode) {
        const layer = fromNode.layer
        if (!layerConnections.has(layer)) {
          layerConnections.set(layer, [])
        }
        layerConnections.get(layer)?.push(conn)
      }
    })

    // Animate connections layer by layer - animate opacity only, positions are set correctly
    layerConnections.forEach((layerConns, layer) => {
      const delay = 1.0 + layer * 0.15
      layerConns.forEach((connection, index) => {
        const connEl = connectionRefs.current.get(connection.id)
        if (!connEl) {
          console.warn(`❌ Connection element not found: ${connection.id}`)
          return
        }
        const connectionDelay = delay + index * 0.002
        // Only animate opacity, let the connections stay at their target positions
        tl.to(connEl, {
          opacity: isDarkMode ? 0.25 : 0.4,
          duration: 0.4,
          ease: "power2.inOut",
        }, connectionDelay)
      })
    })

    timelineRef.current = tl

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [isInitialized, nodes, connections, isDarkMode])

  // Create wave propagation animation
  const createWavePropagation = useCallback(() => {
    if (!isFormationComplete || !svgRef.current) return

    // console.log('🌊 Creating wave propagation animation')

    // Clear previous wave timeline
    if (waveTimelineRef.current) {
      waveTimelineRef.current.kill()
    }

    const wl = gsap.timeline({
      repeat: -1,
      repeatDelay: 3 / animationSpeed,
      timeScale: animationSpeed,
    })

    // Pre-create signal pools to avoid DOM creation during animation
    const signalPool: SVGCircleElement[] = []
    const maxSignals = Math.min(150, connections.length * 0.3) // Scale with connection count

    for (let i = 0; i < maxSignals; i++) {
      const signal = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      signal.setAttribute("r", "4")
      signal.setAttribute("fill", colors.particle)
      signal.setAttribute("filter", "url(#glow)")
      signal.setAttribute("opacity", "0")
      svgRef.current?.querySelector(".signals")?.appendChild(signal)
      signalPool.push(signal)
    }

    let signalIndex = 0

    const inputNodes = nodes.filter(n => n.layer === 0)

    // Randomly select 2-4 input nodes (non-consecutive, random selection)
    const numActiveInputs = Math.min(inputNodes.length, Math.floor(Math.random() * 3) + 2) // 2-4 nodes
    const activeInputs: Node[] = []
    const usedIndices = new Set<number>()

    // Randomly pick non-consecutive nodes
    while (activeInputs.length < numActiveInputs && usedIndices.size < inputNodes.length) {
      const randomIndex = Math.floor(Math.random() * inputNodes.length)
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex)
        activeInputs.push(inputNodes[randomIndex])
      }
    }

    console.log('🔌 Active input nodes:', activeInputs.map(n => n.id))

    if (activeInputs.length === 0) return

    // Create forward propagation wave with optimized approach
    activeInputs.forEach((inputNode, waveIndex) => {
      // Small stagger delay (0.1s) instead of 0.8s to make them fire almost simultaneously
      const delay = waveIndex * 0

      // Pre-calculate activation patterns to reduce runtime computation
      const activationPlan: Array<{ layer: number, nodeIds: string[], delay: number }> = []

      for (let layer = 0; layer < networkLayers.length; layer++) {
        const layerDelay = delay + layer * 0.4
        let nodesToActivate: string[]

        if (layer === 0) {
          nodesToActivate = [inputNode.id]
        } else {
          // Use a more predictable activation pattern
          const layerNodes = nodes.filter(n => n.layer === layer)
          const activationCount = Math.max(1, Math.floor(layerNodes.length * 0.4))
          nodesToActivate = layerNodes
            .sort(() => 0.5 - Math.random())
            .slice(0, activationCount)
            .map(n => n.id)
        }

        activationPlan.push({
          layer,
          nodeIds: nodesToActivate,
          delay: layerDelay
        })
      }

      // Execute activation plan
      activationPlan.forEach(({ layer, nodeIds, delay: layerDelay }) => {
        nodeIds.forEach((nodeId, nodeIndex) => {
          const nodeEl = nodeRefs.current.get(nodeId)
          if (!nodeEl) {
            console.warn(`⚠️ Node element not found for activation: ${nodeId}`)
            return
          }

          const nodeDelay = layerDelay + nodeIndex * 0.03
          // const node = nodes.find(n => n.id === nodeId)

          // Optimized node activation - batch properties
          wl.to(nodeEl, {
            r: 12,
            fill: colors.activeNodeCenter,
            filter: "url(#strongGlow)",
            duration: 0.25,
            ease: "power2.out",
          }, nodeDelay)
            .to(nodeEl, {
              r: 8,
              fill: isDarkMode ? "url(#nodeGradient)" : "url(#lightNodeGradient)",
              filter: "none",
              duration: 0.35,
              ease: "power2.in",
            }, nodeDelay + 0.25)

          // Activate connections - limited to reduce computation
          if (layer < networkLayers.length - 1) {
            const outgoingConnections = connections
              .filter(conn => conn.fromNode === nodeId)
              .slice(0, 8) // Limit connections to improve performance


            outgoingConnections.forEach((conn, connIndex) => {
              const connEl = connectionRefs.current.get(conn.id)
              if (!connEl) {
                console.warn(`⚠️ Connection element not found: ${conn.id}`)
                return
              }

              const connDelay = nodeDelay + 0.1 + connIndex * 0.008

              // Batch connection properties
              wl.to(connEl, {
                stroke: colors.signal,
                strokeWidth: 2,
                opacity: 0.9,
                duration: 0.15,
                ease: "power2.out",
              }, connDelay)
                .to(connEl, {
                  stroke: colors.connection,
                  strokeWidth: 1,
                  opacity: isDarkMode ? 0.3 : 0.5,
                  duration: 0.25,
                  ease: "power2.in",
                }, connDelay + 0.15)

              // Use signal pool instead of creating new elements
              if (signalIndex < signalPool.length) {
                const signal = signalPool[signalIndex++]
                const fromNode = nodes.find(n => n.id === conn.fromNode)
                const toNode = nodes.find(n => n.id === conn.toNode)

                if (fromNode && toNode) {

                  // Reset and animate signal
                  gsap.set(signal, {
                    cx: fromNode.targetX,
                    cy: fromNode.targetY,
                    opacity: 0,
                    scale: 1
                  })

                  wl.to(signal, {
                    cx: toNode.targetX,
                    cy: toNode.targetY,
                    opacity: 0.8,
                    scale: 1.2,
                    duration: 0.3,
                    ease: "power1.inOut",
                  }, connDelay)
                    .to(signal, {
                      opacity: 0,
                      scale: 0.8,
                      duration: 0.1,
                    }, connDelay + 0.3)
                }
              }
            })
          }
        })
      })
    })

    // Reset signal index for next cycle
    wl.call(() => {
      signalIndex = 0
      // console.log('🔄 Wave cycle complete, resetting signal index')
    }, [], activeInputs.length * 0.8 + networkLayers.length * 0.4 + 1)

    waveTimelineRef.current = wl
    // console.log('✅ Wave propagation timeline created')
  }, [isFormationComplete, nodes, connections, colors, glowIntensity, isDarkMode, networkLayers, animationSpeed])

  // Start wave propagation after formation completes
  useEffect(() => {
    if (isFormationComplete) {
      // console.log('🎊 Formation complete, starting wave propagation')
      createWavePropagation()
    }

    return () => {
      if (waveTimelineRef.current) {
        // console.log('🧹 Cleaning up wave timeline')
        waveTimelineRef.current.kill()
      }
    }
  }, [isFormationComplete, createWavePropagation])

  // Clean up refs when nodes/connections change
  useEffect(() => {
    return () => {
      // console.log('🧹 Cleaning up node/connection refs')
      nodeRefs.current.clear()
      connectionRefs.current.clear()
      signalRefs.current.clear()
    }
  }, [])

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }


  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Neural Network Background */}
        <defs>
          {/* Node gradient */}
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.node} stopOpacity="1" />
            <stop offset="70%" stopColor={colors.node} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors.node} stopOpacity="0.3" />
          </radialGradient>
          {/* Active node gradient */}
          <radialGradient id="activeNodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.activeNodeCenter} stopOpacity="1" />
            <stop offset="30%" stopColor={colors.node} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.node} stopOpacity="0.5" />
          </radialGradient>
          {/* Light mode node gradient with better contrast */}
          <radialGradient id="lightNodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.node} stopOpacity="0.9" />
            <stop offset="70%" stopColor={colors.node} stopOpacity="0.7" />
            <stop offset="100%" stopColor={colors.node} stopOpacity="0.4" />
          </radialGradient>
          {/* Light mode active node gradient */}
          <radialGradient id="lightActiveNodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.activeNodeCenter} stopOpacity="1" />
            <stop offset="30%" stopColor={colors.node} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors.node} stopOpacity="0.6" />
          </radialGradient>
          {/* Glow filter - optimized */}
          <filter id="glow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation={2 * glowIntensity} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Strong glow filter - optimized */}
          <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={4 * glowIntensity} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Connection gradient */}
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.connection} stopOpacity="0.1" />
            <stop offset="50%" stopColor={colors.connection} stopOpacity="0.4" />
            <stop offset="100%" stopColor={colors.connection} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {/* Render connections */}
        <g className="connections">
          {connections.map((connection) => {
            const fromNode = nodes.find((n) => n.id === connection.fromNode)
            const toNode = nodes.find((n) => n.id === connection.toNode)
            if (!fromNode || !toNode) return null

            return (
              <line
                key={connection.id}
                ref={(el) => {
                  if (el) connectionRefs.current.set(connection.id, el)
                }}
                x1={fromNode.targetX}
                y1={fromNode.targetY}
                x2={toNode.targetX}
                y2={toNode.targetY}
                stroke={colors.connection}
                strokeWidth={1}
                opacity={0}
              />
            )
          })}
        </g>
        {/* Render nodes */}
        <g className="nodes">
          {nodes.map((node) => {
            // console.log(`📏 Label ${node.id} position:`, { x: node.x, y: node.y, width: dimensions.width })
            return (
              <circle
                key={node.id}
                ref={(el) => {
                  if (el) nodeRefs.current.set(node.id, el)
                }}
                cx={node.x}
                cy={node.y}
                r={node.size}
                fill={isDarkMode ? "url(#nodeGradient)" : "url(#lightNodeGradient)"}
                stroke={!isDarkMode ? colors.node : "none"}
                strokeWidth={!isDarkMode ? 1.5 : 0}
                strokeOpacity={!isDarkMode ? 0.8 : 0}
                opacity={0}
              />
            )
          }
          )}
        </g>

        {/* Layer labels */}
        <g className="labels">
          {networkLayers.map((layerSize, index) => {
            // Extract x positions for each layer from nodes
            const layerXPositions: number[] = []
            for (let i = 0; i < networkLayers.length; i++) {
              const layerNodes = nodes.filter(node => node.layer === i)
              if (layerNodes.length > 0) {
                // All nodes in a layer have the same targetX value
                layerXPositions.push(Math.round(layerNodes[0].targetX))
              } else {
                // Fallback if no nodes in this layer
                layerXPositions.push(Math.round((dimensions.width / (networkLayers.length + 1)) * (i + 1)))
              }
            }

            // Use x position from layer nodes instead of recalculating
            let x = layerXPositions[index]
            // console.log(`📏 Label ${index} position:`, { x, y: 100, width: dimensions.width })

            return (
              <svg key={index} xmlns="http://www.w3.org/2000/svg">
                <path
                  d=""
                  stroke="grey" />
                <text
                  key={index}
                  x={x}
                  y={100}
                  textAnchor="middle"
                  fill={isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.8)"}
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="400"
                >
                  {getLayerLabel(index)}({layerSize})
                </text>
              </svg>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

export default HeroNeuralNetwork

"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"


interface HeroNeuralNetworkProps {
  className?: string
  nodeColor?: string
  signalColor?: string
  particleColor?: string
  connectionColor?: string
  glowIntensity?: number
  animationSpeed?: number
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
}

interface Connection {
  id: string
  fromNode: string
  toNode: string
  opacity: number
  weight: number
  active: boolean
}

interface Signal {
  id: string
  connectionId: string
  progress: number
  speed: number
  active: boolean
  intensity: number
}

const HeroNeuralNetwork: React.FC<HeroNeuralNetworkProps> = ({
  className = "",
  nodeColor,
  signalColor,
  particleColor,
  connectionColor,
  glowIntensity = 0.8,
  animationSpeed = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [signals, setSignals] = useState<Signal[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Theme detection
  useEffect(() => {
    const checkTheme = () => {
      const htmlElement = document.documentElement
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const dataTheme = htmlElement.getAttribute('data-theme')

      // Check if explicitly set to light/dark or use system preference
      const isDark = dataTheme === 'dark' || (dataTheme === 'system' && isSystemDark) || (!dataTheme && isSystemDark)
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
    //   // Dark mode colors (current ones that look good)
    //   node: nodeColor || "#60a5fa",
    //   signal: signalColor || "#3b82f6", 
    //   particle: particleColor || "#93c5fd",
    //   connection: connectionColor || "#1e40af",
    //   activeNodeCenter: "#ffffff"
    // } : {
    //   // Light mode colors (vibrant and visible on light backgrounds)
    //   node: nodeColor || "#1d4ed8",
    //   signal: signalColor || "#2563eb",
    //   particle: particleColor || "#3b82f6", 
    //   connection: connectionColor || "#1e40af",
    //   activeNodeCenter: "#1e40af"
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

  // Define neural network structure
  const networkLayers = [5, 10, 10, 8, 6, 2] // Input, Hidden1, Hidden2, Output

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
        setDimensions({
          width: rect.width,
          height: rect.height,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Generate nodes and connections
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const newNodes: Node[] = []
    const newConnections: Connection[] = []

    // Calculate layer positions
    const layerSpacing = dimensions.width / (networkLayers.length + 1)
    const padding = 80

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
          targetX: layerX,
          targetY: targetY,
          layer: layerIndex,
          index: nodeIndex,
          size: 8,
          opacity: 0,
          active: false,
          activeIntensity: 0,
          entryDelay: layerIndex * 0.3 + nodeIndex * 0.1,
          entryDirection: direction,
        }

        newNodes.push(node)
      }
    })

    // Create connections between adjacent layers
    for (let layerIndex = 0; layerIndex < networkLayers.length - 1; layerIndex++) {
      const currentLayerNodes = newNodes.filter((n) => n.layer === layerIndex)
      const nextLayerNodes = newNodes.filter((n) => n.layer === layerIndex + 1)

      currentLayerNodes.forEach((fromNode) => {
        nextLayerNodes.forEach((toNode) => {
          // Connect all nodes in adjacent layers (fully connected)
          const connection: Connection = {
            id: `conn-${fromNode.id}-${toNode.id}`,
            fromNode: fromNode.id,
            toNode: toNode.id,
            opacity: 0,
            weight: Math.random() * 2 - 1, // Random weight between -1 and 1
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

  // Animation loop
  const animate = useCallback(() => {
    if (!isInitialized) return

    const currentTime = Date.now() / 1000

    // Update nodes - entry animation
    setNodes((prevNodes) => {
      return prevNodes.map((node) => {
        if (currentTime < node.entryDelay) {
          return node // Not time to start animation yet
        }

        const animationProgress = Math.min(1, (currentTime - node.entryDelay) / 1.5) // 1.5 second animation
        const easeProgress = 1 - Math.pow(1 - animationProgress, 3) // Ease out cubic

        // Interpolate position
        const newX = node.x + (node.targetX - node.x) * easeProgress * 0.1
        const newY = node.y + (node.targetY - node.y) * easeProgress * 0.1
        const newOpacity = Math.min(1, animationProgress * 2)

        // Update active state randomly
        let newActive = node.active
        let newActiveIntensity = node.activeIntensity

        if (node.active) {
          newActiveIntensity = Math.max(0, node.activeIntensity - 0.05)
          if (newActiveIntensity === 0) {
            newActive = false
          }
        } else if (Math.random() < 0.003 * animationSpeed && newOpacity > 0.8) {
          newActive = true
          newActiveIntensity = 1
        }

        return {
          ...node,
          x: newX,
          y: newY,
          opacity: newOpacity,
          active: newActive,
          activeIntensity: newActiveIntensity,
        }
      })
    })

    // Update connections - fade in after nodes are positioned
    setConnections((prevConnections) => {
      return prevConnections.map((connection) => {
        const fromNode = nodes.find((n) => n.id === connection.fromNode)
        const toNode = nodes.find((n) => n.id === connection.toNode)

        if (!fromNode || !toNode) return connection

        // Fade in connections after both nodes are visible
        const minOpacity = Math.min(fromNode.opacity, toNode.opacity)
        const targetOpacity = Math.min(0.3, minOpacity * 0.5)

        return {
          ...connection,
          opacity: Math.min(targetOpacity, connection.opacity + 0.01),
          active: fromNode.active || toNode.active,
        }
      })
    })

    // Generate signals randomly
    if (Math.random() < 0.05 * animationSpeed) {
      const availableConnections = connections.filter((c) => c.opacity > 0.1)
      if (availableConnections.length > 0) {
        const randomConnection = availableConnections[Math.floor(Math.random() * availableConnections.length)]

        const newSignal: Signal = {
          id: `signal-${Date.now()}-${Math.random()}`,
          connectionId: randomConnection.id,
          progress: 0,
          speed: 0.01 + Math.random() * 0.02,
          active: true,
          intensity: 0.5 + Math.random() * 0.5,
        }

        setSignals((prev) => [...prev, newSignal])
      }
    }

    // Update signals
    setSignals((prevSignals) => {
      return prevSignals
        .map((signal) => ({
          ...signal,
          progress: signal.progress + signal.speed * animationSpeed,
        }))
        .filter((signal) => signal.progress < 1)
    })

    animationRef.current = requestAnimationFrame(animate)
  }, [isInitialized, nodes, connections, animationSpeed])

  // Start animation
  useEffect(() => {
    if (isInitialized) {
      animationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, isInitialized])

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
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <g 
          className="network"
          style={{
            filter: `blur(2px)`,
            }}>
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
            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={3 * glowIntensity} result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
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
              if (!fromNode || !toNode || connection.opacity === 0) return null
              return (
                <line
                  key={connection.id}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={connection.active ? colors.signal : colors.connection}
                  strokeWidth={connection.active ? 2 : 1}
                  strokeOpacity={connection.active ? 0.8 : connection.opacity}
                  style={{
                    transition: "stroke-opacity 0.3s ease, stroke-width 0.3s ease",
                  }}
                />
              )
            })}
          </g>
          {/* Render signals */}
          <g className="signals">
            {signals.map((signal) => {
              const connection = connections.find((c) => c.id === signal.connectionId)
              if (!connection) return null
              const fromNode = nodes.find((n) => n.id === connection.fromNode)
              const toNode = nodes.find((n) => n.id === connection.toNode)
              if (!fromNode || !toNode) return null
              const x = fromNode.x + (toNode.x - fromNode.x) * signal.progress
              const y = fromNode.y + (toNode.y - fromNode.y) * signal.progress
              return (
                <circle
                  key={signal.id}
                  cx={x}
                  cy={y}
                  r={3}
                  fill={colors.particle}
                  opacity={signal.intensity * (1 - signal.progress * 0.5)}
                  filter="url(#glow)"
                />
              )
            })}
          </g>
          {/* Render nodes */}
          <g className="nodes">
            {nodes.map((node) => (
              <circle
                key={node.id}
                cx={node.x}
                cy={node.y}
                r={node.size * (1 + node.activeIntensity * 0.5)}
                fill={node.active ? "url(#activeNodeGradient)" : "url(#nodeGradient)"}
                stroke={node.active ? "black" : colors.node}
                strokeWidth={node.active ? 0.5 : 3}
                opacity={node.opacity}
                filter={node.active ? "url(#glow)" : "none"}
                style={{
                  transition: "r 0.3s ease-out",
                }}
              />
            ))}
          </g>
        </g>

        {/* Layer labels */}
        <g className="labels">
          {networkLayers.map((layerSize, index) => {
            const x = (dimensions.width / (networkLayers.length+1)) * (index+1)
            // const x = (dimensions.width / (networkLayers.length+1)) * (index+1)
            return (
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
                {getLayerLabel(index)} ({layerSize})
              </text>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

export default HeroNeuralNetwork
"use client"

interface ColorSettings {
  nodeColor: string
  signalColor: string
  particleColor: string
  errorColor: string
  glowIntensity: number
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private colors: ColorSettings

  constructor(canvas: HTMLCanvasElement, colors: ColorSettings) {
    this.canvas = canvas
    this.colors = colors

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Canvas 2D context not supported")
    }
    this.ctx = ctx
  }

  public resize(width: number, height: number): void {
    this.canvas.width = width
    this.canvas.height = height
  }

  public render(
    nodes: any[],
    connections: any[],
    particles: any[],
    activeNodes: Set<number>,
    activeConnections: Set<number>,
    backpropConnections: Set<number>,
  ): void {
    const ctx = this.ctx

    // Clear canvas with better performance
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Set rendering optimizations
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    // Render connections
    connections.forEach((connection, index) => {
      const fromNode = nodes[connection.fromIndex]
      const toNode = nodes[connection.toIndex]
      const isActive = activeConnections.has(index)
      const isBackprop = backpropConnections.has(index)

      ctx.beginPath()
      ctx.moveTo(fromNode.x, fromNode.y)
      ctx.lineTo(toNode.x, toNode.y)

      // Optimized color selection
      if (isBackprop) {
        ctx.strokeStyle = this.colors.errorColor
        ctx.lineWidth = Math.abs(connection.weight) * 2 + 1
      } else if (isActive) {
        ctx.strokeStyle = this.colors.signalColor
        ctx.lineWidth = Math.abs(connection.weight) * 2 + 1
      } else {
        ctx.strokeStyle = connection.weight > 0 ? "#10b981" : "#f59e0b"
        ctx.lineWidth = Math.abs(connection.weight) * 1.5 + 0.5
      }

      ctx.globalAlpha = isActive || isBackprop ? 0.9 : 0.4
      ctx.stroke()
    })

    // Render particles
    ctx.globalAlpha = 1
    particles.forEach((particle) => {
      if (!particle.active) return

      const connection = connections[particle.connectionIndex]
      if (!connection) return

      const fromNode = nodes[connection.fromIndex]
      const toNode = nodes[connection.toIndex]
      const x = fromNode.x + (toNode.x - fromNode.x) * particle.progress
      const y = fromNode.y + (toNode.y - fromNode.y) * particle.progress

      ctx.beginPath()
      ctx.arc(x, y, 3 + particle.intensity, 0, Math.PI * 2)
      ctx.fillStyle = particle.type === "forward" ? this.colors.particleColor : this.colors.errorColor

      // Add glow effect
      if (this.colors.glowIntensity > 0) {
        ctx.shadowColor = ctx.fillStyle
        ctx.shadowBlur = this.colors.glowIntensity * 8
        ctx.fill()
        ctx.shadowBlur = 0
      } else {
        ctx.fill()
      }
    })
  }

  public dispose(): void {
    // Nothing to dispose in Canvas renderer
  }
}

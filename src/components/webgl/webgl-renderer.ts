"use client"

// WebGL Shader Programs
const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute float a_size;
  attribute vec4 a_color;
  
  uniform vec2 u_resolution;
  
  varying vec4 v_color;
  
  void main() {
    // Convert position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;
    
    // Convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
    
    // Convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;
    
    // Flip Y coordinate so +Y is up
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    gl_PointSize = a_size;
    v_color = a_color;
  }
`

const FRAGMENT_SHADER = `
  precision mediump float;
  
  varying vec4 v_color;
  uniform float u_glowIntensity;
  
  void main() {
    float distance = length(gl_PointCoord - vec2(0.5, 0.5));
    float alpha = 1.0 - smoothstep(0.4, 0.5, distance);
    
    // Apply glow effect
    vec4 color = v_color;
    color.rgb += u_glowIntensity * 0.5 * (1.0 - distance * 2.0);
    
    gl_FragColor = vec4(color.rgb, color.a * alpha);
  }
`

const LINE_VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec4 a_color;
  
  uniform vec2 u_resolution;
  
  varying vec4 v_color;
  
  void main() {
    // Convert position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;
    
    // Convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
    
    // Convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;
    
    // Flip Y coordinate so +Y is up
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_color = a_color;
  }
`

const LINE_FRAGMENT_SHADER = `
  precision mediump float;
  
  varying vec4 v_color;
  
  void main() {
    gl_FragColor = v_color;
  }
`

interface ColorSettings {
  nodeColor: string
  signalColor: string
  particleColor: string
  errorColor: string
  glowIntensity: number
}

interface ShaderProgram {
  program: WebGLProgram
  attributes: Record<string, number>
  uniforms: Record<string, WebGLUniformLocation>
}

export class WebGLRenderer {
  private gl: WebGLRenderingContext | null = null
  private canvas: HTMLCanvasElement
  private pointProgram: ShaderProgram | null = null
  private lineProgram: ShaderProgram | null = null
  private colors: ColorSettings
  private drawCalls = 0
  private isInitialized = false

  constructor(canvas: HTMLCanvasElement, colors: ColorSettings) {
    this.canvas = canvas
    this.colors = colors

    try {
      this.initialize()
    } catch (error) {
      console.warn("WebGL initialization failed:", error)
      throw error
    }
  }

  private initialize(): void {
    // More permissive context creation options
    const contextOptions = [
      // Most basic configuration
      {
        alpha: false,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: "default" as WebGLPowerPreference,
        failIfMajorPerformanceCaveat: false,
      },
      // Fallback with alpha
      {
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
      },
      // Minimal options
      {
        failIfMajorPerformanceCaveat: false,
      },
      // No options at all
      {},
    ]

    const contextTypes = ["webgl2", "webgl", "experimental-webgl"]

    // Try each combination
    for (const contextType of contextTypes) {
      for (const options of contextOptions) {
        try {
          const gl = this.canvas.getContext(contextType, options) as WebGLRenderingContext

          if (gl) {
            this.gl = gl
            console.log(`WebGL renderer: Context created with ${contextType}`, options)
            break
          }
        } catch (e) {
          console.warn(`WebGL renderer: Failed to create ${contextType} context:`, e)
        }
      }
      if (this.gl) break
    }

    if (!this.gl) {
      throw new Error("WebGL not supported - no context available")
    }

    try {
      // Test basic WebGL functionality
      const version = this.gl.getParameter(this.gl.VERSION)
      console.log("WebGL renderer initialized with version:", version)

      // Enable blending for transparency
      this.gl.enable(this.gl.BLEND)
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)

      // Create shader programs with better error handling
      try {
        this.pointProgram = this.createShaderProgram(
          VERTEX_SHADER,
          FRAGMENT_SHADER,
          ["a_position", "a_size", "a_color"],
          ["u_resolution", "u_glowIntensity"],
        )
      } catch (error) {
        console.error("Failed to create point shader program:", error)
        throw new Error(`Point shader creation failed: ${error}`)
      }

      try {
        this.lineProgram = this.createShaderProgram(
          LINE_VERTEX_SHADER,
          LINE_FRAGMENT_SHADER,
          ["a_position", "a_color"],
          ["u_resolution"],
        )
      } catch (error) {
        console.error("Failed to create line shader program:", error)
        throw new Error(`Line shader creation failed: ${error}`)
      }

      // Set initial viewport
      this.resize(this.canvas.width, this.canvas.height)
      this.isInitialized = true
      console.log("WebGL renderer fully initialized")
    } catch (error) {
      console.error("WebGL shader initialization failed:", error)
      throw new Error(`WebGL initialization failed: ${error}`)
    }
  }

  private createShaderProgram(
    vertexSource: string,
    fragmentSource: string,
    attributes: string[],
    uniforms: string[],
  ): ShaderProgram {
    if (!this.gl) {
      throw new Error("WebGL context not available")
    }

    const gl = this.gl

    try {
      // Create and compile vertex shader
      const vertexShader = gl.createShader(gl.VERTEX_SHADER)
      if (!vertexShader) {
        throw new Error("Failed to create vertex shader")
      }

      gl.shaderSource(vertexShader, vertexSource)
      gl.compileShader(vertexShader)

      // Check for vertex shader compilation errors
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(vertexShader)
        gl.deleteShader(vertexShader)
        throw new Error(`Vertex shader compilation failed: ${info}`)
      }

      // Create and compile fragment shader
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
      if (!fragmentShader) {
        gl.deleteShader(vertexShader)
        throw new Error("Failed to create fragment shader")
      }

      gl.shaderSource(fragmentShader, fragmentSource)
      gl.compileShader(fragmentShader)

      // Check for fragment shader compilation errors
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(fragmentShader)
        gl.deleteShader(vertexShader)
        gl.deleteShader(fragmentShader)
        throw new Error(`Fragment shader compilation failed: ${info}`)
      }

      // Create shader program and link shaders
      const program = gl.createProgram()
      if (!program) {
        gl.deleteShader(vertexShader)
        gl.deleteShader(fragmentShader)
        throw new Error("Failed to create shader program")
      }

      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)

      // Check for linking errors
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program)
        gl.deleteShader(vertexShader)
        gl.deleteShader(fragmentShader)
        gl.deleteProgram(program)
        throw new Error(`Shader program linking failed: ${info}`)
      }

      // Clean up shaders (they're now part of the program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)

      // Get attribute locations
      const attributeLocations: Record<string, number> = {}
      attributes.forEach((attribute) => {
        const location = gl.getAttribLocation(program, attribute)
        if (location === -1) {
          console.warn(`Attribute ${attribute} not found in shader`)
        }
        attributeLocations[attribute] = location
      })

      // Get uniform locations
      const uniformLocations: Record<string, WebGLUniformLocation> = {}
      uniforms.forEach((uniform) => {
        const location = gl.getUniformLocation(program, uniform)
        if (!location) {
          console.warn(`Uniform ${uniform} not found in shader`)
        } else {
          uniformLocations[uniform] = location
        }
      })

      return {
        program,
        attributes: attributeLocations,
        uniforms: uniformLocations,
      }
    } catch (error) {
      console.error("Shader program creation failed:", error)
      throw error
    }
  }

  // Convert hex color to RGBA array
  private hexToRgba(hex: string, alpha = 1): number[] {
    // Handle both #RGB and #RRGGBB formats
    const cleanHex = hex.replace("#", "")
    let r, g, b

    if (cleanHex.length === 3) {
      r = Number.parseInt(cleanHex[0] + cleanHex[0], 16) / 255
      g = Number.parseInt(cleanHex[1] + cleanHex[1], 16) / 255
      b = Number.parseInt(cleanHex[2] + cleanHex[2], 16) / 255
    } else {
      r = Number.parseInt(cleanHex.slice(0, 2), 16) / 255
      g = Number.parseInt(cleanHex.slice(2, 4), 16) / 255
      b = Number.parseInt(cleanHex.slice(4, 6), 16) / 255
    }

    return [r, g, b, alpha]
  }

  // Resize WebGL viewport
  public resize(width: number, height: number): void {
    if (!this.gl || !this.isInitialized) return

    this.canvas.width = width
    this.canvas.height = height
    this.gl.viewport(0, 0, width, height)
  }

  // Check if WebGL is properly initialized
  public isReady(): boolean {
    return this.isInitialized && this.gl !== null
  }

  // Render the neural network
  public render(
    nodes: any[],
    connections: any[],
    particles: any[],
    activeNodes: Set<number>,
    activeConnections: Set<number>,
    backpropConnections: Set<number>,
  ): void {
    if (!this.gl || !this.isInitialized || !this.pointProgram || !this.lineProgram) {
      console.warn("WebGL renderer not properly initialized")
      return
    }

    const gl = this.gl
    this.drawCalls = 0

    try {
      // Clear the canvas
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Render connections
      this.renderConnections(connections, activeConnections, backpropConnections, nodes)

      // Render particles
      this.renderParticles(particles, connections, nodes)
    } catch (error) {
      console.error("WebGL render error:", error)
    }
  }

  private renderConnections(
    connections: any[],
    activeConnections: Set<number>,
    backpropConnections: Set<number>,
    nodes: any[],
  ): void {
    if (!this.gl || !this.lineProgram) return

    const gl = this.gl

    try {
      // Use the line program
      gl.useProgram(this.lineProgram.program)

      // Set resolution uniform
      if (this.lineProgram.uniforms.u_resolution) {
        gl.uniform2f(this.lineProgram.uniforms.u_resolution, this.canvas.width, this.canvas.height)
      }

      // Create buffers
      const positionBuffer = gl.createBuffer()
      const colorBuffer = gl.createBuffer()

      if (!positionBuffer || !colorBuffer) {
        console.warn("Failed to create WebGL buffers")
        return
      }

      // Enable attributes
      if (this.lineProgram.attributes.a_position !== -1) {
        gl.enableVertexAttribArray(this.lineProgram.attributes.a_position)
      }
      if (this.lineProgram.attributes.a_color !== -1) {
        gl.enableVertexAttribArray(this.lineProgram.attributes.a_color)
      }

      // Batch connections for better performance
      const batchSize = 500
      for (let i = 0; i < connections.length; i += batchSize) {
        const batch = connections.slice(i, i + batchSize)

        // Create position and color arrays for this batch
        const positions: number[] = []
        const colors: number[] = []

        batch.forEach((connection, idx) => {
          const batchIndex = i + idx
          const fromNode = nodes[connection.fromIndex]
          const toNode = nodes[connection.toIndex]

          if (!fromNode || !toNode) return

          // Add line vertices (from and to points)
          positions.push(fromNode.x, fromNode.y, toNode.x, toNode.y)

          // Determine connection color
          let color
          if (backpropConnections.has(batchIndex)) {
            color = this.hexToRgba(this.colors.errorColor, 0.9)
          } else if (activeConnections.has(batchIndex)) {
            color = this.hexToRgba(this.colors.signalColor, 0.9)
          } else {
            const baseColor = connection.weight > 0 ? "#10b981" : "#f59e0b"
            color = this.hexToRgba(baseColor, 0.4)
          }

          // Add colors for both vertices
          colors.push(...color, ...color)
        })

        if (positions.length === 0) continue

        // Upload position data
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
        if (this.lineProgram.attributes.a_position !== -1) {
          gl.vertexAttribPointer(this.lineProgram.attributes.a_position, 2, gl.FLOAT, false, 0, 0)
        }

        // Upload color data
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
        if (this.lineProgram.attributes.a_color !== -1) {
          gl.vertexAttribPointer(this.lineProgram.attributes.a_color, 4, gl.FLOAT, false, 0, 0)
        }

        // Draw lines
        gl.drawArrays(gl.LINES, 0, positions.length / 2)
        this.drawCalls++
      }

      // Clean up
      if (this.lineProgram.attributes.a_position !== -1) {
        gl.disableVertexAttribArray(this.lineProgram.attributes.a_position)
      }
      if (this.lineProgram.attributes.a_color !== -1) {
        gl.disableVertexAttribArray(this.lineProgram.attributes.a_color)
      }
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(colorBuffer)
    } catch (error) {
      console.error("Connection rendering error:", error)
    }
  }

  private renderParticles(particles: any[], connections: any[], nodes: any[]): void {
    if (!this.gl || !this.pointProgram || particles.length === 0) return

    const gl = this.gl

    try {
      gl.useProgram(this.pointProgram.program)

      // Set uniforms
      if (this.pointProgram.uniforms.u_resolution) {
        gl.uniform2f(this.pointProgram.uniforms.u_resolution, this.canvas.width, this.canvas.height)
      }
      if (this.pointProgram.uniforms.u_glowIntensity) {
        gl.uniform1f(this.pointProgram.uniforms.u_glowIntensity, this.colors.glowIntensity)
      }

      // Create buffers
      const positionBuffer = gl.createBuffer()
      const sizeBuffer = gl.createBuffer()
      const colorBuffer = gl.createBuffer()

      if (!positionBuffer || !sizeBuffer || !colorBuffer) {
        console.warn("Failed to create particle buffers")
        return
      }

      // Enable attributes
      if (this.pointProgram.attributes.a_position !== -1) {
        gl.enableVertexAttribArray(this.pointProgram.attributes.a_position)
      }
      if (this.pointProgram.attributes.a_size !== -1) {
        gl.enableVertexAttribArray(this.pointProgram.attributes.a_size)
      }
      if (this.pointProgram.attributes.a_color !== -1) {
        gl.enableVertexAttribArray(this.pointProgram.attributes.a_color)
      }

      // Prepare data arrays
      const positions: number[] = []
      const sizes: number[] = []
      const colors: number[] = []

      // Process particles
      particles.forEach((particle) => {
        if (!particle.active) return

        const connection = connections[particle.connectionIndex]
        if (!connection) return

        const fromNode = nodes[connection.fromIndex]
        const toNode = nodes[connection.toIndex]

        if (!fromNode || !toNode) return

        // Calculate particle position along the connection
        const x = fromNode.x + (toNode.x - fromNode.x) * particle.progress
        const y = fromNode.y + (toNode.y - fromNode.y) * particle.progress

        positions.push(x, y)

        // Particle size based on intensity
        sizes.push(6 + particle.intensity * 4)

        // Particle color
        const color =
          particle.type === "forward"
            ? this.hexToRgba(this.colors.particleColor, 0.9)
            : this.hexToRgba(this.colors.errorColor, 0.9)

        colors.push(...color)
      })

      if (positions.length === 0) {
        // Clean up empty buffers
        gl.deleteBuffer(positionBuffer)
        gl.deleteBuffer(sizeBuffer)
        gl.deleteBuffer(colorBuffer)
        return
      }

      // Upload position data
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
      if (this.pointProgram.attributes.a_position !== -1) {
        gl.vertexAttribPointer(this.pointProgram.attributes.a_position, 2, gl.FLOAT, false, 0, 0)
      }

      // Upload size data
      gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.STATIC_DRAW)
      if (this.pointProgram.attributes.a_size !== -1) {
        gl.vertexAttribPointer(this.pointProgram.attributes.a_size, 1, gl.FLOAT, false, 0, 0)
      }

      // Upload color data
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
      if (this.pointProgram.attributes.a_color !== -1) {
        gl.vertexAttribPointer(this.pointProgram.attributes.a_color, 4, gl.FLOAT, false, 0, 0)
      }

      // Draw points
      gl.drawArrays(gl.POINTS, 0, positions.length / 2)
      this.drawCalls++

      // Clean up
      if (this.pointProgram.attributes.a_position !== -1) {
        gl.disableVertexAttribArray(this.pointProgram.attributes.a_position)
      }
      if (this.pointProgram.attributes.a_size !== -1) {
        gl.disableVertexAttribArray(this.pointProgram.attributes.a_size)
      }
      if (this.pointProgram.attributes.a_color !== -1) {
        gl.disableVertexAttribArray(this.pointProgram.attributes.a_color)
      }
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(sizeBuffer)
      gl.deleteBuffer(colorBuffer)
    } catch (error) {
      console.error("Particle rendering error:", error)
    }
  }

  // Get the number of draw calls in the last frame
  public getDrawCalls(): number {
    return this.drawCalls
  }

  // Clean up WebGL resources
  public dispose(): void {
    if (!this.gl) return

    try {
      // Delete shader programs
      if (this.pointProgram) {
        this.gl.deleteProgram(this.pointProgram.program)
      }
      if (this.lineProgram) {
        this.gl.deleteProgram(this.lineProgram.program)
      }

      // Reset state
      this.pointProgram = null
      this.lineProgram = null
      this.isInitialized = false
    } catch (error) {
      console.error("WebGL disposal error:", error)
    }
  }
}

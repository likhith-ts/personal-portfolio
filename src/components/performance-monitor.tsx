"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"

interface PerformanceMetrics {
  fps: number
  frameTime: number
  memoryUsage: number
  renderTime: number
}

export const PerformanceMonitor: React.FC<{ isVisible?: boolean }> = ({ isVisible = false }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    renderTime: 0,
  })

  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!isVisible) return

    const updateMetrics = () => {
      const now = performance.now()
      frameCountRef.current++

      if (now - lastTimeRef.current >= 1000) {
        const fps = frameCountRef.current
        const frameTime = 1000 / fps

        // Memory usage (if available)
        const memoryUsage = (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0

        setMetrics({
          fps,
          frameTime,
          memoryUsage,
          renderTime: now - lastTimeRef.current,
        })

        frameCountRef.current = 0
        lastTimeRef.current = now
      }

      animationFrameRef.current = requestAnimationFrame(updateMetrics)
    }

    animationFrameRef.current = requestAnimationFrame(updateMetrics)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>FPS: {metrics.fps}</div>
        <div>Frame Time: {metrics.frameTime.toFixed(2)}ms</div>
        <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
        <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Play, Pause, RotateCcw, Volume2, VolumeX, HelpCircle, X } from "lucide-react"

export default function TimeLoopGame() {
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [targetAngle, setTargetAngle] = useState(0)
  const [targetSize, setTargetSize] = useState(30)
  const [clickedAngle, setClickedAngle] = useState<number | null>(null)
  const [perfectHit, setPerfectHit] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showDesktopIcons, setShowDesktopIcons] = useState(true)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState("4:25 AM")
  const animationRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)
  const successSoundRef = useRef<HTMLAudioElement | null>(null)
  const failSoundRef = useRef<HTMLAudioElement | null>(null)

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const ampm = hours >= 12 ? "PM" : "AM"
      const formattedHours = hours % 12 || 12
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
      setCurrentTime(`${formattedHours}:${formattedMinutes} ${ampm}`)
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Safe audio play function to handle errors
  const safePlayAudio = (audioElement: HTMLAudioElement | null, options?: { playbackRate?: number }) => {
    if (!audioElement || muted) return

    try {
      if (options?.playbackRate) {
        audioElement.playbackRate = options.playbackRate
      }

      // Only attempt to play if the audio element has a source
      const playPromise = audioElement.play()

      // Handle the play promise to avoid uncaught promise rejections
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Audio play error:", error)
          // We'll silently fail if audio can't be played
        })
      }
    } catch (error) {
      console.log("Audio play error:", error)
    }
  }

  // Initialize audio elements with error handling
  useEffect(() => {
    // We'll use a try-catch block to handle potential audio loading errors
    try {
      if (typeof window !== "undefined") {
        // Create audio elements but don't try to load non-existent files in the sandbox
        audioRef.current = new Audio()
        audioRef.current.volume = 0.5
        audioRef.current.loop = true

        clickSoundRef.current = new Audio()
        successSoundRef.current = new Audio()
        failSoundRef.current = new Audio()
      }
    } catch (error) {
      console.log("Audio initialization error:", error)
    }

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause()
        } catch (error) {
          console.log("Audio cleanup error:", error)
        }
      }
    }
  }, [])

  // Animation loop
  useEffect(() => {
    if (gameState === "playing") {
      let lastTime = 0

      const animate = (time: number) => {
        if (lastTime === 0) {
          lastTime = time
        }

        const deltaTime = time - lastTime
        lastTime = time

        setRotation((prev) => (prev + speed * deltaTime * 0.05) % 360)
        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)

      // Start background music with error handling
      safePlayAudio(audioRef.current, { playbackRate: 1.0 })
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)

      // Pause background music with error handling
      if (audioRef.current) {
        try {
          audioRef.current.pause()
        } catch (error) {
          console.log("Audio pause error:", error)
        }
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState, speed, muted])

  const startGame = () => {
    // Generate random target position
    const newTargetAngle = Math.floor(Math.random() * 360)
    setTargetAngle(newTargetAngle)
    setTargetSize(Math.max(30 - score, 15)) // Target gets smaller as score increases
    setSpeed(1 + score * 0.2) // Speed increases with score
    setGameState("playing")
    setClickedAngle(null)
    setPerfectHit(false)
    setShowDesktopIcons(false)

    // Adjust music speed based on game speed with error handling
    safePlayAudio(audioRef.current, { playbackRate: Math.min(1 + score * 0.1, 2.0) })
  }

  const handleClick = () => {
    if (gameState === "ready") {
      startGame()
      return
    }

    if (gameState === "playing") {
      // Play click sound with error handling
      safePlayAudio(clickSoundRef.current)

      setClickedAngle(rotation)

      // Check if the click was within the target zone
      const angleDifference = Math.abs(((rotation - targetAngle + 180) % 360) - 180)

      if (angleDifference <= targetSize / 2) {
        // Hit the target
        const perfectHitThreshold = 5
        const isPerfect = angleDifference <= perfectHitThreshold
        setPerfectHit(isPerfect)

        // Calculate points - more points for more accurate hits
        const pointsEarned = isPerfect ? 10 : Math.ceil((1 - angleDifference / (targetSize / 2)) * 5)

        // Play success sound with error handling
        safePlayAudio(successSoundRef.current)

        setScore((prev) => prev + pointsEarned)

        // Short delay before next round
        setTimeout(() => {
          startGame()
        }, 1000)
      } else {
        // Missed the target - game over
        safePlayAudio(failSoundRef.current)

        setGameState("gameover")
        setShowDesktopIcons(true)

        // Update high score if needed
        if (score > highScore) {
          setHighScore(score)
        }
      }
    }
  }

  const resetGame = () => {
    setGameState("ready")
    setScore(0)
    setSpeed(1)
    setRotation(0)
    setShowDesktopIcons(true)
  }

  const toggleMute = () => {
    setMuted(!muted)
    if (audioRef.current) {
      if (muted) {
        safePlayAudio(audioRef.current, { playbackRate: Math.min(1 + score * 0.1, 2.0) })
      } else {
        try {
          audioRef.current.pause()
        } catch (error) {
          console.log("Audio pause error:", error)
        }
      }
    }
  }

  // Calculate colors based on the game state
  const getRingColor = () => {
    if (gameState === "gameover") return "rgb(255, 50, 50)"
    return "rgb(255, 50, 255)"
  }

  const getTargetColor = () => {
    if (perfectHit) return "rgb(255, 215, 0)" // Gold for perfect hits
    return "rgb(0, 255, 200)"
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: `url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vvyd8mESQA9sKaLEZHaTnLziKDhAgl.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Desktop-style top bar */}
      <div className="absolute top-0 left-0 right-0 bg-pink-500/80 backdrop-blur-sm text-white p-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-bold">🎮 Time Loop OS</span>
          <span className="text-sm">File</span>
          <span className="text-sm">Edit</span>
          <span className="text-sm">View</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className="p-1 hover:bg-pink-600 rounded-full"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button onClick={() => setShowHelp(true)} className="p-1 hover:bg-pink-600 rounded-full" aria-label="Help">
            <HelpCircle size={16} />
          </button>
          <span className="text-sm">Balance: 0.57 Credits</span>
          <span className="text-sm">{currentTime}</span>
        </div>
      </div>

      {/* Desktop icons - only show when not playing */}
      {showDesktopIcons && (
        <div className="absolute top-16 right-8 flex flex-col gap-6">
          <div className="flex flex-col items-center cursor-pointer hover:opacity-80">
            <div className="w-12 h-12 bg-pink-300/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <span className="text-xs text-white bg-black/50 px-2 py-1 mt-1 rounded">Leaderboard</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer hover:opacity-80">
            <div className="w-12 h-12 bg-pink-300/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
            <span className="text-xs text-white bg-black/50 px-2 py-1 mt-1 rounded">Soundtrack</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer hover:opacity-80">
            <div className="w-12 h-12 bg-pink-300/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <span className="text-xs text-white bg-black/50 px-2 py-1 mt-1 rounded">Settings</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer hover:opacity-80" onClick={startGame}>
            <div className="w-12 h-12 bg-cyan-300/50 backdrop-blur-sm rounded-lg flex items-center justify-center animate-pulse">
              <span className="text-2xl">🎮</span>
            </div>
            <span className="text-xs text-white bg-black/50 px-2 py-1 mt-1 rounded">Start Game</span>
          </div>
        </div>
      )}

      {/* Help modal */}
      {showHelp && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-pink-500 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-pink-300">How to Play</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close help"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 text-gray-200">
              <p>
                🎯 <strong>Objective:</strong> Stop the rotating indicator when it aligns with the target zone.
              </p>
              <p>
                ⏱️ <strong>Timing:</strong> The more precise your timing, the more points you earn.
              </p>
              <p>
                🔄 <strong>Difficulty:</strong> The game speeds up and targets get smaller as you score more points.
              </p>
              <p>
                ✨ <strong>Perfect Hits:</strong> Stopping exactly on target earns bonus points!
              </p>
              <p>
                💡 <strong>Tip:</strong> Focus on the rhythm to anticipate when to click.
              </p>
            </div>
            <Button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              Got it!
            </Button>
          </div>
        </div>
      )}

      {/* Main game container with glassmorphism effect */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 w-full max-w-md backdrop-blur-sm bg-black/30 p-8 rounded-xl border border-white/20">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-2">
            Time Loop
          </h1>
          <p className="text-pink-300 text-lg">Reaction Test</p>
        </div>

        <div className="relative w-80 h-80">
          {/* Main rotating ring */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ rotate: `${rotation}deg` }}
          >
            <div className="relative w-64 h-64 rounded-full border-4 border-pink-500/50 flex items-center justify-center">
              {/* Indicator line */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-12 rounded-full"
                style={{
                  backgroundColor: getRingColor(),
                  boxShadow: `0 0 10px ${getRingColor()}, 0 0 20px ${getRingColor()}`,
                }}
              />

              {/* Inner circle */}
              <div className="w-48 h-48 rounded-full border-2 border-purple-500/70 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <div className="text-4xl font-bold text-pink-500">{gameState === "gameover" ? "💔" : score}</div>
              </div>
            </div>
          </motion.div>

          {/* Target zone */}
          {gameState === "playing" && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ rotate: `${targetAngle}deg` }}>
              <div className="relative w-64 h-64 rounded-full">
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: "4px",
                    height: `${targetSize}px`,
                    backgroundColor: getTargetColor(),
                    boxShadow: `0 0 10px ${getTargetColor()}, 0 0 20px ${getTargetColor()}`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Clicked position indicator */}
          {clickedAngle !== null && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ rotate: `${clickedAngle}deg` }}>
              <div className="relative w-64 h-64 rounded-full">
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-10 rounded-full bg-white"
                  style={{
                    opacity: 0.7,
                    boxShadow: "0 0 5px rgba(255, 255, 255, 0.7)",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <Card className="w-full bg-gray-900/80 border-pink-500 p-4 text-center backdrop-blur-sm">
          {gameState === "ready" && (
            <div className="space-y-4">
              <p className="text-pink-300">Click to start the game</p>
              <p className="text-gray-400 text-sm">Stop the ring when it aligns with the target</p>
              <Button
                onClick={handleClick}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Play className="mr-2 h-4 w-4" /> Start Game
              </Button>
            </div>
          )}

          {gameState === "playing" && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Score</p>
                  <p className="text-pink-300 text-xl">{score}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">High Score</p>
                  <p className="text-purple-300 text-xl">{highScore}</p>
                </div>
              </div>
              <Button
                onClick={handleClick}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                <Pause className="mr-2 h-4 w-4" /> Stop!
              </Button>
            </div>
          )}

          {gameState === "gameover" && (
            <div className="space-y-4">
              <p className="text-pink-300 text-xl">Game Over!</p>
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Final Score</p>
                  <p className="text-pink-300 text-xl">{score}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">High Score</p>
                  <p className="text-purple-300 text-xl">{highScore}</p>
                </div>
              </div>
              <Button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Play Again
              </Button>
            </div>
          )}
        </Card>

        {/* Instructions */}
        <div className="text-gray-200 text-sm text-center max-w-xs bg-black/50 p-2 rounded-lg">
          <p>
            Click to stop the ring when the indicator aligns with the target zone. Perfect timing gives bonus points!
          </p>
        </div>
      </div>

      {/* Desktop-style dock at bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-pink-500/70 backdrop-blur-sm rounded-xl p-2 flex items-center gap-2">
        {["🎮", "🎵", "🌐", "📊", "💬", "📱", "🎨", "⚙️"].map((icon, index) => (
          <div
            key={index}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:bg-white/20 ${
              icon === "🎮" && gameState === "playing" ? "bg-white/30" : ""
            }`}
          >
            <span className="text-xl">{icon}</span>
          </div>
        ))}
      </div>
    </div>
  )
}


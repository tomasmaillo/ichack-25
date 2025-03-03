import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useMemo, useEffect } from 'react'
import { balloons } from 'balloons-js'

// Types for clarity
type Score = {
  participant_id: string
  participant_name?: string
  score: number
  time_taken: number
}

type Participant = {
  id: string
  name: string
}

interface PodiumProps {
  scores: Score[]
  participants: Participant[]
  onContinue: () => void
  isFinalRound?: boolean
}

const COLORS = {
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  other: '#A1A1AA',
}

const Podium = ({
  scores,
  participants,
  onContinue,
  isFinalRound = false,
}: PodiumProps) => {
  // Add useEffect for the balloons
  useEffect(() => {
    if (isFinalRound) {
      // Launch balloons multiple times for extra fun! 🎈
      balloons()
      setTimeout(() => balloons(), 1000)
      setTimeout(() => balloons(), 2000)
    }
  }, [isFinalRound])

  // 1. No fetching from Supabase here. We already have participants from props.

  // 2. Build enriched scores: add a `participant_name` from participants[] if missing
  const enrichedScores = useMemo(() => {
    return scores.map((score) => {
      // Attempt to find participant name
      const participant = participants.find(
        (p) => p.id === score.participant_id
      )
      return {
        ...score,
        participant_name: participant?.name ?? 'Unknown',
      }
    })
  }, [scores, participants])

  // 3. Sort by highest score, then by lowest time
  const sortedScores = useMemo(() => {
    if (enrichedScores.length === 0) return []
    return [...enrichedScores].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.time_taken - b.time_taken
    })
  }, [enrichedScores])

  // 4. Group for ties
  const rankedScores = useMemo(() => {
    if (sortedScores.length === 0) return []
    return sortedScores.reduce((acc, score, idx) => {
      if (idx === 0) {
        acc.push([score])
      } else {
        const prevScore = sortedScores[idx - 1]
        if (
          prevScore.score === score.score &&
          prevScore.time_taken === score.time_taken
        ) {
          acc[acc.length - 1].push(score)
        } else {
          acc.push([score])
        }
      }
      return acc
    }, [] as Score[][])
  }, [sortedScores])

  // 5. If no ranked scores, show loading
  if (!rankedScores.length) {
    return (
      <div className="fixed inset-0 bg-blue-500 bg-opacity-95 flex items-center justify-center z-50">
        <div className="text-white text-2xl">Loading scores...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-blue-500 bg-opacity-95 flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-12">
        <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-4xl font-bold text-white">
          {isFinalRound ? '🎉 GAME OVER! 🎉' : 'Round Results!'}
        </h2>
        {isFinalRound && rankedScores[0] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-2xl text-yellow-300 font-bold">
            🏆 Winner is {rankedScores[0][0].participant_name}! 🏆
          </motion.div>
        )}
      </motion.div>

      <div className="flex justify-center items-end gap-4 mb-12">
        {rankedScores.slice(0, 5).map((rankGroup, rankIndex) => {
          const height = 150 - rankIndex * 25
          const color =
            rankIndex === 0
              ? COLORS.gold
              : rankIndex === 1
              ? COLORS.silver
              : rankIndex === 2
              ? COLORS.bronze
              : COLORS.other

          return rankGroup.map((score) => (
            <motion.div
              key={score.participant_id}
              className="flex flex-col items-center"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: rankIndex * 0.2 }}>
              <div className="text-white mb-2">
                <p className="text-2xl font-montserrat font-bold">
                  {score.participant_name}
                </p>
                <p className="text-sm opacity-75">{score.score} points</p>
                <p className="text-xs opacity-75">{score.time_taken}s</p>
              </div>
              <div
                style={{
                  height: `${height}px`,
                  backgroundColor: color,
                  width: '80px',
                }}
                className="rounded-t-lg shadow-lg"
              />
              <div className="mt-2 text-2xl">
                {rankIndex === 0
                  ? '🥇'
                  : rankIndex === 1
                  ? '🥈'
                  : rankIndex === 2
                  ? '🥉'
                  : '‎'}
              </div>
            </motion.div>
          ))
        })}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={onContinue}
        className="px-8 py-4 text-xl font-bold text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors shadow-lg">
        {isFinalRound ? '🎮 Start New Game 🎮' : 'Continue to Next Round'}
      </motion.button>
    </div>
  )
}

export default Podium

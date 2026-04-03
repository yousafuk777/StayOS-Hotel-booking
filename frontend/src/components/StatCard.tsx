'use client'

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  color: 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'teal'
  subtext?: string
  onClick?: () => void
  isActive?: boolean
  progress?: number // Optional progress percentage (0-100)
  total?: number // Optional total for progress calculation
}

const colorMap = {
  blue: {
    border: 'border-blue-500',
    ring: 'ring-blue-500',
    bg: 'bg-blue-50',
  },
  red: {
    border: 'border-red-500',
    ring: 'ring-red-500',
    bg: 'bg-red-50',
  },
  green: {
    border: 'border-green-500',
    ring: 'ring-green-500',
    bg: 'bg-green-50',
  },
  purple: {
    border: 'border-purple-500',
    ring: 'ring-purple-500',
    bg: 'bg-purple-50',
  },
  orange: {
    border: 'border-orange-500',
    ring: 'ring-orange-500',
    bg: 'bg-orange-50',
  },
  teal: {
    border: 'border-teal-500',
    ring: 'ring-teal-500',
    bg: 'bg-teal-50',
  },
}

export default function StatCard({
  label,
  value,
  icon,
  color,
  subtext,
  onClick,
  isActive = false,
  progress,
  total,
}: StatCardProps) {
  const colors = colorMap[color]
  const isClickable = onClick !== undefined

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`glass-card rounded-2xl p-6 card-hover border-l-4 ${colors.border} ${
        isClickable ? 'cursor-pointer transition-all' : 'cursor-default'
      } ${
        isClickable && isActive ? `ring-2 ${colors.ring} ${colors.bg}` : ''
      }`}
    >
      <div className="flex items-center justify-between text-left">
        <div>
          <p className="text-[#2D4A42] font-medium mb-2">{label}</p>
          <p className="text-4xl font-bold gradient-text">{value}</p>
          {subtext && <p className="text-sm text-[#2D4A42] mt-1">{subtext}</p>}
          {progress !== undefined && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${colors.border.replace('border-', 'bg-')}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-[#2D4A42] mt-1">{progress}% {total ? `of ${total}` : ''}</p>
            </div>
          )}
        </div>
        <div className="text-5xl">{icon}</div>
      </div>
    </button>
  )
}

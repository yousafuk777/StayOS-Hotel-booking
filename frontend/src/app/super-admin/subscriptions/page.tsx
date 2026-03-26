export default function SubscriptionsComingSoon() {
  return (
    <div className="w-full flex items-center justify-center min-h-[60vh]">
      <div className="glass-card rounded-2xl p-12 text-center max-w-lg slide-up border border-white/10">
        <div className="text-6xl mb-6 float">💳</div>
        <h1 className="text-4xl font-bold gradient-text mb-4">Subscriptions</h1>
        <h2 className="text-2xl font-semibold text-white/80 mb-4">Coming Soon</h2>
        <p className="text-white/60 text-lg mb-8">
          This system module is currently under active development. Stay tuned for updates!
        </p>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full pulse"></div>
      </div>
    </div>
  )
}

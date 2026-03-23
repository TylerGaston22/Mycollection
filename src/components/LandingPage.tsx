import { Button } from "./ui/button";
import { Film, Tv, UtensilsCrossed, MapPin, Star, CheckCircle2, Grid3x3, List, Sparkles } from "lucide-react";

interface LandingPageProps {
  onSignIn: () => void;
}

export function LandingPage({ onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative z-10">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-8 w-8 text-orange-500" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              My Collection
            </h1>
            <Sparkles className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Your personal hub for tracking movies, TV shows, restaurants, and places to visit. 
            Never forget what you've watched or where you want to go next.
          </p>
          <Button 
            onClick={onSignIn} 
            size="lg" 
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Track Multiple Categories */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-orange-500/20 to-purple-500/20 p-3 rounded-xl">
                <Grid3x3 className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Track Everything</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Organize your content across four categories with beautiful grid and list views.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Film className="h-4 w-4 text-orange-400" />
                <span>Movies</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Tv className="h-4 w-4 text-purple-400" />
                <span>TV Shows</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <UtensilsCrossed className="h-4 w-4 text-blue-400" />
                <span>Restaurants</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-green-400" />
                <span>Places</span>
              </div>
            </div>
          </div>

          {/* Custom Organization */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3 rounded-xl">
                <Star className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Custom Organization</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Create custom tabs and sections to organize your collection exactly how you want.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Add custom categories</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Create custom sections</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Mark favorites</span>
              </li>
            </ul>
          </div>

          {/* Flexible Views */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-green-500/20 p-3 rounded-xl">
                <List className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Flexible Views</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Switch between grid and list views to see your collection the way you prefer.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Visual grid with posters</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Detailed list view</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Click to mark as watched</span>
              </li>
            </ul>
          </div>

          {/* Multiple Profiles */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-green-500/20 to-orange-500/20 p-3 rounded-xl">
                <Sparkles className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Personal Profiles</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Each user gets their own personalized collection with custom settings and preferences.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Profile customization</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Switch between profiles</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Desktop & mobile layouts</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10 border border-orange-500/20 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to organize your collection?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Start tracking your favorite movies, shows, restaurants, and travel destinations all in one beautiful, easy-to-use interface.
          </p>
          <Button 
            onClick={onSignIn} 
            size="lg" 
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Sign In to Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * LandingPage – public marketing page shown before sign-in.
 * Showcases the app's key features (multi-category tracking, custom
 * organisation, flexible views, personal profiles) with a hero
 * section and a call-to-action that routes to the sign-in flow.
 *
 * Colours use the page-chrome tokens (text-page-fg, bg-page-surface,
 * border-page-divider, etc.) so the page repaints correctly under the
 * default dark surface AND the Coffee cream surface without hardcoding
 * any colour values. See `docs/coding-standards.md` for the rule.
 */
import { Button } from "../components/ui/button";
import { Film, Tv, UtensilsCrossed, MapPin, Star, CheckCircle2, Grid3x3, List, Sparkles } from "lucide-react";

interface LandingPageProps {
  onSignIn: () => void;
}

// Single source of truth for the feature-card chrome — backdrop, border,
// padding, hover state. Without this, the same string was repeated 4×
// across the four feature cards below.
const FEATURE_CARD_CLASS =
  "bg-page-surface backdrop-blur-sm border border-page-divider rounded-2xl p-6 hover:bg-page-surface-hover transition-all";

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
          <p className="text-xl text-page-fg-subtle mb-8 max-w-2xl mx-auto">
            Your personal hub for tracking items, TV shows, restaurants, and places to visit.
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
          <div className={FEATURE_CARD_CLASS}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-orange-500/20 to-purple-500/20 p-3 rounded-xl">
                <Grid3x3 className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-page-fg">Track Everything</h3>
            </div>
            <p className="text-page-fg-subtle mb-4">
              Organize your content across four categories with beautiful grid and list views.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-page-fg-muted">
                <Film className="h-4 w-4 text-orange-400" />
                <span>Movies</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-page-fg-muted">
                <Tv className="h-4 w-4 text-purple-400" />
                <span>TV Shows</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-page-fg-muted">
                <UtensilsCrossed className="h-4 w-4 text-blue-400" />
                <span>Restaurants</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-page-fg-muted">
                <MapPin className="h-4 w-4 text-green-400" />
                <span>Places</span>
              </div>
            </div>
          </div>

          {/* Custom Organization */}
          <div className={FEATURE_CARD_CLASS}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3 rounded-xl">
                <Star className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-page-fg">Custom Organization</h3>
            </div>
            <p className="text-page-fg-subtle mb-4">
              Create custom tabs and sections to organize your collection exactly how you want.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-page-fg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Add custom categories</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-page-fg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Create custom sections</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-page-fg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Mark favorites</span>
              </li>
            </ul>
          </div>

          {/* Flexible Views */}
          <div className={FEATURE_CARD_CLASS}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-green-500/20 p-3 rounded-xl">
                <List className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-page-fg">Flexible Views</h3>
            </div>
            <p className="text-page-fg-subtle mb-4">
              Switch between grid and list views to see your collection the way you prefer.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-page-fg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Visual grid with posters</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-page-fg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Detailed list view</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-page-fg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Click to mark as watched</span>
              </li>
            </ul>
          </div>

          {/* Multiple Profiles */}
          <div className={FEATURE_CARD_CLASS}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-green-500/20 to-orange-500/20 p-3 rounded-xl">
                <Sparkles className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-page-fg">Personal Profiles</h3>
            </div>
            <p className="text-page-fg-subtle mb-4">
              Each user gets their own personalized collection with custom settings and preferences.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-page-fg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Profile customization</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-page-fg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Switch between profiles</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-page-fg-muted">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Desktop & mobile layouts</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

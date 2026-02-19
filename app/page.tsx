import Link from 'next/link';
import { Calendar, Sparkles, Users, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">EventScheduler</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Smart Event Scheduling
              <span className="text-primary-600"> Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Organize your events, invite participants, and let AI help you create 
              the perfect schedule. All in one beautiful, intuitive platform.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/register" className="btn-primary text-lg px-8 py-3">
                Start Free
              </Link>
              <Link href="/login" className="btn-secondary text-lg px-8 py-3">
                Sign In
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Event Management</h3>
              <p className="text-gray-600">
                Create, edit, and manage all your events in one place. Track status and never miss an important date.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Invite & Collaborate</h3>
              <p className="text-gray-600">
                Invite participants via email, track responses, and keep everyone in sync with your events.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered Features</h3>
              <p className="text-gray-600">
                Let AI generate descriptions, suggest optimal times, and summarize your weekly schedule.
              </p>
            </div>
          </div>

          {/* AI Features Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center mb-12">AI-Powered Scheduling</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Smart Description Generator</h4>
                    <p className="text-gray-600 text-sm">
                      Enter your event title and let AI craft a polished, professional description automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Best Time Suggestion</h4>
                    <p className="text-gray-600 text-sm">
                      Get AI recommendations for optimal event timing based on the event type and productivity patterns.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Weekly Summary</h4>
                    <p className="text-gray-600 text-sm">
                      Get an AI-generated summary of your upcoming week&apos;s events and commitments.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Location Suggestions</h4>
                    <p className="text-gray-600 text-sm">
                      Receive smart venue recommendations based on your event type and requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-gray-900">EventScheduler</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 EventScheduler. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

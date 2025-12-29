import { Link } from 'react-router-dom';
import { 
  BeakerIcon, 
  HeartIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating Medical Icons */}
        <div className="absolute top-1/4 right-1/4 animate-float opacity-10">
          <HeartIcon className="w-16 h-16 text-red-500" />
        </div>
        <div className="absolute top-3/4 left-1/4 animate-float opacity-10" style={{ animationDelay: '1s' }}>
          <BeakerIcon className="w-20 h-20 text-blue-500" />
        </div>
        <div className="absolute top-1/3 left-1/3 animate-float opacity-10" style={{ animationDelay: '2s' }}>
          <ShieldCheckIcon className="w-24 h-24 text-green-500" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-xl sticky top-0 z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">HealthAI </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold hover:scale-105"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                Get Started
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg mb-8 animate-fadeIn border-2 border-blue-200">
            <SparklesIcon className="w-5 h-5 text-blue-600 animate-pulse" />
            <span className="text-sm font-semibold text-blue-900">AI-Powered Health Technology</span>
          </div>
          
          <h1 className="text-6xl font-extrabold text-gray-900 mb-6 animate-fadeIn leading-tight">
            AI-Powered  Health
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mt-3 animate-gradient">
              Monitoring & Detection
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto animate-fadeIn leading-relaxed" style={{ animationDelay: '200ms' }}>
            Upload CT scans, get instant AI predictions with <span className="font-bold text-blue-600">99.9%+ accuracy</span>, 
            personalized health insights, and chat with our intelligent health assistant - all in one secure platform.
          </p>
          <div className="flex justify-center gap-4 animate-fadeIn" style={{ animationDelay: '400ms' }}>
            <Link
              to="/register"
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-2xl hover:shadow-blue-300/50 hover:scale-110 active:scale-95 flex items-center gap-3"
            >
              Start Free Today
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all duration-300 border-2 border-blue-600 hover:shadow-xl hover:scale-110 active:scale-95"
            >
              Sign In
            </Link>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600 animate-fadeIn" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              <span className="font-semibold">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartIcon className="w-5 h-5 text-red-600" />
              <span className="font-semibold">99.9% Accuracy</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-blue-100 hover:border-blue-300 hover:scale-105 animate-fadeIn relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BeakerIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Disease Detection</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload CT scans and medical images for instant AI-powered health detection with clinically validated accuracy.
              </p>
              <Link to="/login" className="mt-6 flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all cursor-pointer">
                <span>Learn more</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-purple-100 hover:border-purple-300 hover:scale-105 animate-fadeIn relative overflow-hidden" style={{ animationDelay: '100ms' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <SparklesIcon className="w-8 h-8 text-purple-600 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">AI Health Assistant</h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized health suggestions, treatment recommendations, and answers to your health questions 24/7 from our AI.
              </p>
              <Link to="/login" className="mt-6 flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-4 transition-all cursor-pointer">
                <span>Learn more</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-green-100 hover:border-green-300 hover:scale-105 animate-fadeIn relative overflow-hidden" style={{ animationDelay: '200ms' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ChartBarIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Health Dashboard</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your health metrics, view trends over time, manage medications, and monitor your complete wellness journey.
              </p>
              <Link to="/login" className="mt-6 flex items-center gap-2 text-green-600 font-semibold group-hover:gap-4 transition-all cursor-pointer">
                <span>Learn more</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-900 rounded-full font-bold text-sm mb-4">
              <ClipboardDocumentCheckIcon className="w-5 h-5" />
              SIMPLE PROCESS
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg">Get started in just 4 simple steps</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 -z-10"></div>
            
            {[
              { step: 1, title: 'Create Account', desc: 'Sign up securely and complete your health profile in minutes', icon: UserGroupIcon, color: 'blue' },
              { step: 2, title: 'Upload Scans', desc: 'Upload CT scans or medical images with military-grade encryption', icon: BeakerIcon, color: 'indigo' },
              { step: 3, title: 'Get Results', desc: 'Receive instant AI predictions with detailed health insights', icon: SparklesIcon, color: 'purple' },
              { step: 4, title: 'Take Action', desc: 'Follow personalized recommendations and track progress', icon: HeartIcon, color: 'pink' },
            ].map((item, index) => (
              <div key={item.step} className="text-center animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 text-white w-24 h-24 rounded-2xl flex flex-col items-center justify-center mx-auto mb-6 shadow-2xl hover:scale-110 transition-all duration-300 hover:rotate-3 relative group`}>
                  <item.icon className="w-8 h-8 mb-1" />
                  <span className="text-2xl font-bold">{item.step}</span>
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-32 bg-white rounded-3xl p-12 shadow-2xl border-2 border-blue-100">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Real-Time Detection', value: '< 30s', icon: SparklesIcon, color: 'blue' },
              { label: '24/7 AI Support', value: 'Always', icon: HeartIcon, color: 'purple' },
              { label: 'AI Accuracy', value: '99.9%+', icon: BeakerIcon, color: 'indigo' },
              { label: 'Secure & Private', value: '100%', icon: ShieldCheckIcon, color: 'green' },
            ].map((stat, index) => (
              <div key={stat.label} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`w-16 h-16 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-gray-600 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-32 relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-16 text-center text-white shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4 animate-fadeIn">Ready to Take Control of Your Health?</h2>
            <p className="text-blue-100 mb-10 text-xl animate-fadeIn" style={{ animationDelay: '100ms' }}>
              Join thousands of users monitoring their  health with AI assistance
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/50 hover:scale-110 active:scale-95 animate-fadeIn"
              style={{ animationDelay: '200ms' }}
            >
              Get Started Now - It's Free
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-16 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center shadow-lg">
          <div className="flex items-center justify-center gap-3 mb-3">
            <ShieldCheckIcon className="w-8 h-8 text-yellow-600" />
            <h3 className="text-xl font-bold text-yellow-900">Important Medical Disclaimer</h3>
          </div>
          <p className="text-yellow-800 leading-relaxed max-w-3xl mx-auto">
            This platform provides AI-assisted early risk assessment and general health guidance for educational purposes.
            It does <span className="font-bold">NOT</span> replace professional medical diagnosis, treatment, or advice. 
            Always consult qualified healthcare professionals for medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
};


export default LandingPage; 

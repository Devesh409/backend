import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, FileText, Download, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-slate-900" style={{fontFamily: 'Fraunces, serif'}}>EduQG AI</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="ghost" data-testid="nav-login-btn">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6" data-testid="nav-register-btn">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6" style={{fontFamily: 'Fraunces, serif'}}>
              Turn Textbooks into Tests
              <br />
              <span className="text-indigo-600">in Seconds</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
              An intelligent, AI-powered system using NLP and BERT to automatically generate high-quality questions from your e-books. Complete with realistic handwritten assignments.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all" data-testid="hero-get-started-btn">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1741699428553-41c8e5bd894d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHw0fHx1bml2ZXJzaXR5JTIwc3R1ZGVudCUyMHN0dWR5aW5nJTIwbGlicmFyeXxlbnwwfHx8fDE3NzA1NjM4Mzh8MA&ixlib=rb-4.1.0&q=85"
                alt="Student studying in library"
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4" style={{fontFamily: 'Fraunces, serif'}}>Intelligent Features</h2>
            <p className="text-xl text-slate-600">Powered by Advanced NLP and BERT Technology</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="w-12 h-12 text-indigo-600" />,
                title: 'Multi-Format Support',
                description: 'Upload PDF, DOCX, TXT, and EPUB files. AI extracts and analyzes content automatically.',
              },
              {
                icon: <Sparkles className="w-12 h-12 text-indigo-600" />,
                title: 'AI Question Generation',
                description: 'Generate MCQs, short answers, long questions, and case studies using GPT-5.2 and BERT.',
              },
              {
                icon: <FileText className="w-12 h-12 text-indigo-600" />,
                title: 'Smart Answers',
                description: 'Every question comes with detailed, academically rigorous answers.',
              },
              {
                icon: <Download className="w-12 h-12 text-indigo-600" />,
                title: 'PDF Export',
                description: 'Download professional assignment PDFs with customizable formatting.',
              },
              {
                icon: <CheckCircle className="w-12 h-12 text-indigo-600" />,
                title: 'Handwriting Simulation',
                description: 'Convert answers to realistic student handwriting with multiple styles.',
              },
              {
                icon: <Sparkles className="w-12 h-12 text-indigo-600" />,
                title: 'Difficulty Levels',
                description: 'Choose easy, medium, or hard questions based on your needs.',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-100 hover-lift"
                data-testid={`feature-card-${idx}`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3" style={{fontFamily: 'Fraunces, serif'}}>{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-12 text-white shadow-2xl"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6" style={{fontFamily: 'Fraunces, serif'}}>Ready to Transform Your Content?</h2>
            <p className="text-xl mb-8 opacity-90">Join educators and students using AI to create better assessments.</p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100 rounded-full px-10 py-6 text-lg font-semibold shadow-lg" data-testid="cta-get-started-btn">
                Start Generating Questions Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span className="text-xl font-bold text-white" style={{fontFamily: 'Fraunces, serif'}}>EduQG AI</span>
          </div>
          <p className="text-sm">© 2026 EduQG AI. Powered by NLP, BERT, and OpenAI GPT-5.2</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
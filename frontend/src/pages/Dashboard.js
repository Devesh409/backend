import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ebooksAPI, questionsAPI } from '@/utils/api';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    ebooks: 0,
    questions: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [ebooksRes, questionsRes] = await Promise.all([
        ebooksAPI.getAll(),
        questionsAPI.getAll(),
      ]);
      setStats({
        ebooks: ebooksRes.data.length,
        questions: questionsRes.data.length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const statCards = [
    {
      title: 'E-books Uploaded',
      value: stats.ebooks,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Questions Generated',
      value: stats.questions,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'AI Models Active',
      value: 2,
      icon: Sparkles,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div data-testid="dashboard-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Fraunces, serif'}}>Welcome back, {user?.name}!</h1>
        <p className="text-slate-600 mb-8">Generate intelligent questions from your e-books</p>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow" data-testid={`stat-card-${idx}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-600 text-sm mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle style={{fontFamily: 'Fraunces, serif'}}>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/upload">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-xl" data-testid="quick-upload-btn">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload New E-book
                </Button>
              </Link>
              <Link to="/generate">
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white py-6 rounded-xl" data-testid="quick-generate-btn">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Questions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle style={{fontFamily: 'Fraunces, serif'}}>What You Can Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Upload Multiple E-books', desc: 'Support for PDF, DOCX, TXT, and EPUB files' },
                { title: 'AI Question Generation', desc: 'Generate MCQs, Short & Long answers using GPT-5.2' },
                { title: 'Handwriting Simulation', desc: 'Export assignments in realistic handwritten format' },
                { title: 'Customizable Difficulty', desc: 'Choose from Easy, Medium, or Hard questions' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">{feature.title}</h4>
                    <p className="text-sm text-slate-600">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
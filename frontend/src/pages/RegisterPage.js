import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authAPI } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.register(email, password, name);
      login(response.data.token, response.data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="flex items-center justify-center gap-2 mb-8">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            <span className="text-3xl font-bold text-slate-900" style={{fontFamily: 'Fraunces, serif'}}>EduQG AI</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center" style={{fontFamily: 'Fraunces, serif'}}>Create Account</h1>
          <p className="text-slate-600 text-center mb-8">Start generating intelligent questions today</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-slate-700">Full Name</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-10 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  data-testid="register-name-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  data-testid="register-email-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  data-testid="register-password-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              data-testid="register-submit-btn"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold" data-testid="register-login-link">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
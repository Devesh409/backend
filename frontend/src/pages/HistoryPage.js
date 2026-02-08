import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { questionsAPI } from '@/utils/api';
import { toast } from 'sonner';

const HistoryPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await questionsAPI.getAll();
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div data-testid="history-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Fraunces, serif'}}>Question History</h1>
        <p className="text-slate-600 mb-8">View all previously generated questions</p>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading...</p>
          </div>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No questions generated yet</p>
              <p className="text-sm text-slate-500 mt-2">Upload an e-book and generate questions to see them here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question, idx) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow" data-testid={`history-question-${idx}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-semibold text-indigo-600">{question.question_type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(question.created_at)}
                      </div>
                    </div>
                    
                    <p className="font-semibold text-slate-900 mb-3">{question.question}</p>
                    
                    <details className="text-sm text-slate-600">
                      <summary className="cursor-pointer text-indigo-600 font-medium">View Answer</summary>
                      <p className="mt-3 p-4 bg-slate-50 rounded-lg border-l-4 border-indigo-200">{question.answer}</p>
                    </details>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HistoryPage;
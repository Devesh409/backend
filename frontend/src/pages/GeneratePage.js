import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ebooksAPI, questionsAPI, assignmentsAPI } from '@/utils/api';
import { toast } from 'sonner';

const GeneratePage = () => {
  const [ebooks, setEbooks] = useState([]);
  const [selectedEbook, setSelectedEbook] = useState('');
  const [questionTypes, setQuestionTypes] = useState(['MCQ']);
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [showExport, setShowExport] = useState(false);

  // Export form
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [handwritingStyle, setHandwritingStyle] = useState('neat');
  const [penColor, setPenColor] = useState('blue');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadEbooks();
  }, []);

  const loadEbooks = async () => {
    try {
      const response = await ebooksAPI.getAll();
      setEbooks(response.data);
    } catch (error) {
      toast.error('Failed to load e-books');
    }
  };

  const questionTypeOptions = [
    { id: 'MCQ', label: 'Multiple Choice Questions' },
    { id: 'Short Answer', label: 'Short Answer Questions' },
    { id: 'Long Answer', label: 'Long Answer Questions' },
    { id: 'Case Study', label: 'Case Study Questions' },
  ];

  const toggleQuestionType = (type) => {
    setQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    if (!selectedEbook) {
      toast.error('Please select an e-book');
      return;
    }
    if (questionTypes.length === 0) {
      toast.error('Please select at least one question type');
      return;
    }

    setGenerating(true);
    try {
      const response = await questionsAPI.generate(
        selectedEbook,
        questionTypes,
        difficulty,
        numQuestions
      );
      setGeneratedQuestions(response.data);
      toast.success(`Generated ${response.data.length} questions!`);
      setShowExport(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    if (generatedQuestions.length === 0) {
      toast.error('No questions to export');
      return;
    }
    if (!studentName || !rollNumber || !subject) {
      toast.error('Please fill in all assignment details');
      return;
    }

    setExporting(true);
    try {
      const questionIds = generatedQuestions.map((q) => q.id);
      const response = await assignmentsAPI.generate(
        questionIds,
        studentName,
        rollNumber,
        subject,
        handwritingStyle,
        penColor
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assignment_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Assignment PDF downloaded!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div data-testid="generate-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Fraunces, serif'}}>Generate Questions</h1>
        <p className="text-slate-600 mb-8">Configure AI-powered question generation</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle style={{fontFamily: 'Fraunces, serif'}}>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="ebook">Select E-book</Label>
                <Select value={selectedEbook} onValueChange={setSelectedEbook}>
                  <SelectTrigger className="mt-2" data-testid="select-ebook">
                    <SelectValue placeholder="Choose an e-book" />
                  </SelectTrigger>
                  <SelectContent>
                    {ebooks.map((ebook) => (
                      <SelectItem key={ebook.id} value={ebook.id}>
                        {ebook.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Question Types</Label>
                <div className="space-y-3 mt-3">
                  {questionTypeOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={questionTypes.includes(option.id)}
                        onCheckedChange={() => toggleQuestionType(option.id)}
                        data-testid={`checkbox-${option.id.toLowerCase().replace(' ', '-')}`}
                      />
                      <label htmlFor={option.id} className="text-sm cursor-pointer">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="mt-2" data-testid="select-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="num-questions">Number of Questions</Label>
                <Input
                  id="num-questions"
                  type="number"
                  min={1}
                  max={20}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="mt-2"
                  data-testid="input-num-questions"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-xl"
                data-testid="generate-btn"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview & Export */}
          <div className="space-y-6">
            {generatedQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle style={{fontFamily: 'Fraunces, serif'}}>Generated Questions ({generatedQuestions.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {generatedQuestions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-lg" data-testid={`question-${idx}`}>
                      <p className="text-xs text-slate-500 mb-1">[{q.question_type}]</p>
                      <p className="font-semibold text-slate-900 mb-2">{q.question}</p>
                      <details className="text-sm text-slate-600">
                        <summary className="cursor-pointer text-indigo-600 font-medium">View Answer</summary>
                        <p className="mt-2 pl-4 border-l-2 border-indigo-200">{q.answer}</p>
                      </details>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {showExport && generatedQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle style={{fontFamily: 'Fraunces, serif'}}>Export as Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="student-name">Student Name</Label>
                    <Input
                      id="student-name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="John Doe"
                      className="mt-2"
                      data-testid="input-student-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="roll-number">Roll Number</Label>
                    <Input
                      id="roll-number"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="A123"
                      className="mt-2"
                      data-testid="input-roll-number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Computer Science"
                      className="mt-2"
                      data-testid="input-subject"
                    />
                  </div>

                  <div>
                    <Label htmlFor="handwriting">Handwriting Style</Label>
                    <Select value={handwritingStyle} onValueChange={setHandwritingStyle}>
                      <SelectTrigger className="mt-2" data-testid="select-handwriting">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neat">Neat & Clear</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="cursive">Cursive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pen-color">Pen Color</Label>
                    <Select value={penColor} onValueChange={setPenColor}>
                      <SelectTrigger className="mt-2" data-testid="select-pen-color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue Pen</SelectItem>
                        <SelectItem value="black">Black Pen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleExport}
                    disabled={exporting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl"
                    data-testid="export-pdf-btn"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download Assignment PDF
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GeneratePage;
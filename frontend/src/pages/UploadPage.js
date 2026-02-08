import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ebooksAPI } from '@/utils/api';
import { toast } from 'sonner';

const UploadPage = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      await uploadFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/epub+zip': ['.epub'],
    },
    multiple: true,
  });

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const response = await ebooksAPI.upload(file);
      setUploadedFiles((prev) => [...prev, { ...response.data, status: 'success' }]);
      toast.success(`${file.name} uploaded successfully!`);
    } catch (error) {
      toast.error(`Failed to upload ${file.name}`);
      setUploadedFiles((prev) => [...prev, { name: file.name, status: 'error' }]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div data-testid="upload-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{fontFamily: 'Fraunces, serif'}}>Upload E-books</h1>
        <p className="text-slate-600 mb-8">Upload PDF, DOCX, TXT, or EPUB files for AI processing</p>

        {/* Upload Zone */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'
              }`}
              data-testid="upload-dropzone"
            >
              <input {...getInputProps()} data-testid="upload-input" />
              <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {isDragActive ? (
                <p className="text-xl text-indigo-600 font-semibold">Drop files here...</p>
              ) : (
                <>
                  <p className="text-xl text-slate-900 font-semibold mb-2">Drag & drop files here</p>
                  <p className="text-slate-600 mb-4">or click to browse</p>
                  <p className="text-sm text-slate-500">Supported: PDF, DOCX, TXT, EPUB</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle style={{fontFamily: 'Fraunces, serif'}}>Uploaded Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    data-testid={`uploaded-file-${idx}`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="font-semibold text-slate-900">{file.title || file.name}</p>
                        {file.word_count && (
                          <p className="text-sm text-slate-600">{file.word_count} words extracted</p>
                        )}
                      </div>
                    </div>
                    {file.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : file.status === 'error' ? (
                      <X className="w-5 h-5 text-red-600" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {uploading && (
          <div className="mt-4">
            <Progress value={50} className="h-2" />
            <p className="text-sm text-slate-600 mt-2 text-center">Processing file...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UploadPage;
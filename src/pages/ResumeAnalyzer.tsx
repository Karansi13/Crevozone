import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import Progress from "@/components/ui/Progress";
import * as pdfjsLib from "pdfjs-dist";
import { motion, AnimatePresence } from "framer-motion"
import { Award, CheckCircle, FileText, Upload, XCircle } from "lucide-react";


(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const ResumeAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const typedArray = new Uint8Array(reader.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
          let text = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item: any) => item.str).join(" ");
            text += pageText + "\n";
          }

          resolve(text);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };
  const analyzeResume = async (resumeText: string) => {
    setLoading(true);
    setAnalysis(null);
  
    const openAiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `Analyze the resume in detail and return a structured JSON output with the following fields:
                - "bestRoles": An array of best-fit roles based on the resume.
                - "improvements": An array of improvements needed in the resume and give examples.
                - "strengths": An array of strong points found in the resume and give examples.
                - "furtherChanges": Additional modifications required for better optimization and give examples.
                - "atsScore": A number (0-100) representing how well the resume passes ATS screening.
                Return only valid JSON output. Do not include extra text.`,
            },
            { role: "user", content: resumeText },
          ],
          temperature: 0.7,
        }),
      });
  
      const data = await response.json();
      console.log("OpenAI API Response:", data);
  
      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from AI");
      }
  
      const output = data.choices[0].message?.content || "{}";
      setAnalysis(JSON.parse(output)); // Convert JSON string to an object
    } catch (error) {
      console.error("Error analyzing resume:", error);
    }
  
    setLoading(false);
  };
  

  return (
    <div className="min-h-screen py-12 px-4">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-[20px]"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2 mt-12">Resume Analyzer</h1>
        <p className="text-gray-600">Upload your resume and get instant professional feedback</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-md p-8 mb-8"
      >
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF, DOCX, or TXT (MAX. 10MB)</p>
            </div>
            <Input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt"
            />
          </label>
        </div>
        {file && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-700">{file.name}</span>
            </div>
            <Button
              onClick={async () => {
                if (file) {
                  const resumeText = await extractTextFromPdf(file)
                  analyzeResume(resumeText)
                }
              }}
              className="ml-4"
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze Resume"}
            </Button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-8">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Analyzing your resume...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <Card className="w-full overflow-hidden">
              <CardContent className="p-0">
                <div className="px-6 pt-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">ATS Score</h2>
                  <div className="flex items-center gap-4">
                    <Progress value={analysis.atsScore || 0} className="flex-1 h-4" />
                    <span className="text-3xl font-bold text-gray-800">{analysis.atsScore || 0}</span>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <p className="text-gray-600">
                    {analysis.atsScore >= 80
                      ? "Great job! Your resume is well-optimized for ATS."
                      : analysis.atsScore >= 60
                        ? "Your resume is doing well, but there's room for improvement."
                        : "Your resume needs significant improvements to pass ATS screening."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Award className="w-6 h-6 text-green-500 mr-2" />
                    Best-Fit Roles
                  </h2>
                  <ul className="space-y-2">
                    {analysis.bestRoles?.map((role: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span>{role}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <XCircle className="w-6 h-6 text-red-500 mr-2" />
                    Suggested Improvements
                  </h2>
                  <ul className="space-y-2">
                    {analysis.improvements?.map((improvement: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <XCircle className="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <CheckCircle className="w-6 h-6 text-blue-500 mr-2" />
                    Strengths
                  </h2>
                  <ul className="space-y-2">
                    {analysis.strengths?.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <FileText className="w-6 h-6 text-purple-500 mr-2" />
                    Further Changes
                  </h2>
                  <ul className="space-y-2">
                    {analysis.furtherChanges?.map((change: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <FileText className="w-5 h-5 text-purple-500 mr-2 mt-1 flex-shrink-0" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
};

export default ResumeAnalyzer;

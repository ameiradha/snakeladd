import React, { useState } from 'react';
import { Question, QuestionType, Difficulty } from '../types';
import { FileText, CheckCircle2, AlertTriangle, Download, Trash2, ArrowRight } from 'lucide-react';

interface TextQuizImporterProps {
  onImport: (questions: Question[]) => void;
  onCancel: () => void;
}

interface ValidationReport {
  validQuestions: Question[];
  errors: { questionIndex: number; error: string; rawSnippet?: string }[];
}

export const SAMPLE_TEXT_TEMPLATE = `QUESTION: Which planet is known as the Red Planet?
TYPE: MCQ
A: Earth
B: Mars
C: Jupiter
D: Venus
ANSWER: B
DIFFICULTY: Easy
EXPLANATION: Mars appears reddish because of iron-rich minerals on its surface.

QUESTION: Plants need sunlight to make food.
TYPE: TRUE_FALSE
ANSWER: TRUE
DIFFICULTY: Easy
EXPLANATION: Plants use sunlight during photosynthesis.

QUESTION: What is 5 multiplied by 4?
TYPE: SHORT_ANSWER
ANSWER: 20
ACCEPTED_ANSWERS: twenty
DIFFICULTY: Easy
EXPLANATION: Five groups of four equal twenty.

QUESTION: Apakah organ utama yang mengepam darah ke seluruh badan?
TYPE: SHORT_ANSWER
ANSWER: Jantung
ACCEPTED_ANSWERS: heart, organ jantung
DIFFICULTY: Easy
EXPLANATION: Jantung mengepam darah beroksigen ke seluruh anggota badan manusia.
`;

export function parseTextQuiz(rawText: string): ValidationReport {
  const validQuestions: Question[] = [];
  const errors: { questionIndex: number; error: string; rawSnippet?: string }[] = [];

  if (!rawText.trim()) {
    return { validQuestions, errors };
  }

  // Split by "QUESTION:" while keeping it clean
  const rawBlocks = rawText.split(/(?=^QUESTION:)/im);

  rawBlocks.forEach((block, idx) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return;

    const blockNum = idx + 1;
    const lines = trimmedBlock.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    let questionText = '';
    let qType: QuestionType | null = null;
    const options: { label: string; text: string }[] = [];
    let answer = '';
    let acceptedAnswers: string[] = [];
    let difficulty: Difficulty = 'Medium';
    let explanation = '';

    for (const line of lines) {
      if (/^QUESTION:/i.test(line)) {
        questionText = line.replace(/^QUESTION:/i, '').trim();
      } else if (/^TYPE:/i.test(line)) {
        const typeStr = line.replace(/^TYPE:/i, '').trim().toUpperCase();
        if (typeStr === 'MCQ') qType = 'MCQ';
        else if (typeStr === 'TRUE_FALSE' || typeStr === 'TRUE/FALSE' || typeStr === 'TF') qType = 'TRUE_FALSE';
        else if (typeStr === 'SHORT_ANSWER' || typeStr === 'SHORT') qType = 'SHORT_ANSWER';
      } else if (/^[A-D]:/i.test(line)) {
        const label = line.charAt(0).toUpperCase();
        const text = line.substring(2).trim();
        options.push({ label, text });
      } else if (/^ANSWER:/i.test(line)) {
        answer = line.replace(/^ANSWER:/i, '').trim();
      } else if (/^ACCEPTED_ANSWERS:/i.test(line)) {
        acceptedAnswers = line
          .replace(/^ACCEPTED_ANSWERS:/i, '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (/^DIFFICULTY:/i.test(line)) {
        const diffStr = line.replace(/^DIFFICULTY:/i, '').trim();
        if (['Easy', 'Medium', 'Hard'].includes(diffStr)) {
          difficulty = diffStr as Difficulty;
        }
      } else if (/^EXPLANATION:/i.test(line)) {
        explanation = line.replace(/^EXPLANATION:/i, '').trim();
      }
    }

    // Validation checks
    if (!questionText) {
      errors.push({
        questionIndex: blockNum,
        error: 'Missing question text after "QUESTION:".',
        rawSnippet: trimmedBlock.slice(0, 70),
      });
      return;
    }

    if (!qType) {
      errors.push({
        questionIndex: blockNum,
        error: 'Missing or invalid TYPE (must be MCQ, TRUE_FALSE, or SHORT_ANSWER).',
        rawSnippet: trimmedBlock.slice(0, 70),
      });
      return;
    }

    if (!answer) {
      errors.push({
        questionIndex: blockNum,
        error: 'The answer is missing. Specify "ANSWER:".',
        rawSnippet: trimmedBlock.slice(0, 70),
      });
      return;
    }

    if (qType === 'MCQ') {
      if (options.length < 2) {
        errors.push({
          questionIndex: blockNum,
          error: 'MCQ questions require at least 2 answer options (e.g. A:, B:).',
          rawSnippet: trimmedBlock.slice(0, 70),
        });
        return;
      }
      const upperAns = answer.toUpperCase().charAt(0);
      const validLabels = options.map((o) => o.label);
      if (!validLabels.includes(upperAns)) {
        errors.push({
          questionIndex: blockNum,
          error: `Answer "${answer}" does not match any MCQ option label (${validLabels.join(', ')}).`,
          rawSnippet: trimmedBlock.slice(0, 70),
        });
        return;
      }
      answer = upperAns;
    } else if (qType === 'TRUE_FALSE') {
      const upperAns = answer.toUpperCase();
      if (!['TRUE', 'FALSE', 'BENAR', 'PALSU', 'BETUL', 'SALAH'].includes(upperAns)) {
        errors.push({
          questionIndex: blockNum,
          error: `True/False answer must be TRUE or FALSE (received "${answer}").`,
          rawSnippet: trimmedBlock.slice(0, 70),
        });
        return;
      }
      answer = ['TRUE', 'BENAR', 'BETUL'].includes(upperAns) ? 'TRUE' : 'FALSE';
    }

    validQuestions.push({
      id: `text_q_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      question: questionText,
      type: qType,
      options,
      correctAnswer: answer,
      acceptedAnswers,
      explanation: explanation || 'No explanation provided.',
      difficulty,
    });
  });

  return { validQuestions, errors };
}

export const TextQuizImporter: React.FC<TextQuizImporterProps> = ({ onImport, onCancel }) => {
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT_TEMPLATE);
  const [report, setReport] = useState<ValidationReport | null>(null);

  const handleValidate = () => {
    const res = parseTextQuiz(inputText);
    setReport(res);
  };

  const handleImportValid = () => {
    const res = report || parseTextQuiz(inputText);
    if (res.validQuestions.length === 0) {
      alert('No valid questions found to import. Please check validation errors.');
      return;
    }
    onImport(res.validQuestions);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_TEXT_TEMPLATE], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snake_ladder_quiz_template.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-extrabold text-slate-900">Import Kuiz Dari Teks / Text Quiz Importer</h2>
          </div>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-amber-500" />
            <span>Muat Turun Format Contoh</span>
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-xs text-slate-500 font-medium">
            Tampal teks soalan anda di bawah. Menyokong soalan aneka pilihan MCQ (dengan A, B, C, D), BENAR/PALSU (TRUE_FALSE), dan JAWAPAN PENDEK (SHORT_ANSWER) berserta penerangan jawapan.
          </p>

          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setReport(null);
            }}
            placeholder="Tampal blok soalan QUESTION:... di sini"
            rows={14}
            className="w-full font-mono text-xs sm:text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white leading-relaxed"
          />

          {/* Validation Status Banner */}
          {report && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border bg-slate-50 border-slate-200 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {report.validQuestions.length} soalan sah dikesan
                </span>
                {report.errors.length > 0 && (
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    {report.errors.length} ralat format dikesan
                  </span>
                )}
              </div>

              {/* Error messages list */}
              {report.errors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 max-h-40 overflow-y-auto text-xs text-rose-800">
                  {report.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="font-bold shrink-0">Blok {err.questionIndex}:</span>
                      <span>{err.error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setInputText('');
              setReport(null);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan Teks</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Batal / Cancel
            </button>
            <button
              type="button"
              onClick={handleValidate}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 cursor-pointer transition shadow-xs"
            >
              Semak Format (Validate)
            </button>
            <button
              type="button"
              onClick={handleImportValid}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer transition flex items-center gap-1.5"
            >
              <span>Import Soalan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Quiz, Team, GameSettings, GameRecord, Question } from './types';
import { dbService, defaultSettings } from './services/db';
import { DEFAULT_TEAMS } from './game/constants';
import { soundManager } from './services/sound';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { GameSetupScreen } from './components/GameSetupScreen';
import { ActiveGameScreen } from './components/ActiveGameScreen';
import { QuizLibrary } from './components/QuizLibrary';
import { QuizEditor } from './components/QuizEditor';
import { GameHistoryView } from './components/GameHistoryView';
import { AIQuizGenerator } from './components/AIQuizGenerator';
import { TextQuizImporter } from './components/TextQuizImporter';
import { JSONBackupModal } from './components/JSONBackupModal';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';

type AppView =
  | 'dashboard'
  | 'game_setup'
  | 'active_game'
  | 'quiz_library'
  | 'quiz_editor'
  | 'game_history';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  // Active game specific state
  const [activeGameQuiz, setActiveGameQuiz] = useState<Quiz | null>(null);

  // Modals & Sub-views
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isTextImporterOpen, setIsTextImporterOpen] = useState(false);
  const [isJSONBackupOpen, setIsJSONBackupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load from IndexedDB
  const refreshAllData = async () => {
    try {
      const [allQuizzes, allHistory, savedSettings] = await Promise.all([
        dbService.getAllQuizzes(),
        dbService.getGameHistory(),
        dbService.getSettings(),
      ]);
      setQuizzes(allQuizzes);
      setHistory(allHistory);
      setSettings(savedSettings);
      soundManager.setEnabled(savedSettings.soundEnabled);
      if (allQuizzes.length > 0 && !selectedQuizId) {
        setSelectedQuizId(allQuizzes[0].id);
      }
    } catch (err) {
      console.error('Error loading data from IndexedDB:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Quick Start Handler
  const handleQuickStart = () => {
    const quizToPlay = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0];
    if (!quizToPlay) {
      alert('Please create or import a quiz first.');
      return;
    }
    setActiveGameQuiz(quizToPlay);
    setCurrentView('active_game');
  };

  // Launch Configured Game
  const handleStartGame = (quiz: Quiz, configuredTeams: Team[], matchSettings: GameSettings) => {
    setActiveGameQuiz(quiz);
    setTeams(configuredTeams);
    setSettings(matchSettings);
    setCurrentView('active_game');
  };

  // End Game Handler
  const handleEndGame = async (record?: GameRecord) => {
    if (record) {
      await dbService.saveGameRecord(record);
      await refreshAllData();
    }
    setCurrentView('dashboard');
  };

  // Quiz CRUD Handlers
  const handleSaveQuiz = async (quiz: Quiz) => {
    await dbService.saveQuiz(quiz);
    await refreshAllData();
    setEditingQuiz(null);
    setCurrentView('quiz_library');
  };

  const handleDeleteQuiz = async (quizId: string) => {
    await dbService.deleteQuiz(quizId);
    await refreshAllData();
  };

  const handleDuplicateQuiz = async (quiz: Quiz) => {
    const duplicate: Quiz = {
      ...quiz,
      id: `quiz_copy_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${quiz.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await dbService.saveQuiz(duplicate);
    await refreshAllData();
  };

  const handleImportTextQuestions = async (importedQuestions: Question[]) => {
    const newQuiz: Quiz = {
      id: `quiz_import_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `Imported Text Quiz (${new Date().toLocaleDateString()})`,
      subject: 'General Knowledge',
      yearLevel: 'Year 4',
      topic: 'Classroom Review',
      language: settings.language === 'ms' ? 'Bahasa Melayu' : 'English',
      description: 'Imported via Text Quiz Importer.',
      questions: importedQuestions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await dbService.saveQuiz(newQuiz);
    await refreshAllData();
    setIsTextImporterOpen(false);
    setSelectedQuizId(newQuiz.id);
    setCurrentView('quiz_library');
  };

  const handleSaveAIGeneratedQuiz = async (newQuiz: Quiz) => {
    await dbService.saveQuiz(newQuiz);
    await refreshAllData();
    setIsAIGeneratorOpen(false);
    setSelectedQuizId(newQuiz.id);
    setCurrentView('quiz_library');
  };

  // Settings Handlers
  const handleSaveSettings = async (newSettings: GameSettings) => {
    await dbService.saveSettings(newSettings);
    setSettings(newSettings);
    soundManager.setEnabled(newSettings.soundEnabled);
  };

  const handleToggleLanguage = async () => {
    const nextLang = settings.language === 'en' ? 'ms' : 'en';
    const updated = { ...settings, language: nextLang as 'en' | 'ms' };
    await handleSaveSettings(updated);
  };

  const handleToggleClassroomMode = async () => {
    const updated = { ...settings, classroomMode: !settings.classroomMode };
    await handleSaveSettings(updated);
  };

  // Delete / Clear Game History
  const handleDeleteHistory = async (id: string) => {
    await dbService.deleteGameRecord(id);
    await refreshAllData();
  };

  const handleClearAllHistory = async () => {
    await dbService.clearAllGameHistory();
    await refreshAllData();
  };

  // Export single quiz JSON
  const handleExportSingleQuiz = (quiz: Quiz) => {
    const data = {
      schemaVersion: '1.0',
      exportedAt: new Date().toISOString(),
      quizzes: [quiz],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_${quiz.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 text-slate-900 font-bold">
        Memuatkan Snake Ladd...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-100 text-slate-900 ${
        settings.reducedMotion ? 'motion-reduce' : ''
      }`}
    >
      {/* Top Header */}
      <Header
        currentView={currentView as any}
        onNavigate={(view) => setCurrentView(view)}
        onQuickStart={handleQuickStart}
        isClassroomMode={settings.classroomMode}
        onToggleClassroomMode={handleToggleClassroomMode}
        language={settings.language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'dashboard' && (
          <Dashboard
            quizzes={quizzes}
            history={history}
            onPlayGame={() => setCurrentView('game_setup')}
            onQuickStart={handleQuickStart}
            onCreateQuiz={() => {
              setEditingQuiz(null);
              setCurrentView('quiz_editor');
            }}
            onOpenLibrary={() => setCurrentView('quiz_library')}
            onOpenHistory={() => setCurrentView('game_history')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
            onOpenTextImporter={() => setIsTextImporterOpen(true)}
            onOpenJSONBackup={() => setIsJSONBackupOpen(true)}
          />
        )}

        {currentView === 'game_setup' && (
          <GameSetupScreen
            quizzes={quizzes}
            teams={teams}
            settings={settings}
            selectedQuizId={selectedQuizId}
            onSelectQuizId={setSelectedQuizId}
            onTeamsChange={setTeams}
            onSettingsChange={setSettings}
            onStartGame={handleStartGame}
            onOpenCreateQuiz={() => {
              setEditingQuiz(null);
              setCurrentView('quiz_editor');
            }}
            onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
            onOpenTextImporter={() => setIsTextImporterOpen(true)}
            onOpenJSONBackup={() => setIsJSONBackupOpen(true)}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'active_game' && activeGameQuiz && (
          <ActiveGameScreen
            quiz={activeGameQuiz}
            initialTeams={teams}
            settings={settings}
            onEndGame={handleEndGame}
            onPlayAgain={() => {
              // Remount with same quiz and reset teams
              setCurrentView('dashboard');
              setTimeout(() => setCurrentView('active_game'), 50);
            }}
            onNewGameSetup={() => setCurrentView('game_setup')}
            onReturnDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'quiz_library' && (
          <QuizLibrary
            quizzes={quizzes}
            onSelectPlayQuiz={(quiz) => {
              setSelectedQuizId(quiz.id);
              setActiveGameQuiz(quiz);
              setCurrentView('game_setup');
            }}
            onEditQuiz={(quiz) => {
              setEditingQuiz(quiz);
              setCurrentView('quiz_editor');
            }}
            onDuplicateQuiz={handleDuplicateQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onCreateNewQuiz={() => {
              setEditingQuiz(null);
              setCurrentView('quiz_editor');
            }}
            onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
            onOpenTextImporter={() => setIsTextImporterOpen(true)}
            onExportQuizJSON={handleExportSingleQuiz}
          />
        )}

        {currentView === 'quiz_editor' && (
          <QuizEditor
            initialQuiz={editingQuiz}
            onSave={handleSaveQuiz}
            onCancel={() => {
              setEditingQuiz(null);
              setCurrentView('quiz_library');
            }}
          />
        )}

        {currentView === 'game_history' && (
          <GameHistoryView
            history={history}
            onDeleteRecord={handleDeleteHistory}
            onClearAll={handleClearAllHistory}
          />
        )}
      </main>

      {/* Global Modals */}
      {isAIGeneratorOpen && (
        <AIQuizGenerator
          onSaveQuiz={handleSaveAIGeneratedQuiz}
          onCancel={() => setIsAIGeneratorOpen(false)}
        />
      )}

      {isTextImporterOpen && (
        <TextQuizImporter
          onImport={handleImportTextQuestions}
          onCancel={() => setIsTextImporterOpen(false)}
        />
      )}

      {isJSONBackupOpen && (
        <JSONBackupModal
          onClose={() => setIsJSONBackupOpen(false)}
          onRefreshData={refreshAllData}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}

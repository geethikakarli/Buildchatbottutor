import { useState } from 'react';
import { ArrowLeft, Plus, Download, Trash2, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { generateNotes } from '../services/mlBackend';

interface StudentProfile {
  id: string;
  email: string;
  name: string;
  grade: string;
  school: string;
  subjects: string[];
  preparationStatus: string;
  targetExam: string;
  goals: string[];
  studyHours: string;
}

interface Note {
  id: string;
  title: string;
  subject: string;
  topic: string;
  localContent: string;
  englishContent: string;
  createdAt: Date;
}

const languageNames: Record<string, string> = {
  hi: 'हिंदी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
  en: 'English',
};

export function NotesPage({
  student,
  selectedLanguage,
  onBack,
}: {
  student: StudentProfile;
  selectedLanguage: string;
  onBack: () => void;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');

  const updateProgress = (subject: string, topic: string) => {
    try {
      const progressKey = `progress_${student.id}`;
      const savedProgress = localStorage.getItem(progressKey);
      const progress = savedProgress ? JSON.parse(savedProgress) : {};

      progress.notesGenerated = (progress.notesGenerated || 0) + 1;

      if (!progress.subjectProgress) {
        progress.subjectProgress = {};
      }
      progress.subjectProgress[subject] = (progress.subjectProgress[subject] || 0) + 20;

      if (!progress.recentActivity) {
        progress.recentActivity = [];
      }
      progress.recentActivity.unshift({
        type: 'notes',
        description: `Generated notes: ${subject} - ${topic}`,
        timestamp: new Date().toISOString(),
      });
      progress.recentActivity = progress.recentActivity.slice(0, 10);

      localStorage.setItem(progressKey, JSON.stringify(progress));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleGenerateNotes = async () => {
    if (!subject || !topic) return;

    setIsGenerating(true);
    setIsDialogOpen(false);

    try {
      const content = await generateNotes({
        subject: subject,
        topic: topic,
        language: selectedLanguage,
      });

      const newNote: Note = {
        id: 'note_' + Date.now(),
        title: topic,
        subject: subject,
        topic: topic,
        localContent: content.localContent,
        englishContent: content.englishContent,
        createdAt: new Date(),
      };

      updateProgress(subject, topic);
      setNotes((prev) => [newNote, ...prev]);
      setSubject('');
      setTopic('');
    } catch (error) {
      console.error('Error generating notes:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  const handleCopyToClipboard = (text: string, noteId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNoteId(noteId);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const handleDownloadNote = (note: Note) => {
    const content = `${note.title}\n\n${languageNames[selectedLanguage]}:\n${note.localContent}\n\nEnglish:\n${note.englishContent}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selectedNote) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedNote(null)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedNote.title}
              </h2>
              <p className="text-sm text-gray-600">{selectedNote.subject}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleCopyToClipboard(selectedNote.localContent, selectedNote.id)
                }
              >
                {copiedNoteId === selectedNote.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownloadNote(selectedNote)}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Local Language Version */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {languageNames[selectedLanguage]}
              </h3>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedNote.localContent}
                </p>
              </div>
            </div>

            {/* English Version */}
            {selectedLanguage !== 'en' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  English
                </h3>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedNote.englishContent}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Study Notes</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Generate Notes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate New Notes</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {student.subjects.map((subj) => (
                        <SelectItem key={subj} value={subj}>
                          {subj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Photosynthesis"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleGenerateNotes}
                  disabled={!subject || !topic || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96">
              <p className="text-gray-600 text-center">
                No notes yet. Create your first study notes!
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {note.title}
                      </h3>
                      <p className="text-sm text-gray-600">{note.subject}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

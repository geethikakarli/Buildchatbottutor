import { useState } from 'react';
import { ArrowLeft, Plus, Download, Trash2, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  content: string;
  createdAt: Date;
}

export function NotesPage({
  student,
  onBack,
}: {
  student: StudentProfile;
  onBack: () => void;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');

  const updateProgress = (subject: string) => {
    try {
      const progressKey = `progress_${student.id}`;
      const savedProgress = localStorage.getItem(progressKey);
      const progress = savedProgress ? JSON.parse(savedProgress) : {};

      progress.notesGenerated = (progress.notesGenerated || 0) + 1;

      if (!progress.subjectProgress) {
        progress.subjectProgress = {};
      }
      progress.subjectProgress[subject] = (progress.subjectProgress[subject] || 0) + 20;

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
      const response = await fetch('http://127.0.0.1:8000/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `Generate comprehensive study notes about ${topic} in ${subject}. Provide detailed, well-structured notes suitable for students at ${student.grade} level.`,
          max_length: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate notes');
      
      const data = await response.json();
      const content = data.answers && data.answers.length > 0 
        ? data.answers[0].text || data.answers[0] 
        : '';

      const newNote: Note = {
        id: 'note_' + Date.now(),
        title: topic,
        subject: subject,
        topic: topic,
        content: content,
        createdAt: new Date(),
      };

      updateProgress(subject);
      setNotes((prev: Note[]) => [newNote, ...prev]);
      setSubject('');
      setTopic('');
    } catch (error) {
      console.error('Error generating notes:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev: Note[]) => prev.filter((n: Note) => n.id !== noteId));
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
    const blob = new Blob([note.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selectedNote) {
    return (
      <div className="flex flex-col h-full bg-white">
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
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedNote.content}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="text-white hover:bg-green-700 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Study Notes</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-white text-green-600 hover:bg-gray-100">
                <Plus className="w-4 h-4" />
                Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Study Notes</DialogTitle>
                <DialogDescription>
                  Select a subject and topic to generate comprehensive study notes.
                </DialogDescription>
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
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="text-gray-400 hover:text-red-600 cursor-pointer p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </div>
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

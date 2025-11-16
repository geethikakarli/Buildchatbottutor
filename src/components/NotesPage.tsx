import { useState } from 'react';
import { ArrowLeft, Plus, FileText, Download, Trash2 } from 'lucide-react';
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

interface NotesPageProps {
  selectedLanguage: string;
  onBack: () => void;
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
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  kn: 'Kannada',
  en: 'English',
};

export function NotesPage({ selectedLanguage, onBack }: NotesPageProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');

  const handleGenerateNotes = async () => {
    if (!subject || !topic) return;

    setIsGenerating(true);
    setIsDialogOpen(false);

    try {
      // Use ML service to generate notes
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

  const handleDownloadNote = (note: Note) => {
    const content = `${note.title}\n\n${languageNames[selectedLanguage]}:\n${note.localContent}\n\nEnglish:\n${note.englishContent}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (selectedNote) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setSelectedNote(null)} className="text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h2 className="text-gray-900">{selectedNote.title}</h2>
              <p className="text-gray-600">{selectedNote.subject}</p>
            </div>
            <button
              onClick={() => handleDownloadNote(selectedNote)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Local Language */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-blue-600 mb-3">{languageNames[selectedLanguage]}</div>
            <div className="text-gray-900 whitespace-pre-wrap">{selectedNote.localContent}</div>
          </div>

          {/* English */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-blue-600 mb-3">English Translation</div>
            <div className="text-gray-900 whitespace-pre-wrap">{selectedNote.englishContent}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-gray-900">My Notes</h2>
              <p className="text-gray-600">{notes.length} notes</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full h-10 w-10 p-0">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Notes</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
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
                    className="mt-1.5"
                  />
                </div>

                <Button
                  onClick={handleGenerateNotes}
                  disabled={!subject || !topic || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate Notes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isGenerating && (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <FileText className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <p className="text-gray-900">Generating bilingual notes...</p>
            <p className="text-gray-600">This may take a few moments</p>
          </div>
        )}

        {notes.length === 0 && !isGenerating && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-gray-900 mb-2">No Notes Yet</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Generate bilingual study notes for any topic in {languageNames[selectedLanguage]} and English
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div
                  onClick={() => setSelectedNote(note)}
                  className="flex-1 cursor-pointer"
                >
                  <h3 className="text-gray-900 mb-1">{note.title}</h3>
                  <p className="text-gray-600 mb-2">{note.subject}</p>
                  <p className="text-gray-500">
                    {note.createdAt.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadNote(note)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
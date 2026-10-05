import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import {
  Stethoscope,
  Activity,
  BookOpen,
  Brain,
  MessageSquare,
  Award,
  CreditCard,
  User,
  Sparkles,
  ChevronRight,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Volume2,
  Bookmark,
  TrendingUp,
  ShieldAlert,
  Sliders,
  Play,
  Send,
  Lock,
  Layers,
  HeartPulse,
  Syringe,
  Wheelchair,
  Check,
  Star,
  LogOut,
  HelpCircle,
  FileText
} from 'lucide-react';

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "demo-api-key",
      authDomain: "demo-app.firebaseapp.com",
      projectId: "demo-app",
      storageBucket: "demo-app.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:demo"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'kp-prep-app';

const SPECIALTIES = [
  {
    id: 'anaesthesie',
    title: 'Anästhesie & Intensivpflege',
    titleDe: 'Anästhesietechnische Assistenz',
    icon: Syringe,
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    accentColor: 'emerald',
    topics: ['Narkosegerät-Check', 'TIVA & Balancierte Anästhesie', 'Airway Management', 'Notfallmedikamente (Adrenalin, Atropin)', 'Postoperative Schmerztherapie']
  },
  {
    id: 'pflege',
    title: 'Gesundheits- & Krankenpflege',
    titleDe: 'Allgemeine Krankenpflege',
    icon: HeartPulse,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    accentColor: 'blue',
    topics: ['Pflegeplanung (NANDA)', 'Wundversorgung & Dekubitus', 'Hygiene & Infektionsschutz', 'Vitalzeichen & Monitoring', 'Injektionen & Infusionen']
  },
  {
    id: 'altenpflege',
    title: 'Altenpflege & Geriatrie',
    titleDe: 'Geriatrische Pflege',
    icon: Wheelchair,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    accentColor: 'amber',
    topics: ['Demenz & Validierung', 'Sturzprophylaxe & Mobilisation', 'Chronische Wunden im Alter', 'Ernährung bei Dysphagie', 'Palliative Pflege']
  },
  {
    id: 'physio',
    title: 'Physiotherapie',
    titleDe: 'Rehabilitation & Physiotherapie',
    icon: Activity,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    btnBg: 'bg-purple-600 hover:bg-purple-700 text-white',
    accentColor: 'purple',
    topics: ['Befundung Bewegungsapparat', 'Postoperative Frühmobilisation', 'PNF & Manuelle Therapie', 'Atemphysiotherapie (Intensiv)', 'Neurologische Reha (Bobath)']
  }
];

const VOCAB_DATABASE = [
  {
    de: 'das Delir',
    deMeaning: 'Akuter Verwirrtheitszustand',
    latin: 'Delirium',
    tr: 'Akut zihin bulanıklığı / Deliryum',
    category: 'anaesthesie',
    example: 'Der Patient zeigt postoperativ Anzeichen eines hypoaktiven Delirs.'
  },
  {
    de: 'die Atemwegssicherung',
    deMeaning: 'Maßnahmen zur Freihaltung der Atemwege',
    latin: 'Intubatio / Airway management',
    tr: 'Hava yolu emniyeti / İntübasyon',
    category: 'anaesthesie',
    example: 'Schwierige Atemwegssicherung bei erschwerter Laryngoskopie.'
  },
  {
    de: 'die Dekubitusprophylaxe',
    deMeaning: 'Vorbeugung von Druckgeschwüren',
    latin: 'Decubitus-Prophylaxe',
    tr: 'Yatak yarası önleme',
    category: 'pflege',
    example: 'Durchführen von regelmäßigen Lagerungswechseln zur Dekubitusprophylaxe.'
  },
  {
    de: 'die Dysphagie',
    deMeaning: 'Schluckstörung',
    latin: 'Dysphagia',
    tr: 'Yutma güçlüğü',
    category: 'altenpflege',
    example: 'Bei Patienten mit Schlaganfall besteht häufig eine schwere Dysphagie.'
  },
  {
    de: 'die Kontrakturprophylaxe',
    deMeaning: 'Vorbeugung von Gelenkversteifungen',
    latin: 'Contractur-Prophylaxe',
    tr: 'Eklem sertliği önleme / Egzersiz',
    category: 'physio',
    example: 'Passive Bewegungsübungen dienen der wirksamen Kontrakturprophylaxe.'
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSpecialty, setSelectedSpecialty] = useState('anaesthesie');
  const [userData, setUserData] = useState({
    subscriptionTier: 'free', // 'free' or 'pro'
    dailyUsage: 0,
    savedCases: [],
    completedExams: 0,
    scoreAverage: 82,
    targetExamDate: '2025-06-15'
  });

  // Simulator States
  const [caseChat, setCaseChat] = useState([]);
  const [currentCase, setCurrentCase] = useState(null);
  const [isGeneratingCase, setIsGeneratingCase] = useState(false);
  const [userAnswerInput, setUserAnswerInput] = useState('');
  
  // Oral Exam Simulator State
  const [examChat, setExamChat] = useState([]);
  const [examStarted, setExamStarted] = useState(false);
  const [isExamLoading, setIsExamLoading] = useState(false);

  // Terminology Trainer State
  const [vocabIndex, setVocabIndex] = useState(0);
  const [showVocabTranslation, setShowVocabTranslation] = useState(false);
  const [aiVocabExplanation, setAiVocabExplanation] = useState('');
  const [loadingVocabAi, setLoadingVocabAi] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
    
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserData(prev => ({ ...prev, ...snapshot.data() }));
      } else {
        // Init profile document
        setDoc(userDocRef, {
          subscriptionTier: 'free',
          dailyUsage: 0,
          savedCases: [],
          completedExams: 2,
          scoreAverage: 84,
          createdAt: serverTimestamp()
        }, { merge: true });
      }
    }, (error) => {
      console.error("Firestore sync error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const callGeminiAPI = async (prompt, systemInstruction = "") => {
    const apiKey = ""; // Canvas runtime provides standard endpoint support
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
    };

    let attempts = 0;
    while (attempts < 3) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API response status: ${response.status}`);
        
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        throw new Error("No valid response text returned from Gemini API");
      } catch (err) {
        attempts++;
        if (attempts >= 3) throw err;
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempts)));
      }
    }
  };

  const generateNewCase = async () => {
    setIsGeneratingCase(true);
    setCaseChat([]);
    
    const specInfo = SPECIALTIES.find(s => s.id === selectedSpecialty);
    const systemPrompt = `Du bist ein erfahrener deutscher Prüfer für die Kenntnisprüfung (KP) im Bereich ${specInfo.titleDe}.
Dein Ziel ist es, einen realistischen, anspruchsvollen Fallbericht (Fallbeispiel) auf Deutsch zu erstellen.
Struktur des Falls:
1. Patientendaten (Alter, Geschlecht, Anamnese)
2. Aktuelles Krankheitsbild / Situation in der Klinik
3. Vitalparameter & Befunde
4. 3 konkrete Prüfungsfragen zur Vorgehensweise, Fachsprache und Notfallmaßnahmen.`;

    const userPrompt = `Erstelle ein neues Fallbeispiel für die Fachrichtung: ${specInfo.title}. Schwerpunkte: ${specInfo.topics.join(', ')}.`;

    try {
      const generatedText = await callGeminiAPI(userPrompt, systemPrompt);
      setCurrentCase({
        spec: selectedSpecialty,
        content: generatedText,
        timestamp: new Date().toLocaleDateString()
      });
      setCaseChat([
        { role: 'model', text: generatedText }
      ]);
    } catch (error) {
      console.error(error);
      setCaseChat([
        { role: 'model', text: '⚠️ Fehler beim Generieren des Falls. Bitte versuche es erneut.' }
      ]);
    } finally {
      setIsGeneratingCase(false);
    }
  };

  const submitCaseAnswer = async () => {
    if (!userAnswerInput.trim() || isGeneratingCase) return;

    const userMsg = userAnswerInput;
    setUserAnswerInput('');
    
    const newChat = [...caseChat, { role: 'user', text: userMsg }];
    setCaseChat(newChat);
    setIsGeneratingCase(true);

    const specInfo = SPECIALTIES.find(s => s.id === selectedSpecialty);
    const systemPrompt = `Du bist ein Prüfer der Kenntnisprüfung (${specInfo.titleDe}). 
Bewerte die Antwort des Kandidaten präzise und konstruktiv auf Deutsch.
Prüfe:
1. Richtigkeit der medizinischen / pflegerischen Maßnahme
2. Korrekte Verwendung der deutschen Fachsprache (Medizinische Fachbegriffe)
3. Verbesserungsvorschläge und Noten-Einschätzung (z.B. Bestanden / Nachbesserung nötig)
Sei ermutigend, aber fachlich streng wie in einer echten Prüfung!`;

    const fullContextPrompt = `Fallbeispiel & bisheriger Verlauf:\n` + 
      newChat.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n') + 
      `\n\nBewerte die letzte Antwort des Kandidaten.`;

    try {
      const evaluationText = await callGeminiAPI(fullContextPrompt, systemPrompt);
      setCaseChat([...newChat, { role: 'model', text: evaluationText }]);
    } catch (error) {
      console.error(error);
      setCaseChat([...newChat, { role: 'model', text: '⚠️ Fehler bei der Auswertung deiner Antwort.' }]);
    } finally {
      setIsGeneratingCase(false);
    }
  };

  const startOralExam = async () => {
    setExamStarted(true);
    setIsExamLoading(true);
    setExamChat([]);

    const specInfo = SPECIALTIES.find(s => s.id === selectedSpecialty);
    const systemPrompt = `Du bist die Prüfungskommission der Deutschen Kenntnisprüfung für ${specInfo.titleDe}.
Simuliere eine mündliche Prüfung. Stellt euch kurz vor und stellt dem Kandidaten die ERSTE direkte Prüfungsfrage.
Bleibe in der Rolle des Prüfers. Antworte in kurzen, klaren Prüfungsfragen.`;

    try {
      const introPrompt = `Starte die mündliche Prüfung für ${specInfo.title}. Stelle die 1. Frage.`;
      const response = await callGeminiAPI(introPrompt, systemPrompt);
      setExamChat([{ role: 'model', text: response }]);
    } catch (err) {
      setExamChat([{ role: 'model', text: '⚠️️ Fehler beim Starten der Simulation.' }]);
    } finally {
      setIsExamLoading(false);
    }
  };

  const sendExamAnswer = async (input) => {
    if (!input.trim() || isExamLoading) return;

    const newHistory = [...examChat, { role: 'user', text: input }];
    setExamChat(newHistory);
    setIsExamLoading(true);

    const specInfo = SPECIALTIES.find(s => s.id === selectedSpecialty);
    const systemPrompt = `Du bist die Prüfungskommission der Deutschen Kenntnisprüfung (${specInfo.titleDe}).
Antworte auf die Aussage des Kandidaten:
1. Kurzes Feedback zur Antwort (Richtig/Falsch/Unvollständig, Korrektur der Fachsprache).
2. Stelle umgehend die NÄCHSTE Prüfungsfrage.`;

    const conversation = newHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n');

    try {
      const nextQuestion = await callGeminiAPI(conversation, systemPrompt);
      setExamChat([...newHistory, { role: 'model', text: nextQuestion }]);
    } catch (err) {
      setExamChat([...newHistory, { role: 'model', text: '⚠️ Verbindungsfehler zur Prüfungskommission.' }]);
    } finally {
      setIsExamLoading(false);
    }
  };

  const fetchAiVocabDetail = async (vocabItem) => {
    setLoadingVocabAi(true);
    setAiVocabExplanation('');

    const prompt = `Erkläre den medizinischen Begriff "${vocabItem.de}" (${vocabItem.latin}) für die deutsche Kenntnisprüfung.
Gib:
1. Eine präzise medizinische Definition
2. Typische Prüfungssituationen / Fragen im Exam
3. Relevante Synonyme und Fachbegriffe auf Deutsch.`;

    try {
      const exp = await callGeminiAPI(prompt, "Du bist ein medizinischer Sprachlehrer für Fachsprache Deutsch.");
      setAiVocabExplanation(exp);
    } catch (err) {
      setAiVocabExplanation("Fehler beim Laden der AI-Erklärung.");
    } finally {
      setLoadingVocabAi(false);
    }
  };

  const saveCurrentCaseToProfile = async () => {
    if (!user || !currentCase) return;
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
      const updatedSaved = [...(userData.savedCases || []), currentCase];
      await updateDoc(userDocRef, { savedCases: updatedSaved });
      setUserData(prev => ({ ...prev, savedCases: updatedSaved }));
    } catch (err) {
      console.error("Save case error:", err);
    }
  };

  const handleUpgradeToPro = async (planType) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
      await updateDoc(userDocRef, { subscriptionTier: 'pro', plan: planType });
      setUserData(prev => ({ ...prev, subscriptionTier: 'pro' }));
    } catch (err) {
      console.error("Upgrade error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row antialiased">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800/80">
            <div className="p-2.5 bg-gradient-to-tr from-teal-500 to-blue-600 rounded-xl shadow-lg shadow-teal-500/20 text-white">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-slate-100 flex items-center gap-1.5">
                KP Campus <span className="text-xs px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 font-mono font-semibold border border-teal-500/30">DE</span>
              </h1>
              <p className="text-xs text-slate-400">Kenntnisprüfung Tutor</p>
            </div>
          </div>

          {/* Specialty Selector Dropdown */}
          <div className="mb-6 px-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Ziel-Fachrichtung
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
            >
              {SPECIALTIES.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/10 text-teal-300 border border-teal-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Übersicht & Statistik</span>
            </button>

            <button
              onClick={() => setActiveTab('case-simulator')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'case-simulator' 
                  ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/10 text-teal-300 border border-teal-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Brain className="w-4 h-4 text-teal-400" />
              <span className="flex-1 text-left">AI Fall-Simulator</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">KI</span>
            </button>

            <button
              onClick={() => setActiveTab('oral-exam')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'oral-exam' 
                  ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/10 text-teal-300 border border-teal-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Mündliche Prüfung AI</span>
            </button>

            <button
              onClick={() => setActiveTab('vocab-trainer')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'vocab-trainer' 
                  ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/10 text-teal-300 border border-teal-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Fachsprache & Begriffe</span>
            </button>

            <button
              onClick={() => setActiveTab('saved-cases')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'saved-cases' 
                  ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/10 text-teal-300 border border-teal-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bookmark className="w-4 h-4 text-purple-400" />
              <span>Gespeicherte Fälle</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'pricing' 
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-300 border border-amber-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span className="flex-1 text-left">Pro Upgrade</span>
              {userData.subscriptionTier === 'pro' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold">PRO</span>
              )}
            </button>
          </nav>
        </div>

        {/* User Card & Subscription Status */}
        <div className="pt-4 border-t border-slate-800 mt-6">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-slate-300 font-bold text-xs">
                {user ? user.uid.substring(0, 2).toUpperCase() : 'DE'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user ? `User-${user.uid.substring(0, 6)}` : 'Anonym'}
                </p>
                <p className="text-[10px] text-teal-400 font-medium">
                  {userData.subscriptionTier === 'pro' ? '★ Pro Account' : 'Free Tier Member'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-950 p-4 md:p-8 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              {activeTab === 'dashboard' && 'Prüfungs-Dashboard'}
              {activeTab === 'case-simulator' && 'AI Fall-Simulator (Fallbeispiele)'}
              {activeTab === 'oral-exam' && 'Mündliche Prüfung AI-Simulator'}
              {activeTab === 'vocab-trainer' && 'Fachsprache & Medizinische Begriffe'}
              {activeTab === 'saved-cases' && 'Gespeicherte Fälle & Notizen'}
              {activeTab === 'pricing' && 'Abonnement & Pro Mitgliedschaft'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Kenntnisprüfung Deutschland (Anerkennung Gesundheits- & Krankenpflege, Anästhesie, Physiotherapie)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gemini 3 Flash Ready</span>
            </div>
            {userData.subscriptionTier !== 'pro' && (
              <button 
                onClick={() => setActiveTab('pricing')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/10 hover:opacity-90"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade Pro</span>
              </button>
            )}
          </div>
        </header>

        {}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Absolvierte Fälle</span>
                  <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-100">{userData.completedExams || 4}</p>
                <p className="text-[11px] text-teal-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +2 diese Woche
                </p>
              </div>

              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Fachsprache Score</span>
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-100">{userData.scoreAverage}%</p>
                <p className="text-[11px] text-blue-400 mt-1">Gutes Vokabular Niveau</p>
              </div>

              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Aktive Fachrichtung</span>
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-base font-bold text-slate-100 truncate">
                  {SPECIALTIES.find(s => s.id === selectedSpecialty)?.titleDe}
                </p>
                <p className="text-[11px] text-purple-400 mt-1">Bereit für Falltraining</p>
              </div>

              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Status</span>
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-lg font-bold text-amber-400 uppercase">
                  {userData.subscriptionTier === 'pro' ? 'PRO UNLIMITED' : 'FREE TIER'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {userData.subscriptionTier === 'pro' ? 'Alle Fälle freigeschaltet' : '3 KI-Anfragen pro Tag'}
                </p>
              </div>
            </div>

            {/* Specialties Matrix */}
            <div>
              <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-400" />
                Fachbereiche & Prüfungsthemen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SPECIALTIES.map(s => {
                  const Icon = s.icon;
                  const isSelected = selectedSpecialty === s.id;
                  return (
                    <div 
                      key={s.id}
                      onClick={() => setSelectedSpecialty(s.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected 
                          ? 'bg-slate-900 border-teal-500 shadow-md shadow-teal-500/10' 
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl border ${s.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-100 text-base">{s.title}</h4>
                            <p className="text-xs text-slate-400">{s.titleDe}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold border border-teal-500/30">
                            Aktiv
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 mt-4">
                        <p className="text-xs font-semibold text-slate-400">Prüfungsschwerpunkte:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.topics.map((topic, idx) => (
                            <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/50">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSpecialty(s.id);
                            setActiveTab('case-simulator');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${s.btnBg}`}
                        >
                          <span>Fall starten</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-slate-400">Gemini KI Generiert</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-900/40 via-slate-900 to-blue-900/30 border border-teal-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-400" />
                  Bereit für ein neues Fallbeispiel?
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Simuliere jetzt eine reale Prüfungssituation im Bereich <span className="font-semibold text-teal-300">{SPECIALTIES.find(s => s.id === selectedSpecialty)?.title}</span> mit sofortiger Auswertung deiner Fachsprache.
                </p>
              </div>
              <button 
                onClick={() => {
                  setActiveTab('case-simulator');
                  generateNewCase();
                }}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-teal-500/20 hover:opacity-95 shrink-0 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Neuen KI-Fall Generieren</span>
              </button>
            </div>

          </div>
        )}

        {}
        {activeTab === 'case-simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Controls & Info */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-slate-200 text-base mb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  Fall-Parameter
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Fachbereich</label>
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                    >
                      {SPECIALTIES.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={generateNewCase}
                    disabled={isGeneratingCase}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 disabled:opacity-50"
                  >
                    {isGeneratingCase ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Erstelle Fall mit KI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Neues Fallbeispiel Erstellen</span>
                      </>
                    )}
                  </button>

                  {currentCase && (
                    <button
                      onClick={saveCurrentCaseToProfile}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                      <span>Fall Speichern</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Instructions Box */}
              <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800/80 text-xs space-y-2 text-slate-300">
                <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-teal-400" />
                  Tipps für die Antwort
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li>Nutze präzise medizinische Fachbegriffe (z.B. *Monitoring*, *Dekubitusprophylaxe*, *Volumengabe*).</li>
                  <li>Antworte in strukturierten Absätzen auf Deutsch.</li>
                  <li>Die KI bewertet deine Antwort wie ein echter KP-Prüfer.</li>
                </ul>
              </div>
            </div>

            {/* Right Chat & Case Display */}
            <div className="lg:col-span-8 flex flex-col h-[650px] bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
              
              {/* Chat Header */}
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-bold text-sm text-slate-200">
                    Prüfungsfall: {SPECIALTIES.find(s => s.id === selectedSpecialty)?.title}
                  </span>
                </div>
                <span className="text-xs text-slate-400">Prüfungssimulation</span>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs md:text-sm">
                {caseChat.length === 0 && !isGeneratingCase && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <Brain className="w-12 h-12 text-slate-600 mb-3" />
                    <p className="font-semibold text-slate-300">Noch kein Fall geladen.</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Klicke auf "Neues Fallbeispiel Erstellen", um die Simulation mit Gemini KI zu starten.
                    </p>
                  </div>
                )}

                {caseChat.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-4 space-y-2 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none whitespace-pre-line'
                    }`}>
                      <div className="flex items-center justify-between text-[10px] opacity-70 mb-1 border-b border-white/10 pb-1">
                        <span className="font-semibold">
                          {msg.role === 'user' ? 'Kandidat (Du)' : 'KP-Prüfungskommission (KI)'}
                        </span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {isGeneratingCase && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 text-slate-300 flex items-center gap-3">
                      <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                      <span className="text-xs">Prüfer analysiert die Situation und formuliert den Fall...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitCaseAnswer();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={userAnswerInput}
                    onChange={(e) => setUserAnswerInput(e.target.value)}
                    placeholder="Formuliere deine Antwort / Maßnahmen auf Deutsch..."
                    disabled={isGeneratingCase || caseChat.length === 0}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isGeneratingCase || !userAnswerInput.trim() || caseChat.length === 0}
                    className="p-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold disabled:opacity-50 shadow-md shadow-teal-500/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {}
        {activeTab === 'oral-exam' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Banner */}
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">
                Mündliche Kenntnisprüfung Simulators
              </h3>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Prüfer stellen dir direkt Fragen. Du musst spontan und fachlich korrekt antworten. Die KI korrigiert deine Fachsprache in Echtzeit.
              </p>

              {!examStarted ? (
                <button
                  onClick={startOralExam}
                  disabled={isExamLoading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all inline-flex items-center gap-2"
                >
                  {isExamLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>Prüfung Jetzt Starten</span>
                </button>
              ) : (
                <button
                  onClick={() => setExamStarted(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Prüfung Beenden
                </button>
              )}
            </div>

            {/* Exam Live Dialog Box */}
            {examStarted && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Live Prüfungskommission • {SPECIALTIES.find(s => s.id === selectedSpecialty)?.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    LIVE EVALUATION
                  </span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs md:text-sm">
                  {examChat.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none whitespace-pre-line'
                      }`}>
                        <p className="text-[10px] opacity-60 mb-1 font-semibold">
                          {msg.role === 'user' ? 'Kandidat' : 'Oberarzt / Prüfer'}
                        </p>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}

                  {isExamLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 p-3 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                        Prüfungsrat berät sich...
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-900 border-t border-slate-800">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = e.target.elements.examInput.value;
                      if (val) {
                        sendExamAnswer(val);
                        e.target.elements.examInput.value = '';
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      name="examInput"
                      type="text"
                      placeholder="Antworte dem Prüfer auf Deutsch..."
                      disabled={isExamLoading}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isExamLoading}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                    >
                      Antworten
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {}
        {activeTab === 'vocab-trainer' && (
          <div className="space-y-6">
            
            {/* Flashcard Component */}
            <div className="max-w-xl mx-auto">
              <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 text-center space-y-4 shadow-xl relative">
                
                <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-3">
                  <span className="font-semibold uppercase tracking-wider text-amber-400">
                    Fachbegriff Karte {vocabIndex + 1} / {VOCAB_DATABASE.length}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {VOCAB_DATABASE[vocabIndex].category.toUpperCase()}
                  </span>
                </div>

                <div className="py-8 space-y-2">
                  <h3 className="text-3xl font-extrabold text-slate-100">
                    {VOCAB_DATABASE[vocabIndex].de}
                  </h3>
                  <p className="text-sm font-mono text-slate-400 italic">
                    Latein/International: {VOCAB_DATABASE[vocabIndex].latin}
                  </p>
                  <p className="text-xs text-slate-300 mt-2 bg-slate-800/60 p-2 rounded-xl inline-block">
                    "{VOCAB_DATABASE[vocabIndex].example}"
                  </p>
                </div>

                {showVocabTranslation ? (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                    <p className="text-xs font-semibold text-amber-400">Bedeutung auf Deutsch:</p>
                    <p className="text-sm font-bold text-slate-200">{VOCAB_DATABASE[vocabIndex].deMeaning}</p>
                    <p className="text-xs text-slate-400 mt-1">Türkçe karşılığı: {VOCAB_DATABASE[vocabIndex].tr}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowVocabTranslation(true)}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold"
                  >
                    Bedeutung & Übersetzung Anzeigen
                  </button>
                )}

                <div className="pt-4 border-t border-slate-800 flex justify-between items-center gap-2">
                  <button
                    onClick={() => {
                      setShowVocabTranslation(false);
                      setAiVocabExplanation('');
                      setVocabIndex((prev) => (prev > 0 ? prev - 1 : VOCAB_DATABASE.length - 1));
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                  >
                    Zurück
                  </button>

                  <button
                    onClick={() => fetchAiVocabDetail(VOCAB_DATABASE[vocabIndex])}
                    disabled={loadingVocabAi}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>KI-Erklärung Laden</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowVocabTranslation(false);
                      setAiVocabExplanation('');
                      setVocabIndex((prev) => (prev < VOCAB_DATABASE.length - 1 ? prev + 1 : 0));
                    }}
                    className="px-4 py-2 rounded-xl bg-teal-600 text-xs font-semibold text-white"
                  >
                    Nächster Begriff
                  </button>
                </div>

              </div>

              {/* AI Deep Explanation Output */}
              {loadingVocabAi && (
                <div className="mt-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400 inline mr-2" />
                  Gemini KI erstellt Prüfungs-Erklärung...
                </div>
              )}

              {aiVocabExplanation && (
                <div className="mt-4 p-5 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs space-y-2 whitespace-pre-line text-slate-200">
                  <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4" />
                    KI-Mediziner Erklärung
                  </h4>
                  <p className="leading-relaxed">{aiVocabExplanation}</p>
                </div>
              )}
            </div>

          </div>
        )}

        {}
        {activeTab === 'saved-cases' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-200 mb-4">
              Deine gespeicherten Fallbeispiele
            </h3>

            {(!userData.savedCases || userData.savedCases.length === 0) ? (
              <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>Noch keine Fälle gespeichert. Klicke im AI Fall-Simulator auf "Fall Speichern".</p>
              </div>
            ) : (
              userData.savedCases.map((c, i) => (
                <div key={i} className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-bold text-teal-400 uppercase">{c.spec}</span>
                    <span>{c.timestamp}</span>
                  </div>
                  <p className="text-slate-200 whitespace-pre-line leading-relaxed">{c.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {}
        {activeTab === 'pricing' && (
          <div className="max-w-4xl mx-auto space-y-8 py-4">
            
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-100">
                Wähle deinen Vorbereitungs-Pass
              </h3>
              <p className="text-xs text-slate-400">
                Unbegrenzter Zugriff auf KI-Fallbeispiele, Mündliche Prüfungs-Simulationen und Fachsprachen-Korrektur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Monthly Plan */}
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-200">Pro Monatspass</h4>
                  <p className="text-xs text-slate-400 mt-1">Flexibel monatlich kündbar</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-100">€29</span>
                    <span className="text-xs text-slate-400">/ Monat</span>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-400" />
                      <span>Unbegrenzte KI-Fallbeispiele (Alle Fachbereiche)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-400" />
                      <span>Live Mündliche Prüfungssimulation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-400" />
                      <span>Automatische Fachsprachen-Korrektur</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgradeToPro('monthly')}
                  disabled={userData.subscriptionTier === 'pro'}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 disabled:opacity-50"
                >
                  {userData.subscriptionTier === 'pro' ? 'Aktiver Plan' : 'Monatspass Aktivieren'}
                </button>
              </div>

              {/* Lifetime Plan */}
              <div className="p-6 bg-gradient-to-b from-slate-900 to-teal-950/40 rounded-2xl border border-teal-500/40 flex flex-col justify-between space-y-6 relative shadow-xl">
                <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-[10px] rounded-full uppercase tracking-wider">
                  Bester Wert
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-100">Lebenslanger Zugang</h4>
                  <p className="text-xs text-slate-400 mt-1">Einmalige Zahlung, lebenslanger Zugriff</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-teal-400">€79</span>
                    <span className="text-xs text-slate-400">Einmalig</span>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-400" />
                      <span>Alle Features des Pro-Passes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-400" />
                      <span>Inklusive zukünftiger Fachbereich-Updates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-400" />
                      <span>Priorisierter Gemini 3 KI Support</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgradeToPro('lifetime')}
                  disabled={userData.subscriptionTier === 'pro'}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-teal-500/20 hover:opacity-90 disabled:opacity-50"
                >
                  {userData.subscriptionTier === 'pro' ? 'Aktiver Plan' : 'Jetzt Lebenslang Kaufen (€79)'}
                </button>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
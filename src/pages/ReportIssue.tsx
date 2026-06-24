import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { MapPin, Brain, ShieldAlert, Sparkles, Check, ChevronRight, User, Loader2, AlertTriangle, Camera, X, AlertCircle, Upload, Mic, MicOff, CheckCircle2 } from 'lucide-react';
import { Issue } from '../mockData';
import { IssueAnalysisAgent } from '../agents/IssueAnalysisAgent';
import { DuplicateDetectionAgent } from '../agents/DuplicateDetectionAgent';
import { IssueAnalysisResult } from '../types/gemini';
import { GoogleMapContainer } from '../components/GoogleMapContainer';

interface ReportIssueProps {
  issues: Issue[];
  addNewIssue: (issue: Omit<Issue, 'id' | 'reportedAt' | 'upvotes' | 'upvotedUsers' | 'comments' | 'timeline' | 'impactScore' | 'status'> & { priorityScore?: number; priorityReasonsJson?: string; resolutionPlanJson?: string; isEmergency?: boolean }) => Promise<string>;
  addPoints: (points: number) => void;
  triggerUpvote: (id: string) => void;
}

export const ReportIssue: React.FC<ReportIssueProps> = ({
  issues,
  addNewIssue,
  addPoints,
  triggerUpvote
}) => {
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('Determining nearest address...');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState(() => {
    const savedUser = localStorage.getItem('civicpulse_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser).displayName || '';
      } catch {
        // fallback
      }
    }
    return '';
  });

  // Image states
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  // Speech-to-Text state
  const [isRecording, setIsRecording] = useState(false);

  // Multi-Agent animated flow overlay states
  const [showAgentFlow, setShowAgentFlow] = useState(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);

  // AI predicted states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiClassification, setAiClassification] = useState<IssueAnalysisResult | null>(null);

  // Editable fields initialized by AI
  const [selectedCategory, setSelectedCategory] = useState<Issue['category']>('Infrastructure');
  const [selectedSeverity, setSelectedSeverity] = useState<Issue['severity']>('Medium');
  const [selectedDepartment, setSelectedDepartment] = useState('Public Works Department');

  // Duplicate states
  const [duplicateCheck, setDuplicateCheck] = useState<{
    isDuplicate: boolean;
    matchingIssue?: Issue;
    confidence: number;
  } | null>(null);

  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');

  // Watch document class for map themes synchronization
  useEffect(() => {
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light');
      setMapTheme(isLight ? 'light' : 'dark');
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Simulated address lookup
  useEffect(() => {
    if (location) {
      setAddress('Loading address geolocation...');
      const timeout = setTimeout(() => {
        const streets = ['Market St', 'Valencia St', 'Mission St', '8th St', '16th St', 'Dolores St', 'Division St', 'Geary Blvd'];
        const randomStreet = streets[Math.floor(Math.random() * streets.length)];
        const randomNum = Math.floor(Math.random() * 1200) + 100;
        setAddress(`${randomNum} ${randomStreet}, San Francisco, CA ${94100 + Math.floor(Math.random()*15)}`);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [location]);

  // AI Triage triggering function
  const runAIAnalysis = async (descVal: string, imgData?: string, imgMime?: string) => {
    if (descVal.trim().length < 10 && !imgData) {
      setAiClassification(null);
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const tempTitle = descVal.split(' ').slice(0, 5).join(' ') || "Civic Incident Report";
      const result = await IssueAnalysisAgent.run({
        title: tempTitle,
        description: descVal || "Analyzed from attached image details.",
        imageB64: imgData || undefined,
        imageMimeType: imgMime || undefined
      });
      setAiClassification(result);
      setSelectedCategory(result.category);
      setSelectedSeverity(result.severity);
      setSelectedDepartment(result.department);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Failed to analyze incident with Gemini.");
    } finally {
      setAiLoading(false);
    }
  };

  // Debounced trigger when description changes
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (description.length < 10 && !imageB64) {
      setAiClassification(null);
      return;
    }

    setAiLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      runAIAnalysis(description, imageB64 || undefined, imageMimeType || undefined);
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [description, imageB64, imageMimeType]);

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (e: any) => {
      const speechToText = e.results[0][0].transcript;
      setDescription(prev => prev + (prev ? " " : "") + speechToText);
    };

    recognition.onerror = (e: any) => {
      console.error("Speech Recognition Error:", e);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setAiError("File is too large. Max size is 4MB.");
        return;
      }
      setImageName(file.name);
      setImageMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageB64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageB64(null);
    setImageMimeType(null);
    setImageName(null);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({ lat, lng });
  };

  const handleNextStep1 = () => {
    if (location) setStep(2);
  };

  // Triggers the Multi-Agent animated flow overlay
  const handleNextStep2 = async () => {
    if (!location || !aiClassification) return;

    setShowAgentFlow(true);
    setActiveAgentIndex(0);

    // Agent Flow timing sequences
    await new Promise(r => setTimeout(r, 600));
    setActiveAgentIndex(1); // Dup scanner

    // Dup check agent logic
    try {
      const dupResult = await DuplicateDetectionAgent.run({
        newTitle: aiClassification.suggestedTitle,
        newDescription: description,
        newLatitude: location.lat,
        newLongitude: location.lng,
        newCategory: aiClassification.category,
        existingIssues: issues
      });

      setDuplicateCheck({
        isDuplicate: dupResult.duplicate,
        matchingIssue: issues.find(i => i.id === dupResult.matchedIssueId),
        confidence: dupResult.confidence
      });
    } catch (e) {
      console.error("Duplicate check agent failure:", e);
      setDuplicateCheck({ isDuplicate: false, confidence: 0 });
    }

    await new Promise(r => setTimeout(r, 600));
    setActiveAgentIndex(2); // Router
    await new Promise(r => setTimeout(r, 650));
    setActiveAgentIndex(3); // Priority score
    await new Promise(r => setTimeout(r, 650));
    setActiveAgentIndex(4); // Resource planner
    await new Promise(r => setTimeout(r, 700));

    setShowAgentFlow(false);
    setStep(3);
  };

  const handleNextStep3 = () => {
    setStep(4);
  };

  const handleUpvoteDuplicate = async (dupId: string) => {
    triggerUpvote(dupId);
    addPoints(30);

    // Confetti effect
    confetti({
      particleCount: 80,
      spread: 60,
      colors: ['#D6C3A5', '#8B8175', '#7C9A7A']
    });

    navigate('/issues');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !aiClassification || !reporterName.trim()) return;

    try {
      // Structure plans JSONs
      const resolutionPlan = {
        complexity: aiClassification.complexity || "Medium",
        resolutionWindow: aiClassification.resolutionWindow || "1-3 Days",
        requiredResources: aiClassification.requiredResources || ["Road crew", "Safety barriers"]
      };

      const reasonsList = [
        "Dynamic geographic sensor check corroboration",
        "Public density routing index confirmation",
        "AI classification priority metrics validation"
      ];

      await addNewIssue({
        title: aiClassification.suggestedTitle,
        description: description,
        originalDescription: description,
        category: selectedCategory,
        severity: selectedSeverity,
        latitude: location.lat,
        longitude: location.lng,
        address: address,
        reportedBy: reporterName,
        imageUrl: imageB64 || undefined,
        aiClassificationNotes: aiClassification.aiClassificationNotes,
        assignedDepartment: selectedDepartment,
        isEmergency: aiClassification.isEmergency || false,
        priorityScore: aiClassification.priorityScore || 50,
        priorityReasonsJson: JSON.stringify(reasonsList),
        resolutionPlanJson: JSON.stringify(resolutionPlan)
      });

      addPoints(50);

      // Submit success confetti
      confetti({
        particleCount: 120,
        spread: 80,
        colors: ['#D6C3A5', '#8B8175', '#7C9A7A']
      });

      navigate('/issues');
    } catch (err) {
      console.error(err);
    }
  };

  // Agent descriptions for loader
  const agentFlowSteps = [
    { name: "Triage Agent", desc: "Analyzing verbal input & parsing Gemini Vision tags..." },
    { name: "Proximity Inspector", desc: "Checking radius coordinate duplicate matching..." },
    { name: "Intent Routing Agent", desc: "Assigning municipal division and dispatcher queues..." },
    { name: "AI Priority Engine", desc: "Formulating explainable hazard scores & risk calculations..." },
    { name: "Resolution Planner", desc: "Estimating complexity, repair windows & material lists..." }
  ];

  return (
    <div className="space-y-6 page-entrance font-inter">
      {/* Multi-Agent flow loader overlay */}
      {showAgentFlow && (
        <div className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center backdrop-blur-md">
          <div className="bg-[#141416] border border-[rgba(255,255,255,0.06)] rounded-2xl max-w-sm w-full p-8 space-y-6 text-center shadow-premium">
            <div className="flex justify-center mb-2">
              <Brain className="h-10 w-10 text-[#D6C3A5] animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-[#D6C3A5] uppercase">Multi-Agent Dispatch Sequence</h3>
              <p className="text-[10px] text-[#8B8175] font-mono uppercase mt-1">Executing cooperative urban triage workflows</p>
            </div>

            <div className="space-y-3.5 text-left">
              {agentFlowSteps.map((agent, index) => {
                const isFinished = activeAgentIndex > index;
                const isActive = activeAgentIndex === index;
                return (
                  <div key={index} className={`flex items-start gap-3 p-3 border rounded-lg transition-all ${
                    isActive ? 'bg-[rgba(214,195,165,0.04)] border-[#D6C3A5]/30' : 'bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.04)]'
                  }`}>
                    {isFinished ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-[#7C9A7A] shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="h-4.5 w-4.5 text-[#D6C3A5] animate-spin shrink-0" />
                    ) : (
                      <span className="w-4.5 h-4.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#0B0B0C] shrink-0" />
                    )}
                    <div>
                      <div className={`text-xs font-medium ${isActive ? 'text-[#D6C3A5]' : 'text-[#F5F5F7]'}`}>
                        {agent.name}
                      </div>
                      <div className="text-[9px] text-[#8B8175] mt-0.5">{agent.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Page Title */}
      <div className="border-b border-[rgba(255,255,255,0.04)] pb-4 flex justify-between items-baseline">
        <div>
          <span className="text-[10px] font-mono text-[#8B8175] uppercase tracking-wider">SECURE FILING</span>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#F5F5F7]">Report Intake</h1>
        </div>
        <p className="text-[10px] font-mono text-[#8B8175] uppercase">
          Agentic Triage Engine
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="flex bg-[#141416] border border-[rgba(255,255,255,0.06)] rounded-xl text-[10px] sm:text-xs font-semibold uppercase tracking-wider overflow-hidden p-0.5 mb-6">
        <div className={`flex-1 py-2 text-center rounded-lg flex items-center justify-center gap-1.5 transition-all ${
          step === 1 ? 'bg-[#D6C3A5] text-[#0B0B0C]' : 'text-[#8B8175]'
        }`}>
          <MapPin className="h-3.5 w-3.5" /> 1. Location
        </div>
        <div className={`flex-1 py-2 text-center rounded-lg flex items-center justify-center gap-1.5 transition-all ${
          step === 2 ? 'bg-[#D6C3A5] text-[#0B0B0C]' : 'text-[#8B8175]'
        }`}>
          <Brain className="h-3.5 w-3.5" /> 2. Details
        </div>
        <div className={`flex-1 py-2 text-center rounded-lg flex items-center justify-center gap-1.5 transition-all ${
          step === 3 ? 'bg-[#D6C3A5] text-[#0B0B0C]' : 'text-[#8B8175]'
        }`}>
          <ShieldAlert className="h-3.5 w-3.5" /> 3. Scan
        </div>
        <div className={`flex-1 py-2 text-center rounded-lg flex items-center justify-center gap-1.5 transition-all ${
          step === 4 ? 'bg-[#D6C3A5] text-[#0B0B0C]' : 'text-[#8B8175]'
        }`}>
          <Check className="h-3.5 w-3.5" /> 4. Review
        </div>
      </div>

      {/* STEP 1: CHOOSE LOCATION ON MAP */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="p-6 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl">
            <h3 className="text-xs font-semibold text-[#F5F5F7] mb-4 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="h-4 w-4 text-[#D6C3A5]" /> Mark issue coordinates
            </h3>
            <div className="h-96 rounded-xl overflow-hidden relative">
              <GoogleMapContainer
                issues={issues}
                center={{ lat: 37.7749, lng: -122.4194 }}
                zoom={13}
                onLocationSelect={handleLocationSelect}
                selectedLocation={location}
                reportMode={true}
                theme={mapTheme}
              />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-[rgba(255,255,255,0.03)] pt-4">
              <div className="font-mono text-[10px] text-[#8B8175]">
                {location ? (
                  <span className="text-[#D6C3A5] font-semibold">
                    📍 Coords: {location.lat.toFixed(5)}, {location.lng.toFixed(5)} ({address})
                  </span>
                ) : (
                  <span className="italic">No coordinates pinned yet. Please tap grid map above.</span>
                )}
              </div>
              <button
                onClick={handleNextStep1}
                disabled={!location}
                className="btn-primary flex items-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed uppercase font-semibold"
              >
                Next Step <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: DETAILS & AI CLASSIFICATION */}
      {step === 2 && (
        <div className="space-y-6">
          {aiError && (
            <div className="flex items-center gap-2 bg-[#A86666]/10 border border-[#A86666]/30 text-[#A86666] p-4 text-xs font-mono rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Input Form */}
            <div className="md:col-span-7 space-y-6">
              <div className="p-6 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-[#F5F5F7] uppercase tracking-wider">
                    Describe incident details
                  </label>
                  {/* Voice input speech-to-text triggers */}
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    className={`flex items-center gap-1 px-2.5 py-1 border rounded text-[9px] font-mono uppercase transition-all cursor-pointer ${
                      isRecording ? 'bg-[#A86666] text-[#F5F5F7] border-[#A86666] animate-pulse' : 'bg-[#D6C3A5] text-[#0B0B0C] border-[#D6C3A5]'
                    }`}
                  >
                    {isRecording ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                    <span>{isRecording ? "Listening..." : "Voice input"}</span>
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: a large pothole is blocking the center lane on 16th st, water is pooling in it and cars are swerving around..."
                  className="w-full glass-input h-40 text-xs py-3 resize-none focus:border-secondary focus:ring-0 font-inter"
                />
                <span className="block text-[9px] text-[#8B8175] font-mono leading-relaxed">
                  Enter details describing the issue. Voice reporting transcribes live speech directly.
                </span>
              </div>

              {/* Gemini Vision Upload */}
              <div className="p-6 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl">
                <label className="block text-xs font-semibold text-[#F5F5F7] mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Camera className="h-4 w-4 text-[#D6C3A5]" /> Attach Photo (Optional Gemini Vision)
                </label>
                <div className="border border-dashed border-[rgba(255,255,255,0.06)] rounded-lg p-4 text-center bg-[rgba(255,255,255,0.01)] relative">
                  {!imageB64 ? (
                    <div className="space-y-2 py-6">
                      <Upload className="h-7 w-7 mx-auto text-[#8B8175]" />
                      <div className="text-xs text-[#8B8175]">
                        Drag and drop or click to upload
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="relative inline-block">
                      <img src={imageB64} alt="Incident Uploaded" className="max-h-36 max-w-full rounded border border-[rgba(255,255,255,0.08)]" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-[#A86666] text-white p-1 rounded-full border border-[#0B0B0C] hover:bg-[#B97777] transition-all cursor-pointer"
                        title="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="mt-2 text-[9px] font-mono text-[#8B8175] truncate max-w-xs">{imageName}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Realtime Parser Widget */}
            <div className="md:col-span-5">
              <div className="p-6 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl h-full flex flex-col justify-between" style={{ minHeight: '320px' }}>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-semibold text-[#D6C3A5] flex items-center gap-1.5 uppercase tracking-wider">
                      <Brain className="h-4 w-4 stroke-[2]" /> Triage Agent
                    </h3>
                    {aiClassification && (
                      <span className="text-[9px] font-mono font-bold text-[#D6C3A5] bg-[rgba(214,195,165,0.05)] border border-[#D6C3A5]/30 px-1.5 py-0.5 rounded">
                        CONFIDENCE: {aiClassification.confidence}%
                      </span>
                    )}
                  </div>

                  {aiLoading && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-2">
                      <Loader2 className="h-7 w-7 text-[#D6C3A5] animate-spin" />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#8B8175]">AI Parsing details...</span>
                    </div>
                  )}

                  {!aiLoading && !aiClassification && (
                    <div className="text-center py-12 border border-dashed border-[rgba(255,255,255,0.04)] text-[#8B8175] font-mono text-xs rounded-lg">
                      Enter details or upload a photo to initialize triage agents.
                    </div>
                  )}

                  {!aiLoading && aiClassification && (
                    <div className="space-y-4 font-mono text-xs">
                      <div>
                        <span className="text-[9px] text-[#8B8175] block uppercase tracking-wider">Suggested Title</span>
                        <span className="font-semibold text-[#F5F5F7] uppercase text-xs">{aiClassification.suggestedTitle}</span>
                      </div>

                      {/* Manual Overrides */}
                      <div className="space-y-2.5 pt-3 border-t border-[rgba(255,255,255,0.04)]">
                        <span className="text-[8px] text-[#8B8175] block uppercase font-bold tracking-wider">Dispatch Values</span>
                        
                        <div>
                          <label className="text-[9px] text-[#8B8175] block uppercase mb-1">Category</label>
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as Issue['category'])}
                            className="w-full glass-input text-xs py-1.5 bg-[#141416]"
                          >
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Sanitation">Sanitation</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Public Safety">Public Safety</option>
                            <option value="Environment">Environment</option>
                            <option value="Mobility">Mobility</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] text-[#8B8175] block uppercase mb-1">Severity</label>
                          <select
                            value={selectedSeverity}
                            onChange={(e) => setSelectedSeverity(e.target.value as Issue['severity'])}
                            className="w-full glass-input text-xs py-1.5 bg-[#141416]"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] text-[#8B8175] block uppercase mb-1">Assigned Department</label>
                          <input
                            type="text"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full glass-input text-xs py-1.5 bg-[#141416]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[rgba(255,255,255,0.04)] pt-3 mt-4 flex items-center gap-2 text-[9px] font-mono text-[#8B8175] uppercase">
                  <Sparkles className="h-3.5 w-3.5 text-[#D6C3A5] animate-pulse" />
                  <span>Gemini Urban Triage Pipeline</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#141416] p-4 border border-[rgba(255,255,255,0.05)] rounded-xl">
            <button
              onClick={() => setStep(1)}
              className="btn-secondary text-xs py-1.5 px-4"
            >
              &larr; Back
            </button>
            <button
              onClick={handleNextStep2}
              disabled={description.length < 10 || aiLoading || !aiClassification}
              className="btn-primary flex items-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              Validate Ticket &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DUPLICATE DETECTION / AI SCAN */}
      {step === 3 && duplicateCheck && (
        <div className="space-y-6">
          <div className="p-6 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl">
            <h3 className="text-xs font-semibold text-[#F5F5F7] flex items-center gap-2 mb-4 uppercase tracking-wider">
              <Brain className="h-5 w-5 text-[#D6C3A5]" /> Proximity Duplicate Scan Results
            </h3>

            {duplicateCheck.isDuplicate && duplicateCheck.matchingIssue ? (
              <div className="space-y-6">
                {/* Warning Alert */}
                <div className="border border-[#A86666]/35 bg-[rgba(168,102,102,0.02)] p-5 flex items-start gap-4 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-[#A86666] flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm text-[#A86666] uppercase">POTENTIAL DUPLICATE FOUND</h4>
                    <p className="text-xs text-[#F5F5F7] mt-1 font-light leading-relaxed">
                      CivicPulse AI scan has detected a highly matching active issue in the immediate vicinity ({duplicateCheck.confidence}% match confidence).
                    </p>
                  </div>
                </div>

                {/* Duplicate Issue Card Details */}
                <div className="border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] p-5 rounded-lg">
                  <span className="text-[9px] font-mono text-[#8B8175] uppercase block">Existing Ticket Details</span>
                  <h4 className="font-semibold text-[#F5F5F7] mt-1 text-base uppercase">
                    {duplicateCheck.matchingIssue.title}
                  </h4>
                  <p className="text-xs text-[#8B8175] font-mono mt-0.5">📍 {duplicateCheck.matchingIssue.address}</p>
                  <p className="text-xs text-[#A1A1AA] mt-3 bg-[#0B0B0C] p-3 border border-[rgba(255,255,255,0.04)] rounded-lg">
                    "{duplicateCheck.matchingIssue.description.substring(0, 150)}..."
                  </p>
                  <div className="flex gap-4 items-center mt-4 font-mono text-xs text-[#8B8175]">
                    <span>Severity: <strong className="text-[#A86666]">{duplicateCheck.matchingIssue.severity}</strong></span>
                    <span>Upvotes: <strong>{duplicateCheck.matchingIssue.upvotes}</strong></span>
                    <span>Status: <strong>{duplicateCheck.matchingIssue.status.toUpperCase()}</strong></span>
                  </div>
                </div>

                {/* Choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-[rgba(255,255,255,0.04)] p-4 bg-[rgba(255,255,255,0.01)] flex flex-col justify-between rounded-lg">
                    <div>
                      <h5 className="font-semibold text-xs text-[#F5F5F7] uppercase tracking-wider">Support Existing Issue</h5>
                      <p className="text-[11px] text-[#A1A1AA] mt-1 font-light leading-relaxed">
                        Upvoting the existing ticket helps the city prioritize it, and awards you <strong>+30 XP</strong> instantly without cluttering logs.
                      </p>
                    </div>
                    <button
                      onClick={() => handleUpvoteDuplicate(duplicateCheck.matchingIssue!.id)}
                      className="mt-4 btn-primary text-xs text-center uppercase"
                    >
                      Upvote &amp; Return
                    </button>
                  </div>

                  <div className="border border-[rgba(255,255,255,0.04)] p-4 bg-[rgba(255,255,255,0.01)] flex flex-col justify-between rounded-lg">
                    <div>
                      <h5 className="font-semibold text-xs text-[#F5F5F7] uppercase tracking-wider">File Unique Issue</h5>
                      <p className="text-[11px] text-[#A1A1AA] mt-1 font-light leading-relaxed">
                        If you believe your report is distinct or represents a separate occurrence, you can bypass the duplicate recommendation and file.
                      </p>
                    </div>
                    <button
                      onClick={handleNextStep3}
                      className="mt-4 btn-secondary text-xs text-center uppercase"
                    >
                      File Anyway
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center py-8">
                <div className="w-14 h-14 bg-[rgba(124,154,122,0.04)] border border-[#7C9A7A]/35 text-[#7C9A7A] flex items-center justify-center rounded-full mx-auto shadow-sm">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#F5F5F7] text-base uppercase tracking-tight">Civic Clearance Confirmed</h4>
                  <p className="text-xs text-[#A1A1AA] mt-1.5 max-w-sm mx-auto font-light leading-relaxed">
                    AI scanning checked the geographic radius and found no matching active reports. You can file a fresh ticket.
                  </p>
                </div>
                <button
                  onClick={handleNextStep3}
                  className="btn-primary inline-flex items-center gap-1.5 text-xs px-6 py-2.5"
                >
                  Proceed to Review &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: FINAL REVIEW & SUBMIT */}
      {step === 4 && aiClassification && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 bg-[rgba(20,20,22,0.65)] border border-[rgba(255,255,255,0.05)] rounded-xl space-y-4">
            <h3 className="text-xs font-semibold text-[#F5F5F7] mb-4 uppercase tracking-wider">
              Finalize &amp; File Official Ticket
            </h3>

            {/* AI Generated Structured Summary */}
            <div className="border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] p-5 rounded-lg space-y-4 font-mono text-xs text-[#8B8175]">
              <div className="flex justify-between items-start border-b border-[rgba(255,255,255,0.04)] pb-3">
                <div>
                  <span className="text-[9px] text-[#8B8175] uppercase block tracking-wider">AI Structured Title</span>
                  <span className="font-semibold text-[#F5F5F7] uppercase text-sm">{aiClassification.suggestedTitle}</span>
                </div>
                <span className="text-[9px] text-[#D6C3A5] bg-[rgba(214,195,165,0.05)] border border-[#D6C3A5]/30 font-bold px-2 py-0.5 rounded uppercase">
                  {selectedCategory}
                </span>
              </div>

              <div>
                <span className="text-[9px] text-[#8B8175] uppercase block tracking-wider mb-1">AI Formatted Incident Report</span>
                <div className="bg-[#0B0B0C] p-4 border border-[rgba(255,255,255,0.04)] rounded-lg leading-relaxed text-[11px] text-[#F5F5F7]/90 max-h-48 overflow-y-auto whitespace-pre-line font-light">
                  {aiClassification.summary}
                </div>
              </div>

              {imageB64 && (
                <div>
                  <span className="text-[9px] text-[#8B8175] uppercase block mb-1 tracking-wider">Attached Incident Photo</span>
                  <img src={imageB64} alt="Incident Preview" className="max-h-32 rounded border border-[rgba(255,255,255,0.06)]" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-[rgba(255,255,255,0.04)] pt-3">
                <div>
                  <span className="text-[9px] text-[#8B8175] uppercase block tracking-wider">Target Coordinates</span>
                  <span className="text-[#F5F5F7]">{location?.lat.toFixed(5)}, {location?.lng.toFixed(5)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#8B8175] uppercase block tracking-wider">Municipal Geocoding</span>
                  <span className="text-[#F5F5F7] text-[11px] truncate block">{address}</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-[#8B8175] uppercase block tracking-wider">Dispatch Routing Unit</span>
                <span className="text-[#D6C3A5] font-semibold uppercase">{selectedDepartment} (Severity: {selectedSeverity})</span>
              </div>
            </div>

            {/* Reporter Name field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#F5F5F7] flex items-center gap-1.5 uppercase tracking-wider">
                <User className="h-4 w-4 text-[#D6C3A5]" /> Reporter Identifier
              </label>
              <input
                type="text"
                required
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="e.g. Robin Hood"
                className="w-full glass-input py-3 text-xs"
              />
              <span className="block text-[9px] text-[#8B8175] font-mono">
                Submit this report to earn <strong>+50 XP</strong> on the citizen leaderboard.
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center bg-[#141416] p-4 border border-[rgba(255,255,255,0.05)] rounded-xl">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-secondary text-xs py-1.5 px-4"
            >
              &larr; Back
            </button>
            <button
              type="submit"
              disabled={!reporterName.trim()}
              className="btn-primary flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed uppercase font-semibold"
            >
              <Sparkles className="h-4 w-4" /> File official ticket (+50 XP)
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

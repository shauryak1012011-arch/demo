import React, { useState, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Upload,
  Search,
  MapPin,
  Brain,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const AiResearchAssistantView: React.FC = () => {
  const [activeSubMode, setActiveSubMode] = useState<'chat' | 'deep_reasoning' | 'image_analysis' | 'search_grounding' | 'maps_grounding'>('chat');

  // 1. Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `Greetings. I am the DisasterGuard AI Research Assistant. I have live access to current telemetry from your 4 connected monitoring poles and the 10-Year Historical Disaster Catalog (2016–2026). How can I assist your hazard analysis or exhibition research today?`,
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // 2. Deep Reasoning State (gemini-4-carbon)
  const [deepPrompt, setDeepPrompt] = useState('Evaluate the cascading compound risk when high-intensity monsoonal cloudbursts strike deforested hillslopes in the Western Ghats while river basins downstream are already at 90% bankfull stage.');
  const [deepLoading, setDeepLoading] = useState(false);
  const [deepResult, setDeepResult] = useState('');

  // 3. Image Analysis State (gemini-4-argon)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('Inspect this field photograph. Identify visible slope instability signs, tension cracks, waterlogging patterns, or structural distress.');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 4. Search Grounding State (gemini-3.8-flash with googleSearch)
  const [searchQuery, setSearchQuery] = useState('Current IMD active weather warnings and depression bulletins in Bay of Bengal today');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  // 5. Maps Grounding State (gemini-3.8-flash with googleMaps)
  const [mapsQuery, setMapsQuery] = useState('Find emergency disaster management authority centers and relief shelters near Guwahati Assam');
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsResult, setMapsResult] = useState<any>(null);

  const handleSendChat = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;
    const userMsg = { role: 'user' as const, text, time: new Date().toLocaleTimeString() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/research-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: chatMessages
        })
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'Analysis completed.',
          time: new Date().toLocaleTimeString()
        }
      ]);
    } catch (e: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Error connecting to assistant: ${e.message}`,
          time: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDeepReasoning = async () => {
    setDeepLoading(true);
    setDeepResult('');
    try {
      const res = await fetch('/api/ai/deep-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ researchTopic: deepPrompt })
      });
      const data = await res.json();
      setDeepResult(data.analysis || 'Analysis generated.');
    } catch (e: any) {
      setDeepResult(`Error: ${e.message}`);
    } finally {
      setDeepLoading(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    setImageLoading(true);
    setImageResult('');
    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          question: imagePrompt
        })
      });
      const data = await res.json();
      setImageResult(data.analysis || 'Image analysis complete.');
    } catch (e: any) {
      setImageResult(`Error: ${e.message}`);
    } finally {
      setImageLoading(false);
    }
  };

  const handleSearchGrounding = async () => {
    setSearchLoading(true);
    setSearchResult(null);
    try {
      const res = await fetch('/api/ai/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      setSearchResult(data);
    } catch (e: any) {
      setSearchResult({ result: `Error: ${e.message}`, sources: [] });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleMapsGrounding = async () => {
    setMapsLoading(true);
    setMapsResult(null);
    try {
      const res = await fetch('/api/ai/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: mapsQuery, latitude: 26.1844, longitude: 91.7539 })
      });
      const data = await res.json();
      setMapsResult(data);
    } catch (e: any) {
      setMapsResult({ result: `Error: ${e.message}`, places: [] });
    } finally {
      setMapsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-mode Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubMode('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubMode === 'chat'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Research Assistant Chat
          </button>

          <button
            onClick={() => setActiveSubMode('deep_reasoning')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubMode === 'deep_reasoning'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Brain className="w-4 h-4" />
            Deep Reasoning (gemini-4-carbon)
          </button>

          <button
            onClick={() => setActiveSubMode('image_analysis')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubMode === 'image_analysis'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Image Understanding (gemini-4-argon)
          </button>

          <button
            onClick={() => setActiveSubMode('search_grounding')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubMode === 'search_grounding'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-4 h-4" />
            Search Grounding
          </button>

          <button
            onClick={() => setActiveSubMode('maps_grounding')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubMode === 'maps_grounding'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Maps Grounding
          </button>
        </div>

        <span className="text-[11px] font-mono text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded border border-blue-200 hidden lg:inline">
          MODELS: gemini-4-carbon · gemini-4-argon · gemini-3.8-flash
        </span>
      </div>

      {/* 1. CHAT MODE */}
      {activeSubMode === 'chat' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col h-[650px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                DisasterGuard Multi-Turn Research Chat
              </h3>
              <p className="text-xs text-slate-600">
                Grounded conversational agent citing physical pole telemetry and 10-year disaster history.
              </p>
            </div>
          </div>

          {/* Chat Messages Scroll */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 text-xs ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 font-bold font-mono text-xs">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl p-3.5 space-y-1 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                  <div className={`text-[10px] text-right font-mono ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-xs font-mono text-blue-700 bg-blue-50 p-3 rounded-xl border border-blue-200 w-fit">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                Querying database &amp; formulating explainable response...
              </div>
            )}
          </div>

          {/* Suggested Prompts Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-mono text-slate-500 font-semibold">SUGGESTIONS:</span>
            {[
              'Compare Brahmaputra water stage with 2023 Yamuna inundation',
              'Explain why single-station P-wave alerts require array validation',
              'Summarize last 10 years of Bay of Bengal cyclones'
            ].map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(sug)}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 transition-colors cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask about current pole telemetry, flood rate of rise, or historical disaster events..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
            <button
              onClick={() => handleSendChat()}
              disabled={chatLoading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      )}

      {/* 2. DEEP REASONING (gemini-4-carbon with ThinkingLevel.HIGH) */}
      {activeSubMode === 'deep_reasoning' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              HIGH THINKING LEVEL (ThinkingLevel.HIGH)
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              gemini-4-carbon Deep Scientific Hazard Assessment
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Complex multi-hazard cascading failure evaluation without arbitrary token caps.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <label className="text-slate-800 font-bold block">Research Topic / Multi-Hazard Hypothesis:</label>
            <textarea
              rows={3}
              value={deepPrompt}
              onChange={(e) => setDeepPrompt(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 text-xs focus:outline-none focus:border-blue-500 font-mono"
            />

            <button
              onClick={handleDeepReasoning}
              disabled={deepLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {deepLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Execute Deep Reasoning Assessment
            </button>
          </div>

          {deepResult && (
            <div className="bg-slate-50 p-4 rounded-xl border border-blue-200 text-xs text-slate-800 space-y-2 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              <div className="font-mono text-[10px] text-blue-700 font-bold border-b border-slate-200 pb-1">
                ENGINE: gemini-4-carbon · THINKING LEVEL: HIGH · CASCADING PROTOCOL
              </div>
              {deepResult}
            </div>
          )}
        </div>
      )}

      {/* 3. IMAGE UNDERSTANDING (gemini-4-argon) */}
      {activeSubMode === 'image_analysis' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              MULTIMODAL COMPUTER VISION
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              gemini-4-argon Field Imagery Hazard Inspection
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Upload photographs of flood waterlines, slope fissures, smoke columns, or monitoring pole physical mounts for hazard classification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 text-xs">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50 min-h-[200px]"
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Uploaded Hazard Preview" className="max-h-48 rounded object-contain shadow-xs" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="font-bold text-slate-900">Click or drag image to upload</span>
                    <span className="text-[11px] text-slate-500 mt-1">PNG, JPG, or WEBP inspection photo</span>
                  </>
                )}
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Inspection Query</label>
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 text-xs"
                />
              </div>

              <button
                onClick={handleAnalyzeImage}
                disabled={!selectedImage || imageLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {imageLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Analyze Hazard Photo
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 overflow-y-auto max-h-[350px]">
              <div className="font-mono text-[10px] text-blue-700 font-bold border-b border-slate-200 pb-1 mb-2">
                ANALYSIS OUTPUT: gemini-4-argon
              </div>
              {imageResult ? (
                <div className="whitespace-pre-wrap leading-relaxed">{imageResult}</div>
              ) : (
                <div className="text-slate-400 italic flex items-center justify-center h-48">
                  Upload an image and run analysis to view visual findings.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SEARCH GROUNDING (gemini-3.8-flash with googleSearch) */}
      {activeSubMode === 'search_grounding' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              REAL-TIME WEB SEARCH GROUNDING
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              gemini-3.8-flash Grounded Meteorological Search
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 text-xs shadow-2xs"
            />
            <button
              onClick={handleSearchGrounding}
              disabled={searchLoading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {searchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Fetch Search Grounding
            </button>
          </div>

          {searchResult && (
            <div className="bg-slate-50 p-4 rounded-xl border border-blue-200 text-xs text-slate-800 space-y-3">
              <div className="whitespace-pre-wrap leading-relaxed">{searchResult.result}</div>
              {searchResult.sources?.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono text-blue-700 font-bold uppercase block">Grounded Web Citations:</span>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.sources.map((s: any, idx: number) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-700 bg-white px-2.5 py-1 rounded border border-slate-300 hover:underline flex items-center gap-1 font-medium shadow-2xs"
                      >
                        {s.title} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. MAPS GROUNDING (gemini-3.8-flash with googleMaps) */}
      {activeSubMode === 'maps_grounding' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              GEOGRAPHIC PLACES &amp; INFRASTRUCTURE GROUNDING
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              gemini-3.8-flash Google Maps Spatial Grounding
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="text"
              value={mapsQuery}
              onChange={(e) => setMapsQuery(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 text-xs shadow-2xs"
            />
            <button
              onClick={handleMapsGrounding}
              disabled={mapsLoading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {mapsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              Find Grounded Locations
            </button>
          </div>

          {mapsResult && (
            <div className="bg-slate-50 p-4 rounded-xl border border-blue-200 text-xs text-slate-800 space-y-3">
              <div className="whitespace-pre-wrap leading-relaxed">{mapsResult.result}</div>
              {mapsResult.places?.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="text-[10px] font-mono text-blue-700 font-bold uppercase block">Map Grounding Places:</span>
                  <div className="flex flex-wrap gap-2">
                    {mapsResult.places.map((p: any, idx: number) => (
                      <a
                        key={idx}
                        href={p.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-700 bg-white px-2.5 py-1 rounded border border-slate-300 hover:underline flex items-center gap-1 font-medium shadow-2xs"
                      >
                        {p.title} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Search, Calendar, Share, CalendarHeart } from 'lucide-react';
import { convertAdToJapaneseEra, convertEraToAdYear, getLifeStage, getYearData, type YearData } from './data';

function App() {
  const [query, setQuery] = useState('');
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [birthDate, setBirthDate] = useState<string>(() => {
    return localStorage.getItem('birthDate') || '';
  });
  const [showSettings, setShowSettings] = useState(false);

  const saveBirthDate = (date: string) => {
    setBirthDate(date);
    localStorage.setItem('birthDate', date);
    setShowSettings(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let targetYear = parseInt(query, 10);

    if (isNaN(targetYear) || targetYear < 1000) {
      const eraYear = convertEraToAdYear(query.trim());
      if (eraYear) {
        targetYear = eraYear;
      }
    }

    if (!isNaN(targetYear) && targetYear >= 1868 && targetYear <= new Date().getFullYear() + 5) {
      setActiveYear(targetYear);
    } else {
      alert('正しい西暦(1868〜)か和暦(例: 平成7)を入力してください。');
    }
  };

  const shareToTwitter = (yearData: YearData, lifeStageData: { age: number, stage: string } | null) => {
    const eraStr = convertAdToJapaneseEra(yearData.year);
    const eraYearText = eraStr.eraYear === 1 ? '元年' : `${eraStr.eraYear}年`;
    let text = `${yearData.year}年（${eraStr.era}${eraYearText}）の出来事や流行を振り返りました！\n`;
    
    if (lifeStageData) {
      text += `この時私は${lifeStageData.age}歳（${lifeStageData.stage}）でした。\n`;
    }
    text += `主な出来事: ${yearData.events.join(' / ')}\n#TimeLeapCal`;
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const eraData = activeYear ? convertAdToJapaneseEra(activeYear) : null;
  const eraText = eraData ? `${eraData.era}${eraData.eraYear === 1 ? '元' : eraData.eraYear}年` : '';
  const yearData = activeYear ? getYearData(activeYear, eraData!.era) : null;
  const lifeStage = activeYear ? getLifeStage(birthDate, activeYear) : null;

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full bg-white text-black min-h-screen">
      
      {/* Left Sidebar */}
      <div className="w-full md:w-[400px] border-b md:border-b-0 md:border-r border-black p-8 flex flex-col gap-12 z-20 shrink-0">
        
        {/* Header & Search */}
        <div className="space-y-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tighter uppercase">Time-Leap Cal</h1>
            <p className="text-[10px] tracking-[0.2em] uppercase opacity-50 font-medium">Chronological Transition System</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="YEAR OR ERA"
                className="w-full px-4 py-4 bg-white border border-black text-xl font-bold placeholder:text-black/20 focus:outline-none focus:bg-black focus:text-white transition-colors"
              />
              <button 
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-4 bg-black text-white hover:bg-white hover:text-black border-l border-black transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {birthDate ? (
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-black/10 px-3 py-2 inline-block">
              <CalendarHeart className="w-3 h-3" />
              Profile Active
            </div>
          ) : (
            <button 
              onClick={() => setShowSettings(true)}
              className="text-[10px] font-bold uppercase tracking-widest border border-black px-3 py-2 hover:bg-black hover:text-white transition-colors"
            >
              Set Birth Date
            </button>
          )}
        </div>

        {/* Events Section */}
        {activeYear && yearData && (
          <div className="flex flex-col gap-8 border-t border-black pt-8 animate-in fade-in duration-500">
            <div>
              <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 mb-6">Major Events</h3>
              <ul className="space-y-6">
                {yearData.events.map((event, i) => (
                  <li key={i} className="text-lg font-bold leading-tight border-l-4 border-black pl-4">{event}</li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-1 gap-6 border-t border-black pt-8">
              <div>
                <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 mb-2">Buzzword</h4>
                <p className="text-sm font-bold uppercase">{yearData.buzzwords[0]}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 mb-2">Top Hit</h4>
                <p className="text-sm font-bold uppercase">{yearData.songs[0]}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Content Area */}
      <div className="flex-1 relative flex flex-col bg-white overflow-hidden">
        {activeYear && yearData ? (
          <div className="flex-1 flex flex-col">
            {/* Visual Header */}
            <div className="h-[40vh] relative border-b border-black overflow-hidden">
              <img 
                src={yearData.imageUrl} 
                alt={`${activeYear}`}
                className="w-full h-full object-cover filter grayscale contrast-125"
              />
              <div className="absolute inset-0 bg-white/10"></div>
              <div className="absolute bottom-0 left-0 bg-black text-white px-6 py-2 text-sm font-bold tracking-widest uppercase">
                Scene: {activeYear}
              </div>
            </div>

            {/* Main Data */}
            <div className="flex-1 flex flex-col p-8 md:p-16 relative">
              <div className="absolute top-8 right-8">
                <button 
                  onClick={() => shareToTwitter(yearData, lifeStage)}
                  className="flex items-center gap-2 px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  <Share className="w-4 h-4" />
                  Share Result
                </button>
              </div>

              <div className="mt-auto space-y-2">
                <div className="text-2xl font-bold tracking-[0.5em] opacity-30">{activeYear}</div>
                <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter leading-none -ml-2">
                  {eraText}
                </h1>
              </div>

              {lifeStage && (
                <div className="mt-12 border-t-8 border-black pt-8 max-w-md">
                  <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 mb-4 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Personal Timeline
                  </h3>
                  {lifeStage.stage === '生まれる前' ? (
                    <p className="text-4xl font-black leading-none uppercase italic">Not Yet Born</p>
                  ) : (
                    <div className="flex items-baseline gap-4">
                      <span className="text-8xl font-black leading-none">{lifeStage.age}</span>
                      <div className="flex flex-col">
                        <span className="text-xl font-bold uppercase">Years Old</span>
                        <span className="text-sm font-medium opacity-60 uppercase">{lifeStage.stage}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-32 h-32 border-4 border-black flex items-center justify-center mb-12">
              <Search className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-tight">
              Input year to<br/>initiate jump
            </h2>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] opacity-30">Waiting for temporal coordinates...</p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal 
          birthDate={birthDate} 
          onClose={() => setShowSettings(false)} 
          onSave={saveBirthDate}
        />
      )}
    </div>
  );
}

function SettingsModal({ birthDate, onClose, onSave }: { birthDate: string, onClose: () => void, onSave: (d: string) => void }) {
  const [date, setDate] = useState(birthDate || '1990-04-01');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-none animate-in fade-in duration-200">
      <div className="bg-white border-2 border-black p-12 max-w-md w-full">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Set Origin</h2>
        <p className="text-sm font-medium mb-12 opacity-60 uppercase tracking-wider">Define your birth coordinates for personalized temporal mapping.</p>
        
        <input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-white border border-black px-6 py-4 text-xl font-bold focus:outline-none focus:bg-black focus:text-white transition-colors mb-12"
        />
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => onSave(date)}
            className="w-full py-6 bg-black text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black border border-black transition-colors"
          >
            Save Configuration
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
          >
            Abort
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

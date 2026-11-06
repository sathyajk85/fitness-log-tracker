import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Activity, Utensils, MessageSquare, LineChart as ChartIcon, Settings, Plus, Camera, ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';

export default function RecompTracker() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Settings State
  const [targets, setTargets] = useState({ calories: 1900, protein: 135, steps: 15000 });
  const [bmr, setBmr] = useState(1750);
  
  // Daily Logs State
  const [steps, setSteps] = useState(15200);
  const [foodLog, setFoodLog] = useState([{ id: 1, text: "Roasted chicken rice, extra char siew", cals: 800, pro: 46 }]);
  const [exerciseLog, setExerciseLog] = useState([]);
  const [newFood, setNewFood] = useState("");
  const [newExercise, setNewExercise] = useState("");

  // Derived Metrics
  const activeBurn = Math.floor(steps * 0.04);
  const tdee = bmr + activeBurn;
  const totalCals = foodLog.reduce((sum, item) => sum + item.cals, 0);
  const totalPro = foodLog.reduce((sum, item) => sum + item.pro, 0);
  const netBalance = totalCals - tdee;

  // Mock Historical Data for Charts
  const trendData = [
    { date: '01-11', weight: 71.9, bodyFat: 22.1 },
    { date: '02-11', weight: 71.8, bodyFat: 22.0 },
    { date: '03-11', weight: 71.8, bodyFat: 21.9 },
    { date: '04-11', weight: 71.6, bodyFat: 21.7 },
    { date: '05-11', weight: 71.5, bodyFat: 21.5 },
  ];

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const addFood = () => {
    if (!newFood) return;
    setFoodLog([...foodLog, { id: Date.now(), text: newFood, cals: 350, pro: 25 }]);
    setNewFood("");
  };

  const addExercise = () => {
    if (!newExercise) return;
    setExerciseLog([...exerciseLog, { id: Date.now(), text: newExercise }]);
    setNewExercise("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-10">
      
      {/* Sticky Top Header & Navigation */}
      <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-md">
        <div className="p-4 flex flex-col gap-4">
          <h1 className="text-xl font-bold text-center text-emerald-400 tracking-wide">Fitness Log and Tracker</h1>
          
          {/* Date Navigator */}
          <div className="flex justify-between items-center bg-slate-800 p-2 rounded-lg">
            <button className="p-2 hover:bg-slate-700 rounded"><ChevronLeft size={20} /></button>
            <span className="font-semibold">{formatDate(currentDate)}</span>
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-slate-700 rounded"><ChevronRight size={20} /></button>
              <div className="relative flex items-center">
                <input 
                  type="date" 
                  value={currentDate} 
                  onChange={(e) => setCurrentDate(e.target.value)} 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
                />
                <button className="p-2 hover:bg-slate-700 rounded text-emerald-400 bg-slate-700/50"><Calendar size={20} /></button>
              </div>
            </div>
          </div>

          {/* Top Nav Bar */}
          <div className="flex justify-around text-xs font-semibold text-slate-400">
            <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-emerald-400' : ''}`}><Activity size={20} /> DASH</button>
            <button onClick={() => setActiveTab('coach')} className={`flex flex-col items-center gap-1 ${activeTab === 'coach' ? 'text-blue-400' : ''}`}><MessageSquare size={20} /> COACH</button>
            <button onClick={() => setActiveTab('insights')} className={`flex flex-col items-center gap-1 ${activeTab === 'insights' ? 'text-purple-400' : ''}`}><ChartIcon size={20} /> INSIGHTS</button>
            <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-slate-200' : ''}`}><Settings size={20} /> SETTINGS</button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Net Balance Card */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h2 className="text-sm font-semibold text-slate-400 mb-1">Net Calorie Balance</h2>
              <p className="text-xs text-slate-500 mb-3">TDEE: {bmr} BMR + {activeBurn} active = {tdee} kcal</p>
              <div className={`text-4xl font-black ${netBalance <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {netBalance > 0 ? '+' : ''}{netBalance} kcal
              </div>
              <p className="text-xs font-bold mt-1 tracking-wider uppercase text-slate-500">{netBalance <= 0 ? 'Deficit' : 'Surplus'}</p>
            </div>

            {/* Calories & Protein Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase">Calories</h3>
                <div className="text-2xl font-bold">{totalCals} <span className="text-sm font-normal text-slate-500">/ {targets.calories}</span></div>
                <div className="w-full bg-slate-800 h-2 mt-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${Math.min(100, (totalCals / targets.calories) * 100)}%` }}></div>
                </div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase">Protein</h3>
                <div className="text-2xl font-bold">{totalPro}g <span className="text-sm font-normal text-slate-500">/ {targets.protein}g</span></div>
                <div className="w-full bg-slate-800 h-2 mt-3 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full" style={{ width: `${Math.min(100, (totalPro / targets.protein) * 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Daily Body Stats */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h2 className="flex items-center gap-2 font-bold mb-4"><Activity className="text-cyan-400" size={18} /> Daily Body & Activity Stats</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-400">Steps</label>
                  <input type="number" value={steps} onChange={(e) => setSteps(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded p-2 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Weight (kg)</label>
                  <input type="number" placeholder="71.5" className="w-full bg-slate-950 border border-slate-800 rounded p-2 mt-1" />
                </div>
              </div>
            </div>

            {/* Food Log */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h2 className="flex items-center gap-2 font-bold mb-4"><Utensils className="text-orange-400" size={18} /> Food Log</h2>
              <div className="flex gap-2 mb-4">
                <button className="bg-slate-800 p-3 rounded-lg text-slate-300 hover:text-white"><Camera size={20} /></button>
                <input type="text" placeholder="e.g. 2 slices of sourdough..." value={newFood} onChange={(e) => setNewFood(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500" />
                <button onClick={addFood} className="bg-emerald-500 text-slate-950 p-3 rounded-lg font-bold"><Plus size={20} /></button>
              </div>
              <div className="space-y-2">
                {foodLog.map((log) => (
                  <div key={log.id} className="flex justify-between bg-slate-950 p-3 rounded-lg text-sm border border-slate-800/50">
                    <span className="text-slate-300 truncate pr-2">{log.text}</span>
                    <span className="text-slate-400 shrink-0">{log.cals} kcal • <span className="text-blue-400">{log.pro}g</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exercise Log */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h2 className="flex items-center gap-2 font-bold mb-4"><Dumbbell className="text-red-400" size={18} /> Exercise Log</h2>
              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="e.g. Push Day - 35 mins..." value={newExercise} onChange={(e) => setNewExercise(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-red-500" />
                <button onClick={addExercise} className="bg-red-500 text-slate-950 p-3 rounded-lg font-bold"><Plus size={20} /></button>
              </div>
              <div className="space-y-2">
                {exerciseLog.map((log) => (
                  <div key={log.id} className="bg-slate-950 p-3 rounded-lg text-sm border border-slate-800/50 text-slate-300">
                    {log.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h2 className="font-bold text-lg mb-4 text-purple-400">Recomposition Trends</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={10} />
                    <YAxis yAxisId="left" stroke="#38bdf8" fontSize={12} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" fontSize={12} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    <Line yAxisId="left" type="monotone" dataKey="weight" name="Weight (kg)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="bodyFat" name="Body Fat %" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h3 className="font-bold mb-2">AI Progress Note</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Your rolling 7-day deficit is firmly intact. You’ve averaged 14,800 steps this week, keeping visceral fat oxidation high. Weight is ticking down cleanly.</p>
            </div>
          </div>
        )}

        {/* COACH TAB */}
        {activeTab === 'coach' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 h-[60vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 font-bold flex items-center gap-2"><MessageSquare size={18} className="text-blue-400"/> AI Coach</div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="bg-slate-800 p-3 rounded-lg rounded-tl-none w-5/6 text-sm text-slate-300">
                Bro, what are we hitting today? If you need a form check or want to log a meal, let me know.
              </div>
            </div>
            <div className="p-3 border-t border-slate-800 flex gap-2">
              <input type="text" placeholder="Ask for tips or a form check..." className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-sm" />
              <button className="bg-blue-500 text-slate-950 px-4 py-2 rounded font-bold">Ask</button>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-5">
            <h2 className="font-bold text-lg mb-2">Target Configurations</h2>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Daily Calorie Ceiling (kcal)</label>
              <input type="number" value={targets.calories} onChange={(e) => setTargets({...targets, calories: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-3" />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Daily Protein Target (g)</label>
              <input type="number" value={targets.protein} onChange={(e) => setTargets({...targets, protein: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-3" />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Daily Step Goal</label>
              <input type="number" value={targets.steps} onChange={(e) => setTargets({...targets, steps: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded p-3" />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Base Metabolic Rate (BMR)</label>
              <input type="number" value={bmr} onChange={(e) => setBmr(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded p-3" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
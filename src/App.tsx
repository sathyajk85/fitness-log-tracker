import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Utensils, Lightbulb, Trash2, Loader2, Target, Flame, Dumbbell, ImagePlus, X, ChevronLeft, ChevronRight, MessageSquare, Sparkles, Settings as SettingsIcon, Send, Plus, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Local Storage / Mock Database Fallback for Instant Preview ---
const STORAGE_KEY = 'recomp_tracker_data_v1';

const getInitialData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  return {
    meals: [
      { id: '1', date: new Date().toISOString().split('T')[0], name: "Roasted chicken rice, extra char siew", calories: 800, protein: 46, createdAt: Date.now() }
    ],
    exercises: [
      { id: '1', date: new Date().toISOString().split('T')[0], text: "Push Day - Bench press & shoulder press (45 mins)", createdAt: Date.now() }
    ],
    metrics: [
      { id: '1', date: new Date().toISOString().split('T')[0], steps: 15200, weight: 71.5, bodyFat: 21.5, muscleMass: 54.0, timestamp: Date.now() }
    ],
    settings: {
      calorieTarget: 1900,
      proteinTarget: 135,
      stepsTarget: 15000
    }
  };
};

export default function App() {
  const [data, setData] = useState(getInitialData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const todayStr = new Date().toISOString().split('T')[0];

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const currentMeals = useMemo(() => {
    return data.meals.filter(m => m.date === selectedDate).sort((a, b) => b.createdAt - a.createdAt);
  }, [data.meals, selectedDate]);

  const currentExercises = useMemo(() => {
    return data.exercises.filter(e => e.date === selectedDate).sort((a, b) => b.createdAt - a.createdAt);
  }, [data.exercises, selectedDate]);

  const currentMetric = useMemo(() => data.metrics.find(m => m.date === selectedDate), [data.metrics, selectedDate]);
  
  const currentSteps = currentMetric?.steps || 0;
  const currentCalories = currentMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const currentProtein = currentMeals.reduce((sum, meal) => sum + (meal.protein || 0), 0);

  const deleteMeal = (mealId) => {
    setData(prev => ({ ...prev, meals: prev.meals.filter(m => m.id !== mealId) }));
  };

  const deleteExercise = (exerciseId) => {
    setData(prev => ({ ...prev, exercises: prev.exercises.filter(e => e.id !== exerciseId) }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-6">
      
      {/* Sticky Top Header & Nav Container */}
      <div className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 pt-4">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <header className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Fitness Log and Tracker
            </h1>
            <p className="text-slate-400 text-sm mt-1">Consistency over perfection.</p>
          </header>

          <nav className="flex overflow-x-auto justify-start md:justify-center items-center pb-2 gap-2 md:gap-6 w-full" style={{ scrollbarWidth: 'none' }}>
            <NavItem icon={<Activity />} label="Dash" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={<MessageSquare />} label="Coach" active={activeTab === 'coach'} onClick={() => setActiveTab('coach')} />
            <NavItem icon={<Sparkles />} label="Insights" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
            <NavItem icon={<Lightbulb />} label="Ideas" active={activeTab === 'ideas'} onClick={() => setActiveTab('ideas')} />
            <NavItem icon={<SettingsIcon />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </nav>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4 md:p-8 mt-2">
        {/* Date Selector */}
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-2xl mb-6 shadow-sm">
          <button onClick={() => changeDate(-1)} className="p-2 text-slate-400 hover:text-emerald-400 transition-colors">
            <ChevronLeft size={20} />
          </button>
          
          <span className="font-semibold text-slate-200 tracking-wide">
            {selectedDate === todayStr ? 'Today' : formatDisplayDate(selectedDate)}
          </span>
          
          <div className="flex items-center gap-1">
            <div className="relative p-2 flex items-center justify-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if(e.target.value) setSelectedDate(e.target.value);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Calendar size={20} className="text-slate-400 hover:text-emerald-400 transition-colors pointer-events-none" />
            </div>
            <button 
              onClick={() => changeDate(1)} 
              disabled={selectedDate === todayStr}
              className="p-2 text-slate-400 hover:text-emerald-400 transition-colors disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <DashboardTab 
            data={data}
            setData={setData}
            todayMeals={currentMeals}
            todayExercises={currentExercises}
            todayCalories={currentCalories} 
            todayProtein={currentProtein}
            todayStr={selectedDate}
            todaySteps={currentSteps}
            onDeleteMeal={deleteMeal}
            onDeleteExercise={deleteExercise}
          />
        )}

        {activeTab === 'coach' && <CoachTab />}
        {activeTab === 'insights' && <InsightsTab data={data} />}
        {activeTab === 'ideas' && <IdeasTab />}
        {activeTab === 'settings' && <SettingsTab data={data} setData={setData} />}

      </main>
    </div>
  );
}

// --- Navigation Item Component ---
function NavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-2 px-3 min-w-[70px] rounded-xl transition-all flex-shrink-0 ${
        active ? 'text-emerald-400 bg-slate-800/80' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <div className="w-5 h-5 flex justify-center items-center">{icon}</div>
      <span className="text-[10px] md:text-xs uppercase font-bold tracking-wider">{label}</span>
    </button>
  );
}

// ==========================================
// DASHBOARD TAB (Unified View)
// ==========================================
function DashboardTab({ data, setData, todayMeals, todayExercises, todayCalories, todayProtein, todayStr, todaySteps, onDeleteMeal, onDeleteExercise }) {
  const [formData, setFormData] = useState({ steps: '', weight: '', bodyFat: '', muscleMass: '' });

  const todayMetric = useMemo(() => data.metrics.find(m => m.date === todayStr), [data.metrics, todayStr]);

  useEffect(() => {
    if (todayMetric) {
      setFormData({
        steps: todayMetric.steps || '',
        weight: todayMetric.weight || '',
        bodyFat: todayMetric.bodyFat || '',
        muscleMass: todayMetric.muscleMass || ''
      });
    } else {
      setFormData({ steps: '', weight: '', bodyFat: '', muscleMass: '' });
    }
  }, [todayMetric, todayStr]);

  const handleSaveMetrics = (e) => {
    e.preventDefault();
    const newMetric = {
      id: todayMetric ? todayMetric.id : Date.now().toString(),
      date: todayStr,
      steps: formData.steps ? Number(formData.steps) : 0,
      weight: formData.weight ? Number(formData.weight) : null,
      bodyFat: formData.bodyFat ? Number(formData.bodyFat) : null,
      muscleMass: formData.muscleMass ? Number(formData.muscleMass) : null,
      timestamp: Date.now()
    };

    setData(prev => {
      const filtered = prev.metrics.filter(m => m.date !== todayStr);
      return { ...prev, metrics: [...filtered, newMetric] };
    });
  };

  const chartData = useMemo(() => {
    return [...data.metrics].sort((a, b) => a.date.localeCompare(b.date)).map(m => {
      const parts = m.date.split('-');
      return {
        ...m, displayDate: parts.length === 3 ? `${parts[2]}-${parts[1]}` : m.date
      };
    });
  }, [data.metrics]);

  const baseBMR = 1750;
  const activeBurn = todaySteps * 0.04;
  const estimatedTDEE = baseBMR + activeBurn;
  const netBalance = todayCalories - estimatedTDEE;
  const isDeficit = netBalance < 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Net Balance Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 mb-1">Net Calorie Balance</h2>
          <p className="text-sm text-slate-400">
            TDEE Estimate: {baseBMR} BMR + {Math.round(activeBurn)} active ({todaySteps} steps) = <span className="font-semibold text-slate-300">{Math.round(estimatedTDEE)} kcal</span>
          </p>
        </div>
        <div className="text-left md:text-right">
          <span className={`text-3xl font-black ${isDeficit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isDeficit ? '-' : '+'}{Math.abs(Math.round(netBalance))} kcal
          </span>
          <p className={`text-sm font-bold uppercase tracking-wider mt-1 ${isDeficit ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isDeficit ? 'Deficit' : 'Surplus / Overload'}
          </p>
        </div>
      </div>

      {/* Top Macros Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Flame size={64} /></div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Calories</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100">{todayCalories}</span>
            <span className="text-sm text-slate-500">/ {data.settings.calorieTarget}</span>
          </div>
          <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${todayCalories > data.settings.calorieTarget ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min((todayCalories / data.settings.calorieTarget) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs mt-2 text-slate-400">
            {data.settings.calorieTarget - todayCalories > 0 
              ? `${data.settings.calorieTarget - todayCalories} kcal remaining` 
              : <span className="text-rose-400">{(todayCalories - data.settings.calorieTarget)} kcal over limit</span>}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Dumbbell size={64} /></div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Protein</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100">{todayProtein}g</span>
            <span className="text-sm text-slate-500">/ {data.settings.proteinTarget}g</span>
          </div>
          <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-cyan-500 transition-all duration-1000"
              style={{ width: `${Math.min((todayProtein / data.settings.proteinTarget) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs mt-2 text-slate-400">
            {data.settings.proteinTarget - todayProtein > 0 
              ? `${data.settings.proteinTarget - todayProtein}g to target` 
              : <span className="text-cyan-400">Target reached!</span>}
          </p>
        </div>
      </div>

      {/* Daily Metrics Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-cyan-400 w-5 h-5" />
          <h2 className="text-lg font-semibold text-slate-100">Daily Body & Activity Stats</h2>
        </div>
        
        <form onSubmit={handleSaveMetrics} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Steps (Target: {data.settings.stepsTarget})</label>
            <input 
              type="number" 
              value={formData.steps} onChange={e => setFormData({...formData, steps: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Weight (kg)</label>
            <input 
              type="number" step="0.1"
              value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Body Fat (%)</label>
            <input 
              type="number" step="0.1"
              value={formData.bodyFat} onChange={e => setFormData({...formData, bodyFat: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Muscle Mass (kg)</label>
            <input 
              type="number" step="0.1"
              value={formData.muscleMass} onChange={e => setFormData({...formData, muscleMass: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg p-2 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div className="col-span-2 mt-2">
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2">
              Save Metrics
            </button>
          </div>
        </form>
      </div>

      {/* Food Log Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="text-emerald-400 w-5 h-5" />
          <h2 className="text-lg font-semibold text-slate-100">Food Log</h2>
        </div>
        <FoodLogger setData={setData} todayStr={todayStr} />
        
        <div className="mt-4 space-y-3">
          {todayMeals.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No meals logged today.</p>
          ) : (
            todayMeals.map(meal => (
              <div key={meal.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div>
                  <p className="font-medium text-slate-200 text-sm">{meal.name}</p>
                  <p className="text-xs text-slate-400 flex gap-3 mt-1">
                    <span className="flex items-center gap-1"><Flame size={10} className="text-orange-400"/> {meal.calories} kcal</span>
                    <span className="flex items-center gap-1"><Dumbbell size={10} className="text-cyan-400"/> {meal.protein}g protein</span>
                  </p>
                </div>
                <button onClick={() => onDeleteMeal(meal.id)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Exercise Log Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-purple-400 w-5 h-5" />
          <h2 className="text-lg font-semibold text-slate-100">Exercise Log</h2>
        </div>
        <ExerciseLogger setData={setData} todayStr={todayStr} />

        <div className="mt-4 space-y-3">
          {todayExercises.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No exercises logged today.</p>
          ) : (
            todayExercises.map(ex => (
              <div key={ex.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="font-medium text-slate-200 text-sm">{ex.text}</p>
                <button onClick={() => onDeleteExercise(ex.id)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trend Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 gap-6 pt-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Steps Trend</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="displayDate" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={40}/>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="steps" stroke="#38bdf8" strokeWidth={3} dot={{r:4, fill:"#0f172a", strokeWidth:2}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Body Composition (kg / %)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="displayDate" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={30} domain={['auto', 'auto']}/>
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={30} domain={['auto', 'auto']}/>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                  <Line yAxisId="left" type="monotone" dataKey="weight" name="Weight" stroke="#f43f5e" strokeWidth={2} dot={{r:3}} />
                  <Line yAxisId="left" type="monotone" dataKey="muscleMass" name="Muscle" stroke="#10b981" strokeWidth={2} dot={{r:3}} />
                  <Line yAxisId="right" type="monotone" dataKey="bodyFat" name="BF %" stroke="#f59e0b" strokeWidth={2} dot={{r:3}} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// FOOD LOGGER COMPONENT
// ==========================================
function FoodLogger({ setData, todayStr }) {
  const [mealInput, setMealInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isLogging, setIsLogging] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    const inputEl = document.getElementById('meal-image-input');
    if (inputEl) inputEl.value = '';
  };

  const handleLog = (e) => {
    e.preventDefault();
    if (!mealInput.trim() && !imagePreview) return;
    setIsLogging(true);

    setTimeout(() => {
      const newMeal = {
        id: Date.now().toString(),
        date: todayStr,
        name: mealInput || 'Captured Meal',
        calories: 450,
        protein: 30,
        createdAt: Date.now()
      };

      setData(prev => ({ ...prev, meals: [newMeal, ...prev.meals] }));
      setMealInput('');
      clearImage();
      setIsLogging(false);
    }, 600);
  };

  return (
    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
      <form onSubmit={handleLog} className="flex flex-col gap-3">
        {imagePreview && (
          <div className="relative self-start">
            <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-lg border border-slate-700 object-cover" />
            <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 bg-rose-500 rounded-full p-1 text-white hover:bg-rose-600"><X size={12} /></button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="cursor-pointer p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-emerald-400 shrink-0">
            <ImagePlus size={20} />
            <input id="meal-image-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={isLogging} />
          </label>
          <div className="relative flex-1">
            <input 
              type="text" value={mealInput} onChange={e => setMealInput(e.target.value)}
              placeholder={imagePreview ? "Add details (optional)..." : "What did you eat?"}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-emerald-500"
              disabled={isLogging}
            />
            <button type="submit" disabled={isLogging || (!mealInput.trim() && !imagePreview)} className="absolute right-2 top-2 bottom-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg p-2 disabled:opacity-50">
              {isLogging ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// EXERCISE LOGGER COMPONENT
// ==========================================
function ExerciseLogger({ setData, todayStr }) {
  const [input, setInput] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const handleLog = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLogging(true);
    setTimeout(() => {
      const newEx = {
        id: Date.now().toString(),
        date: todayStr,
        text: input,
        createdAt: Date.now()
      };
      setData(prev => ({ ...prev, exercises: [newEx, ...prev.exercises] }));
      setInput('');
      setIsLogging(false);
    }, 400);
  };

  return (
    <form onSubmit={handleLog} className="relative w-full">
      <input 
        type="text" value={input} onChange={e => setInput(e.target.value)}
        placeholder="e.g. 3 sets chest press, 2 sets leg ext..."
        className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-purple-500"
        disabled={isLogging}
      />
      <button type="submit" disabled={isLogging || !input.trim()} className="absolute right-2 top-2 bottom-2 bg-purple-500 hover:bg-purple-600 text-slate-950 rounded-lg p-2 disabled:opacity-50">
        {isLogging ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
      </button>
    </form>
  );
}

// ==========================================
// COACH TAB (Ask Gemini)
// ==========================================
function CoachTab() {
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hey bro! I'm your AI fitness coach. Need tips on your push workout, form check, or nutrition advice for the day?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    const newMsgs = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const apiKey = ""; // Runtime injection
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: newMsgs.map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.text }]
          })),
          systemInstruction: {
            parts: [{ text: "You are an expert fitness coach and body recomposition specialist. Speak in an encouraging, knowledgeable, bro-science yet evidence-based tone. Give direct, highly specific and actionable answers (e.g., if asked about fast food like McDonald's, recommend specific high-protein lower calorie options like grilled chicken burgers or nuggets, and give exact macros)." }]
          }
        })
      });

      const result = await response.json();
      const reply = result.candidates?.[0]?.content?.parts?.[0]?.text || "Solid effort bro! Make sure you hit your protein targets and keep steps high.";
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "My connection dropped for a second bro, but remember: keep your protein high and stay in your calorie deficit!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[70vh] shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <MessageSquare className="text-blue-400 w-5 h-5" />
        <h2 className="text-lg font-semibold text-slate-100">Coach Gemini</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
        {messages.map((msg, i) => (
          <div key={i} className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'model' ? 'bg-slate-800 text-slate-200 self-start rounded-tl-none' : 'bg-blue-600 text-white self-end rounded-tr-none'}`}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="bg-slate-800 text-slate-400 self-start p-3 rounded-2xl rounded-tl-none flex gap-2 items-center text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Coach is cooking up an answer...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-800 flex gap-2">
        <input 
          type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Ask a question (e.g., McDonald's options)..."
          className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 rounded-xl py-2 px-4 focus:outline-none focus:border-blue-500 text-sm"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-3 disabled:opacity-50 transition-colors">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

// ==========================================
// INSIGHTS TAB
// ==========================================
function InsightsTab() {
  const [insightText, setInsightText] = useState('');
  const [loading, setLoading] = useState(false);

  const generateInsight = () => {
    setLoading(true);
    setTimeout(() => {
      setInsightText("Your rolling 7-day deficit is firmly intact. You've averaged 14,800 steps this week, keeping fat oxidation high. Weight is ticking down cleanly. Recommendation: Keep protein at 135g+ to protect muscle mass during your current deficit phase.");
      setLoading(false);
    }, 700);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-center mb-4"><Sparkles className="text-yellow-400 w-10 h-10" /></div>
      <h2 className="text-xl font-bold text-slate-100">AI Progress Insights</h2>
      <p className="text-sm text-slate-400 max-w-md mx-auto">Analyze your recent logs, meals, and body metrics for a personalized status report.</p>
      
      {!insightText && (
        <button onClick={generateInsight} disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold py-3 px-6 rounded-xl flex items-center gap-2 mx-auto transition-colors">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          Generate Insight
        </button>
      )}

      {insightText && (
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl text-left text-sm text-slate-300 leading-relaxed space-y-3">
          <p>{insightText}</p>
          <div className="pt-4 flex justify-center">
            <button onClick={generateInsight} className="text-xs text-yellow-500 hover:text-yellow-400 underline">Refresh Insight</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SETTINGS TAB
// ==========================================
function SettingsTab({ data, setData }) {
  const [form, setForm] = useState(data.settings);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setData(prev => ({
      ...prev,
      settings: {
        calorieTarget: Number(form.calorieTarget),
        proteinTarget: Number(form.proteinTarget),
        stepsTarget: Number(form.stepsTarget)
      }
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="text-slate-400 w-5 h-5" />
        <h2 className="text-lg font-semibold text-slate-100">Daily Targets</h2>
      </div>
      
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Daily Calorie Target (kcal)</label>
          <input type="number" value={form.calorieTarget} onChange={e => setForm({...form, calorieTarget: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-3 focus:outline-none focus:border-slate-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Daily Protein Target (g)</label>
          <input type="number" value={form.proteinTarget} onChange={e => setForm({...form, proteinTarget: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-3 focus:outline-none focus:border-slate-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Daily Steps Target</label>
          <input type="number" value={form.stepsTarget} onChange={e => setForm({...form, stepsTarget: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-3 focus:outline-none focus:border-slate-500" />
        </div>
        
        <button type="submit" className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2">
          {saved ? "Saved Successfully!" : "Save Targets"}
        </button>
      </form>
    </div>
  );
}

// ==========================================
// IDEAS TAB (Static Curated Content)
// ==========================================
const CURATED_IDEAS = [
  { name: "Salad Atelier Wrap Duo", description: "Use B1F1 to grab 2 wraps. e.g., Tandoori/Lemongrass (Lunch) & Korean BBQ/Roasted (Dinner).", macros: "Per wrap: ~680 kcal | ~48g Protein", tags: ["High Volume", "Lunch/Dinner"] },
  { name: "Go Tarbush Shawarma + Extra Meat", description: "Chicken Shawarma wrap, add an extra 100g side of chicken. Limit the garlic toum.", macros: "Total: ~750 kcal | ~55g Protein", tags: ["KLCC", "Massive Protein"] },
  { name: "CP Steamed Chicken Breast", description: "Grab from 7-Eleven. Italian Herbs or Hot & Spicy. Microwave for 20s.", macros: "Total: ~120 kcal | ~20g Protein", tags: ["Convenience", "Snack"] },
  { name: "Mr. Tuk Tuk Basil Chicken", description: "Thai Basil Minced Chicken Rice with Egg (Skip the fried wings). Pair with grilled Chicken Satay.", macros: "Total: ~700 kcal | ~45g Protein", tags: ["Nu Sentral", "Savory"] },
  { name: "Rokeby Farms Protein Smoothie", description: "Vanilla Wafer or Banana Honey (0 added sugar). Perfect for the 4PM slump or post-workout.", macros: "Total: ~253 kcal | 30g Protein", tags: ["Liquid Fuel", "Sweet Craving"] },
  { name: "Konjac Jelly Pouch (FamilyMart)", description: "Peach flavor (C10 slot). Pure fiber to distend stomach and kill ghrelin spikes.", macros: "Total: 3 kcal | 0g Protein", tags: ["Zero Calorie", "Satiety Hack"] }
];

function IdeasTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-center">
        <h2 className="text-xl font-bold text-slate-100 mb-2">The Playbook</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">High-protein, tested meals around your commute and office. Stick to the script when in doubt.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CURATED_IDEAS.map((idea, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="font-bold text-emerald-400 text-lg mb-1">{idea.name}</h3>
            <p className="text-slate-300 text-sm mb-4 leading-relaxed">{idea.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {idea.tags.map(tag => <span key={tag} className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-md font-medium uppercase">{tag}</span>)}
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/50">
              <p className="text-cyan-400 font-mono text-sm font-semibold">{idea.macros}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
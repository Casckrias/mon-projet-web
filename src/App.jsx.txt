import React, { useState, useEffect } from 'react';
import { 
  Utensils, Sparkles, AlertTriangle, ShieldCheck, Download, 
  Trash2, Plus, Edit2, Check, RefreshCw, ChefHat, Heart, 
  ShoppingCart, DollarSign, Calendar, FileText, Share2, Layers, History
} from 'lucide-react';

// Stockage sécurisé avec repli sur localStorage
const storageSave = async (key, value) => {
  try {
    const dataStr = JSON.stringify(value);
    if (window.storage && typeof window.storage.set === 'function') {
      await window.storage.set(key, dataStr);
    } else {
      localStorage.setItem(`bn_${key}`, dataStr);
    }
    return true;
  } catch (e) {
    console.error("Erreur de sauvegarde:", e);
    return false;
  }
};

const storageGet = async (key) => {
  try {
    let raw = null;
    if (window.storage && typeof window.storage.get === 'function') {
      const res = await window.storage.get(key);
      raw = res ? res.value : null;
    } else {
      raw = localStorage.getItem(`bn_${key}`);
    }
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Erreur de lecture:", e);
    return null;
  }
};

const ProInfosSante = ({ resultData, mode }) => {
  const isPro = mode === 'pro';
  if (!resultData) return null;

  const ALLERGENES_UE = [
    { id: 'gluten', label: 'Gluten', icon: '🌾' },
    { id: 'crustaces', label: 'Crustacés', icon: '🦐' },
    { id: 'oeufs', label: 'Œufs', icon: '🥚' },
    { id: 'poissons', label: 'Poissons', icon: '🐟' },
    { id: 'arachides', label: 'Arachides', icon: '🥜' },
    { id: 'soja', label: 'Soja', icon: '🫘' },
    { id: 'lait', label: 'Lait & Lactose', icon: '🥛' },
    { id: 'coques', label: 'Fruits à coque', icon: '🌰' },
    { id: 'celeri', label: 'Céleri', icon: '🥬' },
    { id: 'moutarde', label: 'Moutarde', icon: '🟡' },
    { id: 'sesame', label: 'Graines de sésame', icon: '⚪' },
    { id: 'sulfites', label: 'Sulfites', icon: '🍷' },
    { id: 'lupin', label: 'Lupin', icon: '🌸' },
    { id: 'mollusques', label: 'Mollusques', icon: '🦪' }
  ];

  const allergens = resultData.allergens || [];
  const macros = resultData.macros || { calories: 0, proteines: 0, glucides: 0, lipides: 0, fibres: 0 };
  const alternatives = resultData.alternatives || [];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-xl border ${
        isPro ? 'bg-slate-900/80 border-amber-500/20 text-slate-100' : 'bg-white border-amber-100 shadow-sm text-slate-800'
      }`}>
        <h3 className={`text-lg font-bold mb-4 flex items-[#ffc107] items-center gap-2 ${isPro ? 'text-amber-400' : 'text-amber-800'}`}>
          <Heart className="w-5 h-5 text-amber-500" /> Profil Nutritionnel (par portion)
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className={`p-3 rounded-lg ${isPro ? 'bg-slate-800/80' : 'bg-amber-50/50'}`}>
            <div className="text-xs text-slate-400 uppercase font-semibold">Calories</div>
            <div className="text-xl font-bold mt-1 text-amber-500">{macros.calories} <span className="text-xs">kcal</span></div>
          </div>
          <div className={`p-3 rounded-lg ${isPro ? 'bg-slate-800/80' : 'bg-amber-50/50'}`}>
            <div className="text-xs text-slate-400 uppercase font-semibold">Protéines</div>
            <div className="text-xl font-bold mt-1">{macros.proteines}g</div>
          </div>
          <div className={`p-3 rounded-lg ${isPro ? 'bg-slate-800/80' : 'bg-amber-50/50'}`}>
            <div className="text-xs text-slate-400 uppercase font-semibold">Glucides</div>
            <div className="text-xl font-bold mt-1">{macros.glucides}g</div>
          </div>
          <div className={`p-3 rounded-lg ${isPro ? 'bg-slate-800/80' : 'bg-amber-50/50'}`}>
            <div className="text-xs text-slate-400 uppercase font-semibold">Lipides</div>
            <div className="text-xl font-bold mt-1">{macros.lipides}g</div>
          </div>
          <div className={`p-3 rounded-lg ${isPro ? 'bg-slate-800/80' : 'bg-amber-50/50'}`}>
            <div className="text-xs text-slate-400 uppercase font-semibold">Fibres</div>
            <div className="text-xl font-bold mt-1">{macros.fibres}g</div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-xl border ${
        isPro ? 'bg-slate-900/80 border-amber-500/20 text-slate-100' : 'bg-white border-amber-100 shadow-sm text-slate-800'
      }`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isPro ? 'text-amber-400' : 'text-amber-800'}`}>
          <AlertTriangle className="w-5 h-5 text-amber-500" /> Matrice des Allergènes (Règlement UE N° 1169/2011)
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ALLERGENES_UE.map(item => {
            const isPresent = allergens.includes(item.id) || allergens.includes(item.label.toLowerCase());
            return (
              <div 
                key={item.id} 
                className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${
                  isPresent 
                    ? isPro 
                      ? 'bg-red-950/40 border-red-500/50 text-red-200' 
                      : 'bg-red-50 border-red-200 text-red-800'
                    : isPro 
                      ? 'bg-slate-800/40 border-slate-700/50 text-slate-500 opacity-60' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{item.label}</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider">
                    {isPresent ? 'Présent' : 'Absent'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {alternatives.length > 0 && (
        <div className={`p-6 rounded-xl border ${
          isPro ? 'bg-slate-900/80 border-amber-500/20 text-slate-100' : 'bg-white border-amber-100 shadow-sm text-slate-800'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isPro ? 'text-amber-400' : 'text-amber-800'}`}>
            <ShieldCheck className="w-5 h-5 text-amber-500" /> Alternatives & Adaptations
          </h3>
          <div className="space-y-3">
            {alternatives.map((alt, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${isPro ? 'bg-slate-800/60 border-slate-700' : 'bg-amber-50/40 border-amber-100'}`}>
                <div className="font-semibold text-amber-500 text-sm">{alt.regime}</div>
                <div className="text-sm mt-1">{alt.modification}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [mode, setMode] = useState('pro');
  const [activeTab, setActiveTab] = useState(0);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const [savedHistory, setSavedHistory] = useState([]);
  
  const [resultData, setResultData] = useState({
    ingredients: [],
    misesEnPlace: [],
    suggestions: [],
    allergens: ['gluten', 'lait'],
    macros: { calories: 650, proteines: 32, glucides: 48, lipides: 28, fibres: 6 },
    alternatives: [
      { regime: 'Sans Gluten', modification: 'Remplacer la farine de blé par de la fécule de maïs ou de la farine de riz.' },
      { regime: 'Sans Lactose', modification: 'Utiliser du beurre clarifié (ghee) ou de l\'huile d\'olive infusée.' }
    ]
  });

  useEffect(() => {
    loadHistoryFromStorage();
  }, []);

  const loadHistoryFromStorage = async () => {
    const history = await storageGet('menu_history');
    if (history && Array.isArray(history)) {
      setSavedHistory(history);
    }
  };

  const handleProcessRawText = () => {
    if (!rawText.trim()) return;
    setLoading(true);

    setTimeout(() => {
      const mockParsed = {
        ingredients: [
          { id: '1', name: 'Filet de Bœuf', category: 'Viandes', quantity: 0.2, unit: 'kg', unitPrice: 38.0 },
          { id: '2', name: 'Beurre Doux', category: 'Crémerie', quantity: 0.05, unit: 'kg', unitPrice: 8.5 },
          { id: '3', name: 'Échalotes', category: 'Légumes', quantity: 0.03, unit: 'kg', unitPrice: 4.2 },
          { id: '4', name: 'Vin Rouge (Bordeaux)', category: 'Cave & Épicerie', quantity: 0.1, unit: 'L', unitPrice: 12.0 }
        ],
        misesEnPlace: [
          { 
            id: 'm1', 
            title: 'Jus Réduit à l\'Échalote', 
            time: '25 min', 
            steps: ['Ciseler finement les échalotes', 'Faire suer au beurre', 'Déglacer au vin rouge et réduire de 2/3'] 
          },
          { 
            id: 'm2', 
            title: 'Marquage et Cuisson du Bœuf', 
            time: '10 min', 
            steps: ['Assaisonner les pavés', 'Saisir à feu vif dans un sautoir', 'Napper au beurre mousseux'] 
          }
        ],
        suggestions: [
          'Accompagner d\'une purée de pommes de terre mousseline à la truffe.',
          'Accord vin : Margaux ou Saint-Julien structuré.'
        ],
        allergens: ['lait', 'sulfites'],
        macros: { calories: 720, proteines: 42, glucides: 12, lipides: 45, fibres: 2 },
        alternatives: [
          { regime: 'Sans Lactose', modification: 'Remplacer le beurre par une huile neutre ou de pépins de raisin.' }
        ]
      };

      setResultData(mockParsed);
      setLoading(false);
      setActiveTab(1);
    }, 1200);
  };

  const saveCurrentToHistory = async () => {
    const newItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('fr-FR'),
      title: rawText.slice(0, 30) || 'Menu / Fiche Technique',
      data: resultData
    };
    const updated = [newItem, ...savedHistory];
    setSavedHistory(updated);
    await storageSave('menu_history', updated);
  };

  const calculateTotalCost = () => {
    return resultData.ingredients.reduce((acc, item) => acc + (item.quantity * item.unitPrice * portionMultiplier), 0);
  };

  const triggerExportPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Fiche Technique - Brigade Numérique</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { color: #8b5cf6; border-bottom: 2px solid #8b5cf6; padding-bottom: 8px; }
            h2 { color: #555; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f5; }
          </style>
        </head>
        <body>
          <h1>Fiche Technique Culinaire</h1>
          <p><strong>Portions :</strong> ${portionMultiplier}</p>
          <p><strong>Coût total estimé :</strong> ${calculateTotalCost().toFixed(2)} €</p>
          
          <h2>Ingrédients & Mises en Place</h2>
          <table>
            <thead>
              <tr><th>Ingrédient</th><th>Quantité</th><th>Prix Unitaire</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${resultData.ingredients.map(ing => `
                <tr>
                  <td>${ing.name}</td>
                  <td>${(ing.quantity * portionMultiplier).toFixed(2)}${ing.unit}</td>
                  <td>${ing.unitPrice.toFixed(2)} €</td>
                  <td>${(ing.quantity * portionMultiplier * ing.unitPrice).toFixed(2)} €</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const isPro = mode === 'pro';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isPro ? 'bg-slate-950 text-slate-100' : 'bg-amber-50/40 text-slate-800'
    }`}>
      {/* Barre Haut / Switch Mode */}
      <header className={`border-b ${isPro ? 'bg-slate-900/90 border-amber-500/20' : 'bg-white/90 border-amber-200'} sticky top-0 z-50 backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isPro ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-amber-600 text-white'}`}>
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`font-bold text-lg leading-none ${isPro ? 'text-amber-400' : 'text-amber-900'}`}>
                Brigade Numérique
              </h1>
              <span className="text-xs text-slate-400">Assistant Culinaire v2</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/40 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setMode('pro')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isPro ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mode Pro
            </button>
            <button
              onClick={() => setMode('home')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isPro ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mode Home
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Onglets */}
      <div className={`border-b ${isPro ? 'bg-slate-900/50 border-amber-500/10' : 'bg-amber-100/30 border-amber-200'}`}>
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto py-2">
          {[
            { label: 'Carte / Import', icon: FileText },
            { label: 'Produits', icon: Utensils },
            { label: 'Mises en Place', icon: Layers },
            { label: 'Suggestions', icon: Sparkles },
            { label: 'Infos & Santé', icon: Heart },
            { label: 'Historique', icon: History }
          ].map((tab, idx) => {
            const Icon = tab.icon;
            const active = activeTab === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? isPro
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-white text-amber-800 shadow-sm border border-amber-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu Principal */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* TAB 0: Import */}
        {activeTab === 0 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className={`p-6 rounded-2xl border ${isPro ? 'bg-slate-900/80 border-amber-500/20' : 'bg-white border-amber-200 shadow-sm'}`}>
              <h2 className={`text-lg font-bold mb-3 ${isPro ? 'text-amber-400' : 'text-amber-900'}`}>
                Importer ou saisir un menu / une recette
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Collez vos textes bruts de recettes, intitulés de menu ou listes d'ingrédients.
              </p>
              
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Ex: Pavé de bœuf poêlé, jus réduit à l'échalote et vin rouge, beurre mousseux..."
                className={`w-full p-4 rounded-xl text-sm border focus:outline-none ${
                  isPro 
                    ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-amber-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-amber-600'
                }`}
              />

              <button
                onClick={handleProcessRawText}
                disabled={loading || !rawText.trim()}
                className={`mt-4 w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  loading || !rawText.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : isPro
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Analyse en cours...' : 'Générer la Fiche Technique'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: Produits / Ingrédients */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-bold ${isPro ? 'text-amber-400' : 'text-amber-900'}`}>
                Ingrédients & Mercuriale
              </h2>
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-400">Portions :</label>
                <input 
                  type="number" 
                  min="1" 
                  value={portionMultiplier} 
                  onChange={(e) => setPortionMultiplier(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`w-16 px-2 py-1 rounded-lg text-center text-xs font-bold border ${
                    isPro ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isPro ? 'bg-slate-900/80 border-amber-500/20' : 'bg-white border-amber-200 shadow-sm'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b ${isPro ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      <th className="p-3">Ingrédient</th>
                      <th className="p-3">Catégorie</th>
                      <th className="p-3">Quantité / portion</th>
                      <th className="p-3">Quantité Totale</th>
                      <th className="p-3">P.U (€)</th>
                      <th className="p-3">Total (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultData.ingredients.map((ing) => (
                      <tr key={ing.id} className={`border-b ${isPro ? 'border-slate-800/50' : 'border-slate-100'}`}>
                        <td className="p-3 font-semibold">{ing.name}</td>
                        <td className="p-3 text-slate-400">{ing.category}</td>
                        <td className="p-3">{ing.quantity} {ing.unit}</td>
                        <td className="p-3 text-amber-500 font-medium">
                          {(ing.quantity * portionMultiplier).toFixed(2)} {ing.unit}
                        </td>
                        <td className="p-3">{ing.unitPrice.toFixed(2)} €</td>
                        <td className="p-3 font-bold">
                          {(ing.quantity * portionMultiplier * ing.unitPrice).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/40 flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Coût Total Matières :</span>
                <span className="text-lg font-bold text-amber-500">{calculateTotalCost().toFixed(2)} €</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Mises en Place */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <h2 className={`text-lg font-bold ${isPro ? 'text-amber-400' : 'text-amber-900'}`}>
              Fiches de Mises en Place & Étapes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resultData.misesEnPlace.map((mep) => (
                <div key={mep.id} className={`p-5 rounded-xl border ${
                  isPro ? 'bg-slate-900/80 border-amber-500/20' : 'bg-white border-amber-200 shadow-sm'
                }`}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-base text-amber-500">{mep.title}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">
                      ⏱ {mep.time}
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
                    {mep.steps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Suggestions */}
        {activeTab === 3 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className={`text-lg font-bold ${isPro ? 'text-amber-400' : 'text-amber-900'}`}>
              Suggestions Gastronomiques & Accords
            </h2>
            <div className={`p-6 rounded-xl border ${isPro ? 'bg-slate-900/80 border-amber-500/20' : 'bg-white border-amber-200 shadow-sm'}`}>
              <ul className="space-y-3">
                {resultData.suggestions.map((sug, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 4: Infos & Santé */}
        {activeTab === 4 && (
          <ProInfosSante resultData={resultData} mode={mode} />
        )}

        {/* TAB 5: Historique & Export */}
        {activeTab === 5 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className={`text-lg font-bold ${isPro ? 'text-amber-400' : 'text-amber-900'}`}>
                Historique & Exportation
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={saveCurrentToHistory}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400"
                >
                  <Plus className="w-4 h-4" /> Sauvegarder l'actuel
                </button>
                <button
                  onClick={triggerExportPDF}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-1.5 border border-amber-500/30 hover:bg-slate-700"
                >
                  <Download className="w-4 h-4" /> Imprimer / PDF
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {savedHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Aucune fiche sauvegardée pour le moment.
                </div>
              ) : (
                savedHistory.map((item) => (
                  <div key={item.id} className={`p-4 rounded-xl border flex justify-between items-center ${
                    isPro ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-100 shadow-sm'
                  }`}>
                    <div>
                      <div className="font-bold text-sm text-amber-500">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.date}</div>
                    </div>
                    <button
                      onClick={() => {
                        setResultData(item.data);
                        setActiveTab(1);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500/50"
                    >
                      Charger
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
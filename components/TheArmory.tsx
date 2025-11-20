
import React, { useState } from 'react';
import { GameState, Item } from '../types';
import { GAME_ITEMS } from '../constants';
import { ShoppingBag, Package, Zap, Heart, Snowflake, Scroll, Coins } from 'lucide-react';

interface Props {
  gameState: GameState;
  onBuyItem: (item: Item) => void;
  onUseItem: (item: Item) => void;
}

const TheArmory: React.FC<Props> = ({ gameState, onBuyItem, onUseItem }) => {
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'SHOP'>('INVENTORY');

  return (
    <div className="h-full flex flex-col animate-fade-in">
       <div className="flex items-center justify-between mb-6">
          <div>
             <h2 className="text-3xl font-bold text-gold font-mono uppercase tracking-widest">The Armory</h2>
             <p className="text-sm text-gray-400 mt-1">Equip yourself for the battles ahead.</p>
          </div>
          <div className="bg-gray-900 border border-gold/30 px-4 py-2 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
             <Coins size={20} className="text-gold" />
             <span className="text-xl font-bold text-white font-mono">{gameState.user.credits}</span>
             <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Credits</span>
          </div>
       </div>

       <div className="flex gap-4 border-b border-gray-700 mb-6">
          <button 
            onClick={() => setActiveTab('INVENTORY')}
            className={`pb-3 px-4 font-mono font-bold text-sm flex items-center gap-2 transition-all ${
                activeTab === 'INVENTORY' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
             <Package size={16} /> INVENTORY ({gameState.user.inventory.length})
          </button>
          <button 
            onClick={() => setActiveTab('SHOP')}
            className={`pb-3 px-4 font-mono font-bold text-sm flex items-center gap-2 transition-all ${
                activeTab === 'SHOP' ? 'text-gold border-b-2 border-gold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
             <ShoppingBag size={16} /> BLACK MARKET
          </button>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
          {activeTab === 'INVENTORY' ? (
             gameState.user.inventory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {gameState.user.inventory.map((item, idx) => (
                      <ItemCard 
                        key={`${item.id}-${idx}`} 
                        item={item} 
                        actionLabel="USE" 
                        onAction={() => onUseItem(item)}
                        owned 
                      />
                   ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-800 rounded-xl">
                   <Package size={48} className="text-gray-700 mb-4" />
                   <p className="text-gray-500 font-mono">Your inventory is empty.</p>
                   <button onClick={() => setActiveTab('SHOP')} className="mt-4 text-gold hover:underline font-bold text-sm">Visit the Shop</button>
                </div>
             )
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {GAME_ITEMS.map((item) => (
                   <ItemCard 
                     key={item.id} 
                     item={item} 
                     actionLabel="BUY" 
                     onAction={() => onBuyItem(item)}
                     canAfford={gameState.user.credits >= item.price}
                   />
                ))}
             </div>
          )}
       </div>
    </div>
  );
};

const ItemCard = ({ item, actionLabel, onAction, canAfford = true, owned = false }: any) => {
  const getIcon = (iconName: string) => {
     switch(iconName) {
        case 'FlaskConical': return <Zap size={24} />;
        case 'Syringe': return <Heart size={24} />;
        case 'Snowflake': return <Snowflake size={24} />;
        case 'Scroll': return <Scroll size={24} />;
        default: return <Package size={24} />;
     }
  };

  const getRarityColor = (rarity: string) => {
     switch(rarity) {
        case 'COMMON': return 'border-gray-600 text-gray-400';
        case 'RARE': return 'border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
        case 'LEGENDARY': return 'border-gold text-gold shadow-[0_0_15px_rgba(250,204,21,0.2)]';
        default: return 'border-gray-600';
     }
  };

  return (
     <div className={`bg-gray-900 border rounded-xl p-5 flex flex-col relative overflow-hidden group hover:bg-gray-800 transition-all ${getRarityColor(item.rarity)}`}>
        <div className="flex justify-between items-start mb-3 relative z-10">
           <div className={`p-3 rounded-lg bg-black/50 border border-opacity-30 ${getRarityColor(item.rarity)}`}>
              {getIcon(item.icon)}
           </div>
           <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{item.rarity}</span>
        </div>
        
        <h3 className="font-bold text-white text-lg font-mono mb-1">{item.name}</h3>
        <p className="text-xs text-gray-400 mb-4 flex-1">{item.description}</p>
        
        <div className="mt-auto">
           {owned ? (
              <button 
                onClick={onAction}
                className="w-full py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors text-xs font-mono uppercase"
              >
                 Use Item
              </button>
           ) : (
              <button 
                 onClick={onAction}
                 disabled={!canAfford}
                 className={`w-full py-2 font-bold rounded transition-colors text-xs font-mono uppercase flex items-center justify-center gap-2 ${
                    canAfford 
                       ? 'bg-gold text-black hover:bg-yellow-400' 
                       : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                 }`}
              >
                 {canAfford ? (
                    <>Buy for {item.price} <Coins size={12} /></>
                 ) : (
                    <>Need {item.price} <Coins size={12} /></>
                 )}
              </button>
           )}
        </div>
     </div>
  );
};

export default TheArmory;

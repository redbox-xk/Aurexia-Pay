import React from 'react';

interface Chain {
  id: number;
  name: string;
  icon?: string;
  active: boolean;
}

interface ChainSelectorProps {
  selectedChain: number;
  onSelectChain: (chainId: number) => void;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({
  selectedChain,
  onSelectChain,
}) => {
  const chains: Chain[] = [
    { id: 1, name: 'Ethereum', active: true },
    { id: 56, name: 'BNB Chain', active: true },
    { id: 137, name: 'Polygon', active: true },
    { id: 43114, name: 'Avalanche', active: true },
    { id: 42161, name: 'Arbitrum', active: true },
    { id: 10, name: 'Optimism', active: true },
  ];
  
  return (
    <div className="grid grid-cols-3 gap-3">
      {chains.map((chain) => (
        <button
          key={chain.id}
          onClick={() => onSelectChain(chain.id)}
          className={`p-3 rounded-lg border-2 transition-all ${
            selectedChain === chain.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">{chain.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

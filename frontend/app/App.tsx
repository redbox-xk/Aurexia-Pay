import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { Dashboard } from '@/components/Dashboard';
import { TokenGenerator } from '@/components/TokenGenerator';
import { PaymentInterface } from '@/components/PaymentInterface';
import { BridgeInterface } from '@/components/BridgeInterface';
import { Analytics } from '@/components/Analytics';
import { Toaster } from 'react-hot-toast';

export const App: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <h1 className="text-4xl font-bold text-white mb-2">Aurexia Pay</h1>
          <p className="text-blue-200 mb-8">Next Generation Blockchain Payment Platform</p>
          
          <button
            onClick={() => connect()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.2 3.5L2.7 8.1l8.5 4.6 8.5-4.6-8.5-4.6zM2.7 15.2l8.5 4.6 8.5-4.6-8.5-4.6-8.5 4.6z"/>
            </svg>
            Connect Wallet
          </button>
          
          <div className="mt-6 text-center text-blue-200 text-sm">
            New to Aurexia? <a href="#" className="text-white underline">Learn more</a>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">Aurexia Pay</h1>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {['dashboard', 'tokens', 'payments', 'bridge', 'analytics'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${
                      activeTab === tab
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium capitalize transition duration-150`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button
                onClick={() => disconnect()}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm5-8a5 5 0 0 1-10 0 5 5 0 0 1 10 0z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'tokens' && <TokenGenerator />}
        {activeTab === 'payments' && <PaymentInterface />}
        {activeTab === 'bridge' && <BridgeInterface />}
        {activeTab === 'analytics' && <Analytics />}
      </main>
    </div>
  );
};

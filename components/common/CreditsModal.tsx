import React, { useContext, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { X, CreditCard, ShoppingCart, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import Spinner from './Spinner';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CREDIT_PACKAGES = [
  { credits: 100, price: 5, popular: false },
  { credits: 250, price: 10, popular: true },
  { credits: 700, price: 25, popular: false },
];

const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  const { user, transactions, topUpCredits } = useContext(UserContext);
  const [selectedPackage, setSelectedPackage] = useState<{credits: number, price: number} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !user) return null;

  const handleTopUp = async () => {
    if (selectedPackage) {
        setIsProcessing(true);
        try {
            await topUpCredits(selectedPackage.credits);
            setSelectedPackage(null); // Go back to main view on success
        } catch(error) {
            console.error("Failed to top up credits", error);
        } finally {
            setIsProcessing(false);
        }
    }
  };
  
  const handleClose = () => {
      setSelectedPackage(null);
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl w-full max-w-2xl relative p-8 text-white max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10">
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-3">
            {selectedPackage && (
                <button onClick={() => setSelectedPackage(null)} className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>
            )}
            <h2 className="text-3xl font-bold">
                {selectedPackage ? 'Confirm Purchase' : 'Manage Credits'}
            </h2>
        </div>
        <p className="text-gray-400 mb-8 ml-9">
            {selectedPackage ? `You are purchasing ${selectedPackage.credits} credits for $${selectedPackage.price}.00.` : 'Top up your balance to continue creating with AI.'}
        </p>

        {!selectedPackage ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-purple-400 mb-4">Current Balance</h3>
                    <div className="bg-gray-800/50 p-6 rounded-lg text-center">
                        <p className="text-5xl font-extrabold text-white">{user.credits}</p>
                        <p className="text-gray-400 mt-1">AI Credits</p>
                    </div>

                    <h3 className="text-lg font-semibold text-purple-400 mb-4 mt-8">Top-Up Credits</h3>
                    <div className="space-y-3">
                        {CREDIT_PACKAGES.map(pkg => (
                            <button key={pkg.credits} onClick={() => setSelectedPackage(pkg)} className="w-full flex justify-between items-center p-4 bg-gray-800 hover:bg-gray-700/70 border border-gray-700 rounded-lg transition-all relative">
                                {pkg.popular && <div className="absolute top-0 -right-2 bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full rotate-12">POPULAR</div>}
                                <div>
                                    <p className="font-bold text-white">{pkg.credits} Credits</p>
                                    <p className="text-sm text-gray-400">${pkg.price}.00 USD</p>
                                </div>
                                <ShoppingCart className="text-purple-400"/>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-purple-400 mb-4">Transaction History</h3>
                    <div className="flex-grow bg-gray-800/50 p-4 rounded-lg overflow-y-auto min-h-[200px]">
                        {transactions.length > 0 ? (
                            <ul className="space-y-3">
                                {transactions.map(t => (
                                    <li key={t.id} className="flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-medium text-gray-200">{t.description}</p>
                                            <p className="text-xs text-gray-500">{t.date}</p>
                                        </div>
                                        <div className={`flex items-center gap-1 font-bold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {t.amount > 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                                            {t.amount > 0 ? `+${t.amount}` : t.amount}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 text-sm mt-4">No transactions yet.</p>
                        )}
                    </div>
                </div>
            </div>
        ) : (
             <div className="w-full max-w-sm mx-auto flex flex-col items-center">
                 <h3 className="text-lg font-semibold text-purple-400 mb-4">Select Payment Method</h3>
                 <div className="space-y-3 w-full">
                     <button className="w-full flex items-center justify-center gap-3 border-2 border-purple-500 bg-purple-500/10 hover:bg-purple-500/20 py-3 rounded-lg transition-colors">
                        <CreditCard /> Pay with Card (Stripe)
                     </button>
                      <button className="w-full flex items-center justify-center gap-3 border border-gray-600 hover:bg-gray-800 py-3 rounded-lg transition-colors">
                        <img src="https://www.vectorlogo.zone/logos/paypal/paypal-icon.svg" alt="PayPal" className="w-6 h-6" />
                        Continue with PayPal
                     </button>
                      <button className="w-full flex items-center justify-center gap-3 border border-gray-600 hover:bg-gray-800 py-3 rounded-lg transition-colors">
                        <img src="https://www.vectorlogo.zone/logos/google_pay/google_pay-icon.svg" alt="Google Pay" className="w-6 h-6" />
                        Continue with Google Pay
                     </button>
                 </div>
                 <button onClick={handleTopUp} disabled={isProcessing} className="w-full mt-8 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                    {isProcessing ? <><Spinner size="h-5 w-5" /> Processing...</> : 'Confirm Purchase'}
                 </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default CreditsModal;

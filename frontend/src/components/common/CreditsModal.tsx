import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import { X, CreditCard, Plus, Minus, ExternalLink, Clock } from 'lucide-react';
import { apiEndpoints } from '../../services/api';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CREDIT_PACKAGES = [
  { credits: 50, price: 5000, popular: false, bonus: 0 },
  { credits: 100, price: 9000, popular: true, bonus: 10 },
  { credits: 250, price: 20000, popular: false, bonus: 50 },
  { credits: 500, price: 35000, popular: false, bonus: 150 },
];

const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  const { user, transactions, refreshUserData, refreshTransactions } = useUser();
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      refreshTransactions();
    }
  }, [isOpen]);

  const handleTopUp = async () => {
    if (!user) return;

    try {
      setIsProcessing(true);
      const response = await apiEndpoints.initiatePayment({
        amount: selectedPackage.credits + selectedPackage.bonus,
        payment_method: 'myanmar_pgw'
      });

      // Open Myanmar payment gateway in new window
      const paymentWindow = window.open('', 'payment', 'width=800,height=600');
      if (paymentWindow) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.data.payment_url;

        Object.entries(response.data.form_data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        paymentWindow.document.body.appendChild(form);
        form.submit();

        // Monitor payment completion
        const checkPayment = setInterval(async () => {
          if (paymentWindow.closed) {
            clearInterval(checkPayment);
            setIsProcessing(false);
            // Refresh user data to get updated credits
            await refreshUserData();
            onClose();
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setIsProcessing(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-b border-gray-700">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Credits</h2>
                <p className="text-gray-400">Current balance: <span className="text-yellow-400 font-semibold">{user.credits} credits</span></p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-6">
              <button
                onClick={() => setShowTransactions(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !showTransactions
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Top Up Credits
              </button>
              <button
                onClick={() => setShowTransactions(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  showTransactions
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Transaction History
              </button>
            </div>

            {!showTransactions ? (
              <>
                {/* Credit Packages */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {CREDIT_PACKAGES.map((pkg) => (
                    <motion.button
                      key={pkg.credits}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        selectedPackage.credits === pkg.credits
                          ? 'border-blue-500 bg-blue-600/10'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Popular
                        </div>
                      )}
                      
                      <div className="text-2xl font-bold text-white mb-1">
                        {pkg.credits + pkg.bonus}
                        {pkg.bonus > 0 && (
                          <span className="text-green-400 text-sm ml-1">
                            (+{pkg.bonus} bonus)
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">credits</div>
                      <div className="text-orange-400 font-semibold mt-2">
                        {pkg.price.toLocaleString()} MMK
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Selected Package Summary */}
                <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                  <h3 className="text-white font-semibold mb-2">Order Summary</h3>
                  <div className="flex justify-between items-center text-gray-300 mb-2">
                    <span>{selectedPackage.credits} Credits</span>
                    <span>{selectedPackage.price.toLocaleString()} MMK</span>
                  </div>
                  {selectedPackage.bonus > 0 && (
                    <div className="flex justify-between items-center text-green-400 mb-2">
                      <span>Bonus Credits</span>
                      <span>+{selectedPackage.bonus}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between items-center text-white font-semibold">
                      <span>Total Credits</span>
                      <span>{selectedPackage.credits + selectedPackage.bonus}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Payment Method</h3>
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">MM</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">Myanmar Payment Gateway</div>
                        <div className="text-gray-400 text-sm">UAB Pay, Visa/Mastercard, MMQR</div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <motion.button
                  onClick={handleTopUp}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing Payment...
                    </div>
                  ) : (
                    `Purchase ${selectedPackage.credits + selectedPackage.bonus} Credits - ${selectedPackage.price.toLocaleString()} MMK`
                  )}
                </motion.button>
              </>
            ) : (
              /* Transaction History */
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          transaction.amount > 0
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-red-600/20 text-red-400'
                        }`}>
                          {transaction.amount > 0 ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-white font-medium">{transaction.description}</div>
                          <div className="text-gray-400 text-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {transaction.date}
                          </div>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No transactions yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreditsModal;
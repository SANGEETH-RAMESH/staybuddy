import  { useEffect, useState } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, AlertCircle, XCircle } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import { LOCALHOST_URL } from '../../../constants/constants';


declare class Razorpay {
  constructor(options: RazorpayOptions);
  open(): void;
  on(event: string, callback: (response: RazorpayResponse) => void): void;
}

interface RazorpayOptions {
  key: string; // Razorpay key ID
  amount: number; // Payment amount in subunits (e.g., paise)
  currency: string; // Currency (e.g., 'INR')
  name: string; // Merchant name
  description: string; // Payment description
  image?: string; // Optional logo/image URL
  order_id?: string; // Order ID from Razorpay API
  prefill?: {
    name?: string; // Customer name
    email?: string; // Customer email
    contact?: string; // Customer contact number
  };
  notes?: Record<string, string>; // Optional additional notes
  theme?: {
    color?: string; // Theme color
  };
  handler: (response: RazorpayResponse) => void; // Success callback
  modal?: {
    ondismiss?: () => void; // Callback when payment modal is closed
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}



const WalletTracker = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<{ 
    id: number; 
    type: string;
    description: string; 
    amount: number;
    date: string;
  }[] | null>([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [email,setEmail] = useState('');
  const [name,setName] = useState('');
  const [mobile,setMobile] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 3;

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await apiClient.get(`${LOCALHOST_URL}/user/getWalletDetails`);
        const userData = await apiClient.get(`${LOCALHOST_URL}/user/getUserDetails`);
        const user = userData.data.data;
        const walletInfo = response.data.message;
        console.log("user",user)
        setEmail(user.email)
        setName(user.name)
        setMobile(user.mobile)
        setBalance(response.data.message.balance);
        setTransactions(response.data.message.transactionHistory);
        if (!walletInfo) {
          setBalance(0);
          setTransactions(null);
          return;
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchWalletData();
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const addTransaction = (type: string, value: number): void => {
    const newTransaction = {
      id: Date.now(),
      type,
      description: '',
      amount: value,
      date: new Date().toISOString(),
    };
    
    setTransactions((prev) => [newTransaction, ...(prev || [])]);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };


  const handlePayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
        alert('Failed to load Razorpay SDK. Check your internet connection.');
        return;
    }

    try {
        const response = await apiClient.post('/order/payment', {
            totalAmount: parseFloat(amount) * 100, // Convert to subunits
            currency: 'INR',
            receipt: 'receipt#1',
            notes: {},
        });

        const { order_id } = response.data;

        const options = {
            key: 'rzp_test_s0Bm198VJWlvQ2', // Replace with your Razorpay key_id
            amount: parseFloat(amount) * 100, // Amount in subunits
            currency: 'INR',
            name: 'Acme Corp',
            description: 'Test Transaction',
            order_id,
            prefill: {
                name: name,
                email: email,
                contact: mobile,
            },
            theme: {
                color: '#F37254',
            },
            handler: async (response: RazorpayResponse) => {
                console.log('Payment Success:', response);
                await handleDeposit();
            },
            modal: {
                ondismiss: () => alert('Payment cancelled.'),
            },
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Payment initiation failed:', error);
    }
};
  


  const handleDeposit = async() => {
    const depositAmount = parseFloat(amount);
    const response = await apiClient.post(`${LOCALHOST_URL}/user/deposit`, {amount});
    
    if(response.data.message.message === 'Deposited') {
      setTransactions(response.data.message.userWallet.transactionHistory);
    }
    if (depositAmount > 0) {
      setBalance((prev) => prev + depositAmount);
      setAmount('');
      setError('');
    }
  };

  const handleWithdraw = async() => {
    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount > 0 && withdrawAmount <= balance) {
      const response = await apiClient.post(`${LOCALHOST_URL}/user/withdraw`, {amount});
      console.log(response)
      setBalance((prev) => prev - withdrawAmount);
      addTransaction('withdraw', withdrawAmount);
      setAmount('');
      setError('');
    } else {
      if (withdrawAmount <= 0) {
        setError('Please enter an amount greater than zero.');
      } else if (withdrawAmount > balance) {
        setError(`Insufficient funds. Your current balance is $${balance.toFixed(2)}.`);
      }
    }
  };

  // Pagination calculations
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions ? 
    transactions.slice(indexOfFirstTransaction, indexOfLastTransaction) : 
    [];
  const totalPages = transactions ? Math.ceil(transactions.length / transactionsPerPage) : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-4">
        <div className="flex items-center mb-4">
          <CreditCard className="mr-2" />
          <h2 className="text-xl font-bold">StayBuddy</h2>
        </div>
        
        <div className="text-center mb-4">
          <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
          <div className="text-gray-500">Current Balance</div>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button 
                onClick={() => setError('')}
                className="ml-2"
              >
                <XCircle className="h-5 w-5 text-red-400 hover:text-red-500" />
              </button>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="flex space-x-2 mb-4">
          <button
            onClick={handlePayment}
            className="flex-1 bg-green-500 text-white p-2 rounded flex items-center justify-center hover:bg-green-600 transition-colors"
          >
            <ArrowDownRight className="mr-2" /> Deposit
          </button>
          <button
            onClick={handleWithdraw}
            className="flex-1 bg-red-500 text-white p-2 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <ArrowUpRight className="mr-2" /> Withdraw
          </button>
        </div>
        
        <div>
          <h3 className="font-bold mb-2">Recent Transactions</h3>
          <div className="max-h-48 overflow-y-auto mb-4">
            {!transactions || transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-500 p-4">
                <p className="text-sm">No transactions yet.</p>
                <p className="text-xs">Start by depositing or withdrawing funds!</p>
              </div>
            ) : (
              currentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col p-3 border-b hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                    <span className={`font-bold ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(transaction.date)}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination Controls */}
          {transactions && transactions.length > transactionsPerPage && (
            <div className="flex items-center justify-between border-t pt-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletTracker;
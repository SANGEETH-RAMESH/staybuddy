import { useEffect, useState } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { deposit, getHost, getwalletDetails, payment, withdrew } from '../../../services/hostServices';



declare class Razorpay {
  constructor(options: RazorpayOptions);
  open(): void;
  on(event: string, callback: (response: RazorpayResponse) => void): void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}



const WalletTracker = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');


  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await getwalletDetails();
        const hostData = await getHost();
        const host = hostData.data.message;
        setEmail(host.email)
        setName(host.name)
        setMobile(host.mobile)
        console.log(response.data,'Walletttt')
        setBalance(response.data.message?.balance);
      } catch (error) {
        console.log(error);
      }
    }

    fetchWalletData();
  }, []);


  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // const addTransaction = (type: string, value: number): void => {
  //   const newTransaction = {
  //     id: Date.now(),
  //     type,
  //     description: '',
  //     amount: value,
  //     date: new Date().toISOString(),
  //   };

  //   // setTransactions((prev) => [newTransaction, ...(prev || [])]);
  // };

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
    // Check for empty input
    const numericAmount = parseFloat(amount);

    if (!amount || amount.trim() === '') {
      setError('Please enter an amount to deposit.');
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.log("hey")
      setError("Amount should be greater than 0");
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert('Failed to load Razorpay SDK. Check your internet connection.');
      return;
    }

    try {
      const response = await payment(amount);

      const { order_id,totalPrice,currency } = response.data;

      const options = {
        key: 'rzp_test_s0Bm198VJWlvQ2',
        amount: totalPrice * 100,
        currency:currency,
        name: name,
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



  const handleDeposit = async () => {
    if (!amount || amount.trim() === '') {
      setError('Please enter an amount to deposit.');
      return;
    }

    const depositAmount = parseFloat(amount);
    await deposit(depositAmount)
    if (depositAmount > 0) {
      setBalance((prev) => prev + depositAmount);
      setAmount('');
      setError('');
    }
  };

  const handleWithdraw = async () => {
    // Check for empty input
    const numericAmount = parseFloat(amount);

    if (!amount || amount.trim() === '') {
      setError('Please enter an amount to deposit.');
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.log("hey")
      setError("Amount should be greater than 0");
      return;
    }

    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount > 0 && withdrawAmount <= balance) {
      const response = await withdrew(amount)
      console.log(response)
      setBalance((prev) => prev - withdrawAmount);
      setAmount('');
      setError('');
    } else {
      if (withdrawAmount <= 0) {
        setError('Please enter an amount greater than zero.');
      } else if (withdrawAmount > balance) {
        setError(`Insufficient funds. Your current balance is ₹${balance.toFixed(2)}.`);
      }
    }
  };



  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-4">
        <div className="flex items-center mb-4">
          <CreditCard className="mr-2" />
          <h2 className="text-xl font-bold">StayBuddy</h2>
        </div>

        <div className="text-center mb-4">
          <div className="text-2xl font-bold">₹{balance?.toFixed(2)}</div>
          <div className="text-gray-500">Current Balance</div>
        </div>

        <div className="mb-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-2 border rounded"
          />
          {error && (
            <div className="mt-2 flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div className="ml-2 flex-1">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={handlePayment}
            className="flex-1 bg-green-500 text-white p-2 rounded flex items-center justify-center hover:bg-green-600 transition-colors"
          >
            <ArrowUpRight className="mr-2" /> Deposit
          </button>
          <button
            onClick={handleWithdraw}
            className="flex-1 bg-red-500 text-white p-2 rounded flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <ArrowDownRight className="mr-2" /> Withdraw
          </button>
        </div>

        <div>
          <button
            onClick={() => window.location.href = '/host/wallet/transactions'}
            className="w-full bg-blue-500 text-white p-2 rounded flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            Show Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletTracker;
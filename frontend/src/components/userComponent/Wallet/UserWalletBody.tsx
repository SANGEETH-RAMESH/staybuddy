import { useEffect, useState } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deposit, getUserDetails, getWalletDetails, payment, withdrew } from '../../../services/userServices';



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

  const navigate = useNavigate();



  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await getWalletDetails();
        const userData = await getUserDetails();
        const user = userData.data.data;
        console.log("user", user)
        setEmail(user.email)
        setName(user.name)
        setMobile(user.mobile)
        console.log(response.data,'REsponse')
        if (response.data?.message) {
          setBalance(response.data.message?.balance);
        }
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
      const totalAmount = parseFloat(amount);
      const response = await payment(totalAmount);

      const { order_id,totalPrice,currency } = response.data;

      const options = {
        key: 'rzp_test_s0Bm198VJWlvQ2',
        amount: totalPrice * 100, 
        currency: currency,
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

    const depositAmount = parseFloat(amount);
    await deposit(depositAmount)
    if (depositAmount > 0) {
      setBalance((prev) => prev + depositAmount);
      setAmount('');
      setError('');
    }
  };

  const handleWithdraw = async () => {
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
      const response = await withdrew(withdrawAmount)
      console.log(response)
      setBalance((prev) => prev - withdrawAmount);
      setAmount('');
      setError('');
    } else {
      if (withdrawAmount <= 0) {
        setError('Please enter an amount greater than zero.');
      } else if (withdrawAmount > balance) {
        setError(`Insufficient funds. Your current balance is ₹${balance?.toFixed(2)}.`);
      }
    }
  };

  const handleBack = () => {
    navigate('/profile');
  };



  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-4">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>

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
            onClick={() => window.location.href = '/wallet/transactions'}
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
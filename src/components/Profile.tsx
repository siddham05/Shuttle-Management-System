import React from 'react';
import { User, Mail, Shield, Plus, Minus, IndianRupee, History, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  amount: number;
  payment_method: string;
  payment_id: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export default function Profile() {
  const { user } = useAuthStore();
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pointsToAdd, setPointsToAdd] = React.useState<Record<string, number>>({});
  const [rechargeAmount, setRechargeAmount] = React.useState('');
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [showTransactions, setShowTransactions] = React.useState(false);

  React.useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('email');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handlePointsChange = async (userId: string, points: number) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update({ points: points })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === userId ? { ...u, points } : u
      ));
      
      setPointsToAdd(prev => ({ ...prev, [userId]: 0 }));

      alert('Points updated successfully!');
    } catch (error) {
      console.error('Error updating points:', error);
      alert('Failed to update points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    try {
      setLoading(true);
      const amount = parseInt(rechargeAmount);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      // Create a transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          amount: amount,
          payment_method: 'UPI',
          status: 'pending'
        });

      if (transactionError) throw transactionError;

      // Simulate UPI payment (in production, integrate with actual UPI provider)
      // For demo, we'll auto-complete after 2 seconds
      setTimeout(async () => {
        const { error: updateError } = await supabase
          .from('users')
          .update({ points: (user?.points || 0) + amount })
          .eq('id', user?.id);

        if (updateError) throw updateError;

        // Update user in store
        const { data: userData } = await useAuthStore.getState().initialize();
        
        setRechargeAmount('');
        fetchTransactions();
        alert('Points added successfully!');
        setLoading(false);
      }, 2000);

    } catch (error) {
      console.error('Error recharging points:', error);
      alert('Failed to recharge points. Please try again.');
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
    }
  };

  if (!user) {
    return null;
  }

  const quickAmounts = [100, 200, 500, 1000];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info Section */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Welcome back!</h3>
                <p className="text-blue-100">{user.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-blue-100">Available Balance</p>
              <p className="text-3xl font-bold">{user.points} points</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">{user.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600 capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recharge Section */}
        {user.role !== 'admin' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recharge Points
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Select Amount
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setRechargeAmount(amount.toString())}
                        className={`p-3 text-center rounded-lg border transition-all ${
                          rechargeAmount === amount.toString()
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        {amount} points
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Enter Custom Amount
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter amount"
                      min="1"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">points</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRecharge}
                  disabled={loading || !rechargeAmount}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>{loading ? 'Processing...' : 'Pay via UPI'}</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction History
                </h3>
                <button
                  onClick={() => setShowTransactions(!showTransactions)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  {showTransactions ? 'Hide' : 'Show'}
                </button>
              </div>

              {showTransactions && (
                <div className="space-y-3">
                  {transactions.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No transactions yet</p>
                  ) : (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(transaction.status)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.amount} points
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Section */}
        {user.role === 'admin' && (
          <div className="col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                User Points Management
              </h3>
              <div className="space-y-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{u.email}</p>
                      <p className="text-sm text-gray-500">Current Points: {u.points}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={pointsToAdd[u.id] || ''}
                        onChange={(e) => setPointsToAdd(prev => ({
                          ...prev,
                          [u.id]: parseInt(e.target.value) || 0
                        }))}
                        placeholder="Points"
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handlePointsChange(u.id, (u.points || 0) + (pointsToAdd[u.id] || 0))}
                          disabled={loading || !pointsToAdd[u.id]}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50 transition-colors"
                          title="Add Points"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handlePointsChange(u.id, (u.points || 0) - (pointsToAdd[u.id] || 0))}
                          disabled={loading || !pointsToAdd[u.id] || (u.points || 0) < (pointsToAdd[u.id] || 0)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                          title="Deduct Points"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
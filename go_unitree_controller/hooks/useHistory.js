import { useCallback, useEffect, useState } from 'react';
import { getHistoryByUser } from '../database';
import { useAuth } from '../context/AuthContext';

export default function useHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.username) return;
    setLoading(true);
    setError(null);
    try {
      const records = await getHistoryByUser(user.username);
      setHistory(records);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  useEffect(() => {
    load();
  }, [load]);

  return { history, loading, error, refresh: load };
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFavorites } from '../services/favorites';

function FavoritesFloatingButton() {
  const { currentUser } = useAuth();
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setCount(0);
      return;
    }

    const loadCount = async () => {
      const res = await getFavorites(currentUser.uid);
      if (res.success) {
        const newCount = res.favorites.length;
        if (newCount > count) setPulse(true);
        setCount(newCount);
        setTimeout(() => setPulse(false), 600);
      }
    };

    loadCount();
    const interval = setInterval(loadCount, 5000); // Atualiza a cada 5s
    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser || count === 0) return null;

  return (
    <Link
      to="/favoritos"
      className={`fixed bottom-6 right-6 z-50 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-4 rounded-full shadow-2xl hover:shadow-yellow-500/50 hover:scale-110 transition-all duration-300 group ${pulse ? 'animate-bounce' : ''}`}
      title={`${count} favorito${count > 1 ? 's' : ''}`}
    >
      <div className="relative">
        <Star size={28} className="fill-white" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
          {count > 99 ? '99+' : count}
        </span>
      </div>
    </Link>
  );
}

export default FavoritesFloatingButton;

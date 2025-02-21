import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGrinders, createGrinder, deleteGrinder } from '../utils/supabase-queries';

export default function Grinders() {
  const [grinders, setGrinders] = useState([]);
  const [newGrinder, setNewGrinder] = useState({
    name: '',
    burrSize: '',
    burrType: '',
    idealFor: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrinders();
  }, []);

  const loadGrinders = async () => {
    try {
      const data = await getGrinders();
      setGrinders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const grinder = await createGrinder({
        name: newGrinder.name,
        burr_size: newGrinder.burrSize,
        burr_type: newGrinder.burrType,
        ideal_for: newGrinder.idealFor
      });
      setGrinders([grinder, ...grinders]);
      setNewGrinder({ name: '', burrSize: '', burrType: '', idealFor: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (e, grinderId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmDelete = window.confirm('Are you sure you want to delete this grinder? This will affect any brew logs using this grinder.');
    if (confirmDelete) {
      try {
        await deleteGrinder(grinderId);
        setGrinders(grinders.filter(grinder => grinder.id !== grinderId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Grinders</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name:
            <input
              type="text"
              value={newGrinder.name}
              onChange={(e) => setNewGrinder({ ...newGrinder, name: e.target.value })}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Burr Size:
            <input
              type="text"
              value={newGrinder.burrSize}
              onChange={(e) => setNewGrinder({ ...newGrinder, burrSize: e.target.value })}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Burr Type:
            <input
              type="text"
              value={newGrinder.burrType}
              onChange={(e) => setNewGrinder({ ...newGrinder, burrType: e.target.value })}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Ideal For:
            <input
              type="text"
              value={newGrinder.idealFor}
              onChange={(e) => setNewGrinder({ ...newGrinder, idealFor: e.target.value })}
              required
            />
          </label>
        </div>
        <button type="submit">Add Grinder</button>
      </form>

      <div>
        <h3>Saved Grinders</h3>
        <ul>
          {grinders.map(grinder => (
            <li key={grinder.id} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to={`/grinders/${grinder.id}`} style={{ flex: 1 }}>
                {grinder.name} - {grinder.burr_size}" {grinder.burr_type} - Ideal for: {grinder.ideal_for}
              </Link>
              <button 
                onClick={(e) => handleDelete(e, grinder.id)}
                style={{ 
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  minWidth: '70px'
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
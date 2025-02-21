import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getBrewers, createBrewer, deleteBrewer } from '../utils/supabase-queries';
import { getCurrentUser } from '../utils/supabase';

export default function Brewers() {
  const [brewers, setBrewers] = useState([]);
  const [newBrewer, setNewBrewer] = useState({
    name: '',
    material: '',
    type: 'Pour Over'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrewers();
  }, []);

  const loadBrewers = async () => {
    try {
      const data = await getBrewers();
      setBrewers(data);
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
      const user = await getCurrentUser();
      const brewer = await createBrewer({
        ...newBrewer,
        user_id: user.id
      });
      setBrewers([brewer, ...brewers]);
      setNewBrewer({ name: '', material: '', type: 'Pour Over' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (e, brewerId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmDelete = window.confirm('Are you sure you want to delete this brewer? This will affect any brew logs using this brewer.');
    if (confirmDelete) {
      try {
        await deleteBrewer(brewerId);
        setBrewers(brewers.filter(brewer => brewer.id !== brewerId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Brewers</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name:
            <input
              type="text"
              value={newBrewer.name}
              onChange={(e) => setNewBrewer({ ...newBrewer, name: e.target.value })}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Material:
            <input
              type="text"
              value={newBrewer.material}
              onChange={(e) => setNewBrewer({ ...newBrewer, material: e.target.value })}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Type:
            <select
              value={newBrewer.type}
              onChange={(e) => setNewBrewer({ ...newBrewer, type: e.target.value })}
            >
              <option>Pour Over</option>
              <option>Espresso</option>
              <option>Immersion</option>
            </select>
          </label>
        </div>
        <button type="submit">Add Brewer</button>
      </form>

      <div>
        <h3>Saved Brewers</h3>
        <ul>
          {brewers.map(brewer => (
            <li key={brewer.id} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to={`/brewers/${brewer.id}`} style={{ flex: 1 }}>
                {brewer.name} - {brewer.material} - {brewer.type}
              </Link>
              <button 
                onClick={(e) => handleDelete(e, brewer.id)}
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
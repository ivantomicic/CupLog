import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBrews, createBrew, deleteBrew, getCoffees, getGrinders, getBrewers, updateBrew } from '../utils/supabase-queries';
import { analyzeBrewData } from '../utils/openai';

// Helper function to get the closest roast date to today
const getClosestRoastDate = (roastDates) => {
  if (!roastDates || roastDates.length === 0) return null;
  const today = new Date();
  return roastDates.reduce((closest, current) => {
    const closestDate = new Date(closest.date);
    const currentDate = new Date(current.date);
    const closestDiff = Math.abs(today - closestDate);
    const currentDiff = Math.abs(today - currentDate);
    return currentDiff < closestDiff ? current : closest;
  });
};

export default function Brews() {
  const [brews, setBrews] = useState([]);
  const [coffees, setCoffees] = useState([]);
  const [grinders, setGrinders] = useState([]);
  const [brewers, setBrewers] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newBrew, setNewBrew] = useState({
    coffeeId: '',
    date: new Date().toISOString().slice(0, 16),
    grinderId: '',
    grindSize: '',
    brewerId: '',
    brewTime: '',
    dose: '',
    yield: '',
    notes: '',
    image: null,
    aiSuggestions: null,
    roastDateId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [brewsData, coffeesData, grindersData, brewersData] = await Promise.all([
        getBrews(),
        getCoffees(),
        getGrinders(),
        getBrewers()
      ]);
      
      setBrews(brewsData);
      setCoffees(coffeesData);
      setGrinders(grindersData);
      setBrewers(brewersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBrew(prev => ({ ...prev, image: file }));
    }
  };

  const handleCoffeeChange = (e) => {
    const coffeeId = e.target.value;
    const selectedCoffee = coffees.find(c => c.id === coffeeId);
    let latestRoastDateId = '';
    
    if (selectedCoffee && selectedCoffee.roast_dates && selectedCoffee.roast_dates.length > 0) {
      const closestRoastDate = getClosestRoastDate(selectedCoffee.roast_dates);
      latestRoastDateId = closestRoastDate.id;
    }

    setNewBrew(prev => ({ 
      ...prev, 
      coffeeId,
      roastDateId: latestRoastDateId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsAnalyzing(true);

    try {
      // First create the brew without AI suggestions
      const brew = await createBrew(newBrew);

      // Then get AI analysis
      try {
        // Get the full brew data with relationships for AI analysis
        const brews = await getBrews();
        const brewWithRelations = brews.find(b => b.id === brew.id);
        
        if (!brewWithRelations) {
          throw new Error('Failed to load brew data for analysis');
        }

        const aiSuggestions = await analyzeBrewData(brewWithRelations);
        
        // Update the brew with AI suggestions
        const updatedBrew = await updateBrew(brew.id, {
          ...brew,
          ai_suggestions: aiSuggestions
        });
        
        setBrews(prevBrews => [updatedBrew, ...prevBrews.filter(b => b.id !== brew.id)]);
      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
        setBrews(prevBrews => [brew, ...prevBrews]);
        setError('AI analysis failed: ' + aiError.message);
      }

      setNewBrew({
        coffeeId: '',
        date: new Date().toISOString().slice(0, 16),
        grinderId: '',
        grindSize: '',
        brewerId: '',
        brewTime: '',
        dose: '',
        yield: '',
        notes: '',
        image: null,
        aiSuggestions: null,
        roastDateId: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async (e, brewId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmDelete = window.confirm('Are you sure you want to delete this brew log?');
    if (confirmDelete) {
      try {
        await deleteBrew(brewId);
        setBrews(brews.filter(brew => brew.id !== brewId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const selectedCoffee = coffees.find(c => c.id === newBrew.coffeeId);

  return (
    <div>
      <h2>Log Brew</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Coffee:
            <select
              value={newBrew.coffeeId}
              onChange={handleCoffeeChange}
              required
            >
              <option value="">Select Coffee</option>
              {coffees.map(coffee => {
                const closestRoastDate = coffee.roast_dates?.length > 0 
                  ? getClosestRoastDate(coffee.roast_dates)
                  : null;
                return (
                  <option key={coffee.id} value={coffee.id}>
                    {coffee.name} - {closestRoastDate
                      ? `Latest roast: ${new Date(closestRoastDate.date).toLocaleDateString()}`
                      : 'No roast dates'}
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        {selectedCoffee && selectedCoffee.roast_dates && selectedCoffee.roast_dates.length > 0 && (
          <div>
            <label>
              Roast Date:
              <select
                value={newBrew.roastDateId}
                onChange={(e) => setNewBrew({ ...newBrew, roastDateId: e.target.value })}
                required
              >
                <option value="">Select Roast Date</option>
                {[...selectedCoffee.roast_dates]
                  .sort((a, b) => Math.abs(new Date() - new Date(a.date)) - Math.abs(new Date() - new Date(b.date)))
                  .map(roastDate => {
                    const isClosest = roastDate === getClosestRoastDate(selectedCoffee.roast_dates);
                    return (
                      <option key={roastDate.id} value={roastDate.id}>
                        {new Date(roastDate.date).toLocaleDateString()}
                        {isClosest ? ' (Latest)' : ''}
                      </option>
                    );
                  })}
              </select>
            </label>
          </div>
        )}

        <div>
          <label>
            Date:
            <input
              type="datetime-local"
              value={newBrew.date}
              onChange={(e) => setNewBrew({ ...newBrew, date: e.target.value })}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Grinder:
            <select
              value={newBrew.grinderId}
              onChange={(e) => setNewBrew({ ...newBrew, grinderId: e.target.value })}
              required
            >
              <option value="">Select Grinder</option>
              {grinders.map(grinder => (
                <option key={grinder.id} value={grinder.id}>{grinder.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Grind Size:
            <input
              type="text"
              value={newBrew.grindSize}
              onChange={(e) => setNewBrew({ ...newBrew, grindSize: e.target.value })}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Brewer:
            <select
              value={newBrew.brewerId}
              onChange={(e) => setNewBrew({ ...newBrew, brewerId: e.target.value })}
              required
            >
              <option value="">Select Brewer</option>
              {brewers.map(brewer => (
                <option key={brewer.id} value={brewer.id}>{brewer.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Brew Time (seconds):
            <input
              type="number"
              value={newBrew.brewTime}
              onChange={(e) => setNewBrew({ ...newBrew, brewTime: e.target.value })}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Dose (g):
            <input
              type="number"
              step="0.1"
              value={newBrew.dose}
              onChange={(e) => setNewBrew({ ...newBrew, dose: e.target.value })}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Yield (g):
            <input
              type="number"
              step="0.1"
              value={newBrew.yield}
              onChange={(e) => setNewBrew({ ...newBrew, yield: e.target.value })}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Notes:
            <textarea
              value={newBrew.notes}
              onChange={(e) => setNewBrew({ ...newBrew, notes: e.target.value })}
              rows="4"
            />
          </label>
        </div>
        <div>
          <label>
            Image:
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>
        <button type="submit" disabled={isAnalyzing}>
          {isAnalyzing ? 'Logging Brew and Analyzing...' : 'Log Brew'}
        </button>
      </form>

      {isAnalyzing && (
        <div>
          <h3>AI Analysis in Progress</h3>
          <p>Analyzing your brew data... Please wait.</p>
        </div>
      )}

      <div>
        <h3>Brew History</h3>
        <ul>
          {brews.map(brew => (
            <li key={brew.id} style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to={`/brews/${brew.id}`} style={{ flex: 1 }}>
                {brew.coffee?.name} - {new Date(brew.date).toLocaleString()} - {brew.dose}g in, {brew.yield}g out, {brew.brew_time}s
              </Link>
              {brew.notes && <p>Notes: {brew.notes}</p>}
              {brew.image_url && <img src={brew.image_url} alt="Brew" style={{ maxWidth: '100px', display: 'block' }} />}
              <button 
                onClick={(e) => handleDelete(e, brew.id)}
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
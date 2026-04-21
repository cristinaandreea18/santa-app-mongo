import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import './Letters.css'

function Letters() {
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingLetter, setEditingLetter] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [newLetter, setNewLetter] = useState({ 
    childName: "",
    age: "",
    location: {
      city: "",
      country: "România"
    },
    letterContent: "",
    wishes: [{
      giftName: "",
      category: "jucării",
      priority: "medium",
      estimatedCost: ""
    }],
    behaviorScore: "",
    receivedDate: new Date().toISOString().slice(0, 16),
    status: "received"
  })

  const filters = useMemo(() => [
    { key: 'all', label: 'Toate', icon: '📬' },
    { key: 'received', label: 'Primite', icon: '📥' },
    { key: 'processed', label: 'Procesate', icon: '⚙️' },
    { key: 'assigned', label: 'Alocate', icon: '🎯' },
    { key: 'delivered', label: 'Livrate', icon: '✅' }
  ], [])

  const filteredLetters = useMemo(() => {
    let filtered = letters;
    if (activeFilter !== 'all') {
      filtered = letters.filter(letter => letter.status === activeFilter)
    }
    
    return filtered.sort((a, b) => new Date(a.receivedDate) - new Date(b.receivedDate))
  }, [letters, activeFilter])

  const filtersWithCounts = useMemo(() => {
    return filters.map(filter => ({
      ...filter,
      count: filter.key === 'all' 
        ? letters.length 
        : letters.filter(letter => letter.status === filter.key).length
    }))
  }, [filters, letters])

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/letters')
        const sortedLetters = response.data.sort((a, b) => 
          new Date(a.receivedDate) - new Date(b.receivedDate)
        )
        setLetters(sortedLetters)
        setLoading(false)
      } catch (error) {
        console.error('Eroare la preluarea scrisorilor:', error)
        setLoading(false)
      }
    }
    fetchLetters()
  }, [])

  const handleFilterChange = (filterKey) => {
    setActiveFilter(filterKey)
  }

  const openAddForm = () => {
    setNewLetter({
      childName: "",
      age: "",
      location: {
        city: "",
        country: "România"
      },
      letterContent: "",
      wishes: [{
        giftName: "",
        category: "jucării",
        priority: "medium",
        estimatedCost: ""
      }],
      behaviorScore: "",
      receivedDate: new Date().toISOString().slice(0, 16),
      status: "received"
    })
    setShowAddForm(true)
  }

  const closeAddForm = () => {
    setShowAddForm(false)
  }

  const handleNewLetterChange = (field, value) => {
    setNewLetter(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLocationChange = (field, value) => {
    setNewLetter(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
  }

  const handleWishChange = (index, field, value) => {
    const updatedWishes = [...newLetter.wishes]
    updatedWishes[index] = {
      ...updatedWishes[index],
      [field]: value
    }
    setNewLetter(prev => ({
      ...prev,
      wishes: updatedWishes
    }))
  }

  const addNewWish = () => {
    setNewLetter(prev => ({
      ...prev,
      wishes: [
        ...prev.wishes,
        {
          giftName: "",
          category: "jucării",
          priority: "medium",
          estimatedCost: ""
        }
      ]
    }))
  }

  const removeNewWish = (index) => {
    if (newLetter.wishes.length > 1) {
      const updatedWishes = newLetter.wishes.filter((_, i) => i !== index)
      setNewLetter(prev => ({
        ...prev,
        wishes: updatedWishes
      }))
    }
  }

  const saveNewLetter = async (e) => {
    e.preventDefault()
    try {
      if (!newLetter.childName || !newLetter.age || !newLetter.location.city || !newLetter.letterContent) {
        alert('Te rog completează toate câmpurile obligatorii!')
        return
      }

      const letterToSend = {
        childName: newLetter.childName,
        age: parseInt(newLetter.age),
        location: {
          city: newLetter.location.city,
          country: newLetter.location.country
        },
        letterContent: newLetter.letterContent,
        wishes: newLetter.wishes.map(wish => ({
          giftName: wish.giftName,
          category: wish.category,
          priority: wish.priority,
          estimatedCost: parseInt(wish.estimatedCost) || 0
        })),
        behaviorScore: parseFloat(newLetter.behaviorScore) || 4.0,
        receivedDate: new Date(newLetter.receivedDate),
        status: newLetter.status
      }

      const response = await axios.post('http://localhost:5000/api/letters', letterToSend)
      const updatedLetters = [...letters, response.data].sort((a, b) => 
        new Date(a.receivedDate) - new Date(b.receivedDate)
      )
      setLetters(updatedLetters)
      setShowAddForm(false)
      
      setNewLetter({
        childName: "",
        age: "",
        location: {
          city: "",
          country: "România"
        },
        letterContent: "",
        wishes: [{
          giftName: "",
          category: "jucării",
          priority: "medium",
          estimatedCost: ""
        }],
        behaviorScore: "",
        receivedDate: new Date().toISOString().slice(0, 16),
        status: "received"
      })
      
    } catch (error) {
      console.error('Eroare la adăugarea scrisorii:', error)
      alert('Eroare la adăugarea scrisorii: ' + (error.response?.data?.error || error.message))
    }
  }

  const deleteLetter = async (id) => {
    if (window.confirm('Sigur vrei să ștergi această scrisoare?')) {
      try {
        await axios.delete(`http://localhost:5000/api/letters/${id}`)
        setLetters(letters.filter(letter => letter._id !== id))
      } catch (error) {
        console.error('Eroare la ștergere:', error)
      }
    }
  }

  const startEdit = (letter) => {
    setEditingLetter({...letter})
    setShowForm(true)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    try {
      const updateData = {
        childName: editingLetter.childName,
        age: editingLetter.age,
        location: editingLetter.location,
        letterContent: editingLetter.letterContent,
        wishes: editingLetter.wishes,
        behaviorScore: editingLetter.behaviorScore,
        receivedDate: editingLetter.receivedDate,
        status: editingLetter.status
      }
      
      const response = await axios.put(
        `http://localhost:5000/api/letters/${editingLetter._id}`,
        updateData
      )
      
      const updatedLetters = letters.map(letter => 
        letter._id === editingLetter._id ? response.data : letter
      ).sort((a, b) => new Date(a.receivedDate) - new Date(b.receivedDate))
      
      setLetters(updatedLetters)
      setShowForm(false)
      setEditingLetter(null)
    } catch (error) {
      console.error('Eroare la actualizare:', error)
      if (error.response) {
        console.error('Detalii eroare backend:', error.response.data)
      }
    }
  }

  const updateWish = (index, field, value) => {
    const updatedWishes = [...editingLetter.wishes]
    updatedWishes[index] = {
      ...updatedWishes[index],
      [field]: value
    }
    setEditingLetter({
      ...editingLetter,
      wishes: updatedWishes
    })
  }

  const addWish = () => {
    setEditingLetter({
      ...editingLetter,
      wishes: [
        ...editingLetter.wishes,
        {
          giftName: "",
          category: "jucării",
          priority: "medium",
          estimatedCost: 0
        }
      ]
    })
  }

  const removeWish = (index) => {
    const updatedWishes = editingLetter.wishes.filter((_, i) => i !== index)
    setEditingLetter({
      ...editingLetter,
      wishes: updatedWishes
    })
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="santa-loader">🎅</div>
        <h2>Se încarcă scrisorile...</h2>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="snowflakes">❄️❄️❄️❄️❄️❄️❄️❄️</div>
      
      <header className="header">
        <div className="header-content">
          <h1>🎄 Atelierul Moșului</h1>
          <p>Gestionarea scrisorilor către Moș Crăciun</p>
          <button onClick={openAddForm} className="btn-add">
            ✉️ Adaugă Scrisoare Nouă
          </button>
        </div>
      </header>

      <div className="letters-container">
        <div className="filter-section">
          <h2>📨 Scrisori primite ({filteredLetters.length})</h2>
          
        <div className="category-buttons-container">
          <div className="category-filter-buttons">
            {filtersWithCounts.map(filter => (
              <button
                key={filter.key}
                className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
                onClick={() => handleFilterChange(filter.key)}
              >
                <span className="filter-icon">{filter.icon}</span>
                {filter.label}
                <span className="filter-btn-counter">
                  {filter.key === 'all' 
                    ? letters.length 
                    : letters.filter(letter => letter.status === filter.key).length
                  }
                </span>
              </button>
            ))}
          </div>
        </div>
          
        </div>
     </div>
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal large-modal">
              <h3>📝 Adaugă Scrisoare Nouă</h3>
              <form onSubmit={saveNewLetter}>
                
                <div className="form-section">
                  <h4>👶 Informații Copil</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nume Copil *:</label>
                      <input 
                        type="text" 
                        value={newLetter.childName}
                        onChange={(e) => handleNewLetterChange('childName', e.target.value)}
                        required
                        placeholder="Introdu numele copilului"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Vârsta (1-18) *:</label>
                      <input 
                        type="number" 
                        min="1"
                        max="18"
                        value={newLetter.age}
                        onChange={(e) => handleNewLetterChange('age', e.target.value)}
                        required
                        placeholder="Vârsta copilului"
                      />
                    </div>

                    <div className="form-group">
                      <label>Scor Comportament (1-5):</label>
                      <input 
                        type="number" 
                        step="0.1"
                        min="1"
                        max="5"
                        value={newLetter.behaviorScore}
                        onChange={(e) => handleNewLetterChange('behaviorScore', e.target.value)}
                        placeholder="4.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>📍 Locație</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Oraș *:</label>
                      <input 
                        type="text" 
                        value={newLetter.location.city}
                        onChange={(e) => handleLocationChange('city', e.target.value)}
                        required
                        placeholder="Orașul copilului"
                      />
                    </div>

                    <div className="form-group">
                      <label>Țara *:</label>
                      <input 
                        type="text" 
                        value={newLetter.location.country}
                        onChange={(e) => handleLocationChange('country', e.target.value)}
                        required
                        placeholder="Țara"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>📜 Conținut Scrisoare</h4>
                  <div className="form-group full-width">
                    <label>Mesajul copilului *:</label>
                    <textarea 
                      value={newLetter.letterContent}
                      onChange={(e) => handleNewLetterChange('letterContent', e.target.value)}
                      rows="4"
                      required
                      placeholder="Scrie mesajul copilului către Moș Crăciun..."
                    />
                  </div>
                </div>

                <div className="form-section">
                  <div className="section-header">
                    <h4>🎁 Lista de Dorințe</h4>
                    <button type="button" onClick={addNewWish} className="btn-add-wish">
                      + Adaugă Dorință
                    </button>
                  </div>
                  
                  {newLetter.wishes.map((wish, index) => (
                    <div key={index} className="wish-form">
                      <div className="wish-header">
                        <h5>Dorința #{index + 1}</h5>
                        {newLetter.wishes.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeNewWish(index)}
                            className="btn-remove-wish"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nume Cadou *:</label>
                          <input 
                            type="text" 
                            value={wish.giftName}
                            onChange={(e) => handleWishChange(index, 'giftName', e.target.value)}
                            required
                            placeholder="Numele cadoului"
                          />
                        </div>

                        <div className="form-group">
                          <label>Categorie:</label>
                          <select 
                            value={wish.category}
                            onChange={(e) => handleWishChange(index, 'category', e.target.value)}
                          >
                            <option value="jucării">Jucării</option>
                            <option value="cărți">Cărți</option>
                            <option value="sport">Sport</option>
                            <option value="electronice">Electronice</option>
                            <option value="creativ">Creativ</option>
                            <option value="muzică">Muzică</option>
                            <option value="educațional">Educațional</option>
                            <option value="îmbrăcăminte">Îmbrăcăminte</option>
                            <option value="accesorii">Accesorii</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Prioritate:</label>
                          <select 
                            value={wish.priority}
                            onChange={(e) => handleWishChange(index, 'priority', e.target.value)}
                          >
                            <option value="high">Înaltă</option>
                            <option value="medium">Medie</option>
                            <option value="low">Scăzută</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Cost Estimativ (lei):</label>
                          <input 
                            type="number" 
                            min="0"
                            value={wish.estimatedCost}
                            onChange={(e) => handleWishChange(index, 'estimatedCost', e.target.value)}
                            placeholder="100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-section">
                  <h4>⚙️ Setări</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Status:</label>
                      <select 
                        value={newLetter.status}
                        onChange={(e) => handleNewLetterChange('status', e.target.value)}
                      >
                        <option value="received">Primită</option>
                        <option value="processed">Procesată</option>
                        <option value="assigned">Alocată</option>
                        <option value="delivered">Livrată</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Data primirii:</label>
                      <input 
                        type="datetime-local" 
                        value={newLetter.receivedDate}
                        onChange={(e) => handleNewLetterChange('receivedDate', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save">💾 Salvează Scrisoarea</button>
                  <button 
                    type="button" 
                    onClick={closeAddForm}
                    className="btn-cancel"
                  >
                    ❌ Anulează
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showForm && editingLetter && (
          <div className="modal-overlay">
            <div className="modal large-modal">
              <h3>✏️ Editare Scrisoare - {editingLetter.childName}</h3>
              <form onSubmit={saveEdit}>
                <div className="form-section">
                  <h4>👶 Informații Copil</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nume Copil:</label>
                      <input 
                        type="text" 
                        value={editingLetter.childName}
                        onChange={(e) => setEditingLetter({
                          ...editingLetter, 
                          childName: e.target.value
                        })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Vârsta:</label>
                      <input 
                        type="number" 
                        min="1"
                        max="14"
                        value={editingLetter.age}
                        onChange={(e) => setEditingLetter({
                          ...editingLetter, 
                          age: parseInt(e.target.value) || 0
                        })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Scor Comportament:</label>
                      <input 
                        type="number" 
                        step="0.1"
                        min="1"
                        max="5"
                        value={editingLetter.behaviorScore}
                        onChange={(e) => setEditingLetter({
                          ...editingLetter, 
                          behaviorScore: parseFloat(e.target.value) || 0
                        })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>📍 Locație</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Oraș:</label>
                      <input 
                        type="text" 
                        value={editingLetter.location.city}
                        onChange={(e) => setEditingLetter({
                          ...editingLetter, 
                          location: {
                            ...editingLetter.location,
                            city: e.target.value
                          }
                        })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Țara:</label>
                      <input 
                        type="text" 
                        value={editingLetter.location.country}
                        onChange={(e) => setEditingLetter({
                          ...editingLetter, 
                          location: {
                            ...editingLetter.location,
                            country: e.target.value
                          }
                        })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>📜 Conținut Scrisoare</h4>
                  <div className="form-group full-width">
                    <label>Mesajul copilului:</label>
                    <textarea 
                      value={editingLetter.letterContent}
                      onChange={(e) => setEditingLetter({
                        ...editingLetter, 
                        letterContent: e.target.value
                      })}
                      rows="4"
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <div className="section-header">
                    <h4>🎁 Lista de Dorințe</h4>
                    <button type="button" onClick={addWish} className="btn-add-wish">
                      + Adaugă Dorință
                    </button>
                  </div>
                  
                  {editingLetter.wishes.map((wish, index) => (
                    <div key={index} className="wish-form">
                      <div className="wish-header">
                        <h5>Dorința #{index + 1}</h5>
                        {editingLetter.wishes.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeWish(index)}
                            className="btn-remove-wish"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nume Cadou:</label>
                          <input 
                            type="text" 
                            value={wish.giftName}
                            onChange={(e) => updateWish(index, 'giftName', e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Categorie:</label>
                          <select 
                            value={wish.category}
                            onChange={(e) => updateWish(index, 'category', e.target.value)}
                          >
                            <option value="jucării">Jucării</option>
                            <option value="cărți">Cărți</option>
                            <option value="sport">Sport</option>
                            <option value="electronice">Electronice</option>
                            <option value="creativ">Creativ</option>
                            <option value="muzică">Muzică</option>
                            <option value="educațional">Educațional</option>
                            <option value="îmbrăcăminte">Îmbrăcăminte</option>
                            <option value="accesorii">Accesorii</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Prioritate:</label>
                          <select 
                            value={wish.priority}
                            onChange={(e) => updateWish(index, 'priority', e.target.value)}
                          >
                            <option value="high">Înaltă</option>
                            <option value="medium">Medie</option>
                            <option value="low">Scăzută</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Cost Estimativ (lei):</label>
                          <input 
                            type="number" 
                            min="0"
                            value={wish.estimatedCost}
                            onChange={(e) => updateWish(index, 'estimatedCost', parseInt(e.target.value) || 0)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-section">
                  <h4>⚙️ Setări</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Status:</label>
                      <select 
                        value={editingLetter.status}
                        onChange={(e) => setEditingLetter({
                          ...editingLetter, 
                          status: e.target.value
                        })}
                      >
                        <option value="received">Primită</option>
                        <option value="processed">Procesată</option>
                        <option value="assigned">Alocată</option>
                        <option value="delivered">Livrată</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Data primirii:</label>
                      <input 
                        type="datetime-local" 
                        value={new Date(editingLetter.receivedDate).toISOString().slice(0, 16)}
                        onChange={(e) => setEditingLetter({
                          ...editingLetter, 
                          receivedDate: new Date(e.target.value)
                        })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save">💾 Salvează Modificările</button>
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="btn-cancel"
                  >
                    ❌ Anulează
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="letters-grid">
          {filteredLetters.map(letter => (
            <div key={letter._id} className="letter-card">
              <div className="card-header">
                <div className="card-actions">
                  <button 
                    onClick={() => startEdit(letter)}
                    className="btn-edit"
                    title="Editare"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => deleteLetter(letter._id)}
                    className="btn-delete"
                    title="Ștergere"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="letter-header">
                <h3>🧒 {letter.childName}, {letter.age} ani</h3>
                <span className={`status-badge status-${letter.status}`}>
                  {letter.status === 'received' && '📥 Primita'}
                  {letter.status === 'processed' && '⚙️ Procesata'}
                  {letter.status === 'assigned' && '🎯 Alocata'}
                  {letter.status === 'delivered' && '✅ Livrata'}
                </span>
              </div>
              
              <div className="location">
                <span className="location-icon">🏠</span>
                {letter.location.city}, {letter.location.country}
              </div>
              
              <div className="behavior">
                <span className="star-icon">⭐</span>
                Scor bunătate: {letter.behaviorScore}/5
                {letter.behaviorScore >= 4.5 && <span className="excellent"> Excelent! 🎉</span>}
              </div>

              <div className="wishes-section">
                <h4>🎁 Lista de dorințe:</h4>
                {letter.wishes.map((wish, index) => (
                  <div key={index} className="wish-item">
                    <div className="wish-content">
                      <span className="gift-name">{wish.giftName}</span>
                      <span className="gift-price">{wish.estimatedCost} lei</span>
                    </div>
                    <div className="wish-meta">
                      <span className={`category category-${wish.category}`}>
                        {wish.category}
                      </span>
                      <span className={`priority priority-${wish.priority}`}>
                        {wish.priority === 'high' && '🔥 Important'}
                        {wish.priority === 'medium' && '⚡ Mediu'}
                        {wish.priority === 'low' && '💤 Mică'}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="total-cost">
                  Total: {letter.wishes.reduce((sum, wish) => sum + wish.estimatedCost, 0)} lei
                </div>
              </div>

              <div className="letter-content">
                <h4>📜 Mesajul copilului:</h4>
                <p>"{letter.letterContent}"</p>
              </div>

              <div className="letter-footer">
                <div className="footer-content">
                  <span className="date">
                    🗓️ {new Date(letter.receivedDate).toLocaleDateString('ro-RO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="gift-count">
                    🎁 {letter.wishes.length} cadou{letter.wishes.length !== 1 ? 'ri' : ''}
                  </span>
                </div>
              </div>

              <div className="card-decoration">🎄✨</div>
            </div>
          ))}
        </div>

        {filteredLetters.length === 0 && (
          <div className="no-letters">
            <h3>📭 Nicio scrisoare găsită</h3>
            <p>
              {activeFilter === 'all' 
                ? 'Încă nu există scrisori în sistem.' 
                : `Nu există scrisori cu statusul "${filters.find(f => f.key === activeFilter)?.label}".`
              }
            </p>
            <button onClick={openAddForm} className="btn-add">
              ✉️ Adaugă prima scrisoare
            </button>
          </div>
        )}
      </div>
    
  )
}

export default Letters
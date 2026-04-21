import React, { useState, useEffect} from 'react'
import axios from 'axios'
import './Gifts.css'

function Gifts() {
  const [gifts, setGifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingGift, setEditingGift] = useState(null)
  const [filteredGifts, setFilteredGifts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [letters, setLetters] = useState([])
  const [elves, setElves] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('toate')
  const [newGift, setNewGift] = useState({
    giftName: "",
    category: "jucării",
    letterId: "",
    assignedElf: "",
    workshop: "",
    productionStatus: "pending",
    startDate: new Date().toISOString().slice(0, 16),
    estimatedCompletion: new Date().toISOString().slice(0, 16),
    materials: [""],
    complexity: "medium",
    currentProgress: 0,
    priority: "medium"
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [giftsResponse, lettersResponse, elvesResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/gifts'),
          axios.get('http://localhost:5000/api/letters'),
          axios.get('http://localhost:5000/api/elves')
        ])
        
        setGifts(giftsResponse.data)
        setFilteredGifts(giftsResponse.data)
        setLetters(lettersResponse.data)
        setElves(elvesResponse.data)
        setLoading(false)
      } catch (error) {
        console.error('Eroare la preluarea datelor:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedCategory === 'toate') {
        setFilteredGifts(gifts)
      } else {
        const filtered = gifts.filter(gift => gift.category === selectedCategory)
        setFilteredGifts(filtered)
      }
    }, 0)
    
    return () => clearTimeout(timeoutId)
  }, [selectedCategory, gifts])
  
  if (loading) {
    return (
      <div className="loading">
        <div className="gift-loader">🎁</div>
        <h2>Se încarcă cadourile...</h2>
      </div>
    )
  }

  const getUniqueCategories = () => {
    const categories = [...new Set(gifts.map(gift => gift.category))]
    return categories.sort()
  }

  const openAddForm = () => {
    setNewGift({
      giftName: "",
      category: "jucării",
      letterId: "",
      assignedElf: "",
      workshop: "",
      productionStatus: "pending",
      startDate: new Date().toISOString().slice(0, 16),
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      materials: [""],
      complexity: "medium",
      currentProgress: 0,
      priority: "medium"
    })
    setShowAddForm(true)
  }

  const closeAddForm = () => {
    setShowAddForm(false)
  }

  const handleNewGiftChange = (field, value) => {
    if (field === 'assignedElf') {
      const selectedElf = elves.find(elf => elf._id === value);
      
      setNewGift(prev => ({
        ...prev,
        assignedElf: value,
        workshop: selectedElf ? selectedElf.workshop : prev.workshop
      }));
    } else {
      setNewGift(prev => ({
        ...prev,
        [field]: value
      }));
    }
  }

  const handleMaterialChange = (index, value) => {
    const updatedMaterials = [...newGift.materials]
    updatedMaterials[index] = value
    setNewGift(prev => ({
      ...prev,
      materials: updatedMaterials
    }))
  }

  const addMaterial = () => {
    setNewGift(prev => ({
      ...prev,
      materials: [...prev.materials, ""]
    }))
  }

  const removeMaterial = (index) => {
    if (newGift.materials.length > 1) {
      const updatedMaterials = newGift.materials.filter((_, i) => i !== index)
      setNewGift(prev => ({
        ...prev,
        materials: updatedMaterials
      }))
    }
  }

  const saveNewGift = async (e) => {
    e.preventDefault()
    try {
      const giftToSend = {
        ...newGift,
        currentProgress: parseInt(newGift.currentProgress),
        materials: newGift.materials.filter(material => material.trim() !== "")
      }

      const response = await axios.post('http://localhost:5000/api/gifts', giftToSend)
      setGifts([...gifts, response.data])
      setShowAddForm(false)
      
    } catch (error) {
      console.error('Eroare la adăugarea cadoului:', error)
      alert('Eroare la adăugarea cadoului: ' + (error.response?.data?.error || error.message))
    }
  }

  // Șterge cadou
  const deleteGift = async (id) => {
    if (window.confirm('Sigur vrei să ștergi acest cadou?')) {
      try {
        await axios.delete(`http://localhost:5000/api/gifts/${id}`)
        setGifts(gifts.filter(gift => gift._id !== id))
      } catch (error) {
        console.error('Eroare la ștergere:', error)
      }
    }
  }

  const startEdit = (gift) => {
    setEditingGift({...gift})
    setShowForm(true)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    try {
      const { _id, ...updateData } = editingGift;
      
      const response = await axios.put(
        `http://localhost:5000/api/gifts/${_id}`,
        updateData
      )
      
      setGifts(gifts.map(gift => 
        gift._id === _id ? response.data : gift
      ))
      setShowForm(false)
      setEditingGift(null)
    } catch (error) {
      console.error('Eroare la actualizare:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745'
      case 'in_progress': return '#ffc107'
      case 'quality_check': return '#17a2b8'
      case 'pending': return '#6c757d'
      default: return '#6c757d'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '✅ Finalizat'
      case 'in_progress': return '🔄 În Progres'
      case 'quality_check': return '🔍 Control Calitate'
      case 'pending': return '⏳ În Așteptare'
      default: return status
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545'
      case 'medium': return '#ffc107'
      case 'low': return '#28a745'
      default: return '#6c757d'
    }
  }

  const getChildName = (letterId) => {
    const letter = letters.find(l => l._id === letterId)
    return letter ? letter.childName : 'Necunoscut'
  }

  const getElfName = (elfId) => {
    const elf = elves.find(e => e._id === elfId)
    return elf ? elf.elfName : 'Necunoscut'
  }

  const completedGifts = filteredGifts.filter(gift => gift.productionStatus === 'completed').length
  const inProgressGifts = filteredGifts.filter(gift => gift.productionStatus === 'in_progress').length
  const highPriorityGifts = filteredGifts.filter(gift => gift.priority === 'high').length
  const averageProgress = filteredGifts.length > 0 
    ? (filteredGifts.reduce((sum, gift) => sum + gift.currentProgress, 0) / filteredGifts.length).toFixed(1)
    : '0.0'

  return (
    <div className="gifts-app">
      <div className="gifts-background">🎁✨🎄🎅</div>
      
      <header className="gifts-header">
        <div className="header-content">
          <h1>🎁 Atelierul de Cadouri</h1>
          <p>Urmărirea producției cadourilor pentru Crăciun</p>
          <button onClick={openAddForm} className="btn-add-gift">
            🎁 Adaugă Cadou Nou
          </button>
        </div>
      </header>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <h3>🎁 Adaugă Cadou Nou</h3>
            <form onSubmit={saveNewGift}>
              
              <div className="form-section">
                <h4>📦 Informații Cadou</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nume Cadou *:</label>
                    <input 
                      type="text" 
                      value={newGift.giftName}
                      onChange={(e) => handleNewGiftChange('giftName', e.target.value)}
                      required
                      placeholder="Numele cadoului"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Categorie *:</label>
                    <select 
                      value={newGift.category}
                      onChange={(e) => handleNewGiftChange('category', e.target.value)}
                    >
                      <option value="jucării">Jucării</option>
                      <option value="electronice">Electronice</option>
                      <option value="cărți">Cărți</option>
                      <option value="sport">Sport</option>
                      <option value="creativ">Creativ</option>
                      <option value="muzică">Muzică</option>
                      <option value="educațional">Educațional</option>
                      <option value="îmbrăcăminte">Îmbrăcăminte</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Scrisoare asociată:</label>
                    <select 
                      value={newGift.letterId}
                      onChange={(e) => handleNewGiftChange('letterId', e.target.value)}
                    >
                      <option value="">Selectează scrisoarea</option>
                      {letters.map(letter => (
                        <option key={letter._id} value={letter._id}>
                          {letter.childName} - {letter.wishes[0]?.giftName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Elf responsabil:</label>
                    <select 
                      value={newGift.assignedElf}
                      onChange={(e) => handleNewGiftChange('assignedElf', e.target.value)}
                    >
                      <option value="">Selectează elf</option>
                      {elves.map(elf => (
                        <option key={elf._id} value={elf._id}>
                          {elf.elfName} - {elf.specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Atelier:</label>
                    <input 
                      type="text" 
                      value={newGift.workshop}
                      onChange={(e) => handleNewGiftChange('workshop', e.target.value)}
                      placeholder="Numele atelierului"
                    />
                  </div>

                  <div className="form-group">
                    <label>Status producție:</label>
                    <select 
                      value={newGift.productionStatus}
                      onChange={(e) => handleNewGiftChange('productionStatus', e.target.value)}
                    >
                      <option value="pending">În Așteptare</option>
                      <option value="in_progress">În Progres</option>
                      <option value="quality_check">Control Calitate</option>
                      <option value="completed">Finalizat</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Data începerii:</label>
                    <input 
                      type="datetime-local" 
                      value={newGift.startDate}
                      onChange={(e) => handleNewGiftChange('startDate', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Data estimată finalizare:</label>
                    <input 
                      type="datetime-local" 
                      value={newGift.estimatedCompletion}
                      onChange={(e) => handleNewGiftChange('estimatedCompletion', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Complexitate:</label>
                    <select 
                      value={newGift.complexity}
                      onChange={(e) => handleNewGiftChange('complexity', e.target.value)}
                    >
                      <option value="low">Scăzută</option>
                      <option value="medium">Medie</option>
                      <option value="high">Ridicată</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Prioritate:</label>
                    <select 
                      value={newGift.priority}
                      onChange={(e) => handleNewGiftChange('priority', e.target.value)}
                    >
                      <option value="low">Scăzută</option>
                      <option value="medium">Medie</option>
                      <option value="high">Ridicată</option>
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Progres curent (%):</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={newGift.currentProgress}
                    onChange={(e) => handleNewGiftChange('currentProgress', e.target.value)}
                  />
                  <div className="range-value">{newGift.currentProgress}%</div>
                </div>

                <div className="form-group full-width">
                  <div className="materials-header">
                    <label>Materiale:</label>
                    <button type="button" onClick={addMaterial} className="btn-add-material">
                      + Adaugă Material
                    </button>
                  </div>
                  {newGift.materials.map((material, index) => (
                    <div key={index} className="material-input">
                      <input 
                        type="text" 
                        value={material}
                        onChange={(e) => handleMaterialChange(index, e.target.value)}
                        placeholder={`Material ${index + 1}`}
                      />
                      {newGift.materials.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeMaterial(index)}
                          className="btn-remove-material"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">💾 Salvează Cadou</button>
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

      {showForm && editingGift && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <h3>✏️ Editare Cadou - {editingGift.giftName}</h3>
            <form onSubmit={saveEdit}>
              <div className="form-section">
                <h4>📦 Informații Cadou</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nume Cadou *:</label>
                    <input 
                      type="text" 
                      value={editingGift.giftName}
                      onChange={(e) => setEditingGift({
                        ...editingGift, 
                        giftName: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Categorie *:</label>
                    <select 
                      value={editingGift.category}
                      onChange={(e) => setEditingGift({
                        ...editingGift, 
                        category: e.target.value
                      })}
                    >
                      <option value="jucării">Jucării</option>
                      <option value="electronice">Electronice</option>
                      <option value="cărți">Cărți</option>
                      <option value="sport">Sport</option>
                      <option value="creativ">Creativ</option>
                      <option value="muzică">Muzică</option>
                      <option value="educațional">Educațional</option>
                      <option value="îmbrăcăminte">Îmbrăcăminte</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Scrisoare asociată:</label>
                    <select 
                      value={editingGift.letterId}
                      onChange={(e) => setEditingGift({
                        ...editingGift, 
                        letterId: e.target.value
                      })}
                    >
                      <option value="">Selectează scrisoarea</option>
                      {letters.map(letter => (
                        <option key={letter._id} value={letter._id}>
                          {letter.childName} - {letter.wishes[0]?.giftName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Elf responsabil:</label>
                    <select 
                      value={editingGift.assignedElf}
                      onChange={(e) => {
                      const selectedElfId = e.target.value;
                      const selectedElf = elves.find(elf => elf._id === selectedElfId);
      
                      setEditingGift({
                      ...editingGift, 
                      assignedElf: selectedElfId,
                      workshop: selectedElf ? selectedElf.workshop : ""
                      })
                      }}
                    >
                      <option value="">Selectează elf</option>
                      {elves.map(elf => (
                        <option key={elf._id} value={elf._id}>
                          {elf.elfName} - {elf.specialty} ({elf.workshop})
                        </option> 
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Atelier:</label>
                    <input 
                      type="text" 
                      value={editingGift.workshop}
                      onChange={(e) => setEditingGift({
                        ...editingGift, 
                        workshop: e.target.value
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Status producție:</label>
                    <select 
                      value={editingGift.productionStatus}
                      onChange={(e) => setEditingGift({
                        ...editingGift, 
                        productionStatus: e.target.value
                      })}
                    >
                      <option value="pending">În Așteptare</option>
                      <option value="in_progress">În Progres</option>
                      <option value="quality_check">Control Calitate</option>
                      <option value="completed">Finalizat</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Data începerii:</label>
                    <input 
                      type="datetime-local" 
                      value={new Date(editingGift.startDate).toISOString().slice(0, 16)}
                      onChange={(e) => setEditingGift({
                        ...editingGift, 
                        startDate: new Date(e.target.value)
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Data estimată finalizare:</label>
                    <input 
                      type="datetime-local" 
                      value={new Date(editingGift.estimatedCompletion).toISOString().slice(0, 16)}
                      onChange={(e) => setEditingGift({
                        ...editingGift, 
                        estimatedCompletion: new Date(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Complexitate:</label>
                    <select 
                      value={editingGift.complexity}
                      onChange={(e) => setEditingGift({
                        ...editingGift, 
                        complexity: e.target.value
                      })}
                    >
                      <option value="low">Scăzută</option>
                      <option value="medium">Medie</option>
                      <option value="high">Ridicată</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Prioritate:</label>
                    <select 
                      value={editingGift.priority}
                      onChange={(e) => setEditingGift({
                        ...editingGift, 
                        priority: e.target.value
                      })}
                    >
                      <option value="low">Scăzută</option>
                      <option value="medium">Medie</option>
                      <option value="high">Ridicată</option>
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Progres curent (%):</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={editingGift.currentProgress}
                    onChange={(e) => setEditingGift({
                      ...editingGift, 
                      currentProgress: parseInt(e.target.value)
                    })}
                  />
                  <div className="range-value">{editingGift.currentProgress}%</div>
                </div>

                <div className="form-group full-width">
                  <div className="materials-header">
                    <label>Materiale:</label>
                    <button 
                      type="button" 
                      onClick={() => setEditingGift({
                        ...editingGift,
                        materials: [...editingGift.materials, ""]
                      })} 
                      className="btn-add-material"
                    >
                      + Adaugă Material
                    </button>
                  </div>
                  {editingGift.materials.map((material, index) => (
                    <div key={index} className="material-input">
                      <input 
                        type="text" 
                        value={material}
                        onChange={(e) => {
                          const updatedMaterials = [...editingGift.materials]
                          updatedMaterials[index] = e.target.value
                          setEditingGift({
                            ...editingGift,
                            materials: updatedMaterials
                          })
                        }}
                        placeholder={`Material ${index + 1}`}
                      />
                      {editingGift.materials.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const updatedMaterials = editingGift.materials.filter((_, i) => i !== index)
                            setEditingGift({
                              ...editingGift,
                              materials: updatedMaterials
                            })
                          }}
                          className="btn-remove-material"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
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

      <div className="gifts-container">
        <div className="gifts-header-section">
          <h2>🎁 Producția de Cadouri ({filteredGifts.length})</h2>
 
    <div className="category-buttons-container">
      <div className="category-filter-buttons">
        <button
          className={`filter-btn all ${selectedCategory === 'toate' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('toate')}
        >
          Toate Categoriile
          <span className="filter-btn-counter">
            {gifts.length}
          </span>
        </button>
        
        {getUniqueCategories().map(category => {
          const categoryCount = gifts.filter(gift => gift.category === category).length;
          const categoryIcons = {
            'jucării': '🧸',
            'electronice': '📱',
            'cărți': '📚',
            'sport': '⚽',
            'creativ': '🎨',
            'muzică': '🎵',
            'educațional': '📝',
            'îmbrăcăminte': '👕'
          };
          
          return (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {categoryIcons[category] || '🎁'} {category}
              <span className="filter-btn-counter">
                {categoryCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </div>
        
        <div className="gifts-stats">
          <div className="stat-card">
            <span className="stat-number">{filteredGifts.length}</span>
            <span className="stat-label">Total Cadouri</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{completedGifts}</span>
            <span className="stat-label">Finalizate</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{inProgressGifts}</span>
            <span className="stat-label">În Progres</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{highPriorityGifts}</span>
            <span className="stat-label">Prioritate Ridicată</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{averageProgress}%</span>
            <span className="stat-label">Progres Mediu</span>
          </div>
        </div>
        
        <div className="gifts-grid">
          {filteredGifts.map(gift => (
            <div key={gift._id} className="gift-card">
              <div className="card-header">
                <div className="card-actions">
                  <button 
                    onClick={() => startEdit(gift)}
                    className="btn-edit"
                    title="Editare"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => deleteGift(gift._id)}
                    className="btn-delete"
                    title="Ștergere"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="gift-header">
                <h3>🎁 {gift.giftName}</h3>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(gift.productionStatus) }}
                >
                  {getStatusText(gift.productionStatus)}
                </span>
              </div>

              <div className="gift-category">
                <span className="category-icon">🏷️</span>
                Categorie: <strong>{gift.category}</strong>
              </div>

              <div className="gift-progress">
                <div className="progress-header">
                  <span>Progres: {gift.currentProgress}%</span>
                  <span className="priority-badge" style={{ backgroundColor: getPriorityColor(gift.priority) }}>
                    {gift.priority === 'high' && '🔥 Ridicată'}
                    {gift.priority === 'medium' && '⚡ Medie'}
                    {gift.priority === 'low' && '💤 Scăzută'}
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${gift.currentProgress}%`,
                      backgroundColor: getStatusColor(gift.productionStatus)
                    }}
                  ></div>
                </div>
              </div>

              <div className="gift-details">
                <div className="detail-row">
                  <span className="detail-label">👶 Pentru:</span>
                  <span className="detail-value">{getChildName(gift.letterId)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🧝 Elf responsabil:</span>
                  <span className="detail-value">{getElfName(gift.assignedElf)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🏠 Atelier:</span>
                  <span className="detail-value">{gift.workshop}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">⚙️ Complexitate:</span>
                  <span className="detail-value">
                    {gift.complexity === 'high' && '🔴 Ridicată'}
                    {gift.complexity === 'medium' && '🟡 Medie'}
                    {gift.complexity === 'low' && '🟢 Scăzută'}
                  </span>
                </div>
              </div>

              <div className="gift-materials">
                <h4>📦 Materiale:</h4>
                <div className="materials-list">
                  {gift.materials.map((material, index) => (
                    <span key={index} className="material-tag">
                      {material}
                    </span>
                  ))}
                </div>
              </div>

              <div className="gift-timeline">
                <div className="timeline-item">
                  <span className="timeline-label">📅 Început:</span>
                  <span className="timeline-value">
                    {new Date(gift.startDate).toLocaleDateString('ro-RO')}
                  </span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">🎯 Estimare finalizare:</span>
                  <span className="timeline-value">
                    {new Date(gift.estimatedCompletion).toLocaleDateString('ro-RO')}
                  </span>
                </div>
              </div>

              <div className="card-decoration">✨🎄</div>
            </div>
          ))}
        </div>

        {filteredGifts.length === 0 && (
          <div className="no-gifts">
            <h3>🎁 Nu există cadouri în această categorie</h3>
            <p>Încearcă să selectezi altă categorie sau adaugă un cadou nou!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Gifts
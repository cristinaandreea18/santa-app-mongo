import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Elves.css'

function Elves() {
  const [elves, setElves] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingElf, setEditingElf] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newElf, setNewElf] = useState({
    elfName: "",
    specialty: "jucării",
    skillLevel: "",
    currentWorkload: "",
    maxWorkload: 5,
    workshop: "",
    status: "available",
    yearsOfService: ""
  })

  useEffect(() => {
    const fetchElves = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/elves')
        setElves(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Eroare la preluarea elfilor:', error)
        setLoading(false)
      }
    }
    fetchElves()
  }, [])

  if (loading) {
    return (
      <div className="loading">
        <div className="elf-loader">🧝</div>
        <h2>Se încarcă elfi...</h2>
      </div>
    )
  }

  const openAddForm = () => {
    setNewElf({
      elfName: "",
      specialty: "jucării",
      skillLevel: "",
      currentWorkload: "",
      maxWorkload: 5,
      workshop: "",
      status: "available",
      yearsOfService: ""
    })
    setShowAddForm(true)
  }

  const closeAddForm = () => {
    setShowAddForm(false)
  }

  const handleNewElfChange = (field, value) => {
    setNewElf(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveNewElf = async (e) => {
    e.preventDefault()
    try {
      if (!newElf.elfName || !newElf.specialty || !newElf.workshop) {
        alert('Te rog completează toate câmpurile obligatorii!')
        return
      }

      const elfToSend = {
        elfName: newElf.elfName,
        specialty: newElf.specialty,
        skillLevel: parseFloat(newElf.skillLevel) || 4.0,
        currentWorkload: parseInt(newElf.currentWorkload) || 0,
        maxWorkload: parseInt(newElf.maxWorkload) || 5,
        workshop: newElf.workshop,
        status: newElf.status,
        yearsOfService: parseInt(newElf.yearsOfService) || 0
      }

      const response = await axios.post('http://localhost:5000/api/elves', elfToSend)
      setElves([...elves, response.data])
      setShowAddForm(false)
      
    } catch (error) {
      console.error('Eroare la adăugarea elfului:', error)
      alert('Eroare la adăugarea elfului: ' + (error.response?.data?.error || error.message))
    }
  }

  const deleteElf = async (id) => {
    if (window.confirm('Sigur vrei să ștergi acest elf?')) {
      try {
        await axios.delete(`http://localhost:5000/api/elves/${id}`)
        setElves(elves.filter(elf => elf._id !== id))
      } catch (error) {
        console.error('Eroare la ștergere:', error)
      }
    }
  }

  const startEdit = (elf) => {
    setEditingElf({...elf})
    setShowForm(true)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    try {
      const { _id, ...updateData } = editingElf;
      
      const response = await axios.put(
        `http://localhost:5000/api/elves/${_id}`,
        updateData
      )
      
      setElves(elves.map(elf => 
        elf._id === _id ? response.data : elf
      ))
      setShowForm(false)
      setEditingElf(null)
    } catch (error) {
      console.error('Eroare la actualizare:', error)
    }
  }

  const getWorkloadPercentage = (current, max) => {
    return Math.round((current / max) * 100)
  }

  const getWorkloadClass = (percentage) => {
    if (percentage < 50) return 'low'
    if (percentage < 80) return 'medium'
    return 'high'
  }

  return (
    <div className="elves-app">
      <div className="forest-background">🌲🌿🎄🌳</div>
      
      <header className="elves-header">
        <div className="header-content">
          <h1>🧝 Atelierul Elfilor</h1>
          <p>Gestionarea echipei de elfi din atelierul Moșului</p>
          <button onClick={openAddForm} className="btn-add-elf">
            🧝 Adaugă Elf Nou
          </button>
        </div>
      </header>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <h3>🧝 Adaugă Elf Nou</h3>
            <form onSubmit={saveNewElf}>
              <div className="form-section">
                <h4>📋 Informații Elf</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nume Elf *:</label>
                    <input 
                      type="text" 
                      value={newElf.elfName}
                      onChange={(e) => handleNewElfChange('elfName', e.target.value)}
                      required
                      placeholder="Numele elfului"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Specialitate *:</label>
                    <select 
                      value={newElf.specialty}
                      onChange={(e) => handleNewElfChange('specialty', e.target.value)}
                    >
                      <option value="jucării">Jucării</option>
                      <option value="electronice">Electronice</option>
                      <option value="cărți">Cărți</option>
                      <option value="dulciuri">Dulciuri</option>
                      <option value="construcții">Construcții</option>
                      <option value="sport">Sport</option>
                      <option value="creativ">Creativ</option>
                      <option value="muzică">Muzică</option>
                      <option value="educațional">Educațional</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nivel Skill (1-5):</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="1"
                      max="5"
                      value={newElf.skillLevel}
                      onChange={(e) => handleNewElfChange('skillLevel', e.target.value)}
                      placeholder="4.5"
                    />
                  </div>

                  <div className="form-group">
                    <label>Atelier *:</label>
                    <input 
                      type="text" 
                      value={newElf.workshop}
                      onChange={(e) => handleNewElfChange('workshop', e.target.value)}
                      required
                      placeholder="Numele atelierului"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Sarcină Curentă:</label>
                    <input 
                      type="number" 
                      min="0"
                      value={newElf.currentWorkload}
                      onChange={(e) => handleNewElfChange('currentWorkload', e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Sarcină Maximă:</label>
                    <input 
                      type="number" 
                      min="1"
                      max="10"
                      value={newElf.maxWorkload}
                      onChange={(e) => handleNewElfChange('maxWorkload', e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status:</label>
                    <select 
                      value={newElf.status}
                      onChange={(e) => handleNewElfChange('status', e.target.value)}
                    >
                      <option value="available">Disponibil</option>
                      <option value="busy">Ocupat</option>
                      <option value="vacation">Vacanță</option>
                      <option value="training">Training</option>
                      <option value="maintenance">Întreținere</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Ani de Serviciu:</label>
                    <input 
                      type="number" 
                      min="0"
                      value={newElf.yearsOfService}
                      onChange={(e) => handleNewElfChange('yearsOfService', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">💾 Salvează Elf</button>
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

      {showForm && editingElf && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <h3>✏️ Editare Elf - {editingElf.elfName}</h3>
            <form onSubmit={saveEdit}>
              <div className="form-section">
                <h4>📋 Informații Elf</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nume Elf:</label>
                    <input 
                      type="text" 
                      value={editingElf.elfName}
                      onChange={(e) => setEditingElf({
                        ...editingElf, 
                        elfName: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Specialitate:</label>
                    <select 
                      value={editingElf.specialty}
                      onChange={(e) => setEditingElf({
                        ...editingElf, 
                        specialty: e.target.value
                      })}
                    >
                      <option value="jucării">Jucării</option>
                      <option value="electronice">Electronice</option>
                      <option value="cărți">Cărți</option>
                      <option value="dulciuri">Dulciuri</option>
                      <option value="construcții">Construcții</option>
                      <option value="sport">Sport</option>
                      <option value="creativ">Creativ</option>
                      <option value="muzică">Muzică</option>
                      <option value="educațional">Educațional</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nivel Skill:</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="1"
                      max="5"
                      value={editingElf.skillLevel}
                      onChange={(e) => setEditingElf({
                        ...editingElf, 
                        skillLevel: parseFloat(e.target.value) || 0
                      })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Atelier:</label>
                    <input 
                      type="text" 
                      value={editingElf.workshop}
                      onChange={(e) => setEditingElf({
                        ...editingElf, 
                        workshop: e.target.value
                      })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Sarcină Curentă:</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editingElf.currentWorkload}
                      onChange={(e) => setEditingElf({
                        ...editingElf, 
                        currentWorkload: parseInt(e.target.value) || 0
                      })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Sarcină Maximă:</label>
                    <input 
                      type="number" 
                      min="1"
                      max="10"
                      value={editingElf.maxWorkload}
                      onChange={(e) => setEditingElf({
                        ...editingElf, 
                        maxWorkload: parseInt(e.target.value) || 5
                      })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Status:</label>
                    <select 
                      value={editingElf.status}
                      onChange={(e) => setEditingElf({
                        ...editingElf, 
                        status: e.target.value
                      })}
                    >
                      <option value="available">Disponibil</option>
                      <option value="busy">Ocupat</option>
                      <option value="vacation">Vacanță</option>
                      <option value="training">Training</option>
                      <option value="maintenance">Întreținere</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Ani de Serviciu:</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editingElf.yearsOfService}
                      onChange={(e) => setEditingElf({
                        ...editingElf, 
                        yearsOfService: parseInt(e.target.value) || 0
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

      <div className="elves-container">
        <h2>🧝 Echipe de Elfi ({elves.length})</h2>
        
        <div className="elves-stats">
          <div className="stat-card">
            <span className="stat-number">{elves.length}</span>
            <span className="stat-label">Total Elfi</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{elves.filter(elf => elf.status === 'available').length}</span>
            <span className="stat-label">Disponibili</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{elves.filter(elf => elf.status === 'busy').length}</span>
            <span className="stat-label">Ocupați</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {Math.round((elves.reduce((sum, elf) => sum + elf.skillLevel, 0) / elves.length) * 100) / 100}  
            </span>
            <span className="stat-label">Skill Mediu</span>
          </div>
        </div>
        
        <div className="elves-grid">
          {elves.map(elf => (
            <div key={elf._id} className="elf-card">
              <div className="card-header">
                <div className="card-actions">
                  <button 
                    onClick={() => startEdit(elf)}
                    className="btn-edit"
                    title="Editare"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => deleteElf(elf._id)}
                    className="btn-delete"
                    title="Ștergere"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="elf-header">
                <h3>🧝 {elf.elfName}</h3>
                <span className={`status-badge status-${elf.status}`}>
                  {elf.status === 'available' && '✅ Disponibil'}
                  {elf.status === 'busy' && '🔴 Ocupat'}
                  {elf.status === 'vacation' && '🏖️ Vacanță'}
                  {elf.status === 'training' && '📚 Training'}
                  {elf.status === 'maintenance' && '🔧 Întreținere'}
                </span>
              </div>
              
              <div className="elf-specialty">
                <span className="specialty-icon">🎯</span>
                Specialitate: <strong>{elf.specialty}</strong>
              </div>

              <div className="elf-workshop">
                <span className="workshop-icon">🏠</span>
                Atelier: {elf.workshop}
              </div>

              <div className="elf-skills">
                <div className="skill-level">
                  <span className="skill-icon">⭐</span>
                  Nivel Skill: {elf.skillLevel}/5
                  {elf.skillLevel >= 4.5 && <span className="expert"> Expert! 🎉</span>}
                </div>
                
                <div className="workload">
                  <div className="workload-header">
                    <span>Sarcină: {elf.currentWorkload}/{elf.maxWorkload}</span>
                    <span className={`workload-percentage ${getWorkloadClass(getWorkloadPercentage(elf.currentWorkload, elf.maxWorkload))}`}>
                      {getWorkloadPercentage(elf.currentWorkload, elf.maxWorkload)}%
                    </span>
                  </div>
                  <div className="workload-bar">
                    <div 
                      className={`workload-fill ${getWorkloadClass(getWorkloadPercentage(elf.currentWorkload, elf.maxWorkload))}`}
                      style={{width: `${getWorkloadPercentage(elf.currentWorkload, elf.maxWorkload)}%`}}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="elf-experience">
                <div className="experience-item">
                  <span className="experience-icon">📅</span>
                  Ani de serviciu: <strong>{elf.yearsOfService}</strong>
                </div>
                {elf.yearsOfService >= 10 && (
                  <div className="veteran-badge">🏆 Veteran</div>
                )}
              </div>

              <div className="elf-footer">
                <div className="footer-content">
                  <span className="workload-indicator">
                    {elf.currentWorkload === 0 && '🆓 Disponibil'}
                    {elf.currentWorkload > 0 && elf.currentWorkload < elf.maxWorkload && 
                    `🟡 ${Math.round((elf.currentWorkload / elf.maxWorkload) * 100)}% ocupat`}
                    {elf.currentWorkload >= elf.maxWorkload && '🔴 La capacitate maximă'}
                  </span>
                </div>
              </div>

              <div className="card-decoration">🌿✨</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Elves
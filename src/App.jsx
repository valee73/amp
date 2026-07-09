import { useState, useEffect } from 'react'
import { supabase } from "./utils/supabase";
import './App.css'

function App() {
  const [tareas, setTareas] = useState([])
  const [nuevaTarea, setNuevaTarea] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    obtenerTareas()
  }, [])

  async function obtenerTareas() {
    setCargando(true)
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error('Error al obtener tareas:', error)
    else setTareas(data)
    setCargando(false)
  }

  async function agregarTarea(e) {
    e.preventDefault()
    if (!nuevaTarea.trim()) return

    const { data, error } = await supabase
      .from('tareas')
      .insert([{ titulo: nuevaTarea, completada: false }])
      .select()

    if (error) console.error('Error al agregar tarea:', error)
    else {
      setTareas([data[0], ...tareas])
      setNuevaTarea('')
    }
  }

  async function toggleCompletada(id, estadoActual) {
    const { error } = await supabase
      .from('tareas')
      .update({ completada: !estadoActual })
      .eq('id', id)

    if (error) console.error('Error al actualizar tarea:', error)
    else {
      setTareas(tareas.map(t =>
        t.id === id ? { ...t, completada: !estadoActual } : t
      ))
    }
  }

  async function eliminarTarea(id) {
    const { error } = await supabase
      .from('tareas')
      .delete()
      .eq('id', id)

    if (error) console.error('Error al eliminar tarea:', error)
    else setTareas(tareas.filter(t => t.id !== id))
  }

  return (
    <div className="contenedor">
      <h1>📝 Mis Tareas</h1>

      <form onSubmit={agregarTarea} className="formulario">
        <input
          type="text"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          placeholder="Escribe una nueva tarea..."
        />
        <button type="submit">Agregar</button>
      </form>

      {cargando ? (
        <p>Cargando tareas...</p>
      ) : tareas.length === 0 ? (
        <p className="vacio">No tienes tareas todavía. ¡Agrega una!</p>
      ) : (
        <ul className="lista">
          {tareas.map((tarea) => (
            <li key={tarea.id} className={tarea.completada ? 'completada' : ''}>
              <span onClick={() => toggleCompletada(tarea.id, tarea.completada)}>
                {tarea.completada ? '✅' : '⬜'} {tarea.titulo}
              </span>
              <button onClick={() => eliminarTarea(tarea.id)}>🗑️</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
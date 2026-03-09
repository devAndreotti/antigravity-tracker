import { useEffect } from 'react'
import { useTrackerStore } from './stores/useTrackerStore'
import Layout from './components/Layout'

export default function App() {
  const loadAll = useTrackerStore((s) => s.loadAll)

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return <Layout />
}

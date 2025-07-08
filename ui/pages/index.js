import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const search = async () => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Log Search</h1>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search logs" />
      <button onClick={search}>Search</button>
      <ul>
        {results.map((row, i) => (
          <li key={i}>{row.timestamp}: {row.message}</li>
        ))}
      </ul>
    </div>
  );
}

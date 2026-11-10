import React, { useState } from 'react';
import './App.css';

type Domino = [number, number];

const defaultData: Domino[] = [
  [6, 1],
  [4, 3],
  [5, 1],
  [3, 4],
  [1, 1],
  [3, 4],
  [1, 2],
];

function App() {
  const [sourceData, setSourceData] = useState<Domino[]>(() =>
    defaultData.map(([a, b]) => [a, b]),
  );
  const [sourceInput, setSourceInput] = useState(JSON.stringify(defaultData));
  const [sourceError, setSourceError] = useState('');
  const [dominoes, setDominoes] = useState<Domino[]>(() =>
    defaultData.map(([a, b]) => [a, b]),
  );
  const [inputNumber, setInputNumber] = useState<string>('');

  const doubleCount = dominoes.filter(([a, b]) => a === b).length;

  const compareDominoes = (a: Domino, b: Domino): number => {
    const sumDifference = a[0] + a[1] - b[0] - b[1];
    return sumDifference || a[0] - b[0] || a[1] - b[1];
  };

  const handleSort = (direction: 'asc' | 'desc'): void => {
    const multiplier = direction === 'asc' ? 1 : -1;
    setDominoes([...dominoes].sort((a, b) => multiplier * compareDominoes(a, b)));
  };

  const handleFlip = (): void => {
    setDominoes((current) => current.map(([a, b]) => [b, a]));
  };

  const handleRemoveDup = (): void => {
    const counts = new Map<string, number>();
    const keyFor = ([a, b]: Domino): string =>
      a <= b ? `${a}-${b}` : `${b}-${a}`;

    dominoes.forEach((domino) => {
      const key = keyFor(domino);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    setDominoes(dominoes.filter((domino) => counts.get(keyFor(domino)) === 1));
  };

  const handleReset = (): void => {
    const resetData = defaultData.map(([a, b]) => [a, b] as Domino);
    setSourceData(resetData);
    setSourceInput(JSON.stringify(defaultData));
    setSourceError('');
    setDominoes(resetData.map(([a, b]) => [a, b]));
  };

  const handleSourceSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(sourceInput);
    } catch {
      setSourceError('Invalid JSON. Enter domino cards in the format [[1,2],[3,4]].');
      return;
    }

    if (
      !Array.isArray(parsedData) ||
      !parsedData.every(
        (domino): domino is Domino =>
          Array.isArray(domino) &&
          domino.length === 2 &&
          domino.every((number) => Number.isInteger(number) && number >= 0),
      )
    ) {
      setSourceError('Use an array of domino pairs with two non-negative whole numbers each.');
      return;
    }

    const submittedData = parsedData.map(([a, b]) => [a, b] as Domino);
    setSourceData(submittedData);
    setDominoes(submittedData.map(([a, b]) => [a, b]));
    setSourceError('');
  };

  const handleRemoveBySum = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const targetSum = Number(inputNumber);
    setDominoes((current) => current.filter(([a, b]) => a + b !== targetSum));
    setInputNumber('');
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setInputNumber(event.target.value);
  };

  return (
    <div className="container">
      <h1>Dominoes</h1>
      <p className="subtitle">Manage, sort, and filter your domino cards.</p>

      <div className="info-grid">
        <section className="info-card" aria-labelledby="source-heading">
          <h2 id="source-heading">Source data</h2>
          <form className="source-form" onSubmit={handleSourceSubmit}>
            <textarea
              aria-label="Source domino data in JSON format"
              aria-describedby="source-format"
              aria-invalid={Boolean(sourceError)}
              value={sourceInput}
              onChange={(event) => {
                setSourceInput(event.target.value);
                setSourceError('');
              }}
              rows={3}
              spellCheck={false}
            />
            <p id="source-format" className="source-help">
              JSON format, e.g. [[1,2],[3,4]]
            </p>
            {sourceError && <p className="source-error" role="alert">{sourceError}</p>}
            <button type="submit">Submit source</button>
          </form>
          <p className="source-data">Applied: {JSON.stringify(sourceData)}</p>
        </section>

        <section className="info-card" aria-labelledby="double-heading">
          <h2 id="double-heading">Double numbers</h2>
          <p className="double-count" aria-live="polite">{doubleCount}</p>
        </section>
      </div>

      <div className="section-heading">
        <h2>Domino cards</h2>
        <span className="card-count">{dominoes.length} cards</span>
      </div>

      <div className="dominoes-container" aria-live="polite">
        {dominoes.length > 0 ? (
          dominoes.map((domino, index) => (
            <div
              key={`${domino[0]}-${domino[1]}-${index}`}
              className="domino-card"
              aria-label={`${domino[0]} and ${domino[1]}`}
            >
              <span>{domino[0]}</span>
              <span className="domino-divider" aria-hidden="true" />
              <span>{domino[1]}</span>
            </div>
          ))
        ) : (
          <p className="empty-state">No domino cards to display.</p>
        )}
      </div>

      <div className="actions">
        <button onClick={() => handleSort('asc')}>Sort (ASC)</button>
        <button onClick={() => handleSort('desc')}>Sort (DESC)</button>
        <button onClick={handleFlip}>Flip</button>
        <button onClick={handleRemoveDup}>Remove duplicates</button>
        <button className="secondary-button" onClick={handleReset}>Reset</button>
      </div>

      <form className="input-section" onSubmit={handleRemoveBySum}>
        <input
          type="number"
          min="0"
          step="1"
          required
          placeholder="Enter total number"
          aria-label="Total number to remove"
          value={inputNumber}
          onChange={handleInputChange}
        />
        <button type="submit" disabled={!inputNumber}>Remove by total</button>
      </form>
    </div>
  );
}

export default App;
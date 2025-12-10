import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

type PokeAPIList = {
  results: { name: string; url: string }[];
};

type Card = {
  uid: string; // unique per card instance
  pairId: number; // which pokemon index (1..n)
  img: string;
  flipped: boolean;
  matched: boolean;
};

const randomId = () => Math.random().toString(36).slice(2, 9);

function buildSpriteUrl(id: number) {
  // Using official sprite repo (small, fast)
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

const defaultRows = 3;
const defaultCols = 3;

const MemoryGame: React.FC = () => {
  const [rows, setRows] = useState(defaultRows);
  const [cols, setCols] = useState(defaultCols);
  const [deck, setDeck] = useState<Card[]>([]);
  const [first, setFirst] = useState<Card | null>(null);
  const [second, setSecond] = useState<Card | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pokelist, setPokelist] = useState<PokeAPIList["results"]>([]);

  // Fetch a list of pokemon names (we'll use sprite URLs by index)
  useEffect(() => {
    let canceled = false;
    const fetchList = async () => {
      try {
        const res = await axios.get<PokeAPIList>(
          "https://pokeapi.co/api/v2/pokemon?limit=151"
        );
        if (!canceled) setPokelist(res.data.results);
      } catch (e) {
        console.error("Failed to fetch pokemon list", e);
      }
    };
    fetchList();
    return () => {
      canceled = true;
    };
  }, []);

  // compute total cards and adjust if odd (makes it even by increasing cols)
  const { totalCards, adjustedRows, adjustedCols } = useMemo(() => {
    let r = rows,
      c = cols;
    let total = r * c;
    if (total % 2 !== 0) {
      // make it even by increasing cols by 1
      c = c + 1;
      total = r * c;
    }
    return { totalCards: total, adjustedRows: r, adjustedCols: c };
  }, [rows, cols]);

  // Start/Reset game
  const startGame = async () => {
    // reset UI
    setMessage(null);
    setMoves(0);
    setTime(0);
    setRunning(false);
    if (intervalId) {
      window.clearInterval(intervalId);
      setIntervalId(null);
    }
    setFirst(null);
    setSecond(null);
    setDisabled(false);

    // choose N/2 distinct pokemon indices (random from 1..151)
    const pairs = totalCards / 2;

    // if pokelist is available, sample from it, else fallback to sequential indices
    const available = Math.min(pokelist.length || 151, 151);
    const chosenIndices: number[] = [];
    const used = new Set<number>();
    while (chosenIndices.length < pairs) {
      const idx = Math.floor(Math.random() * available) + 1; // 1..available
      if (!used.has(idx)) {
        used.add(idx);
        chosenIndices.push(idx);
      }
    }

    // build cards (two per pair)
    const cards: Card[] = [];
    chosenIndices.forEach((pid) => {
      const img = buildSpriteUrl(pid);
      const a: Card = {
        uid: randomId(),
        pairId: pid,
        img,
        flipped: false,
        matched: false,
      };
      const b: Card = { ...a, uid: randomId() };
      cards.push(a, b);
    });

    // shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    setDeck(cards);
    // start timer on first flip, not here
  };

  // Flip a card (by uid)
  const flipCard = (uid: string) => {
    if (disabled) return;
    const card = deck.find((c) => c.uid === uid);
    if (!card || card.flipped || card.matched) return;

    // start timer when first flip of game
    if (!running) {
      setRunning(true);
      const id = window.setInterval(() => setTime((t) => t + 1), 1000);
      setIntervalId(id);
    }

    const newDeck = deck.map((c) =>
      c.uid === uid ? { ...c, flipped: true } : c
    );
    setDeck(newDeck);

    if (!first) {
      setFirst({ ...card, flipped: true });
      return;
    }
    if (first && !second) {
      setSecond({ ...card, flipped: true });
      setDisabled(true);
      setMoves((m) => m + 1);

      // compare
      const isMatch = first.pairId === card.pairId;
      setTimeout(() => {
        setDeck((prev) =>
          prev.map((c) => {
            if (c.pairId === card.pairId && isMatch)
              return { ...c, matched: true, flipped: true };
            if (c.uid === uid && !isMatch) return { ...c, flipped: false };
            if (c.uid === first.uid && !isMatch)
              return { ...c, flipped: false };
            return c;
          })
        );
        if (isMatch) {
          setMessage("Nice! Pair found.");
        } else {
          setMessage("Nope, try again.");
        }

        setTimeout(() => setMessage(null), 700);
        setFirst(null);
        setSecond(null);
        setDisabled(false);
      }, 700);
    }
  };

  // Check victory
  useEffect(() => {
    if (deck.length === 0) return;
    const allMatched = deck.every((c) => c.matched);
    if (allMatched) {
      if (intervalId) {
        window.clearInterval(intervalId);
        setIntervalId(null);
      }
      setRunning(false);
      setMessage(`You won! Time: ${formatTime(time)}, Moves: ${moves}`);
      // little celebration animation can be applied by CSS class (we set message)
    }
  }, [deck, intervalId, time, moves]);

  // utility
  function formatTime(sec: number) {
    const mm = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const ss = (sec % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  // kick off initial deck on mount
  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // if rows/cols changed by user, restart with new grid
  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, cols]);

  // Fix: ensure UI grid columns adapt to adjustedCols
  const gridColsClass = `grid-cols-${Math.min(adjustedCols, 6)}`; // tailwind supports up to grid-cols-6 by default

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Memory Match</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Flip two cards to find pairs — try to finish fast!
        </p>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-sm">Rows:</label>
            <select
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="px-2 py-1 border rounded"
            >
              {[2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <label className="text-sm">Cols:</label>
            <select
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="px-2 py-1 border rounded"
            >
              {[2, 3, 4, 5, 6].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={startGame}
              className="ml-3 px-3 py-1 bg-yellow-400 text-black font-semibold rounded shadow"
            >
              Restart
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              Time: <span className="font-mono">{formatTime(time)}</span>
            </div>
            <div className="text-sm">
              Moves: <span className="font-semibold">{moves}</span>
            </div>
            <div className="text-sm">
              Grid: {adjustedRows}×{adjustedCols}
            </div>
          </div>
        </div>

        {/* message */}
        {message && (
          <div className="mb-4 text-center">
            <div className="inline-block px-4 py-2 bg-black text-white rounded-lg shadow transform animate-pulse">
              {message}
            </div>
          </div>
        )}

        {/* Cards grid */}
        <div
          className={`grid gap-4 justify-center`}
          style={{
            gridTemplateColumns: `repeat(${adjustedCols}, minmax(64px, 1fr))`,
          }}
        >
          {deck.map((card) => (
            <div
              key={card.uid}
              role="button"
              data-pairid={card.pairId}
              onClick={() => flipCard(card.uid)}
              className={`relative w-full pb-full`} /* pb-full trick to make square (css below) */
              style={{ perspective: 700 }}
            >
              <div
                className={`absolute inset-0 transition-transform duration-500 transform ${
                  card.flipped || card.matched ? "rotate-y-0" : "rotate-y-180"
                }`}
                style={
                  {
                    transformStyle: "preserve-3d",
                  } as React.CSSProperties
                }
              >
                {/* Front (shows sprite) */}
                <div
                  className="absolute inset-0 bg-white rounded-lg flex items-center justify-center border shadow-md"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(0deg)",
                  }}
                >
                  <img
                    src={card.img}
                    alt="poke"
                    className="w-3/5 h-3/5 object-contain"
                  />
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-red-400 to-yellow-300 rounded-lg flex items-center justify-center border shadow-inner"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="text-white font-bold">?</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Victory overlay */}
        {deck.length > 0 && deck.every((c) => c.matched) && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-2xl text-center transform animate-scale-in">
              <h3 className="text-2xl font-bold mb-2">
                You cleared the board!
              </h3>
              <p className="mb-2">
                Time: <span className="font-mono">{formatTime(time)}</span>
              </p>
              <p className="mb-4">
                Moves: <strong>{moves}</strong>
              </p>
              <button
                className="px-4 py-2 bg-yellow-400 rounded font-semibold"
                onClick={startGame}
              >
                Play again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;

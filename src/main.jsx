import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const categories = ['Electronics', 'Accessories', 'Bags', 'Books', 'Clothing', 'Keys', 'Other'];
const icons = { Electronics: '⌁', Accessories: '◈', Bags: '▱', Books: '▤', Clothing: '◇', Keys: '⚿', Other: '✳' };

function App() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadItems() {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (type !== 'all') params.set('type', type);
    if (category !== 'all') params.set('category', category);
    const response = await fetch(`/api/items?${params}`);
    if (!response.ok) throw new Error('Could not load items. Is the backend running?');
    setItems(await response.json());
  }
  useEffect(() => { loadItems().catch((e) => setError(e.message)); }, [query, type, category]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch(modal.mode === 'claim' ? `/api/items/${modal.item.id}/claims` : '/api/items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Something went wrong.');
      setModal(null);
      setNotice(modal.mode === 'claim' ? 'Request saved for the campus team.' : 'Your report is live. Thanks for helping our campus!');
      await loadItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function openDetail(item) {
    try {
      const response = await fetch(`/api/items/${item.id}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load item details.');
      setModal({ mode: 'detail', item: result });
    } catch (e) { setError(e.message); }
  }

  return <div className="app">
    <header className="nav">
      <a className="brand" href="#"><span className="brand-mark">F</span> FindX<span className="brand-dot">.</span></a>
      <div className="nav-right"><a href="#listings">Browse items</a><button className="button button-dark nav-cta" onClick={() => setModal({ mode: 'report', type: 'lost' })}>＋ Report an item</button></div>
    </header>
    <main>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span className="live-dot"></span> YOUR CAMPUS, CONNECTED</div>
          <h1>Lost something?<br /><span>Found something?</span></h1>
          <p>Good things find their way back. Help reunite lost belongings with the people who miss them.</p>
          <div className="hero-actions"><button className="button button-dark" onClick={() => setModal({ mode: 'report', type: 'lost' })}>I lost something <span>↗</span></button><button className="button button-light" onClick={() => setModal({ mode: 'report', type: 'found' })}>I found something <span>↗</span></button></div>
          <div className="campus-note"><div className="avatar-stack"><i>J</i><i>M</i><i>A</i></div><span>A little campus kindness goes a long way.</span></div>
        </div>
        <div className="hero-art" aria-label="Illustration of a lost-and-found box"><div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✦</div><div className="art-card card-back"><span>PROPERTY OF</span><strong>you?</strong></div><div className="art-box"><div className="box-label">LOST<br />&amp; FOUND</div><div className="box-heart">♡</div><div className="box-shine"></div></div><div className="art-tag">little things<br />find their way <b>↗</b></div><div className="art-shadow"></div></div>
      </section>
      <section className="listing" id="listings">
        <div className="section-heading"><div><div className="eyebrow">THE CAMPUS BOARD</div><h2>Find your <span>something.</span></h2><p>Every post is one step closer to a happy reunion.</p></div><div className="listing-count"><b>{items.length.toString().padStart(2, '0')}</b><span>active<br />listings</span></div></div>
        {notice && <div className="notice success">{notice}<button onClick={() => setNotice('')}>×</button></div>}
        {error && <div className="notice error">{error}<button onClick={() => setError('')}>×</button></div>}
        <div className="filters"><label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items, places, anything..." /></label><div className="type-filters">{[['all', 'Everything'], ['lost', 'Lost'], ['found', 'Found']].map(([v, label]) => <button key={v} className={type === v ? 'active' : ''} onClick={() => setType(v)}>{label}</button>)}</div><select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
        {items.length ? <div className="grid">{items.map((item, i) => <article className="item-card" key={item.id} onClick={() => openDetail(item)} tabIndex="0" onKeyDown={(e) => e.key === 'Enter' && openDetail(item)}><div className={`item-visual visual-${i % 6}`}>{item.image ? <img src={item.image} alt="" /> : <span>{icons[item.category] || '✳'}</span>}<span className={`badge ${item.type}`}>{item.type === 'lost' ? 'LOST' : 'FOUND'}</span></div><div className="item-info"><div className="item-meta"><span>{item.category}</span><span>{new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div><h3>{item.title}</h3><p>⌖ &nbsp;{item.location}</p><div className="card-bottom"><span>{item.description.slice(0, 62)}{item.description.length > 62 ? '…' : ''}</span><button aria-label={`View ${item.title}`}>↗</button></div></div></article>)}</div> : <div className="empty"><div>⌕</div><h3>Nothing here just yet.</h3><p>Try another search, or be the first to post something.</p><button className="button button-dark" onClick={() => setModal({ mode: 'report', type: 'found' })}>＋ Post an item</button></div>}
      </section>
      <section className="bottom-cta"><span className="cta-spark">✳</span><div><div className="eyebrow">MAKE SOMEONE'S DAY</div><h2>Found a stray something?</h2><p>It could mean the world to whoever's looking for it.</p></div><button className="button button-dark" onClick={() => setModal({ mode: 'report', type: 'found' })}>Post a found item <span>↗</span></button></section>
    </main>
    <footer><a className="brand" href="#"><span className="brand-mark">F</span> FindX<span className="brand-dot">.</span></a><span>Made for the things that matter. <i>♡</i></span><span>Campus Lost &amp; Found · {new Date().getFullYear()}</span></footer>
    {modal && <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}><section className="dialog"><button className="close" onClick={() => setModal(null)} aria-label="Close">×</button>
      {modal.mode === 'detail' ? <><div className={`detail-visual visual-${modal.item.id % 6}`}>{modal.item.image ? <img src={modal.item.image} alt={modal.item.title} /> : <span>{icons[modal.item.category] || '✳'}</span>}</div><span className={`badge ${modal.item.type}`}>{modal.item.type}</span><h2>{modal.item.title}</h2><p className="detail-desc">{modal.item.description}</p><div className="detail-facts"><span>⌖ &nbsp;{modal.item.location}</span><span>◷ &nbsp;{modal.item.date}</span><span>◈ &nbsp;{modal.item.category}</span></div><button className="button button-dark full" onClick={() => setModal({ mode: 'claim', item: modal.item })}>This is mine / Get in touch ↗</button></> :
      <><div className="eyebrow">{modal.mode === 'claim' ? 'REACH OUT' : 'CAMPUS COMMUNITY'}</div><h2>{modal.mode === 'claim' ? 'Is this your something?' : `I ${modal.type === 'lost' ? 'lost' : 'found'} something.`}</h2><p className="form-intro">{modal.mode === 'claim' ? `Send a message about ${modal.item.title}. The campus team will help connect you.` : 'A few details help get it to the right person.'}</p><form onSubmit={submit}>
        {modal.mode === 'report' && <input type="hidden" name="type" value={modal.type} />}
        <label>Your name<input name="name" required maxLength="80" placeholder="What should we call you?" /></label>
        {modal.mode === 'report' && <label>Item name<input name="title" required maxLength="100" placeholder="e.g. Blue water bottle" /></label>}
        {modal.mode === 'report' && <div className="form-row"><label>Category<select name="category" required defaultValue=""><option value="" disabled>Choose one</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></label><label>Date {modal.type === 'lost' ? 'lost' : 'found'}<input name="date" type="date" required max={new Date().toISOString().slice(0, 10)} defaultValue={new Date().toISOString().slice(0, 10)} /></label></div>}
        {modal.mode === 'report' && <label>Where {modal.type === 'lost' ? 'did you lose it?' : 'did you find it?'}<input name="location" required maxLength="120" placeholder="e.g. Library, second floor" /></label>}
        {modal.mode === 'report' && <label>Photo URL <span className="optional">(optional)</span><input name="image" type="url" placeholder="https://..." /></label>}
        <label>Your contact<input name="contact" required maxLength="120" placeholder="Email or phone number" /></label>
        {modal.mode === 'report' ? <label>A few details<textarea name="description" required maxLength="1000" rows="3" placeholder="Color, brand, anything that might help..." /></label> : <label>Your message<textarea name="message" required maxLength="1000" rows="3" placeholder="Share a detail to help identify it..." /></label>}
        <button className="button button-dark full" type="submit" disabled={busy}>{busy ? 'Sending…' : modal.mode === 'claim' ? 'Send request ↗' : 'Post to the board ↗'}</button>
      </form></>}
    </section></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);

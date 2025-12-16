"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Papa from 'papaparse';
import { logAction } from '../../utils/logger';

// 📊 CONFIG: Links to your ROUNDS sheets
const ROUNDS_SHEETS = [
  { category: 'Adults', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6UFPFARgN12MiEuYpGG2WWAGe0SPlORnm1jeSgoFiXZY7ia4sFXMXAVXalIVn1X8cCK8kFAQ__44k/pub?gid=1586830246&single=true&output=csv' },
  { category: 'Juniors', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSugPx6ejmoqQGvkXMVZ2IC-5NKuKFuhrBkEFjSRr-lZbY1aQIfW0tQXllF6cSGNIHL7TXgklGosGZ6/pub?gid=1273587789&single=true&output=csv' },
  { category: 'Kids', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSOj-HR4exbW-YvxAjDSe_l83xGXNbty52DoFhJQQqk7U97KVtKnh9F2QcG1Dn9z3hK9C6eGKqJA9ln/pub?gid=756584123&single=true&output=csv' }
];

// 🔧 CONFIG: Map Excel Headers
const EXCEL_COLUMNS = {
  WhiteName: 'White',             
  BlackName: 'Black',             
  Link: 'Lichess Match URL',      
  WhitePoints: 'White Points',    
  BlackPoints: 'Black Points'     
};

export default function Admin() {
  // --- STATE ---
  const [session, setSession] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // LIVE FORM
  const [liveLink, setLiveLink] = useState('');
  const [liveWhite, setLiveWhite] = useState('');
  const [liveBlack, setLiveBlack] = useState('');
  const [liveWhiteId, setLiveWhiteId] = useState('');
  const [liveBlackId, setLiveBlackId] = useState('');
  const [liveCategory, setLiveCategory] = useState('Adults'); 

  // SCHEDULE FORM
  const [schedTime, setSchedTime] = useState('');
  const [schedWhite, setSchedWhite] = useState('');
  const [schedBlack, setSchedBlack] = useState('');
  const [schedWhiteId, setSchedWhiteId] = useState('');
  const [schedBlackId, setSchedBlackId] = useState('');
  const [schedCategory, setSchedCategory] = useState('Adults'); 

  // EDIT OVERLAY
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLink, setEditLink] = useState('');
  const [editWhite, setEditWhite] = useState('');
  const [editBlack, setEditBlack] = useState('');
  const [editWhiteId, setEditWhiteId] = useState('');
  const [editBlackId, setEditBlackId] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editCategory, setEditCategory] = useState('Adults');
  
  // SYSTEM
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState('');

  // --- AUTH ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); if (session) checkAccess(session.user.email); else setCheckingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session); if (session) checkAccess(session.user.email); else setCheckingAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAccess = async (email: string | undefined) => {
    if (!email) return;
    setCheckingAuth(true);
    const { data } = await supabase.from('admins').select('email').eq('email', email).single();
    if (data) { setAccessDenied(false); fetchAllMatches(); } else { setAccessDenied(true); }
    setCheckingAuth(false);
  };
  const handleLogin = async () => { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/admin' } }); };
  const handleLogout = async () => { await supabase.auth.signOut(); setMatches([]); setAccessDenied(false); };

  // --- DATA ---
  const fetchAllMatches = async () => {
    let { data } = await supabase.from('live_matches').select('*').order('start_time', { ascending: true }).order('created_at', { ascending: false });
    if (data) setMatches(data);
  };

  const fetchLichessInfo = async (url: string, setW: any, setB: any) => {
    if (!url.includes('lichess.org/')) return alert('Invalid Link');
    setLoading(true);
    try {
      const gameId = url.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)?.[1];
      const res = await fetch(`https://lichess.org/game/export/${gameId}?moves=false&clocks=false&evals=false`);
      const text = await res.text();
      setW(text.match(/\[White "(.+?)"\]/)?.[1] || "Unknown");
      setB(text.match(/\[Black "(.+?)"\]/)?.[1] || "Unknown");
    } catch (e) { alert("Error fetching data"); }
    setLoading(false);
  };

  // 🛡️ HELPER: CHECK FOR DUPLICATES
  const checkDuplicateMatch = async (url: string) => {
    const gameId = url.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)?.[1];
    if (!gameId) return null;

    const { data } = await supabase
      .from('live_matches')
      .select('is_active, managed_by') 
      .ilike('lichess_url', `%${gameId}%`)
      .maybeSingle();

    if (data) {
        const status = data.is_active ? "LIVE BOARD" : "ARCHIVE";
        const admin = data.managed_by || "another admin";
        alert(`⚠️ DUPLICATE WARNING!\n\nThis match is already in the ${status}.\nIt was managed by: ${admin}`);
        return true; 
    }
    return false; 
  };

  // 📋 HELPER: GET MATCH DETAILS FOR LOGGING
  const getMatchDetails = (id: string) => {
    const m = matches.find(m => m.id === id);
    if (!m) return `ID: ${id}`;
    return `${m.white_display_name} vs ${m.black_display_name} [${m.lichess_url || 'No Link'}]`;
  };

  // --- 🤖 SYNC FROM SHEETS ---
  const handleSheetSync = async () => {
    setSyncStatus('Fetching sheets...');
    let addedCount = 0;

    for (const sheet of ROUNDS_SHEETS) {
        try {
            const response = await fetch(sheet.url);
            const csvText = await response.text();
            const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
            const rows: any[] = parsed.data;

            for (const row of rows) {
                const link = row[EXCEL_COLUMNS.Link];
                if (!link || !link.includes('lichess.org/')) continue; 

                const gameId = link.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)?.[1];
                if (!gameId) continue;

                const { data: existing } = await supabase
                    .from('live_matches')
                    .select('id')
                    .ilike('lichess_url', `%${gameId}%`)
                    .maybeSingle();

                if (!existing) {
                    const wPts = row[EXCEL_COLUMNS.WhitePoints];
                    const bPts = row[EXCEL_COLUMNS.BlackPoints];
                    let resultString = null;
                    if (wPts == '1') resultString = '1 - 0';
                    else if (bPts == '1') resultString = '0 - 1';
                    else if (wPts == '0.5' || wPts == '½') resultString = '½ - ½';
                    else if (wPts && bPts) resultString = `${wPts} - ${bPts}`; 

                    const whiteName = row[EXCEL_COLUMNS.WhiteName] || 'Unknown';
                    const blackName = row[EXCEL_COLUMNS.BlackName] || 'Unknown';

                    await supabase.from('live_matches').insert([{
                        white_display_name: whiteName,
                        black_display_name: blackName,
                        white_name: whiteName, 
                        black_name: blackName, 
                        lichess_url: link,
                        category: sheet.category, 
                        result: resultString,
                        is_active: false,
                        managed_by: session.user.email 
                    }]);
                    addedCount++;
                }
            }
        } catch (error) { console.error(`Error syncing ${sheet.category}:`, error); }
    }
    if (addedCount > 0) logAction(session.user.email, 'SYNC', `Synced ${addedCount} matches from Excel`);
    setSyncStatus(addedCount > 0 ? `✅ Added ${addedCount} new matches.` : '✅ Up to date.');
    setTimeout(() => setSyncStatus(''), 5000);
    fetchAllMatches();
  };

  // --- ACTIONS ---
  const handleCreateLive = async () => {
    if (await checkDuplicateMatch(liveLink)) return;

    const { error } = await supabase.from('live_matches').insert([{ 
        white_name: liveWhiteId, black_name: liveBlackId,
        white_display_name: liveWhite || liveWhiteId, black_display_name: liveBlack || liveBlackId,
        lichess_url: liveLink, is_active: true, category: liveCategory,
        managed_by: session.user.email
    }]);
    if (!error) { 
        logAction(session.user.email, 'CREATE_LIVE', `Created: ${liveWhite || liveWhiteId} vs ${liveBlack || liveBlackId} [${liveLink}]`);
        setLiveLink(''); setLiveWhite(''); setLiveBlack(''); setLiveWhiteId(''); setLiveBlackId(''); fetchAllMatches(); 
    }
  };

  const handleCreateScheduled = async () => {
    if (!schedTime) return alert("Please select a time");
    const { error } = await supabase.from('live_matches').insert([{ 
        white_name: schedWhiteId || 'TBD', black_name: schedBlackId || 'TBD',
        white_display_name: schedWhite, black_display_name: schedBlack,
        start_time: new Date(schedTime).toISOString(), is_active: true, category: schedCategory,
        managed_by: session.user.email
    }]);
    if (!error) { 
        logAction(session.user.email, 'SCHEDULE', `Scheduled: ${schedWhite} vs ${schedBlack} at ${schedTime}`);
        setSchedTime(''); setSchedWhite(''); setSchedBlack(''); setSchedWhiteId(''); setSchedBlackId(''); fetchAllMatches(); 
    }
  };

  const handleUpdate = async () => {
    const { error } = await supabase.from('live_matches').update({
        white_display_name: editWhite, black_display_name: editBlack,
        white_name: editWhiteId, black_name: editBlackId,
        lichess_url: editLink, category: editCategory,
        start_time: editTime ? new Date(editTime).toISOString() : null,
        managed_by: session.user.email
    }).eq('id', editingId);
    if (!error) { 
        logAction(session.user.email, 'UPDATE', `Updated: ${editWhite} vs ${editBlack} [${editLink}]`);
        setEditingId(null); fetchAllMatches(); 
    }
  };

  const promoteToLive = async (match: any) => {
    const url = prompt(`Paste Lichess URL for ${match.white_display_name} vs ${match.black_display_name}`);
    if (!url || !url.includes('lichess.org/')) return;
    
    if (await checkDuplicateMatch(url)) return;

    let wId = match.white_name; let bId = match.black_name;
    const gameId = url.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)?.[1];
    try {
        const res = await fetch(`https://lichess.org/game/export/${gameId}?moves=false&clocks=false&evals=false`);
        const text = await res.text();
        wId = text.match(/\[White "(.+?)"\]/)?.[1] || wId;
        bId = text.match(/\[Black "(.+?)"\]/)?.[1] || bId;
    } catch(e) {}

    await supabase.from('live_matches').update({ 
        lichess_url: url, white_name: wId, black_name: bId, is_active: true,
        managed_by: session.user.email 
    }).eq('id', match.id);
    
    logAction(session.user.email, 'PROMOTE', `Promoted to LIVE: ${match.white_display_name} vs ${match.black_display_name} [${url}]`);
    fetchAllMatches();
  };

  const recordResult = async (id: string, result: string) => {
    if(!confirm(`End match: ${result}?`)) return;
    const details = getMatchDetails(id);
    await supabase.from('live_matches').update({ 
        result: result, is_active: false,
        managed_by: session.user.email 
    }).eq('id', id);
    
    logAction(session.user.email, 'RESULT', `Result ${result}: ${details}`);
    fetchAllMatches();
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const details = getMatchDetails(id);
    await supabase.from('live_matches').update({ 
        is_active: !currentStatus,
        managed_by: session.user.email 
    }).eq('id', id);
    
    logAction(session.user.email, 'STATUS_CHANGE', `${!currentStatus ? 'Activated' : 'Archived'}: ${details}`);
    fetchAllMatches();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    const details = getMatchDetails(id);
    await supabase.from('live_matches').delete().eq('id', id);
    
    logAction(session.user.email, 'DELETE', `Deleted: ${details}`);
    if(editingId === id) setEditingId(null);
    fetchAllMatches();
  };

  const startEdit = (match: any) => {
    setEditingId(match.id);
    setEditLink(match.lichess_url || '');
    setEditWhite(match.white_display_name || '');
    setEditBlack(match.black_display_name || '');
    setEditWhiteId(match.white_name || '');
    setEditBlackId(match.black_name || '');
    setEditCategory(match.category || 'Adults');
    if (match.start_time) {
        const dt = new Date(match.start_time);
        const localIso = new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setEditTime(localIso);
    } else { setEditTime(''); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLink('');
    setEditWhite('');
    setEditBlack('');
    setEditWhiteId('');
    setEditBlackId('');
    setEditTime('');
    setEditCategory('Adults');
  };

  // --- RENDER ---
  if (checkingAuth && session) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-4xl">⏳</div>;
  if (!session) return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 p-10 rounded-2xl shadow-2xl border border-slate-800 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <button onClick={handleLogin} className="w-full mt-6 flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-3 rounded-xl">Sign in with Google</button>
        </div>
      </div>
  );
  if (accessDenied) return <div className="text-center text-red-500 mt-20">Access Denied</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-6 font-sans">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-amber-500">Admin Control</h1>
           <span className="text-xs bg-green-900/50 text-green-400 px-3 py-1 rounded-full border border-green-800 font-mono">{session.user.email}</span>
        </div>
        <div className="flex flex-wrap gap-4 items-center justify-center">
            <button onClick={handleSheetSync} disabled={!!syncStatus} className="bg-purple-700 hover:bg-purple-600 border border-purple-500 px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition flex items-center gap-2">
                {syncStatus ? <span className="animate-pulse">{syncStatus}</span> : <span>🔄 Sync from Excel</span>}
            </button>
            <a href="/" className="text-slate-400 hover:text-white py-2 text-sm font-bold">View Site ↗</a>
            <button onClick={handleLogout} className="bg-slate-800 border border-slate-600 px-4 py-2 rounded text-sm">Logout</button>
        </div>
      </header>

      {/* --- EDIT OVERLAY --- */}
      {editingId ? (
        <div className="max-w-3xl mx-auto bg-slate-800 p-6 rounded-xl border border-blue-500 shadow-2xl mb-12 animate-in fade-in zoom-in duration-300">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-blue-400">✏️ Editing Match</h2>
             <button onClick={cancelEdit} className="text-slate-400 hover:text-white">Cancel</button>
           </div>
           
           <div className="flex gap-4 mb-4">
             <div className="flex-1">
                 <input className="w-full bg-slate-950 p-3 rounded border border-slate-600" placeholder="Lichess Link" value={editLink} onChange={e => setEditLink(e.target.value)} />
             </div>
             <div className="w-1/3">
                <select className="w-full bg-slate-950 p-3 rounded border border-slate-600 text-white font-bold" value={editCategory} onChange={e => setEditCategory(e.target.value)}>
                    <option value="Adults">Adults</option>
                    <option value="Juniors">Juniors</option>
                    <option value="Kids">Kids</option>
                </select>
             </div>
           </div>
           <button onClick={() => fetchLichessInfo(editLink, setEditWhiteId, setEditBlackId)} className="mb-4 bg-blue-600 px-4 py-2 rounded font-bold text-xs">AUTO-FILL IDs</button>
           
           <div className="mb-4">
              <label className="text-[10px] uppercase text-slate-500 font-bold">Time (Optional)</label>
              <input type="datetime-local" className="w-full bg-slate-950 p-3 rounded border border-slate-600 text-white scheme-dark" value={editTime} onChange={e => setEditTime(e.target.value)} />
           </div>

           <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="space-y-1">
                <input className="w-full bg-slate-950 p-2 rounded border border-slate-600 font-bold" placeholder="White Name" value={editWhite} onChange={e => setEditWhite(e.target.value)} />
                <input className="w-full bg-slate-900 p-1 rounded border border-slate-700 text-xs text-slate-500" placeholder="White ID" value={editWhiteId} onChange={e => setEditWhiteId(e.target.value)} />
             </div>
             <div className="space-y-1">
                <input className="w-full bg-slate-950 p-2 rounded border border-slate-600 font-bold" placeholder="Black Name" value={editBlack} onChange={e => setEditBlack(e.target.value)} />
                <input className="w-full bg-slate-900 p-1 rounded border border-slate-700 text-xs text-slate-500" placeholder="Black ID" value={editBlackId} onChange={e => setEditBlackId(e.target.value)} />
             </div>
           </div>
           <button onClick={handleUpdate} className="w-full bg-blue-600 py-3 rounded font-black shadow-lg hover:bg-blue-500">SAVE CHANGES 💾</button>
        </div>
      ) : (
        /* --- SPLIT SCREEN INPUT AREA --- */
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
            
            {/* LEFT: LIVE MATCH ENTRY */}
            <div className="bg-slate-800 p-6 rounded-xl border border-red-500/30 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> GO LIVE NOW
                    </h2>
                    <select className="bg-slate-900 border border-slate-600 text-xs rounded px-2 py-1 text-slate-300" value={liveCategory} onChange={e => setLiveCategory(e.target.value)}>
                        <option value="Adults">Adults</option>
                        <option value="Juniors">Juniors</option>
                        <option value="Kids">Kids</option>
                    </select>
                </div>
                
                <div className="flex gap-2 mb-4">
                    <input className="flex-1 bg-slate-950 p-3 rounded border border-slate-600 text-sm" placeholder="Paste Lichess Link" value={liveLink} onChange={e => setLiveLink(e.target.value)} />
                    <button onClick={() => fetchLichessInfo(liveLink, setLiveWhiteId, setLiveBlackId)} disabled={loading} className="bg-blue-600 px-4 rounded font-bold text-xs">{loading ? '...' : 'AUTO'}</button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                        <input className="w-full bg-slate-950 p-2 rounded border border-slate-600 text-sm font-bold" placeholder="White Name" value={liveWhite} onChange={e => setLiveWhite(e.target.value)} />
                        <input className="w-full bg-slate-900 p-1 rounded border border-slate-700 text-xs text-slate-500" placeholder="White ID" value={liveWhiteId} onChange={e => setLiveWhiteId(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <input className="w-full bg-slate-950 p-2 rounded border border-slate-600 text-sm font-bold" placeholder="Black Name" value={liveBlack} onChange={e => setLiveBlack(e.target.value)} />
                        <input className="w-full bg-slate-900 p-1 rounded border border-slate-700 text-xs text-slate-500" placeholder="Black ID" value={liveBlackId} onChange={e => setLiveBlackId(e.target.value)} />
                    </div>
                </div>
                <button onClick={handleCreateLive} className="w-full bg-red-600 py-3 rounded font-black shadow-lg hover:bg-red-500 transition">PUBLISH LIVE 🚀</button>
            </div>

            {/* RIGHT: SCHEDULE MATCH */}
            <div className="bg-slate-800 p-6 rounded-xl border border-amber-500/30 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-600"></div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2"><span>📅</span> SCHEDULE</h2>
                    <select className="bg-slate-900 border border-slate-600 text-xs rounded px-2 py-1 text-slate-300" value={schedCategory} onChange={e => setSchedCategory(e.target.value)}>
                        <option value="Adults">Adults</option>
                        <option value="Juniors">Juniors</option>
                        <option value="Kids">Kids</option>
                    </select>
                </div>

                <div className="mb-4">
                    <input type="datetime-local" className="w-full bg-slate-950 p-3 rounded border border-slate-600 text-white scheme-dark text-sm" value={schedTime} onChange={e => setSchedTime(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                        <input className="w-full bg-slate-950 p-2 rounded border border-slate-600 text-sm font-bold" placeholder="White Name" value={schedWhite} onChange={e => setSchedWhite(e.target.value)} />
                        <input className="w-full bg-slate-900 p-1 rounded border border-slate-700 text-xs text-slate-500" placeholder="White ID (Optional)" value={schedWhiteId} onChange={e => setSchedWhiteId(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <input className="w-full bg-slate-950 p-2 rounded border border-slate-600 text-sm font-bold" placeholder="Black Name" value={schedBlack} onChange={e => setSchedBlack(e.target.value)} />
                        <input className="w-full bg-slate-900 p-1 rounded border border-slate-700 text-xs text-slate-500" placeholder="Black ID (Optional)" value={schedBlackId} onChange={e => setSchedBlackId(e.target.value)} />
                    </div>
                </div>
                <button onClick={handleCreateScheduled} className="w-full bg-amber-600 py-3 rounded font-black shadow-lg hover:bg-amber-500 transition">ADD TO SCHEDULE 📅</button>
            </div>
        </div>
      )}

      {/* --- LISTS --- */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* ACTIVE & SCHEDULED */}
          <div>
            <h2 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">Active & Scheduled</h2>
            <div className="space-y-3">
              {matches.filter(m => m.is_active).map(m => (
                <div key={m.id} className={`bg-slate-800 p-4 rounded-xl border flex flex-col gap-2 ${m.lichess_url ? 'border-red-500/50' : 'border-amber-500/30'}`}>
                  <div className="flex justify-between items-start">
                     <div>
                       <div className="font-bold text-lg text-slate-200">{m.white_display_name} <span className="text-slate-600 text-sm">vs</span> {m.black_display_name}</div>
                       <div className="text-xs font-bold mt-1 flex gap-2">
                         <span className="bg-slate-700 px-1 rounded text-slate-300">{m.category}</span>
                         {m.lichess_url ? <span className="text-red-400">🔴 LIVE</span> : <span className="text-amber-500">📅 {new Date(m.start_time).toLocaleString()}</span>}
                       </div>
                       {/* SHOW ADMIN INFO */}
                       {m.managed_by && <div className="text-[9px] text-slate-600 mt-1">Managed by: {m.managed_by}</div>}
                     </div>
                     <button onClick={() => startEdit(m)} className="text-slate-500 hover:text-blue-400 bg-slate-900/50 p-2 rounded-lg transition" title="Edit">✎</button>
                  </div>
                  <div className="mt-2">
                     {!m.lichess_url && (
                        <button onClick={() => promoteToLive(m)} className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-2 rounded mb-2 shadow-lg animate-pulse transition">📡 PASTE LINK & GO LIVE</button>
                     )}
                     {m.lichess_url && (
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            <button onClick={() => recordResult(m.id, "1 - 0")} className="bg-slate-900 border border-slate-700 hover:border-green-500 text-slate-400 hover:text-green-400 py-1 rounded text-xs">1-0</button>
                            <button onClick={() => recordResult(m.id, "½ - ½")} className="bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-400 py-1 rounded text-xs">Draw</button>
                            <button onClick={() => recordResult(m.id, "0 - 1")} className="bg-slate-900 border border-slate-700 hover:border-green-500 text-slate-400 hover:text-green-400 py-1 rounded text-xs">0-1</button>
                        </div>
                     )}
                     <div className="flex gap-2">
                        <button onClick={() => toggleStatus(m.id, true)} className="flex-1 bg-slate-900 text-slate-400 py-1 rounded text-[10px] hover:text-white uppercase">Archive (Manual)</button>
                        <button onClick={() => handleDelete(m.id)} className="flex-1 bg-red-900/20 text-red-500 hover:bg-red-900/40 text-[10px] py-1 rounded">Delete</button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HISTORY */}
          <div>
            <h2 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">History</h2>
            <div className="space-y-3">
              {matches.filter(m => !m.is_active).map(m => (
                <div key={m.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 opacity-75">
                  <div className="flex justify-between items-start mb-2">
                     <div className="font-bold text-slate-500 text-sm">{m.white_display_name} vs {m.black_display_name}</div>
                     <span className="bg-slate-900 px-1 rounded text-[10px] text-slate-500 h-fit">{m.category}</span>
                     <div className="text-amber-500 font-bold text-sm">{m.result}</div>
                  </div>
                  {m.managed_by && <div className="text-[9px] text-slate-700">Archived by: {m.managed_by}</div>}
                  <div className="flex gap-2 mt-2">
                     <button onClick={() => toggleStatus(m.id, false)} className="text-green-600 hover:text-green-400 text-xs">Restore Live</button>
                     <button onClick={() => handleDelete(m.id)} className="text-red-900 hover:text-red-500 text-xs">Delete Permanently</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}
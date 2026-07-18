(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var token = params.get('t');
  var AV = ['#7B2FBE','#174CCC','#F26024','#24BC96','#b6892a','#C04A0E'];

  var ICON = {
    home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
    match:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4M6 4h12v4a6 6 0 01-12 0V4z"/><path d="M6 6H3v2a3 3 0 003 3M18 6h3v2a3 3 0 01-3 3"/></svg>',
    ladder:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3v18M17 3v18M7 7h10M7 12h10M7 17h10"/></svg>',
    stats:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    medal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="15" r="6"/><path d="M9 9L6 3M15 9l3-6M12 13v4M10 15h4"/></svg>',
    rank:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15l-3 6 3-2 3 2-3-6"/><circle cx="12" cy="9" r="6"/></svg>',
    feed:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 11a9 9 0 019 9M4 4a16 16 0 0116 16"/><circle cx="5" cy="19" r="1.5" fill="currentColor"/></svg>',
    cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h3l2-2h6l2 2h3v12H4z"/><circle cx="12" cy="13" r="3"/></svg>',
    shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>',
    lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>',
    edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M13 5l4 4"/></svg>',
    cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>',
    clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M6 13l6 6 6-6"/></svg>',
    fire:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.6 3.2 5 4.7 5 9a5 5 0 11-9.6-2c.1 1.5 1 2.4 1.9 2.8C8.9 8.7 9 5.6 12 2z"/></svg>'
  };

  var CHIP = {
    green:['#1e9e6a','#e3f5ec'], gold:['#b6892a','#f6efd8'], red:['#d8543a','#fde4dc'],
    blue:['#174CCC','#e2ebff'], purple:['#7B2FBE','#efe4f8'], orange:['#F26024','#fde8d8'], teal:['#24BC96','#d4f5ed']
  };

  function esc2(s){ return (typeof esc==='function') ? esc(s) : String(s==null?'':s); }
  function fmtShort(d){ return d ? (typeof fmtDate==='function'?fmtDate(d):d) : '—'; }
  function initials(n){ var p=(n||'').trim().split(/\s+/); return (((p[0]||'')[0]||'')+((p[1]||'')[0]||'')).toUpperCase(); }
  function names(a){ return (a&&a.length)?a.join(' & '):'Opponent'; }
  function toast(m){ var t=document.createElement('div'); t.className='toast'; t.textContent=m; document.body.appendChild(t); setTimeout(function(){t.remove();},2600); }
  function showState(m){ document.getElementById('main').innerHTML='<div class="state">'+esc2(m)+'</div>'; }

  function paintNavIcons(){
    var nav=document.getElementById('nav');
    nav.innerHTML=nav.innerHTML
      .replace('SVG_HOME',ICON.home).replace('SVG_MATCH',ICON.match).replace('SVG_TROPHY',ICON.trophy)
      .replace('SVG_LADDER',ICON.ladder).replace('SVG_STATS',ICON.stats).replace('SVG_MEDAL',ICON.medal)
      .replace('SVG_RANK',ICON.rank).replace('SVG_FEED',ICON.feed);
  }

  var PORTAL=null, HISTORY=[], DERIVED=null;
  var OFFICIAL=['ladder_rotating','tournament_rr','tournament_bracket'];
  function isOfficial(h){ return OFFICIAL.indexOf(h.source)>=0 && h.counts_for_stats; }

  function derive(){
    var off=HISTORY.filter(isOfficial).slice();
    off.sort(function(a,b){ var da=a.played_on||'', db=b.played_on||''; if(da<db)return -1; if(da>db)return 1; return (a.match_id||0)-(b.match_id||0); });
    var pf=0,pa=0,best=0,run=0,my=0,wy=0, yr=new Date().getFullYear();
    for(var i=0;i<off.length;i++){
      var m=off[i]; pf+=m.score_for||0; pa+=m.score_against||0;
      if(m.result==='win'){ run++; if(run>best)best=run; } else if(m.result==='loss'){ run=0; }
      if(String(yr)===(m.played_on||'').slice(0,4)){ my++; if(m.result==='win')wy++; }
    }
    var wl=off.filter(function(m){return m.result==='win'||m.result==='loss';});
    var recent=wl.slice(-10).reverse();
    var csk=null,cs=0;
    for(var j=wl.length-1;j>=0;j--){ if(csk===null){csk=wl[j].result;cs=1;} else if(wl[j].result===csk)cs++; else break; }
    DERIVED={ points_for:pf, points_against:pa, diff:pf-pa, best_streak:best, matches_year:my,
      win_rate_year: my>0 ? Math.round((wy/my)*1000)/10 : null, form:recent, streak_kind:csk, streak_count:cs };
  }

  function statCard(chip,icon,num,lbl){
    var c=CHIP[chip];
    return '<div class="scard"><div class="scard-top"><div class="chip" style="background:'+c[1]+';color:'+c[0]+'">'+icon+'</div>'
      +'<div class="scard-num" style="color:'+c[0]+'">'+num+'</div></div>'
      +'<div class="scard-lbl">'+lbl+'</div></div>';
  }

  function renderMatches(list){
    if(!list||!list.length) return '<div style="color:var(--muted);font-size:12px;font-weight:600;padding:10px 0;">No matches in this competition.</div>';
    var h='';
    for(var i=0;i<list.length;i++){
      var m=list[i], win=m.result==='win', loss=m.result==='loss', L=win?'W':loss?'L':'–';
      var sc=(m.score_for!=null&&m.score_against!=null)?(m.score_for+'\u2013'+m.score_against):'';
      var scColor=win?'#0f6e56':loss?'#993c1d':'var(--muted)';
      h+='<div class="match"><div class="res '+(win?'fb-w':'fb-l')+'">'+L+'</div>'
        +'<div><div class="match-vs">'+(sc?'<span class="mscore" style="color:'+scColor+'">'+esc2(sc)+'</span>':'')+'vs. '+esc2(names(m.opponent_names))+'</div>'
        +'<div class="match-ctx">'+esc2(m.competition||'Match')+' \u00b7 '+fmtShort(m.played_on)+'</div></div></div>';
    }
    return h;
  }
  function detailsFor(kind,name){
    var rows=HISTORY.filter(function(h){ if(h.competition!==name)return false;
      if(kind==='tournament')return h.source==='tournament_rr'||h.source==='tournament_bracket';
      return h.source==='ladder_rotating'; });
    return renderMatches(rows);
  }
  function placeLabel(p){ return p==='1st'?'🥇 1st':p==='2nd'?'🥈 2nd':p==='3rd'?'🥉 3rd':'Participated'; }
  function placeColor(p){ return p==='1st'?'#b6892a':p==='2nd'?'#6b7a99':p==='3rd'?'#C04A0E':'#6b7a99'; }

  function tournamentsPane(list){
    if(!list||!list.length) return '<div class="empty">'+ICON.trophy+'<h4>No tournaments played yet.</h4><p>Join a tournament to start building your history!</p></div>';
    var h='';
    for(var i=0;i<list.length;i++){var t=list[i];
      h+='<div class="hrow" data-kind="tournament" data-name="'+esc2(t.name)+'">'
        +'<div class="hrow-head"><div><div class="hrow-name">'+esc2(t.name)+'</div>'
        +'<div class="hrow-sub">'+esc2(t.category||'')+' \u00b7 '+fmtShort(t.date)+'</div></div>'
        +'<span class="place" style="color:'+placeColor(t.placement)+'">'+placeLabel(t.placement)+'</span></div>'
        +'<div class="hrow-foot"><div class="hrow-stats">'
        +'<div class="hstat"><b>'+t.wins+'\u2013'+t.losses+'</b><span>Record</span></div></div>'
        +'<button class="btn-mini">Details</button></div>'
        +'<div class="details"></div></div>';
    }
    return h;
  }
  function laddersPane(list){
    if(!list||!list.length) return '<div class="empty">'+ICON.ladder+'<h4>No ladder seasons yet.</h4><p>Join a ladder to get started!</p></div>';
    var h='';
    for(var i=0;i<list.length;i++){var l=list[i];
      var range=fmtShort(l.start_date)+(l.end_date?' \u2013 '+fmtShort(l.end_date):'');
      h+='<div class="hrow" data-kind="ladder" data-name="'+esc2(l.name)+'">'
        +'<div class="hrow-head"><div><div class="hrow-name">'+esc2(l.name)+'</div>'
        +'<div class="hrow-sub">'+esc2(range)+'</div></div></div>'
        +'<div class="hrow-foot"><div class="hrow-stats">'
        +'<div class="hstat"><b>#'+(l.position!=null?l.position:'\u2013')+'</b><span>Position</span></div>'
        +'<div class="hstat"><b>'+l.wins+'\u2013'+l.losses+'</b><span>Record</span></div>'
        +'<div class="hstat"><b>'+l.points+'</b><span>Points</span></div></div>'
        +'<button class="btn-mini">Details</button></div>'
        +'<div class="details"></div></div>';
    }
    return h;
  }
  function ladderType(t){ return t==='ftc'?'Flex Team Competition':t==='rotating_partner'?'Rotating Partner':(t||''); }

  function lastComp(){
    if(!HISTORY.length) return '';
    var s=HISTORY.slice().sort(function(a,b){var da=a.played_on||'',db=b.played_on||'';if(da>db)return -1;if(da<db)return 1;return (b.match_id||0)-(a.match_id||0);});
    return s[0].competition||'';
  }
  function qsRow(icon,lbl,val){ return '<div class="qs-row"><div class="qs-left">'+icon+esc2(lbl)+'</div><div class="qs-val">'+esc2(String(val))+'</div></div>'; }

  function renderOverview(){
    var d=PORTAL, h=d.header, s=d.snapshot, a=d.current_activity, dv=DERIVED;
    var av=AV[(h.player_id||0)%AV.length];
    var out='';

    out+='<div class="hero"><div class="hero-tr">'
      +'<div class="vis">'+ICON.lock+'<div><div class="vis-lbl">Profile Visibility</div><div class="vis-val">'+esc2(h.profile_visibility||'limited')+' Profile</div></div></div>'
      +'</div><div class="hero-row">'
      +'<div class="avatar-wrap"><div class="avatar" style="background:'+av+'">'+esc2(initials(h.name))+'</div></div>'
      +'<div class="hero-id"><div class="hero-name">'+esc2(h.name||'Player')+' <span class="hero-pill">'+esc2(h.status||'active')+'</span></div>'
      +'<div class="hero-meta">FEROCIA ID <b>#'+esc2(String(h.player_id))+'</b> &nbsp;&nbsp; Member since <b>'+fmtShort(h.date_joined)+'</b>'
      +(h.skill_level?' &nbsp;&nbsp; Level <b>'+esc2(h.skill_level)+'</b>':'')+'</div>'
      +'<div class="rating">'+ICON.shield+'<div><div class="rating-lbl">FEROCIA Ranking</div>'
      +'<div class="rating-val">'+(h.ranking!=null?('#'+esc2(String(h.ranking))):'Unranked')+'</div></div></div>'
      +'</div></div></div>';

    out+='<div class="sec-lbl">Competition Snapshot</div><div class="snap">'
      +statCard('green',ICON.match,s.matches_played,'Matches')
      +statCard('gold',ICON.trophy,s.wins,'Wins')
      +statCard('red',ICON.down,s.losses,'Losses')
      +statCard('blue',ICON.stats,(s.win_rate!=null?s.win_rate+'%':'—'),'Win Rate')
      +statCard('purple',ICON.rank,s.tournaments_played,'Tournaments')
      +statCard('orange',ICON.ladder,s.ladder_seasons,'Ladder Seasons')
      +statCard('teal',ICON.medal,s.podium_finishes,'Podiums')
      +'</div>';

    var ev=a.next_event;
    out+='<div class="cols"><div>';
    out+='<div class="sec-lbl">Current Activity</div><div class="act-grid">'
      +'<div class="act lime"><div class="act-inner">'+ICON.ladder+'<div class="act-txt"><span class="act-lbl">Current Ladder</span>'
      +'<div class="act-val">'+esc2(a.current_ladder||'None')+(a.current_ladder?'<span class="mini-pill">Active</span>':'')+'</div>'
      +'<div class="act-sub">'+esc2(a.current_ladder?ladderType(a.current_ladder_type):'Not enrolled')+'</div></div></div></div>'
      +'<div class="act"><div class="act-inner">'+ICON.cal+'<div class="act-txt"><span class="act-lbl">Next Event</span>'
      +'<div class="act-val">'+(ev?esc2(ev.title):'None scheduled')+'</div>'
      +'<div class="act-sub">'+(ev?fmtShort(ev.date):'Check back soon!')+'</div></div></div></div>'
      +'<div class="act teal"><div class="act-inner">'+ICON.clock+'<div class="act-txt"><span class="act-lbl">Last Played</span>'
      +'<div class="act-val">'+fmtShort(a.last_played)+'</div>'
      +'<div class="act-sub">'+esc2(lastComp()||'—')+'</div></div></div></div>'
      +'<div class="act"><div class="act-inner">'+ICON.stats+'<div class="act-txt"><span class="act-lbl">Ladder Rank</span>'
      +'<div class="act-val">'+(a.current_ladder_rank!=null?('#'+a.current_ladder_rank):'\u2013')+'</div>'
      +'<div class="act-sub">'+(a.current_ladder_rank!=null?'In current ladder':'Not enough data yet')+'</div></div></div></div>'
      +'</div>';
    out+='<div class="sec-lbl">Competition History</div><div class="card">'
      +'<div class="tabs"><button class="tab active" id="tab-t">'+ICON.trophy+'Tournaments</button><button class="tab" id="tab-l">'+ICON.ladder+'Ladders</button></div>'
      +'<div id="pane-t"></div><div id="pane-l" style="display:none;"></div></div>';
    out+='</div><div>';

    var formHtml='';
    if(dv.form.length){ for(var i=0;i<dv.form.length;i++){ var w=dv.form[i].result==='win'; formHtml+='<div class="fb '+(w?'fb-w':'fb-l')+'">'+(w?'W':'L')+'</div>'; } }
    else formHtml='<div style="color:var(--muted);font-size:12px;font-weight:600;">No matches yet.</div>';
    var streakInner='—', streakColor='var(--muted)';
    if(dv.streak_kind){ var word=dv.streak_count===1?(dv.streak_kind==='win'?'Win':'Loss'):(dv.streak_kind==='win'?'Wins':'Losses');
      streakColor=dv.streak_kind==='win'?'#1e9e6a':'#d8543a'; streakInner=ICON.fire+'<span>'+dv.streak_count+' '+word+'</span>'; }
    out+='<div class="sec-lbl">Recent Form (Last 10 Matches)</div><div class="card">'
      +'<div class="form-row">'+formHtml+'</div>'
      +'<div class="streak-row"><span class="streak-lbl">Current Streak</span><span class="streak-val" style="color:'+streakColor+'">'+streakInner+'</span></div></div>';

    out+='<div class="sec-lbl">Achievements</div><div class="card"><div class="ach"><div class="ach-medal">'+ICON.medal+'</div>'
      +'<div><h4>No achievements yet</h4><p>Keep playing to unlock badges and achievements!</p>'
      +'<a class="ach-link" id="ach-link">View all achievements &rarr;</a></div></div></div>';

    out+='<div class="sec-lbl">Quick Stats</div><div class="card">'
      +qsRow(ICON.match,'Matches This Year',dv.matches_year)
      +qsRow(ICON.stats,'Win Rate This Year',(dv.win_rate_year!=null?dv.win_rate_year+'%':'—'))
      +qsRow(ICON.trophy,'Best Win Streak',dv.best_streak)
      +qsRow(ICON.rank,'Total Points (For / Against)',dv.points_for+' / '+dv.points_against)
      +qsRow(ICON.feed,'Point Differential',(dv.diff>0?'+':'')+dv.diff)
      +'</div>';

    out+='</div></div>';

    document.getElementById('main').innerHTML=out;
    document.getElementById('pane-t').innerHTML=tournamentsPane(PORTAL.tournaments);
    document.getElementById('pane-l').innerHTML=laddersPane(PORTAL.ladders);
    wireTabs(); wireDetails();
    var al=document.getElementById('ach-link'); if(al) al.addEventListener('click',function(){toast('Achievements are coming soon.');});
  }

  function wireTabs(){
    var tT=document.getElementById('tab-t'),tL=document.getElementById('tab-l');
    var pT=document.getElementById('pane-t'),pL=document.getElementById('pane-l');
    if(!tT)return;
    tT.addEventListener('click',function(){tT.classList.add('active');tL.classList.remove('active');pT.style.display='';pL.style.display='none';});
    tL.addEventListener('click',function(){tL.classList.add('active');tT.classList.remove('active');pL.style.display='';pT.style.display='none';});
  }
  function wireDetails(){
    var b=document.querySelectorAll('.btn-mini');
    for(var i=0;i<b.length;i++){ b[i].addEventListener('click',function(e){
      var row=e.target.closest('.hrow'), box=row.querySelector('.details');
      if(box.classList.contains('open')){box.classList.remove('open');e.target.textContent='Details';return;}
      box.innerHTML=detailsFor(row.getAttribute('data-kind'),row.getAttribute('data-name'));
      box.classList.add('open'); e.target.textContent='Hide';
    }); }
  }

  function setActive(view){
    var links=document.querySelectorAll('#nav a');
    for(var i=0;i<links.length;i++){ links[i].classList.remove('active'); }
    for(var j=0;j<links.length;j++){ if(links[j].getAttribute('data-view')===view){ links[j].classList.add('active'); break; } }
  }
  function showView(view,title,el){
    if(view==='overview'){ setActive('overview'); renderOverview(); window.scrollTo(0,0); return; }
    if(view==='tournaments'||view==='ladders'){ setActive(view); renderOverview();
      var id=view==='tournaments'?'tab-t':'tab-l'; var t=document.getElementById(id); if(t)t.click(); window.scrollTo(0,0); return; }
    // coming soon
    var links=document.querySelectorAll('#nav a'); for(var i=0;i<links.length;i++)links[i].classList.remove('active'); if(el)el.classList.add('active');
    document.getElementById('main').innerHTML='<div class="soon">'+esc2(title||'Coming soon')+'<small>This section is coming soon.</small></div>';
    window.scrollTo(0,0);
  }
  function wireNav(){
    var links=document.querySelectorAll('#nav a');
    for(var i=0;i<links.length;i++){ links[i].addEventListener('click',function(e){
      e.preventDefault(); var v=this.getAttribute('data-view');
      if(v==='soon') showView('soon',this.getAttribute('data-title'),this); else showView(v);
    }); }
    document.getElementById('share').addEventListener('click',function(e){e.preventDefault();
      if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(window.location.href).then(function(){toast('Profile link copied!');},function(){toast('Copy failed — '+window.location.href);}); }
      else toast(window.location.href);
    });
  }

  paintNavIcons();
  wireNav();

  if(!token || !/^[A-Za-z0-9_-]+$/.test(token)){
    showState('This profile link is invalid. Please check with the administrator for your personal link.');
    return;
  }

  (async function(){
    try{
      var pr=await supabase.rpc('get_player_portal',{p_token:token});
      if(pr.error) throw new Error(pr.error.message);
      if(!pr.data){ showState('Profile not found. Please check your personal link.'); return; }
      PORTAL=pr.data;
      var hr=await supabase.rpc('get_player_history',{p_token:token});
      HISTORY=(hr && !hr.error && hr.data)?hr.data:[];
      derive();
      renderOverview();
    }catch(err){
      showState('We could not load this profile right now. Please try again in a moment.');
      console.error('[Ferocia player DNA]',err);
    }
  })();
})();

import { useState, useRef, useCallback, useEffect } from "react";

const API_URL = "/api/claude";
const MODEL   = "claude-sonnet-4-20250514";
const BATCH_SZ = 8;

/* ─── STYLES ─────────────────────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --pg:#0f0d0b;--ps:#14110d;--pb:#2a231a;--gold:#c8a96e;
  --pt:#e8e0d4;--pm:#7a6a55;--pd:#4a3a2a;
  --hb:#f0ebe3;--hs:#faf7f2;--hbr:#ddd0c0;--ha:#b87060;
  --ht:#2a1e16;--hm:#8a7868;--hd:#c8bfb0;
  --hr:#f5ede6;--hsg:#edf2ee;--hlv:#f0ecf5;--hbu:#faf3e0;
}
body{font-family:'DM Sans',sans-serif;min-height:100vh}
body.pro{background:var(--pg);color:var(--pt)}
body.home{background:var(--hb);color:var(--ht)}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#5a4a35;border-radius:2px}

.splash{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f0d0b;z-index:300;padding:24px}
.splash-logo{font-family:'Playfair Display',serif;font-size:clamp(26px,5vw,46px);color:#c8a96e;letter-spacing:.04em;margin-bottom:6px;text-align:center}
.splash-sub{font-size:11px;color:#5a4a35;letter-spacing:.14em;text-transform:uppercase;margin-bottom:48px;text-align:center}
.splash-cards{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;width:100%;max-width:600px}
.scard{flex:1;min-width:200px;max-width:260px;border-radius:16px;padding:28px 20px;cursor:pointer;transition:all .22s;text-align:center;border:1.5px solid transparent}
.scard.pro{background:#1a1712;border-color:#2a231a}.scard.pro:hover{border-color:#c8a96e;transform:translateY(-3px)}
.scard.home{background:#fff;border-color:#e8e0d4}.scard.home:hover{border-color:#b87060;transform:translateY(-3px)}
.scard-ico{font-size:38px;margin-bottom:12px}
.scard-t{font-family:'Playfair Display',serif;font-size:18px;margin-bottom:6px}
.scard.pro .scard-t{color:#f0e6d0}.scard.home .scard-t{color:#1a1208}
.scard-s{font-size:11px;line-height:1.6}.scard.pro .scard-s{color:#7a6a55}.scard.home .scard-s{color:#8a7a6a}

.app{display:flex;flex-direction:column;min-height:100vh;max-width:1100px;margin:0 auto;padding:0 16px}
.content{flex:1;padding:22px 0 48px}

.hdr-pro{padding:20px 0 0;text-align:center;border-bottom:1px solid var(--pb);position:relative}
.hdr-pro-t{font-family:'Playfair Display',serif;font-size:clamp(17px,3vw,28px);color:#f0e6d0;letter-spacing:.04em;margin-bottom:2px}
.hdr-pro-s{font-size:10px;color:var(--pm);letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px}
.mode-sw{position:absolute;top:14px;right:0;font-size:11px;color:var(--pm);cursor:pointer;background:none;border:1px solid var(--pb);border-radius:20px;padding:4px 11px;transition:all .2s}
.mode-sw:hover{border-color:var(--gold);color:var(--gold)}

.tabs{display:flex}
.tab{flex:1;padding:11px 4px;font-size:10px;letter-spacing:.06em;text-transform:uppercase;background:none;border:none;border-bottom:2px solid transparent;color:#5a4a35;cursor:pointer;transition:all .2s}
.tab.on{color:var(--gold);border-bottom-color:var(--gold)}
.tab:hover:not(.on){color:#9a8060}
.tab-ico{display:block;font-size:15px;margin-bottom:2px}

.hdr-hm{padding:0}
.hdr-hm-top{background:var(--hs);padding:11px 18px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--hbr)}
.hdr-hm-brand{font-family:'Playfair Display',serif;font-size:18px;color:#5a3a28}
.hdr-hm-brand em{color:var(--ha);font-style:italic}
.hdr-hm-sw{font-size:10px;color:var(--hm);cursor:pointer;background:none;border:1px solid var(--hbr);border-radius:20px;padding:4px 11px;transition:all .2s}
.hdr-hm-sw:hover{border-color:var(--ha);color:var(--ha)}
.hdr-hm-hero{background:linear-gradient(160deg,#ede5d8,#f5f0e8,#eef2ec);padding:36px 20px 28px;text-align:center;position:relative;overflow:hidden}
.hdr-hm-t{font-family:'Playfair Display',serif;font-size:clamp(20px,4.5vw,36px);color:#2a1e16;margin-bottom:7px;line-height:1.2}
.hdr-hm-t em{color:var(--ha);font-style:italic}
.hdr-hm-t strong{color:#6a8a72}
.hdr-hm-s{font-size:12px;color:#8a7868;max-width:380px;margin:0 auto;line-height:1.6}

.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:12px;letter-spacing:.04em;cursor:pointer;transition:all .18s;border:none;font-weight:500}
.btn-gold{background:linear-gradient(135deg,#c8a96e,#a8843e);color:#1a1208}
.btn-gold:hover{filter:brightness(1.1);transform:translateY(-1px)}
.btn-gold:disabled{opacity:.4;cursor:not-allowed;transform:none}
.btn-po{background:none;border:1px solid var(--pb);color:#9a8060}
.btn-po:hover{border-color:var(--gold);color:var(--gold)}
.btn-red{background:none;border:1px solid #4a1a1a;color:#c06060}
.btn-red:hover{background:#1a0e0e;border-color:#c06060}
.btn-blue{background:none;border:1px solid #1a2a3a;color:#4a8ab0}
.btn-blue:hover{background:#0e1820;border-color:#4a8ab0}
.btn-hm{background:#2a1e16;color:#e8d8c8;border-radius:10px;font-weight:500}
.btn-hm:hover{background:#3a2e24;transform:translateY(-1px)}
.btn-hm:disabled{opacity:.4;cursor:not-allowed;transform:none}
.btn-hmo{background:transparent;border:1px solid var(--hbr);color:var(--hm);border-radius:8px}
.btn-hmo:hover{border-color:var(--ha);color:var(--ha)}
.btn-sm{padding:4px 11px;font-size:10px}

.upload-z{border:1.5px dashed var(--pb);border-radius:12px;padding:28px 18px;text-align:center;cursor:pointer;transition:all .2s;background:var(--ps);position:relative}
.upload-z:hover,.upload-z.drag{border-color:var(--gold);background:#1a1410}
.upload-z input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.upload-zhm{border:1.5px dashed var(--hd);border-radius:14px;padding:26px 18px;text-align:center;cursor:pointer;transition:all .2s;background:var(--hr);position:relative}
.upload-zhm:hover,.upload-zhm.drag{border-color:var(--ha);background:#f0e5dc}
.upload-zhm input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.prev-img{max-width:100%;max-height:170px;border-radius:8px;object-fit:contain;display:block;margin:0 auto 10px}

.ta{width:100%;background:var(--ps);border:1px solid var(--pb);border-radius:8px;padding:10px 12px;color:var(--pt);font-family:'DM Sans',sans-serif;font-size:13px;line-height:1.6;resize:vertical;min-height:80px;outline:none;transition:border-color .2s}
.ta:focus{border-color:#5a4a35}
.ta-hm{width:100%;background:#fff;border:1px solid var(--hbr);border-radius:10px;padding:10px 13px;color:var(--ht);font-family:'DM Sans',sans-serif;font-size:13px;line-height:1.6;resize:vertical;min-height:75px;outline:none;transition:border-color .2s}
.ta-hm:focus{border-color:var(--ha)}
.inp{width:100%;background:var(--ps);border:1px solid var(--pb);border-radius:6px;padding:7px 10px;color:var(--pt);font-family:'DM Sans',sans-serif;font-size:12px;outline:none;transition:border-color .2s}
.inp:focus{border-color:#5a4a35}
.inp-hm{width:100%;background:#fff;border:1px solid var(--hbr);border-radius:10px;padding:10px 13px;color:var(--ht);font-family:'DM Sans',sans-serif;font-size:13px;outline:none;transition:border-color .2s}
.inp-hm:focus{border-color:var(--ha)}

.cat-hdr{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold);padding:0 0 6px;border-bottom:1px solid var(--pb);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.p-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:5px}
.p-item{background:var(--ps);border:1px solid var(--pb);border-radius:8px;padding:7px 10px}
.p-name{font-size:12px;color:#d0c0a8;margin-bottom:1px}
.p-qty{font-size:10px;color:var(--pm)}
.dish-row{background:var(--ps);border:1px solid var(--pb);border-radius:10px;margin-bottom:6px;overflow:hidden}
.dish-hdr{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;cursor:pointer;transition:background .15s;gap:10px}
.dish-hdr:hover{background:#1a1712}
.dish-name{font-family:'Playfair Display',serif;font-size:14px;color:#e0d0bc}
.dish-cat{font-size:10px;color:var(--pm);margin-top:1px;letter-spacing:.05em}
.dish-chev{color:#5a4a35;transition:transform .2s;font-size:15px;flex-shrink:0}
.dish-chev.open{transform:rotate(180deg)}
.fiche{padding:0 14px 14px;border-top:1px solid #1f1a14}
.fiche-sec{margin-top:11px}
.fiche-lbl{font-size:9px;letter-spacing:.11em;text-transform:uppercase;color:var(--gold);margin-bottom:4px;display:flex;align-items:center;gap:6px}
.fiche-txt{font-size:12px;color:#b0a090;line-height:1.65;white-space:pre-wrap}
.ing-tag{display:inline-flex;align-items:center;gap:3px;background:#1e1a14;border:1px solid var(--pb);border-radius:20px;padding:2px 8px;font-size:11px;color:#a09080;margin:2px}
.ing-tag button{background:none;border:none;color:#5a4a35;cursor:pointer;font-size:9px;padding:0;line-height:1}
.ing-tag button:hover{color:#c06060}
.sug-card{background:var(--ps);border:1px solid var(--pb);border-radius:12px;padding:13px 15px;margin-bottom:8px}
.sug-dish{font-family:'Playfair Display',serif;font-size:14px;color:#e0d0bc;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px}
.sug-item{display:flex;gap:6px;padding:5px 0;border-bottom:1px solid #1e1a14;align-items:flex-start}
.sug-item:last-child{border-bottom:none}
.sug-dot{width:4px;height:4px;border-radius:50%;background:var(--gold);margin-top:8px;flex-shrink:0}
.sug-txt{font-size:12px;color:#9a8a72;line-height:1.6;flex:1}

.port-ctrl{display:flex;align-items:center;gap:6px;background:#1a1712;border:1px solid var(--pb);border-radius:7px;padding:4px 9px}
.port-btn{background:none;border:1px solid #3a2e20;color:#9a8060;width:22px;height:22px;border-radius:5px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .2s}
.port-btn:hover{border-color:var(--gold);color:var(--gold)}
.port-n{font-family:'Playfair Display',serif;font-size:14px;color:var(--gold);min-width:20px;text-align:center}
.port-lbl{font-size:9px;color:var(--pm);letter-spacing:.05em}

.r-block{background:var(--hs);border:1px solid var(--hbr);border-radius:14px;padding:14px 16px;margin-bottom:10px}
.r-block-t{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--hm);margin-bottom:10px;font-weight:600;display:flex;align-items:center;gap:7px}
.r-block-t::after{content:'';flex:1;height:1px;background:var(--hbr);opacity:.6}
.ing-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--hbr);font-size:12px;color:var(--ht)}
.ing-row:last-child{border-bottom:none}
.ing-qty{font-weight:600;min-width:70px;color:var(--ha);font-size:11px}
.step-row{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--hbr)}
.step-row:last-child{border-bottom:none}
.step-n{width:22px;height:22px;border-radius:50%;background:var(--hd);color:var(--hm);font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.step-t{font-size:13px;color:var(--ht);line-height:1.6;flex:1}
.cost-box{background:#2a1e16;border-radius:12px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:10px}
.cost-col{text-align:center}
.cost-lbl{font-size:9px;color:#9a8878;letter-spacing:.08em;text-transform:uppercase;margin-bottom:3px}
.cost-val{font-family:'Playfair Display',serif;font-size:20px;color:#e8c9a0}
.cost-val.green{color:#7ec8a0}
.cost-vs{font-size:16px;color:#5a4a38}
.meta-row{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px}
.meta-pill{background:var(--hr);border:1px solid var(--hbr);border-radius:8px;padding:6px 12px;text-align:center}
.meta-pill.sage{background:var(--hsg);border-color:#c8d8cc}
.meta-pill.lav{background:var(--hlv);border-color:#d8d0e8}
.meta-pill.but{background:var(--hbu);border-color:#e0d8a8}
.meta-lbl{font-size:9px;color:var(--hm);text-transform:uppercase;letter-spacing:.07em;margin-bottom:2px}
.meta-val{font-size:13px;font-weight:600;color:var(--ht)}
.allergen{background:#fdecea;border:1px solid #f0c8b8;border-radius:20px;padding:2px 9px;font-size:11px;color:#a05040;display:inline-block;margin:2px}

.input-tabs{display:flex;gap:4px;background:var(--hr);border-radius:10px;padding:4px;margin-bottom:14px;border:1px solid var(--hbr)}
.input-tab{flex:1;padding:7px 6px;font-size:10px;letter-spacing:.03em;text-transform:uppercase;background:none;border:none;border-radius:7px;color:var(--hm);cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;font-weight:500}
.input-tab.on{background:#fff;color:var(--ht);box-shadow:0 1px 4px rgba(60,40,20,.1)}
.view-tabs{display:flex;gap:0;margin-bottom:16px;border-bottom:1px solid var(--hbr)}
.view-tab{flex:1;padding:9px;font-size:11px;letter-spacing:.05em;text-transform:uppercase;background:none;border:none;border-bottom:2px solid transparent;color:var(--hm);cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;margin-bottom:-1px}
.view-tab.on{color:var(--ha);border-bottom-color:var(--ha)}

.level-lbl{font-size:10px;color:var(--hm);letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;font-weight:500}
.level-sel{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.level-btn{flex:1;min-width:80px;padding:11px 8px;border-radius:12px;border:1px solid var(--hbr);background:var(--hs);cursor:pointer;text-align:center;transition:all .2s;font-family:'DM Sans',sans-serif}
.level-btn:hover{border-color:var(--ha)}
.level-btn.on.deb{border-color:#7a9e8a;background:var(--hsg)}
.level-btn.on.int{border-color:var(--ha);background:var(--hr)}
.level-btn.on.adv{border-color:#b8a4c8;background:var(--hlv)}
.level-btn-ico{font-size:20px;display:block;margin-bottom:4px}
.level-btn-t{font-size:11px;color:var(--ht);font-weight:500;margin-bottom:1px}
.level-btn-s{font-size:10px;color:var(--hm)}

.port-row{display:flex;align-items:center;gap:10px;background:var(--hbu);border-radius:10px;padding:10px 14px;margin-bottom:12px;border:1px solid #e0d8a8}
.port-row-lbl{font-size:12px;color:var(--ht);flex:1;font-weight:500}
.port-hm-btn{width:28px;height:28px;border-radius:7px;border:1px solid var(--hbr);background:var(--hr);color:var(--ht);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:500;transition:all .2s}
.port-hm-btn:hover{border-color:var(--ha);background:var(--ha);color:#fff}
.port-hm-n{font-size:16px;font-weight:600;color:var(--ht);min-width:26px;text-align:center}

.badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:500;letter-spacing:.04em}
.badge-g{background:#2a1e08;color:var(--gold);border:1px solid #3a2a10}
.badge-gr{background:#0a1a0e;color:#5a9a60;border:1px solid #1a3020}

.row{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.col{display:flex;flex-direction:column;gap:7px}
.divider{display:flex;align-items:center;gap:8px;margin:10px 0;font-size:10px;letter-spacing:.07em;text-transform:uppercase}
.div-pro{color:var(--pd)}.div-pro::before,.div-pro::after{content:'';flex:1;height:1px;background:var(--pb)}
.div-hm{color:var(--hd)}.div-hm::before,.div-hm::after{content:'';flex:1;height:1px;background:var(--hbr)}
.toolbar{display:flex;gap:7px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
.sec-t{font-family:'Playfair Display',serif;font-size:17px;color:#f0e6d0;margin-bottom:11px}
.empty{text-align:center;padding:40px 20px}
.empty-ico{font-size:34px;color:#3a2e20;margin-bottom:8px}
.empty-t{font-family:'Playfair Display',serif;font-size:15px;color:#5a4a35;margin-bottom:4px}
.empty-s{font-size:11px;color:#4a3a2a}
.err-box{background:#1a0e0e;border:1px solid #4a1a1a;border-radius:8px;padding:10px 13px;margin-bottom:11px}
.err-t{font-size:12px;color:#c06060;margin-bottom:2px;font-weight:500}
.err-d{font-size:10px;color:#7a4a4a;white-space:pre-wrap;word-break:break-all}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#2a0e0e;border:1px solid #6a2a1a;border-radius:10px;padding:10px 18px;font-size:12px;color:#e08060;z-index:400;display:flex;align-items:center;gap:8px;box-shadow:0 4px 18px rgba(0,0,0,.4);max-width:440px;width:90%}
.toast button{background:none;border:none;color:#e08060;cursor:pointer;font-size:15px;margin-left:auto;flex-shrink:0}
.toast.hm{background:#f8ede8;border-color:#e0c8c0;color:#a05040}
.spin{display:inline-block;width:11px;height:11px;border:2px solid rgba(255,255,255,.2);border-top-color:currentColor;border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ld{display:inline-block;width:6px;height:6px;background:var(--gold);border-radius:50%;animation:pu 1.4s ease-in-out infinite}
.ld:nth-child(2){animation-delay:.2s}.ld:nth-child(3){animation-delay:.4s}
.ld.hm{background:var(--ha)}
@keyframes pu{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;gap:11px}
.ld-txt{font-size:12px;color:var(--pm);letter-spacing:.05em}
.step-bar{display:flex;gap:5px;margin-bottom:16px;flex-wrap:wrap}
.sp{display:flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:10px;border:1px solid var(--pb)}
.sp.done{background:#0a1a0e;color:#5a9a60;border-color:#1a3020}
.sp.act{background:#2a1e08;color:var(--gold);border-color:#3a2a10}
.sp.wait{color:#4a3a2a}
.sdot{width:4px;height:4px;border-radius:50%}
.sp.done .sdot{background:#5a9a60}.sp.act .sdot{background:var(--gold);animation:pu 1s infinite}.sp.wait .sdot{background:#3a2e20}
.saved-list{display:flex;flex-direction:column;gap:5px;margin-bottom:16px}
.saved-item{display:flex;align-items:center;gap:8px;background:var(--ps);border:1px solid var(--pb);border-radius:8px;padding:9px 12px;cursor:pointer;transition:border-color .2s}
.saved-item:hover{border-color:var(--gold)}
.saved-item-name{font-family:'Playfair Display',serif;font-size:13px;color:#e0d0bc;flex:1}
.saved-item-date{font-size:10px;color:#5a4a35}
.hist-item{display:flex;align-items:center;gap:8px;background:var(--hs);border:1px solid var(--hbr);border-radius:11px;padding:10px 13px;cursor:pointer;transition:all .2s;margin-bottom:6px}
.hist-item:hover{border-color:var(--ha)}
.hist-item-name{font-family:'Playfair Display',serif;font-size:13px;color:var(--ht);flex:1}
.hist-item-date{font-size:10px;color:var(--hm)}
.cache-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-size:10px;background:#0a1a0e;color:#5a9a60;border:1px solid #1a3020;font-weight:500}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:500;padding:20px}
.modal{border-radius:16px;padding:22px 24px;max-width:340px;width:100%}
.modal.pro{background:#1a1712;border:1px solid #3a2e20}
.modal.home{background:#fff;border:1px solid var(--hbr)}
.modal-ico{font-size:28px;text-align:center;margin-bottom:10px}
.modal-msg{font-family:'Playfair Display',serif;font-size:15px;text-align:center;margin-bottom:6px;line-height:1.4}
.modal.pro .modal-msg{color:#f0e6d0}.modal.home .modal-msg{color:#2a1e16}
.modal-sub{font-size:11px;text-align:center;margin-bottom:18px}
.modal.pro .modal-sub{color:var(--pm)}.modal.home .modal-sub{color:var(--hm)}

/* Factures */
.fact-tabs{display:flex;gap:0;background:var(--ps);border-radius:8px;padding:3px;margin-bottom:16px;border:1px solid var(--pb)}
.fact-tab{flex:1;padding:7px 8px;font-size:10px;letter-spacing:.07em;text-transform:uppercase;background:none;border:none;border-radius:6px;color:var(--pm);cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;font-weight:500}
.fact-tab.on{background:#2a231a;color:var(--gold)}
.four-inp{background:var(--ps);border:1px solid var(--pb);border-radius:8px;padding:8px 12px;color:var(--pt);font-family:'DM Sans',sans-serif;font-size:12px;outline:none;transition:border-color .2s;width:100%}
.four-inp:focus{border-color:var(--gold)}
.merc-table{width:100%;border-collapse:collapse;font-size:12px}
.merc-table th{text-align:left;padding:6px 10px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--pm);border-bottom:1px solid var(--pb);font-weight:500}
.merc-table td{padding:8px 10px;border-bottom:1px solid #1a1510;color:var(--pt);vertical-align:middle}
.merc-table tr:last-child td{border-bottom:none}
.merc-table tr:hover td{background:#1a1712}
.fact-row{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;margin-bottom:4px;font-size:12px}
.fact-row.ok{background:#0a1a0e;border:1px solid #1a3020}
.fact-row.warn{background:#1a0e0e;border:1px solid #4a1a1a}
.fact-row.new{background:#1a1208;border:1px solid #3a2a10}
.fact-prod{flex:1;color:var(--pt)}
.fact-prix.ok{color:#5a9a60}.fact-prix.warn{color:#e06060}.fact-prix.new{color:#c8a96e}
.fact-ecart{font-size:10px;color:var(--pm)}
.fact-ecart.warn{color:#e06060}.fact-ecart.ok{color:#5a9a60}
.hist-fact{background:var(--ps);border:1px solid var(--pb);border-radius:9px;padding:11px 14px;margin-bottom:6px}
.resume-pills{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}
.resume-pill{font-size:9px;padding:2px 8px;border-radius:20px;font-weight:500}
.resume-pill.ok{background:#0a1a0e;color:#5a9a60;border:1px solid #1a3020}
.resume-pill.warn{background:#1a0e0e;color:#e06060;border:1px solid #4a1a1a}
.resume-pill.new{background:#1a1208;color:#c8a96e;border:1px solid #3a2a10}
`;

/* ─── HELPERS ─────────────────────────────────────────────────────────── */
function robustParse(raw) {
  let t = raw.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
  try { return JSON.parse(t); } catch(_) {}
  const fa=t.indexOf("["), fo=t.indexOf("{");
  let start, isArr;
  if(fa===-1&&fo===-1) throw new Error("Aucun JSON");
  if(fa===-1){start=fo;isArr=false;}
  else if(fo===-1){start=fa;isArr=true;}
  else if(fa<fo){start=fa;isArr=true;}
  else{start=fo;isArr=false;}
  const end=isArr?t.lastIndexOf("]"):t.lastIndexOf("}");
  if(end<start) throw new Error("JSON incomplet");
  const sl=t.slice(start,end+1);
  try{return JSON.parse(sl);}catch(e){
    if(isArr){const lc=sl.lastIndexOf("},");if(lc>0)try{return JSON.parse(sl.slice(0,lc+1)+"]");}catch(_){}}
    throw new Error("JSON invalide");
  }
}

async function callAI(messages, system, maxTok=8000) {
  const res = await fetch(API_URL, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:MODEL, max_tokens:maxTok, system, messages}),
  });
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error("API "+res.status+": "+(e?.error?.message||res.statusText));}
  const data = await res.json();
  if(data.error) throw new Error(data.error.message);
  return data.content.map(b=>b.text||"").join("");
}

function getCatIcon(cat="") {
  const c=cat.toLowerCase();
  if(c.includes("viand")||c.includes("bouch")) return "🥩";
  if(c.includes("poisson")||c.includes("mer")) return "🐟";
  if(c.includes("légume")||c.includes("frais")) return "🥬";
  if(c.includes("laitier")||c.includes("fromage")) return "🧀";
  if(c.includes("épicerie")||c.includes("condiment")) return "🫙";
  if(c.includes("herbe")||c.includes("aromat")) return "🌿";
  if(c.includes("alcool")||c.includes("vin")) return "🍷";
  if(c.includes("dessert")||c.includes("sucre")) return "🍰";
  return "📦";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"});
}

function makeSlug(str) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")
    .slice(0,60);
}

/* ─── STORAGE ─────────────────────────────────────────────────────────── */
async function cacheGet(slug) {
  try {
    const r = await window.storage.get("bn_cache_"+slug);
    if(!r) return null;
    const entry = JSON.parse(r.value);
    window.storage.set("bn_cache_"+slug, JSON.stringify({...entry, hits:(entry.hits||0)+1}));
    return entry;
  } catch(_) { return null; }
}
async function cacheSave(slug, nom, data) {
  try {
    await window.storage.set("bn_cache_"+slug, JSON.stringify({slug,nom,data,ts:Date.now(),hits:0}));
  } catch(_) {}
}
async function userSave(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); return true; }
  catch(_) { return false; }
}
async function userGet(key) {
  try { const r=await window.storage.get(key); return r?JSON.parse(r.value):null; }
  catch(_) { return null; }
}
async function userDelete(key) {
  try { await window.storage.delete(key); return true; }
  catch(_) { return false; }
}
async function userList(prefix) {
  try { const r=await window.storage.list(prefix); return r?.keys||[]; }
  catch(_) { return []; }
}

/* ─── BATCH PRO ───────────────────────────────────────────────────────── */
async function extrairePlats(uc) {
  const r = await callAI([{role:"user",content:uc}],
    'Liste TOUS les plats de cette carte. JSON UNIQUEMENT : [{"nom":"...","categorie":"Entrée|Plat|Dessert"}]', 3000);
  const p = robustParse(r);
  return Array.isArray(p) ? p : [];
}

async function fichesBatch(noms, uc) {
  const liste = noms.map(p=>"- "+p.nom+" ("+p.categorie+")").join("\n");
  const content = Array.isArray(uc)
    ? [...uc, {type:"text",text:"Génère les fiches UNIQUEMENT pour :\n"+liste}]
    : [{type:"text",text:uc}, {type:"text",text:"Génère les fiches UNIQUEMENT pour :\n"+liste}];
  const r = await callAI(
    [{role:"user",content}],
    'Chef cuisinier professionnel. Fiche technique pour chaque plat. JSON UNIQUEMENT : [{"nom":"...","categorie":"...","description":"...","ingredients":["qty + ing"],"mise_en_place":"etapes numerotees","technique":"...","temps_preparation":"...","temps_cuisson":"...","couverts":"1 portion"}]',
    16000);
  const p = robustParse(r);
  return Array.isArray(p) ? p : [];
}

async function toutesLesFiches(listePlats, uc, onProgress) {
  const batchs=[];
  for(let i=0;i<listePlats.length;i+=BATCH_SZ) batchs.push(listePlats.slice(i,i+BATCH_SZ));
  const result=[];
  for(let i=0;i<batchs.length;i+=2){
    const gr=batchs.slice(i,i+2);
    const res=await Promise.allSettled(gr.map(b=>fichesBatch(b,uc)));
    res.forEach(r=>{ if(r.status==="fulfilled") result.push(...r.value); });
    if(onProgress) onProgress(Math.min(result.length,listePlats.length),listePlats.length);
  }
  return result;
}

/* ─── EXPORT PRINT ────────────────────────────────────────────────────── */
function exportPrint(produits, plats, suggestions, nutrition) {
  const date = new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"});
  const esc = s=>(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  let html = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Brigade Numerique</title>';
  html += '<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;color:#1a1208;font-size:11pt}';
  html += '@page{size:A4;margin:18mm}@media print{.noprint{display:none!important}.pb{page-break-before:always}}';
  html += 'h1{font-size:26pt;color:#8a6030;text-align:center;margin-bottom:6px}h2{font-size:15pt;color:#6a4820;border-bottom:1.5px solid #c8a060;padding-bottom:5px;margin-bottom:12px}h3{font-size:11pt;color:#4a3010;margin:12px 0 5px}';
  html += '.cover{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:75vh;text-align:center}';
  html += '.lbl{font-size:8pt;letter-spacing:.08em;text-transform:uppercase;color:#9a8060;margin-bottom:3px}';
  html += '.plat{margin-bottom:10px;padding:10px 12px;border:1px solid #e0d0b0;border-radius:5px;break-inside:avoid}';
  html += '.meta{display:flex;gap:12px;margin-bottom:8px;flex-wrap:wrap}.pill{background:#f5ede0;border-radius:20px;padding:2px 10px;font-size:8.5pt;color:#6a4820}';
  html += '.ig{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:8px}.ig-i{background:#faf5ec;border-radius:3px;padding:3px 7px;font-size:9pt}.ig-q{font-weight:bold;color:#8a5030;display:block;font-size:8pt}';
  html += '.steps{margin-bottom:8px}.step{display:flex;gap:8px;margin-bottom:5px;align-items:flex-start}.sn{width:18px;height:18px;border-radius:50%;background:#c8a060;color:#fff;font-size:7.5pt;font-weight:bold;display:flex;align-items:center;justify-content:center;flex-shrink:0}.st{font-size:9.5pt;line-height:1.4;flex:1}';
  html += '.nut{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin:6px 0}.nut-i{background:#f0f5f0;border-radius:3px;padding:4px 6px;text-align:center}.nut-l{font-size:7.5pt;color:#6a8060;text-transform:uppercase;display:block}.nut-v{font-size:10pt;font-weight:bold;color:#3a5030}';
  html += '.alg{display:flex;flex-wrap:wrap;gap:4px;margin:5px 0}.al{background:#fff0e8;border:1px solid #e8c0a0;border-radius:20px;padding:1px 8px;font-size:8.5pt;color:#8a4020}';
  html += '.pg{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:12px}.pi{background:#faf5ec;border-radius:3px;padding:4px 8px;font-size:9pt}.pq{font-size:8pt;color:#8a7050}';
  html += '.si{display:flex;gap:6px;padding:4px 0;border-bottom:1px solid #f0e8d0;font-size:9.5pt}.st2{font-weight:bold;color:#8a6030;min-width:70px;flex-shrink:0}';
  html += '.pbtn{position:fixed;bottom:20px;right:20px;background:#8a6030;color:#fff;border:none;padding:10px 20px;border-radius:7px;font-size:12pt;cursor:pointer}';
  html += '</style></head><body>';
  html += '<div class="cover"><h1>Brigade Numerique</h1><p style="font-size:12pt;color:#8a7060;margin:6px 0">Dossier de production</p><p style="font-size:9pt;color:#b0906a;margin-top:20px">'+esc(date)+'</p></div>';

  if(produits&&Object.keys(produits).length){
    html += '<div class="pb"><h2>Produits</h2>';
    for(const [cat,items] of Object.entries(produits)){
      html += '<h3>'+getCatIcon(cat)+' '+esc(cat)+'</h3><div class="pg">';
      items.forEach(it=>{
        const n=typeof it==="string"?it:it.nom||"";
        const q=typeof it==="object"?(it.quantite||""):"";
        html += '<div class="pi">'+esc(n)+(q?'<div class="pq">'+esc(q)+'</div>':'')+'</div>';
      });
      html += '</div>';
    }
    html += '</div>';
  }

  if(plats&&plats.length){
    html += '<div class="pb"><h2>Fiches Techniques</h2>';
    plats.forEach(plat=>{
      const nutr=nutrition&&nutrition.find(n=>n.plat===plat.nom);
      html += '<div class="plat"><h3>'+esc(plat.nom)+'</h3>';
      const metas=[plat.temps_preparation&&"Prep : "+plat.temps_preparation, plat.temps_cuisson&&"Cuisson : "+plat.temps_cuisson, nutr&&nutr.calories_portion&&"Cal : "+nutr.calories_portion].filter(Boolean);
      if(metas.length) html += '<div class="meta">'+metas.map(m=>'<span class="pill">'+esc(m)+'</span>').join("")+'</div>';
      if(plat.description) html += '<p style="font-style:italic;color:#6a5040;margin-bottom:8px;font-size:9.5pt">'+esc(plat.description)+'</p>';
      if(plat.ingredients&&plat.ingredients.length){
        html += '<div class="lbl">Ingredients</div><div class="ig">';
        plat.ingredients.forEach(ing=>{
          if(typeof ing==="string") html += '<div class="ig-i">'+esc(ing)+'</div>';
          else html += '<div class="ig-i"><span class="ig-q">'+esc(ing.quantite||"")+'</span>'+esc(ing.nom||"")+'</div>';
        });
        html += '</div>';
      }
      if(plat.mise_en_place){
        html += '<div class="lbl">Mise en place</div><div class="steps">';
        plat.mise_en_place.split(/\n/).filter(s=>s.trim()).forEach((s,i)=>{
          const clean=s.replace(/^\d+\.\s*/,"");
          if(clean) html += '<div class="step"><div class="sn">'+(i+1)+'</div><div class="st">'+esc(clean)+'</div></div>';
        });
        html += '</div>';
      }
      if(plat.technique) html += '<div class="lbl">Technique</div><p style="font-size:9.5pt;margin-bottom:6px">'+esc(plat.technique)+'</p>';
      if(nutr){
        html += '<div class="lbl">Nutrition/portion</div><div class="nut">';
        [["Cal",nutr.calories_portion],["Prot",nutr.proteines],["Glu",nutr.glucides],["Lip",nutr.lipides],["Fib",nutr.fibres]].filter(x=>x[1]).forEach(([l,v])=>{
          html += '<div class="nut-i"><span class="nut-l">'+l+'</span><span class="nut-v">'+esc(v)+'</span></div>';
        });
        html += '</div>';
        if(nutr.allergenes&&nutr.allergenes.length) html += '<div class="alg">'+nutr.allergenes.map(a=>'<span class="al">'+esc(a)+'</span>').join("")+'</div>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  if(suggestions&&suggestions.length){
    html += '<div class="pb"><h2>Suggestions</h2>';
    suggestions.forEach(sug=>{
      html += '<h3>'+esc(sug.plat)+'</h3>';
      if(Array.isArray(sug.suggestions)) sug.suggestions.forEach(s=>{
        const type=s.type||""; const conseil=typeof s==="string"?s:s.conseil||"";
        html += '<div class="si"><span class="st2">'+esc(type)+'</span><span>'+esc(conseil)+'</span></div>';
      });
      html += '<hr style="border:none;border-top:1px solid #e0d0b0;margin:10px 0">';
    });
    html += '</div>';
  }

  html += '<button class="pbtn noprint" onclick="window.print()">Imprimer / PDF</button></body></html>';
  const win=window.open("","_blank");
  if(!win){alert("Autorisez les popups pour exporter.");return;}
  win.document.write(html); win.document.close();
}

/* ─── COMPOSANTS COMMUNS ──────────────────────────────────────────────── */
function Dots({home=false,text=""}) {
  return (
    <div className="loading">
      <div style={{display:"flex",gap:5}}>
        <span className={"ld"+(home?" hm":"")}/><span className={"ld"+(home?" hm":"")}/><span className={"ld"+(home?" hm":"")}/>
      </div>
      {text&&<span className="ld-txt" style={{color:home?"var(--hm)":undefined}}>{text}</span>}
    </div>
  );
}

function StepBar({steps}) {
  return (
    <div className="step-bar">
      {steps.map((s,i)=>(
        <div key={i} className={"sp "+s.status}>
          <div className="sdot"/>{s.status==="done"?"✓ ":""}{s.label}
        </div>
      ))}
    </div>
  );
}

function ConfirmModal({message,onConfirm,onCancel,mode="pro"}) {
  const isPro=mode==="pro";
  return (
    <div className="modal-bg">
      <div className={"modal "+mode}>
        <div className="modal-ico">🗑</div>
        <div className="modal-msg">{message}</div>
        <div className="modal-sub">Cette action est irréversible.</div>
        <div className="row" style={{justifyContent:"center",gap:10}}>
          <button className={isPro?"btn btn-po":"btn btn-hmo"} style={{flex:1}} onClick={onCancel}>Annuler</button>
          <button className="btn" style={{flex:1,background:isPro?"#3a0e0e":"#c05040",color:"#fff",borderRadius:8}} onClick={onConfirm}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

function Toast({msg,onClose,home=false}) {
  useEffect(()=>{const t=setTimeout(onClose,5000);return()=>clearTimeout(t);},[]);
  return <div className={"toast"+(home?" hm":"")}>{msg}<button onClick={onClose}>✕</button></div>;
}

/* ─── PRO : ONGLET PRODUITS ───────────────────────────────────────────── */
function ProProduits({produits,setProduits,loading,error}) {
  const [newIng,setNewIng]=useState({});
  const [confirm,setConfirm]=useState(null);
  if(loading) return <Dots text="Extraction des produits…"/>;
  if(error) return <div className="err-box"><div className="err-t">⚠ Erreur produits</div><div className="err-d">{error}</div></div>;
  if(!produits) return <div className="empty"><div className="empty-ico">🥩</div><div className="empty-t">Aucune carte analysée</div><div className="empty-s">Importez votre carte pour générer la liste</div></div>;
  const remove=(cat,idx)=>setConfirm({cat,idx});
  const doRemove=()=>{
    if(!confirm)return;
    const n={...produits,[confirm.cat]:produits[confirm.cat].filter((_,i)=>i!==confirm.idx)};
    if(!n[confirm.cat].length) delete n[confirm.cat];
    setProduits(n);setConfirm(null);
  };
  const add=(cat)=>{
    const v=(newIng[cat]||"").trim();if(!v)return;
    setProduits({...produits,[cat]:[...produits[cat],{nom:v,quantite:"",notes:""}]});
    setNewIng({...newIng,[cat]:""});
  };
  return (
    <div>
      {confirm&&<ConfirmModal mode="pro" message="Supprimer ce produit ?" onConfirm={doRemove} onCancel={()=>setConfirm(null)}/>}
      <div className="row" style={{marginBottom:14}}><h2 className="sec-t">Produits</h2><span className="badge badge-g">{Object.values(produits).flat().length} produits</span></div>
      {Object.entries(produits).map(([cat,items])=>(
        <div key={cat} style={{marginBottom:20}}>
          <div className="cat-hdr"><span>{getCatIcon(cat)}</span><span>{cat}</span><span style={{marginLeft:"auto",color:"#5a4a35",fontSize:9}}>{items.length} réf.</span></div>
          <div className="p-grid">
            {items.map((p,i)=>(
              <div key={i} className="p-item">
                <div style={{display:"flex",justifyContent:"space-between",gap:5}}>
                  <div><div className="p-name">{typeof p==="string"?p:p.nom}</div>{p.quantite&&<div className="p-qty">{p.quantite}</div>}</div>
                  <button className="btn btn-sm btn-red" style={{padding:"1px 5px",fontSize:9}} onClick={()=>remove(cat,i)}>✕</button>
                </div>
              </div>
            ))}
          </div>
          <div className="row" style={{marginTop:6}}>
            <input className="inp" style={{flex:1}} placeholder={"Ajouter dans "+cat+"…"} value={newIng[cat]||""} onChange={e=>setNewIng({...newIng,[cat]:e.target.value})} onKeyDown={e=>e.key==="Enter"&&add(cat)}/>
            <button className="btn btn-sm btn-po" onClick={()=>add(cat)}>+</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── PRO : ONGLET MISES EN PLACE ─────────────────────────────────────── */
function ProMisesEnPlace({plats,setPlats,loading,error}) {
  const [ouvert,setOuvert]=useState(null);
  const [editField,setEditField]=useState(null);
  const [editVal,setEditVal]=useState("");
  const [loadingPort,setLoadingPort]=useState(null);
  const [newIng,setNewIng]=useState("");
  if(loading) return <Dots text="Création des fiches techniques…"/>;
  if(error) return <div className="err-box"><div className="err-t">⚠ Erreur fiches</div><div className="err-d">{error}</div></div>;
  if(!plats||!plats.length) return <div className="empty"><div className="empty-ico">👨‍🍳</div><div className="empty-t">Aucune mise en place</div><div className="empty-s">Importez votre carte pour générer les fiches</div></div>;
  const update=(idx,field,val)=>{const n=[...plats];n[idx]={...n[idx],[field]:val};setPlats(n);};
  const saveEdit=()=>{if(!editField)return;update(editField.idx,editField.field,editVal);setEditField(null);};
  const removeIng=(pi,ii)=>{const n=[...plats];n[pi]={...n[pi],ingredients:n[pi].ingredients.filter((_,i)=>i!==ii)};setPlats(n);};
  const addIng=(pi)=>{if(!newIng.trim())return;const n=[...plats];n[pi]={...n[pi],ingredients:[...(n[pi].ingredients||[]),newIng.trim()]};setPlats(n);setNewIng("");};
  const changePortions=async(idx,delta)=>{
    const plat=plats[idx];
    const num=parseInt(plat.portions||"1")||1;
    const next=Math.max(1,num+delta);
    update(idx,"portions",next+" portion"+(next>1?"s":""));
    setLoadingPort(idx);
    try{
      const r=await callAI([{role:"user",content:'Plat "'+plat.nom+'" pour '+num+' portion(s) : '+(plat.ingredients||[]).join(", ")+'. Adapte pour '+next+' portion(s). Tableau JSON uniquement.'}],"Chef cuisinier. JSON uniquement.",1000);
      const ings=robustParse(r);
      if(Array.isArray(ings)){const n=[...plats];n[idx]={...n[idx],ingredients:ings,portions:next+" portion"+(next>1?"s":"")};setPlats(n);}
    }catch(e){console.error(e);}
    setLoadingPort(null);
  };
  return (
    <div>
      <div className="row" style={{marginBottom:12}}><h2 className="sec-t">Mises en place</h2><span className="badge badge-g">{plats.length} plats</span></div>
      {plats.map((plat,i)=>(
        <div key={i} className="dish-row">
          <div className="dish-hdr" onClick={()=>setOuvert(ouvert===i?null:i)}>
            <div><div className="dish-name">{plat.nom}</div><div className="dish-cat">{plat.categorie}</div></div>
            <div className="row" onClick={e=>e.stopPropagation()}>
              <div className="port-ctrl">
                <button className="port-btn" onClick={()=>changePortions(i,-1)} disabled={loadingPort===i}>−</button>
                {loadingPort===i?<span className="spin" style={{margin:"0 4px"}}/>:<span className="port-n">{parseInt(plat.portions||"1")||1}</span>}
                <button className="port-btn" onClick={()=>changePortions(i,1)} disabled={loadingPort===i}>+</button>
                <span className="port-lbl">portion{parseInt(plat.portions||"1")>1?"s":""}</span>
              </div>
              <span className={"dish-chev"+(ouvert===i?" open":"")} onClick={()=>setOuvert(ouvert===i?null:i)}>▾</span>
            </div>
          </div>
          {ouvert===i&&(
            <div className="fiche">
              {[["description","Description"],["mise_en_place","Mise en place"],["technique","Technique & Dressage"]].map(([field,label])=>(
                <div key={field} className="fiche-sec">
                  <div className="fiche-lbl">{label}<button className="btn btn-sm btn-po" style={{padding:"1px 6px",fontSize:9}} onClick={()=>{setEditField({idx:i,field});setEditVal(plat[field]||"");}}>✏</button></div>
                  {editField&&editField.idx===i&&editField.field===field
                    ?<div className="col"><textarea className="ta" value={editVal} onChange={e=>setEditVal(e.target.value)} rows={4}/><div className="row"><button className="btn btn-sm btn-gold" onClick={saveEdit}>Sauver</button><button className="btn btn-sm btn-po" onClick={()=>setEditField(null)}>Annuler</button></div></div>
                    :<div className="fiche-txt">{plat[field]}</div>}
                </div>
              ))}
              <div className="fiche-sec">
                <div className="fiche-lbl">Ingrédients</div>
                <div style={{marginBottom:6}}>{(plat.ingredients||[]).map((ing,j)=><span key={j} className="ing-tag">{ing}<button onClick={()=>removeIng(i,j)}>✕</button></span>)}</div>
                <div className="row"><input className="inp" style={{flex:1}} placeholder="Ajouter…" value={newIng} onChange={e=>setNewIng(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addIng(i)}/><button className="btn btn-sm btn-po" onClick={()=>addIng(i)}>+</button></div>
              </div>
              <div className="fiche-sec">
                <div className="row">
                  {plat.temps_preparation&&<span className="badge badge-gr">Prép : {plat.temps_preparation}</span>}
                  {plat.temps_cuisson&&<span className="badge badge-gr">Cuisson : {plat.temps_cuisson}</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── PRO : ONGLET SUGGESTIONS ────────────────────────────────────────── */
function ProSuggestions({suggestions,setSuggestions,plats,loading,error}) {
  const [reloading,setReloading]=useState(null);
  const [editField,setEditField]=useState(null);
  const [editVal,setEditVal]=useState("");
  if(loading) return <Dots text="Génération des suggestions…"/>;
  if(error) return <div className="err-box"><div className="err-t">⚠ Erreur suggestions</div><div className="err-d">{error}</div></div>;
  if(!suggestions||!suggestions.length) return <div className="empty"><div className="empty-ico">✨</div><div className="empty-t">Aucune suggestion</div><div className="empty-s">Importez votre carte pour des conseils créatifs</div></div>;
  const reload=async(idx)=>{
    setReloading(idx);
    try{
      const sug=suggestions[idx];
      const pInfo=plats&&plats.find(p=>p.nom===sug.plat);
      const ctx=pInfo?("Ingrédients : "+(pInfo.ingredients||[]).join(", ")+". Technique : "+(pInfo.technique||"")):"";
      const prev=sug.suggestions.map(s=>s.conseil||s).join("; ");
      const r=await callAI([{role:"user",content:'Nouvelles suggestions DIFFÉRENTES pour "'+sug.plat+'". '+ctx+'. Évite : '+prev+'. JSON : [{"type":"...","conseil":"..."}]'}],"Chef gastronomique créatif. JSON uniquement.",1500);
      const ns=robustParse(r);
      if(Array.isArray(ns)){const n=[...suggestions];n[idx]={...n[idx],suggestions:ns};setSuggestions(n);}
    }catch(e){console.error(e);}
    setReloading(null);
  };
  const removeSugg=(si,ji)=>{const n=[...suggestions];n[si]={...n[si],suggestions:n[si].suggestions.filter((_,i)=>i!==ji)};setSuggestions(n);};
  const saveEdit=()=>{if(!editField)return;const n=[...suggestions];const s=n[editField.si].suggestions[editField.ji];n[editField.si].suggestions[editField.ji]=typeof s==="string"?editVal:{...s,conseil:editVal};setSuggestions(n);setEditField(null);};
  return (
    <div>
      <div className="row" style={{marginBottom:12}}><h2 className="sec-t">Suggestions</h2><span className="badge badge-g">{suggestions.length} plats</span></div>
      {suggestions.map((sug,i)=>(
        <div key={i} className="sug-card">
          <div className="sug-dish">
            <span>{sug.plat}</span>
            <button className="btn btn-sm btn-blue" onClick={()=>reload(i)} disabled={reloading===i}>{reloading===i?<span className="spin"/>:"↺"} Nouvelles idées</button>
          </div>
          {reloading===i&&<Dots text="Nouvelles suggestions…"/>}
          {reloading!==i&&Array.isArray(sug.suggestions)&&sug.suggestions.map((s,j)=>(
            <div key={j} className="sug-item">
              <div className="sug-dot"/>
              <div className="sug-txt" style={{flex:1}}>
                {editField&&editField.si===i&&editField.ji===j
                  ?<div className="col"><textarea className="ta" value={editVal} onChange={e=>setEditVal(e.target.value)} rows={2}/><div className="row"><button className="btn btn-sm btn-gold" onClick={saveEdit}>Sauver</button><button className="btn btn-sm btn-po" onClick={()=>setEditField(null)}>Annuler</button></div></div>
                  :<>{s.type&&<span style={{color:"#c8a96e",fontWeight:500,marginRight:4}}>{s.type} — </span>}{typeof s==="string"?s:s.conseil}</>}
              </div>
              {!(editField&&editField.si===i&&editField.ji===j)&&(
                <div className="row" style={{gap:3}}>
                  <button className="btn btn-sm btn-po" style={{padding:"1px 5px",fontSize:9}} onClick={()=>{setEditField({si:i,ji:j});setEditVal(typeof s==="string"?s:s.conseil||"");}}>✏</button>
                  <button className="btn btn-sm btn-red" style={{padding:"1px 5px",fontSize:9}} onClick={()=>removeSugg(i,j)}>✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── PRO : ONGLET INFOS & SANTÉ ──────────────────────────────────────── */
const ALLERGEN_ICONS={"Gluten":"🌾","Crustacés":"🦐","Oeufs":"🥚","Poisson":"🐟","Arachides":"🥜","Soja":"🫘","Lait":"🥛","Fruits à coque":"🌰","Céleri":"🥬","Moutarde":"🟡","Graines de sésame":"🌿","Sulfites":"🍷","Lupin":"🌸","Mollusques":"🦪"};

function ProInfosSante({nutrition,loading,error}) {
  const [ouvert,setOuvert]=useState(null);
  if(loading) return <Dots text="Calcul nutritionnel…"/>;
  if(error) return <div className="err-box"><div className="err-t">⚠ Erreur Infos & Santé</div><div className="err-d">{error}</div></div>;
  if(!nutrition||!nutrition.length) return <div className="empty"><div className="empty-ico">💚</div><div className="empty-t">Aucune donnée</div><div className="empty-s">Importez votre carte pour les infos nutritionnelles</div></div>;
  return (
    <div>
      <div className="row" style={{marginBottom:12}}><h2 className="sec-t">Infos & Santé</h2><span className="badge badge-g">{nutrition.length} plats</span></div>
      {nutrition.map((n,i)=>(
        <div key={i} className="dish-row">
          <div className="dish-hdr" onClick={()=>setOuvert(ouvert===i?null:i)}>
            <div><div className="dish-name">{n.plat}</div><div className="dish-cat">{n.calories_portion} · {(n.allergenes||[]).length} allergène{(n.allergenes||[]).length!==1?"s":""}</div></div>
            <span className={"dish-chev"+(ouvert===i?" open":"")}>▾</span>
          </div>
          {ouvert===i&&(
            <div className="fiche">
              <div className="fiche-sec">
                <div className="fiche-lbl">Valeurs / portion</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:6,marginTop:5}}>
                  {[{l:"Calories",v:n.calories_portion,c:"#c8a96e"},{l:"Protéines",v:n.proteines,c:"#5a9a60"},{l:"Glucides",v:n.glucides,c:"#6a8ab0"},{l:"Lipides",v:n.lipides,c:"#c07060"},{l:"Fibres",v:n.fibres,c:"#8a7a6a"}].filter(x=>x.v).map((x,j)=>(
                    <div key={j} style={{background:"#1a1712",border:"1px solid #2a231a",borderRadius:9,padding:"7px 9px",textAlign:"center"}}>
                      <div style={{fontSize:9,color:"#5a4a35",textTransform:"uppercase",letterSpacing:".07em",marginBottom:2}}>{x.l}</div>
                      <div style={{fontSize:14,fontWeight:600,color:x.c}}>{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              {n.allergenes&&n.allergenes.length>0&&(
                <div className="fiche-sec">
                  <div className="fiche-lbl">Allergènes</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:4}}>
                    {n.allergenes.map((a,j)=><span key={j} style={{background:"#2a1208",border:"1px solid #5a2a18",borderRadius:20,padding:"3px 10px",fontSize:11,color:"#e89060",display:"flex",alignItems:"center",gap:4}}><span>{ALLERGEN_ICONS[a]||"⚠"}</span>{a}</span>)}
                  </div>
                </div>
              )}
              {n.alternative&&(
                <div className="fiche-sec">
                  <div className="fiche-lbl">Alternative</div>
                  <div style={{background:"#0e1a12",border:"1px solid #1a3020",borderRadius:8,padding:"9px 11px",color:"#7ab898",fontSize:12,marginTop:4}}>{n.alternative}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── PRO : ONGLET FACTURES ───────────────────────────────────────────── */
function UploadFact({onFile,image,onClear,label}) {
  const [drag,setDrag]=useState(false);
  const ref=useRef();
  const handle=(file)=>{
    if(!file)return;
    const mt=file.type||"image/jpeg";
    const reader=new FileReader();
    reader.onload=e=>{
      const b64=e.target.result.split(",")[1];
      onFile(b64,mt,e.target.result);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <div className={"upload-z"+(drag?" drag":"")} style={{padding:"18px 16px"}}
        onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files[0]);}}
        onClick={()=>!image&&ref.current.click()}>
        <input ref={ref} type="file" accept="image/*" onChange={e=>handle(e.target.files[0])} style={{pointerEvents:"none"}}/>
        {image
          ?<img src={image} alt="facture" style={{maxWidth:"100%",maxHeight:150,borderRadius:7,objectFit:"contain",display:"block",margin:"0 auto"}}/>
          :<><div style={{fontSize:24,marginBottom:6,color:"#5a4a35"}}>📄</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:"#c0a880",marginBottom:3}}>{label||"Déposez la facture"}</div>
            <div style={{fontSize:10,color:"#6a5a45"}}>Photo ou scan</div></>}
      </div>
      {image&&<button className="btn btn-sm btn-red" style={{marginTop:5,fontSize:9}} onClick={onClear}>✕ Supprimer</button>}
    </div>
  );
}

function comparePrix(produitFacture, lignesMerc) {
  const fNorm=(produitFacture.produit||"").toLowerCase().replace(/[^a-z0-9]/g," ").trim();
  const match=lignesMerc.find(l=>{
    const lNorm=(l.produit||"").toLowerCase().replace(/[^a-z0-9]/g," ").trim();
    if(lNorm.length<4||fNorm.length<4) return false;
    return fNorm.includes(lNorm.slice(0,5))||lNorm.includes(fNorm.slice(0,5));
  });
  if(!match) return {status:"new",merc:null};
  const pF=parseFloat((produitFacture.prix_unitaire||"").toString().replace(/[^0-9.,]/g,"").replace(",","."));
  const pM=parseFloat((match.prix_negocie||"").toString().replace(/[^0-9.,]/g,"").replace(",","."));
  if(isNaN(pF)||isNaN(pM)) return {status:"new",merc:match};
  const ecart=pF-pM;
  const ecartPct=((ecart/pM)*100).toFixed(1);
  const seuil=parseFloat(match.tolerance||"0")||0;
  return {status:ecart>seuil?"warn":"ok",merc:match,ecart,ecartPct,pF,pM};
}

function ProFactures() {
  const [subTab,setSubTab]=useState("merc");
  const [fournisseurs,setFournisseurs]=useState({});
  const [selFourn,setSelFourn]=useState("");
  const [newFourn,setNewFourn]=useState("");
  const [editLigne,setEditLigne]=useState(null);
  const [mercLoading,setMercLoading]=useState(false);
  const [mercImg,setMercImg]=useState(null);
  const [mercB64,setMercB64]=useState(null);
  const [mercType,setMercType]=useState("image/jpeg");
  const [ctrlImg,setCtrlImg]=useState(null);
  const [ctrlB64,setCtrlB64]=useState(null);
  const [ctrlType,setCtrlType]=useState("image/jpeg");
  const [ctrlFourn,setCtrlFourn]=useState("");
  const [ctrlFournEmail,setCtrlFournEmail]=useState("");
  const [ctrlFournTel,setCtrlFournTel]=useState("");
  const [ctrlResult,setCtrlResult]=useState(null);
  const [ctrlLoading,setCtrlLoading]=useState(false);
  const [msgGenere,setMsgGenere]=useState(null);
  const [msgLoading,setMsgLoading]=useState(null);
  const [histFact,setHistFact]=useState([]);
  const [toast,setToast]=useState(null);

  useEffect(()=>{
    userGet("bn_merc").then(d=>{if(d)setFournisseurs(d);});
    userList("bn_fact_").then(async keys=>{
      const items=await Promise.all(keys.map(k=>userGet(k)));
      setHistFact(items.filter(Boolean).sort((a,b)=>new Date(b.date)-new Date(a.date)));
    });
  },[]);

  const saveMerc=async(next)=>{ setFournisseurs(next); await userSave("bn_merc",next); };

  const extraireFactureIA=async(b64,mt)=>{
    const r=await callAI(
      [{role:"user",content:[
        {type:"image",source:{type:"base64",media_type:mt,data:b64}},
        {type:"text",text:"Extrais tous les produits et leurs prix unitaires de cette facture. JSON uniquement : [{\"produit\":\"nom\",\"quantite\":\"3 kg\",\"prix_unitaire\":\"4.50\",\"unite\":\"kg\",\"total_ligne\":\"13.50\"}]"}
      ]}],
      "Assistant gestion restauration. Extrais les données de facture. JSON uniquement.",
      3000
    );
    return robustParse(r);
  };

  const importerMerc=async()=>{
    if(!mercB64||!selFourn.trim())return;
    setMercLoading(true);
    try{
      const lignes=await extraireFactureIA(mercB64,mercType);
      if(!Array.isArray(lignes)) throw new Error("Format inattendu");
      const nouvelles=lignes.map(l=>({produit:l.produit||"",prix_negocie:l.prix_unitaire||"",unite:l.unite||"",type_prix:"variable",tolerance:"0.10"}));
      const fourn=selFourn.trim();
      const next={...fournisseurs,[fourn]:[...(fournisseurs[fourn]||[]),...nouvelles]};
      await saveMerc(next);
      setMercImg(null);setMercB64(null);
      setToast("✓ "+nouvelles.length+" produits importés dans \""+fourn+"\"");
    }catch(e){setToast("Erreur : "+e.message);}
    setMercLoading(false);
  };

  const updateLigne=(fourn,idx,field,val)=>{
    const next={...fournisseurs,[fourn]:fournisseurs[fourn].map((l,i)=>i===idx?{...l,[field]:val}:l)};
    saveMerc(next);
  };
  const deleteLigne=(fourn,idx)=>{ const next={...fournisseurs,[fourn]:fournisseurs[fourn].filter((_,i)=>i!==idx)}; saveMerc(next); };
  const addLigne=(fourn)=>{ const next={...fournisseurs,[fourn]:[...(fournisseurs[fourn]||[]),{produit:"Nouveau produit",prix_negocie:"",unite:"",type_prix:"variable",tolerance:"0.10"}]}; saveMerc(next); };

  const analyserFacture=async()=>{
    if(!ctrlB64)return;
    setCtrlLoading(true);setCtrlResult(null);setMsgGenere(null);
    try{
      const lignesFacture=await extraireFactureIA(ctrlB64,ctrlType);
      if(!Array.isArray(lignesFacture)) throw new Error("Format inattendu");
      const merc=ctrlFourn?fournisseurs[ctrlFourn]||[]:Object.values(fournisseurs).flat();
      const resultats=lignesFacture.map(lf=>({...lf,...comparePrix(lf,merc)}));
      const nbWarn=resultats.filter(r=>r.status==="warn").length;
      const nbOk=resultats.filter(r=>r.status==="ok").length;
      const nbNew=resultats.filter(r=>r.status==="new").length;
      const result={date:new Date().toISOString(),fournisseur:ctrlFourn||"Non spécifié",lignes:resultats,resume:{ok:nbOk,warn:nbWarn,new:nbNew,total:resultats.length}};
      setCtrlResult(result);
      const id="bn_fact_"+Date.now();
      await userSave(id,{id,...result});
      setHistFact(prev=>[{id,...result},...prev]);
    }catch(e){setToast("Erreur : "+e.message);}
    setCtrlLoading(false);
  };

  const genererMessage=async(type)=>{
    if(!ctrlResult)return;
    setMsgLoading(type);setMsgGenere(null);
    try{
      const anomalies=ctrlResult.lignes.filter(l=>l.status==="warn");
      const lignesText=anomalies.map(l=>"- "+l.produit+" : facturé "+l.prix_unitaire+"€ au lieu de "+(l.merc&&l.merc.prix_negocie)+"€ (écart : +"+(l.ecart&&l.ecart.toFixed(2))+"€, +"+l.ecartPct+"%)").join("\n");
      const total=anomalies.reduce((s,l)=>s+(l.ecart||0),0).toFixed(2);
      const prompt=type==="avoir"
        ?("Rédige un email professionnel et courtois à un fournisseur de restaurant pour demander un avoir. Fournisseur : "+ctrlResult.fournisseur+". Date : "+formatDate(ctrlResult.date)+". Anomalies :\n"+lignesText+"\nMontant trop-perçu : "+total+"€. Ton professionnel, factuel, courtois. Format : OBJET: ...\n\nCorps du message...")
        :("Rédige un email professionnel à un fournisseur pour demander des explications sur des écarts de prix. Fournisseur : "+ctrlResult.fournisseur+". Date : "+formatDate(ctrlResult.date)+". Produits concernés :\n"+lignesText+". Ton non accusateur, on cherche à comprendre. Format : OBJET: ...\n\nCorps du message...");
      const r=await callAI([{role:"user",content:prompt}],"Tu es assistant de gestion pour un restaurateur. Emails professionnels, courts, efficaces.",1500);
      const lines=r.trim().split("\n");
      const sujetLine=lines.find(l=>l.startsWith("OBJET:")||l.toLowerCase().startsWith("objet:"));
      const sujet=sujetLine
        ?sujetLine.replace(/^objet:\s*/i,"").trim()
        :(type==="avoir"?"Demande d'avoir — Facture "+ctrlResult.fournisseur:"Écarts de prix — Facture "+ctrlResult.fournisseur);
      const corps=lines.filter(l=>!l.startsWith("OBJET:")&&!l.toLowerCase().startsWith("objet:")).join("\n").trim();
      setMsgGenere({type,sujet,texte:corps});
    }catch(e){setToast("Erreur : "+e.message);}
    setMsgLoading(null);
  };

  const fournisseursList=Object.keys(fournisseurs);

  return (
    <div>
      {toast&&<Toast msg={toast} onClose={()=>setToast(null)}/>}
      <div className="row" style={{marginBottom:14}}>
        <h2 className="sec-t">Factures & Mercuriale</h2>
        <span className="badge badge-g">{fournisseursList.length} fournisseur{fournisseursList.length!==1?"s":""}</span>
      </div>
      <div className="fact-tabs">
        <button className={"fact-tab"+(subTab==="merc"?" on":"")} onClick={()=>setSubTab("merc")}>📋 Ma Mercuriale</button>
        <button className={"fact-tab"+(subTab==="ctrl"?" on":"")} onClick={()=>setSubTab("ctrl")}>🔍 Contrôle Facture</button>
        <button className={"fact-tab"+(subTab==="hist"?" on":"")} onClick={()=>setSubTab("hist")}>🕐 Historique</button>
      </div>

      {subTab==="merc"&&(
        <div>
          <div className="row" style={{marginBottom:14}}>
            <select className="four-inp" style={{flex:1}} value={selFourn} onChange={e=>setSelFourn(e.target.value)}>
              <option value="">— Sélectionner un fournisseur —</option>
              {fournisseursList.map(f=><option key={f} value={f}>{f}</option>)}
            </select>
            <span style={{color:"var(--pm)",fontSize:11}}>ou</span>
            <input className="four-inp" style={{flex:1}} placeholder="Nouveau fournisseur…" value={newFourn} onChange={e=>setNewFourn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newFourn.trim()){setSelFourn(newFourn.trim());setNewFourn("");}}}/>
            <button className="btn btn-sm btn-po" onClick={()=>{if(newFourn.trim()){const f=newFourn.trim();if(!fournisseurs[f])saveMerc({...fournisseurs,[f]:[]});setSelFourn(f);setNewFourn("");}}}>Créer</button>
          </div>
          {selFourn&&(
            <div style={{background:"#1a1712",border:"1px solid var(--pb)",borderRadius:10,padding:"14px 16px",marginBottom:16}}>
              <div style={{fontSize:10,color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>📸 Importer depuis une facture de référence</div>
              <UploadFact image={mercImg} onFile={(b64,mt,prev)=>{setMercB64(b64);setMercType(mt);setMercImg(prev);}} onClear={()=>{setMercImg(null);setMercB64(null);}} label="Déposez une facture pour en extraire les prix"/>
              {mercB64&&<button className="btn btn-gold btn-sm" style={{marginTop:10}} onClick={importerMerc} disabled={mercLoading}>{mercLoading?<><span className="spin"/>Extraction…</>:"✦ Extraire les prix"}</button>}
            </div>
          )}
          {selFourn&&(
            <div>
              <div className="row" style={{marginBottom:8}}>
                <div style={{fontSize:11,color:"var(--pt)",fontFamily:"'Playfair Display',serif"}}>{selFourn}</div>
                <span style={{fontSize:10,color:"var(--pm)"}}>{(fournisseurs[selFourn]||[]).length} produits</span>
                <button className="btn btn-sm btn-po" style={{marginLeft:"auto"}} onClick={()=>addLigne(selFourn)}>+ Ajouter</button>
              </div>
              {(fournisseurs[selFourn]||[]).length===0
                ?<div className="empty"><div className="empty-ico">📋</div><div className="empty-t">Mercuriale vide</div><div className="empty-s">Importez une facture ou ajoutez manuellement</div></div>
                :<table className="merc-table">
                  <thead><tr><th>Produit</th><th>Prix négocié</th><th>Unité</th><th>Type</th><th>Tolérance (€)</th><th></th></tr></thead>
                  <tbody>
                    {(fournisseurs[selFourn]||[]).map((l,i)=>(
                      <tr key={i}>
                        <td>{editLigne===selFourn+"-"+i+"-p"?<input className="four-inp" style={{width:"100%"}} value={l.produit} onChange={e=>updateLigne(selFourn,i,"produit",e.target.value)} onBlur={()=>setEditLigne(null)} autoFocus/>:<span style={{cursor:"pointer"}} onClick={()=>setEditLigne(selFourn+"-"+i+"-p")}>{l.produit}</span>}</td>
                        <td>{editLigne===selFourn+"-"+i+"-x"?<input className="four-inp" style={{width:80}} value={l.prix_negocie} onChange={e=>updateLigne(selFourn,i,"prix_negocie",e.target.value)} onBlur={()=>setEditLigne(null)} autoFocus/>:<span style={{cursor:"pointer",color:"var(--gold)",fontFamily:"'Playfair Display',serif"}} onClick={()=>setEditLigne(selFourn+"-"+i+"-x")}>{l.prix_negocie}€</span>}</td>
                        <td><input className="four-inp" style={{width:60}} value={l.unite} onChange={e=>updateLigne(selFourn,i,"unite",e.target.value)} placeholder="kg"/></td>
                        <td><select className="four-inp" value={l.type_prix} onChange={e=>updateLigne(selFourn,i,"type_prix",e.target.value)}><option value="fixe">Fixe</option><option value="variable">Variable</option></select></td>
                        <td><input className="four-inp" style={{width:60}} value={l.tolerance} onChange={e=>updateLigne(selFourn,i,"tolerance",e.target.value)} placeholder="0.10"/></td>
                        <td><button className="btn btn-sm btn-red" style={{padding:"1px 5px",fontSize:9}} onClick={()=>deleteLigne(selFourn,i)}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>}
            </div>
          )}
          {!selFourn&&<div className="empty"><div className="empty-ico">🏭</div><div className="empty-t">Sélectionnez un fournisseur</div><div className="empty-s">Ou créez-en un nouveau ci-dessus</div></div>}
        </div>
      )}

      {subTab==="ctrl"&&(
        <div>
          <div style={{background:"#1a1712",border:"1px solid var(--pb)",borderRadius:10,padding:"14px 16px",marginBottom:14}}>
            <div style={{fontSize:10,color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>📷 Facture à contrôler</div>
            <UploadFact image={ctrlImg} onFile={(b64,mt,prev)=>{setCtrlB64(b64);setCtrlType(mt);setCtrlImg(prev);}} onClear={()=>{setCtrlImg(null);setCtrlB64(null);setCtrlResult(null);setMsgGenere(null);}}/>
            {ctrlB64&&(
              <div className="col" style={{marginTop:10,gap:8}}>
                <select className="four-inp" value={ctrlFourn} onChange={e=>setCtrlFourn(e.target.value)}>
                  <option value="">— Fournisseur (optionnel) —</option>
                  {fournisseursList.map(f=><option key={f} value={f}>{f}</option>)}
                </select>
                <button className="btn btn-gold" onClick={analyserFacture} disabled={ctrlLoading}>{ctrlLoading?<><span className="spin"/>Analyse…</>:"🔍 Analyser la facture"}</button>
              </div>
            )}
          </div>

          {ctrlResult&&(
            <div>
              <div className="row" style={{marginBottom:10}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#f0e6d0",flex:1}}>{ctrlResult.fournisseur}</div>
                <span style={{fontSize:10,color:"var(--pm)"}}>{formatDate(ctrlResult.date)}</span>
              </div>
              <div className="row" style={{marginBottom:14,gap:7}}>
                <span className="resume-pill ok">🟢 {ctrlResult.resume.ok} OK</span>
                <span className="resume-pill warn">🔴 {ctrlResult.resume.warn} Anomalie{ctrlResult.resume.warn!==1?"s":""}</span>
                <span className="resume-pill new">🟡 {ctrlResult.resume.new} Nouveau{ctrlResult.resume.new!==1?"x":""}</span>
              </div>

              {ctrlResult.lignes.filter(l=>l.status==="warn").length>0&&(
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:"#e06060",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6,fontWeight:600}}>🔴 Anomalies de prix</div>
                  {ctrlResult.lignes.filter(l=>l.status==="warn").map((l,i)=>(
                    <div key={i} className="fact-row warn">
                      <span style={{fontSize:14}}>🔴</span>
                      <span className="fact-prod">{l.produit} {l.quantite?"("+l.quantite+")":""}</span>
                      <div style={{textAlign:"right"}}>
                        <div className="fact-prix warn">{l.prix_unitaire}€/{l.unite||"u"}</div>
                        <div className="fact-ecart warn">Négocié : {l.merc&&l.merc.prix_negocie}€ | +{l.ecart&&l.ecart.toFixed(2)}€ (+{l.ecartPct}%)</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {ctrlResult.lignes.filter(l=>l.status==="ok").length>0&&(
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:"#5a9a60",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6,fontWeight:600}}>🟢 Prix conformes</div>
                  {ctrlResult.lignes.filter(l=>l.status==="ok").map((l,i)=>(
                    <div key={i} className="fact-row ok">
                      <span style={{fontSize:14}}>🟢</span>
                      <span className="fact-prod">{l.produit} {l.quantite?"("+l.quantite+")":""}</span>
                      <div style={{textAlign:"right"}}>
                        <div className="fact-prix ok">{l.prix_unitaire}€/{l.unite||"u"}</div>
                        {l.ecart!==undefined&&l.ecart<0&&<div className="fact-ecart ok">{l.ecart.toFixed(2)}€ ({l.ecartPct}%)</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {ctrlResult.lignes.filter(l=>l.status==="new").length>0&&(
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:"#c8a96e",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6,fontWeight:600}}>🟡 Non référencés</div>
                  {ctrlResult.lignes.filter(l=>l.status==="new").map((l,i)=>(
                    <div key={i} className="fact-row new">
                      <span style={{fontSize:14}}>🟡</span>
                      <span className="fact-prod">{l.produit} {l.quantite?"("+l.quantite+")":""}</span>
                      <span className="fact-prix new">{l.prix_unitaire}€/{l.unite||"u"}</span>
                    </div>
                  ))}
                  {ctrlFourn&&<button className="btn btn-sm btn-po" style={{marginTop:8,fontSize:10}} onClick={()=>{
                    const nouvelles=ctrlResult.lignes.filter(l=>l.status==="new").map(l=>({produit:l.produit,prix_negocie:l.prix_unitaire||"",unite:l.unite||"",type_prix:"variable",tolerance:"0.10"}));
                    saveMerc({...fournisseurs,[ctrlFourn]:[...(fournisseurs[ctrlFourn]||[]),...nouvelles]});
                    setToast("✓ "+nouvelles.length+" produit(s) ajoutés à la mercuriale");
                  }}>+ Ajouter à la mercuriale de {ctrlFourn}</button>}
                </div>
              )}

              {ctrlResult.resume&&ctrlResult.resume.warn>0&&(
                <div style={{marginTop:16,background:"#1a1712",border:"1px solid var(--pb)",borderRadius:10,padding:"14px 16px"}}>
                  <div style={{fontSize:10,color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:10,fontWeight:600}}>✉ Contacter le fournisseur</div>
                  <div className="row" style={{marginBottom:10,gap:7}}>
                    <input className="four-inp" style={{flex:1}} placeholder="Email du fournisseur…" value={ctrlFournEmail} onChange={e=>setCtrlFournEmail(e.target.value)}/>
                    <input className="four-inp" style={{width:130}} placeholder="WhatsApp (+336…)" value={ctrlFournTel} onChange={e=>setCtrlFournTel(e.target.value)}/>
                  </div>
                  <div className="row" style={{gap:7,flexWrap:"wrap"}}>
                    <button className="btn btn-po btn-sm" onClick={()=>genererMessage("explication")} disabled={!!msgLoading}>{msgLoading==="explication"?<><span className="spin"/>Rédaction…</>:"💬 Demande d'explication"}</button>
                    <button className="btn btn-sm" style={{background:"#2a0e0e",border:"1px solid #5a2a1a",color:"#e08060"}} onClick={()=>genererMessage("avoir")} disabled={!!msgLoading}>{msgLoading==="avoir"?<><span className="spin"/>Rédaction…</>:"📋 Demande d'avoir"}</button>
                  </div>
                  {msgGenere&&(
                    <div style={{marginTop:14}}>
                      <div style={{fontSize:10,color:"var(--pm)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:4}}>{msgGenere.type==="avoir"?"Demande d'avoir":"Demande d'explication"}</div>
                      <div style={{fontSize:11,color:"var(--pm)",marginBottom:6}}>Objet : {msgGenere.sujet}</div>
                      <textarea className="ta" value={msgGenere.texte} onChange={e=>setMsgGenere({...msgGenere,texte:e.target.value})} rows={8} style={{fontSize:11,lineHeight:1.7,marginBottom:10}}/>
                      <div className="row" style={{gap:7,flexWrap:"wrap"}}>
                        {ctrlFournEmail&&<a href={"mailto:"+ctrlFournEmail+"?subject="+encodeURIComponent(msgGenere.sujet)+"&body="+encodeURIComponent(msgGenere.texte)} className="btn btn-gold btn-sm" style={{textDecoration:"none"}}>📧 Ouvrir dans mon mail</a>}
                        {ctrlFournTel&&<a href={"https://wa.me/"+ctrlFournTel.replace(/[^0-9+]/g,"")+"?text="+encodeURIComponent(msgGenere.texte.slice(0,1500))} target="_blank" rel="noreferrer" className="btn btn-sm" style={{background:"#0a3a1a",border:"1px solid #1a5a2a",color:"#5aca7a",textDecoration:"none"}}>💬 WhatsApp</a>}
                        <button className="btn btn-sm btn-po" onClick={()=>{navigator.clipboard&&navigator.clipboard.writeText(msgGenere.texte);setToast("✓ Message copié");}}>📋 Copier</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!ctrlB64&&<div className="empty"><div className="empty-ico">🔍</div><div className="empty-t">Aucune facture chargée</div><div className="empty-s">Déposez une photo de facture pour lancer le contrôle</div></div>}
        </div>
      )}

      {subTab==="hist"&&(
        <div>
          {histFact.length===0&&<div className="empty"><div className="empty-ico">🕐</div><div className="empty-t">Aucune analyse</div><div className="empty-s">Vos contrôles apparaîtront ici</div></div>}
          {histFact.map((entry,i)=>(
            <div key={i} className="hist-fact">
              <div className="row">
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,color:"#e0d0bc"}}>{entry.fournisseur}</div>
                  <div style={{fontSize:10,color:"var(--pm)",marginTop:1}}>{formatDate(entry.date)} · {entry.resume&&entry.resume.total} produits</div>
                </div>
              </div>
              <div className="resume-pills">
                {entry.resume&&entry.resume.warn>0&&<span className="resume-pill warn">🔴 {entry.resume.warn} anomalie{entry.resume.warn!==1?"s":""}</span>}
                {entry.resume&&entry.resume.ok>0&&<span className="resume-pill ok">🟢 {entry.resume.ok} conforme{entry.resume.ok!==1?"s":""}</span>}
                {entry.resume&&entry.resume.new>0&&<span className="resume-pill new">🟡 {entry.resume.new} nouveau{entry.resume.new!==1?"x":""}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── HOME : RECIPE ───────────────────────────────────────────────────── */
function scaleQty(s, ratio) {
  if(!s||ratio===1) return s;
  return s.replace(/(\d+([.,]\d+)?)/g, m=>{
    const n=parseFloat(m.replace(",","."));
    if(isNaN(n)) return m;
    const sc=n*ratio;
    const r=Math.abs(sc-Math.round(sc))<0.05?Math.round(sc):parseFloat(sc.toFixed(1));
    return String(r).replace(".",",");
  });
}

function HomeRecipe({recipe,onReset,fromCache=false}) {
  const base=parseInt(recipe&&recipe.portions)||1;
  const [portions,setPortions]=useState(base);
  if(!recipe) return null;
  const ratio=portions/base;
  const eco=recipe.cout_maison&&recipe.cout_livraison?(parseFloat(recipe.cout_livraison)-parseFloat(recipe.cout_maison)).toFixed(2):null;
  return (
    <div style={{paddingBottom:36}}>
      <div className="row" style={{marginBottom:14}}>
        <button className="btn btn-hmo btn-sm" onClick={onReset}>← Retour</button>
        {fromCache&&<span className="cache-badge">⚡ Cache instantané</span>}
      </div>
      <div style={{background:"linear-gradient(135deg,#e8ddd0,#f0ebe0)",borderRadius:14,padding:"16px 18px",marginBottom:12,border:"1px solid var(--hbr)"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"#2a1e16",marginBottom:5}}>{recipe.nom}</div>
        {recipe.niveau&&<span style={{fontSize:10,color:"var(--ha)",background:"rgba(184,112,96,.1)",padding:"3px 10px",borderRadius:20,letterSpacing:".04em"}}>{recipe.niveau}</span>}
        {recipe.description&&<p style={{fontSize:13,color:"#7a6860",marginTop:8,lineHeight:1.6,fontStyle:"italic"}}>{recipe.description}</p>}
      </div>
      <div className="meta-row">
        {recipe.temps_prep&&<div className="meta-pill"><div className="meta-lbl">Préparation</div><div className="meta-val">⏱ {recipe.temps_prep}</div></div>}
        {recipe.temps_cuisson&&<div className="meta-pill sage"><div className="meta-lbl">Cuisson</div><div className="meta-val">🔥 {recipe.temps_cuisson}</div></div>}
        {recipe.difficulte&&<div className="meta-pill lav"><div className="meta-lbl">Difficulté</div><div className="meta-val">{recipe.difficulte}</div></div>}
        <div className="meta-pill but" style={{display:"flex",alignItems:"center",gap:8}}>
          <div>
            <div className="meta-lbl">Portions</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <button className="port-hm-btn" style={{width:22,height:22,fontSize:13}} onClick={()=>setPortions(Math.max(1,portions-1))}>−</button>
              <span className="meta-val">{portions}</span>
              <button className="port-hm-btn" style={{width:22,height:22,fontSize:13}} onClick={()=>setPortions(portions+1)}>+</button>
            </div>
          </div>
          {ratio!==1&&<span style={{fontSize:10,color:"var(--ha)",fontWeight:600}}>×{ratio%1===0?ratio:ratio.toFixed(1)}</span>}
        </div>
      </div>
      {recipe.cout_maison&&(
        <div className="cost-box">
          <div className="cost-col"><div className="cost-lbl">Fait maison</div><div className="cost-val">{recipe.cout_maison}</div></div>
          {recipe.cout_livraison&&<><div className="cost-vs">vs</div><div className="cost-col"><div className="cost-lbl">Livraison</div><div className="cost-val">{recipe.cout_livraison}</div></div></>}
          {eco&&<div className="cost-col"><div className="cost-lbl">Économie</div><div className="cost-val green">−{eco}€</div></div>}
        </div>
      )}
      {recipe.ingredients&&recipe.ingredients.length>0&&(
        <div className="r-block">
          <div className="r-block-t">🧂 Ingrédients</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:5}}>
            {recipe.ingredients.map((ing,i)=>{
              const nom=typeof ing==="string"?ing:(ing.nom||"");
              const qty=typeof ing==="string"?"":(ing.quantite||"");
              return <div key={i} style={{background:"var(--hr)",borderRadius:9,padding:"7px 10px",border:"1px solid var(--hbr)"}}>
                <div style={{fontSize:11,color:"var(--ha)",fontWeight:600,marginBottom:1}}>{scaleQty(qty,ratio)}</div>
                <div style={{fontSize:12,color:"var(--ht)"}}>{nom}</div>
              </div>;
            })}
          </div>
        </div>
      )}
      {recipe.etapes&&recipe.etapes.length>0&&(
        <div className="r-block">
          <div className="r-block-t">👨‍🍳 Préparation</div>
          {recipe.etapes.map((step,i)=>(
            <div key={i} className="step-row">
              <div className="step-n">{i+1}</div>
              <div className="step-t">{ratio===1?step:scaleQty(step,ratio)}</div>
            </div>
          ))}
        </div>
      )}
      {recipe.liste_courses&&recipe.liste_courses.length>0&&(
        <div className="r-block">
          <div className="r-block-t">🛒 Liste de courses</div>
          {recipe.liste_courses.map((item,i)=>(
            <div key={i} className="ing-row">
              <span style={{fontSize:10,color:"var(--hm)",minWidth:90}}>{item.rayon||"🏪"}</span>
              <span style={{flex:1,fontSize:12}}>{item.produit}</span>
              {item.quantite&&<span style={{fontSize:11,color:"var(--ha)",fontWeight:500}}>{scaleQty(item.quantite,ratio)}</span>}
            </div>
          ))}
        </div>
      )}
      {recipe.astuces&&recipe.astuces.length>0&&(
        <div className="r-block" style={{background:"var(--hbu)",border:"1px solid #e0d8a8"}}>
          <div className="r-block-t" style={{color:"#8a7848"}}>💡 Astuces</div>
          {recipe.astuces.map((t,i)=>(
            <div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:i<recipe.astuces.length-1?"1px solid rgba(200,180,100,.2)":"none"}}>
              <span style={{color:"#b8a870",flexShrink:0}}>—</span>
              <span style={{fontSize:12,color:"#5a4828",lineHeight:1.6}}>{t}</span>
            </div>
          ))}
        </div>
      )}
      {(recipe.nutrition||recipe.allergenes||recipe.alternative)&&(
        <div className="r-block" style={{background:"var(--hsg)",border:"1px solid #c8d8cc"}}>
          <div className="r-block-t" style={{color:"#4a7858"}}>💚 Infos & Santé</div>
          {recipe.nutrition&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:5,marginBottom:10}}>
              {[{l:"Calories",v:recipe.nutrition.calories_portion,c:"#b87060"},{l:"Protéines",v:recipe.nutrition.proteines,c:"#5a8a70"},{l:"Glucides",v:recipe.nutrition.glucides,c:"#6a7aaa"},{l:"Lipides",v:recipe.nutrition.lipides,c:"#a07060"},{l:"Fibres",v:recipe.nutrition.fibres,c:"#7a8a6a"}].filter(x=>x.v).map((x,j)=>(
                <div key={j} style={{background:"#fff",border:"1px solid var(--hbr)",borderRadius:9,padding:"7px 8px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:"var(--hm)",textTransform:"uppercase",marginBottom:2}}>{x.l}</div>
                  <div style={{fontSize:13,fontWeight:600,color:x.c}}>{x.v}</div>
                </div>
              ))}
            </div>
          )}
          {recipe.allergenes&&recipe.allergenes.length>0&&(
            <div style={{marginBottom:8}}>
              <div style={{fontSize:10,color:"#4a7858",textTransform:"uppercase",letterSpacing:".07em",marginBottom:5,fontWeight:600}}>Allergènes</div>
              {recipe.allergenes.map((a,j)=><span key={j} className="allergen">{ALLERGEN_ICONS[a]||"⚠"} {a}</span>)}
            </div>
          )}
          {recipe.alternative&&(
            <div>
              <div style={{fontSize:10,color:"#4a7858",textTransform:"uppercase",letterSpacing:".07em",marginBottom:4,fontWeight:600}}>Alternative</div>
              <div style={{fontSize:12,color:"#2a4a38",lineHeight:1.6,background:"#fff",borderRadius:7,padding:"8px 11px",border:"1px solid var(--hbr)"}}>{recipe.alternative}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── MODE HOME ────────────────────────────────────────────────────────── */
const LEVELS=[
  {id:"debutant",cls:"deb",ico:"🌱",label:"Débutant",sub:"Recettes simples"},
  {id:"intermediaire",cls:"int",ico:"🍳",label:"Cuisinier",sub:"Un peu d'expérience"},
  {id:"avance",cls:"adv",ico:"✨",label:"Passionné",sub:"Techniques avancées"},
];

function ModeHome({onSwitch}) {
  const [view,setView]=useState("new");
  const [inputTab,setInputTab]=useState(0);
  const [image,setImage]=useState(null);
  const [imageB64,setImageB64]=useState(null);
  const [imageType,setImageType]=useState("image/jpeg");
  const [platTxt,setPlatTxt]=useState("");
  const [ingsTxt,setIngsTxt]=useState("");
  const [level,setLevel]=useState("intermediaire");
  const [portions,setPortions]=useState(2);
  const [drag,setDrag]=useState(false);
  const [loading,setLoading]=useState(false);
  const [recipe,setRecipe]=useState(null);
  const [fromCache,setFromCache]=useState(false);
  const [toast,setToast]=useState(null);
  const [history,setHistory]=useState([]);
  const [histLoading,setHistLoading]=useState(false);
  const [confirmDel,setConfirmDel]=useState(null);
  const [currentId,setCurrentId]=useState(null);
  const fileRef=useRef();

  useEffect(()=>{
    setHistLoading(true);
    userList("bn_home_").then(async keys=>{
      const items=await Promise.all(keys.map(k=>userGet(k)));
      setHistory(items.filter(Boolean).sort((a,b)=>new Date(b.date)-new Date(a.date)));
      setHistLoading(false);
    });
  },[]);

  const handleFile=(file)=>{
    if(!file)return;
    const mt=file.type||"image/jpeg";
    const reader=new FileReader();
    reader.onload=e=>{setImage(e.target.result);setImageB64(e.target.result.split(",")[1]);setImageType(mt);};
    reader.readAsDataURL(file);
  };

  const canSubmit=(imageB64||platTxt.trim()||(inputTab===1&&ingsTxt.trim()))&&!loading;

  const handleGenerate=async()=>{
    setLoading(true);setToast(null);setRecipe(null);setFromCache(false);
    const to=setTimeout(()=>{setToast("L'IA ne répond pas. Vérifiez votre connexion.");setLoading(false);},35000);
    try{
      const slug=inputTab===0&&platTxt.trim()&&!imageB64?makeSlug(platTxt):"";
      const cached=slug?await cacheGet(slug):null;
      if(cached){
        setRecipe(cached.data);setFromCache(true);
        const id="bn_home_"+Date.now();
        const entry={id,date:new Date().toISOString(),favori:false,recipe:cached.data,slug};
        await userSave(id,entry);setCurrentId(id);setHistory(prev=>[entry,...prev]);
      } else {
        let userContent;
        if(inputTab===0){
          userContent=imageB64
            ?[{type:"image",source:{type:"base64",media_type:imageType,data:imageB64}},{type:"text",text:platTxt.trim()?"Plat : "+platTxt:"Identifie ce plat et génère la recette."}]
            :[{type:"text",text:"Génère la recette pour : "+platTxt}];
        } else {
          userContent=[{type:"text",text:"Avec ces ingrédients : "+ingsTxt+". Crée le meilleur plat possible."}];
        }
        const sys="Tu es chef cuisinier et nutritionniste professionnel. Recette pour "+portions+" personne(s), niveau "+level+'. JSON UNIQUEMENT (sans texte ni markdown) : {"nom":"...","description":"phrase courte","niveau":"Debutant|Intermediaire|Avance","difficulte":"Facile|Moyen|Technique","temps_prep":"15 min","temps_cuisson":"20 min","portions":"'+portions+'","cout_maison":"8.50€","cout_livraison":"25.00€","ingredients":[{"nom":"...","quantite":"..."}],"etapes":["Etape courte et directe."],"liste_courses":[{"rayon":"Fruits et Legumes","produit":"...","quantite":"..."}],"astuces":["Astuce 1"],"nutrition":{"calories_portion":"450 kcal","proteines":"28g","glucides":"35g","lipides":"18g","fibres":"4g"},"allergenes":["Gluten"],"alternative":"Version legere ou vegetarienne"}. Etapes courtes, directes, imperatives. Zero commentaire.';
        const r=await callAI([{role:"user",content:userContent}],sys,3000);
        const parsed=robustParse(r);
        setRecipe(parsed);
        if(slug) await cacheSave(slug,parsed.nom||platTxt,parsed);
        const id="bn_home_"+Date.now();
        const entry={id,date:new Date().toISOString(),favori:false,recipe:parsed,slug};
        await userSave(id,entry);setCurrentId(id);setHistory(prev=>[entry,...prev]);
      }
    }catch(e){setToast("Erreur : "+e.message);}
    clearTimeout(to);setLoading(false);
  };

  const toggleFav=async(id)=>{
    const entry=history.find(h=>h.id===id);if(!entry)return;
    const upd={...entry,favori:!entry.favori};
    await userSave(id,upd);setHistory(prev=>prev.map(h=>h.id===id?upd:h));
  };
  const doDelete=async()=>{
    if(!confirmDel)return;
    await userDelete(confirmDel.id);setHistory(prev=>prev.filter(h=>h.id!==confirmDel.id));setConfirmDel(null);
  };

  return (
    <div style={{background:"var(--hb)",minHeight:"100vh"}}>
      {confirmDel&&<ConfirmModal mode="home" message={"Supprimer \""+confirmDel.nom+"\" ?"} onConfirm={doDelete} onCancel={()=>setConfirmDel(null)}/>}
      {toast&&<Toast msg={toast} onClose={()=>setToast(null)} home/>}
      <div className="hdr-hm">
        <div className="hdr-hm-top">
          <div className="hdr-hm-brand">Brigade <em>Numérique</em></div>
          <button className="hdr-hm-sw" onClick={onSwitch}>Mode Pro 👨‍🍳</button>
        </div>
        {!recipe&&(
          <div className="hdr-hm-hero">
            <div className="hdr-hm-t">Votre <em>chef personnel.</em><br/><strong>Dans votre poche.</strong></div>
            <div className="hdr-hm-s">Photo, nom ou ingrédients — votre recette complète en quelques secondes.</div>
          </div>
        )}
      </div>
      <div style={{maxWidth:620,margin:"0 auto",padding:"20px 16px 50px"}}>
        {recipe?(
          <div>
            <div className="row" style={{marginBottom:12}}>
              <button className="btn btn-hmo btn-sm" onClick={()=>{setRecipe(null);setCurrentId(null);}}>← Nouvelle recette</button>
              <button style={{background:"none",border:"none",fontSize:18,cursor:"pointer",padding:0}} onClick={()=>currentId&&toggleFav(currentId)}>
                {history.find(h=>h.id===currentId)&&history.find(h=>h.id===currentId).favori?"⭐":"☆"}
              </button>
              {fromCache&&<span className="cache-badge">⚡ Cache</span>}
            </div>
            <HomeRecipe recipe={recipe} onReset={()=>{setRecipe(null);setCurrentId(null);}} fromCache={fromCache}/>
          </div>
        ):(
          <div>
            <div className="view-tabs">
              <button className={"view-tab"+(view==="new"?" on":"")} onClick={()=>setView("new")}>✦ Nouvelle recette</button>
              <button className={"view-tab"+(view==="history"?" on":"")} onClick={()=>setView("history")}>🕐 Historique {history.length>0&&"("+history.length+")"}</button>
            </div>
            {view==="new"&&(
              <div>
                <div className="input-tabs">
                  <button className={"input-tab"+(inputTab===0?" on":"")} onClick={()=>setInputTab(0)}>📷 Photo ou nom</button>
                  <button className={"input-tab"+(inputTab===1?" on":"")} onClick={()=>setInputTab(1)}>🥕 Mes ingrédients</button>
                </div>
                {inputTab===0&&(
                  <div className="col" style={{marginBottom:14}}>
                    <div className={"upload-zhm"+(drag?" drag":"")}
                      onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
                      onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);}}
                      onClick={()=>!imageB64&&fileRef.current.click()}>
                      <input ref={fileRef} type="file" accept="image/*" onChange={e=>handleFile(e.target.files[0])} style={{pointerEvents:"none"}}/>
                      {image?<img src={image} alt="plat" className="prev-img" style={{borderRadius:8}}/>:<>
                        <div style={{fontSize:30,marginBottom:8}}>📸</div>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#5a3a28",marginBottom:4}}>Déposez une photo de plat</div>
                        <div style={{fontSize:11,color:"var(--hm)"}}>Resto, magazine, réseaux sociaux…</div>
                      </>}
                    </div>
                    {image&&<button className="btn btn-sm btn-hmo" style={{alignSelf:"flex-start",fontSize:10}} onClick={()=>{setImage(null);setImageB64(null);}}>✕ Supprimer</button>}
                    <div className="divider div-hm">ou nommez le plat</div>
                    <input className="inp-hm" placeholder="Ex : Bœuf bourguignon, Ramen, Bobun…" value={platTxt} onChange={e=>setPlatTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&canSubmit&&handleGenerate()}/>
                    {platTxt.trim()&&!imageB64&&<div style={{fontSize:10,color:"#5a9a60",marginTop:2}}>⚡ Si déjà en cache → chargement instantané</div>}
                  </div>
                )}
                {inputTab===1&&(
                  <div className="col" style={{marginBottom:14}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#4a2e28",marginBottom:7}}>Qu'avez-vous sous la main ?</div>
                    <textarea className="ta-hm" placeholder="poulet, courgettes, ail, parmesan, crème fraîche…" value={ingsTxt} onChange={e=>setIngsTxt(e.target.value)} rows={4}/>
                    <div style={{fontSize:11,color:"var(--hm)"}}>L'IA crée le meilleur plat avec vos ingrédients.</div>
                  </div>
                )}
                <div style={{marginBottom:12}}>
                  <div className="level-lbl">Niveau en cuisine</div>
                  <div className="level-sel">
                    {LEVELS.map(l=>(
                      <button key={l.id} className={"level-btn"+(level===l.id?" on "+l.cls:"")} onClick={()=>setLevel(l.id)}>
                        <span className="level-btn-ico">{l.ico}</span>
                        <div className="level-btn-t">{l.label}</div>
                        <div className="level-btn-s">{l.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="port-row">
                  <div className="port-row-lbl">Pour combien de personnes ?</div>
                  <button className="port-hm-btn" onClick={()=>setPortions(Math.max(1,portions-1))}>−</button>
                  <span className="port-hm-n">{portions}</span>
                  <button className="port-hm-btn" onClick={()=>setPortions(portions+1)}>+</button>
                  <span style={{fontSize:11,color:"var(--hm)"}}>pers.</span>
                </div>
                <button className="btn btn-hm" style={{width:"100%",justifyContent:"center",padding:"13px",fontSize:14}} onClick={handleGenerate} disabled={!canSubmit}>
                  {loading?<><span className="spin"/>Votre recette arrive…</>:"✦ Créer ma recette"}
                </button>
                {loading&&<div style={{marginTop:14,padding:"13px",background:"var(--hr)",borderRadius:10,textAlign:"center",border:"1px solid var(--hbr)"}}>
                  <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:7}}><span className="ld hm"/><span className="ld hm"/><span className="ld hm"/></div>
                  <div style={{fontSize:12,color:"var(--ha)",fontFamily:"'Playfair Display',serif",fontStyle:"italic"}}>Votre second de cuisine réfléchit…</div>
                </div>}
              </div>
            )}
            {view==="history"&&(
              <div>
                {histLoading&&<Dots home text="Chargement…"/>}
                {!histLoading&&history.length===0&&<div className="empty"><div className="empty-ico" style={{color:"var(--hd)"}}>🕐</div><div className="empty-t" style={{color:"var(--hm)"}}>Aucune recette sauvegardée</div><div className="empty-s" style={{color:"var(--hd)"}}>Vos recettes apparaîtront ici</div></div>}
                {!histLoading&&history.filter(h=>h.favori).length>0&&(
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:10,color:"var(--hm)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:7,fontWeight:600}}>⭐ Favoris</div>
                    {history.filter(h=>h.favori).map(e=>(
                      <div key={e.id} className="hist-item" onClick={()=>setRecipe(e.recipe)}>
                        <div style={{flex:1}}><div className="hist-item-name">{e.recipe&&e.recipe.nom}</div><div className="hist-item-date">{formatDate(e.date)}</div></div>
                        <button style={{background:"none",border:"none",fontSize:16,cursor:"pointer"}} onClick={ev=>{ev.stopPropagation();toggleFav(e.id);}}>⭐</button>
                        <button className="btn btn-sm btn-red" style={{padding:"1px 6px",fontSize:9}} onClick={ev=>{ev.stopPropagation();setConfirmDel({id:e.id,nom:(e.recipe&&e.recipe.nom)||"cette recette"});}}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {!histLoading&&history.filter(h=>!h.favori).length>0&&(
                  <div>
                    <div style={{fontSize:10,color:"var(--hm)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:7,fontWeight:600}}>🕐 Toutes les recettes</div>
                    {history.filter(h=>!h.favori).map(e=>(
                      <div key={e.id} className="hist-item" onClick={()=>setRecipe(e.recipe)}>
                        <div style={{flex:1}}><div className="hist-item-name">{e.recipe&&e.recipe.nom}</div><div className="hist-item-date">{formatDate(e.date)}</div></div>
                        <button style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"var(--hd)"}} onClick={ev=>{ev.stopPropagation();toggleFav(e.id);}}>☆</button>
                        <button className="btn btn-sm btn-red" style={{padding:"1px 6px",fontSize:9}} onClick={ev=>{ev.stopPropagation();setConfirmDel({id:e.id,nom:(e.recipe&&e.recipe.nom)||"cette recette"});}}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MODE PRO ─────────────────────────────────────────────────────────── */
function ModePro({onSwitch}) {
  const [onglet,setOnglet]=useState(0);
  const [image,setImage]=useState(null);
  const [imageB64,setImageB64]=useState(null);
  const [imageType,setImageType]=useState("image/jpeg");
  const [texte,setTexte]=useState("");
  const [drag,setDrag]=useState(false);
  const fileRef=useRef();
  const [produits,setProduits]=useState(null);
  const [plats,setPlats]=useState(null);
  const [suggestions,setSuggestions]=useState(null);
  const [nutrition,setNutrition]=useState(null);
  const [errP,setErrP]=useState(null);
  const [errM,setErrM]=useState(null);
  const [errS,setErrS]=useState(null);
  const [errN,setErrN]=useState(null);
  const [steps,setSteps]=useState([]);
  const [analyzing,setAnalyzing]=useState(false);
  const [toast,setToast]=useState(null);
  const [savedCartes,setSavedCartes]=useState([]);
  const [showSaved,setShowSaved]=useState(false);
  const [saveMsg,setSaveMsg]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null);

  useEffect(()=>{
    userList("bn_pro_").then(async keys=>{
      const items=await Promise.all(keys.map(k=>userGet(k)));
      setSavedCartes(items.filter(Boolean).sort((a,b)=>new Date(b.date)-new Date(a.date)));
    });
  },[]);

  const handleFile=async(file)=>{
    if(!file)return;
    const ext=(file.name||"").split(".").pop().toLowerCase();
    const isImg=["jpg","jpeg","png","webp","gif","bmp","heic"].includes(ext)||file.type.startsWith("image/");
    if(isImg){
      const mt=file.type||"image/jpeg";
      const reader=new FileReader();
      reader.onload=e=>{setImage(e.target.result);setImageB64(e.target.result.split(",")[1]);setImageType(mt);};
      reader.readAsDataURL(file);
    } else {
      const reader=new FileReader();
      reader.onload=e=>{
        const content=typeof e.target.result==="string"?e.target.result:"";
        setTexte(prev=>(prev?prev+"\n\n":"")+("[Fichier : "+file.name+"]\n"+content.slice(0,15000)));
        setImage(null);setImageB64(null);
      };
      reader.readAsText(file,"UTF-8");
    }
  };

  const handleAnalyse=useCallback(async()=>{
    if(!imageB64&&!texte.trim())return;
    setAnalyzing(true);
    setProduits(null);setPlats(null);setSuggestions(null);setNutrition(null);
    setErrP(null);setErrM(null);setErrS(null);setErrN(null);setToast(null);
    setSteps([{label:"Produits",status:"act"},{label:"Fiches",status:"act"},{label:"Suggestions",status:"act"},{label:"Infos & Santé",status:"act"}]);
    const aTo=setTimeout(()=>{setToast("Délai dépassé. Vérifiez votre connexion.");setAnalyzing(false);},120000);
    const uc=imageB64
      ?[{type:"image",source:{type:"base64",media_type:imageType,data:imageB64}},{type:"text",text:texte.trim()?"Texte complémentaire :\n"+texte:"Analyse cette carte."}]
      :[{type:"text",text:texte}];
    const [rP,rL]=await Promise.allSettled([
      callAI([{role:"user",content:uc}],'Assistant culinaire. Extrais TOUS les produits groupés par catégorie. JSON : {"Categorie":[{"nom":"...","quantite":"...","notes":"..."}]}'),
      extrairePlats(uc),
    ]);
    if(rP.status==="fulfilled"){try{setProduits(robustParse(rP.value));}catch(e){setErrP(e.message);}}
    else setErrP(rP.reason&&rP.reason.message||"Erreur");
    let listePlats=[];
    if(rL.status==="fulfilled") listePlats=rL.value;
    else setErrM("Impossible d'extraire les plats : "+(rL.reason&&rL.reason.message||"Erreur"));
    setSteps([{label:"Produits",status:"done"},{label:"Fiches (0/"+listePlats.length+")",status:"act"},{label:"Suggestions",status:"act"},{label:"Infos & Santé",status:"act"}]);
    const [rF,rSugg,rNutr]=await Promise.allSettled([
      (async()=>{
        if(!listePlats.length) return [];
        const fiches=await toutesLesFiches(listePlats,uc,(done,total)=>{
          setSteps([{label:"Produits",status:"done"},{label:"Fiches ("+done+"/"+total+")",status:"act"},{label:"Suggestions",status:"act"},{label:"Infos & Santé",status:"act"}]);
        });
        return fiches;
      })(),
      callAI([{role:"user",content:uc}],'Chef gastronomique créatif. Pour CHAQUE plat, 2-3 suggestions d\'amélioration. JSON : [{"plat":"nom exact","suggestions":[{"type":"Texture","conseil":"..."}]}]',16000),
      callAI([{role:"user",content:uc}],'Nutritionniste. Pour CHAQUE plat, valeurs nutritionnelles et allergènes. JSON : [{"plat":"nom exact","calories_portion":"450 kcal","proteines":"28g","glucides":"35g","lipides":"18g","fibres":"4g","allergenes":["Gluten","Lait"],"alternative":"alternative légère"}]',16000),
    ]);
    if(rF.status==="fulfilled") setPlats(rF.value);
    else setErrM(rF.reason&&rF.reason.message||"Erreur fiches");
    if(rSugg.status==="fulfilled"){try{const s=robustParse(rSugg.value);setSuggestions(Array.isArray(s)?s:[]);}catch(e){setErrS(e.message);}}
    else setErrS(rSugg.reason&&rSugg.reason.message||"Erreur");
    if(rNutr.status==="fulfilled"){try{const n=robustParse(rNutr.value);setNutrition(Array.isArray(n)?n:[]);}catch(e){setErrN(e.message);}}
    else setErrN(rNutr.reason&&rNutr.reason.message||"Erreur");
    setSteps([{label:"Produits",status:"done"},{label:"Fiches",status:"done"},{label:"Suggestions",status:"done"},{label:"Infos & Santé",status:"done"}]);
    clearTimeout(aTo);setAnalyzing(false);
  },[imageB64,imageType,texte]);

  const saveCarte=async()=>{
    const nom="Carte du "+new Date().toLocaleDateString("fr-FR");
    const id="bn_pro_"+Date.now();
    const entry={id,nom,date:new Date().toISOString(),produits,plats,suggestions,nutrition};
    await userSave(id,entry);setSavedCartes(prev=>[entry,...prev]);
    setSaveMsg("✓ Sauvegardée");setTimeout(()=>setSaveMsg(null),2500);
  };
  const loadCarte=(entry)=>{
    setProduits(entry.produits||null);setPlats(entry.plats||null);
    setSuggestions(entry.suggestions||null);setNutrition(entry.nutrition||null);
    setShowSaved(false);setErrP(null);setErrM(null);setErrS(null);setErrN(null);
  };
  const doDeleteCarte=async()=>{
    if(!confirmDel)return;
    await userDelete(confirmDel.id);setSavedCartes(prev=>prev.filter(c=>c.id!==confirmDel.id));setConfirmDel(null);
  };
  const hasData=produits||plats||suggestions||nutrition||errP||errM||errS||errN;
  const resetAll=()=>{
    setProduits(null);setPlats(null);setSuggestions(null);setNutrition(null);
    setErrP(null);setErrM(null);setErrS(null);setErrN(null);
    setImage(null);setImageB64(null);setTexte("");setSteps([]);
  };

  return (
    <div className="app" style={{position:"relative"}}>
      {confirmDel&&<ConfirmModal mode="pro" message={"Supprimer \""+confirmDel.nom+"\" ?"} onConfirm={doDeleteCarte} onCancel={()=>setConfirmDel(null)}/>}
      {toast&&<Toast msg={toast} onClose={()=>setToast(null)}/>}
      <div className="hdr-pro">
        <button className="mode-sw" onClick={onSwitch}>Mode Maison 🏠</button>
        <div className="hdr-pro-t">Brigade Numérique</div>
        <div className="hdr-pro-s">Assistant culinaire professionnel</div>
        <div className="tabs">
          {[{l:"Produits",i:"🥩"},{l:"Mises en place",i:"👨‍🍳"},{l:"Suggestions",i:"✨"},{l:"Infos & Santé",i:"💚"},{l:"Factures",i:"🧾"}].map((t,i)=>(
            <button key={i} className={"tab"+(onglet===i?" on":"")} onClick={()=>setOnglet(i)}>
              <span className="tab-ico">{t.i}</span>{t.l}
            </button>
          ))}
        </div>
      </div>
      <div className="content">
        {!hasData&&onglet!==4&&savedCartes.length>0&&(
          <div style={{marginBottom:14}}>
            <button className="btn btn-po btn-sm" style={{marginBottom:8,fontSize:10}} onClick={()=>setShowSaved(!showSaved)}>
              📂 Cartes sauvegardées ({savedCartes.length}) {showSaved?"▴":"▾"}
            </button>
            {showSaved&&(
              <div className="saved-list">
                {savedCartes.map(entry=>(
                  <div key={entry.id} className="saved-item" onClick={()=>loadCarte(entry)}>
                    <div style={{flex:1}}>
                      <div className="saved-item-name">{entry.nom}</div>
                      <div className="saved-item-date">{formatDate(entry.date)}</div>
                    </div>
                    {entry.plats&&<span className="badge badge-g" style={{fontSize:9}}>{entry.plats.length} plats</span>}
                    <button className="btn btn-sm btn-red" style={{padding:"1px 5px",fontSize:9}} onClick={e=>{e.stopPropagation();setConfirmDel({id:entry.id,nom:entry.nom});}}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {!hasData&&onglet!==4&&(
          <div style={{marginBottom:22}}>
            <div className="col">
              <div className={"upload-z"+(drag?" drag":"")}
                onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
                onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);}}
                onClick={()=>!(imageB64||texte)&&fileRef.current.click()}>
                <input ref={fileRef} type="file" accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx,.csv,.md" onChange={e=>handleFile(e.target.files[0])} style={{pointerEvents:"none"}}/>
                {image?<img src={image} alt="Carte" className="prev-img"/>:<>
                  <div style={{fontSize:26,marginBottom:7,color:"#5a4a35"}}>📋</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,color:"#c0a880",marginBottom:4}}>Déposez votre carte ici</div>
                  <div style={{fontSize:10,color:"#6a5a45",lineHeight:1.6}}>Image, PDF, Word, Excel, texte…<br/><span style={{color:"#4a3a2a"}}>Tous formats acceptés</span></div>
                </>}
              </div>
              {image&&<button className="btn btn-sm btn-red" style={{alignSelf:"flex-start",fontSize:10}} onClick={()=>{setImage(null);setImageB64(null);}}>✕ Supprimer</button>}
              <div className="divider div-pro">ou saisissez le texte</div>
              <textarea className="ta" placeholder="Collez ici le texte de votre carte…" value={texte} onChange={e=>setTexte(e.target.value)} rows={5}/>
              <div className="row">
                <button className="btn btn-gold" onClick={handleAnalyse} disabled={analyzing||(!imageB64&&!texte.trim())}>
                  {analyzing?<><span className="spin"/>Analyse en cours…</>:"✦ Analyser la carte"}
                </button>
              </div>
            </div>
          </div>
        )}
        {analyzing&&steps.length>0&&onglet!==4&&<StepBar steps={steps}/>}
        {hasData&&!analyzing&&onglet!==4&&(
          <div className="toolbar">
            <button className="btn btn-po btn-sm" onClick={resetAll}>← Nouvelle carte</button>
            <button className="btn btn-gold btn-sm" onClick={saveCarte}>💾 Sauvegarder</button>
            <button className="btn btn-gold btn-sm" onClick={()=>{try{exportPrint(produits,plats,suggestions,nutrition);}catch(e){setToast("Erreur export : "+e.message);}}}>⬇ Exporter PDF</button>
            {saveMsg&&<span style={{fontSize:11,color:"#5a9a60"}}>{saveMsg}</span>}
            {plats&&<span className="badge badge-g">{plats.length} plats</span>}
          </div>
        )}
        {onglet===0&&<ProProduits produits={produits} setProduits={setProduits} loading={analyzing&&!produits&&!errP} error={errP}/>}
        {onglet===1&&<ProMisesEnPlace plats={plats} setPlats={setPlats} loading={analyzing&&!plats&&!errM} error={errM}/>}
        {onglet===2&&<ProSuggestions suggestions={suggestions} setSuggestions={setSuggestions} plats={plats} loading={analyzing&&!suggestions&&!errS} error={errS}/>}
        {onglet===3&&<ProInfosSante nutrition={nutrition} loading={analyzing&&!nutrition&&!errN} error={errN}/>}
        {onglet===4&&<ProFactures/>}
      </div>
    </div>
  );
}

/* ─── SPLASH ───────────────────────────────────────────────────────────── */
function Splash({onChoose}) {
  return (
    <div className="splash">
      <div className="splash-logo">Brigade Numérique</div>
      <div className="splash-sub">Votre second de cuisine intelligent</div>
      <div className="splash-cards">
        <div className="scard pro" onClick={()=>onChoose("pro")}>
          <div className="scard-ico">👨‍🍳</div>
          <div className="scard-t">Mode Pro</div>
          <div className="scard-s">Chef, cuisinier, restaurateur — gérez votre carte et vos fiches techniques</div>
        </div>
        <div className="scard home" onClick={()=>onChoose("home")}>
          <div className="scard-ico">🏠</div>
          <div className="scard-t">Mode Maison</div>
          <div className="scard-s">Cuisinez n'importe quel plat repéré, ou créez avec ce que vous avez</div>
        </div>
      </div>
    </div>
  );
}

/* ─── APP ROOT ─────────────────────────────────────────────────────────── */
export default function App() {
  const [mode,setMode]=useState(null);
  useEffect(()=>{
    document.body.className=mode==="pro"?"pro":mode==="home"?"home":"";
  },[mode]);
  return (
    <>
      <style>{FONTS+CSS}</style>
      {!mode&&<Splash onChoose={setMode}/>}
      {mode==="pro"&&<ModePro onSwitch={()=>setMode("home")}/>}
      {mode==="home"&&<ModeHome onSwitch={()=>setMode("pro")}/>}
    </>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Project, ProjectImage } from "@/lib/types";
import FormattedDescription from "./formatted-description";

export function PublicNav({sections}:{sections:string[]}){const[open,setOpen]=useState(false),[active,setActive]=useState("top");useEffect(()=>{const nodes=[document.getElementById("top"),...sections.map(id=>document.getElementById(id))].filter(Boolean) as HTMLElement[];const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)setActive(visible.target.id)},{rootMargin:"-20% 0px -65%",threshold:[0,.15,.4]});nodes.forEach(n=>observer.observe(n));return()=>observer.disconnect()},[sections]);const links=sections.map(id=>[`#${id}`,id[0].toUpperCase()+id.slice(1)]);return <nav className="nav shell" aria-label="Main navigation"><a className="brand" href="#top" aria-current={active==="top"?"page":undefined}>MikRodas</a><div className="navLinks">{links.map(([href,label])=><a key={href} href={href} className={active===href.slice(1)?"active":""} aria-current={active===href.slice(1)?"page":undefined}>{label}</a>)}<a className="navCta" href="#contact">Let&apos;s talk</a></div><div className="mobileNav"><button className="menuButton" aria-expanded={open} aria-controls="mobile-menu" onClick={()=>setOpen(!open)}><span className="srOnly">Toggle navigation</span>{open?"Close":"Menu"}</button>{open&&<div id="mobile-menu" className="mobileMenu"><a href="#top" onClick={()=>setOpen(false)}>Home</a>{links.map(([href,label])=><a key={href} href={href} aria-current={active===href.slice(1)?"page":undefined} onClick={()=>setOpen(false)}>{label}</a>)}</div>}</div></nav>}

export function ProjectGallery({projects}:{projects:Project[]}){
 const[selected,setSelected]=useState<Project|null>(null);
 const[lightboxImage,setLightboxImage]=useState<ProjectImage|null>(null);
 const[zoom,setZoom]=useState(1);
 const lightboxRef=useRef<HTMLDivElement>(null),closeRef=useRef<HTMLButtonElement>(null),triggerRef=useRef<HTMLButtonElement|null>(null);

 useEffect(()=>{if(!selected)return;document.body.classList.add("modalOpen");return()=>document.body.classList.remove("modalOpen")},[selected]);
 useEffect(()=>{if(!selected||lightboxImage)return;const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setSelected(null)};document.addEventListener("keydown",onKey);return()=>document.removeEventListener("keydown",onKey)},[selected,lightboxImage]);
 useEffect(()=>{
  if(!lightboxImage)return;
  closeRef.current?.focus();
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){event.preventDefault();event.stopPropagation();closeLightbox();return}
   if(event.key==="ArrowLeft"){event.preventDefault();showAdjacentImage(-1);return}
   if(event.key==="ArrowRight"){event.preventDefault();showAdjacentImage(1);return}
   if(event.key==="+"||event.key==="="){event.preventDefault();changeZoom(.25);return}
   if(event.key==="-"){event.preventDefault();changeZoom(-.25);return}
   if(event.key==="0"){event.preventDefault();setZoom(1);return}
   if(event.key==="Tab"){const focusable=Array.from(lightboxRef.current?.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')||[]);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
  };
  document.addEventListener("keydown",onKey,true);
  return()=>document.removeEventListener("keydown",onKey,true);
 },[lightboxImage]);

 useEffect(()=>{setZoom(1)},[lightboxImage?.id]);

 function openLightbox(image:ProjectImage,trigger:HTMLButtonElement){triggerRef.current=trigger;setLightboxImage(image)}
 function closeLightbox(){setLightboxImage(null);requestAnimationFrame(()=>triggerRef.current?.focus())}
 function showAdjacentImage(direction:-1|1){const images=selected?.portfolio_project_images||[];if(!lightboxImage||images.length<2)return;const currentIndex=images.findIndex(image=>image.id===lightboxImage.id),nextIndex=(currentIndex+direction+images.length)%images.length;setLightboxImage(images[nextIndex])}
 function changeZoom(amount:number){setZoom(current=>Math.min(3,Math.max(1,Number((current+amount).toFixed(2)))))}

 return <>
  <div className="projectGrid">{projects.map(project=>{const cover=project.portfolio_project_images?.find(i=>i.id===project.cover_image_id)||project.portfolio_project_images?.[0];return <button className="projectCard" key={project.id} onClick={()=>setSelected(project)}>{cover&&<div className="cardImage"><Image src={cover.image_url} alt={cover.alt_text} fill sizes="(max-width:760px) 100vw, 50vw"/></div>}<div className="projectCardBody"><small>{project.category}</small><h3>{project.title}</h3><div className="tags">{project.technologies?.map(tag=><span key={tag}>{tag}</span>)}</div><p>{project.short_description}</p><span className="cardAction">View project ↗</span></div></button>})}</div>
  {selected&&<div className="modalBackdrop" onMouseDown={event=>event.target===event.currentTarget&&setSelected(null)}><section className="projectModal" role="dialog" aria-modal="true" aria-labelledby="project-title"><button className="modalClose" autoFocus onClick={()=>setSelected(null)} aria-label="Close project details">×</button><small>{selected.category}</small><h2 id="project-title">{selected.title}</h2><FormattedDescription text={selected.full_description||selected.short_description}/>{selected.portfolio_project_images?.length?<div className="modalImages">{selected.portfolio_project_images.map(image=><button type="button" className="screenshotPreviewButton" key={image.id} onClick={event=>openLightbox(image,event.currentTarget)} aria-label={`Open full-size image: ${image.alt_text}`}><img src={image.image_url} alt={image.alt_text} loading="lazy"/></button>)}</div>:null}<div className="tags">{selected.technologies?.map(tag=><span key={tag}>{tag}</span>)}</div><div className="modalActions">{selected.project_url&&<a className="button primary" href={selected.project_url} target="_blank" rel="noopener noreferrer">View live ↗</a>}{selected.github_url&&<a className="button secondary" href={selected.github_url} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}</div></section></div>}
  {lightboxImage&&<div ref={lightboxRef} className="imageLightbox" role="dialog" aria-modal="true" aria-label="Screenshot preview" onMouseDown={event=>event.target===event.currentTarget&&closeLightbox()}><button ref={closeRef} type="button" className="lightboxClose" onClick={closeLightbox} aria-label="Close screenshot preview">×</button><div className="lightboxZoomControls" aria-label="Image zoom controls"><button type="button" onClick={()=>changeZoom(-.25)} disabled={zoom===1} aria-label="Zoom out">−</button><output aria-live="polite">{Math.round(zoom*100)}%</output><button type="button" onClick={()=>changeZoom(.25)} disabled={zoom===3} aria-label="Zoom in">+</button><button type="button" onClick={()=>setZoom(1)} disabled={zoom===1}>Reset</button></div>{(selected?.portfolio_project_images?.length||0)>1&&<><button type="button" className="lightboxArrow lightboxPrevious" onClick={()=>showAdjacentImage(-1)} aria-label="Previous screenshot">‹</button><button type="button" className="lightboxArrow lightboxNext" onClick={()=>showAdjacentImage(1)} aria-label="Next screenshot">›</button></>}<div className={`lightboxImageFrame${zoom>1?" isZoomed":""}`} onDoubleClick={()=>setZoom(current=>current===1?2:1)}><img src={lightboxImage.image_url} alt={lightboxImage.alt_text} style={{transform:`scale(${zoom})`}}/></div></div>}
 </>
}

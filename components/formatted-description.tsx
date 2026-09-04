import { Fragment, type ReactNode } from "react";

export default function FormattedDescription({text}:{text:string}){
 const lines=text.replace(/\r\n/g,"\n").split("\n"),content:ReactNode[]=[];
 let paragraph:string[]=[],bullets:string[]=[];
 const flushParagraph=()=>{if(paragraph.length){content.push(<p key={`p-${content.length}`}>{formatInline(paragraph.join(" "))}</p>);paragraph=[]}};
 const flushBullets=()=>{if(bullets.length){content.push(<ul key={`ul-${content.length}`}>{bullets.map((item,index)=><li key={index}>{formatInline(item)}</li>)}</ul>);bullets=[]}};
 lines.forEach(line=>{const trimmed=line.trim(),heading=trimmed.match(/^(#{1,3})\s+(.+)$/),bullet=trimmed.match(/^[-*]\s+(.+)$/);if(!trimmed){flushParagraph();flushBullets()}else if(heading){flushParagraph();flushBullets();content.push(<h3 key={`h-${content.length}`}>{formatInline(heading[2])}</h3>)}else if(bullet){flushParagraph();bullets.push(bullet[1])}else{flushBullets();paragraph.push(trimmed)}});
 flushParagraph();flushBullets();
 return <div className="projectDescription">{content}</div>
}

function formatInline(text:string){return text.split(/(\*\*.+?\*\*)/g).filter(Boolean).map((part,index)=>part.startsWith("**")&&part.endsWith("**")?<strong key={index}>{part.slice(2,-2)}</strong>:<Fragment key={index}>{part}</Fragment>)}

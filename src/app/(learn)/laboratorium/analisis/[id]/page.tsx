import {notFound} from "next/navigation";
import {pageUser} from "@/lib/auth";
import {labSubmission} from "@/lib/lab";
import {HttpError} from "@/lib/http";
import {PageHeading} from "@/components/common";
import {LabTabs} from "@/components/lab-common";
import {LabWorkspace} from "@/components/lab-workspace";
export default async function WrittenCase({params}:{params:Promise<{id:string}>}){const user=await pageUser();const{id}=await params;let submission;try{submission=await labSubmission(id,user);}catch(e){if(e instanceof HttpError&&e.status===404)notFound();throw e;}return <><PageHeading eyebrow={submission.owner?"LABORATORIUM / RUANG ANALISIS":"DOSEN / TINJAUAN BERIZIN"} title={submission.owner?"Ruang analisis kasus":"Tinjau penalaran kasus"} description="Konteks, bukti, rubrik, dan alasan berada dalam satu ruang kerja."/><LabTabs/><LabWorkspace key={submission.id} initial={submission}/></>;}

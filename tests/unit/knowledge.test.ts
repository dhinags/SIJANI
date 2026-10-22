import { describe, it, expect } from "vitest";
import { contentSchema, highlightedParts, importSchema, publicationProblems, relationInput, safeUrl, sourceFingerprint } from "../../src/lib/knowledge-model";
const entity={kind:"THEORY",title:"Test theory",summary:"Synthetic test description",content:{definition:"Definition",assumptions:"Assumptions",mechanisms:"Mechanism",applications:"Application",limitations:"Limitations"},domains:[{}],citations:[{section:"all",locator:"Section 1, fixture",verified:true,source:{status:"VERIFIED",verifiedAt:new Date()}}]};
describe("knowledge publication integrity",()=>{
 it("requires reviewed sources and explicit coverage for every populated field",()=>{
  expect(publicationProblems(entity)).toEqual([]);
  expect(publicationProblems({...entity,citations:entity.citations.map(c=>({...c,verified:false}))})).not.toEqual([]);
  expect(publicationProblems({...entity,citations:entity.citations.map(c=>({...c,source:{status:"PENDING",verifiedAt:null}}))})).not.toEqual([]);
  expect(publicationProblems({...entity,citations:entity.citations.map(c=>({...c,section:"definition"}))})).toContain("Pemetaan sumber terverifikasi untuk limitations belum ada.");
 });
 it("does not allow empty required fields or missing domains to publish",()=>{
  expect(publicationProblems({...entity,content:{definition:"Definition"}})).toContain("Mekanisme penjelasan belum diisi.");
  expect(publicationProblems({...entity,domains:[]})).toContain("Minimal satu domain diperlukan.");
  expect(publicationProblems({...entity,citations:entity.citations.map(c=>({...c,locator:"Belum diverifikasi"}))})).not.toEqual([]);
 });
 it("rejects imported approval claims, unknown fields, and invalid check keys",()=>{
  expect(importSchema.safeParse({sources:[],entities:[],relations:[],status:"PUBLISHED"}).success).toBe(false);
  expect(contentSchema.safeParse({check:{question:"Test question",options:["A","B"],correct:2,explanation:"Test explanation"}}).success).toBe(false);
  expect(contentSchema.safeParse({script:"alert(1)"}).success).toBe(false);
 });
 it("rejects self edges and unsafe source URLs",()=>{
  expect(relationInput.safeParse({id:"r",fromId:"a",toId:"a",type:"RELATED_TO",explanation:"Test relationship"}).success).toBe(false);
  for(const value of ["javascript:alert(1)","data:text/html,hello","https://user:pass@example.org/"])expect(safeUrl.safeParse(value).success).toBe(false);
  expect(safeUrl.safeParse("https://example.org/source").success).toBe(true);
 });
 it("deduplicates bibliographic metadata independently of title casing or spacing",()=>{
  expect(sourceFingerprint({title:"  Psychology   2e ",author:"A. AUTHOR",version:" Second "})).toBe(sourceFingerprint({title:"psychology 2e",author:"a. author",version:"second"}));
 });
 it("highlights literal special characters rather than treating user input as a pattern",()=>{
  expect(highlightedParts("A [test] and [TEST]", "[test]").filter(p=>p.match).map(p=>p.text)).toEqual(["[test]","[TEST]"]);
  expect(highlightedParts("A <script> token", "<script>").some(p=>p.match)).toBe(true);
 });
});

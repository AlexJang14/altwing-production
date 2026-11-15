import { ENGINEERING_MAJOR_MAP } from './engineeringMajors';
import { readJSON, readLocal, writeLocal } from '../../lib/storage';
import type { EngineeringMatchResult, EngineeringMajorId, SavedGuidance, StudentProfile } from './guidanceTypes';
const PROFILE_KEY = 'altwing-guidance-profile-v1';
const MATCH_KEY = 'altwing-engineering-match-v1';
const SELECTED_MAJOR_KEY = 'altwing-guidance-selected-major-v1';
const SAVED_KEY = 'altwing-guidance-saved-v1';
const defaultProfile: StudentProfile = {grade:'',state:'',gpa:'',sat:'',act:'',locationPreference:'ANYWHERE',budgetPreference:'ANY',interests:[]};
const defaultSaved: SavedGuidance = {collegeIds:[],opportunityIds:[],ideaIds:[]};
export function isMajor(value: unknown): value is EngineeringMajorId { return typeof value === 'string' && Object.hasOwn(ENGINEERING_MAJOR_MAP,value); }
export function readStudentProfile(): StudentProfile {
  const raw = readJSON<unknown>(PROFILE_KEY, null);
  if (!raw || typeof raw !== 'object') return {...defaultProfile,interests:[]};
  const p = raw as Record<string,unknown>;
  return {
    grade: ['9','10','11','12'].includes(String(p.grade)) ? p.grade as StudentProfile['grade'] : '',
    state: typeof p.state === 'string' ? p.state.slice(0,2).toUpperCase() : '',
    gpa: typeof p.gpa === 'string' ? p.gpa : '',sat:typeof p.sat === 'string'?p.sat:'',act:typeof p.act === 'string'?p.act:'',
    locationPreference:['ANYWHERE','NEAR_HOME','ONLINE_OK'].includes(String(p.locationPreference))?p.locationPreference as StudentProfile['locationPreference']:'ANYWHERE',
    budgetPreference:['ANY','LOW_COST','FREE_PAID'].includes(String(p.budgetPreference))?p.budgetPreference as StudentProfile['budgetPreference']:'ANY',
    interests:Array.isArray(p.interests)?p.interests.filter((x): x is string=>typeof x==='string'):[],
  };
}
export function saveStudentProfile(profile: StudentProfile) { return writeLocal(PROFILE_KEY,JSON.stringify(profile)); }
export function readEngineeringMatch(): EngineeringMatchResult | null {
  const result=readJSON<EngineeringMatchResult | null>(MATCH_KEY,null);
  return result && Array.isArray(result.rankings) && result.rankings.every(x=>x && isMajor(x.majorId) && Number.isFinite(x.signal)) ? result:null;
}
export function saveEngineeringMatch(result: EngineeringMatchResult) { return writeLocal(MATCH_KEY,JSON.stringify(result)); }
export function readSelectedMajor(): EngineeringMajorId | null { const id=readLocal(SELECTED_MAJOR_KEY);return isMajor(id)?id:null; }
export function saveSelectedMajor(majorId: EngineeringMajorId) { return writeLocal(SELECTED_MAJOR_KEY,majorId); }
export function readSavedGuidance(): SavedGuidance {
  const raw=readJSON<Partial<SavedGuidance> | null>(SAVED_KEY,null);
  const clean=(x:unknown)=>Array.isArray(x)?[...new Set(x.filter((i): i is string=>typeof i==='string'))]:[];
  return {collegeIds:clean(raw?.collegeIds),opportunityIds:clean(raw?.opportunityIds),ideaIds:clean(raw?.ideaIds)};
}
export function toggleSavedGuidance(type:keyof SavedGuidance,id:string): SavedGuidance {
  const current=readSavedGuidance();const list=current[type]??defaultSaved[type];
  const next={...current,[type]:list.includes(id)?list.filter(x=>x!==id):[...list,id]};
  writeLocal(SAVED_KEY,JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('altwing:guidance-saved'));
  return next;
}

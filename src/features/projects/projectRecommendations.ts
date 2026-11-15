import type {EngineeringMajorId} from '../guidance/guidanceTypes';
import {PROJECTS} from './projectModel';
// These links connect concepts to available starter activities; they do not
// claim that three short simulations represent every engineering discipline.
const connections:Record<EngineeringMajorId,{ids:string[];reason:string}>={
  aerospace:{ids:['cooling','solar','bridge'],reason:'Explore thermal constraints, spacecraft power, and structural tradeoffs.'},
  mechanical:{ids:['cooling','bridge','solar'],reason:'Explore heat transfer and how design variables change physical behavior.'},
  electrical:{ids:['solar','cooling','bridge'],reason:'Start with electrical power and a controlled input/output model.'},
  computer:{ids:['solar','cooling','bridge'],reason:'Use an input/output model as a starting point for sensing and control questions.'},
  chemical:{ids:['cooling','solar','bridge'],reason:'Explore how a rate constant changes a process over time.'},
  biomedical:{ids:['cooling','bridge','solar'],reason:'Practice thermal and structural reasoning before exploring biomedical applications.'},
  civil:{ids:['bridge','cooling','solar'],reason:'Explore structural stiffness, material use, and infrastructure tradeoffs.'},
  industrial:{ids:['bridge','solar','cooling'],reason:'Compare performance and resource use under a fixed set of assumptions.'},
  materials:{ids:['bridge','cooling','solar'],reason:'Start with geometry and thermal behavior; material properties are a next question.'},
  environmental:{ids:['solar','cooling','bridge'],reason:'Explore energy conversion and the limits of a simplified environmental model.'},
  nuclear:{ids:['cooling','solar','bridge'],reason:'Practice heat-transfer reasoning before investigating more specialized energy systems.'},
  robotics:{ids:['solar','bridge','cooling'],reason:'Practice changing one control input and interpreting the system response.'},
  software:{ids:['solar','cooling','bridge'],reason:'Use reproducible model inputs and outputs to practice testing assumptions.'},
  petroleum:{ids:['cooling','bridge','solar'],reason:'Explore rate-based modeling and the tradeoffs in physical engineering systems.'},
};
export function recommendProjects(rankings:Array<{majorId:EngineeringMajorId}>) {
  const first=rankings.find(x=>Object.hasOwn(connections,x.majorId));
  if(!first)return PROJECTS.map(project=>({project,reason:'A browser-based starting point. No application or equipment needed.'}));
  const connection=connections[first.majorId];
  return connection.ids.flatMap(id=>{const project=PROJECTS.find(p=>p.id===id);return project?[{project,reason:connection.reason}]:[];});
}

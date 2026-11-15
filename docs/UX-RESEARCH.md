# AltWing UX research and implementation direction

Reviewed October 25, 2026. Sources below are the products’ own websites and documentation. “Observed” refers to published content, including official descriptions of their interfaces; this was not a usability study or a full signed-in product audit. Recommendations are design inferences for AltWing and need validation in the actual build.

## 1. Show the product promise through an action

**Observed:** Brilliant’s coding landing page leads with “Learn coding by doing,” an illustrated learning area, and a clear start action. It describes interactive lessons and practice connected to progress. [Brilliant coding](https://brilliant.org/topics/coding/)

**AltWing implementation inference:** Make the first screen a striking engineering launch scene with the existing penguin, visible planets, and the message “Discover your engineering direction. Build something that proves it.” One primary action: “Find My Wing.” A secondary action: “Explore engineering.” Show the four-step journey immediately beneath, rather than starting with a large catalogue of unrelated features. Keep the visual meaningful: selectable orbital destinations can correspond to actual sections.

## 2. Use a predictable wayfinding vocabulary

**Observed:** NASA Space Place exposes familiar subject names—Earth, Sun, Solar System, Universe, Science and Tech—and separate content types such as Games, Crafts, Activities, Videos, and Glossary. Those same subject categories appear on its games page. [Space Place home](https://spaceplace.nasa.gov/), [Space Place games](https://spaceplace.nasa.gov/en/menu/games/)

**AltWing implementation inference:** Use one shared navigation shell on every route. Place the AltWing penguin wordmark at the left as a home link, never as a centered page title. Suggested ordered destinations: Find My Wing → Explore Engineering → Build Projects → Colleges & Programs. Add My Universe and Site Map as secondary destinations. Keep the navigation visible in quiz results, project activities, aerospace labs, and reward screens. Use the same names in menu, page heading, breadcrumbs, and buttons. This addresses the current mismatch between menu expectation and destination.

## 3. Offer a route through the product, while preserving choice

**Observed:** Duolingo’s official redesign explanation describes a step-by-step path, smaller units, guidebooks, practice integrated into the path, and characters accompanying learners. Its FAQ explains that labels became more descriptive, for example naming a communication goal instead of an opaque unit number. [Duolingo home-screen redesign](https://blog.duolingo.com/new-duolingo-home-screen-design/)

**AltWing implementation inference:** Show the same four steps on the home page and section headers. Indicate “You are here” and provide a specific next action at the end of each stage. The order guides beginners; browsing should stay available without forcing quiz completion. Replace “My Counselor” with “Colleges & Programs,” because that destination contains searches, opportunities, and planning tools rather than an actual counselor conversation.

## 4. Explain what will happen before asking learners to act

**Observed:** Khan Academy’s self-paced Mastery documentation describes cards before activities with question counts, and cards afterward that explain progress changes and may recommend lessons. Its course/unit screens distinguish overall progress from individual skills. [Khan Academy self-paced Mastery](https://support.khanacademy.org/hc/en-us/articles/360007253831-Using-self-paced-practice-and-Mastery-in-the-classroom)

**AltWing implementation inference:** After WingMatch, show a short “Your next steps” tutorial: understand the recommendation, explore a field, try one guided project, then save or compare programs. Include a dismiss button and a persistent “How this works” entry to replay it. Before each project, explain what the learner changes, what the model measures, what they will produce, and that no prior engineering knowledge is required. Show the saved work and next action afterward. Label progress as exploration/completion, not verified engineering mastery.

## 5. Give each project a concrete purpose and destination

**Observed:** NASA’s games list combines a distinct activity title with a one-sentence task: communicating with spacecraft, photographing an eclipse, or moving a submarine using heat and salt. [Space Place games](https://spaceplace.nasa.gov/en/menu/games/)

**AltWing implementation inference:** Replace abstract or duplicated project links with visible tasks: “Power a solar station,” “Keep a habitat cool,” and “Strengthen a bridge.” Each card should open its own model and preserve its own state. Explain the workflow consistently: Predict → Change one setting → Test → Compare → Reflect. Separate the guided starter-project collection from aerospace labs so different labels never conceal the same destination.

## 6. Make the mascot a dependable guide

**Observed:** Duolingo explicitly identifies its mascot, Duo, as part of its motivation approach and its official path explanation includes recurring characters. [Duolingo homepage](https://www.duolingo.com/), [Duolingo redesign](https://blog.duolingo.com/new-duolingo-home-screen-design/)

**AltWing implementation inference:** Use one canonical penguin asset for the logo, hero, real loading fallback, beginner tips, and completion moments. Keep its silhouette and colors stable; vary pose or context rather than replacing the identity. A loading state should have readable status text and reduced-motion support. Do not introduce an artificial delay merely to show the mascot. The penguin should clarify or celebrate an action without obscuring navigation.

## 7. Make rewards visible, comprehensible, and connected to work

**Observed:** NASA’s official interactives directory describes visible solar-system exploration with planets, moons, spacecraft, and explicit “Start Exploring” actions. Brilliant’s current homepage emphasizes visual progress and identifying what to do next. [NASA interactives](https://www.nasa.gov/interactives/), [Brilliant homepage](https://brilliant.org/)

**AltWing implementation inference:** My Universe should render actual planet objects immediately after opening a pack. Show the planet name, visual, rarity or category if applicable, what earned it, and an action to return to learning. Keep opened planets visible in a collection after closing the reveal. Provide an explicit empty state before the first reward. Test pack open → reveal → collection update → refresh persistence; a counter changing alone does not fulfill the reward promise.

## Release acceptance checks

- Logo position and navigation order remain identical across every top-level and deep route.
- Every navigation label predicts its page title; every distinct project card has its own correct destination.
- A new visitor can identify the first action and understand the four-step journey without learning brand terminology.
- WingMatch completion offers a tutorial, a recommended next step, and free browsing.
- Opening a universe pack visibly reveals a planet and stores it after refresh.
- Keyboard focus, narrow-screen menus, reduced motion, and loading fallbacks remain usable.

"use strict";

(() => {
  // Official schedule facts: ID, exact title, October day, start/end (Pacific), room, speakers, format, level.
  // Source slugs were checked against every corresponding link in the official sessions index.
  const facts = [
    [8741,"Agentic Governance: Secure, Govern, and Operate Your Power Platform at Scale",29,"12:00","13:00","Premier BR 316",["Lane Swenka","Gregg Barker","Reza Dorrani","Sanket Vasa"],"S","Intermediate (200)"],
    [8905,"Beyond Chat: Extending Copilot Cowork with Custom Plugins and Workflows",29,"10:45","11:45","Premier BR 318",["Giorgio Ughini","Alicja Gilderdale"],"R","Advanced (300)"],
    [8870,"Beyond Time Savings: Rethinking ROI and Value for Persistent AI Agents",29,"14:30","15:30","Room 353",["Samantha Neufeld","Matthew LeHew","Dino Ilic","Niyonika Chhabra","Taiki Yoshida","Em D'Arcy","Catherine Chambers"],"R","Foundational (100)"],
    [8902,"Beyond the CRM Screen: Headless CRM in the Age of Copilot",27,"11:45","12:45","Premier BR 311",["Dustin Hoyte","Akhil Tadakamalla","Alan Ross","Duke Mocanu"],"S",""],
    [8770,"Build Fast, Govern Better: The Latest in Power Apps code apps and Copilot Managed Runtime for devs",29,"12:00","13:00","Boulevard Ballroom 163",["Jordan Chodak","Ryan Jansen","Austin Laugesen","Alan Castellanos Moreno"],"S","Advanced (300)"],
    [8862,"Building your agentic enterprise with agents, workflows and autopilots in the new Copilot Studio",29,"12:00","13:00","Room 351",["Giorgio Ughini","Roel Schenk","Rahul Ranjit Kannathusseril","Doug Bellingeri"],"R","Intermediate (200)"],
    [8863,"Copilot Cowork Ate My Agent: When Building Becomes Prompting",28,"15:30","16:30","Room 353",["Dan Stevenson","Sathya Raveendran","Ishaan Mirchandani"],"R","Intermediate (200)"],
    [8908,"Delegate It to Cowork: From Meeting to Working App, Agent, and Flow",27,"16:00","17:00","Boulevard Ballroom 162",["Bas Brekelmans","Pratyusha Avadhanula"],"S","Intermediate (200)"],
    [8691,"Demystifying Copilot Studio Licensing",27,"14:00","15:00","Grand Ballroom 116",["Haniel Croitoru"],"S","Foundational (100)"],
    [8881,"Demystifying Debugging in AI (Testing and Evals for Agents and Workflows)",29,"14:30","15:30","Room 354",["Natasha Eibich","Saakshi Goel"],"R","Foundational (100)"],
    [8792,"Driving Adoption: Copilot, Cowork, Agents and Copilot Studio",28,"11:30","12:30","Premier BR 319",["Karuana Gatimu","Bryan Wofford"],"S","Foundational (100)"],
    [8760,"Exec Panel: The Token Meter Is Running, What It Takes to Get Max ROI from AI Agents",27,"14:00","15:00","Premier BR 319",["Srini Raghavan"],"S","Intermediate (200)"],
    [8850,"Expanding Agents with Connectors and MCPs",27,"14:00","15:00","Room 351",["Sabin Nair","Mankirat Kaur Bajwa","Rohith Chetla","Jennifer Bost"],"R","Intermediate (200)"],
    [8909,"Extend Copilot Cowork: Build and Ship a Plugin in 45 Minutes",28,"11:30","12:30","Boulevard Ballroom 162",["Bas Brekelmans","Pratyusha Avadhanula"],"S","Advanced (300)"],
    [8775,"Extending Copilot Cowork with Custom Plugins and Workflows with Real-World Customer Use Cases",29,"14:30","15:30","Premier BR 316",["Giorgio Ughini","Alicja Gilderdale"],"S","Advanced (300)"],
    [8849,"From Agent Pilots to Business Value: Proving ROI at Scale",28,"15:30","16:30","Room 352",["Ravi Chada","Gopikrishna V","Alicja Gilderdale","Niyonika Chhabra"],"R","Foundational (100)"],
    [8749,"From Laptop to Governed Production: Creating and Running a Hosted Managed Agent",29,"12:00","13:00","Chairman's BR 370",["Sarah Critchley","Matthew Barbour"],"S","Intermediate (200)"],
    [8721,"From prompt to pattern: A Microsoft Autopilot + Power Platform agentic workflow roundtable",29,"10:45","11:45","Room 354",["Samantha Neufeld","Matthew LeHew","Dino Ilic"],"R","Foundational (100)"],
    [8845,"Getting Started with Apps in Cowork and Copilot Studio",27,"11:30","12:30","Boulevard Ballroom 162",["Jessica Lo","Jake Cohen","Miguel Resto"],"S","Foundational (100)"],
    [8806,"How I Learned to Stop Worrying About the Agent and Start Thinking About the Work",27,"14:00","15:00","Room 354",["Dan Stevenson","Giorgio Ughini","Sathya Raveendran","Ishaan Mirchandani"],"R","Intermediate (200)"],
    [8790,"How Microsoft Does IT: Managing and Governing Agents\u2014Empower with Risk Aligned Oversight",28,"15:30","16:30","Grand Ballroom 119",["David Johnson","Aisha Hasan","Naveen Jangir"],"S","Intermediate (200)"],
    [8708,"Improve Your Power Platform Security Posture with Advisor and Security Hub",28,"11:15","12:15","Grand Ballroom 120",["Yannick Reekmans"],"S","Advanced (300)"],
    [8861,"Lost in the Agent Jungle: What to Use When?",27,"11:30","12:30","Room 351",["Remi Dyon","Roel Schenk","Bobby Chang","Karima Kanji-Tajdin"],"R","Foundational (100)"],
    [8907,"Managed Apps Built with Cowork, Copilot Studio and the SDK",28,"10:00","11:00","Grand Ballroom 119",["Damien Bird"],"S","Advanced (300)"],
    [8774,"Managed Security: Securing and Governing Apps, Automations, and Agents at Scale",28,"08:00","09:00","Premier BR 319",["Lane Swenka","Gregg Barker"],"S","Intermediate (200)"],
    [8787,"Meet Microsoft Autopilot: A Personal, Persistent, Proactive AI Agent for Work",28,"08:00","09:00","Boulevard Ballroom 163",["Samantha Neufeld","Matthew LeHew","Dino Ilic"],"S","Foundational (100)"],
    [8727,"Observability and Governance for your 3P agents\u200b",28,"08:00","09:00","Premier BR 316",["Aarthi Saravanakumar","Jaganmohan Naidu Penikalapati","Nick Wryter"],"S","Advanced (300)"],
    [8780,"Right-Size & Secure Your Data Estate: Governing & Managing Dataverse and Dynamics 365",29,"14:30","15:30","Grand Ballroom 119",["Paul Liew","Tommy Graham","Alex Peck"],"S","Intermediate (200)"],
    [8844,"Server or Client? Where Business Logic Belongs in Copilot Managed Runtime",29,"14:30","15:30","Boulevard Ballroom 163",["Bryce Sova","Marcel Ferreira","Greg Lindhorst","Jordan Chodak","Mark Overholt"],"S","Advanced (300)"],
    [8916,"The Agent Failure Lab: Why Your Demo Passed and Production Failed",28,"15:30","16:30","Premier BR 311",["Mario Trueba","Marco Amoedo"],"S","Advanced (300)"],
    [8788,"The Copilot Compass: Finding True North Across Copilot, Cowork, Scout, and Agents",28,"10:00","11:00","Chairman's Ballroom 368",["Bryan Wofford","April Dunnam"],"S","Intermediate (200)"],
    [8722,"Tools\u2014Simple for Devs, Secure for Enterprise",27,"16:00","17:00","Chairmans BR 368",["Srikumar Nair","Mata Prasad Gupta"],"S","Intermediate (200)"],
    [8801,"Your Voice, Our Roadmap: A Copilot, Cowork & Power Platform Roundtable",29,"12:00","13:00","Room 350",["Miti Joshi","Adrian Orth"],"R","Intermediate (200)"],
    [8773,"Beyond the Basics: the GitHub Copilot Harness and Workflows in Copilot Studio",27,"16:00","17:00","Premier BR 316",["Giorgio Ughini","Alicja Gilderdale","Roel Schenk"],"S","Advanced (300)"],
    [8468,"Building a Secure Power Platform Architecture with Managed Identity and VNet",28,"14:00","15:00","Grand Ballroom 114",["Allan De Castro"],"S","Advanced (300)"],
    [8809,"Copilot Credits at Scale: Governing Consumption, Empowering Everyone",29,"14:30","15:30","Chairmans BR 368",["Rahul Ranjit Kannathusseril","Stuart McCarthy","Elaine Ansell","Chris Garty","Doug Bellingeri","Hongfei Guo","Graham Mosley"],"S","Intermediate (200)"],
    [8842,"Copilot Managed Runtime Data and Connectors",28,"14:00","15:00","Premier BR 316",["Greg Lindhorst","Bryce Sova","Jordan Chodak"],"S","Intermediate (200)"],
    [8767,"DevOps in Power Platform: Build, Deploy and Operate at Enterprise Scale",27,"11:30","12:30","Premier BR 310",["Casey Burke","Arjun Mayur","Greg Lindhorst"],"S","Intermediate (200)"],
    [8709,"Develop More Secure Dataverse Plug-Ins with Virtual Network Integration and Managed Identities",28,"15:30","16:30","Grand Ballroom 114",["Yannick Reekmans"],"S","Intermediate (200)"],
    [8686,"From Legacy to Cloud at Scale: An AI-Accelerated Migration Playbook",29,"14:30","15:30","Grand Ballroom 120",["Berel Lax"],"S","Intermediate (200)"],
    [8467,"Full-Stack Solutions with Code Apps",28,"08:00","09:00","Grand Ballroom 122",["Tomas Prokop"],"S","Advanced (300)"],
    [8819,"Industry Deep Dive | From Automation to Agentic AI: A High-Tech Industry Customer Roundtable",28,"10:00","11:00","Room 352",["Nick Fratello","Tara Mason","Av Erlenwein","Beau Dossin","Jordan Kates","Mike Tamburrino","Greg Gentling"],"R","Intermediate (200)"],
    [8821,"Industry Deep Dive | How Production GenAI Agents Get Built, Deployed, Funded & Cost-Optimized",28,"15:30","16:30","Chairmans BR 368",["Satish Paul","Ben Tickner","Michael Lang","Ryan Kane","Coskun Cavusoglu","Mark Drenka"],"S","Foundational (100)"],
    [8753,"Power Apps + Power Automate: Best Practices for Building Production-Ready Solutions",28,"11:30","12:30","Boulevard Ballroom 163",["Ilya Fainberg","Sonali Panda","Christopher Moncayo","Olivier Conort"],"S","Advanced (300)"],
    [8695,"Power BI Administration at Scale: Governance Patterns for Enterprise Deployments",28,"08:00","09:00","Grand Ballroom 114",["Heidi Hasting","Shabnam Watson"],"S","Advanced (300)"],
    [8690,"Power Platform Agentic Testing",29,"14:30","15:30","Grand Ballroom 116",["Rami Mounla"],"S","Intermediate (200)"],
    [8765,"Take Control of Your Power Platform Spend",29,"10:45","11:45","Grand Ballroom 119",["Graham Mosley","Amiya Patra"],"S","Intermediate (200)"],
    [8818,"The Meter Is Running: FinOps for Agents in a Consumption World",28,"08:00","09:00","Room 354",["Phil Topness","Dave Milton","Ambrita Nand"],"R","Intermediate (200)"],
    [8786,"Why Enterprise Agents Fail; and the Microsoft IQ Answer",28,"15:30","16:30","Premier BR 310",["Sharad Bajaj","Julie Koesmarno","James Oleinik","Robert Bruckner"],"S","Foundational (100)"],
    [8772,"Work, Reimagined: Copilot, Cowork & the Power Platform",27,"11:30","12:30","Boulevard Ballroom 163",["Miti Joshi","Tiffany Treacy","Adrian Orth","Mike Stall"],"S","Intermediate (200)"]
  ];
  // Editorial summaries and efficiency angles are our interpretation, not guaranteed savings or official recommendations.
  const notes = {
    8741:["T","Build governance tooling on the Power Platform API, including inventory, telemetry, policy automation and AskAdvisor.","Replace portal-by-portal administration with supported APIs, reusable controls and governance in the deployment workflow."],
    8905:["CT","Discuss Cowork plugins, tools, skills and workflows integrating repositories, documentation, APIs and issue trackers.","Package repeated engineering tasks as reusable extensions instead of rebuilding one-off automations."],
    8870:["AF","Explore how to evaluate persistent agents such as Scout beyond time saved, including coordination, expertise and consumption costs.","Give always-on agents an outcome-based investment case rather than treating activity or token usage as proof of value."],
    8902:["C","A banking scenario shows CRM capabilities delivered through Copilot, Cowork and agents rather than a destination CRM screen.","Reduce application switching by bringing business actions into the tools people already use."],
    8770:["T","Explore code apps and Copilot Managed Runtime with platform identity, policy, security and lifecycle management.","Keep code-first development while reusing managed enterprise controls rather than assembling them for each app."],
    8862:["AT","Discuss triggered autonomous agents, deterministic and agentic workflows, and computer use for applications without APIs.","Choose the right automation pattern and extend coverage to legacy systems instead of hard-coding every step.","Related mention: broader enterprise autopilots, not a dedicated Microsoft Autopilot product deep dive."],
    8863:["C","Discuss when Cowork can deliver an outcome directly and how that changes the backlog of custom-built agents.","Avoid building and maintaining a bespoke agent when delegation is enough; reserve engineering for differentiating work."],
    8908:["ACT","A live scenario takes a Teams meeting through a specification, published app, agent and flow, grounded with Work IQ.","Explore shortening the handoffs from requirements to a working solution while retaining IT oversight."],
    8691:["F","Review Copilot Studio license types, entitlement overlaps, scenario requirements and compliant cost-saving choices.","Match licensing to the actual workload before procurement or rollout creates avoidable cost and rework.","FinOps-adjacent: licensing, not a dedicated FinOps session."],
    8881:["T","Compare evaluation strategies, unit checks, end-to-end tests and regression detection for nondeterministic agents.","Build repeatable eval pipelines instead of relying on manual prompt checks before each release."],
    8792:["C","Review tool-selection guidance and adoption practices across Copilot, Cowork, agents and Copilot Studio.","Reduce duplicated enablement work by matching training and rollout materials to each role and tool."],
    8760:["F","An executive panel examines production-agent costs, data readiness, consumption billing and defensible ROI.","Bring delivery and finance into the same investment conversation before scaling agent usage.","FinOps-adjacent: executive cost and ROI discussion."],
    8850:["T","Discuss Work IQ connectors, MCP servers and reliable read/write integrations with enterprise systems.","Reuse discoverable data and action interfaces rather than building a separate integration for every agent."],
    8909:["CT","Live-build a Cowork plugin using an MCP server, a Skill, packaging, sideloading and a path to catalog publication.","Learn a repeatable way to ship team capabilities into Cowork with admin guardrails and a starter template."],
    8775:["CT","Explore engineering extension patterns and a CNH customer example of deploying Cowork plugins at scale.","Reuse plugins for research, modernization and operational work, then apply a customer rollout pattern."],
    8849:["F","Power CAT discusses measuring adoption and business impact from agent pilots through enterprise scale.","Use evidence of adoption and outcomes to prioritize expansion rather than scaling every successful demo.","FinOps-adjacent: value measurement rather than consumption operations."],
    8749:["T","Learn how Hosted Managed Agents move code from a developer repository into a governed managed runtime.","Reduce the gap between working local code and an agent operated under enterprise controls."],
    8721:["AT","A design jam combines Microsoft Autopilot with Copilot Studio, Power Automate, Dataverse and Microsoft 365.","Leave with reusable workflow patterns and explicit trust boundaries and approval points instead of isolated prompts."],
    8845:["C","An introductory demo follows AI app creation, data and logic refinement, and when to move to advanced tools.","Let teams validate simpler app ideas before committing specialist development time."],
    8806:["AC","Discuss reusable skills and prompts versus building another agent, with workflows and autopilots for more complex work.","Reduce unnecessary custom-agent maintenance by choosing the smallest reusable capability that achieves the outcome.","Related mention: architectural autopilots and Cowork; not a dedicated Scout or Autopilot walkthrough."],
    8790:["T","Microsoft Digital shares its approach across Copilot Studio, Agent 365, Defender and Purview.","Borrow a risk-aligned operating model instead of inventing separate governance processes for every team."],
    8708:["T","Use Advisor and Security Hub recommendations to assess and improve a fresh Power Platform environment.","Prioritize actionable security gaps rather than manually tracking every platform security setting."],
    8861:["C","Compare selection and enablement frameworks across Copilot Studio, Copilot, Cowork, Work IQ and Agent 365.","Reduce tool sprawl and conflicting rollout guidance by agreeing which experience fits each job."],
    8907:["CT","Compare Cowork, Copilot Studio and SDK approaches to Managed Apps, including architecture, governance and licensing.","Choose an implementation path with operational controls in mind before a prototype becomes a production dependency."],
    8774:["T","See natural-language governance investigations and approval-based plans for tenant and environment controls.","Reduce portal navigation and repetitive configuration work while keeping administrators in the approval loop."],
    8787:["A","The product team introduces Microsoft Autopilot capabilities, demos, use cases, permissions and readiness considerations.","Evaluate where persistent, proactive assistance can take coordination work off teams without bypassing governance."],
    8727:["T","Explore Agent 365 discovery, telemetry and Entra identities for agents hosted across multiple clouds.","Investigate a common operational view instead of separately instrumenting and governing each hosting stack."],
    8780:["FT","Review Dataverse and Dynamics 365 storage visibility, lifecycle policies, retention, archival and capacity management.","Move from reactive data cleanup to policy-led retention and capacity right-sizing.","FinOps-adjacent: data storage and capacity optimization."],
    8844:["T","Choose where validation, authorization, integrations, background jobs and AI calls belong in a managed app architecture.","Avoid duplicated logic and security rework by putting each responsibility at the appropriate runtime boundary."],
    8916:["T","Trace stale knowledge, ambiguous tools and an unreliable MCP service using activity maps and agent evaluations.","Reuse a failure taxonomy and test pack to diagnose production issues instead of repeatedly retesting happy paths."],
    8788:["AC","A demo-led comparison connects Copilot, Scout, Cowork and agents into a practical workflow-selection framework.","Reduce tool-selection friction and context switching by assigning the right experience to each stage of work."],
    8722:["T","Explore Agent 365 discovery, observation, governance and security for agent tools such as MCP servers and Skills.","Give developers reusable extension points without making IT approve an entirely new control model for each tool."],
    8801:["C","An open product-team conversation gathers current Cowork, Copilot and Power Platform experiences and roadmap feedback.","Bring concrete integration or rollout friction to the product team rather than general feature requests."],
    8773:["T","Deep-dive into the GitHub Copilot harness, skills, tool orchestration, error recovery, memory and deterministic versus AI workflow steps.","Reuse enterprise patterns and authoring assets for reasoning-heavy workflows instead of scripting every path from scratch."],
    8468:["T","Review managed identities, VNet integration, private endpoints and least-privilege connectivity for Power Platform.","Standardize secure integration patterns so each solution does not require a bespoke network and authentication design."],
    8809:["FT","Compare budgeting, monitoring, allocation and governance of Copilot credits as usage expands.","Assign ownership and consumption controls while enabling experimentation instead of responding only after bills arrive."],
    8842:["T","Explore managed-runtime data access, built-in sources, connectors and governance-controlled access.","Reuse platform data access and controls instead of adding a custom integration layer to every app."],
    8767:["T","Review enterprise DevOps practices for development, quality gates, production deployment, monitoring and improvement.","Standardize build-to-operate delivery so AI-accelerated creation does not become a manual release and support bottleneck."],
    8709:["T","A Dataverse plug-in demo covers configuration and use of VNet integration and managed identities.","Reuse managed authentication and private connectivity rather than maintaining custom credential handling in integrations."],
    8686:["T","Use metadata extraction into Dataverse and AI-assisted analysis to plan and remediate a legacy XRM migration.","Reduce manual discovery and code-audit effort with a reusable system blueprint and structured migration process."],
    8467:["T","Live-code React/TypeScript, C# Dataverse plug-ins, connectors and background flows with deployment automation.","See one coherent developer loop across frontend, backend, source control and release rather than disconnected tooling demos."],
    8819:["S","Leaders from BMC, Sage, Ivanti, Precisely and Trimble discuss enterprise AI journeys, governance and operational lessons.","Compare high-tech peer patterns for turning agent pilots into governed operations and measurable business outcomes.","Peer match for software and technology companies: the official listing is the High-Tech Industry Customer Roundtable."],
    8821:["FT","EY, PwC, RSM and Accenture cover specifications, shared context, evals, deployment, model updates and GenAI funding and cost choices.","Connect the SDLC to consumption economics, including when smaller models can avoid unnecessary frontier-model spend."],
    8753:["T","Power CAT covers app performance, dependable flows, testing, ALM, troubleshooting and post-release operation.","Reduce fragile dependencies and support effort by applying production patterns across the entire app-and-flow lifecycle."],
    8695:["FT","Explore workspace lifecycle automation, compliance monitoring, license optimization and Power BI administration APIs.","Replace repeated workspace administration with Power Automate and API-based operating patterns.","FinOps-adjacent: Power BI license optimization within a broader administration session."],
    8690:["T","Demo practical AI-driven testing for Power Platform customizations, frontends and nondeterministic agents.","Add repeatable testing to the delivery workflow instead of relying solely on manual validation."],
    8765:["FT","Review Power Platform cost management, licensing utilization, resource consumption and allocation capabilities.","Give administrators usage and allocation evidence for optimization decisions rather than treating spend as a single opaque number."],
    8818:["F","A working FinOps session covers consumption attribution, waste guardrails, defensible returns and operating ownership.","Bring a real workflow and leave with a consumption-to-outcome model and clear accountability."],
    8786:["AT","Explore Dataverse business context, Microsoft IQ, MCP and Agent 365 through an end-to-end agent architecture.","Reuse context and governance foundations instead of compensating for missing business knowledge with more prompt engineering.","Related mention: includes autopilot agents in a broader Microsoft IQ architecture session."],
    8772:["C","See how Copilot, Cowork, Power Platform and Work IQ connect apps and business context in one workflow.","Bring existing apps and actions into the work surface rather than requiring users to navigate separate experiences."]
  };
  // Technology named by each session's own official title or abstract (collected 2026-10-19), most prominent first.
  // Only names the listing itself uses; sessions that name no product (8760, 8849, 8881) are omitted on purpose.
  // The organizer's separate "products" tags are not used: they file newer offerings such as Cowork,
  // Scout/Autopilot and Work IQ under other products. Names are not a promise of what will be demonstrated.
  const tech = {
    8467:["Power Apps code apps","Dataverse","Power Automate","GitHub Copilot","React","TypeScript"],
    8468:["Managed Identity","Virtual Network (VNet)","Dataverse","Azure"],
    8686:["Power Platform","Dataverse","Microsoft Fabric"],
    8690:["Power Platform"],
    8691:["Copilot Studio"],
    8695:["Power BI","Power Automate","Power BI REST APIs"],
    8708:["Power Platform","Security Hub","Advisor"],
    8709:["Dataverse plug-ins","Virtual Network (VNet)","Managed Identity"],
    8721:["Microsoft Autopilot","Copilot Studio","Power Automate","Dataverse","Microsoft 365"],
    8722:["Agent 365","MCP"],
    8727:["Agent 365","Microsoft Entra"],
    8741:["Power Platform API","AskAdvisor","Advanced Connector Policies"],
    8749:["Hosted Managed Agents","Copilot Studio"],
    8753:["Power Apps","Power Automate"],
    8765:["Power Platform"],
    8767:["Power Platform","Managed Apps"],
    8770:["Power Apps code apps","Copilot Managed Runtime"],
    8772:["Microsoft 365 Copilot","Copilot Cowork","Power Platform","Work IQ"],
    8773:["Copilot Studio","GitHub Copilot harness","Claude Code"],
    8774:["Power Platform","Managed Environments"],
    8775:["Copilot Cowork"],
    8780:["Dataverse","Dynamics 365"],
    8786:["Microsoft IQ","Dataverse","Agent 365","MCP","Work IQ","Fabric IQ","Foundry IQ"],
    8787:["Microsoft Autopilot"],
    8788:["Copilot","Scout","Copilot Cowork"],
    8790:["Copilot Studio","Agent 365","Microsoft Defender","Microsoft Purview"],
    8792:["Microsoft 365 Copilot","Copilot Cowork","Copilot Studio"],
    8801:["Copilot","Copilot Cowork","Power Platform"],
    8806:["Copilot Cowork","Copilot","Copilot Studio"],
    8809:["Copilot Credits","Copilot Studio","Work IQ"],
    8818:["Copilot Credits"],
    8819:["Power Platform","Copilot Studio"],
    8821:["Power Platform"],
    8842:["Copilot Managed Runtime"],
    8844:["Copilot Managed Runtime"],
    8845:["Copilot Cowork","Copilot Studio"],
    8850:["Work IQ","MCP","Connectors"],
    8861:["Copilot Studio","Microsoft 365 Copilot","Copilot Cowork","Work IQ","Agent 365"],
    8862:["Copilot Studio"],
    8863:["Copilot Cowork"],
    8870:["Microsoft Scout"],
    8902:["Dynamics 365","Copilot","Copilot Cowork","Power Platform"],
    8905:["Copilot Cowork"],
    8907:["Managed Apps","Copilot Cowork","Copilot Studio","SDK"],
    8908:["Copilot Cowork","Power Platform","Work IQ","Microsoft Teams"],
    8909:["Copilot Cowork","MCP","Power Platform","Ask Advisor"],
    8916:["Copilot Studio","MCP","Agent evaluations","Activity map"]
  };
  const categories = { A: "scout", S: "hightech", C: "cowork", F: "finops", T: "engineering" };
  const priority = { scout: 1, hightech: 2, cowork: 3, finops: 4, engineering: 5 };
  const topPicks = new Set([8787,8721,8870,8819,8909,8908,8775,8818,8765,8767,8773,8467,8770,8741,8774,8753,8821]);
  const data = window.CONFERENCE_GUIDE;
  data.research = {
    sourceUrl: "https://powerplatformconf.com/sessions",
    schedulePdf: "https://devintxcontent.blob.core.windows.net/showcontent/Schedule/PPCC-Schedule-2026-10-15.pdf",
    collectedAt: "2026-10-19",
    publishedSessionsReviewed: 227,
    scope: "Public sessions index and its embedded session facts; workshops and private invitations are outside this scan.",
    method: "All title/abstract mentions of Scout, Autopilot and Cowork; the High-Tech industry customer roundtable for software and technology companies; explicit FinOps and cost sessions plus labeled licensing/ROI adjacencies; a curated engineering and platform selection. Categories overlap."
  };
  data.topicGroups = [
    { id: "scout", label: "Scout / Autopilot", description: "All published title/abstract mentions: five direct Scout/Autopilot references plus three broader autopilot-related sessions, labeled on their cards." },
    { id: "hightech", label: "High-tech peers", description: "The High-Tech Industry Customer Roundtable is the closest official match for software and technology companies. The official page names BMC, Sage, Ivanti, Precisely and Trimble." },
    { id: "cowork", label: "Cowork", description: "All published title/abstract mentions, including engineering plugins, app creation, adoption, product feedback and related architecture discussions." },
    { id: "finops", label: "FinOps / cost & ROI", description: "Four directly cost-focused sessions, plus six labeled adjacencies covering licensing, agent ROI, persistent-agent value, storage capacity and Power BI license optimization." },
    { id: "engineering", label: "Engineering & platform", description: "A curated technical lens for software and technology teams: managed runtime, code-first delivery, MCP integrations, DevOps, identity, governance, observability, testing and modernization. Efficiency angles are editorial interpretations, not measured savings." }
  ];
  Object.keys(tech).forEach((id) => { if (!facts.some((row) => String(row[0]) === id)) throw new Error(`Technology listed for unknown official session ${id}`); });
  data.sessions = facts.map(([id, title, day, start, end, room, speakers, format, level]) => {
    const entry = notes[id];
    if (!entry) throw new Error(`Missing curation for official session ${id}`);
    const groups = [...entry[0]].map((code) => categories[code]);
    return {
      id: String(id), officialId: id, title: title.replace(/\u200b/g, ""),
      date: `2026-10-${day}`, start, end, room, speakers,
      type: format === "R" ? "Roundtable" : "60-minute Session", level: level || null,
      categories: groups, tags: groups.map((id) => data.topicGroups.find((group) => group.id === id).label),
      priority: Math.min(...groups.map((group) => priority[group])),
      description: entry[1], efficiency: entry[2], matchNote: entry[3] || null,
      tech: tech[id] || [],
      sourceUrl: `https://powerplatformconf.com/sessions/${encodeURIComponent(title.replaceAll(" ", "-"))}`,
      collectedAt: data.research.collectedAt, featured: topPicks.has(id)
    };
  });
  data.executiveExperiences = data.sessions.filter((session) => session.officialId === 8760).map((session) => ({
    title: session.title, description: session.description,
    date: "Tuesday, October 27, 2026", time: "2:00-3:00 PM Pacific", location: session.room,
    eligibility: "Listed in the public conference session agenda; the page does not specify separate executive-program eligibility. Confirm conference access with the organizer.",
    sourceUrl: session.sourceUrl, collectedAt: session.collectedAt
  }));
})();

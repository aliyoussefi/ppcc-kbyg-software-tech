"use strict";

// Edit content here; the static site needs no build step.
window.CONFERENCE_GUIDE = {
  edition: "Software & Technology Edition",
  intro: "For software and technology companies: Scout and Autopilot, Cowork, FinOps and your high-tech peers, plus Pitbull, room-by-room floor maps and an agenda you build yourself.",
  conference: {
    dates: "Oct 27 to 29, 2026",
    venue: "MGM Grand, Las Vegas",
    start: "2026-10-27T08:30:00-07:00",
    end: "2026-10-30T00:00:00-07:00",
    timeZone: "America/Los_Angeles"
  },
  days: [
    { date: "2026-10-27", weekday: "Tuesday", label: "Oct 27", theme: "Build the delivery loop" },
    { date: "2026-10-28", weekday: "Wednesday", label: "Oct 28", theme: "Scout, peers & Cowork" },
    { date: "2026-10-29", weekday: "Thursday", label: "Oct 29", theme: "Extend, govern & optimize" }
  ],
  video: {
    id: "VpZvCUSRKrs",
    chapters: [
      { seconds: 0, title: "Meet Power HUG", detail: "Welcome to the community" },
      { seconds: 355, title: "Conference overview", detail: "What to expect at PPCC" },
      { seconds: 640, title: "Your week at a glance", detail: "The shape of the conference" },
      { seconds: 830, title: "Get set up in Whova", detail: "Your agenda and connections" },
      { seconds: 940, title: "Navigating the venue", detail: "Getting around the MGM Grand" },
      { seconds: 1623, title: "Practical preparation", detail: "A few things to remember" }
    ]
  },
  checklist: [
    { group: "Confirm the essentials", id: "registration", title: "Have your registration ready", detail: "Keep your conference confirmation and the organizers' welcome information somewhere easy to find.", link: "https://powerplatformconf.com/", linkLabel: "Conference website" },
    { group: "Confirm the essentials", id: "travel", title: "Confirm your travel and hotel", detail: "Review your arrival, hotel check-in and airport transfer arrangements." },
    { group: "Confirm the essentials", id: "requirements", title: "Check any access or dietary arrangements", detail: "Confirm requests directly with the organizers rather than assuming they are included in your booking." },
    { group: "Build your game plan", id: "app", title: "Set up the conference app", detail: "Use the instructions supplied with your registration and check the current official agenda.", link: "https://whova.com/", linkLabel: "Whova" },
    { group: "Build your game plan", id: "sessions", title: "Build your agenda and check the rooms", detail: "Add the sessions that interest you, including several in the same time slot. Keep your options open, find each room on the floor map and export your plan before you travel.", link: "#ground", linkLabel: "Agenda builder and floor maps" },
    { group: "Build your game plan", id: "meetups", title: "Plan your conversations", detail: "Make a shortlist of people, teams and partners you would like to meet." },
    { group: "Pack for the week", id: "gear", title: "Bring your essentials", detail: "Comfortable shoes, a charger, a light layer and anything needed for your chosen workshops." },
    { group: "Pack for the week", id: "recheck", title: "Recheck the agenda before you go", detail: "Session times and room assignments can change. Use the official schedule for final details." }
  ],
  faqs: [
    { question: "How were these sessions selected?", answer: "The public official list of 227 sessions was reviewed on October 19, 2026. This guide includes all eight title/abstract mentions of Scout or Autopilot, all fourteen Cowork mentions, the High-Tech industry customer roundtable for software and technology companies, cost and ROI sessions, and selected engineering and platform deep dives. Categories overlap; the 50 cards are unique sessions. Workshops and private invitations were not part of this scan." },
    { question: "Which session is the software and technology peer roundtable?", answer: "The official title is Industry Deep Dive | From Automation to Agentic AI: A High-Tech Industry Customer Roundtable. It is scheduled for Wednesday, October 28, 10:00-11:00 AM Pacific in Room 352 (Level 3). The abstract names BMC, Sage, Ivanti, Precisely and Trimble. See its linked session page for the current details." },
    { question: "Are all Scout and FinOps matches dedicated product sessions?", answer: "No. The Scout/Autopilot filter includes five direct product references and three broader autopilot architecture mentions. Cards label those related mentions. FinOps includes four directly cost-focused sessions and six labeled licensing, ROI, value, data-capacity or Power BI administration adjacencies. Official titles are preserved so these distinctions stay visible." },
    { question: "Why are there several sessions at the same time?", answer: "They are intentional alternatives, not scheduling problems to resolve. Choose the topic, depth or format that suits you, and feel free to add several options for the same slot to your agenda. The guide keeps every option available so you can decide on the day. There is no expectation to attend every highlighted session." },
    { question: "Where do the technology names on each session come from?", answer: "From the official session title and abstract, collected on October 19, 2026. A session shows a technology line only when its listing names one, so a few roundtables and panels have none. The organizer's separate product tags are not used, because they file newer offerings such as Cowork, Scout/Autopilot and Work IQ under other products. The names are not exhaustive and are not a promise of what will be demonstrated." },
    { question: "What do the efficiency angles mean?", answer: "They are editorial interpretations of the official abstracts: less custom integration work, faster governed delivery, reusable tests, automated administration and clearer consumption ownership. They are not measured savings, product availability guarantees or promises from the speakers. Each card links to the underlying official session and shows its collection date." },
    { question: "Which timezone does the agenda use?", answer: "Session times use America/Los_Angeles, the conference's Las Vegas timezone. The guide will not silently convert them to the timezone of your device." },
    { question: "Where is my agenda stored?", answer: "In this browser's local storage on this device, together with your checklist. Nothing is uploaded, synced or shared unless you export a file yourself. Using another browser, device or web address creates a separate agenda." },
    { question: "How do I build and export my agenda?", answer: "Open On the Ground, choose a day, and add sessions from the list or by selecting a highlighted room on the floor map. The map numbers your picks in time order. Export a PDF that includes the floor maps, a PNG image of the day's map, or a calendar file. Sessions that overlap are shown as alternatives, never as errors." },
    { question: "Where do the floor maps come from?", answer: "Room positions are redrawn as a simplified schematic from the MGM Grand Conference Center plans for Levels 1 and 3, linked beside the map. Room assignments come from the official PPCC sessions index collected on October 19, 2026. The map is not to scale and is not a substitute for the venue plans, signage or Whova." },
    { question: "Is the Pitbull concert open to everyone?", answer: "The official PPCC site says full conference attendees are invited to the exclusive Wednesday evening event with a live performance by Pitbull in the MGM Grand Garden Arena. The start time is listed as 8:00 PM, and the organizer's October 15 schedule shows 8:00-10:00 PM. Confirm your access with the organizers." },
    { question: "Where is the source code?", answer: "On GitHub at github.com/aliyoussefi/ppcc-kbyg-software-tech. It is a static site with no backend or build step, so any static host, including GitHub Pages, can serve it." },
    { question: "Can the audience and branding change?", answer: "Yes. This draft is curated for software and technology companies. The square branding tile remains editable. The design retains the reference's navy background, Montserrat typography, teal accents and purple-to-blue buttons." },
    { question: "Does this replace official registration or the conference app?", answer: "No. This is an unofficial planning companion. Confirm registration, eligibility, room assignments and all final session details with the organizers." }
  ],
  // The verified catalogue and editorial annotations are loaded from sessions.js.
  // Unknown fields must remain null; do not infer an unpublished time or location.
  sessions: [],
  // Evening events are verified against the live PPCC homepage and the organizer's October 15 schedule PDF.
  // Unknown fields stay null; do not infer eligibility, times or venues.
  evenings: [
    {
      id: "evt-pitbull",
      featured: true,
      title: "Attendee Party: Pitbull Concert",
      date: "2026-10-28",
      start: "20:00",
      end: "22:00",
      location: "MGM Grand Garden Arena",
      description: "An exclusive evening event with a live performance by Pitbull at the Power Platform Community Conference attendee party: a night of music, drinks and networking.",
      eligibility: "The official PPCC site invites full conference attendees. Confirm your access with the organizers.",
      audience: "Full conference attendees",
      timeNote: "The 8:00 PM start and the MGM Grand Garden Arena venue appear on the live PPCC homepage. The 10:00 PM end time is from the organizer's October 15 schedule PDF.",
      sourceUrl: "https://powerplatformconf.com/",
      sourceLabel: "Official PPCC announcement",
      scheduleUrl: "https://devintxcontent.blob.core.windows.net/showcontent/Schedule/PPCC-Schedule-2026-10-15.pdf",
      collectedAt: "2026-10-19"
    },
    {
      id: "evt-night-market",
      featured: false,
      title: "Opening Reception & Night Market",
      date: "2026-10-27",
      start: "17:00",
      end: "19:30",
      location: "Expo Hall, Marquee Ballroom, Level 1",
      description: "Meet sponsors and exhibitors and enjoy a complimentary drink at the Opening Reception. The Makers Market then comes alive after dark with games, entertainment, networking, food and drinks. Redeem your tokens at the Makers Market Merch Store and explore the interactive activations.",
      eligibility: null,
      timeNote: "Time and location are from the organizer's October 15 schedule PDF; the live PPCC homepage lists the same 5:00-7:30 PM Night Market and Opening Reception.",
      sourceUrl: "https://powerplatformconf.com/",
      sourceLabel: "Official PPCC agenda",
      scheduleUrl: "https://devintxcontent.blob.core.windows.net/showcontent/Schedule/PPCC-Schedule-2026-10-15.pdf",
      collectedAt: "2026-10-19"
    }
  ],
  executiveExperiences: []
};

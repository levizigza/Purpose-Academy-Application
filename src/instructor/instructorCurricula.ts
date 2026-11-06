/** Instructor streams taken from the Purpose Academy curriculum folders.
 * Construction weeks: Eight-Month Construction Skills and Workplace Readiness plan.
 * Logistics weeks: Logistics instructor lesson plan binder.
 * Community Support weeks: Community Support Worker instructor lesson plan binder.
 */

export type InstructorStreamId = 'construction' | 'logistics' | 'community'

export type StreamStep = { label: string; text: string }

export type StreamWeek = {
  n: number
  month: number
  title: string
  outcomes: string[]
  steps: StreamStep[]
}

export type StreamMonth = {
  n: number
  title: string
  objective: string
  assessment: string
  scope?: string
}

export type StreamDoc = { title: string; href: string; note: string }

export type InstructorStream = {
  id: InstructorStreamId
  title: string
  program: string
  summary: string
  source: string
  credit?: string
  studentPath: string
  dayNote?: string
  docs: StreamDoc[]
  months: StreamMonth[]
  weeks: StreamWeek[]
}

export const INSTRUCTOR_STREAMS: Record<InstructorStreamId, InstructorStream> = {
  "construction": {
    "id": "construction",
    "title": "Construction",
    "program": "Construction Skills and Workplace Readiness",
    "summary": "Calgary. 32 weeks, 960 hours, 30 hours a week. Round 1 is foundation English and computers. Round 2 is materials, tools, one trade pathway, and equipment awareness. Proposed training plan, not a licence or operator certificate.",
    "source": "Eight-Month Curriculum and Training Plan",
    "studentPath": "In Student Practice, choose Construction. Month 8 pairs with the construction equipment videos.",
    "dayNote": "Month 6 and Month 7 are taught in one selected trade: Interior Finishing, Exterior Finishing, or Framing and Cabinetry.",
    "docs": [
      {
        "title": "Eight-month curriculum",
        "href": "https://drive.google.com/file/d/1WqQpV77t4MV3_QF6h8_PTtLa59pdM-2i/view",
        "note": "Construction Skills and Workplace Readiness. This is the week stream below."
      },
      {
        "title": "Instructor lesson plan binder",
        "href": "https://drive.google.com/file/d/1auznF2dgKAaeC2nn8D9yOspPLKphSQoo/view",
        "note": "Construction and Residential Renovation binder. A separate draft sequence in this folder: materials, measurement, framing, drywall, flooring, siding, roofing, painting, and a renovation project. It does not follow the same week order as the eight-month plan."
      },
      {
        "title": "Instructor marking guide",
        "href": "https://drive.google.com/file/d/11VOS48kqsrl4KVpa_XT8Cg7a-TYHrYOy/view",
        "note": "Marking guide from the Construction Curriculum folder."
      },
      {
        "title": "Practical skills checklist",
        "href": "https://drive.google.com/file/d/1hauddlWwAloSqdU1Rte4wOkcFgJncfxC/view",
        "note": "Practical skills assessment checklist."
      },
      {
        "title": "Student workbook",
        "href": "https://drive.google.com/file/d/1wAITaulv1HF9O7DWRVT301y7oVmVNGO2/view",
        "note": "Construction student workbook."
      },
      {
        "title": "Textbook",
        "href": "https://drive.google.com/file/d/1ogoO4-xmTXEj4L5rrOfSMiT3Tn_Ivgi5/view",
        "note": "Construction textbook."
      },
      {
        "title": "Weekly student examination",
        "href": "https://drive.google.com/file/d/13K4S4RzU0Qvq7V_O9XqDo0KIiAgWEEXm/view",
        "note": "Weekly student examination binder."
      },
      {
        "title": "Construction equipment videos and answer keys",
        "href": "https://drive.google.com/drive/folders/1fVjlA_gc4X6pTCM77eK3xZfO1jv_wN47",
        "note": "Question-and-answer videos for the machines in the Construction Videos folder."
      }
    ],
    "months": [
      {
        "n": 1,
        "title": "Construction English I: Tools, Materials and Basic Duties",
        "objective": "Recognize, pronounce, understand, and use essential English vocabulary found in residential construction workplaces.",
        "assessment": "Vocabulary and picture identification 30%. Listening 25%. Spoken identification and pronunciation 25%. Participation 20%."
      },
      {
        "n": 2,
        "title": "Construction English II: Job Duties and Safety Communication",
        "objective": "Understand common daily construction duties and communicate with supervisors, coworkers, and safety personnel.",
        "assessment": "Listening and instruction-following 30%. Job-duty role-play 30%. Hazard reporting 25%. Participation and teamwork 15%."
      },
      {
        "n": 3,
        "title": "Workplace Sentence Structure and Basic Computer Skills",
        "objective": "Build practical English sentences and the digital literacy used for employment and workplace communication.",
        "assessment": "Sentence construction and writing 30%. Computer practical 35%. Workplace email and documents 20%. Resume and job application 15%."
      },
      {
        "n": 4,
        "title": "Construction Materials and Their Applications",
        "objective": "Identify common residential construction materials, their applications, and basic handling and storage.",
        "assessment": "Material identification 35%. Application matching 25%. Measurement and quantity 20%. Safe handling and storage 20%."
      },
      {
        "n": 5,
        "title": "Hand Tools, Power Tool Awareness and Practical Skills",
        "objective": "Identify, select, inspect, handle, and use selected tools under supervision.",
        "assessment": "Tool identification 20%. Measuring and layout 25%. Safe tool handling 35%. Integrated workshop project 20%.",
        "scope": "Power tools and cutting operations need task-specific instruction, guarding, PPE, supervision, and documented competency. Awareness alone does not authorize independent operation."
      },
      {
        "n": 6,
        "title": "Construction Trade Specialization I",
        "objective": "Introduce the selected trade and fundamental practical skills.",
        "assessment": "Trade knowledge 20%. Measurement and layout 25%. Practical project 40%. Safety and housekeeping 15%.",
        "scope": "Each learner selects one pathway: Interior Finishing, Exterior Finishing, or Framing and Cabinetry."
      },
      {
        "n": 7,
        "title": "Construction Trade Specialization II",
        "objective": "Build competence through more complex supervised projects and workplace simulations.",
        "assessment": "Final trade project 45%. Practical skills observation 25%. Quality control and problem solving 15%. Safety, teamwork, and communication 15%."
      },
      {
        "n": 8,
        "title": "Heavy Equipment Awareness and Construction Site Safety",
        "objective": "Introduce the Zoomlion boom lift, small mobile crane, Bobcat skid-steer loader, and forklift: components, uses, hazards, and safety responsibilities.",
        "assessment": "Equipment identification 25%. Component and function knowledge 20%. Hazard recognition and safety scenarios 35%. Final written or oral assessment 20%.",
        "scope": "This is an awareness module. It does not qualify a learner as an operator. No independent machine operation is required to pass."
      }
    ],
    "weeks": [
      {
        "n": 1,
        "month": 1,
        "title": "Construction Workplace Introduction",
        "outcomes": [],
        "steps": [
          {
            "label": "6 hours",
            "text": "Workplace introductions, greetings, names, and job roles."
          },
          {
            "label": "8 hours",
            "text": "Construction site locations, work areas, and common signs."
          },
          {
            "label": "8 hours",
            "text": "Basic safety vocabulary and personal protective equipment."
          },
          {
            "label": "8 hours",
            "text": "Listening, pronunciation, picture identification, and role-play."
          }
        ]
      },
      {
        "n": 2,
        "month": 1,
        "title": "Construction Materials Vocabulary",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Lumber, plywood, OSB, drywall, insulation, and concrete."
          },
          {
            "label": "8 hours",
            "text": "Fasteners, adhesives, sealants, and finishing materials."
          },
          {
            "label": "6 hours",
            "text": "Colours, shapes, sizes, measurements, and quantities."
          },
          {
            "label": "8 hours",
            "text": "Vocabulary practice using real samples and images."
          }
        ]
      },
      {
        "n": 3,
        "month": 1,
        "title": "Tools and Equipment Vocabulary",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Hand tool names and functions."
          },
          {
            "label": "6 hours",
            "text": "Power tool names and common accessories."
          },
          {
            "label": "8 hours",
            "text": "Equipment names and construction-related action verbs."
          },
          {
            "label": "8 hours",
            "text": "Listening and speaking exercises using tool demonstrations."
          }
        ]
      },
      {
        "n": 4,
        "month": 1,
        "title": "Basic Construction Instructions",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Understanding simple instructions."
          },
          {
            "label": "8 hours",
            "text": "Construction verbs such as measure, cut, carry, hold, install, and clean."
          },
          {
            "label": "6 hours",
            "text": "Asking for clarification and identifying objects."
          },
          {
            "label": "8 hours",
            "text": "Practical language assessment and review."
          }
        ]
      },
      {
        "n": 5,
        "month": 2,
        "title": "Daily Work Instructions",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Understanding supervisor instructions."
          },
          {
            "label": "8 hours",
            "text": "Work sequences and task-related verbs."
          },
          {
            "label": "6 hours",
            "text": "Locations, directions, and moving materials."
          },
          {
            "label": "8 hours",
            "text": "Job-duty role-play and listening exercises."
          }
        ]
      },
      {
        "n": 6,
        "month": 2,
        "title": "Construction Task Communication",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Describing interior finishing duties."
          },
          {
            "label": "8 hours",
            "text": "Describing exterior finishing duties."
          },
          {
            "label": "6 hours",
            "text": "Describing framing and cabinetry duties."
          },
          {
            "label": "8 hours",
            "text": "Giving progress updates and asking for assistance."
          }
        ]
      },
      {
        "n": 7,
        "month": 2,
        "title": "Workplace Safety Communication",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Recognizing and reporting hazards."
          },
          {
            "label": "8 hours",
            "text": "Understanding warning signs and emergency instructions."
          },
          {
            "label": "6 hours",
            "text": "Reporting injuries, damaged tools, and unsafe conditions."
          },
          {
            "label": "8 hours",
            "text": "Safety conversations and simulated toolbox meetings."
          }
        ]
      },
      {
        "n": 8,
        "month": 2,
        "title": "Workplace Communication Practice",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Understanding instructions in different accents and speaking speeds."
          },
          {
            "label": "8 hours",
            "text": "Teamwork and respectful workplace communication."
          },
          {
            "label": "6 hours",
            "text": "Reporting task completion and asking follow-up questions."
          },
          {
            "label": "8 hours",
            "text": "Integrated workplace communication assessment."
          }
        ]
      },
      {
        "n": 9,
        "month": 3,
        "title": "Basic Sentence Structure",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Subjects, verbs, and objects."
          },
          {
            "label": "8 hours",
            "text": "Simple present and past tense."
          },
          {
            "label": "6 hours",
            "text": "Questions, negatives, and requests."
          },
          {
            "label": "8 hours",
            "text": "Construction-related sentence-building exercises."
          }
        ]
      },
      {
        "n": 10,
        "month": 3,
        "title": "Workplace Writing",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Writing short work messages."
          },
          {
            "label": "8 hours",
            "text": "Describing completed tasks and daily activities."
          },
          {
            "label": "6 hours",
            "text": "Reading simple work orders and checklists."
          },
          {
            "label": "8 hours",
            "text": "Filling out basic workplace forms."
          }
        ]
      },
      {
        "n": 11,
        "month": 3,
        "title": "Basic Computer Skills",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Computer components, keyboard, and mouse."
          },
          {
            "label": "8 hours",
            "text": "Creating, saving, and organizing files."
          },
          {
            "label": "6 hours",
            "text": "Microsoft Word or equivalent document software."
          },
          {
            "label": "8 hours",
            "text": "Email accounts, sending messages, and attaching documents."
          }
        ]
      },
      {
        "n": 12,
        "month": 3,
        "title": "Digital Workplace Readiness",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Basic spreadsheets and entering information."
          },
          {
            "label": "6 hours",
            "text": "Online job searches and digital applications."
          },
          {
            "label": "8 hours",
            "text": "Digital timesheets, schedules, and workplace documents."
          },
          {
            "label": "8 hours",
            "text": "Final computer and workplace writing assessment."
          }
        ]
      },
      {
        "n": 13,
        "month": 4,
        "title": "Structural Materials",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Dimensional lumber, engineered wood, plywood, and OSB."
          },
          {
            "label": "8 hours",
            "text": "Concrete, reinforcement, and basic masonry materials."
          },
          {
            "label": "6 hours",
            "text": "Structural versus non-structural materials."
          },
          {
            "label": "8 hours",
            "text": "Physical material identification and measurement."
          }
        ]
      },
      {
        "n": 14,
        "month": 4,
        "title": "Interior Construction Materials",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Drywall, insulation, and vapour-control materials."
          },
          {
            "label": "8 hours",
            "text": "Flooring, interior doors, and trim."
          },
          {
            "label": "6 hours",
            "text": "Cabinet materials and hardware."
          },
          {
            "label": "8 hours",
            "text": "Material matching and sample-based exercises."
          }
        ]
      },
      {
        "n": 15,
        "month": 4,
        "title": "Exterior Construction Materials",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Siding and exterior cladding."
          },
          {
            "label": "8 hours",
            "text": "Roofing materials and flashing."
          },
          {
            "label": "6 hours",
            "text": "Weather barriers, sealants, and exterior insulation."
          },
          {
            "label": "8 hours",
            "text": "Exterior assembly identification activities."
          }
        ]
      },
      {
        "n": 16,
        "month": 4,
        "title": "Material Selection and Handling",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Reading material labels and specifications."
          },
          {
            "label": "8 hours",
            "text": "Material storage, handling, and protection."
          },
          {
            "label": "6 hours",
            "text": "Estimating simple material quantities."
          },
          {
            "label": "8 hours",
            "text": "Material identification practical examination."
          }
        ]
      },
      {
        "n": 17,
        "month": 5,
        "title": "Measuring and Layout Tools",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Tape measures, squares, and levels."
          },
          {
            "label": "8 hours",
            "text": "Marking and layout methods."
          },
          {
            "label": "6 hours",
            "text": "Basic construction math and measurement."
          },
          {
            "label": "8 hours",
            "text": "Supervised measuring and layout practice."
          }
        ]
      },
      {
        "n": 18,
        "month": 5,
        "title": "Common Hand Tools",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Hammers, screwdrivers, pliers, and wrenches."
          },
          {
            "label": "8 hours",
            "text": "Hand saws, utility knives, and fastening tools."
          },
          {
            "label": "6 hours",
            "text": "Tool inspection, maintenance, and storage."
          },
          {
            "label": "8 hours",
            "text": "Supervised tool-handling practice."
          }
        ]
      },
      {
        "n": 19,
        "month": 5,
        "title": "Power Tool Fundamentals",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Drills, impact drivers, and basic fastening equipment."
          },
          {
            "label": "8 hours",
            "text": "Saws and cutting equipment identification."
          },
          {
            "label": "6 hours",
            "text": "Guards, electrical hazards, dust, and PPE."
          },
          {
            "label": "8 hours",
            "text": "Instructor-controlled demonstrations and supervised practice appropriate to each student's"
          }
        ]
      },
      {
        "n": 20,
        "month": 5,
        "title": "Integrated Tool Practice",
        "outcomes": [],
        "steps": [
          {
            "label": "8 hours",
            "text": "Selecting appropriate tools for assigned tasks."
          },
          {
            "label": "8 hours",
            "text": "Measurement and assembly exercises."
          },
          {
            "label": "6 hours",
            "text": "Tool care and workplace housekeeping."
          },
          {
            "label": "8 hours",
            "text": "Practical tool competency assessment."
          }
        ]
      },
      {
        "n": 21,
        "month": 6,
        "title": "Trade Orientation and Materials",
        "outcomes": [],
        "steps": [
          {
            "label": "Interior Finishing",
            "text": "Drywall, compound, tape, trim, flooring, and paint systems."
          },
          {
            "label": "Exterior Finishing",
            "text": "Siding, exterior trim, flashing, and weather barriers."
          },
          {
            "label": "Framing and Cabinetry",
            "text": "Framing lumber, sheet goods, cabinet components, and hardware."
          },
          {
            "label": "Suggested hours",
            "text": "8 theory, 8 demonstrations, 10 practical activities, 4 assessment and feedback."
          }
        ]
      },
      {
        "n": 22,
        "month": 6,
        "title": "Measurement and Layout",
        "outcomes": [],
        "steps": [
          {
            "label": "Interior Finishing",
            "text": "Measuring walls, ceilings, trim, and flooring areas."
          },
          {
            "label": "Exterior Finishing",
            "text": "Exterior layout, material quantities, and alignment."
          },
          {
            "label": "Framing and Cabinetry",
            "text": "Wall layout, stud spacing, squareness, and cabinet dimensions."
          },
          {
            "label": "Suggested hours",
            "text": "6 theory, 8 demonstrations, 12 supervised practice, 4 assessment."
          }
        ]
      },
      {
        "n": 23,
        "month": 6,
        "title": "Basic Installation Techniques",
        "outcomes": [],
        "steps": [
          {
            "label": "Interior Finishing",
            "text": "Drywall fastening, taping fundamentals, and trim installation."
          },
          {
            "label": "Exterior Finishing",
            "text": "Cladding layout, fastening principles, and flashing demonstrations."
          },
          {
            "label": "Framing and Cabinetry",
            "text": "Basic framing assembly and cabinet component preparation."
          },
          {
            "label": "Suggested hours",
            "text": "6 theory, 8 demonstrations, 12 supervised practice, 4 assessment."
          }
        ]
      },
      {
        "n": 24,
        "month": 6,
        "title": "Foundation Practical Project",
        "outcomes": [],
        "steps": [
          {
            "label": "This week",
            "text": "Students complete an instructor-approved introductory project in their chosen pathway."
          },
          {
            "label": "Suggested hours",
            "text": "4 planning, 20 supervised project work, 6 inspection and assessment."
          }
        ]
      },
      {
        "n": 25,
        "month": 7,
        "title": "Intermediate Trade Skills",
        "outcomes": [],
        "steps": [
          {
            "label": "Interior Finishing",
            "text": "Joint finishing, surface preparation, and finishing sequence."
          },
          {
            "label": "Exterior Finishing",
            "text": "Cladding installation sequence and trim detailing."
          },
          {
            "label": "Framing and Cabinetry",
            "text": "Wall framing details, cabinet assembly, and alignment."
          },
          {
            "label": "Suggested hours",
            "text": "6 theory, 6 demonstrations, 14 practice, 4 assessment."
          }
        ]
      },
      {
        "n": 26,
        "month": 7,
        "title": "Quality Control and Problem Solving",
        "outcomes": [],
        "steps": [
          {
            "label": "Interior Finishing",
            "text": "Identifying surface defects and installation errors."
          },
          {
            "label": "Exterior Finishing",
            "text": "Identifying alignment, fastening, and weatherproofing defects."
          },
          {
            "label": "Framing and Cabinetry",
            "text": "Checking dimensions, alignment, and assembly quality."
          },
          {
            "label": "Suggested hours",
            "text": "6 theory, 6 demonstrations, 14 practice, 4 assessment."
          }
        ]
      },
      {
        "n": 27,
        "month": 7,
        "title": "Integrated Construction Project",
        "outcomes": [],
        "steps": [
          {
            "label": "This week",
            "text": "Students work in teams to plan and execute a supervised practical project using the skills learned in Months 4–7."
          },
          {
            "label": "Suggested hours",
            "text": "4 planning, 22 practical project work, 4 progress review."
          }
        ]
      },
      {
        "n": 28,
        "month": 7,
        "title": "Final Trade Competency Assessment",
        "outcomes": [],
        "steps": [
          {
            "label": "6 hours",
            "text": "Project planning and work instructions."
          },
          {
            "label": "16 hours",
            "text": "Supervised final practical assignment."
          },
          {
            "label": "4 hours",
            "text": "Quality inspection and corrections."
          },
          {
            "label": "4 hours",
            "text": "Individual competency assessment and instructor feedback."
          }
        ]
      },
      {
        "n": 29,
        "month": 8,
        "title": "Zoomlion Boom Lift",
        "outcomes": [],
        "steps": [
          {
            "label": "6 hours",
            "text": "Equipment identification and intended uses."
          },
          {
            "label": "8 hours",
            "text": "Boom, platform, controls, and safety systems."
          },
          {
            "label": "6 hours",
            "text": "Fall protection and working-at-height awareness."
          },
          {
            "label": "6 hours",
            "text": "Instructor-led inspection and equipment demonstration."
          },
          {
            "label": "4 hours",
            "text": "Safety knowledge assessment."
          }
        ]
      },
      {
        "n": 30,
        "month": 8,
        "title": "Small Mobile Crane",
        "outcomes": [],
        "steps": [
          {
            "label": "6 hours",
            "text": "Crane types and lifting applications."
          },
          {
            "label": "8 hours",
            "text": "Boom, hook, outriggers, rigging, and load charts."
          },
          {
            "label": "6 hours",
            "text": "Lifting zones, ground conditions, and signal communication."
          },
          {
            "label": "6 hours",
            "text": "Qualified instructor demonstration and lift-planning exercise."
          },
          {
            "label": "4 hours",
            "text": "Safety knowledge assessment."
          }
        ]
      },
      {
        "n": 31,
        "month": 8,
        "title": "Bobcat Skid-Steer Loader",
        "outcomes": [],
        "steps": [
          {
            "label": "6 hours",
            "text": "Equipment identification and applications."
          },
          {
            "label": "8 hours",
            "text": "Bucket, lift arms, attachments, and safety systems."
          },
          {
            "label": "6 hours",
            "text": "Pedestrian separation, ground hazards, and inspection awareness."
          },
          {
            "label": "6 hours",
            "text": "Instructor-led demonstration and hazard identification."
          },
          {
            "label": "4 hours",
            "text": "Safety knowledge assessment."
          }
        ]
      },
      {
        "n": 32,
        "month": 8,
        "title": "Forklift",
        "outcomes": [],
        "steps": [
          {
            "label": "6 hours",
            "text": "Forklift types and material-handling applications."
          },
          {
            "label": "8 hours",
            "text": "Forks, mast, counterweight, load stability, and capacity plates."
          },
          {
            "label": "6 hours",
            "text": "Pedestrian safety, load handling, and inspection awareness."
          },
          {
            "label": "6 hours",
            "text": "Instructor-led demonstration and final course review."
          },
          {
            "label": "4 hours",
            "text": "Final safety knowledge assessment."
          }
        ]
      }
    ]
  },
  "logistics": {
    "id": "logistics",
    "title": "Logistics",
    "program": "Logistics Skills and Workplace Readiness",
    "summary": "Calgary. 32 weeks, 960 hours, 30 hours a week. Round 1 is logistics English, writing, and computers. Round 2 is goods, tools, one logistics pathway, and awareness of 14 warehouse machines. Proposed training plan, not a driving qualification or operator certificate.",
    "source": "Instructor lesson plan binder, aligned to the eight-month curriculum",
    "studentPath": "In Student Practice, choose Logistics. Month 8 pairs with the warehouse equipment videos.",
    "dayNote": "Each teaching day is 6 hours. In weeks 21–28 the learner stays in one pathway: Warehouse Operations, Inventory and Stores, or Dispatch and Distribution. Those options are not three extra 30-hour courses.",
    "docs": [
      {
        "title": "Eight-month curriculum",
        "href": "https://drive.google.com/file/d/1EAfUfSx8ryoWpKeHpwGMyvxuzTOTbZVP/view",
        "note": "Logistics Skills and Workplace Readiness plan."
      },
      {
        "title": "Instructor lesson plan binder",
        "href": "https://drive.google.com/file/d/1y-Z5e3e657vdb7iJaK-izM8BA-R99D9r/view",
        "note": "Two-page plan for every week: outcomes, daily teaching, practice, and evidence. This is the week stream below."
      },
      {
        "title": "Instructor marking guide",
        "href": "https://drive.google.com/file/d/1aZPnvqXILYFilE_bj5xG0w1flRdYJvUm/view",
        "note": "Marking guide from the Logistics Curriculum folder."
      },
      {
        "title": "Practical skills checklist",
        "href": "https://drive.google.com/file/d/1zu_wGNLhajimpnK896yX2H47IPGmffvR/view",
        "note": "Practical skills assessment checklist."
      },
      {
        "title": "Illustrated textbook",
        "href": "https://drive.google.com/file/d/1miQKIh0frCTUSLW-d5BiNZ--_lt53JHQ/view",
        "note": "Logistics illustrated textbook."
      },
      {
        "title": "Student workbook",
        "href": "https://drive.google.com/file/d/1UnKGbgWcVAp5BPNs4RdbO0QNVk0tY7bA/view",
        "note": "Logistics student workbook."
      },
      {
        "title": "Weekly examinations instructor key",
        "href": "https://drive.google.com/file/d/1DcC-2a-eKS74AQXyQU5gf5oS5FjN3xpq/view",
        "note": "Instructor key for the weekly examinations."
      },
      {
        "title": "Weekly student examinations",
        "href": "https://drive.google.com/file/d/1Z2ZxfWvxk_8CltFHbcNDPc-LYArD0Voi/view",
        "note": "Weekly student examinations."
      }
    ],
    "months": [
      {
        "n": 1,
        "title": "Logistics English I",
        "objective": "Recognize, pronounce, understand, and use essential English vocabulary in warehouses, stores, and distribution workplaces.",
        "assessment": "Vocabulary and picture identification 30%. Listening 25%. Spoken identification and pronunciation 25%. Participation 20%."
      },
      {
        "n": 2,
        "title": "Logistics English II",
        "objective": "Understand routine logistics duties and communicate with supervisors, coworkers, receiving staff, and dispatch teams.",
        "assessment": "Listening and instruction following 30%. Job-duty role-play 30%. Hazard and discrepancy reporting 25%. Participation and teamwork 15%."
      },
      {
        "n": 3,
        "title": "Workplace Writing and Computer Skills",
        "objective": "Build sentences and digital skills used in job applications, warehouse records, and workplace communication.",
        "assessment": "Sentence building and workplace writing 30%. Computer practical 35%. Email and workplace document 20%. Resume and job application 15%."
      },
      {
        "n": 4,
        "title": "Goods Packaging and Storage",
        "objective": "Identify common goods and packaging, read product information, and follow storage, handling, and stock-rotation instructions.",
        "assessment": "Goods and packaging identification 35%. Storage and product matching 25%. Counting and units 20%. Handling and storage demonstration 20%.",
        "scope": "Specially controlled goods need product-specific procedures. Learners identify and report them. Specialist handling is outside this module."
      },
      {
        "n": 5,
        "title": "Warehouse Tools and Practical Skills",
        "objective": "Select tools, measure, scan, pack, and use selected manual handling aids under supervision.",
        "assessment": "Tool and equipment identification 20%. Measuring, weighing, and scanning 25%. Safe handling and packing 35%. Integrated warehouse task 20%.",
        "scope": "Powered trucks and automated machinery are demonstrated only by qualified instructors in this plan."
      },
      {
        "n": 6,
        "title": "Logistics Specialization I",
        "objective": "Start one selected logistics pathway and practise accurate, supervised entry-level routines.",
        "assessment": "Pathway knowledge 20%. Planning and document accuracy 25%. Practical project 40%. Safety and workstation organization 15%.",
        "scope": "Each learner selects Warehouse Operations, Inventory and Stores, or Dispatch and Distribution."
      },
      {
        "n": 7,
        "title": "Logistics Specialization II",
        "objective": "Continue the Month 6 pathway through harder supervised tasks, problem reporting, and team simulations.",
        "assessment": "Final pathway project 45%. Practical skills observation 25%. Quality control and problem solving 15%. Safety, teamwork, and communication 15%.",
        "scope": "Stock adjustments, dispatch release, and other controlled decisions follow the instructor or employer authorization procedure."
      },
      {
        "n": 8,
        "title": "Warehouse Equipment Awareness and Safety",
        "objective": "Introduce 14 warehouse equipment types, their main parts and uses, relevant checks, and the responsibilities of workers around each item.",
        "assessment": "Equipment identification 25%. Component and function knowledge 20%. Hazard recognition and accuracy scenarios 35%. Final written or oral assessment 20%.",
        "scope": "Awareness only. No independent powered-machine operation is required. Operator training and workplace authorization are separate."
      }
    ],
    "weeks": [
      {
        "n": 1,
        "month": 1,
        "title": "Logistics workplace introduction",
        "outcomes": [
          "Name five logistics roles and introduce yourself to a coworker.",
          "Identify receiving, storage, picking, packing and dispatch on a simple plan.",
          "Recognize essential signs and the designated pedestrian route.",
          "Follow a short direction and ask when a word is unclear."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model names, greetings and job roles with picture cards. Practice: Pairs introduce themselves and match five workers to duties. Evidence: Record an oral introduction and five role matches."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Explain how goods move through a training warehouse. Practice: Groups place receiving, storage, picking, packing and dispatch on a floor plan. Evidence: Collect a labelled plan and an oral description of one area."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Teach stop, exit, pedestrian, caution and required PPE vocabulary. Practice: Learners match signs to actions and trace the pedestrian route on a plan. Evidence: Check six sign meanings and one safe route explanation."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Model clear pronunciation and one-step directions using gestures. Practice: Pairs give directions between marked classroom stations; listener repeats the destination. Evidence: Use a listening checklist and record any clarification requested."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review workplace pictures and model a short arrival conversation. Practice: Each learner introduces themselves, identifies areas and follows two familiar instructions. Evidence: Retain the weekly oral checklist and a personal vocabulary page."
          }
        ]
      },
      {
        "n": 2,
        "month": 1,
        "title": "Goods and packaging vocabulary",
        "outcomes": [
          "Name common goods, containers and packaging materials.",
          "Read a simple item code and match it to a sample.",
          "Describe colour, size, quantity and unit without guessing.",
          "Explain a familiar handling symbol using simple English."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Present cartons, bins, pallets and parcels using real samples. Practice: Learners sort clean samples and say the name of each container. Evidence: Collect a ten-item picture-to-word sheet."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Model labels, item codes and common handling symbols. Practice: Pairs match labels to samples and explain fragile or keep-dry instructions. Evidence: Record six accurate label matches and two symbol explanations."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Teach colours, dimensions, quantities and written units. Practice: Learners describe similar cartons so a partner selects the correct one. Evidence: Keep a description sheet including number and unit."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Model pronunciation and spelling of confusing product words. Practice: Run a sample station circuit with word, photograph and label matching. Evidence: Check vocabulary logs and correct commonly confused words."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review how a description differs from an item code. Practice: Learners identify a mixed sample set and explain one unclear label. Evidence: Retain the weekly check and ten new vocabulary entries."
          }
        ]
      },
      {
        "n": 3,
        "month": 1,
        "title": "Tools and equipment vocabulary",
        "outcomes": [
          "Identify manual handling aids and basic packing tools.",
          "Name a scanner, parcel scale and their main functions.",
          "Identify powered equipment in photographs without operating it.",
          "Describe one component and request a demonstration."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Introduce hand trucks, platform carts and manual pallet jacks. Practice: Learners match names and uses on equipment photographs. Evidence: Keep a three-aid identification checklist."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Show scanner, scale, tape dispenser and safety cutter parts. Practice: Learners label stationary examples and explain what each tool does. Evidence: Collect a labelled tool sheet and four spoken descriptions."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Introduce forklift, conveyor and wrapper vocabulary from safe footage. Practice: Pause pictures to identify forks, mast, belt and turntable. Evidence: Record eight part-to-equipment matches."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Model a short equipment demonstration commentary. Practice: Pairs watch or observe, then describe the equipment using a sentence frame. Evidence: Retain a listening sheet and one spoken sequence."
          },
          {
            "label": "Friday",
            "text": "Instruction: Compare equipment names, components and everyday uses. Practice: Each learner identifies ten images and asks a relevant equipment question. Evidence: File the weekly check and update the vocabulary log."
          }
        ]
      },
      {
        "n": 4,
        "month": 1,
        "title": "Basic logistics instructions",
        "outcomes": [
          "Follow two-step instructions using familiar logistics verbs.",
          "Confirm the correct item and location before acting.",
          "Ask a focused clarification question when information is missing.",
          "Demonstrate the Month 1 vocabulary and listening outcomes."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model receive, count, scan, store, pick, pack and dispatch. Practice: Pairs sequence action cards and act out short instructions with empty cartons. Evidence: Collect a seven-action sequence and listening notes."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Demonstrate item, quantity and location read-back. Practice: Learners follow two-step instructions using labelled bins and small samples. Evidence: Record completion and any incorrect code or destination."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Contrast clear instructions with missing information. Practice: Pairs ask which item, how many or which location before proceeding. Evidence: Keep three appropriate clarification responses."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Review the class list of at least 100 selected logistics words. Practice: Learners rotate through picture, listening and speaking review stations. Evidence: Use the vocabulary log to identify gaps for reteaching."
          },
          {
            "label": "Friday",
            "text": "Instruction: Explain Month 1 assessment tasks and feedback criteria. Practice: Conduct picture identification, listening and spoken tasks; provide targeted review. Evidence: Retain assessment sheets, vocabulary evidence and a correction plan."
          }
        ]
      },
      {
        "n": 5,
        "month": 2,
        "title": "Daily work instructions",
        "outcomes": [
          "Extract item, quantity, location and time from a spoken instruction.",
          "Put a routine task into a logical sequence.",
          "Read aisle and bin references accurately.",
          "Confirm the task using a concise read-back."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model listening for who, what, how many and when. Practice: Learners highlight key details in a short supervisor briefing. Evidence: Keep a completed instruction-detail sheet."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Teach first, next, before, after and by a stated time. Practice: Pairs arrange receiving and picking actions in order. Evidence: Collect an ordered sequence and time statement."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Explain aisle, bay, shelf and bin references on a training map. Practice: Learners locate six addresses and give a partner directions. Evidence: Retain marked maps with location checks."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Model read-back and clarification when two codes sound alike. Practice: Learners exchange task cards and resolve an intentionally unclear detail. Evidence: Record exact questions and confirmed instructions."
          },
          {
            "label": "Friday",
            "text": "Instruction: Combine quantity, sequence, route and time in a job briefing. Practice: Each learner follows a simulated task and reports completion. Evidence: Retain the weekly observation and one progress message."
          }
        ]
      },
      {
        "n": 6,
        "month": 2,
        "title": "Logistics task communication",
        "outcomes": [
          "Describe receiving, storage, counting and dispatch duties.",
          "Report work progress with quantities and locations.",
          "Give a clear handover including unfinished work.",
          "Ask for help with a specific problem."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model descriptions of receiving checks and put-away. Practice: Pairs explain a pictured receiving sequence to a new coworker. Evidence: Keep a four-step spoken explanation checklist."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Teach stock count and replenishment progress language. Practice: Learners compare a count sheet with a task card and give updates. Evidence: Collect a quantity-based progress note."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Explain picking, packing, dispatch and return task vocabulary. Practice: Learners match duties to departments and explain who receives the handover. Evidence: Record six duty matches and a handover recipient."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Model completed work, pending work and help requests. Practice: Pairs hand over a partly completed order using a checklist. Evidence: Retain a handover sheet with status and unresolved issue."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review task language through rotating worker-supervisor roles. Practice: Each learner gives a progress update and requests help with an assigned issue. Evidence: File role-play scores and individual language feedback."
          }
        ]
      },
      {
        "n": 7,
        "month": 2,
        "title": "Safety and problem reporting",
        "outcomes": [
          "Recognize a hazard or discrepancy in a workplace scenario.",
          "Give a factual report with location and immediate action.",
          "Recognize warning and WHMIS awareness symbols.",
          "Follow the site reporting chain without attempting an unsafe fix."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model reporting visible damage, unstable loads and blocked routes. Practice: Learners sort photographs into stop-and-report or routine-check scenarios. Evidence: Keep explanations of four priority reports."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Introduce emergency instructions and WHMIS label awareness. Practice: Learners match selected signs to protective actions and locate the class emergency information. Evidence: Record sign responses and the designated reporting person."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Model factual injury, defect, shortage and wrong-label reports. Practice: Pairs separate observed facts from guesses in short scenarios. Evidence: Collect a four-field report: what, where, when and action."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Demonstrate a calm safety conversation and shift briefing. Practice: Groups role-play a stopped task, a report and supervisor acknowledgment. Evidence: Retain role-play notes including the stop decision."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review reporting language and the limits of introductory awareness. Practice: Each learner reports an assigned photo scenario and completes an incident note. Evidence: File oral and written evidence with corrective feedback."
          }
        ]
      },
      {
        "n": 8,
        "month": 2,
        "title": "Workplace communication practice",
        "outcomes": [
          "Understand routine instructions spoken in varied clear voices.",
          "Use respectful clarification and confirmation strategies.",
          "Protect private workplace information in a simulation.",
          "Demonstrate the Month 2 communication outcomes."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model listening strategies with two speakers and varied pace. Practice: Learners replay short instructions, record details and request repetition when needed. Evidence: Keep detail sheets and clarification attempts."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Teach respectful teamwork, turn-taking and confidentiality. Practice: Pairs practise disagreeing about a count using facts and a courteous question. Evidence: Record a respectful correction and private-information decision."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Model reporting completion and checking an unclear handover. Practice: Learners complete task cards and tell a partner what is done or pending. Evidence: Collect a completed-task message with an unresolved issue."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Review receiving, stock and dispatch communication stations. Practice: Learners rehearse integrated listening, duty descriptions and problem reports. Evidence: Identify individual gaps for final preparation."
          },
          {
            "label": "Friday",
            "text": "Instruction: Explain Month 2 assessment criteria and permitted supports. Practice: Conduct listening, role-play and reporting assessments with individual feedback. Evidence: Retain all component records and the monthly weighted result."
          }
        ]
      },
      {
        "n": 9,
        "month": 3,
        "title": "Basic workplace sentence structure",
        "outcomes": [
          "Build clear subject-verb-object logistics sentences.",
          "Use present and past tense for routine and completed work.",
          "Write a short question, negative and polite request.",
          "Check a sentence against a pictured task."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model who does what to which item. Practice: Learners arrange word cards into warehouse sentences. Evidence: Keep six complete subject-verb-object examples."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Contrast daily duties with work completed yesterday. Practice: Pairs change present-tense task sentences into past-tense reports. Evidence: Collect four accurate tense pairs."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Teach questions, negatives and polite clarification requests. Practice: Learners rewrite unclear or incomplete messages. Evidence: Retain two questions, two negatives and one request."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Model caption writing from logistics pictures and labels. Practice: Learners write short factual captions using item codes and quantities. Evidence: Check five captions against the source images."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review sentence order, capital letters and end punctuation. Practice: Each learner writes a short task update from a new picture sequence. Evidence: File the writing sample and corrected version."
          }
        ]
      },
      {
        "n": 10,
        "month": 3,
        "title": "Workplace writing",
        "outcomes": [
          "Write a concise shift note with order and quantity details.",
          "Report damage or shortage using facts.",
          "Read a basic order, pick list and delivery note.",
          "Complete receiving, stock and dispatch fields accurately."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model a short shift note with a clear task reference. Practice: Learners turn a spoken update into a three-sentence note. Evidence: Retain the original details and written note."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Teach objective wording for damage and delivery issues. Practice: Learners write reports from staged photographs without assigning blame. Evidence: Collect a factual report with location and action."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Model how to read item code, quantity, unit and destination. Practice: Pairs cross-check a pick list against an order and delivery note. Evidence: Mark two planted differences and record the response."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Demonstrate required fields on receiving, stock and dispatch forms. Practice: Learners complete three small forms from one consistent dataset. Evidence: Keep forms and a field-accuracy checklist."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review legibility, missing fields and traceable corrections. Practice: Each learner completes an order document set and a brief exception message. Evidence: Retain the documents and individual feedback."
          }
        ]
      },
      {
        "n": 11,
        "month": 3,
        "title": "Basic computer skills",
        "outcomes": [
          "Identify computer input, output and basic accessibility controls.",
          "Create, name, save and retrieve a file in the correct folder.",
          "Prepare a readable one-page workplace document.",
          "Prepare an email with a clear subject and correct attachment."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Demonstrate keyboard, mouse, screen and accessibility settings. Practice: Learners adjust text size and practise clicking, typing and selecting. Evidence: Record an independent navigation checklist."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Model folders, filenames, saving and reopening a document. Practice: Learners save a training note into a named course folder and retrieve it. Evidence: Verify the filename, folder and reopened content."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Demonstrate simple headings, paragraphs and a short table. Practice: Learners prepare a one-page stock-check note. Evidence: Retain the editable file and a readable preview."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Model recipient checking, subjects and attaching the intended file. Practice: Learners create an unsent training email and verify the attachment opens. Evidence: Check recipient, subject, message and attachment."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review safe file handling and recovering a misplaced document. Practice: Each learner creates, saves, retrieves and attaches a new task note. Evidence: File the digital practical checklist and feedback."
          }
        ]
      },
      {
        "n": 12,
        "month": 3,
        "title": "Digital workplace readiness",
        "outcomes": [
          "Enter stock quantities and verify simple spreadsheet totals.",
          "Prepare a basic resume with truthful experience details.",
          "Complete a simulated schedule, timesheet and warehouse screen.",
          "Demonstrate Month 3 writing and digital outcomes."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model spreadsheet rows, columns, quantities and totals. Practice: Learners enter five stock lines and check a SUM result against a manual total. Evidence: Retain the spreadsheet and both checked totals."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Explain resume sections and required application fields. Practice: Learners draft a simple resume and complete a mock application. Evidence: Keep a resume draft and a missing-field check."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Demonstrate schedule, timesheet and training warehouse fields. Practice: Learners enter a shift, break and quantity record using a supplied scenario. Evidence: Check time calculations and item references."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Review document, email and spreadsheet tasks together. Practice: Learners correct a planted data-entry error and practise the assessment sequence. Evidence: Record the correction method and readiness gaps."
          },
          {
            "label": "Friday",
            "text": "Instruction: Explain the Month 3 assessment and evidence requirements. Practice: Conduct writing, computer, email/document and resume tasks in a training environment. Evidence: Retain digital files, observation sheets and the monthly result."
          }
        ]
      },
      {
        "n": 13,
        "month": 4,
        "title": "Goods and product identification",
        "outcomes": [
          "Match a SKU and description to the intended product.",
          "Convert simple carton and unit quantities correctly.",
          "Recognize fragile, bulky, perishable or controlled goods.",
          "Count a mixed sample accurately and report uncertainty."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Demonstrate SKU, description and variant checks. Practice: Learners compare similar products with different sizes or codes. Evidence: Collect eight verified product matches."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Model units per case and simple quantity conversions. Practice: Learners count full cases and loose units using a stated pack size. Evidence: Keep calculations with units and source pack size."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Explain handling categories and referral for controlled goods. Practice: Groups match product cards to handling instructions or a supervisor review. Evidence: Record category choices and reasons for referral."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Demonstrate an organized counting method without double-counting. Practice: Learners count a mixed sample twice and compare totals. Evidence: Retain count sheets and resolved differences."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review product matching and quantity accuracy. Practice: Each learner identifies products, converts quantities and flags an unknown item. Evidence: File weekly evidence and a corrected count."
          }
        ]
      },
      {
        "n": 14,
        "month": 4,
        "title": "Packaging and identification",
        "outcomes": [
          "Select suitable packaging for a specified training product.",
          "Distinguish product, location, handling and shipping labels.",
          "Recognize packaging defects that need review.",
          "Pack and label a small inert item to a stated standard."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Compare cartons, totes, cushioning, wrap and sealing materials. Practice: Learners match packaging samples to product protection needs. Evidence: Keep a selection sheet with one reason per choice."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Demonstrate the purpose and fields of four label types. Practice: Pairs match labels to product, shelf, handling instruction or shipment. Evidence: Collect eight label classifications."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Show damaged, undersized and unsuitable packaging examples. Practice: Learners inspect samples and mark accept or review with reasons. Evidence: Retain a packaging-condition checklist."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Model a small-item packing and label-placement sequence. Practice: Learners pack an inert item and check protection, seal and readable label. Evidence: Photograph or retain a checked training package."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review selection decisions and correct a packing defect. Practice: Each learner selects packaging, explains a label and prepares a checked package. Evidence: File weekly assessment and the corrected checklist."
          }
        ]
      },
      {
        "n": 15,
        "month": 4,
        "title": "Storage conditions and rotation",
        "outcomes": [
          "Interpret a training storage address and product condition.",
          "Apply FIFO or FEFO when the task specifies it.",
          "Separate damaged or unidentified goods for review.",
          "Record the correct location and rotation decision."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Demonstrate aisle, bay, level and bin addresses. Practice: Learners place product cards in a tabletop storage map. Evidence: Keep six location matches and a written address."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Compare FIFO receipt dates and FEFO expiry dates. Practice: Learners arrange dated cards under each stated rotation rule. Evidence: Collect two ordered sequences with reasons."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Explain review, quarantine and restricted-stock labels. Practice: Groups decide whether sample goods may be stored or need review. Evidence: Record four decisions and the reporting contact."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Model checking location, product condition and rotation together. Practice: Learners run a supervised tabletop put-away and retrieval exercise. Evidence: Retain location and rotation records."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review conflicts between dates, location and product instructions. Practice: Each learner selects a permitted unit and reports one exception. Evidence: File the weekly check and corrective explanation."
          }
        ]
      },
      {
        "n": 16,
        "month": 4,
        "title": "Checking and protecting stock",
        "outcomes": [
          "Verify product details, dates, quantity and handling instructions.",
          "Identify visible packaging or pallet damage.",
          "Record shortages and unsuitable storage factually.",
          "Demonstrate Month 4 goods, packaging and storage outcomes."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model an inspection using product, date and quantity fields. Practice: Learners compare a delivery record with labelled sample goods. Evidence: Retain a checked product-details sheet."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Show photographs of packaging, pallet and product defects. Practice: Learners distinguish acceptable samples from those needing review. Evidence: Record defect descriptions without unsafe close inspection."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Demonstrate a shortage and unsuitable-storage report. Practice: Pairs write an exception report and propose referral, not unauthorized release. Evidence: Collect a report with actual quantity and location."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Review identification, conversion, packaging and rotation stations. Practice: Learners correct earlier errors and rehearse the practical exam sequence. Evidence: Use a readiness checklist to target remediation."
          },
          {
            "label": "Friday",
            "text": "Instruction: Explain Month 4 practical and written assessment tasks. Practice: Assess identification, storage matching, counting and handling demonstrations. Evidence: Retain monthly component scores and individual feedback."
          }
        ]
      },
      {
        "n": 17,
        "month": 5,
        "title": "Measuring weighing and scanning",
        "outcomes": [
          "Measure package dimensions and record units.",
          "Check scale capacity, zero, units and a stable result.",
          "Scan the intended label into the correct training field.",
          "Find and correct a measurement or data-entry discrepancy."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model length, width and height using a consistent task convention. Practice: Learners measure three cartons twice and compare results. Evidence: Keep dimension records with units and a repeat check."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Demonstrate a parcel scale: firm setup, capacity, zero and units. Practice: Learners weigh light samples and wait for the stable indication. Evidence: Retain weight, unit and setup checks."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Demonstrate scanner window, trigger, target field and confirmation. Practice: Learners scan item and location labels into a practice screen. Evidence: Keep screen results checked against the intended codes."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Explain task-specific tare and common measurement errors. Practice: Learners compare gross and net exercises and correct a wrong-unit entry. Evidence: Collect one explained correction and both labelled results."
          },
          {
            "label": "Friday",
            "text": "Instruction: Combine dimensions, weight and scanning in a parcel record. Practice: Each learner measures, weighs, scans and verifies a new package. Evidence: File the weekly practical checklist and parcel record."
          }
        ]
      },
      {
        "n": 18,
        "month": 5,
        "title": "Packing tools and workstations",
        "outcomes": [
          "Inspect and select basic packing tools for a task.",
          "Use a demonstrated safety cutter under supervision.",
          "Pack, seal and label a small item to a checklist.",
          "Store tools and report a defect correctly."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Identify tape dispensers, safety cutters and packing accessories. Practice: Learners inspect stationary tools and select the appropriate item. Evidence: Keep a tool-selection and condition checklist."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Demonstrate carton choice, cushioning, seal and label position. Practice: Learners prepare a package using pre-cut materials. Evidence: Retain a package-quality check."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Model the approved cutter procedure and workstation posture. Practice: Learners practise on designated scrap after individual instruction. Evidence: Record supervision, blade control and safe completion."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Demonstrate a full packing sequence and correct tool storage. Practice: Learners pack, label, check and restore the station. Evidence: Keep completed packing and storage checklists."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review defects, unsuitable tools and unclear packing instructions. Practice: Each learner prepares a package and reports a planted tool defect. Evidence: File the weekly observation and correction plan."
          }
        ]
      },
      {
        "n": 19,
        "month": 5,
        "title": "Manual handling aids",
        "outcomes": [
          "Identify manual-aid components and stated limits.",
          "Assess a load and select a suitable handling aid.",
          "Plan a route and identify trapping or stability concerns.",
          "Use an approved manual aid with a suitable training load under supervision."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Demonstrate hand-truck, cart and manual pallet-jack components. Practice: Learners label handles, support surfaces, forks and wheels on stationary aids. Evidence: Keep a component and capacity-information checklist."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Model load assessment and equipment choice. Practice: Learners compare load size, balance, grip and route on scenario cards. Evidence: Collect aid selections with assistance decisions."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Demonstrate route inspection and hand/foot protection points. Practice: Learners trace a route and identify pinch, slope and doorway concerns. Evidence: Retain a route sketch with stop points."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Demonstrate the specific manual aid using a light stable load. Practice: Learners practise individually on a level controlled route after instruction. Evidence: Record pre-use check, stability and supervised completion."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review when to stop, seek help or change equipment. Practice: Each learner plans and completes an approved manual-aid task. Evidence: File the observation, load description and feedback."
          }
        ]
      },
      {
        "n": 20,
        "month": 5,
        "title": "Integrated warehouse practice",
        "outcomes": [
          "Select tools and manual aids for a simulated order.",
          "Produce accurate count, scan, dimension and weight records.",
          "Pack and check the correct items.",
          "Demonstrate Month 5 practical outcomes and report defects."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model planning a small warehouse order from a task card. Practice: Learners choose tools, handling aid and check sequence. Evidence: Collect a written or pictured task plan."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Demonstrate linked counting, measuring, weighing and scanning records. Practice: Learners complete three parcel records and verify them against the order. Evidence: Retain records with units and scan confirmation."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Model packing checks, tool care and defect reporting. Practice: Learners pack one order, restore tools and report a planted defect. Evidence: Keep package and tool-care checklists."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Review practical station criteria and correct earlier errors. Practice: Learners rehearse individual tasks with targeted coaching. Evidence: Record remediation and readiness for assessment."
          },
          {
            "label": "Friday",
            "text": "Instruction: Explain Month 5 practical assessment and stopping rules. Practice: Assess identification, measurement/scanning, handling/packing and an integrated task. Evidence: Retain component scores, evidence and the monthly result."
          }
        ]
      },
      {
        "n": 21,
        "month": 6,
        "title": "Pathway orientation and records",
        "outcomes": [
          "Confirm one selected pathway and its routine responsibilities.",
          "Identify required source documents and record fields.",
          "Follow a demonstrated document-to-task sequence.",
          "Explain which decisions require supervisor approval.",
          "Teach one selected pathway: WO = Warehouse Operations; IS = Inventory and Stores; DD = Dispatch and Distribution."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Introduce the three pathways and confirm each learner's selection. Practice: WO: map receiving to picking; IS: map receipts and issues; DD: map order to handover. Evidence: Record the chosen pathway and a simple process map."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Demonstrate source records and their required fields. Practice: WO: read a receipt and pick list; IS: read a bin card; DD: read a packing list and label. Evidence: Keep a correctly annotated document for the selected pathway."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Model matching an item, reference and location across records. Practice: WO: match put-away records; IS: match SKU and bin; DD: match order and destination. Evidence: Collect a three-record matching exercise."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Explain traceability, actual quantities and approval limits. Practice: WO: record actual receipt; IS: enter a training count; DD: prepare a draft dispatch entry. Evidence: Retain the entry and one approval question."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review a short pathway task with a clear handover. Practice: Learners complete their selected pathway's basic record set and explain the next step. Evidence: File individual record accuracy and oral feedback."
          }
        ]
      },
      {
        "n": 22,
        "month": 6,
        "title": "Planning and checking the task",
        "outcomes": [
          "Plan a selected-pathway task before handling goods or records.",
          "Verify the item, quantity, location and source instruction.",
          "Identify one conflict or missing detail and seek approval.",
          "Produce a checked plan and appropriate source documents.",
          "Teach one selected pathway: WO = Warehouse Operations; IS = Inventory and Stores; DD = Dispatch and Distribution."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model a task plan with source, steps, checks and approval points. Practice: WO: plan put-away; IS: define a count area; DD: plan shipment preparation. Evidence: Collect an initial plan for the selected pathway."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Demonstrate matching task details before starting. Practice: WO: match SKU/location/route; IS: match SKU/unit/bin; DD: match order/address/collection time. Evidence: Keep a completed pre-task check."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Explain how to check quantities against a reliable source. Practice: WO: compare receipt to goods; IS: count independently; DD: compare order to package list. Evidence: Record actual quantities with units."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Model handling a missing or conflicting instruction. Practice: WO: unclear destination; IS: unknown pack size; DD: conflicting address. Evidence: Retain a clarification request and instructor response."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review plan quality before authorizing the simulation. Practice: Learner revises the plan, confirms documents and explains the task sequence. Evidence: File the final plan and readiness observation."
          }
        ]
      },
      {
        "n": 23,
        "month": 6,
        "title": "Basic pathway procedures",
        "outcomes": [
          "Follow the basic procedure in the selected pathway.",
          "Keep item and document references linked through the task.",
          "Check actual results and report a variance.",
          "Complete a supervised task with a traceable record.",
          "Teach one selected pathway: WO = Warehouse Operations; IS = Inventory and Stores; DD = Dispatch and Distribution."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Demonstrate the selected pathway procedure end to end. Practice: WO: receive and identify; IS: record a receipt; DD: pick and check an order. Evidence: Keep a step-order checklist."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Model the next controlled record and physical step. Practice: WO: put away light stock; IS: record a training issue; DD: pack and label. Evidence: Retain the linked location or transaction entry."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Demonstrate retrieval or reconciliation against the original instruction. Practice: WO: retrieve specified goods; IS: check a running balance; DD: compare packed items with the order. Evidence: Record a verification against the source."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Explain variance reporting and controlled staging. Practice: WO: flag wrong location; IS: flag count difference; DD: stage a shipment pending release. Evidence: Keep the exception report and status label."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review the complete pathway record trail. Practice: Learner completes one new task in the selected pathway and gives a handover. Evidence: File the task record, observed checks and feedback."
          }
        ]
      },
      {
        "n": 24,
        "month": 6,
        "title": "Foundation practical project",
        "outcomes": [
          "Plan a foundation project in the selected pathway.",
          "Complete supervised steps and keep required records.",
          "Inspect the result against the source brief.",
          "Explain corrections and demonstrate the Month 6 outcomes.",
          "Teach one selected pathway: WO = Warehouse Operations; IS = Inventory and Stores; DD = Dispatch and Distribution."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Explain the project brief, roles and assessment criteria. Practice: WO: plan receipt/storage/pick; IS: plan count/variance report; DD: plan shipment/handover. Evidence: Approve a written or pictured project plan."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Demonstrate only the project-specific checks that need reinforcement. Practice: WO: receive and put away; IS: perform first count; DD: pick and pack. Evidence: Collect intermediate records and individual observation notes."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Review progress and correct process errors before continuation. Practice: WO: retrieve an order; IS: recount and compare; DD: label and verify documents. Evidence: Retain checked outputs and exception notes."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Model inspection against the original brief. Practice: Learners inspect their project, propose corrections and obtain instructor approval. Evidence: Keep the inspection sheet and approved correction trail."
          },
          {
            "label": "Friday",
            "text": "Instruction: Conduct individual project explanations and Month 6 review. Practice: Each learner demonstrates their contribution and responds to a new small scenario. Evidence: File monthly component scores, project evidence and feedback."
          }
        ]
      },
      {
        "n": 25,
        "month": 7,
        "title": "Intermediate pathway skills",
        "outcomes": [
          "Handle a multi-item task within the selected pathway.",
          "Maintain separation between orders, locations or transactions.",
          "Use priorities and stock rotation specified in the brief.",
          "Trace a result to its source record and explain the checks.",
          "Teach one selected pathway: WO = Warehouse Operations; IS = Inventory and Stores; DD = Dispatch and Distribution."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model how complexity increases when several items are active. Practice: WO: sequence receipts/picks; IS: plan cycle counts; DD: sequence two orders. Evidence: Keep an ordered plan with separate references."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Demonstrate separation and identity checks at each step. Practice: WO: replenish a location; IS: trace receipt/issue entries; DD: pack orders separately. Evidence: Retain a cross-reference check."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Explain rotation and priority rules supplied with the task. Practice: WO: pick eligible stock; IS: check dated lots; DD: meet a stated collection order. Evidence: Record the rule and selection decision."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Demonstrate tracking progress without losing record accuracy. Practice: WO: complete multi-line picks; IS: reconcile a count; DD: record shipment status. Evidence: Collect checked pathway outputs."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review common cross-order and cross-unit errors. Practice: Learner completes an individual multi-item task and explains two checks. Evidence: File the weekly record trail and observation."
          }
        ]
      },
      {
        "n": 26,
        "month": 7,
        "title": "Quality control and problem solving",
        "outcomes": [
          "Detect a planted quality error in goods or records.",
          "Investigate using reliable source information.",
          "Propose a correction without unauthorized changes.",
          "Verify and explain an approved correction.",
          "Teach one selected pathway: WO = Warehouse Operations; IS = Inventory and Stores; DD = Dispatch and Distribution."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Model checking identity, quantity, condition and destination. Practice: WO: find wrong stock; IS: find a count variance; DD: find an address error. Evidence: Collect a defect log with source references."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Demonstrate fact-finding without assuming a cause. Practice: WO: compare location records; IS: recount and trace entries; DD: compare order and label. Evidence: Keep evidence used to confirm the error."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Explain correction proposals and approval points. Practice: WO: propose relocation; IS: propose a balance correction; DD: propose a replacement label. Evidence: Retain the proposal without altering the source."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Demonstrate approved correction and independent recheck. Practice: Learners correct only after instructor authorization and verify against the original task. Evidence: Keep approval, correction and recheck evidence."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review how a quality report supports prevention. Practice: Each learner investigates a new pathway error and presents a concise report. Evidence: File the report, observed reasoning and feedback."
          }
        ]
      },
      {
        "n": 27,
        "month": 7,
        "title": "Integrated logistics project",
        "outcomes": [
          "Coordinate an integrated team project using shared source records.",
          "Perform an individually assigned selected-pathway role.",
          "Maintain accurate status, exceptions and handovers.",
          "Use progress review to improve the final project.",
          "Teach one selected pathway: WO = Warehouse Operations; IS = Inventory and Stores; DD = Dispatch and Distribution."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Introduce shared orders, stock records and individual responsibilities. Practice: WO: plan flow; IS: plan record control; DD: plan shipment preparation. Evidence: Approve a team plan with named individual outputs."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Review the first project milestone and expected checks. Practice: WO: receive/store; IS: record transactions; DD: verify orders and packing needs. Evidence: Collect each learner's milestone record."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Demonstrate a coordinated handover using confirmed data. Practice: WO: replenish/pick; IS: investigate the set variance; DD: prepare checked packages. Evidence: Retain linked handovers and exception reports."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Lead a progress review against project criteria. Practice: Teams identify gaps, request approvals and complete supervised project work. Evidence: Keep the review notes and resulting corrections."
          },
          {
            "label": "Friday",
            "text": "Instruction: Model final project status reporting with individual evidence. Practice: Learners present completed outputs, pending approvals and next steps. Evidence: File individual observations and capstone preparation feedback."
          }
        ]
      },
      {
        "n": 28,
        "month": 7,
        "title": "Final pathway competency assessment",
        "outcomes": [
          "Plan an individual final assignment in the selected pathway.",
          "Complete the required supervised work and records.",
          "Inspect and correct results through the approval process.",
          "Explain evidence of Month 7 practical competency.",
          "Teach one selected pathway: WO = Warehouse Operations; IS = Inventory and Stores; DD = Dispatch and Distribution."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Explain the final brief, criteria and permitted supports. Practice: WO: plan receipt/storage/pick; IS: plan count/audit trail; DD: plan order-to-dispatch simulation. Evidence: Approve the individual plan without completing it for the learner."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Clarify task requirements before the independent assessment attempt. Practice: Learners begin the selected-pathway assignment under supervision. Evidence: Record observed sequence, identity and quantity checks."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Observe completion without routine coaching during the assessed attempt. Practice: WO: finish retrieval; IS: reconcile records; DD: finish checked packages and documents. Evidence: Retain actual outputs and exception decisions."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Explain the inspection and controlled correction stage. Practice: Learners inspect, request approval for corrections and recheck final outputs. Evidence: Keep the original result and correction trail."
          },
          {
            "label": "Friday",
            "text": "Instruction: Conduct individual questioning and feedback on the evidence. Practice: Learner explains decisions, demonstrates any reassessed gap and gives a handover. Evidence: File Month 7 weighted results and any further learning plan."
          }
        ]
      },
      {
        "n": 29,
        "month": 8,
        "title": "Powered trucks and elevated picking",
        "outcomes": [
          "Distinguish counterbalance forklift, reach truck, pallet stacker and order picker.",
          "Match major parts to their functions in each demonstration.",
          "Recognize pedestrian, load and elevated-platform hazards.",
          "Explain the limits of an awareness course and when to seek qualified help."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Introduce counterbalance forklift uses and visible components. Practice: Watch a short instructor demonstration; pause on forks, mast, carriage and capacity information. Evidence: Collect a labelled diagram and a pedestrian-separation explanation."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Compare a reach truck with a counterbalance forklift. Practice: Pause the demonstration on mast, reach mechanism, load arms and operator compartment. Evidence: Keep four part/function matches and a use comparison."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Explain a pallet stacker's purpose and main parts. Practice: Identify forks, mast, load wheels and model-specific controls in a stationary view. Evidence: Record identification and one trapping-point warning."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Explain order picking and raised-platform awareness. Practice: Watch an instructor demonstration; identify platform, controls and operator protection. Evidence: Keep a raised-platform hazard and referral response."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review all four types using pause-and-explain questions. Practice: Learners identify parts, explain checks and respond to pedestrian/load scenarios. Evidence: File the weekly awareness assessment and feedback."
          }
        ]
      },
      {
        "n": 30,
        "month": 8,
        "title": "Pallet movement and manual aids",
        "outcomes": [
          "Identify manual pallet jack, powered pallet jack, hand truck and platform cart.",
          "Explain handles, forks, wheels, controls and load-support parts.",
          "Select an aid for a stated task and identify limits.",
          "Explain route, stability and trapping-point decisions."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Review manual pallet-jack parts using a short demonstration. Practice: Pause on handle, forks, load wheels and steering wheels; explain their roles. Evidence: Collect four labelled parts and one capacity check."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Introduce the powered pallet jack and model-specific controls. Practice: Observe a qualified demonstration and compare powered travel with the manual aid. Evidence: Record the distinction and an authorization question."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Demonstrate a hand truck using a suitable light training load. Practice: Identify handle, frame, wheels and toe plate; discuss load support. Evidence: Keep a part/function sheet and a stability explanation."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Demonstrate a platform cart and task selection. Practice: Identify deck, handle, wheels and any fitted brake; compare route and load scenarios. Evidence: Collect two aid choices with reasons."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review route, assistance and trapping-point scenarios. Practice: Learners identify all four aids and explain when to stop or request help. Evidence: Retain the weekly awareness check and feedback."
          }
        ]
      },
      {
        "n": 31,
        "month": 8,
        "title": "Conveyors wrapping and dock equipment",
        "outcomes": [
          "Identify a conveyor, pallet stretch wrapper and dock leveller.",
          "Match guards, stop controls and moving components to functions.",
          "Recognize entanglement, rotation and dock-edge risks.",
          "Explain fault reporting and the limits of emergency stops."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Explain conveyor flow and visible guarded components. Practice: Watch an instructor clip; pause on belt/rollers, drive guards and stop controls. Evidence: Keep a component map and a jam-report response."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Introduce a pallet stretch wrapper and controlled access. Practice: Pause on turntable, film carriage, mast and guards; describe moving areas. Evidence: Record part functions and a safe viewing position."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Explain dock leveller platform, lip and loading interface. Practice: Use a qualified demonstration or clear staged footage to identify components and signals. Evidence: Collect a diagram and trailer-security questions."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Model reporting a jam, failed guard or dock signal conflict. Practice: Learners discuss photo scenarios and identify the qualified person to contact. Evidence: Retain stop-and-report decisions with reasons."
          },
          {
            "label": "Friday",
            "text": "Instruction: Review three machines with component and hazard questions. Practice: Learners explain safe boundaries and why a stop button is not isolation. Evidence: File the awareness check and corrective feedback."
          }
        ]
      },
      {
        "n": 32,
        "month": 8,
        "title": "Scanning weighing and floor care",
        "outcomes": [
          "Identify scanner, parcel scale and floor scrubber dryer parts.",
          "Explain scan confirmation and accurate scale readings.",
          "Recognize floor-care access, wet-surface and product controls.",
          "Demonstrate the Month 8 equipment-awareness outcomes."
        ],
        "steps": [
          {
            "label": "Monday",
            "text": "Instruction: Review scanner window, trigger, display and charging arrangement. Practice: Watch a short instructor demonstration and compare intended label with confirmed screen entry. Evidence: Keep a scan-verification sheet and posture check."
          },
          {
            "label": "Tuesday",
            "text": "Instruction: Review scale platform, display, zero, units and tare function. Practice: Pause a weighing demonstration to check capacity, stable setup and reading. Evidence: Retain a weight-with-unit record and a tare explanation."
          },
          {
            "label": "Wednesday",
            "text": "Instruction: Introduce scrubber dryer brush/pad, squeegee and tanks. Practice: Watch a qualified demonstration; identify wet-floor controls and product instructions. Evidence: Collect part/function matches and a restricted-access decision."
          },
          {
            "label": "Thursday",
            "text": "Instruction: Review all 14 equipment types using short clips and stills. Practice: Learners rotate through identification, component and scenario review stations. Evidence: Record remaining gaps and provide targeted explanation."
          },
          {
            "label": "Friday",
            "text": "Instruction: Explain the final awareness check and course review. Practice: Assess equipment identification, components, scenarios and a final written/oral check. Evidence: Retain Month 8 results, final feedback and outstanding learning needs."
          }
        ]
      }
    ]
  },
  "community": {
    "id": "community",
    "title": "Community Support",
    "program": "Community Support Worker Skills and Workplace Readiness",
    "summary": "Calgary. 32 weeks, 960 hours, 30 hours a week. Round 1 is community-support English and computers. Round 2 is the support role, documentation, resources, simulations, and a proposed supervised practicum. This does not confer a clinical or regulated credential.",
    "source": "Community Support Worker instructor lesson plan binder",
    "credit": "Yonas Tesfagabr",
    "studentPath": "In Student Practice, choose Community Support. The 25 picture workbooks sit beside this stream.",
    "dayNote": "Each day is 6 hours: 1 hour review and language modelling, 1 hour demonstration, 2 hours guided practice, 1 hour role-play or scenario, and 1 hour feedback. Use fictional situations unless an approved placement says otherwise.",
    "docs": [
      {
        "title": "Eight-month curriculum",
        "href": "https://drive.google.com/file/d/1OQUKC-4N6mqwZf4NdhT4vBs5Ritp13oQ/view",
        "note": "Community Support Worker eight-month plan."
      },
      {
        "title": "Instructor lesson plan binder",
        "href": "https://drive.google.com/file/d/15R0-JV0Gs7Ca4pgzneSIz40ffKhKIMkj/view",
        "note": "Weekly outcomes, five-day sequence, preparation, evidence, and safeguards. This is the week stream below."
      },
      {
        "title": "Weekly lesson plans",
        "href": "https://drive.google.com/drive/folders/1KRUb8UQmZ3VFNmOScD76w0GZ8TWpYeva",
        "note": "One PDF for each of the 32 weeks."
      },
      {
        "title": "Instructor marking guide",
        "href": "https://drive.google.com/file/d/1IoIhaDtb7brGfsUitdToUK-mDc5p_Z0m/view",
        "note": "32-week instructor marking guide."
      },
      {
        "title": "Practical skills checklist",
        "href": "https://drive.google.com/file/d/1tk9YVr6OK7hRJ7CML3wkLVWovxlnDtA0/view",
        "note": "Complete practical skills assessment checklists."
      },
      {
        "title": "Student workbook",
        "href": "https://drive.google.com/file/d/1awN9DpSWJ8m7mdNS7w8h5xFU4KY393x-/view",
        "note": "Complete 32-week student workbook."
      },
      {
        "title": "Textbook",
        "href": "https://drive.google.com/file/d/1Y-ckvt3AnlyD-XZ7ZBOIIK8zbuiNVkR7/view",
        "note": "Community Support Worker textbook."
      },
      {
        "title": "Weekly student examinations",
        "href": "https://drive.google.com/file/d/1_uHc8xRBzd61wurQtBbHGQxVbwx6BmOf/view",
        "note": "Weekly student examinations for 32 weeks."
      }
    ],
    "months": [
      {
        "n": 1,
        "title": "Community Support English I: Vocabulary and Basic Duties",
        "objective": "Identify essential terms, recognize job responsibilities, and follow familiar instructions.",
        "assessment": "Vocabulary identification 30%. Listening 25%. Pronunciation and speaking 25%. Participation 20%."
      },
      {
        "n": 2,
        "title": "Community Support English II: Communication and Safety",
        "objective": "Follow routine instructions, ask for clarification, communicate basic client needs, and report concerns.",
        "assessment": "Listening 30%. Communication role-play 30%. Safety reporting 25%. Teamwork 15%."
      },
      {
        "n": 3,
        "title": "Workplace Writing and Digital Literacy",
        "objective": "Write simple workplace notes, complete basic forms, use email, and prepare a resume.",
        "assessment": "Writing 30%. Computer practical 35%. Workplace documentation 20%. Resume and job application 15%."
      },
      {
        "n": 4,
        "title": "CSW Role, Ethics and Professional Responsibilities",
        "objective": "Explain the role, keep professional boundaries, recognize ethical concerns, and know when to involve a supervisor.",
        "assessment": "Knowledge test 25%. Ethical scenarios 30%. Communication activities 25%. Participation 20%."
      },
      {
        "n": 5,
        "title": "Person-Centred Support and Documentation",
        "objective": "Communicate respectfully, recognize preferences, follow an established plan, and write factual notes.",
        "assessment": "Client communication role-play 30%. Documentation 30%. Support-plan exercise 25%. Participation 15%."
      },
      {
        "n": 6,
        "title": "Community Resources, Referrals and Advocacy",
        "objective": "Identify community services, find reliable information, explain a referral, and support self-advocacy.",
        "assessment": "Resource identification 25%. Referral scenarios 30%. Resource project 30%. Participation 15%."
      },
      {
        "n": 7,
        "title": "Applied Skills and Workplace Simulations",
        "objective": "Perform defined entry-level tasks under supervision, keep boundaries, and respond to concerns.",
        "assessment": "Practical simulations 40%. Documentation 20%. Safety and professional judgment 25%. Teamwork 15%."
      },
      {
        "n": 8,
        "title": "Supervised Practicum and Employment Readiness",
        "objective": "Apply the learning under supervision in a suitable community-service setting.",
        "assessment": "Supervisor evaluation 40%. Workplace skills 30%. Documentation and professional conduct 20%. Reflection 10%.",
        "scope": "The practicum is a proposal. Duties must match the learner’s competence, the supervision, and the site. No clinical, therapeutic, or restricted care."
      }
    ],
    "weeks": [
      {
        "n": 1,
        "month": 1,
        "title": "Workplace orientation, roles and greetings",
        "outcomes": [
          "Identify client, volunteer, supervisor, colleague and community worker roles",
          "Use respectful greetings and introduce oneself",
          "Ask for clarification when a duty is unclear"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Orientation and baseline English check"
          },
          {
            "label": "Day 2",
            "text": "People and job-title vocabulary"
          },
          {
            "label": "Day 3",
            "text": "Greeting dialogues and listening"
          },
          {
            "label": "Day 4",
            "text": "Role cards and supervised simulations"
          },
          {
            "label": "Day 5",
            "text": "Vocabulary and speaking assessment"
          }
        ]
      },
      {
        "n": 2,
        "month": 1,
        "title": "Client needs, daily routines and accessibility",
        "outcomes": [
          "Name common client needs and daily living activities",
          "Recognize accessibility and mobility vocabulary",
          "Explain that physical assistance requires training and authorization"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Client needs and preferences"
          },
          {
            "label": "Day 2",
            "text": "Daily routines and action verbs"
          },
          {
            "label": "Day 3",
            "text": "Accessibility and mobility awareness"
          },
          {
            "label": "Day 4",
            "text": "Picture-supported listening and speaking"
          },
          {
            "label": "Day 5",
            "text": "Identification stations and feedback"
          }
        ]
      },
      {
        "n": 3,
        "month": 1,
        "title": "Community places and service vocabulary",
        "outcomes": [
          "Identify common community services and facilities",
          "Explain where to find food, housing and settlement support",
          "Use simple location and direction sentences"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Community facilities and service terms"
          },
          {
            "label": "Day 2",
            "text": "Service cards and maps"
          },
          {
            "label": "Day 3",
            "text": "Directions and transportation language"
          },
          {
            "label": "Day 4",
            "text": "Resource matching and dialogues"
          },
          {
            "label": "Day 5",
            "text": "Resource identification check"
          }
        ]
      },
      {
        "n": 4,
        "month": 1,
        "title": "Instructions, action verbs and review",
        "outcomes": [
          "Understand short workplace directions",
          "Repeat an instruction accurately",
          "Use simple questions and report uncertainty"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Action verbs and task sequences"
          },
          {
            "label": "Day 2",
            "text": "Supervisor instructions and read-back"
          },
          {
            "label": "Day 3",
            "text": "Clarification and stop-and-report phrases"
          },
          {
            "label": "Day 4",
            "text": "Integrated language practice"
          },
          {
            "label": "Day 5",
            "text": "Month 1 review and assessment"
          }
        ]
      },
      {
        "n": 5,
        "month": 2,
        "title": "Schedules, tasks and supervisor communication",
        "outcomes": [
          "Read a basic schedule and assigned duties",
          "Confirm who supervises an activity",
          "Communicate delays or missing information"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Shift and timetable vocabulary"
          },
          {
            "label": "Day 2",
            "text": "Task lists and prioritizing"
          },
          {
            "label": "Day 3",
            "text": "Supervisor dialogues"
          },
          {
            "label": "Day 4",
            "text": "Schedule-reading stations"
          },
          {
            "label": "Day 5",
            "text": "Written and oral check"
          }
        ]
      },
      {
        "n": 6,
        "month": 2,
        "title": "Respectful client communication",
        "outcomes": [
          "Demonstrate active listening and respectful tone",
          "Ask permission before helping",
          "Recognize communication barriers"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Listening and empathy"
          },
          {
            "label": "Day 2",
            "text": "Open and closed questions"
          },
          {
            "label": "Day 3",
            "text": "Consent language and respectful requests"
          },
          {
            "label": "Day 4",
            "text": "Partner role-play"
          },
          {
            "label": "Day 5",
            "text": "Communication observation"
          }
        ]
      },
      {
        "n": 7,
        "month": 2,
        "title": "Safety awareness and reporting",
        "outcomes": [
          "Identify common workplace hazards",
          "Describe whom to contact in an emergency",
          "Report concerns promptly without attempting untrained interventions"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Hazard and incident vocabulary"
          },
          {
            "label": "Day 2",
            "text": "Emergency contact pathways"
          },
          {
            "label": "Day 3",
            "text": "Stop-work and report practice"
          },
          {
            "label": "Day 4",
            "text": "Simulated incident dialogues"
          },
          {
            "label": "Day 5",
            "text": "Safety scenario assessment"
          }
        ]
      },
      {
        "n": 8,
        "month": 2,
        "title": "Teamwork and shift communication",
        "outcomes": [
          "Give factual handover information",
          "Communicate within role boundaries",
          "Ask for assistance when uncertain"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Team roles and collaboration"
          },
          {
            "label": "Day 2",
            "text": "Shift updates and messages"
          },
          {
            "label": "Day 3",
            "text": "Workplace conflict language"
          },
          {
            "label": "Day 4",
            "text": "Handover simulations"
          },
          {
            "label": "Day 5",
            "text": "Month 2 communication assessment"
          }
        ]
      },
      {
        "n": 9,
        "month": 3,
        "title": "Basic sentences and workplace forms",
        "outcomes": [
          "Write clear simple sentences",
          "Use dates, times and names accurately",
          "Distinguish observation from opinion"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Sentence structure and workplace verbs"
          },
          {
            "label": "Day 2",
            "text": "Time and date formats"
          },
          {
            "label": "Day 3",
            "text": "Observation versus interpretation"
          },
          {
            "label": "Day 4",
            "text": "Form-completion practice"
          },
          {
            "label": "Day 5",
            "text": "Short writing assessment"
          }
        ]
      },
      {
        "n": 10,
        "month": 3,
        "title": "Progress notes and incident descriptions",
        "outcomes": [
          "Write factual short notes without speculation",
          "Use respectful non-stigmatizing language",
          "Identify information that should not be recorded"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Objective note examples"
          },
          {
            "label": "Day 2",
            "text": "Chronology and factual descriptions"
          },
          {
            "label": "Day 3",
            "text": "Mock daily notes"
          },
          {
            "label": "Day 4",
            "text": "Peer editing and correction"
          },
          {
            "label": "Day 5",
            "text": "Documentation assessment"
          }
        ]
      },
      {
        "n": 11,
        "month": 3,
        "title": "Computer basics and email",
        "outcomes": [
          "Create and save a document",
          "Compose professional email messages",
          "Use basic file and account security"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Keyboard and file organization"
          },
          {
            "label": "Day 2",
            "text": "Word-processing practice"
          },
          {
            "label": "Day 3",
            "text": "Email and attachments"
          },
          {
            "label": "Day 4",
            "text": "Passwords and privacy basics"
          },
          {
            "label": "Day 5",
            "text": "Computer skills check"
          }
        ]
      },
      {
        "n": 12,
        "month": 3,
        "title": "Digital records and employment documents",
        "outcomes": [
          "Complete mock digital forms",
          "Recognize confidential information",
          "Prepare a basic resume and application"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Mock digital service records"
          },
          {
            "label": "Day 2",
            "text": "Spreadsheet and tracking basics"
          },
          {
            "label": "Day 3",
            "text": "Resume and cover message"
          },
          {
            "label": "Day 4",
            "text": "Practice online applications"
          },
          {
            "label": "Day 5",
            "text": "Month 3 integrated assessment"
          }
        ]
      },
      {
        "n": 13,
        "month": 4,
        "title": "Role, settings and scope",
        "outcomes": [
          "Describe common CSW duties and settings",
          "Identify tasks requiring referral to qualified staff",
          "Explain supervision and escalation"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Roles in community agencies"
          },
          {
            "label": "Day 2",
            "text": "Service settings and client pathways"
          },
          {
            "label": "Day 3",
            "text": "Scope-of-practice scenarios"
          },
          {
            "label": "Day 4",
            "text": "Supervisor consultation simulations"
          },
          {
            "label": "Day 5",
            "text": "Role knowledge check"
          }
        ]
      },
      {
        "n": 14,
        "month": 4,
        "title": "Privacy, confidentiality and consent",
        "outcomes": [
          "Explain confidentiality in plain language",
          "Seek permission before sharing information",
          "Identify when to follow organizational disclosure procedures"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Privacy and confidentiality concepts"
          },
          {
            "label": "Day 2",
            "text": "Consent and information-sharing scenarios"
          },
          {
            "label": "Day 3",
            "text": "Secure records and conversations"
          },
          {
            "label": "Day 4",
            "text": "Mock ethical case discussions"
          },
          {
            "label": "Day 5",
            "text": "Ethics scenario assessment"
          }
        ]
      },
      {
        "n": 15,
        "month": 4,
        "title": "Diversity, inclusion and accessibility",
        "outcomes": [
          "Use respectful person-centred language",
          "Recognize cultural and communication differences",
          "Identify reasonable accessibility supports"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Cultural humility and bias awareness"
          },
          {
            "label": "Day 2",
            "text": "Disability inclusion and accessibility"
          },
          {
            "label": "Day 3",
            "text": "Language access and interpretation"
          },
          {
            "label": "Day 4",
            "text": "Inclusive service role-play"
          },
          {
            "label": "Day 5",
            "text": "Inclusion reflection and assessment"
          }
        ]
      },
      {
        "n": 16,
        "month": 4,
        "title": "Safeguarding and reporting concerns",
        "outcomes": [
          "Recognize potential signs of harm or neglect",
          "Follow employer reporting and escalation procedures",
          "Avoid investigating allegations independently"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Professional boundaries and power"
          },
          {
            "label": "Day 2",
            "text": "Safeguarding warning signs"
          },
          {
            "label": "Day 3",
            "text": "Reporting pathways and factual records"
          },
          {
            "label": "Day 4",
            "text": "Supervised case scenarios"
          },
          {
            "label": "Day 5",
            "text": "Month 4 ethical assessment"
          }
        ]
      },
      {
        "n": 17,
        "month": 5,
        "title": "Person-centred practice and goals",
        "outcomes": [
          "Identify client strengths and preferences",
          "Support choice and independence",
          "Follow an established support plan"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Strengths-based support"
          },
          {
            "label": "Day 2",
            "text": "Preferences, goals and choice"
          },
          {
            "label": "Day 3",
            "text": "Support plan reading"
          },
          {
            "label": "Day 4",
            "text": "Client scenario simulations"
          },
          {
            "label": "Day 5",
            "text": "Support-plan assessment"
          }
        ]
      },
      {
        "n": 18,
        "month": 5,
        "title": "Communication with distressed clients",
        "outcomes": [
          "Demonstrate calm listening and respectful language",
          "Recognize when to seek immediate support",
          "Maintain boundaries during challenging conversations"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Active listening and empathy"
          },
          {
            "label": "Day 2",
            "text": "Communication under stress"
          },
          {
            "label": "Day 3",
            "text": "De-escalation awareness"
          },
          {
            "label": "Day 4",
            "text": "Role-play and feedback"
          },
          {
            "label": "Day 5",
            "text": "Communication skills check"
          }
        ]
      },
      {
        "n": 19,
        "month": 5,
        "title": "Observation and objective records",
        "outcomes": [
          "Distinguish observed facts from assumptions",
          "Write clear daily notes",
          "Protect private information"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "What to observe and report"
          },
          {
            "label": "Day 2",
            "text": "Factual progress notes"
          },
          {
            "label": "Day 3",
            "text": "Mock incident forms"
          },
          {
            "label": "Day 4",
            "text": "Secure documentation practice"
          },
          {
            "label": "Day 5",
            "text": "Documentation practical"
          }
        ]
      },
      {
        "n": 20,
        "month": 5,
        "title": "Team case discussions and handover",
        "outcomes": [
          "Summarize relevant information accurately",
          "Participate appropriately in team discussions",
          "Escalate concerns to a supervisor"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Team meetings and roles"
          },
          {
            "label": "Day 2",
            "text": "Handover frameworks"
          },
          {
            "label": "Day 3",
            "text": "Case simulations"
          },
          {
            "label": "Day 4",
            "text": "Integrated documentation exercises"
          },
          {
            "label": "Day 5",
            "text": "Month 5 assessment"
          }
        ]
      },
      {
        "n": 21,
        "month": 6,
        "title": "Community resources and basic needs",
        "outcomes": [
          "Identify types of food, housing and settlement support",
          "Explain resource eligibility must be verified",
          "Locate current service information"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Community resource categories"
          },
          {
            "label": "Day 2",
            "text": "Food and housing pathways"
          },
          {
            "label": "Day 3",
            "text": "Settlement and newcomer services"
          },
          {
            "label": "Day 4",
            "text": "Resource directory practice"
          },
          {
            "label": "Day 5",
            "text": "Resource mapping check"
          }
        ]
      },
      {
        "n": 22,
        "month": 6,
        "title": "Education, employment and income resources",
        "outcomes": [
          "Identify education and employment supports",
          "Describe referral boundaries",
          "Help clients prepare questions for service providers"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Employment and education services"
          },
          {
            "label": "Day 2",
            "text": "Financial support navigation awareness"
          },
          {
            "label": "Day 3",
            "text": "Forms and appointments"
          },
          {
            "label": "Day 4",
            "text": "Referral role-play"
          },
          {
            "label": "Day 5",
            "text": "Resource identification quiz"
          }
        ]
      },
      {
        "n": 23,
        "month": 6,
        "title": "Referral and follow-up",
        "outcomes": [
          "Explain consent-based referral steps",
          "Document referrals factually",
          "Follow organizational follow-up procedures"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Referral pathway and consent"
          },
          {
            "label": "Day 2",
            "text": "Appointment coordination"
          },
          {
            "label": "Day 3",
            "text": "Mock referral records"
          },
          {
            "label": "Day 4",
            "text": "Follow-up communication"
          },
          {
            "label": "Day 5",
            "text": "Referral simulation"
          }
        ]
      },
      {
        "n": 24,
        "month": 6,
        "title": "Advocacy and barrier reduction",
        "outcomes": [
          "Explain self-advocacy and informed choice",
          "Identify accessibility and language barriers",
          "Support client decisions without taking over"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Client rights and participation"
          },
          {
            "label": "Day 2",
            "text": "Access barriers"
          },
          {
            "label": "Day 3",
            "text": "Advocacy role-play"
          },
          {
            "label": "Day 4",
            "text": "Community resource project"
          },
          {
            "label": "Day 5",
            "text": "Month 6 integrated assessment"
          }
        ]
      },
      {
        "n": 25,
        "month": 7,
        "title": "Daily routines and safe assistance boundaries",
        "outcomes": [
          "Support participation in planned activities",
          "Recognize when mobility or personal care needs trained staff",
          "Use safe reporting and consent practices"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Daily support routines"
          },
          {
            "label": "Day 2",
            "text": "Boundaries for personal and physical assistance"
          },
          {
            "label": "Day 3",
            "text": "Accessibility and inclusion stations"
          },
          {
            "label": "Day 4",
            "text": "Supervised simulated activities"
          },
          {
            "label": "Day 5",
            "text": "Practical observation"
          }
        ]
      },
      {
        "n": 26,
        "month": 7,
        "title": "Conflict prevention and escalation",
        "outcomes": [
          "Identify early signs of escalating conflict",
          "Use calm and non-threatening communication",
          "Follow emergency and supervisor escalation procedures"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Conflict triggers and prevention"
          },
          {
            "label": "Day 2",
            "text": "Verbal de-escalation awareness"
          },
          {
            "label": "Day 3",
            "text": "When to withdraw and call for help"
          },
          {
            "label": "Day 4",
            "text": "Role-play with instructor"
          },
          {
            "label": "Day 5",
            "text": "Scenario assessment"
          }
        ]
      },
      {
        "n": 27,
        "month": 7,
        "title": "Integrated client support scenarios",
        "outcomes": [
          "Coordinate simple tasks within an assigned plan",
          "Communicate with team members",
          "Complete factual records"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Intake and service pathways"
          },
          {
            "label": "Day 2",
            "text": "Support-plan simulation"
          },
          {
            "label": "Day 3",
            "text": "Resource referral and documentation"
          },
          {
            "label": "Day 4",
            "text": "Team case simulation"
          },
          {
            "label": "Day 5",
            "text": "Integrated practice assessment"
          }
        ]
      },
      {
        "n": 28,
        "month": 7,
        "title": "Practicum readiness and final simulations",
        "outcomes": [
          "Demonstrate professional conduct and confidentiality",
          "Follow workplace directions and safety expectations",
          "Prepare for supervised placement"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Professional expectations"
          },
          {
            "label": "Day 2",
            "text": "Safety and privacy refresh"
          },
          {
            "label": "Day 3",
            "text": "Rotating simulation stations"
          },
          {
            "label": "Day 4",
            "text": "Practicum orientation and mock interview"
          },
          {
            "label": "Day 5",
            "text": "Month 7 practical assessment"
          }
        ]
      },
      {
        "n": 29,
        "month": 8,
        "title": "Placement orientation and observation",
        "outcomes": [
          "Explain placement rules and supervisor roles",
          "Observe authorized duties professionally",
          "Record learning reflections without client identifiers"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Site orientation and policies"
          },
          {
            "label": "Day 2",
            "text": "Observation and shadowing"
          },
          {
            "label": "Day 3",
            "text": "Supervisor feedback meetings"
          },
          {
            "label": "Day 4",
            "text": "Guided reflection and debrief"
          },
          {
            "label": "Day 5",
            "text": "Weekly supervisor evaluation"
          }
        ]
      },
      {
        "n": 30,
        "month": 8,
        "title": "Supervised support and documentation",
        "outcomes": [
          "Perform assigned entry-level tasks under supervision",
          "Use appropriate client communication",
          "Document only as authorized"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Daily briefings and assigned tasks"
          },
          {
            "label": "Day 2",
            "text": "Supervised client support"
          },
          {
            "label": "Day 3",
            "text": "Approved documentation"
          },
          {
            "label": "Day 4",
            "text": "Reflection and supervisor feedback"
          },
          {
            "label": "Day 5",
            "text": "Workplace skills observation"
          }
        ]
      },
      {
        "n": 31,
        "month": 8,
        "title": "Community programs and teamwork",
        "outcomes": [
          "Participate in approved community activities",
          "Coordinate appropriately with staff",
          "Escalate concerns promptly"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Program preparation and teamwork"
          },
          {
            "label": "Day 2",
            "text": "Supervised participation"
          },
          {
            "label": "Day 3",
            "text": "Service coordination observation"
          },
          {
            "label": "Day 4",
            "text": "Feedback and improvement"
          },
          {
            "label": "Day 5",
            "text": "Mid/final placement check"
          }
        ]
      },
      {
        "n": 32,
        "month": 8,
        "title": "Final assessment and employment transition",
        "outcomes": [
          "Demonstrate core entry-level competencies",
          "Complete placement evaluation",
          "Prepare for interviews and job search"
        ],
        "steps": [
          {
            "label": "Day 1",
            "text": "Final supervised workplace activities"
          },
          {
            "label": "Day 2",
            "text": "Supervisor competency assessment"
          },
          {
            "label": "Day 3",
            "text": "Resume and interview practice"
          },
          {
            "label": "Day 4",
            "text": "Individual development plan"
          },
          {
            "label": "Day 5",
            "text": "Final evaluation and completion review"
          }
        ]
      }
    ]
  }
}

export const INSTRUCTOR_STREAM_ORDER: InstructorStreamId[] = ['construction', 'logistics', 'community']

export function instructorStream(id: string | null | undefined): InstructorStream | null {
  if (id === 'construction' || id === 'logistics' || id === 'community') return INSTRUCTOR_STREAMS[id]
  return null
}

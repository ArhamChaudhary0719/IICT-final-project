/* ==========================================================================
   CarePulse Medical Clinic - Doctors & Clinic Data
   ========================================================================== */

window.CLINIC_DATA = {
  doctors: [
    {
      id: "dr-ayesha-khan",
      name: "Dr. Ayesha Khan",
      departmentId: "cardiology",
      specialty: "Cardiology",
      credentials: "MBBS, FCPS (Cardiology)",
      experience: "12 years experience",
      experienceYears: 12,
      rating: "4.9",
      reviewsCount: 142,
      consultationFee: "$85",
      languages: "English, Urdu",
      availability: "Mon, Wed, Fri",
      availabilityDays: ["mon", "wed", "fri"],
      availableToday: true,
      location: "Wing A, Room 204",
      education: [
        "Fellowship in Non-Invasive Cardiology, National Heart Institute",
        "FCPS Cardiology, College of Physicians & Surgeons",
        "MBBS, King Edward Medical University"
      ],
      focusAreas: [
        "Hypertension & Blood Pressure Care",
        "Preventive Heart Screening",
        "ECG & Echocardiography",
        "Cholesterol Management"
      ],
      schedule: [
        { day: "Monday", hours: "9:00 AM - 4:00 PM" },
        { day: "Wednesday", hours: "9:00 AM - 4:00 PM" },
        { day: "Friday", hours: "10:00 AM - 5:00 PM" }
      ],
      bio: "Dr. Ayesha Khan specializes in preventive cardiology, blood pressure control, and non-invasive cardiac diagnostics with a calm, collaborative bedside manner.",
      reviews: [
        {
          patient: "Elena K.",
          comment: "Explained my ECG results step by step and set up a realistic treatment plan."
        },
        {
          patient: "Samir A.",
          comment: "Punctual, attentive, and genuinely listens to every concern."
        }
      ],
      accentColor: "#0d7377"
    },
    {
      id: "dr-daniel-mercer",
      name: "Dr. Daniel Mercer",
      departmentId: "general-medicine",
      specialty: "General Medicine",
      credentials: "MD, MRCGP",
      experience: "10 years experience",
      experienceYears: 10,
      rating: "4.8",
      reviewsCount: 198,
      consultationFee: "$60",
      languages: "English, Spanish",
      availability: "Mon - Fri",
      availabilityDays: ["mon", "tue", "wed", "thu", "fri"],
      availableToday: true,
      location: "Wing A, Room 102",
      education: [
        "MRCGP Family & Primary Care Certification",
        "Residency in Internal Medicine, Brookside Teaching Hospital",
        "MD, University of Toronto"
      ],
      focusAreas: [
        "Annual Wellness Checkups",
        "Type 2 Diabetes Care",
        "Acute Illness & Fever",
        "Adult Immunizations"
      ],
      schedule: [
        { day: "Monday - Thursday", hours: "8:30 AM - 5:30 PM" },
        { day: "Friday", hours: "8:30 AM - 3:00 PM" }
      ],
      bio: "Dr. Daniel Mercer provides comprehensive primary care for adults and seniors, helping patients manage chronic conditions and stay ahead with preventive screenings.",
      reviews: [
        {
          patient: "Hannah R.",
          comment: "Same-day appointment and clear guidance on my blood work."
        },
        {
          patient: "Carlos V.",
          comment: "Best family physician I have visited—never feels rushed."
        }
      ],
      accentColor: "#14807c"
    },
    {
      id: "dr-sara-lin",
      name: "Dr. Sara Lin",
      departmentId: "pediatrics",
      specialty: "Pediatrics",
      credentials: "MD, FAAP",
      experience: "9 years experience",
      experienceYears: 9,
      rating: "5.0",
      reviewsCount: 164,
      consultationFee: "$70",
      languages: "English, Mandarin",
      availability: "Tue - Sat",
      availabilityDays: ["tue", "wed", "thu", "fri", "sat"],
      availableToday: true,
      location: "Wing B, Room 110",
      education: [
        "Fellow of the American Academy of Pediatrics (FAAP)",
        "Pediatric Residency, Children's Memorial Medical Center",
        "MD, Johns Hopkins University"
      ],
      focusAreas: [
        "Infant & Toddler Wellness",
        "Childhood Immunizations",
        "Asthma & Allergy Care",
        "School & Sports Physicals"
      ],
      schedule: [
        { day: "Tuesday - Friday", hours: "9:00 AM - 5:00 PM" },
        { day: "Saturday", hours: "9:00 AM - 2:00 PM" }
      ],
      bio: "Dr. Sara Lin partners with parents to support healthy childhood growth, immunizations, and respiratory care in a reassuring, kid-friendly environment.",
      reviews: [
        {
          patient: "Tariq M.",
          comment: "My son wasn't nervous at all. Dr. Lin answered every single parent question."
        },
        {
          patient: "Megan T.",
          comment: "Warm, thorough, and great follow-up after our clinic visit."
        }
      ],
      accentColor: "#0b6b82"
    },
    {
      id: "dr-omar-farooq",
      name: "Dr. Omar Farooq",
      departmentId: "orthopedics",
      specialty: "Orthopedics",
      credentials: "MBBS, MS (Orthopedics)",
      experience: "14 years experience",
      experienceYears: 14,
      rating: "4.8",
      reviewsCount: 118,
      consultationFee: "$90",
      languages: "English, Urdu, Arabic",
      availability: "Mon, Tue, Thu",
      availabilityDays: ["mon", "tue", "thu"],
      availableToday: false,
      location: "Wing B, Room 215",
      education: [
        "Fellowship in Sports Medicine & Joint Rehab",
        "MS Orthopedics, Postgraduate Institute of Medical Sciences",
        "MBBS, Aga Khan University"
      ],
      focusAreas: [
        "Sports Injuries & Sprains",
        "Knee & Shoulder Pain",
        "Arthritis Management",
        "Post-Fracture Rehabilitation"
      ],
      schedule: [
        { day: "Monday", hours: "10:00 AM - 5:30 PM" },
        { day: "Tuesday", hours: "10:00 AM - 5:30 PM" },
        { day: "Thursday", hours: "9:00 AM - 4:00 PM" }
      ],
      bio: "Dr. Omar Farooq treats bone, joint, and sports injuries with a strong emphasis on conservative recovery and guided physical rehabilitation.",
      reviews: [
        {
          patient: "Liam D.",
          comment: "Diagnosed my meniscus strain accurately and got me back to running."
        }
      ],
      accentColor: "#11695e"
    },
    {
      id: "dr-nadia-patel",
      name: "Dr. Nadia Patel",
      departmentId: "dermatology",
      specialty: "Dermatology",
      credentials: "MD, Board Certified Dermatology",
      experience: "8 years experience",
      experienceYears: 8,
      rating: "4.9",
      reviewsCount: 131,
      consultationFee: "$80",
      languages: "English, Hindi",
      availability: "Wed - Sat",
      availabilityDays: ["wed", "thu", "fri", "sat"],
      availableToday: true,
      location: "Wing A, Room 209",
      education: [
        "Board Certified in Clinical Dermatology",
        "Dermatology Residency, Metro General Hospital",
        "MD, Northwestern University"
      ],
      focusAreas: [
        "Acne & Eczema Treatment",
        "Full-Body Mole Screening",
        "Psoriasis & Hair Loss Care",
        "Allergy Patch Testing"
      ],
      schedule: [
        { day: "Wednesday - Friday", hours: "9:30 AM - 5:00 PM" },
        { day: "Saturday", hours: "9:30 AM - 3:00 PM" }
      ],
      bio: "Dr. Nadia Patel delivers evidence-based dermatology for chronic skin conditions, preventive skin checks, and pediatric skin concerns.",
      reviews: [
        {
          patient: "Priya S.",
          comment: "Clear skincare plan that worked within three weeks without harsh side effects."
        }
      ],
      accentColor: "#167a8a"
    },
    {
      id: "dr-james-cole",
      name: "Dr. James Cole",
      departmentId: "diagnostics",
      specialty: "Diagnostics & Lab",
      credentials: "MD, Diagnostic Radiology",
      experience: "11 years experience",
      experienceYears: 11,
      rating: "4.7",
      reviewsCount: 95,
      consultationFee: "$75",
      languages: "English",
      availability: "Mon - Sat",
      availabilityDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
      availableToday: true,
      location: "Ground Floor, Imaging Suite",
      education: [
        "Subspecialty Training in Musculoskeletal Ultrasound",
        "Diagnostic Radiology Residency, St. Jude Medical Center",
        "MD, University of Michigan"
      ],
      focusAreas: [
        "Diagnostic Ultrasound",
        "Digital X-Ray Review",
        "Preventive Health Panels",
        "Same-Day Physician Reporting"
      ],
      schedule: [
        { day: "Monday - Friday", hours: "8:00 AM - 4:30 PM" },
        { day: "Saturday", hours: "8:30 AM - 2:00 PM" }
      ],
      bio: "Dr. James Cole oversees on-site imaging and diagnostic coordination so patients receive accurate ultrasound, X-ray, and lab reports the very same day.",
      reviews: [
        {
          patient: "Nina P.",
          comment: "Ultrasound took 15 minutes and my doctor had the full report that afternoon."
        }
      ],
      accentColor: "#0d5f73"
    }
  ],

  timeSlots: [
    "09:00 AM",
    "09:30 AM",
    "10:30 AM",
    "11:30 AM",
    "02:00 PM",
    "03:00 PM",
    "04:30 PM",
    "05:30 PM"
  ]
};

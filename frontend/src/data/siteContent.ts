import type {
  DemoStep,
  InquiryFormValues,
  ProductFeature,
} from "../types/models";

export const productOverview = {
  name: "StemiGlide",
  headline: "Prevent tangled EKG leads in emergency situations.",
  summary:
    "StemiGlide is a 3D printed lead organizer designed to reduce coil tangling, speed up setup, and help EMTs stay focused on patient care.",
  unitPrice: 39,
  priceLabel: "$39",
  status: "Available for department interest and pilot conversations",
};

export const productOptions = [
  {
    name: "6 Lead StemiGlide",
    defaultPrice: 39,
  },
  {
    name: "4 Lead StemiGlide",
    defaultPrice: 29,
  },
];

export const heroStats = [
  { label: "Built for", value: "EMTs + first responders" },
  { label: "Problem solved", value: "Tangled EKG lead wires" },
  { label: "Primary outcome", value: "Faster, cleaner setup" },
];

export const productFeatures: ProductFeature[] = [
  {
    title: "Lead separation",
    description:
      "Keeps individual wires from crossing over each other during transport and setup.",
  },
  {
    title: "Faster deployment",
    description:
      "Makes it easier to grab, place, and route leads when time matters most.",
  },
  {
    title: "Compact 3D printed form",
    description:
      "Designed as a lightweight field tool that is practical to carry and easy to clean.",
  },
  {
    title: "Training-friendly workflow",
    description:
      "Creates a repeatable process for newer EMTs learning rapid EKG setup.",
  },
];

export const detailSections = [
  {
    title: "The problem EMTs face",
    body: "EKG leads can tangle quickly in emergency response environments. That slows down setup, increases frustration, and takes attention away from patient care during critical moments.",
  },
  {
    title: "How the tool helps",
    body: "StemiGlide keeps the coils organized so EMTs can identify and place the right leads with less delay. The goal is not just storage, but a faster and cleaner workflow under pressure.",
  },
  {
    title: "Why this matters",
    body: "When a crew is moving fast, even a small reduction in setup friction is valuable. A simple physical tool can improve consistency for both experienced providers and trainees.",
  },
];

export const demoSteps: DemoStep[] = [
  {
    stepNumber: 1,
    title: "Retrieve the organizer - Waiting on Photo",
    description:
      "The EMT pulls the EKG organizer from the bag with the leads already separated and staged.",
  },
  {
    stepNumber: 2,
    title: "Identify lead groups immediately - Waiting on Photo",
    description:
      "Because the wires are arranged in a controlled layout, the provider can distinguish lead paths without untangling a coil bundle first.",
  },
  {
    stepNumber: 3,
    title: "Place leads with less interruption - Waiting on Photo",
    description:
      "The tool supports a smoother rhythm of setup by reducing hand time spent sorting and unwrapping leads.",
  },
  {
    stepNumber: 4,
    title: "Reset after use - Waiting on Photo",
    description:
      "After the call, the wires can be reloaded into the organizer so the next use starts in a ready state.",
  },
];

export const useCases = [
  "Fire department EMS units",
  "Private ambulance teams",
  "Hospital transport departments",
  "Skills labs and EMT training programs",
];

export const initialInquiryValues: InquiryFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  organization: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  message: "",
  sixLeadQuantity: 1,
  fourLeadQuantity: 0,
};

export const imageCards = [
  {
    title: "Top View (Closed)",
    caption:
      "Top view of the Stemi Glide in its closed position, keeping all leads secured and organized.",
    image: "/StemiClosed.png",
  },
  {
    title: "Open Loading View",
    caption:
      "Stemi Glide opened to show how leads can be easily inserted and arranged before securing.",
    image: "/StemiOpen.png",
  },
  {
    title: "Leads Loaded (Pre-Storage)",
    caption:
      "Leads fully inserted and organized, demonstrating how the setup looks before storing in a bag or case.",
    image: "/6leadin.png",
  },
];

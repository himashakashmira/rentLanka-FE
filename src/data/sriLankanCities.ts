export interface SriLankanCity {
  name: string;
  province: string;
  region?: string;
  popular?: boolean;
  keywords?: string[];
}

export const SRI_LANKAN_CITIES: SriLankanCity[] = [
  // =========================================================================
  // Southern Province
  // =========================================================================
  {
    name: "Matara",
    province: "Southern Province",
    region: "Southern Hub",
    popular: true,
    keywords: ["matara", "dickwella", "southern", "coast", "expressway"],
  },
  {
    name: "Tangalle",
    province: "Southern Province",
    region: "Deep South Coast",
    popular: true,
    keywords: ["tangalle", "tangalla", "kudawella", "beaches", "resorts"],
  },
  {
    name: "Beliatta",
    province: "Southern Province",
    region: "Southern Rail & Transit Hub",
    keywords: ["beliatta", "railway terminus", "southern expressway"],
  },
  {
    name: "Dickwella",
    province: "Southern Province",
    region: "Southern Coast",
    keywords: ["dickwella", "hiriketiya", "surf", "beach"],
  },
  {
    name: "Hakmana",
    province: "Southern Province",
    region: "Southern Interior",
    keywords: ["hakmana", "matara interior"],
  },
  {
    name: "Weligama",
    province: "Southern Province",
    region: "Surf & Tourism Hub",
    popular: true,
    keywords: ["weligama", "surf", "midigama", "ahangama", "bay"],
  },
  {
    name: "Galle",
    province: "Southern Province",
    region: "Historic & Commercial Capital",
    popular: true,
    keywords: ["galle", "galle fort", "unawatuna", "karapitiya", "southern"],
  },
  {
    name: "Hikkaduwa",
    province: "Southern Province",
    region: "Coastal Tourist Hub",
    popular: true,
    keywords: ["hikkaduwa", "coral reef", "diving", "beach"],
  },
  {
    name: "Ambalangoda",
    province: "Southern Province",
    region: "Coastal Hub",
    keywords: ["ambalangoda", "balapitiya", "masks"],
  },
  {
    name: "Hambantota",
    province: "Southern Province",
    region: "Deep South Commercial Hub",
    popular: true,
    keywords: ["hambantota", "port city", "mirijjawila", "magampura"],
  },
  {
    name: "Tissamaharama",
    province: "Southern Province",
    region: "Yala Safari Gateway",
    keywords: ["tissamaharama", "tissa", "yala", "safari", "kirinda"],
  },

  // =========================================================================
  // Western Province
  // =========================================================================
  {
    name: "Colombo",
    province: "Western Province",
    region: "Commercial Capital (Districts 01 - 15)",
    popular: true,
    keywords: ["colombo", "fort", "kollupitiya", "bambalapitiya", "cinnamon gardens", "port city"],
  },
  {
    name: "Dehiwala",
    province: "Western Province",
    region: "Colombo Metro",
    keywords: ["dehiwala", "kalubowila", "zoo"],
  },
  {
    name: "Mount Lavinia",
    province: "Western Province",
    region: "Colombo Coastal",
    popular: true,
    keywords: ["mount lavinia", "galkissa", "beach", "hotel"],
  },
  {
    name: "Moratuwa",
    province: "Western Province",
    region: "Colombo South",
    keywords: ["moratuwa", "ratmalana", "airport corridor", "university"],
  },
  {
    name: "Nugegoda",
    province: "Western Province",
    region: "Greater Colombo Hub",
    popular: true,
    keywords: ["nugegoda", "kohuwala", "mirihana", "commercial"],
  },
  {
    name: "Maharagama",
    province: "Western Province",
    region: "Colombo East",
    keywords: ["maharagama", "high level road", "pamunuwa"],
  },
  {
    name: "Kottawa",
    province: "Western Province",
    region: "Expressway Interchange Hub",
    keywords: ["kottawa", "makumbura", "multimodal", "expressway interchange"],
  },
  {
    name: "Malabe",
    province: "Western Province",
    region: "IT & Tech Corridor",
    keywords: ["malabe", "sliit", "cintec", "kaduwela", "tech hub"],
  },
  {
    name: "Gampaha",
    province: "Western Province",
    region: "Gampaha District Capital",
    popular: true,
    keywords: ["gampaha", "yakkala", "miriswatta", "western"],
  },
  {
    name: "Negombo",
    province: "Western Province",
    region: "Airport Corridor & Coast",
    popular: true,
    keywords: ["negombo", "katunayake", "bia airport", "beach", "lagoon"],
  },
  {
    name: "Kelaniya",
    province: "Western Province",
    region: "Greater Colombo North",
    keywords: ["kelaniya", "kiribathgoda", "temple", "industrial"],
  },
  {
    name: "Panadura",
    province: "Western Province",
    region: "Kalutara Coastal Border",
    keywords: ["panadura", "moratuwa border", "galle road"],
  },
  {
    name: "Kalutara",
    province: "Western Province",
    region: "Kalutara District Capital",
    popular: true,
    keywords: ["kalutara", "bodhiya", "wadduwa", "beruwala border"],
  },

  // =========================================================================
  // Central Province
  // =========================================================================
  {
    name: "Kandy",
    province: "Central Province",
    region: "Central Highland Capital",
    popular: true,
    keywords: ["kandy", "dalada maligawa", "central", "hill country", "lake"],
  },
  {
    name: "Peradeniya",
    province: "Central Province",
    region: "Kandy Metro & Botanical",
    keywords: ["peradeniya", "botanical gardens", "university of peradeniya"],
  },
  {
    name: "Katugastota",
    province: "Central Province",
    region: "Kandy North Corridor",
    keywords: ["katugastota", "kurunegala road", "pinga oya"],
  },
  {
    name: "Gampola",
    province: "Central Province",
    region: "Central Valley",
    keywords: ["gampola", "ambuluwawa", "mahaweli"],
  },
  {
    name: "Nuwara Eliya",
    province: "Central Province",
    region: "Highland Tea Country",
    popular: true,
    keywords: ["nuwara eliya", "little england", "gregory lake", "tea estates", "cold"],
  },
  {
    name: "Hatton",
    province: "Central Province",
    region: "Adam's Peak Gateway",
    keywords: ["hatton", "sri pada", "dickoya", "maskeliya", "tea"],
  },
  {
    name: "Matale",
    province: "Central Province",
    region: "Spice Valley",
    keywords: ["matale", "alu viharaya", "spices", "knuckles"],
  },
  {
    name: "Dambulla",
    province: "Central Province",
    region: "Economic & Cultural Hub",
    popular: true,
    keywords: ["dambulla", "dedicated economic centre", "cave temple", "junction"],
  },

  // =========================================================================
  // North Western Province
  // =========================================================================
  {
    name: "Kurunegala",
    province: "North Western",
    region: "Wayamba Provincial Capital",
    popular: true,
    keywords: ["kurunegala", "wayamba", "ethagala", "expressway hub"],
  },
  {
    name: "Kuliyapitiya",
    province: "North Western",
    region: "Industrial & Agricultural Hub",
    keywords: ["kuliyapitiya", "industrial zone"],
  },
  {
    name: "Chilaw",
    province: "North Western",
    region: "North Western Coast",
    keywords: ["chilaw", "munneswaram", "coastal"],
  },
  {
    name: "Puttalam",
    province: "North Western",
    region: "Lagoon & Energy Hub",
    keywords: ["puttalam", "wind power", "salt pans", "lagoon", "kalpitiya gateway"],
  },

  // =========================================================================
  // North Central & Cultural Triangle
  // =========================================================================
  {
    name: "Anuradhapura",
    province: "North Central",
    region: "Ancient Capital & Cultural Hub",
    popular: true,
    keywords: ["anuradhapura", "ruwanwelisaya", "sacred city", "rajarata"],
  },
  {
    name: "Polonnaruwa",
    province: "North Central",
    region: "Historic Kingdom & Agriculture",
    popular: true,
    keywords: ["polonnaruwa", "gal viharaya", "parakrama samudraya"],
  },
  {
    name: "Sigiriya",
    province: "Cultural Triangle",
    region: "World Heritage Lion Rock",
    popular: true,
    keywords: ["sigiriya", "lion rock", "pidurangala", "tourism", "heritage"],
  },

  // =========================================================================
  // Uva & Sabaragamuwa
  // =========================================================================
  {
    name: "Badulla",
    province: "Uva Province",
    region: "Uva Provincial Capital",
    popular: true,
    keywords: ["badulla", "muthiyangana", "dunhinda", "main line terminus"],
  },
  {
    name: "Ella",
    province: "Uva Province",
    region: "Highland Tourism & Hiking",
    popular: true,
    keywords: ["ella", "nine arches", "little adam's peak", "ravana falls"],
  },
  {
    name: "Bandarawela",
    province: "Uva Province",
    region: "Highland Climate Hub",
    keywords: ["bandarawela", "diyatalawa", "haputale", "climate"],
  },
  {
    name: "Ratnapura",
    province: "Sabaragamuwa",
    region: "City of Gems & Sabaragamuwa Capital",
    popular: true,
    keywords: ["ratnapura", "gem city", "sabaragamuwa", "adam's peak route"],
  },
  {
    name: "Kegalle",
    province: "Sabaragamuwa",
    region: "Colombo-Kandy Arterial",
    keywords: ["kegalle", "mawanella", "pinnawala", "highway"],
  },

  // =========================================================================
  // Northern & Eastern Provinces
  // =========================================================================
  {
    name: "Jaffna",
    province: "Northern Province",
    region: "Northern Peninsula Capital",
    popular: true,
    keywords: ["jaffna", "nallur", "kankesanthurai", "chundikuli", "jaffna fort"],
  },
  {
    name: "Vavuniya",
    province: "Northern Province",
    region: "Gateway to the North",
    keywords: ["vavuniya", "a9 highway", "northern transit"],
  },
  {
    name: "Trincomalee",
    province: "Eastern Province",
    region: "Natural Deep Harbor & East Coast",
    popular: true,
    keywords: ["trincomalee", "nilaveli", "koneswaram", "pigeon island", "harbor"],
  },
  {
    name: "Batticaloa",
    province: "Eastern Province",
    region: "Eastern Lagoon Capital",
    popular: true,
    keywords: ["batticaloa", "kallady", "pasikuda", "east coast"],
  },
];

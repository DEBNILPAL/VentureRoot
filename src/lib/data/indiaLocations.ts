/**
 * Comprehensive Indian States, Union Territories, Districts & Talukas Directory
 * Authoritative location hierarchy for VentureRoot MSME Intelligence platform.
 * Supports cascading location selection, validation, district filtering, and alias resolution.
 */

export interface IndianState {
  name: string;
  code: string;
  type: "State" | "Union Territory";
  region: "Northern" | "Southern" | "Western" | "Eastern" | "Central" | "North-Eastern";
  aliases?: string[];
}

export const ALL_INDIAN_STATES: IndianState[] = [
  // 28 States
  { name: "Andhra Pradesh", code: "AP", type: "State", region: "Southern", aliases: ["Andhra"] },
  { name: "Arunachal Pradesh", code: "AR", type: "State", region: "North-Eastern" },
  { name: "Assam", code: "AS", type: "State", region: "North-Eastern" },
  { name: "Bihar", code: "BR", type: "State", region: "Eastern" },
  { name: "Chhattisgarh", code: "CG", type: "State", region: "Central", aliases: ["Chattisgarh"] },
  { name: "Goa", code: "GA", type: "State", region: "Western" },
  { name: "Gujarat", code: "GJ", type: "State", region: "Western" },
  { name: "Haryana", code: "HR", type: "State", region: "Northern" },
  { name: "Himachal Pradesh", code: "HP", type: "State", region: "Northern", aliases: ["Himachal"] },
  { name: "Jharkhand", code: "JH", type: "State", region: "Eastern" },
  { name: "Karnataka", code: "KA", type: "State", region: "Southern" },
  { name: "Kerala", code: "KL", type: "State", region: "Southern" },
  { name: "Madhya Pradesh", code: "MP", type: "State", region: "Central" },
  { name: "Maharashtra", code: "MH", type: "State", region: "Western" },
  { name: "Manipur", code: "MN", type: "State", region: "North-Eastern" },
  { name: "Meghalaya", code: "ML", type: "State", region: "North-Eastern" },
  { name: "Mizoram", code: "MZ", type: "State", region: "North-Eastern" },
  { name: "Nagaland", code: "NL", type: "State", region: "North-Eastern" },
  { name: "Odisha", code: "OD", type: "State", region: "Eastern", aliases: ["Orissa"] },
  { name: "Punjab", code: "PB", type: "State", region: "Northern" },
  { name: "Rajasthan", code: "RJ", type: "State", region: "Northern" },
  { name: "Sikkim", code: "SK", type: "State", region: "North-Eastern" },
  { name: "Tamil Nadu", code: "TN", type: "State", region: "Southern", aliases: ["Tamilnadu"] },
  { name: "Telangana", code: "TG", type: "State", region: "Southern" },
  { name: "Tripura", code: "TR", type: "State", region: "North-Eastern" },
  { name: "Uttar Pradesh", code: "UP", type: "State", region: "Northern" },
  { name: "Uttarakhand", code: "UK", type: "State", region: "Northern", aliases: ["Uttaranchal"] },
  { name: "West Bengal", code: "WB", type: "State", region: "Eastern", aliases: ["Bengal"] },

  // 8 Union Territories
  { name: "Andaman and Nicobar Islands", code: "AN", type: "Union Territory", region: "Southern", aliases: ["Andaman", "Nicobar"] },
  { name: "Chandigarh", code: "CH", type: "Union Territory", region: "Northern" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "DN", type: "Union Territory", region: "Western", aliases: ["Daman and Diu", "Dadra and Nagar Haveli"] },
  { name: "Delhi", code: "DL", type: "Union Territory", region: "Northern", aliases: ["NCT of Delhi", "New Delhi"] },
  { name: "Jammu and Kashmir", code: "JK", type: "Union Territory", region: "Northern", aliases: ["J&K", "Jammu & Kashmir"] },
  { name: "Ladakh", code: "LA", type: "Union Territory", region: "Northern" },
  { name: "Lakshadweep", code: "LD", type: "Union Territory", region: "Southern" },
  { name: "Puducherry", code: "PY", type: "Union Territory", region: "Southern", aliases: ["Pondicherry"] },
];

/**
 * Complete official district master dictionary mapping State -> Districts
 */
export const INDIA_DISTRICTS_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Alluri Sitharama Raju", "Anakapalli", "Ananthapuramu", "Annamayya", "Bapatla",
    "Chittoor", "East Godavari", "Eluru", "Guntur", "Kakinada", "Konaseema",
    "Krishna", "Kurnool", "Nandyal", "NTR", "Palnadu", "Parvathipuram Manyam",
    "Prakasam", "Srikakulam", "Sri Potti Sriramulu Nellore", "Sri Sathya Sai",
    "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"
  ],
  "Arunachal Pradesh": [
    "Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle",
    "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley",
    "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare",
    "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Dibang Valley", "Upper Siang",
    "Upper Subansiri", "West Kameng", "West Siang"
  ],
  "Assam": [
    "Bajali", "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo",
    "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara",
    "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan",
    "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon",
    "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar",
    "Tamulpur", "Tinsukia", "Udalguri", "West Karbi Anglong"
  ],
  "Bihar": [
    "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur",
    "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad",
    "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura",
    "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia",
    "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi",
    "Siwan", "Supaul", "Vaishali", "West Champaran"
  ],
  "Chhattisgarh": [
    "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur",
    "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa",
    "Jashpur", "Kabirdham", "Kanker", "Khairagarh-Chhuikhadan-Gandai", "Kondagaon",
    "Korba", "Koriya", "Mahasamund", "Manendragarh-Chirmiri-Bharatpur",
    "Mohla-Manpur-Ambagarh Chowki", "Mungeli", "Narayanpur", "Raigarh", "Raipur",
    "Rajnandgaon", "Sakti", "Sarangarh-Bilaigarh", "Sukma", "Surajpur", "Surguja"
  ],
  "Goa": [
    "North Goa", "South Goa"
  ],
  "Gujarat": [
    "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar",
    "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar",
    "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana",
    "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot",
    "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"
  ],
  "Haryana": [
    "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar",
    "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh",
    "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
  ],
  "Himachal Pradesh": [
    "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti",
    "Mandi", "Shimla", "Sirmaur", "Solan", "Una"
  ],
  "Jharkhand": [
    "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa",
    "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma",
    "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj",
    "Seraikela Kharsawan", "Simdega", "West Singhbhum"
  ],
  "Karnataka": [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar",
    "Chamarajanagar", "Chikkaballapura", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada",
    "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar",
    "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru",
    "Udupi", "Uttara Kannada", "Vijayanagara", "Vijayapura", "Yadgir"
  ],
  "Kerala": [
    "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam",
    "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram",
    "Thrissur", "Wayanad"
  ],
  "Madhya Pradesh": [
    "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul",
    "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia",
    "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Indore", "Jabalpur",
    "Jhabua", "Katni", "Khandwa", "Khargone", "Maihar", "Mandla", "Mandsaur", "Mauganj",
    "Morena", "Narmadapuram", "Narsinghpur", "Neemuch", "Niwari", "Pandhurna", "Panna",
    "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni",
    "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh",
    "Ujjain", "Umaria", "Vidisha"
  ],
  "Maharashtra": [
    "Ahmednagar", "Akola", "Amravati", "Beed", "Bhandara", "Buldhana", "Chandrapur",
    "Chhatrapati Sambhaji Nagar", "Dharashiv", "Dhule", "Gadchiroli", "Gondia",
    "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban",
    "Nagpur", "Nanded", "Nandurbar", "Nashik", "Palghar", "Parbhani", "Pune", "Raigad",
    "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
    "Washim", "Yavatmal"
  ],
  "Manipur": [
    "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam",
    "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong",
    "Tengnoupal", "Thoubal", "Ukhrul"
  ],
  "Meghalaya": [
    "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "Eastern West Khasi Hills",
    "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills",
    "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"
  ],
  "Mizoram": [
    "Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei",
    "Mamit", "Saiha", "Saitual", "Serchhip"
  ],
  "Nagaland": [
    "Chumoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon",
    "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyu", "Tuensang", "Wokha", "Zunheboto"
  ],
  "Odisha": [
    "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh",
    "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi",
    "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj",
    "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
  ],
  "Punjab": [
    "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur",
    "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Malerkotla", "Mansa",
    "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar",
    "Sangrur", "Shahid Bhagat Singh Nagar", "Tarn Taran"
  ],
  "Rajasthan": [
    "Ajmer", "Alwar", "Anupgarh", "Balotra", "Banswara", "Baran", "Barmer", "Beawar",
    "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Deeg",
    "Dholpur", "Didwana-Kuchaman", "Dudu", "Dungarpur", "Ganganagar", "Gangapur City",
    "Hanumangarh", "Jaipur", "Jaipur Rural", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu",
    "Jodhpur", "Jodhpur Rural", "Karauli", "Kekri", "Khairthal-Tijara", "Kota",
    "Kotputli-Behror", "Nagaur", "Neem Ka Thana", "Pali", "Phalodi", "Pratapgarh",
    "Rajsamand", "Salumbar", "Sanchore", "Sawai Madhopur", "Shahpura", "Sikar", "Sirohi",
    "Tonk", "Udaipur"
  ],
  "Sikkim": [
    "Gangtok", "Geyzing", "Mangan", "Namchi", "Pakyong", "Soreng"
  ],
  "Tamil Nadu": [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
    "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
    "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris",
    "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga",
    "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
    "Viluppuram", "Virudhunagar"
  ],
  "Telangana": [
    "Adilabad", "Bhadradri Kothagudem", "Hanumakonda", "Hyderabad", "Jagtial", "Jangaon",
    "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam",
    "Kumuram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak",
    "Medchal Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal",
    "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet",
    "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
  ],
  "Tripura": [
    "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"
  ],
  "Uttar Pradesh": [
    "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya",
    "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki",
    "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli",
    "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad",
    "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur",
    "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj",
    "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar",
    "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau",
    "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh",
    "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar",
    "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra",
    "Sultanpur", "Unnao", "Varanasi"
  ],
  "Uttarakhand": [
    "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital",
    "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"
  ],
  "West Bengal": [
    "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling",
    "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda",
    "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur",
    "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"
  ],

  // Union Territories
  "Andaman and Nicobar Islands": [
    "Nicobar", "North and Middle Andaman", "South Andaman"
  ],
  "Chandigarh": [
    "Chandigarh"
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Dadra and Nagar Haveli", "Daman", "Diu"
  ],
  "Delhi": [
    "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi",
    "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"
  ],
  "Jammu and Kashmir": [
    "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu",
    "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri",
    "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"
  ],
  "Ladakh": [
    "Kargil", "Leh"
  ],
  "Lakshadweep": [
    "Lakshadweep"
  ],
  "Puducherry": [
    "Karaikal", "Mahe", "Puducherry", "Yanam"
  ],
};

/**
 * Common district name aliases and historic renames
 */
export const DISTRICT_ALIASES: Record<string, { canonical: string; state: string }> = {
  // Maharashtra
  "aurangabad": { canonical: "Chhatrapati Sambhaji Nagar", state: "Maharashtra" },
  "osmanabad": { canonical: "Dharashiv", state: "Maharashtra" },
  "mumbai": { canonical: "Mumbai City", state: "Maharashtra" },
  "bombay": { canonical: "Mumbai City", state: "Maharashtra" },

  // Karnataka
  "bangalore": { canonical: "Bengaluru Urban", state: "Karnataka" },
  "bangalore urban": { canonical: "Bengaluru Urban", state: "Karnataka" },
  "bangalore rural": { canonical: "Bengaluru Rural", state: "Karnataka" },
  "belgaum": { canonical: "Belagavi", state: "Karnataka" },
  "bellary": { canonical: "Ballari", state: "Karnataka" },
  "bijapur": { canonical: "Vijayapura", state: "Karnataka" },
  "gulbarga": { canonical: "Kalaburagi", state: "Karnataka" },
  "mysore": { canonical: "Mysuru", state: "Karnataka" },
  "shimoga": { canonical: "Shivamogga", state: "Karnataka" },
  "tumkur": { canonical: "Tumakuru", state: "Karnataka" },
  "mangalore": { canonical: "Dakshina Kannada", state: "Karnataka" },

  // Uttar Pradesh
  "allahabad": { canonical: "Prayagraj", state: "Uttar Pradesh" },
  "faizabad": { canonical: "Ayodhya", state: "Uttar Pradesh" },
  "banaras": { canonical: "Varanasi", state: "Uttar Pradesh" },
  "kashi": { canonical: "Varanasi", state: "Uttar Pradesh" },
  "noida": { canonical: "Gautam Buddha Nagar", state: "Uttar Pradesh" },
  "greater noida": { canonical: "Gautam Buddha Nagar", state: "Uttar Pradesh" },

  // West Bengal
  "barasat": { canonical: "North 24 Parganas", state: "West Bengal" },
  "calcutta": { canonical: "Kolkata", state: "West Bengal" },
  "bardhaman": { canonical: "Purba Bardhaman", state: "West Bengal" },
  "burdwan": { canonical: "Purba Bardhaman", state: "West Bengal" },
  "midnapore": { canonical: "Paschim Medinipur", state: "West Bengal" },

  // Tamil Nadu
  "madras": { canonical: "Chennai", state: "Tamil Nadu" },
  "trichy": { canonical: "Tiruchirappalli", state: "Tamil Nadu" },
  "tanjore": { canonical: "Thanjavur", state: "Tamil Nadu" },
  "tuticorin": { canonical: "Thoothukudi", state: "Tamil Nadu" },

  // Kerala
  "cochin": { canonical: "Ernakulam", state: "Kerala" },
  "kochi": { canonical: "Ernakulam", state: "Kerala" },
  "trivandrum": { canonical: "Thiruvananthapuram", state: "Kerala" },
  "calicut": { canonical: "Kozhikode", state: "Kerala" },
  "alleppey": { canonical: "Alappuzha", state: "Kerala" },
  "palghat": { canonical: "Palakkad", state: "Kerala" },
  "quilon": { canonical: "Kollam", state: "Kerala" },

  // Telangana
  "secunderabad": { canonical: "Hyderabad", state: "Telangana" },

  // Punjab
  "mohali": { canonical: "Sahibzada Ajit Singh Nagar", state: "Punjab" },
  "sas nagar": { canonical: "Sahibzada Ajit Singh Nagar", state: "Punjab" },
  "nawanshahr": { canonical: "Shahid Bhagat Singh Nagar", state: "Punjab" },

  // Odisha
  "bhubaneswar": { canonical: "Khordha", state: "Odisha" },

  // Haryana
  "gurgaon": { canonical: "Gurugram", state: "Haryana" },

  // Delhi
  "delhi": { canonical: "New Delhi", state: "Delhi" },
};

/**
 * Known blocks/talukas for popular districts
 */
export const POPULAR_TALUKAS_BY_DISTRICT: Record<string, string[]> = {
  // Gujarat
  "Anand": ["Anand", "Borsad", "Khambhat", "Petlad", "Sojitra", "Tarapur", "Umreth"],
  "Ahmedabad": ["Ahmedabad City", "Daskroi", "Sanand", "Dholka", "Bavla", "Viramgam", "Mandal", "Detroj-Rampura"],
  "Surat": ["Surat City", "Chorasi", "Olpad", "Bardoli", "Kamrej", "Mahuva", "Mandvi", "Mangrol", "Umarpada"],
  "Vadodara": ["Vadodara", "Padra", "Karjan", "Dabhoi", "Savli", "Vaghodia", "Sinor", "Desar"],
  "Rajkot": ["Rajkot", "Gondal", "Jetpur", "Dhoraji", "Upleta", "Jasdan", "Kotda Sangani", "Lodhika"],
  "Gandhinagar": ["Gandhinagar", "Kalol", "Dehgam", "Mansa"],
  "Mehsana": ["Mehsana", "Kadi", "Visnagar", "Unjha", "Vadnagar", "Vijapur", "Becharaji", "Satlasana"],
  "Kutch": ["Bhuj", "Gandhidham", "Anjar", "Mandvi", "Mundra", "Nakhatrana", "Abdasa", "Lakhpat", "Rapar"],

  // Maharashtra
  "Pune": ["Pune City", "Haveli", "Khed", "Shirur", "Baramati", "Maval", "Mulshi", "Ambegaon", "Indapur", "Daund", "Purandar", "Bhor", "Junnar", "Velhe"],
  "Mumbai City": ["Colaba", "Fort", "Dadar", "Byculla", "Worli", "Marine Lines"],
  "Mumbai Suburban": ["Andheri", "Bandra", "Borivali", "Kurla", "Malad", "Goregaon", "Ghatkopar", "Mulund"],
  "Thane": ["Thane", "Kalyan", "Ulhasnagar", "Bhiwandi", "Murbad", "Shahapur", "Ambernath"],
  "Nagpur": ["Nagpur Urban", "Nagpur Rural", "Kamptee", "Hingna", "Katol", "Ramtek", "Umred", "Saoner", "Narkhed"],
  "Nashik": ["Nashik", "Sinnar", "Niphad", "Malegaon", "Yeola", "Dindori", "Igatpuri", "Trimbakeshwar", "Kalwan"],
  "Chhatrapati Sambhaji Nagar": ["Aurangabad", "Paithan", "Gangapur", "Vaijapur", "Kannad", "Sillod", "Khuldabad", "Soygaon"],
  "Solapur": ["Solapur North", "Solapur South", "Pandharpur", "Barshi", "Madha", "Mohol", "Karmala", "Sangola", "Mangalwedha"],
  "Kolhapur": ["Karvir", "Hatkanangle", "Shirol", "Radhanagari", "Kagal", "Panhala", "Bhudargad", "Ajara", "Gadhinglaj", "Shahuwadi"],
  "Satara": ["Satara", "Karad", "Wai", "Phaltan", "Koregaon", "Mahabaleshwar", "Patan", "Jaoli", "Khandala"],
  "Ratnagiri": ["Ratnagiri", "Khed", "Chiplun", "Dapoli", "Guhagar", "Lanja", "Rajapur", "Sangameshwar", "Mandangad"],
  "Raigad": ["Alibag", "Panvel", "Pen", "Karjat", "Roha", "Mangaon", "Mahad", "Uran", "Khalapur", "Murud", "Shrivardhan"],

  // West Bengal
  "North 24 Parganas": ["Barasat", "Barrackpore", "Bidhannagar", "Basirhat", "Bongaigaon", "Habra", "Naihati", "Madhyamgram", "Bhatpara", "Rajarhat", "Deganga", "Amdanga"],
  "Kolkata": ["Kolkata North", "Kolkata South", "Alipore", "Bhowanipore", "Behala", "Jadavpur", "Salt Lake", "Park Street"],
  "Howrah": ["Howrah", "Bally", "Uluberia", "Amta", "Shyampur", "Bagnan", "Domjur", "Panchla"],
  "South 24 Parganas": ["Alipore", "Baruipur", "Canning", "Diamond Harbour", "Kakdwip", "Sonarpur", "Bhangar", "Budge Budge"],
  "Hooghly": ["Chinsurah", "Chandannagar", "Serampore", "Arambagh", "Uttarpara", "Dankuni", "Singur", "Tarakeswar"],
  "Nadia": ["Krishnanagar", "Kalyani", "Ranaghat", "Tehatta", "Nabadwip", "Santipur", "Chakdaha"],

  // Karnataka
  "Bengaluru Urban": ["Bengaluru North", "Bengaluru South", "Bengaluru East", "Anekal", "Yelahanka"],
  "Bengaluru Rural": ["Devanahalli", "Doddaballapura", "Hosakote", "Nelamangala"],
  "Mysuru": ["Mysuru", "Nanjangud", "Hunsur", "T Narasipura", "Heggadadevankote", "Piriyapatna", "Krishnarajanagara"],
  "Dharwad": ["Hubballi", "Dharwad", "Kundgol", "Navalgund", "Kalghatgi"],

  // Tamil Nadu
  "Coimbatore": ["Coimbatore North", "Coimbatore South", "Pollachi", "Mettupalayam", "Sulur", "Annur", "Kinathukadavu", "Valparai"],
  "Chennai": ["Egmore", "Mylapore", "T Nagar", "Guindy", "Ambattur", "Velachery", "Ayanavaram", "Tondiarpet"],
  "Madurai": ["Madurai North", "Madurai South", "Melur", "Thirumangalam", "Usilampatti", "Vadipatti", "Peraiyur"],

  // Rajasthan
  "Jaipur": ["Jaipur", "Sanganer", "Amber", "Chomu", "Phulera", "Kotputli", "Bassi", "Chaksu", "Jamwa Ramgarh"],
  "Jodhpur": ["Jodhpur", "Osian", "Phalodi", "Bilara", "Bhopalgarh", "Shergarh", "Luni"],

  // Uttar Pradesh
  "Lucknow": ["Lucknow", "Mohanlalganj", "Bakshi Ka Talab", "Malihabad", "Sarojini Nagar"],
  "Kanpur Nagar": ["Kanpur", "Bilhaur", "Ghatampur"],
  "Varanasi": ["Varanasi", "Pindra", "Rajatalab"],
  "Gautam Buddha Nagar": ["Noida", "Dadri", "Jewar"],
};

/**
 * Normalizes input text for case-insensitive matching
 */
export function cleanLocationStr(str?: string | null): string {
  if (!str) return "";
  return str.trim().toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ");
}

/**
 * Find canonical state name from user input
 */
export function normalizeStateName(input?: string | null): string | null {
  if (!input) return null;
  const clean = cleanLocationStr(input);
  if (!clean) return null;

  for (const s of ALL_INDIAN_STATES) {
    if (cleanLocationStr(s.name) === clean || cleanLocationStr(s.code) === clean) {
      return s.name;
    }
    if (s.aliases?.some((a) => cleanLocationStr(a) === clean)) {
      return s.name;
    }
  }

  // Partial start match if length >= 3
  if (clean.length >= 3) {
    const matched = ALL_INDIAN_STATES.find(
      (s) =>
        cleanLocationStr(s.name).startsWith(clean) ||
        clean.startsWith(cleanLocationStr(s.name))
    );
    if (matched) return matched.name;
  }

  return null;
}

/**
 * Checks if a given state string is a valid Indian State / UT
 */
export function isValidIndianState(stateName?: string | null): boolean {
  return normalizeStateName(stateName) !== null;
}

/**
 * Retrieve sorted list of official districts for a valid Indian State
 */
export function getDistrictsForState(stateName?: string | null): string[] {
  const canonicalState = normalizeStateName(stateName);
  if (!canonicalState) return [];
  return INDIA_DISTRICTS_BY_STATE[canonicalState] || [];
}

/**
 * Find if a district name belongs to ANY Indian state, and return which state it belongs to
 */
export function findStateForDistrict(districtName?: string | null): { state: string; canonicalDistrict: string } | null {
  if (!districtName) return null;
  const clean = cleanLocationStr(districtName);
  if (!clean) return null;

  // Check aliases first
  const aliasMatch = DISTRICT_ALIASES[clean];
  if (aliasMatch) {
    return { state: aliasMatch.state, canonicalDistrict: aliasMatch.canonical };
  }

  // Check across all states
  for (const [state, districts] of Object.entries(INDIA_DISTRICTS_BY_STATE)) {
    for (const d of districts) {
      if (cleanLocationStr(d) === clean) {
        return { state, canonicalDistrict: d };
      }
    }
  }

  // Partial match across all states
  if (clean.length >= 3) {
    for (const [state, districts] of Object.entries(INDIA_DISTRICTS_BY_STATE)) {
      for (const d of districts) {
        if (cleanLocationStr(d).startsWith(clean)) {
          return { state, canonicalDistrict: d };
        }
      }
    }
  }

  return null;
}

export interface DistrictValidationResult {
  valid: boolean;
  canonicalDistrict?: string;
  belongsToOtherState?: string;
  errorMessage?: string;
}

/**
 * Strictly validates whether district belongs to selected state
 */
export function validateDistrictForState(
  stateName?: string | null,
  districtName?: string | null
): DistrictValidationResult {
  if (!stateName || !stateName.trim()) {
    return {
      valid: false,
      errorMessage: "Please select an Indian State or Union Territory first.",
    };
  }

  const canonicalState = normalizeStateName(stateName);
  if (!canonicalState) {
    return {
      valid: false,
      errorMessage: `"${stateName}" is not a recognized Indian State or Union Territory.`,
    };
  }

  if (!districtName || !districtName.trim()) {
    return {
      valid: false,
      errorMessage: "District is required.",
    };
  }

  const clean = cleanLocationStr(districtName);
  const validDistricts = INDIA_DISTRICTS_BY_STATE[canonicalState] || [];

  // Check direct alias
  const alias = DISTRICT_ALIASES[clean];
  if (alias) {
    if (alias.state === canonicalState) {
      return { valid: true, canonicalDistrict: alias.canonical };
    } else {
      return {
        valid: false,
        belongsToOtherState: alias.state,
        errorMessage: `"${districtName}" is located in ${alias.state}, not ${canonicalState}. Please select an official district in ${canonicalState}.`,
      };
    }
  }

  // Exact match against state's districts
  for (const d of validDistricts) {
    if (cleanLocationStr(d) === clean) {
      return { valid: true, canonicalDistrict: d };
    }
  }

  // Prefix match against state's districts
  if (clean.length >= 3) {
    const startsWithMatch = validDistricts.find((d) => cleanLocationStr(d).startsWith(clean));
    if (startsWithMatch && clean.length === cleanLocationStr(startsWithMatch).length) {
      return { valid: true, canonicalDistrict: startsWithMatch };
    }
  }

  // Check if it belongs to another state
  const otherStateMatch = findStateForDistrict(districtName);
  if (otherStateMatch && otherStateMatch.state !== canonicalState) {
    return {
      valid: false,
      belongsToOtherState: otherStateMatch.state,
      errorMessage: `"${districtName}" belongs to ${otherStateMatch.state}, not ${canonicalState}. Please select a valid district in ${canonicalState}.`,
    };
  }

  // Check if it's obvious nonsense / garbage text like 'abc', 'xyz', '123'
  if (clean.length < 3 || /^(abc|xyz|test|asdf|qwerty|none|na|nil|\d+)$/i.test(clean)) {
    return {
      valid: false,
      errorMessage: `Invalid district "${districtName}". Please choose an official district of ${canonicalState} from the dropdown.`,
    };
  }

  return {
    valid: false,
    errorMessage: `"${districtName}" is not recognized as an official district of ${canonicalState}. Please select from the dropdown.`,
  };
}

/**
 * Get popular blocks/talukas for a district
 */
export function getPopularBlocksForDistrict(
  stateName?: string | null,
  districtName?: string | null
): string[] {
  if (!districtName) return [];
  const clean = cleanLocationStr(districtName);

  for (const [dist, talukas] of Object.entries(POPULAR_TALUKAS_BY_DISTRICT)) {
    if (cleanLocationStr(dist) === clean) {
      return talukas;
    }
  }
  return [];
}

/**
 * Validates block/village text for obvious garbage/placeholders like 'abc', 'xyz', '123'
 */
export function validateLocalityText(
  value?: string | null,
  fieldName: "Block / Taluka" | "Village / Town" = "Block / Taluka"
): { valid: boolean; errorMessage?: string } {
  if (!value || !value.trim()) {
    return { valid: true }; // optional fields can be empty unless made required
  }

  const clean = cleanLocationStr(value);
  if (clean.length < 2) {
    return {
      valid: false,
      errorMessage: `${fieldName} name is too short. Please enter a valid place name.`,
    };
  }

  if (/^(abc|xyz|test|asdf|qwerty|qwer|xxx|zzz|none|na|nil|\d+)$/i.test(clean)) {
    return {
      valid: false,
      errorMessage: `"${value}" is not a valid ${fieldName.toLowerCase()}. Please enter an authentic place name.`,
    };
  }

  if (/^[0-9\W]+$/.test(value.trim())) {
    return {
      valid: false,
      errorMessage: `${fieldName} cannot be only numbers or symbols.`,
    };
  }

  return { valid: true };
}

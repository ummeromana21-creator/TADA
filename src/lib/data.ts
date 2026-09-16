export type Country = { code: string; name: string; currency: string; regionLabel?: string; regions?: string[] };

const US = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
const CA = ["Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador","Northwest Territories","Nova Scotia","Nunavut","Ontario","Prince Edward Island","Quebec","Saskatchewan","Yukon"];
const AU = ["Australian Capital Territory","New South Wales","Northern Territory","Queensland","South Australia","Tasmania","Victoria","Western Australia"];
const IN = ["Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal","Other state / UT"];
const GB = ["England","Scotland","Wales","Northern Ireland"];
const DE = ["Baden-Württemberg","Bavaria","Berlin","Brandenburg","Bremen","Hamburg","Hesse","Lower Saxony","Mecklenburg-Vorpommern","North Rhine-Westphalia","Rhineland-Palatinate","Saarland","Saxony","Saxony-Anhalt","Schleswig-Holstein","Thuringia"];

const raw: [string, string, string, string?, string[]?][] = [
  ["US","United States","USD","State",US],["GB","United Kingdom","GBP","Nation",GB],["CA","Canada","CAD","Province / territory",CA],["AU","Australia","AUD","State / territory",AU],["IN","India","INR","State",IN],["DE","Germany","EUR","State",DE],
  ["IE","Ireland","EUR"],["FR","France","EUR"],["ES","Spain","EUR"],["PT","Portugal","EUR"],["IT","Italy","EUR"],["NL","Netherlands","EUR"],["BE","Belgium","EUR"],["AT","Austria","EUR"],["CH","Switzerland","CHF"],["SE","Sweden","SEK"],["NO","Norway","NOK"],["DK","Denmark","DKK"],["FI","Finland","EUR"],["PL","Poland","PLN"],["CZ","Czechia","CZK"],["GR","Greece","EUR"],["TR","Türkiye","TRY"],
  ["NZ","New Zealand","NZD"],["SG","Singapore","SGD"],["MY","Malaysia","MYR"],["PH","Philippines","PHP"],["ID","Indonesia","IDR"],["TH","Thailand","THB"],["VN","Vietnam","VND"],["JP","Japan","JPY"],["KR","South Korea","KRW"],["HK","Hong Kong","HKD"],["PK","Pakistan","PKR"],["BD","Bangladesh","BDT"],["LK","Sri Lanka","LKR"],["NP","Nepal","NPR"],
  ["AE","United Arab Emirates","AED"],["SA","Saudi Arabia","SAR"],["QA","Qatar","QAR"],["IL","Israel","ILS"],["EG","Egypt","EGP"],["MA","Morocco","MAD"],["NG","Nigeria","NGN"],["GH","Ghana","GHS"],["KE","Kenya","KES"],["ZA","South Africa","ZAR"],["TZ","Tanzania","TZS"],["UG","Uganda","UGX"],["ET","Ethiopia","ETB"],
  ["MX","Mexico","MXN"],["BR","Brazil","BRL"],["AR","Argentina","ARS"],["CL","Chile","CLP"],["CO","Colombia","COP"],["PE","Peru","PEN"],["JM","Jamaica","JMD"],["TT","Trinidad and Tobago","TTD"],["XX","Another country","USD"],
];
export const COUNTRIES: Country[] = raw.map(([code, name, currency, regionLabel, regions]) => ({ code, name, currency, regionLabel, regions }));
export const countryOf = (code: string) => COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[COUNTRIES.length - 1];
export const placeOf = (p: { region?: string; countryName: string }) => (p.region ? `${p.region}, ` : "") + p.countryName;

export const EXAMPLES: [string, string, string][] = [
  ["A small-batch home bakery in Austin — sourdough and celebration cakes, sold at farmers markets and by order online.", "US", "Texas"],
  ["Mobile car detailing in Leeds — I come to your driveway or office car park, weekends first.", "GB", "England"],
  ["An after-school maths tutoring service in Toronto for grades 6 to 10, small groups in a rented room.", "CA", "Ontario"],
  ["A dog-walking and pet-sitting business in Melbourne's inner north.", "AU", "Victoria"],
  ["A cloud kitchen in Bengaluru doing healthy lunch boxes for offices, delivered by app.", "IN", "Karnataka"],
];

/**
 * Complete Indian States (28) and Union Territories (8) Categorized by Region
 */
export const REGIONS = {
  ALL: 'All India',
  NORTH: 'North India',
  SOUTH: 'South India',
  WEST: 'West India',
  EAST: 'East India',
  CENTRAL: 'Central India',
  NORTHEAST: 'North-East India',
  UT: 'Union Territories',
};

export const STATES_AND_UTS = [
  // --- 28 STATES ---
  { id: 'andhra-pradesh', name: 'Andhra Pradesh', type: 'State', region: REGIONS.SOUTH, capital: 'Amaravati', code: 'AP' },
  { id: 'arunachal-pradesh', name: 'Arunachal Pradesh', type: 'State', region: REGIONS.NORTHEAST, capital: 'Itanagar', code: 'AR' },
  { id: 'assam', name: 'Assam', type: 'State', region: REGIONS.NORTHEAST, capital: 'Dispur', code: 'AS' },
  { id: 'bihar', name: 'Bihar', type: 'State', region: REGIONS.EAST, capital: 'Patna', code: 'BR' },
  { id: 'chhattisgarh', name: 'Chhattisgarh', type: 'State', region: REGIONS.CENTRAL, capital: 'Raipur', code: 'CG' },
  { id: 'goa', name: 'Goa', type: 'State', region: REGIONS.WEST, capital: 'Panaji', code: 'GA' },
  { id: 'gujarat', name: 'Gujarat', type: 'State', region: REGIONS.WEST, capital: 'Gandhinagar', code: 'GJ' },
  { id: 'haryana', name: 'Haryana', type: 'State', region: REGIONS.NORTH, capital: 'Chandigarh', code: 'HR' },
  { id: 'himachal-pradesh', name: 'Himachal Pradesh', type: 'State', region: REGIONS.NORTH, capital: 'Shimla', code: 'HP' },
  { id: 'jharkhand', name: 'Jharkhand', type: 'State', region: REGIONS.EAST, capital: 'Ranchi', code: 'JH' },
  { id: 'karnataka', name: 'Karnataka', type: 'State', region: REGIONS.SOUTH, capital: 'Bengaluru', code: 'KA' },
  { id: 'kerala', name: 'Kerala', type: 'State', region: REGIONS.SOUTH, capital: 'Thiruvananthapuram', code: 'KL' },
  { id: 'madhya-pradesh', name: 'Madhya Pradesh', type: 'State', region: REGIONS.CENTRAL, capital: 'Bhopal', code: 'MP' },
  { id: 'maharashtra', name: 'Maharashtra', type: 'State', region: REGIONS.WEST, capital: 'Mumbai', code: 'MH' },
  { id: 'manipur', name: 'Manipur', type: 'State', region: REGIONS.NORTHEAST, capital: 'Imphal', code: 'MN' },
  { id: 'meghalaya', name: 'Meghalaya', type: 'State', region: REGIONS.NORTHEAST, capital: 'Shillong', code: 'ML' },
  { id: 'mizoram', name: 'Mizoram', type: 'State', region: REGIONS.NORTHEAST, capital: 'Aizawl', code: 'MZ' },
  { id: 'nagaland', name: 'Nagaland', type: 'State', region: REGIONS.NORTHEAST, capital: 'Kohima', code: 'NL' },
  { id: 'odisha', name: 'Odisha', type: 'State', region: REGIONS.EAST, capital: 'Bhubaneswar', code: 'OD' },
  { id: 'punjab', name: 'Punjab', type: 'State', region: REGIONS.NORTH, capital: 'Chandigarh', code: 'PB' },
  { id: 'rajasthan', name: 'Rajasthan', type: 'State', region: REGIONS.NORTH, capital: 'Jaipur', code: 'RJ' },
  { id: 'sikkim', name: 'Sikkim', type: 'State', region: REGIONS.NORTHEAST, capital: 'Gangtok', code: 'SK' },
  { id: 'tamil-nadu', name: 'Tamil Nadu', type: 'State', region: REGIONS.SOUTH, capital: 'Chennai', code: 'TN' },
  { id: 'telangana', name: 'Telangana', type: 'State', region: REGIONS.SOUTH, capital: 'Hyderabad', code: 'TS' },
  { id: 'tripura', name: 'Tripura', type: 'State', region: REGIONS.NORTHEAST, capital: 'Agartala', code: 'TR' },
  { id: 'uttar-pradesh', name: 'Uttar Pradesh', type: 'State', region: REGIONS.NORTH, capital: 'Lucknow', code: 'UP' },
  { id: 'uttarakhand', name: 'Uttarakhand', type: 'State', region: REGIONS.NORTH, capital: 'Dehradun', code: 'UK' },
  { id: 'west-bengal', name: 'West Bengal', type: 'State', region: REGIONS.EAST, capital: 'Kolkata', code: 'WB' },

  // --- 8 UNION TERRITORIES ---
  { id: 'andaman-nicobar', name: 'Andaman and Nicobar Islands', type: 'Union Territory', region: REGIONS.UT, capital: 'Port Blair', code: 'AN' },
  { id: 'chandigarh', name: 'Chandigarh', type: 'Union Territory', region: REGIONS.UT, capital: 'Chandigarh', code: 'CH' },
  { id: 'dadra-nagar-haveli-daman-diu', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'Union Territory', region: REGIONS.UT, capital: 'Daman', code: 'DN' },
  { id: 'delhi', name: 'Delhi', type: 'Union Territory', region: REGIONS.UT, capital: 'New Delhi', code: 'DL' },
  { id: 'jammu-kashmir', name: 'Jammu and Kashmir', type: 'Union Territory', region: REGIONS.UT, capital: 'Srinagar / Jammu', code: 'JK' },
  { id: 'ladakh', name: 'Ladakh', type: 'Union Territory', region: REGIONS.UT, capital: 'Leh', code: 'LA' },
  { id: 'lakshadweep', name: 'Lakshadweep', type: 'Union Territory', region: REGIONS.UT, capital: 'Kavaratti', code: 'LD' },
  { id: 'puducherry', name: 'Puducherry', type: 'Union Territory', region: REGIONS.UT, capital: 'Puducherry', code: 'PY' },
];

export const STATES = STATES_AND_UTS;
export const MRT_STATIONS = {
  NSL: ['Jurong East', 'Bukit Batok', 'Bukit Gombak', 'Choa Chu Kang', 'Yew Tee', 'Kranji', 'Marsiling', 'Woodlands', 'Admiralty', 'Sembawang', 'Canberra', 'Yishun', 'Khatib', 'Yio Chu Kang', 'Ang Mo Kio', 'Bishan', 'Braddell', 'Toa Payoh', 'Novena', 'Newton', 'Orchard', 'Somerset', 'Dhoby Ghaut', 'City Hall', 'Raffles Place', 'Marina Bay', 'Marina South Pier'],
  EWL: ['Pasir Ris', 'Tampines', 'Simei', 'Tanah Merah', 'Bedok', 'Kembangan', 'Eunos', 'Paya Lebar', 'Aljunied', 'Kallang', 'Lavender', 'Bugis', 'City Hall', 'Raffles Place', 'Tanjong Pagar', 'Outram Park', 'Tiong Bahru', 'Redhill', 'Queenstown', 'Commonwealth', 'Buona Vista', 'Dover', 'Clementi', 'Jurong East', 'Chinese Garden', 'Lakeside', 'Boon Lay', 'Pioneer', 'Joo Koon', 'Gul Circle', 'Tuas Crescent', 'Tuas West Road', 'Tuas Link'],
  CGL: ['Tanah Merah', 'Expo', 'Changi Airport'],
  DTL: ['Bukit Panjang', 'Cashew', 'Hillview', 'Beauty World', 'King Albert Park', 'Sixth Avenue', 'Tan Kah Kee', 'Botanic Gardens', 'Stevens', 'Newton', 'Little India', 'Rochor', 'Bugis', 'Promenade', 'Bayfront', 'Downtown', 'Telok Ayer', 'Chinatown', 'Fort Canning', 'Bencoolen', 'Jalan Besar', 'Bendemeer', 'Geylang Bahru', 'Mattar', 'MacPherson', 'Ubi', 'Kaki Bukit', 'Bedok North', 'Bedok Reservoir', 'Tampines West', 'Tampines', 'Tampines East', 'Upper Changi', 'Expo'],
  CCL: ['Dhoby Ghaut', 'Bras Basah', 'Esplanade', 'Promenade', 'Bayfront', 'Nicoll Highway', 'Stadium', 'Mountbatten', 'Dakota', 'Paya Lebar', 'MacPherson', 'Tai Seng', 'Bartley', 'Serangoon', 'Lorong Chuan', 'Bishan', 'Marymount', 'Caldecott', 'Botanic Gardens', 'Farrer Road', 'Holland Village', 'Buona Vista', 'one-north', 'Kent Ridge', 'Haw Par Villa', 'Pasir Panjang', 'Labrador Park', 'Telok Blangah', 'HarbourFront'],
  NEL: ['HarbourFront', 'Outram Park', 'Chinatown', 'Clarke Quay', 'Dhoby Ghaut', 'Little India', 'Farrer Park', 'Boon Keng', 'Potong Pasir', 'Woodleigh', 'Serangoon', 'Kovan', 'Hougang', 'Buangkok', 'Sengkang', 'Punggol', 'Punggol Coast'],
  TEL: ['Woodlands North', 'Woodlands', 'Woodlands South', 'Springleaf', 'Lentor', 'Mayflower', 'Bright Hill', 'Upper Thomson', 'Caldecott', 'Stevens', 'Napier', 'Orchard Boulevard', 'Orchard', 'Great World', 'Havelock', 'Outram Park', 'Maxwell', 'Shenton Way', 'Marina Bay', 'Gardens By The Bay', 'Tanjong Rhu', 'Katong Park', 'Tanjong Katong', 'Marine Parade', 'Marine Terrace', 'Siglap', 'Bayshore'],
  BPL: ['Choa Chu Kang', 'South View', 'Keat Hong', 'Teck Whye', 'Phoenix', 'Bukit Panjang', 'Petir', 'Pending', 'Bangkit', 'Fajar', 'Segar', 'Jelapang', 'Senja'],
  SWPL: ['Sengkang', 'Cheng Lim', 'Farmway', 'Kupang', 'Thanggam', 'Fernvale', 'Layar', 'Tongkang', 'Renjong'],
  SEPL: ['Sengkang', 'Compassvale', 'Rumbia', 'Bakau', 'Kangkar', 'Ranggung'],
  PEPLRT: ['Punggol', 'Cove', 'Meridian', 'Coral Edge', 'Riviera', 'Kadaloor', 'Oasis', 'Damai'],
  PWLRT: ['Punggol', 'Sam Kee', 'Punggol Point', 'Samudera', 'Nibong', 'Sumang', 'Soo Teck']
};

export const ALL_STATIONS = [...new Set(Object.values(MRT_STATIONS).flat())].sort((a, b) => a.localeCompare(b));

export const TRAIN_STATION_LINES = {
  Bishan: ['North-South Line', 'Circle Line'],
  'Dhoby Ghaut': ['North-South Line', 'North-East Line', 'Circle Line'],
  'Jurong East': ['North-South Line', 'East-West Line', 'Jurong Region Line'],
  'Marina Bay': ['North-South Line', 'Circle Line', 'Thomson-East Coast Line'],
  Woodlands: ['North-South Line', 'Thomson-East Coast Line'],
  'Paya Lebar': ['East-West Line', 'Circle Line'],
  HarbourFront: ['North-East Line', 'Circle Line']
};

export const LINE_COLOR_MAP = {
  'North-South Line': '#d42e12',
  'East-West Line': '#009645',
  'Circle Line': '#fa9e0d',
  'Downtown Line': '#005ec4',
  'North-East Line': '#9900aa',
  'Thomson-East Coast Line': '#9d5b25',
  'Jurong Region Line': '#00a0a8',
  'LRT Line': '#748477'
};

export const LIVE_TICKER_STATIONS = [
  { station: 'Marina Bay', line: 'North-South Line' },
  { station: 'Paya Lebar', line: 'Circle Line' },
  { station: 'Woodlands', line: 'Thomson-East Coast Line' },
  { station: 'Dhoby Ghaut', line: 'North-East Line' },
  { station: 'Jurong East', line: 'East-West Line' }
];

export const LIVE_TICKER_ROTATION_MS = 5000;

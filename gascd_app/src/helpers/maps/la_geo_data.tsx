export interface LAGeoItem {
  meta: {
    code: string;
    name: string;
    geotype: string;
  };
  bbox: number[][];
}

export interface LAGeoLookup {
  [la_code: string]: LAGeoItem;
}

// Generated from ONS data
// https://cdn.ons.gov.uk/maptiles/cm-geos/v2/{lacode}.geojson
// - using the script in utils/import_la_locations.py
export const LAGeoData: LAGeoLookup = {
  E06000001: {
    meta: {
      code: 'E06000001',
      name: 'Hartlepool',
      geotype: 'LAD',
    },
    bbox: [
      [-1.38376, 54.6219],
      [-1.15764, 54.72717],
    ],
  },
  E06000002: {
    meta: {
      code: 'E06000002',
      name: 'Middlesbrough',
      geotype: 'LAD',
    },
    bbox: [
      [-1.28543, 54.50113],
      [-1.13737, 54.5907],
    ],
  },
  E06000003: {
    meta: {
      code: 'E06000003',
      name: 'Redcar and Cleveland',
      geotype: 'LAD',
    },
    bbox: [
      [-1.20174, 54.48785],
      [-0.78863, 54.64755],
    ],
  },
  E06000004: {
    meta: {
      code: 'E06000004',
      name: 'Stockton-on-Tees',
      geotype: 'LAD',
    },
    bbox: [
      [-1.45264, 54.46416],
      [-1.15875, 54.64525],
    ],
  },
  E06000005: {
    meta: {
      code: 'E06000005',
      name: 'Darlington',
      geotype: 'LAD',
    },
    bbox: [
      [-1.70967, 54.45116],
      [-1.40729, 54.61937],
    ],
  },
  E06000006: {
    meta: {
      code: 'E06000006',
      name: 'Halton',
      geotype: 'LAD',
    },
    bbox: [
      [-2.83246, 53.30503],
      [-2.59522, 53.40255],
    ],
  },
  E06000007: {
    meta: {
      code: 'E06000007',
      name: 'Warrington',
      geotype: 'LAD',
    },
    bbox: [
      [-2.69772, 53.32245],
      [-2.42538, 53.48093],
    ],
  },
  E06000008: {
    meta: {
      code: 'E06000008',
      name: 'Blackburn with Darwen',
      geotype: 'LAD',
    },
    bbox: [
      [-2.56466, 53.61663],
      [-2.36264, 53.78179],
    ],
  },
  E06000009: {
    meta: {
      code: 'E06000009',
      name: 'Blackpool',
      geotype: 'LAD',
    },
    bbox: [
      [-3.05903, 53.77312],
      [-2.98336, 53.87558],
    ],
  },
  E06000010: {
    meta: {
      code: 'E06000010',
      name: 'Kingston upon Hull, City of',
      geotype: 'LAD',
    },
    bbox: [
      [-0.42258, 53.71958],
      [-0.2414, 53.81327],
    ],
  },
  E06000011: {
    meta: {
      code: 'E06000011',
      name: 'East Riding of Yorkshire',
      geotype: 'LAD',
    },
    bbox: [
      [-1.10336, 53.57135],
      [0.14688, 54.17652],
    ],
  },
  E06000012: {
    meta: {
      code: 'E06000012',
      name: 'North East Lincolnshire',
      geotype: 'LAD',
    },
    bbox: [
      [-0.29212, 53.43356],
      [0.01763, 53.63997],
    ],
  },
  E06000013: {
    meta: {
      code: 'E06000013',
      name: 'North Lincolnshire',
      geotype: 'LAD',
    },
    bbox: [
      [-0.95001, 53.45523],
      [-0.20073, 53.7146],
    ],
  },
  E06000014: {
    meta: {
      code: 'E06000014',
      name: 'York',
      geotype: 'LAD',
    },
    bbox: [
      [-1.2237, 53.87459],
      [-0.91968, 54.05688],
    ],
  },
  E06000015: {
    meta: {
      code: 'E06000015',
      name: 'Derby',
      geotype: 'LAD',
    },
    bbox: [
      [-1.55685, 52.86112],
      [-1.38307, 52.96815],
    ],
  },
  E06000016: {
    meta: {
      code: 'E06000016',
      name: 'Leicester',
      geotype: 'LAD',
    },
    bbox: [
      [-1.21598, 52.58067],
      [-1.0462, 52.69152],
    ],
  },
  E06000017: {
    meta: {
      code: 'E06000017',
      name: 'Rutland',
      geotype: 'LAD',
    },
    bbox: [
      [-0.82175, 52.52489],
      [-0.42837, 52.75982],
    ],
  },
  E06000018: {
    meta: {
      code: 'E06000018',
      name: 'Nottingham',
      geotype: 'LAD',
    },
    bbox: [
      [-1.24684, 52.88903],
      [-1.08612, 53.01869],
    ],
  },
  E06000019: {
    meta: {
      code: 'E06000019',
      name: 'Herefordshire, County of',
      geotype: 'LAD',
    },
    bbox: [
      [-3.14192, 51.82608],
      [-2.33796, 52.39544],
    ],
  },
  E06000020: {
    meta: {
      code: 'E06000020',
      name: 'Telford and Wrekin',
      geotype: 'LAD',
    },
    bbox: [
      [-2.66736, 52.61461],
      [-2.31221, 52.82838],
    ],
  },
  E06000021: {
    meta: {
      code: 'E06000021',
      name: 'Stoke-on-Trent',
      geotype: 'LAD',
    },
    bbox: [
      [-2.23876, 52.94621],
      [-2.07924, 53.09272],
    ],
  },
  E06000022: {
    meta: {
      code: 'E06000022',
      name: 'Bath and North East Somerset',
      geotype: 'LAD',
    },
    bbox: [
      [-2.70789, 51.2731],
      [-2.27854, 51.43953],
    ],
  },
  E06000023: {
    meta: {
      code: 'E06000023',
      name: 'Bristol, City of',
      geotype: 'LAD',
    },
    bbox: [
      [-2.77362, 51.39728],
      [-2.51046, 51.54443],
    ],
  },
  E06000024: {
    meta: {
      code: 'E06000024',
      name: 'North Somerset',
      geotype: 'LAD',
    },
    bbox: [
      [-3.11506, 51.29061],
      [-2.5872, 51.50249],
    ],
  },
  E06000025: {
    meta: {
      code: 'E06000025',
      name: 'South Gloucestershire',
      geotype: 'LAD',
    },
    bbox: [
      [-2.69539, 51.41593],
      [-2.25211, 51.67731],
    ],
  },
  E06000026: {
    meta: {
      code: 'E06000026',
      name: 'Plymouth',
      geotype: 'LAD',
    },
    bbox: [
      [-4.20534, 50.33307],
      [-4.01963, 50.44415],
    ],
  },
  E06000027: {
    meta: {
      code: 'E06000027',
      name: 'Torbay',
      geotype: 'LAD',
    },
    bbox: [
      [-3.62841, 50.37348],
      [-3.48067, 50.5185],
    ],
  },
  E06000030: {
    meta: {
      code: 'E06000030',
      name: 'Swindon',
      geotype: 'LAD',
    },
    bbox: [
      [-1.86513, 51.48245],
      [-1.60281, 51.69271],
    ],
  },
  E06000031: {
    meta: {
      code: 'E06000031',
      name: 'Peterborough',
      geotype: 'LAD',
    },
    bbox: [
      [-0.49765, 52.50611],
      [-0.01284, 52.67522],
    ],
  },
  E06000032: {
    meta: {
      code: 'E06000032',
      name: 'Luton',
      geotype: 'LAD',
    },
    bbox: [
      [-0.50592, 51.85448],
      [-0.3499, 51.92775],
    ],
  },
  E06000033: {
    meta: {
      code: 'E06000033',
      name: 'Southend-on-Sea',
      geotype: 'LAD',
    },
    bbox: [
      [0.62296, 51.52134],
      [0.82083, 51.5768],
    ],
  },
  E06000034: {
    meta: {
      code: 'E06000034',
      name: 'Thurrock',
      geotype: 'LAD',
    },
    bbox: [
      [0.21069, 51.45112],
      [0.54125, 51.56782],
    ],
  },
  E06000035: {
    meta: {
      code: 'E06000035',
      name: 'Medway',
      geotype: 'LAD',
    },
    bbox: [
      [0.39735, 51.3279],
      [0.72351, 51.48725],
    ],
  },
  E06000036: {
    meta: {
      code: 'E06000036',
      name: 'Bracknell Forest',
      geotype: 'LAD',
    },
    bbox: [
      [-0.83735, 51.33196],
      [-0.63055, 51.46872],
    ],
  },
  E06000037: {
    meta: {
      code: 'E06000037',
      name: 'West Berkshire',
      geotype: 'LAD',
    },
    bbox: [
      [-1.58806, 51.32896],
      [-0.9817, 51.56371],
    ],
  },
  E06000038: {
    meta: {
      code: 'E06000038',
      name: 'Reading',
      geotype: 'LAD',
    },
    bbox: [
      [-1.05297, 51.40978],
      [-0.92848, 51.49309],
    ],
  },
  E06000039: {
    meta: {
      code: 'E06000039',
      name: 'Slough',
      geotype: 'LAD',
    },
    bbox: [
      [-0.66014, 51.46798],
      [-0.49002, 51.5389],
    ],
  },
  E06000040: {
    meta: {
      code: 'E06000040',
      name: 'Windsor and Maidenhead',
      geotype: 'LAD',
    },
    bbox: [
      [-0.85391, 51.38287],
      [-0.52277, 51.57783],
    ],
  },
  E06000041: {
    meta: {
      code: 'E06000041',
      name: 'Wokingham',
      geotype: 'LAD',
    },
    bbox: [
      [-1.01188, 51.35208],
      [-0.78884, 51.56213],
    ],
  },
  E06000042: {
    meta: {
      code: 'E06000042',
      name: 'Milton Keynes',
      geotype: 'LAD',
    },
    bbox: [
      [-0.8873, 51.96923],
      [-0.59181, 52.19634],
    ],
  },
  E06000043: {
    meta: {
      code: 'E06000043',
      name: 'Brighton and Hove',
      geotype: 'LAD',
    },
    bbox: [
      [-0.24497, 50.79908],
      [-0.016, 50.89237],
    ],
  },
  E06000044: {
    meta: {
      code: 'E06000044',
      name: 'Portsmouth',
      geotype: 'LAD',
    },
    bbox: [
      [-1.17294, 50.75016],
      [-1.02063, 50.8593],
    ],
  },
  E06000045: {
    meta: {
      code: 'E06000045',
      name: 'Southampton',
      geotype: 'LAD',
    },
    bbox: [
      [-1.47733, 50.87992],
      [-1.32198, 50.95613],
    ],
  },
  E06000046: {
    meta: {
      code: 'E06000046',
      name: 'Isle of Wight',
      geotype: 'LAD',
    },
    bbox: [
      [-1.58654, 50.57493],
      [-1.0696, 50.76733],
    ],
  },
  E06000047: {
    meta: {
      code: 'E06000047',
      name: 'County Durham',
      geotype: 'LAD',
    },
    bbox: [
      [-2.35548, 54.45152],
      [-1.24098, 54.9187],
    ],
  },
  E06000049: {
    meta: {
      code: 'E06000049',
      name: 'Cheshire East',
      geotype: 'LAD',
    },
    bbox: [
      [-2.75293, 52.94716],
      [-1.97486, 53.38746],
    ],
  },
  E06000050: {
    meta: {
      code: 'E06000050',
      name: 'Cheshire West and Chester',
      geotype: 'LAD',
    },
    bbox: [
      [-3.12302, 52.98294],
      [-2.34635, 53.3447],
    ],
  },
  E06000051: {
    meta: {
      code: 'E06000051',
      name: 'Shropshire',
      geotype: 'LAD',
    },
    bbox: [
      [-3.23554, 52.30628],
      [-2.23289, 52.99841],
    ],
  },
  E06000052: {
    meta: {
      code: 'E06000052',
      name: 'Cornwall',
      geotype: 'LAD',
    },
    bbox: [
      [-5.71702, 49.9587],
      [-4.16639, 50.93127],
    ],
  },
  E06000053: {
    meta: {
      code: 'E06000053',
      name: 'Isles of Scilly',
      geotype: 'LAD',
    },
    bbox: [
      [-6.41867, 49.86479],
      [-6.24461, 49.98065],
    ],
  },
  E06000054: {
    meta: {
      code: 'E06000054',
      name: 'Wiltshire',
      geotype: 'LAD',
    },
    bbox: [
      [-2.36559, 50.94499],
      [-1.48571, 51.70315],
    ],
  },
  E06000055: {
    meta: {
      code: 'E06000055',
      name: 'Bedford',
      geotype: 'LAD',
    },
    bbox: [
      [-0.66866, 52.05454],
      [-0.24072, 52.32295],
    ],
  },
  E06000056: {
    meta: {
      code: 'E06000056',
      name: 'Central Bedfordshire',
      geotype: 'LAD',
    },
    bbox: [
      [-0.70216, 51.8051],
      [-0.14393, 52.19093],
    ],
  },
  E06000057: {
    meta: {
      code: 'E06000057',
      name: 'Northumberland',
      geotype: 'LAD',
    },
    bbox: [
      [-2.68979, 54.78238],
      [-1.46179, 55.81113],
    ],
  },
  E06000058: {
    meta: {
      code: 'E06000058',
      name: 'Bournemouth, Christchurch and Poole',
      geotype: 'LAD',
    },
    bbox: [
      [-2.04081, 50.68267],
      [-1.68167, 50.80961],
    ],
  },
  E06000059: {
    meta: {
      code: 'E06000059',
      name: 'Dorset',
      geotype: 'LAD',
    },
    bbox: [
      [-2.9616, 50.51311],
      [-1.79061, 51.08099],
    ],
  },
  E06000060: {
    meta: {
      code: 'E06000060',
      name: 'Buckinghamshire',
      geotype: 'LAD',
    },
    bbox: [
      [-1.14068, 51.48547],
      [-0.4766, 52.08153],
    ],
  },
  E06000061: {
    meta: {
      code: 'E06000061',
      name: 'North Northamptonshire',
      geotype: 'LAD',
    },
    bbox: [
      [-0.90625, 52.19157],
      [-0.34159, 52.64362],
    ],
  },
  E06000062: {
    meta: {
      code: 'E06000062',
      name: 'West Northamptonshire',
      geotype: 'LAD',
    },
    bbox: [
      [-1.33233, 51.97729],
      [-0.70504, 52.47746],
    ],
  },
  E08000001: {
    meta: {
      code: 'E08000001',
      name: 'Bolton',
      geotype: 'LAD',
    },
    bbox: [
      [-2.62861, 53.52288],
      [-2.33699, 53.64605],
    ],
  },
  E08000002: {
    meta: {
      code: 'E08000002',
      name: 'Bury',
      geotype: 'LAD',
    },
    bbox: [
      [-2.38346, 53.51202],
      [-2.23416, 53.66708],
    ],
  },
  E08000003: {
    meta: {
      code: 'E08000003',
      name: 'Manchester',
      geotype: 'LAD',
    },
    bbox: [
      [-2.31992, 53.34012],
      [-2.14686, 53.54461],
    ],
  },
  E08000004: {
    meta: {
      code: 'E08000004',
      name: 'Oldham',
      geotype: 'LAD',
    },
    bbox: [
      [-2.18601, 53.49113],
      [-1.90962, 53.62417],
    ],
  },
  E08000005: {
    meta: {
      code: 'E08000005',
      name: 'Rochdale',
      geotype: 'LAD',
    },
    bbox: [
      [-2.28244, 53.52906],
      [-2.02682, 53.68573],
    ],
  },
  E08000006: {
    meta: {
      code: 'E08000006',
      name: 'Salford',
      geotype: 'LAD',
    },
    bbox: [
      [-2.48971, 53.41589],
      [-2.24523, 53.54225],
    ],
  },
  E08000007: {
    meta: {
      code: 'E08000007',
      name: 'Stockport',
      geotype: 'LAD',
    },
    bbox: [
      [-2.24683, 53.32731],
      [-1.99233, 53.45494],
    ],
  },
  E08000008: {
    meta: {
      code: 'E08000008',
      name: 'Tameside',
      geotype: 'LAD',
    },
    bbox: [
      [-2.16966, 53.42597],
      [-1.96339, 53.53139],
    ],
  },
  E08000009: {
    meta: {
      code: 'E08000009',
      name: 'Trafford',
      geotype: 'LAD',
    },
    bbox: [
      [-2.47845, 53.35742],
      [-2.25302, 53.48036],
    ],
  },
  E08000010: {
    meta: {
      code: 'E08000010',
      name: 'Wigan',
      geotype: 'LAD',
    },
    bbox: [
      [-2.73052, 53.44606],
      [-2.41454, 53.60829],
    ],
  },
  E08000011: {
    meta: {
      code: 'E08000011',
      name: 'Knowsley',
      geotype: 'LAD',
    },
    bbox: [
      [-2.92262, 53.34666],
      [-2.7434, 53.50383],
    ],
  },
  E08000012: {
    meta: {
      code: 'E08000012',
      name: 'Liverpool',
      geotype: 'LAD',
    },
    bbox: [
      [-3.00875, 53.3268],
      [-2.818, 53.47498],
    ],
  },
  E08000013: {
    meta: {
      code: 'E08000013',
      name: 'St. Helens',
      geotype: 'LAD',
    },
    bbox: [
      [-2.82496, 53.38539],
      [-2.57674, 53.53143],
    ],
  },
  E08000014: {
    meta: {
      code: 'E08000014',
      name: 'Sefton',
      geotype: 'LAD',
    },
    bbox: [
      [-3.10479, 53.43837],
      [-2.88121, 53.69832],
    ],
  },
  E08000015: {
    meta: {
      code: 'E08000015',
      name: 'Wirral',
      geotype: 'LAD',
    },
    bbox: [
      [-3.22902, 53.28931],
      [-2.92878, 53.4429],
    ],
  },
  E08000016: {
    meta: {
      code: 'E08000016',
      name: 'Barnsley',
      geotype: 'LAD',
    },
    bbox: [
      [-1.82259, 53.43832],
      [-1.27573, 53.61274],
    ],
  },
  E08000017: {
    meta: {
      code: 'E08000017',
      name: 'Doncaster',
      geotype: 'LAD',
    },
    bbox: [
      [-1.34873, 53.40588],
      [-0.86534, 53.66106],
    ],
  },
  E08000018: {
    meta: {
      code: 'E08000018',
      name: 'Rotherham',
      geotype: 'LAD',
    },
    bbox: [
      [-1.45679, 53.30165],
      [-1.11514, 53.51533],
    ],
  },
  E08000019: {
    meta: {
      code: 'E08000019',
      name: 'Sheffield',
      geotype: 'LAD',
    },
    bbox: [
      [-1.80147, 53.30453],
      [-1.32467, 53.50312],
    ],
  },
  E08000021: {
    meta: {
      code: 'E08000021',
      name: 'Newcastle upon Tyne',
      geotype: 'LAD',
    },
    bbox: [
      [-1.77569, 54.96001],
      [-1.53084, 55.07939],
    ],
  },
  E08000022: {
    meta: {
      code: 'E08000022',
      name: 'North Tyneside',
      geotype: 'LAD',
    },
    bbox: [
      [-1.63971, 54.98296],
      [-1.40397, 55.07494],
    ],
  },
  E08000023: {
    meta: {
      code: 'E08000023',
      name: 'South Tyneside',
      geotype: 'LAD',
    },
    bbox: [
      [-1.53421, 54.92837],
      [-1.35328, 55.0113],
    ],
  },
  E08000024: {
    meta: {
      code: 'E08000024',
      name: 'Sunderland',
      geotype: 'LAD',
    },
    bbox: [
      [-1.56889, 54.79906],
      [-1.34747, 54.94418],
    ],
  },
  E08000025: {
    meta: {
      code: 'E08000025',
      name: 'Birmingham',
      geotype: 'LAD',
    },
    bbox: [
      [-2.03364, 52.38108],
      [-1.72885, 52.60872],
    ],
  },
  E08000026: {
    meta: {
      code: 'E08000026',
      name: 'Coventry',
      geotype: 'LAD',
    },
    bbox: [
      [-1.61445, 52.36389],
      [-1.42394, 52.4648],
    ],
  },
  E08000027: {
    meta: {
      code: 'E08000027',
      name: 'Dudley',
      geotype: 'LAD',
    },
    bbox: [
      [-2.19175, 52.42605],
      [-2.0115, 52.55821],
    ],
  },
  E08000028: {
    meta: {
      code: 'E08000028',
      name: 'Sandwell',
      geotype: 'LAD',
    },
    bbox: [
      [-2.09707, 52.46074],
      [-1.91816, 52.56909],
    ],
  },
  E08000029: {
    meta: {
      code: 'E08000029',
      name: 'Solihull',
      geotype: 'LAD',
    },
    bbox: [
      [-1.87203, 52.34774],
      [-1.59285, 52.51449],
    ],
  },
  E08000030: {
    meta: {
      code: 'E08000030',
      name: 'Walsall',
      geotype: 'LAD',
    },
    bbox: [
      [-2.07779, 52.54731],
      [-1.87256, 52.66273],
    ],
  },
  E08000031: {
    meta: {
      code: 'E08000031',
      name: 'Wolverhampton',
      geotype: 'LAD',
    },
    bbox: [
      [-2.20688, 52.54394],
      [-2.04802, 52.63791],
    ],
  },
  E08000032: {
    meta: {
      code: 'E08000032',
      name: 'Bradford',
      geotype: 'LAD',
    },
    bbox: [
      [-2.06125, 53.72436],
      [-1.64033, 53.96314],
    ],
  },
  E08000033: {
    meta: {
      code: 'E08000033',
      name: 'Calderdale',
      geotype: 'LAD',
    },
    bbox: [
      [-2.17329, 53.61535],
      [-1.72722, 53.82564],
    ],
  },
  E08000034: {
    meta: {
      code: 'E08000034',
      name: 'Kirklees',
      geotype: 'LAD',
    },
    bbox: [
      [-2.00947, 53.51982],
      [-1.57102, 53.76485],
    ],
  },
  E08000035: {
    meta: {
      code: 'E08000035',
      name: 'Leeds',
      geotype: 'LAD',
    },
    bbox: [
      [-1.80042, 53.69898],
      [-1.29036, 53.94589],
    ],
  },
  E08000036: {
    meta: {
      code: 'E08000036',
      name: 'Wakefield',
      geotype: 'LAD',
    },
    bbox: [
      [-1.62488, 53.57537],
      [-1.19882, 53.74172],
    ],
  },
  E08000037: {
    meta: {
      code: 'E08000037',
      name: 'Gateshead',
      geotype: 'LAD',
    },
    bbox: [
      [-1.85272, 54.87777],
      [-1.51036, 54.98426],
    ],
  },
  E09000001: {
    meta: {
      code: 'E09000001',
      name: 'City of London',
      geotype: 'LAD',
    },
    bbox: [
      [-0.1138, 51.50783],
      [-0.07281, 51.52331],
    ],
  },
  E09000002: {
    meta: {
      code: 'E09000002',
      name: 'Barking and Dagenham',
      geotype: 'LAD',
    },
    bbox: [
      [0.06668, 51.51201],
      [0.19017, 51.59944],
    ],
  },
  E09000003: {
    meta: {
      code: 'E09000003',
      name: 'Barnet',
      geotype: 'LAD',
    },
    bbox: [
      [-0.30557, 51.55519],
      [-0.12909, 51.67017],
    ],
  },
  E09000004: {
    meta: {
      code: 'E09000004',
      name: 'Bexley',
      geotype: 'LAD',
    },
    bbox: [
      [0.07467, 51.40843],
      [0.21767, 51.51322],
    ],
  },
  E09000005: {
    meta: {
      code: 'E09000005',
      name: 'Brent',
      geotype: 'LAD',
    },
    bbox: [
      [-0.33556, 51.52764],
      [-0.19147, 51.60037],
    ],
  },
  E09000006: {
    meta: {
      code: 'E09000006',
      name: 'Bromley',
      geotype: 'LAD',
    },
    bbox: [
      [-0.08108, 51.28935],
      [0.16238, 51.44433],
    ],
  },
  E09000007: {
    meta: {
      code: 'E09000007',
      name: 'Camden',
      geotype: 'LAD',
    },
    bbox: [
      [-0.21349, 51.51268],
      [-0.10529, 51.57296],
    ],
  },
  E09000008: {
    meta: {
      code: 'E09000008',
      name: 'Croydon',
      geotype: 'LAD',
    },
    bbox: [
      [-0.16188, 51.28676],
      [0.00331, 51.42324],
    ],
  },
  E09000009: {
    meta: {
      code: 'E09000009',
      name: 'Ealing',
      geotype: 'LAD',
    },
    bbox: [
      [-0.41955, 51.49048],
      [-0.24513, 51.55966],
    ],
  },
  E09000010: {
    meta: {
      code: 'E09000010',
      name: 'Enfield',
      geotype: 'LAD',
    },
    bbox: [
      [-0.18589, 51.60565],
      [-0.00894, 51.69188],
    ],
  },
  E09000011: {
    meta: {
      code: 'E09000011',
      name: 'Greenwich',
      geotype: 'LAD',
    },
    bbox: [
      [-0.02637, 51.4237],
      [0.12419, 51.51145],
    ],
  },
  E09000012: {
    meta: {
      code: 'E09000012',
      name: 'Hackney',
      geotype: 'LAD',
    },
    bbox: [
      [-0.10448, 51.51985],
      [-0.01655, 51.57779],
    ],
  },
  E09000013: {
    meta: {
      code: 'E09000013',
      name: 'Hammersmith and Fulham',
      geotype: 'LAD',
    },
    bbox: [
      [-0.25506, 51.46484],
      [-0.17936, 51.53274],
    ],
  },
  E09000014: {
    meta: {
      code: 'E09000014',
      name: 'Haringey',
      geotype: 'LAD',
    },
    bbox: [
      [-0.17123, 51.56467],
      [-0.04139, 51.61121],
    ],
  },
  E09000015: {
    meta: {
      code: 'E09000015',
      name: 'Harrow',
      geotype: 'LAD',
    },
    bbox: [
      [-0.404, 51.55308],
      [-0.26711, 51.64054],
    ],
  },
  E09000016: {
    meta: {
      code: 'E09000016',
      name: 'Havering',
      geotype: 'LAD',
    },
    bbox: [
      [0.13818, 51.48771],
      [0.33402, 51.63174],
    ],
  },
  E09000017: {
    meta: {
      code: 'E09000017',
      name: 'Hillingdon',
      geotype: 'LAD',
    },
    bbox: [
      [-0.51028, 51.45329],
      [-0.37615, 51.6317],
    ],
  },
  E09000018: {
    meta: {
      code: 'E09000018',
      name: 'Hounslow',
      geotype: 'LAD',
    },
    bbox: [
      [-0.46148, 51.42063],
      [-0.24442, 51.50285],
    ],
  },
  E09000019: {
    meta: {
      code: 'E09000019',
      name: 'Islington',
      geotype: 'LAD',
    },
    bbox: [
      [-0.1424, 51.51855],
      [-0.07633, 51.57551],
    ],
  },
  E09000020: {
    meta: {
      code: 'E09000020',
      name: 'Kensington and Chelsea',
      geotype: 'LAD',
    },
    bbox: [
      [-0.22873, 51.47739],
      [-0.15002, 51.53032],
    ],
  },
  E09000021: {
    meta: {
      code: 'E09000021',
      name: 'Kingston upon Thames',
      geotype: 'LAD',
    },
    bbox: [
      [-0.33066, 51.32632],
      [-0.23873, 51.43729],
    ],
  },
  E09000022: {
    meta: {
      code: 'E09000022',
      name: 'Lambeth',
      geotype: 'LAD',
    },
    bbox: [
      [-0.15121, 51.41099],
      [-0.07829, 51.50849],
    ],
  },
  E09000023: {
    meta: {
      code: 'E09000023',
      name: 'Lewisham',
      geotype: 'LAD',
    },
    bbox: [
      [-0.07508, 51.41358],
      [0.03905, 51.49309],
    ],
  },
  E09000024: {
    meta: {
      code: 'E09000024',
      name: 'Merton',
      geotype: 'LAD',
    },
    bbox: [
      [-0.25424, 51.38018],
      [-0.12414, 51.44146],
    ],
  },
  E09000025: {
    meta: {
      code: 'E09000025',
      name: 'Newham',
      geotype: 'LAD',
    },
    bbox: [
      [-0.02126, 51.49836],
      [0.0969, 51.56402],
    ],
  },
  E09000026: {
    meta: {
      code: 'E09000026',
      name: 'Redbridge',
      geotype: 'LAD',
    },
    bbox: [
      [0.00869, 51.54356],
      [0.14951, 51.62892],
    ],
  },
  E09000027: {
    meta: {
      code: 'E09000027',
      name: 'Richmond upon Thames',
      geotype: 'LAD',
    },
    bbox: [
      [-0.39291, 51.39144],
      [-0.22292, 51.489],
    ],
  },
  E09000028: {
    meta: {
      code: 'E09000028',
      name: 'Southwark',
      geotype: 'LAD',
    },
    bbox: [
      [-0.11147, 51.4206],
      [-0.03232, 51.50862],
    ],
  },
  E09000029: {
    meta: {
      code: 'E09000029',
      name: 'Sutton',
      geotype: 'LAD',
    },
    bbox: [
      [-0.2454, 51.32149],
      [-0.11684, 51.39341],
    ],
  },
  E09000030: {
    meta: {
      code: 'E09000030',
      name: 'Tower Hamlets',
      geotype: 'LAD',
    },
    bbox: [
      [-0.07947, 51.48614],
      [0.00896, 51.54469],
    ],
  },
  E09000031: {
    meta: {
      code: 'E09000031',
      name: 'Waltham Forest',
      geotype: 'LAD',
    },
    bbox: [
      [-0.06216, 51.54991],
      [0.02574, 51.64653],
    ],
  },
  E09000032: {
    meta: {
      code: 'E09000032',
      name: 'Wandsworth',
      geotype: 'LAD',
    },
    bbox: [
      [-0.25911, 51.41775],
      [-0.12631, 51.48504],
    ],
  },
  E09000033: {
    meta: {
      code: 'E09000033',
      name: 'Westminster',
      geotype: 'LAD',
    },
    bbox: [
      [-0.21602, 51.48481],
      [-0.11106, 51.53981],
    ],
  },
};

export const locations_data = {
  care_provider_location: {
    code: 'testcpl1',
    display_name: 'Mock Care Provider Location',
    address: '123 Mock St, Mocktown, MK1 1MK',
    geo_data: {
      latitude: 54.8798077426683,
      longitude: -1.4036740441143998,
    },
    provider_code: 'testcp2',
    provider_name: 'Mock Care Provider',
    nominated_individual: 'John Doe',
    local_authority_code: 'E08000024',
  },
  district: {
    code: 'E05001171',
    display_name: 'Silksworth',
    geo_data: {
      latitude: 54.8798077426683,
      longitude: -1.4036740441143998,
      polygon: [
        [-1.4247455227942605, 54.86912871879158],
        [-1.4247455227942605, 54.88889158836046],
        [-1.3785352992918785, 54.86912871879158],
        [-1.3785352992918785, 54.88889158836046],
      ],
    },
    local_authority_code: 'E08000024',
  },
  local_authority: {
    code: 'E08000024',
    display_name: 'Sunderland',
    geo_data: {
      latitude: 54.880445953877775,
      longitude: -1.4519587820223236,
      polygon: [
        [-1.5688915330791782, 54.944529934401686],
        [-1.5688915330791782, 54.79905189140416],
        [-1.346135332338452, 54.944529934401686],
        [-1.346135332338452, 54.79905189140416],
      ],
    },
    region_code: 'E12000001',
  },
  region: {
    code: 'E12000001',
    display_name: 'North East',
    geo_data: {
      latitude: 55.02208006843618,
      longitude: -1.9024409814666763,
      polygon: [
        [-2.6897904346299817, 54.45113757928627],
        [-2.6897904346299817, 55.81166415447148],
        [-0.7883089724322202, 54.45113757928627],
        [-0.7883089724322202, 55.81166415447148],
      ],
    },
    country_code: 'E92000001',
  },
  country: {
    code: 'E92000001',
    display_name: 'England',
    geo_data: {
      latitude: 54.000252,
      longitude: -3.724194,
      polygon: [
        [-8.1775098, 49.674],
        [-8.1775098, 61.061],
        [2.0919117, 49.674],
        [2.0919117, 61.061],
      ],
    },
  },
};

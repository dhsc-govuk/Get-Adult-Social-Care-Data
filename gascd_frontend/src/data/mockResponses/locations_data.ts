export const locations_data = {
  care_provider_location: {
    id: 'testcpl1',
    display_name: 'Mock Care Provider Location',
    geo_data: {
      latitude: 54.8798077426683,
      longitude: -1.4036740441143998,
    },
    provider_id: 'testcp2',
    provider_name: 'Mock Care Provider',
    nominated_individual: 'John Doe',
    local_authority_id: 'E08000024',
  },
  district: {
    id: 'E05001171',
    display_name: 'Silksworth',
    geo_data: {
      latitude: 54.8798077426683,
      longitude: -1.4036740441143998,
      bbox: [
        [-1.4247455227942605, 54.86912871879158],
        [-1.4247455227942605, 54.88889158836046],
        [-1.3785352992918785, 54.86912871879158],
        [-1.3785352992918785, 54.88889158836046],
      ]
    },
    local_authority_id: 'E08000024',
  },
  local_authority: {
    id: 'E08000024',
    display_name: 'Sunderland',
    geo_data: {
      latitude: 54.880445953877775,
      longitude: -1.4519587820223236,
      bbox: [
        [-1.5688915330791782, 54.944529934401686],
        [-1.5688915330791782, 54.79905189140416],
        [-1.346135332338452, 54.944529934401686],
        [-1.346135332338452, 54.79905189140416]
      ]
    },
    region_id: 'E12000001'
  },
  region: {
    id: 'E12000001',
    display_name: 'North East',
    geo_data: {
      latitude: 55.02208006843618,
      longitude: -1.9024409814666763,
      bbox: [
        [-2.6897904346299817, 54.45113757928627],
        [-2.6897904346299817, 55.81166415447148],
        [-0.7883089724322202, 54.45113757928627],
        [-0.7883089724322202, 55.81166415447148],
      ]
    },
    country_id: 'E92000001',
  }
}
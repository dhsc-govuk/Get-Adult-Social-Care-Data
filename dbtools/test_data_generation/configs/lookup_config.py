# Define location lookup
LOCATION_RELATIONSHIPS = {
    # Care provider locations belong to care providers
    'care_provider_location_to_care_provider': {
        'testcpl1': 'testcp1',
        'testcpl1a': 'testcp1',
        'testcpl2': 'testcp2',
    },
    
    # Care providers locations belong to LAs
    'care_provider_location_to_la': {
        'testcpl1': 'testla1',
        'testcpl1a': 'testla2',
        'testcpl2': 'testla2',
    },
    
    # LAs belong to regions
    'la_to_regional': {
        'testla1': 'testregion1',
        'testla2': 'testregion1'
    },
    
    # Regions belong to nations
    'regional_to_national': {
        'testregion1': 'testnation1',
        'testregion2': 'testnation1'
    }
}

for i in range(100):
    LOCATION_RELATIONSHIPS['care_provider_location_to_care_provider'][f'testcpl3_{i}'] = 'testcp3'
    LOCATION_RELATIONSHIPS['care_provider_location_to_la'][f'testcpl3_{i}'] = 'testla1'

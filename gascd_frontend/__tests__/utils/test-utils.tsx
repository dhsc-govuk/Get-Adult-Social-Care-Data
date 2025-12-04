// Mock session for page tests
export const mockSession: any = {
  user: {
    id: 'testing-user-1',
    email: 'test@test.com',
    name: 'Test User 1',
    locationType: 'Care provider location',
    locationId: 'testlocation1',
    smartInsights: false,
  },
};

export const mockSessionWithLocation: any = {
  user: {
    id: 'testing-user-1',
    email: 'test@test.com',
    name: 'Test User 1',
    locationType: 'Care provider location',
    locationId: 'testlocation1',
    selectedLocationId: 'testlocation1',
    smartInsights: false,
  },
};

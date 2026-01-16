// Mock session for page tests
export const mockSession: any = {
  user: {
    id: 'testing-user-1',
    email: 'test@test.com',
    registeredEmail: 'test@test.com',
    role: 'member',
    name: 'Test User 1',
    locationType: 'Care provider location',
    locationId: 'testlocation1',
    smartInsights: false,
  },
};

export const mockSessionUnregistered: any = {
  user: {
    ...mockSession.user,
    registeredEmail: '',
  },
};

export const mockSessionWithAnalytics: any = {
  user: {
    ...mockSession.user,
    analyticsId: 'ua_12345678',
  },
};

export const mockSessionWithLocation: any = {
  user: {
    ...mockSession.user,
    selectedLocationId: 'testlocation1',
    selectedLocationDisplayName: 'My test location',
  },
};

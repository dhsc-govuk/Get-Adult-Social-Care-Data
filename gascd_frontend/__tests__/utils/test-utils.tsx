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
    marketingConsent: true,
    termsAccepted: true,
  },
};

export const mockSessionNoConsent: any = {
  user: {
    ...mockSession.user,
    marketingConsent: null,
  },
};

export const mockSessionNoTerms: any = {
  user: {
    ...mockSession.user,
    termsAccepted: null,
  },
};

export const mockSessionCareProvider: any = {
  user: {
    ...mockSession.user,
    locationType: 'Care provider',
  },
};

// At the moment, LA users are always imported with a selected Location
export const mockSessionLAUser: any = {
  user: {
    ...mockSession.user,
    locationType: 'LA',
    locationId: 'testla1',
    selectedLocationId: 'testla1',
  },
};

export const mockSessionInvalidLocationType: any = {
  user: {
    ...mockSession.user,
    locationType: 'Invalid',
  },
};

export const mockSessionUnregistered: any = {
  user: {
    ...mockSession.user,
    registeredEmail: '',
  },
};

export const mockSessionEmailMismatch: any = {
  user: {
    ...mockSession.user,
    registeredEmail: 'foo@ba.com',
  },
};

export const mockSessionEmailMatchCase: any = {
  user: {
    ...mockSession.user,
    registeredEmail: 'TEST@test.com',
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

export const mockSessionWithLocationCareProvider: any = {
  user: {
    ...mockSession.user,
    locationType: 'Care provider',
    selectedLocationId: 'testlocation1',
    selectedLocationDisplayName: 'My test location',
  },
};

export const mockSessionWithMultipleLocationIDs: any = {
  user: {
    ...mockSession.user,
    locationId: 'testlocation1,testlocation2',
  },
};

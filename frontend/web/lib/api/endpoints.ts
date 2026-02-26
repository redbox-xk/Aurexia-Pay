export const endpoints = {
  // Payments
  payments: {
    list: '/api/v1/payments',
    create: '/api/v1/payments',
    get: (id: string) => `/api/v1/payments/${id}`,
    confirm: (id: string) => `/api/v1/payments/${id}/confirm`,
  },
  
  // Merchants
  merchants: {
    get: (id: string) => `/api/v1/merchants/${id}`,
    update: (id: string) => `/api/v1/merchants/${id}`,
    analytics: (id: string) => `/api/v1/merchants/${id}/analytics`,
  },
  
  // Tokens
  tokens: {
    create: '/api/v1/tokens',
    list: '/api/v1/tokens',
    get: (address: string) => `/api/v1/tokens/${address}`,
    deploy: '/api/v1/tokens/deploy',
  },
  
  // Bridge
  bridge: {
    transfer: '/api/v1/bridge/transfer',
    status: (id: string) => `/api/v1/bridge/status/${id}`,
    chains: '/api/v1/bridge/chains',
  },
  
  // Auth
  auth: {
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    verify: '/api/v1/auth/verify',
  },
}

import { importJWK, SignJWT, type JWK } from 'jose';

export const MOCK_KID = 'mock-dev-key-1';

export const MOCK_PUB_JWK: JWK = {
  crv: 'Ed25519',
  x: 'dAJTfWJ-tXA_wwygRSV9L64Rz7aZsYeaQwyJXAHDPc4',
  kty: 'OKP',
  kid: MOCK_KID,
  alg: 'EdDSA',
  use: 'sig',
};

const MOCK_PRIV_JWK: JWK = {
  crv: 'Ed25519',
  d: 'Q1reQYZcWpSF4yntdJK2rjo3ekiz52L4ZwxLjl1VLRw',
  x: 'dAJTfWJ-tXA_wwygRSV9L64Rz7aZsYeaQwyJXAHDPc4',
  kty: 'OKP',
  kid: MOCK_KID,
  alg: 'EdDSA',
};

export interface MockUserRecord {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: 'admin' | 'editor' | 'user';
  mustChangePassword: boolean;
  password?: string;
  organization?: string | null;
  professionalArea?: string | null;
  createdAt: string;
}

// Armazenamento em memória durante a execução do processo
const globalStore = globalThis as unknown as {
  __mockUsers?: Map<string, MockUserRecord>;
  __mockSessions?: Map<string, { userId: string; createdAt: Date }>;
};

if (!globalStore.__mockUsers) {
  globalStore.__mockUsers = new Map<string, MockUserRecord>();
  // Cria um usuário admin padrão para testes
  const defaultAdmin: MockUserRecord = {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin@sst.local',
    username: 'admin',
    displayName: 'Administrador SST',
    role: 'admin',
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
  };
  globalStore.__mockUsers.set(defaultAdmin.email.toLowerCase(), defaultAdmin);
  globalStore.__mockUsers.set(defaultAdmin.username.toLowerCase(), defaultAdmin);
}

if (!globalStore.__mockSessions) {
  globalStore.__mockSessions = new Map<string, { userId: string; createdAt: Date }>();
}

export const mockUsers = globalStore.__mockUsers;
export const mockSessions = globalStore.__mockSessions;

export async function createMockAccessToken(user: MockUserRecord, sessionId: string): Promise<string> {
  const privateKey = await importJWK(MOCK_PRIV_JWK, 'EdDSA');
  const issuer = process.env.AUTH_ISSUER || 'http://localhost:3000';
  const audience = process.env.AUTH_AUDIENCE || 'knowledge-api';

  return new SignJWT({
    role: user.role,
    sid: sessionId,
  })
    .setProtectedHeader({ alg: 'EdDSA', kid: MOCK_KID })
    .setSubject(user.id)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setJti(crypto.randomUUID())
    .setExpirationTime('1h')
    .sign(privateKey);
}

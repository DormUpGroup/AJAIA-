export type MockUser = {
  id: string;
  name: string;
  email: string;
};

/** Seeded users — must match sql/schema.sql */
export const MOCK_USERS: MockUser[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Michael",
    email: "bilmike1543@gmail.com",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Alex",
    email: "alex@example.com",
  },
];

export const DEFAULT_MOCK_USER_ID = MOCK_USERS[0].id;

export const MOCK_USER_STORAGE_KEY = "ajaia-docs-current-user-id";

export function getMockUserById(id: string): MockUser | undefined {
  return MOCK_USERS.find((user) => user.id === id);
}

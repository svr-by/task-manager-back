import { TUserSignupInput } from '@/types/userType';

export const userMock: TUserSignupInput = {
  name: 'New User',
  email: 'user@mail.com',
  password: '12345678910',
};

export const ownerUserMock: TUserSignupInput = {
  name: 'Owner User',
  email: 'owner@mail.com',
  password: '12345678910',
};

export const memberUserMock: TUserSignupInput = {
  name: 'Member User',
  email: 'member@mail.com',
  password: '12345678910',
};

export const anotherUserMock: TUserSignupInput = {
  name: 'Another User',
  email: 'another@mail.com',
  password: '12345678910',
};

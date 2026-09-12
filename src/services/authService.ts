import { v4 as uuidv4 } from 'uuid';
import type { OtpChallenge, ServiceResponse, User } from '../types';
import { fail, mockTable, networkDelay, ok } from './serviceUtils';
import { httpClient } from './httpClient';
import { useAuthStore } from '../store/authStore';

export interface SignInCredentials {
  username: string;
  password: string;
}

export interface SignUpCredentials {
  username: string;
  password: string;
  displayName?: string;
  phone?: string;
}

export interface AuthSuccessPayload {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface AuthService {
  signIn(creds: SignInCredentials): Promise<ServiceResponse<AuthSuccessPayload>>;
  signUp(creds: SignUpCredentials): Promise<ServiceResponse<AuthSuccessPayload>>;
  requestOtpLogin(phone: string): Promise<ServiceResponse<OtpChallenge>>;
  verifyOtpLogin(requestId: string, code: string): Promise<ServiceResponse<AuthSuccessPayload>>;
  requestForgotPassword(phoneOrUsername: string): Promise<ServiceResponse<OtpChallenge>>;
  resetPassword(requestId: string, code: string, newPassword: string): Promise<ServiceResponse<AuthSuccessPayload>>;
  /** Send OTP to verify the currently-logged-in user's phone number (profile flow) */
  requestPhoneVerify(phone: string): Promise<ServiceResponse<OtpChallenge>>;
  /** Confirm the OTP code — returns updated User with phoneVerified:true on success */
  verifyPhone(requestId: string, code: string): Promise<ServiceResponse<User>>;
  me(): Promise<ServiceResponse<User>>;
  updateProfile(updates: Partial<User>): Promise<ServiceResponse<User>>;
  logout(): Promise<ServiceResponse<{ success: true }>>;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const AUTH_RATE_LIMIT_KEY = 'auth_otp_rate_limit';
const USERS_TABLE_KEY = 'dakpion_users';

class MockAuthService implements AuthService {
  private otpStore = new Map<string, { phone: string; code: string; expiresAt: number }>();

  private getUsers(): User[] {
    return mockTable.read<User[]>(USERS_TABLE_KEY, [
      {
        id: '1',
        username: 'admin',
        phone: '01XX-XXX-000',
        nickname: 'Super Admin',
        displayName: 'Super Admin',
        role: 'ADMIN',
        appUserType: 'ADMIN',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'usr_sample_1',
        username: 'writer',
        phone: '01XX-XXX-000',
        nickname: 'Nostalgic Writer',
        displayName: 'Nostalgic Writer',
        role: 'USER',
        appUserType: 'USER',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
    ]);
  }

  private saveUsers(users: User[]) {
    mockTable.write(USERS_TABLE_KEY, users);
  }

  async signIn(creds: SignInCredentials): Promise<ServiceResponse<AuthSuccessPayload>> {
    await networkDelay(400);
    const users = this.getUsers();
    const user = users.find((u) => u.username === creds.username);
    if (!user) {
      return fail('AUTH_FAILED', 'Invalid username or password');
    }
    const token = `mock_jwt_${btoa(JSON.stringify({ sub: user.id, username: user.username, role: user.role }))}`;
    const refreshToken = `mock_refresh_${uuidv4()}`;
    return ok({ token, refreshToken, user });
  }

  async signUp(creds: SignUpCredentials): Promise<ServiceResponse<AuthSuccessPayload>> {
    await networkDelay(500);
    const users = this.getUsers();
    if (users.some((u) => u.username === creds.username)) {
      return fail('USER_EXISTS', 'Username already exists');
    }
    const maskedPhone = creds.phone
      ? creds.phone.length === 11
        ? `${creds.phone.substring(0, 2)}XX-XXX-${creds.phone.substring(8)}`
        : creds.phone
      : '01XX-XXX-000';

    const newUser: User = {
      id: `usr_${uuidv4().slice(0, 8)}`,
      username: creds.username,
      phone: maskedPhone,
      nickname: creds.displayName || creds.username,
      displayName: creds.displayName || creds.username,
      role: 'USER',
      appUserType: 'USER',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.saveUsers(users);
    const token = `mock_jwt_${btoa(JSON.stringify({ sub: newUser.id, username: newUser.username }))}`;
    const refreshToken = `mock_refresh_${uuidv4()}`;
    return ok({ token, refreshToken, user: newUser });
  }

  async requestOtpLogin(phone: string): Promise<ServiceResponse<OtpChallenge>> {
    await networkDelay(500);

    const lastRequestAt = mockTable.read<Record<string, number>>(AUTH_RATE_LIMIT_KEY, {});
    const now = Date.now();
    if (lastRequestAt[phone] && now - lastRequestAt[phone] < RATE_LIMIT_WINDOW_MS) {
      const remainingSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastRequestAt[phone])) / 1000);
      return ok({
        requestId: uuidv4(),
        phone,
        expiresInSeconds: 300,
        canResendInSeconds: remainingSec,
        devHintCode: '1234',
      });
    }
    lastRequestAt[phone] = now;
    mockTable.write(AUTH_RATE_LIMIT_KEY, lastRequestAt);

    const requestId = uuidv4();
    const code = String(Math.floor(1000 + Math.random() * 9000));
    this.otpStore.set(requestId, { phone, code, expiresAt: now + 5 * 60_000 });

    const maskedPhone =
      phone.length === 11 ? `${phone.substring(0, 2)}XX-XXX-${phone.substring(8)}` : phone;

    return ok({
      requestId,
      phone,
      maskedPhone,
      expiresInSeconds: 300,
      canResendInSeconds: 60,
      devHintCode: code,
    });
  }

  async verifyOtpLogin(
    requestId: string,
    code: string,
  ): Promise<ServiceResponse<AuthSuccessPayload>> {
    await networkDelay(600);
    const challenge = this.otpStore.get(requestId);
    if (!challenge) return fail('OTP_NOT_FOUND', 'This OTP request has expired. Please retry.');
    if (Date.now() > challenge.expiresAt) return fail('OTP_EXPIRED', 'This code has expired.');
    if (challenge.code !== code) return fail('OTP_INVALID', 'That code doesn’t match.');

    this.otpStore.delete(requestId);

    const maskedPhone =
      challenge.phone.length === 11
        ? `${challenge.phone.substring(0, 2)}XX-XXX-${challenge.phone.substring(8)}`
        : challenge.phone;

    const users = this.getUsers();
    let user = users.find((u) => u.phone === maskedPhone || u.phone === challenge.phone);
    if (!user) {
      user = {
        id: `usr_${uuidv4().slice(0, 8)}`,
        phone: maskedPhone,
        nickname: `Traveler ${challenge.phone.slice(-4)}`,
        displayName: 'DakPion User',
        role: 'USER',
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      this.saveUsers(users);
    }

    const token = `mock_jwt_${btoa(JSON.stringify({ sub: user.id, phone: user.phone }))}`;
    const refreshToken = `mock_refresh_${uuidv4()}`;
    return ok({ token, refreshToken, user });
  }

  async requestForgotPassword(phoneOrUsername: string): Promise<ServiceResponse<OtpChallenge>> {
    await networkDelay(500);
    const users = this.getUsers();
    const user = users.find((u) => u.username === phoneOrUsername || u.phone === phoneOrUsername);
    const phone = user ? user.phone : '01712345678';
    return this.requestOtpLogin(phone);
  }

  async resetPassword(
    requestId: string,
    code: string,
    _newPassword: string,
  ): Promise<ServiceResponse<AuthSuccessPayload>> {
    await networkDelay(600);
    return this.verifyOtpLogin(requestId, code);
  }

  async requestPhoneVerify(phone: string): Promise<ServiceResponse<OtpChallenge>> {
    return this.requestOtpLogin(phone);
  }

  async verifyPhone(requestId: string, code: string): Promise<ServiceResponse<User>> {
    const res = await this.verifyOtpLogin(requestId, code);
    if (!res.success) return res;
    const user = { ...res.data.user, phoneVerified: true };
    return ok(user);
  }

  async me(): Promise<ServiceResponse<User>> {
    await networkDelay(200);
    const users = this.getUsers();
    const user = users[0] ?? {
      id: 'usr_guest',
      phone: '01XX-XXX-000',
      nickname: 'Traveler',
      role: 'USER',
      createdAt: new Date().toISOString(),
    };
    return ok(user);
  }

  async updateProfile(updates: Partial<User>): Promise<ServiceResponse<User>> {
    await networkDelay(200);
    const users = this.getUsers();
    if (users.length > 0) {
      users[0] = { ...users[0], ...updates };
      this.saveUsers(users);
      return ok(users[0]);
    }
    return ok(updates as User);
  }

  async logout(): Promise<ServiceResponse<{ success: true }>> {
    await networkDelay(100);
    return ok({ success: true });
  }
}

class HttpAuthService implements AuthService {
  async signIn(creds: SignInCredentials): Promise<ServiceResponse<AuthSuccessPayload>> {
    const res = await httpClient.post<{
      accessToken?: string;
      token?: string;
      refreshToken?: string;
      userTypeId: number;
      appUserType: string;
    }>('/auth/signin', creds);

    if (!res.success) {
      return res;
    }

    const token = res.data.accessToken || res.data.token || '';
    const refreshToken = res.data.refreshToken;

    const profileRes = await httpClient.get<User>('/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user: User = profileRes.success
      ? profileRes.data
      : {
          id: '1',
          username: creds.username,
          phone: '',
          nickname: creds.username,
          role: (res.data.appUserType as User['role']) || 'USER',
          appUserType: res.data.appUserType,
        };

    return ok({ token, refreshToken, user });
  }

  async signUp(creds: SignUpCredentials): Promise<ServiceResponse<AuthSuccessPayload>> {
    const res = await httpClient.post<{
      accessToken?: string;
      token?: string;
      refreshToken?: string;
      userTypeId: number;
      appUserType: string;
    }>('/auth/signup', creds);

    if (!res.success) {
      return res;
    }

    const token = res.data.accessToken || res.data.token || '';
    const refreshToken = res.data.refreshToken;

    const profileRes = await httpClient.get<User>('/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user: User = profileRes.success
      ? profileRes.data
      : {
          id: 'new_user',
          username: creds.username,
          phone: creds.phone || '',
          nickname: creds.displayName || creds.username,
          role: (res.data.appUserType as User['role']) || 'USER',
          appUserType: res.data.appUserType,
        };

    return ok({ token, refreshToken, user });
  }

  async requestOtpLogin(phone: string): Promise<ServiceResponse<OtpChallenge>> {
    const res = await httpClient.post<OtpChallenge>('/auth/otp/request', { phone });
    if (res.success) return res;
    return httpClient.post<OtpChallenge>('/otp/request', { phone });
  }

  async verifyOtpLogin(
    requestId: string,
    code: string,
  ): Promise<ServiceResponse<AuthSuccessPayload>> {
    interface AuthSessionDto {
      accessToken: string;
      refreshToken: string;
      userId: number | string;
      username?: string;
      displayName?: string;
      maskedPhone?: string;
      role?: string;
    }

    const verifyRes = await httpClient.post<AuthSessionDto>(
      '/auth/otp/verify',
      { requestId, code },
    );

    if (verifyRes.success && verifyRes.data && verifyRes.data.accessToken) {
      const data = verifyRes.data;
      const user: User = {
        id: String(data.userId),
        username: data.username,
        displayName: data.displayName || 'DakPion User',
        nickname: data.displayName || 'DakPion User',
        phone: data.maskedPhone || '',
        role: (data.role as User['role']) || 'USER',
      };
      return ok({
        token: data.accessToken,
        refreshToken: data.refreshToken,
        user,
      });
    }

    // Fallback if legacy /otp/verify response
    const legacyRes = await httpClient.post<{ verified: boolean; verificationToken: string }>(
      '/otp/verify',
      { requestId, code },
    );
    if (!legacyRes.success) {
      return legacyRes;
    }

    const token = `phone_auth_${legacyRes.data.verificationToken}`;
    const user: User = {
      id: legacyRes.data.verificationToken.slice(0, 8),
      phone: '',
      nickname: 'Phone User',
      role: 'USER',
    };
    return ok({ token, user });
  }

  async requestForgotPassword(phoneOrUsername: string): Promise<ServiceResponse<OtpChallenge>> {
    return httpClient.post<OtpChallenge>('/auth/forgot-password/request', { phoneOrUsername });
  }

  async resetPassword(
    requestId: string,
    code: string,
    newPassword: string,
  ): Promise<ServiceResponse<AuthSuccessPayload>> {
    interface AuthSessionDto {
      accessToken: string;
      refreshToken: string;
      userId: number | string;
      username?: string;
      displayName?: string;
      maskedPhone?: string;
      role?: string;
    }

    const res = await httpClient.post<AuthSessionDto>(
      '/auth/forgot-password/verify-and-reset',
      { requestId, code, newPassword },
    );

    if (!res.success) {
      return res;
    }

    const data = res.data;
    const user: User = {
      id: String(data.userId),
      username: data.username,
      displayName: data.displayName || 'DakPion User',
      nickname: data.displayName || 'DakPion User',
      phone: data.maskedPhone || '',
      role: (data.role as User['role']) || 'USER',
    };

    return ok({
      token: data.accessToken,
      refreshToken: data.refreshToken,
      user,
    });
  }

  async requestPhoneVerify(phone: string): Promise<ServiceResponse<OtpChallenge>> {
    const res = await httpClient.post<OtpChallenge>('/otp/request', { phone });
    if (res.success) return res;
    return httpClient.post<OtpChallenge>('/auth/otp/request', { phone });
  }

  async verifyPhone(requestId: string, code: string): Promise<ServiceResponse<User>> {
    const res = await httpClient.post<User>('/me/verify-phone', { requestId, code });
    if (res.success && res.data) {
      useAuthStore.getState().updateUser(res.data);
    }
    return res;
  }

  async me(): Promise<ServiceResponse<User>> {
    return httpClient.get<User>('/me');
  }

  async updateProfile(updates: Partial<User>): Promise<ServiceResponse<User>> {
    return httpClient.put<User>('/me', updates);
  }

  async logout(): Promise<ServiceResponse<{ success: true }>> {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try {
        await httpClient.post('/auth/logout', { refreshToken }, { skipAuth: true });
      } catch {
        // Safe to ignore logout failure on network error
      }
    }
    useAuthStore.getState().logout();
    return ok({ success: true });
  }
}

const useMock = import.meta.env.VITE_USE_MOCK_SERVICES === 'true';

export const authService: AuthService = useMock ? new MockAuthService() : new HttpAuthService();

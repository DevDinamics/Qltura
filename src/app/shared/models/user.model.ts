export type CompanyType = 'Qualtop' | 'SYE';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  company: CompanyType;
  avatar?: string;
  token?: string; // Reservado para JWT / Bearer Token del backend
}
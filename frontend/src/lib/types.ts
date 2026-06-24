export interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string | null;
  hire_date: string | null;
  profile_image_url: string | null;
}

export interface Client {
  customer_id: number;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  sector: string | null;
}

export interface Mission {
  mission_id: number;
  customer_id: number;
  mission_name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export interface ReferenceListItem {
  reference_id: number;
  role_description: string | null;
  employee_id: number | null;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string | null;
  mission_id: number;
  mission_name: string;
  status: string;
  company_name: string;
  skill_name: string;
}

export interface EmployeeReference {
  reference_id: number;
  role_description: string | null;
  skill_id: number;
  skill_name: string;
  mission_id: number;
  mission_name: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

export interface ReferenceRow {
  reference_id: number;
  role_description: string | null;
  employee_id: number | null;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string | null;
  skill_id: number;
  skill_name: string;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  done: boolean;
  owner_sub: string;
  owner_name: string | null;
  created_at: string;
}

export interface Me {
  sub: string;
  username: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  roles: string[];
}

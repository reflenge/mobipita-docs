import Dexie, { type Table } from 'dexie';

export interface Company {
  id?: number;
  name: string;
  slug: string;
}

export interface Shop {
  id?: number;
  companyId: number;
  name: string;
  address: string;
}

export interface Course {
  id?: number;
  shopId: number;
  name: string;
  price: number;
  duration: number;
}

export interface Reservation {
  id?: number;
  shopId: number;
  courseId: number;
  customerName: string;
  date: string;
  status: 'confirmed' | 'cancelled';
}

export class MySubClassedDexie extends Dexie {
  companies!: Table<Company>;
  shops!: Table<Shop>;
  courses!: Table<Course>;
  reservations!: Table<Reservation>;

  constructor() {
    super('B2B2C_Reservation_DB');
    this.version(1).stores({
      companies: '++id, name, slug',
      shops: '++id, companyId, name, address',
      courses: '++id, shopId, name, price, duration',
      reservations: '++id, shopId, courseId, customerName, date, status'
    });
  }
}

export const db = new MySubClassedDexie();

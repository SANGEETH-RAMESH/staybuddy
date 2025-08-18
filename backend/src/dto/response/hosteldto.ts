import { IHostel } from '../../model/hostelModel';
import { IFacilities } from '../../dtos/FacilitiyResponse';

export class HostelDto {
  public readonly id: string;
  public readonly hostelname: string;
  public readonly location: string;
  public readonly facilities: IFacilities;
  public readonly totalRooms: number;
  public readonly isFull: boolean;
  public readonly photos?: string[];
  public readonly phone?: number;
  public readonly category?: string;

  constructor(hostel: Partial<IHostel> & { isFull: boolean }) {
    if (!hostel._id) throw new Error('Hostel _id is missing');

    this.id = hostel._id.toString();
    this.hostelname = hostel.hostelname || '';
    this.location = hostel.location || '';
    this.facilities = hostel.facilities || { wifi: false, laundry: false, food: false };
    this.totalRooms = hostel.totalRooms || 0;
    this.isFull = hostel.isFull ?? false;
    this.photos = hostel.photos;
    this.phone = hostel.phone;
    this.category = hostel.category;
  }

  public static from(hostel: Partial<IHostel> & { isFull: boolean }): HostelDto {
    return new HostelDto(hostel);
  }

  public static fromList(hostels: (Partial<IHostel> & { isFull: boolean })[]): HostelDto[] {
    return hostels.map(h => new HostelDto(h));
  }
}

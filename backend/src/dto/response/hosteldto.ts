import { IHostel } from '../../model/hostelModel';
import { IFacilities } from '../../dtos/FacilitiyResponse';
import mongoose from 'mongoose';

export class HostelDto {
  public readonly id: string;
  public readonly hostelname: string;
  public readonly location: string;
  public readonly latitude: number;
  public readonly longitude: number;
  public readonly nearbyaccess: string;
  public readonly beds: number;
  public readonly policies: string;
  public readonly category: string;
  public readonly advanceamount: number;
  public readonly photos?: string[];
  public readonly facilities: IFacilities;
  public readonly bedShareRoom: number;
  public readonly foodRate?: number;
  public readonly phone: number;
  public readonly host_id: string; 
  public readonly isActive: boolean;
  public readonly inactiveReason?: string;
  public readonly cancellationPolicy: string;
  public readonly totalRooms: number;
  public readonly bookingType: string;
  public readonly isFull: boolean;

  constructor(hostel: Partial<IHostel> & { isFull: boolean }) {
    if (!hostel._id) throw new Error('Hostel _id is missing');

    this.id = hostel._id.toString();
    this.hostelname = hostel.hostelname || '';
    this.location = hostel.location || '';
    this.latitude = hostel.latitude || 0;
    this.longitude = hostel.longitude || 0;
    this.nearbyaccess = hostel.nearbyaccess || '';
    this.beds = hostel.beds || 0;
    this.policies = hostel.policies || '';
    this.category = hostel.category || '';
    this.advanceamount = hostel.advanceamount || 0;
    this.photos = hostel.photos;
    this.facilities = hostel.facilities || { wifi: false, laundry: false, food: false };
    this.bedShareRoom = hostel.bedShareRoom || 0;
    this.foodRate = hostel.foodRate;
    this.phone = hostel.phone || 0;
    this.host_id = hostel.host_id?.toString() || '';
    this.isActive = hostel.isActive ?? false;
    this.inactiveReason = hostel.inactiveReason;
    this.cancellationPolicy = hostel.cancellationPolicy || '';
    this.totalRooms = hostel.totalRooms || 0;
    this.bookingType = hostel.bookingType || '';
    this.isFull = hostel.isFull ?? false;
  }

  public static from(hostel: Partial<IHostel> & { isFull: boolean }): HostelDto {
    return new HostelDto(hostel);
  }

  public static fromList(hostels: (Partial<IHostel> & { isFull: boolean })[]): HostelDto[] {
    return hostels.map(h => new HostelDto(h));
  }
}

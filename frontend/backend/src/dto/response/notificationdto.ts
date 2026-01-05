import { INotification } from '../../model/notificationModel';

export class NotificationDto {
  public readonly id: string;
  public readonly receiver?: string | null;
  public readonly receiverModel?: 'User' | 'Host' | null;
  public readonly message: string;
  public readonly type: string;
  public readonly title: string;
  public readonly isRead: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(notification: Partial<INotification>) {
    if (!notification._id) throw new Error('Notification _id is missing');

    this.id = notification._id.toString();
    this.receiver = notification.receiver ? notification.receiver.toString() : null;
    this.receiverModel = notification.receiverModel ?? null;
    this.message = notification.message || '';
    this.type = notification.type || '';
    this.title = notification.title || '';
    this.isRead = notification.isRead ?? false;
    this.createdAt = (notification as any).createdAt || new Date();
    this.updatedAt = (notification as any).updatedAt || new Date();
  }

  public static from(notification: Partial<INotification>): NotificationDto {
    return new NotificationDto(notification);
  }

  public static fromList(notifications: Partial<INotification>[]): NotificationDto[] {
    return notifications.map(n => new NotificationDto(n));
  }
}

import { EventId } from '../modules/logger/event-id.type';

export class INFORMATION {
  static readonly ENVIRONMENT_INITIALIZATION: EventId = {
    id: 10000,
    name: 'Info Environment Initialization',
  };
  static readonly MAIN_INITIALIZATION: EventId = {
    id: 10001,
    name: 'Info Microservice Initialization',
  };
  static readonly USER_SERVICES: EventId = {
    id: 10002,
    name: 'Info UserServices',
  };
  static readonly OTP_SERVICES: EventId = {
    id: 10003,
    name: 'Info OtpServices',
  };
}
export class ERROR {
  static readonly UNEXPECTED: EventId = {
    id: 997,
    name: 'Unexpected Error',
  };
  static readonly ENVIRONMENT_INITIALIZATION: EventId = {
    id: 998,
    name: 'Critical Error Environment Initialization',
  };
  static readonly LOGGER_INITIALIZATION: EventId = {
    id: 999,
    name: 'Critical Error Initialization Logger Factory',
  };
  static readonly USER_SERVICES: EventId = {
    id: 20001,
    name: 'Error UserService',
  };
  static readonly OTP_SERVICES: EventId = {
    id: 20001,
    name: 'Error OtpServices',
  };
}

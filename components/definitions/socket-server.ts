// Definition of response codes the client can expect from the server
export enum GeolocationServerResponseStatusCode {
  SUCCESS = 1,
  UNEXPECTED_ERROR = 2,
  // If there was an error that the server intentionally threw due to a bad request
  REJECTED = 3,
}

// Returned from the server when an unexpected error occurs
type LocationSyncErrorResponse = {
  status: GeolocationServerResponseStatusCode.UNEXPECTED_ERROR;
  message: string;
  timestamp: number;
};

type LocationSyncRejectedResponse = {
  status: GeolocationServerResponseStatusCode.REJECTED;
  message: string;
  // Provide the client with a reason why the request was rejected (when applicable)
  reason?: string;
  timestamp: number;
};

type LocationSyncSuccessResponse = {
  status: GeolocationServerResponseStatusCode.SUCCESS;
  message: string;
  timestamp: number;
  // A hash of the location data that was sent to the server (from the client)
  locationHash: string;
};

export type GeolocationServerLocationSyncResponse =
  | LocationSyncErrorResponse
  | LocationSyncRejectedResponse
  | LocationSyncSuccessResponse;

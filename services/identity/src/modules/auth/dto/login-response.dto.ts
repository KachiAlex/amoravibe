export interface LoginResponseDto {
  user: {
    id: string;
    displayName: string;
    isVerified: boolean;
  };
  nextRoute: string;
}

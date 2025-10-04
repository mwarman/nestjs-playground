import { SignInResultDto } from './sign-in-result.dto';

describe('SignInResultDto', () => {
  it('should create an instance with accessToken', () => {
    // Arrange
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    // Act
    const dto = new SignInResultDto();
    dto.accessToken = token;

    // Assert
    expect(dto.accessToken).toBe(token);
  });

  it('should allow accessToken to be updated', () => {
    // Arrange
    const dto = new SignInResultDto();
    const token1 = 'token1';
    const token2 = 'token2';

    // Act
    dto.accessToken = token1;
    dto.accessToken = token2;

    // Assert
    expect(dto.accessToken).toBe(token2);
  });
});

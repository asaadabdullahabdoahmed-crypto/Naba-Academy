import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('passes validation with valid email and non-empty password', async () => {
    const dto = new LoginDto();
    dto.email = 'student@naba.edu.sa';
    dto.password = 'ComplexPassword123!';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('fails validation when email is invalid', async () => {
    const dto = new LoginDto();
    dto.email = 'not-an-email';
    dto.password = 'ComplexPassword123!';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('fails validation when password is empty', async () => {
    const dto = new LoginDto();
    dto.email = 'student@naba.edu.sa';
    dto.password = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('does not mutate or trim whitespace in password', () => {
    const dto = new LoginDto();
    dto.email = 'student@naba.edu.sa';
    dto.password = '  leadingAndTrailingSpaces!  ';

    expect(dto.password).toBe('  leadingAndTrailingSpaces!  ');
  });
});

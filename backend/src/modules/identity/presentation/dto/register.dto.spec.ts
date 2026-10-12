import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('passes validation with valid required fields and optional phone', async () => {
    const plain = {
      email: 'applicant@naba.edu.sa',
      password: 'StrongPassword123!',
      nationalId: '1092837465',
      fullNameAr: 'عمر بن عبد العزيز الشمري',
      fullNameEn: 'Omar Abdulaziz Al-Shammari',
      phone: '0501234567',
    };

    const dto = plainToInstance(RegisterDto, plain);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('passes validation without optional phone', async () => {
    const plain = {
      email: 'applicant@naba.edu.sa',
      password: 'StrongPassword123!',
      nationalId: '1092837465',
      fullNameAr: 'عمر بن عبد العزيز الشمري',
      fullNameEn: 'Omar Abdulaziz Al-Shammari',
    };

    const dto = plainToInstance(RegisterDto, plain);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('fails validation when email is invalid', async () => {
    const plain = {
      email: 'not-an-email',
      password: 'StrongPassword123!',
      nationalId: '1092837465',
      fullNameAr: 'عمر الشمري',
      fullNameEn: 'Omar Al-Shammari',
    };

    const dto = plainToInstance(RegisterDto, plain);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('fails validation when nationalId is missing or empty', async () => {
    const plain = {
      email: 'applicant@naba.edu.sa',
      password: 'StrongPassword123!',
      nationalId: '',
      fullNameAr: 'عمر الشمري',
      fullNameEn: 'Omar Al-Shammari',
    };

    const dto = plainToInstance(RegisterDto, plain);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'nationalId')).toBe(true);
  });

  it('fails validation when nationalId is shorter than 10 characters', async () => {
    const plain = {
      email: 'applicant@naba.edu.sa',
      password: 'StrongPassword123!',
      nationalId: '123456789', // 9 characters
      fullNameAr: 'عمر الشمري',
      fullNameEn: 'Omar Al-Shammari',
    };

    const dto = plainToInstance(RegisterDto, plain);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'nationalId')).toBe(true);
  });

  it('fails validation when fullNameAr is missing or empty', async () => {
    const plain = {
      email: 'applicant@naba.edu.sa',
      password: 'StrongPassword123!',
      nationalId: '1092837465',
      fullNameAr: '',
      fullNameEn: 'Omar Al-Shammari',
    };

    const dto = plainToInstance(RegisterDto, plain);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'fullNameAr')).toBe(true);
  });

  it('fails validation when fullNameEn is missing or empty', async () => {
    const plain = {
      email: 'applicant@naba.edu.sa',
      password: 'StrongPassword123!',
      nationalId: '1092837465',
      fullNameAr: 'عمر الشمري',
      fullNameEn: '',
    };

    const dto = plainToInstance(RegisterDto, plain);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'fullNameEn')).toBe(true);
  });

  it('fails validation when password is empty', async () => {
    const plain = {
      email: 'applicant@naba.edu.sa',
      password: '',
      nationalId: '1092837465',
      fullNameAr: 'عمر الشمري',
      fullNameEn: 'Omar Al-Shammari',
    };

    const dto = plainToInstance(RegisterDto, plain);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('trims whitespace on string fields via Transform', () => {
    const plain = {
      email: 'applicant@naba.edu.sa',
      password: 'StrongPassword123!',
      nationalId: '  1092837465  ',
      fullNameAr: '  عمر الشمري  ',
      fullNameEn: '  Omar Al-Shammari  ',
      phone: '  0501234567  ',
    };

    const dto = plainToInstance(RegisterDto, plain);
    expect(dto.nationalId).toBe('1092837465');
    expect(dto.fullNameAr).toBe('عمر الشمري');
    expect(dto.fullNameEn).toBe('Omar Al-Shammari');
    expect(dto.phone).toBe('0501234567');
  });
});

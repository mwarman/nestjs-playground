import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY, Public } from './public.decorator';

describe('Public', () => {
  let reflector: Reflector;

  beforeEach(() => {
    // Arrange
    reflector = new Reflector();
  });

  it('should set metadata with IS_PUBLIC_KEY and value true on a class', () => {
    // Arrange
    @Public()
    class TestClass {}

    // Act
    const metadata = reflector.get<boolean>(IS_PUBLIC_KEY, TestClass);

    // Assert
    expect(metadata).toBe(true);
  });

  it('should not set metadata on classes without decorator', () => {
    // Arrange
    class TestClass {}

    // Act
    const metadata = reflector.get<boolean>(IS_PUBLIC_KEY, TestClass);

    // Assert
    expect(metadata).toBeUndefined();
  });

  it('should set metadata on multiple classes independently', () => {
    // Arrange
    @Public()
    class PublicClass {}

    class PrivateClass {}

    @Public()
    class AnotherPublicClass {}

    // Act
    const publicMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, PublicClass);
    const privateMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, PrivateClass);
    const anotherPublicMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, AnotherPublicClass);

    // Assert
    expect(publicMetadata).toBe(true);
    expect(privateMetadata).toBeUndefined();
    expect(anotherPublicMetadata).toBe(true);
  });

  it('should use the correct metadata key', () => {
    // Arrange & Act & Assert
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });

  it('should be a function that returns a decorator', () => {
    // Arrange & Act
    const decorator = Public();

    // Assert
    expect(typeof decorator).toBe('function');
  });

  it('should set metadata on method descriptors', () => {
    // Arrange
    class TestClass {
      @Public()
      publicMethod(): string {
        return 'public';
      }

      protectedMethod(): string {
        return 'protected';
      }
    }

    // Act
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const publicMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, TestClass.prototype.publicMethod);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const protectedMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, TestClass.prototype.protectedMethod);

    // Assert
    expect(publicMetadata).toBe(true);
    expect(protectedMetadata).toBeUndefined();
  });

  it('should work independently on classes and methods', () => {
    // Arrange
    class TestClass {
      @Public()
      publicMethod(): string {
        return 'public method in non-public class';
      }

      protectedMethod(): string {
        return 'protected method';
      }
    }

    // Act
    const classMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, TestClass);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const publicMethodMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, TestClass.prototype.publicMethod);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const protectedMethodMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, TestClass.prototype.protectedMethod);

    // Assert
    expect(classMetadata).toBeUndefined();
    expect(publicMethodMetadata).toBe(true);
    expect(protectedMethodMetadata).toBeUndefined();
  });

  it('should handle controller with both public class and method decorators', () => {
    // Arrange
    @Public()
    class PublicController {
      @Public()
      explicitlyPublicMethod(): string {
        return 'explicitly public';
      }

      implicitlyPublicMethod(): string {
        return 'implicitly public via class decorator';
      }
    }

    // Act
    const classMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, PublicController);

    const explicitMethodMetadata = reflector.get<boolean>(
      IS_PUBLIC_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      PublicController.prototype.explicitlyPublicMethod,
    );

    const implicitMethodMetadata = reflector.get<boolean>(
      IS_PUBLIC_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      PublicController.prototype.implicitlyPublicMethod,
    );

    // Assert
    expect(classMetadata).toBe(true);
    expect(explicitMethodMetadata).toBe(true);
    expect(implicitMethodMetadata).toBeUndefined(); // Methods don't automatically inherit class metadata
  });

  it('should allow guards to check metadata on different targets', () => {
    // Arrange
    @Public()
    class PublicController {
      method(): string {
        return 'public';
      }
    }

    class ProtectedController {
      @Public()
      publicMethod(): string {
        return 'public method';
      }

      protectedMethod(): string {
        return 'protected method';
      }
    }

    // Act
    const publicControllerMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, PublicController);
    const protectedControllerMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, ProtectedController);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const publicMethodMetadata = reflector.get<boolean>(IS_PUBLIC_KEY, ProtectedController.prototype.publicMethod);

    const protectedMethodMetadata = reflector.get<boolean>(
      IS_PUBLIC_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ProtectedController.prototype.protectedMethod,
    );

    // Assert
    expect(publicControllerMetadata).toBe(true);
    expect(protectedControllerMetadata).toBeUndefined();
    expect(publicMethodMetadata).toBe(true);
    expect(protectedMethodMetadata).toBeUndefined();
  });
});

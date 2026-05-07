import { GalleryVerticalEnd } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>

            <span className="text-foreground">
              Correos de Bolivia
            </span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block overflow-hidden">
        <Image
          src="/fondo.jpg"
          alt="fondo"
          fill
          priority
          className="
            absolute inset-0
            h-full w-full
            object-cover
            transition-all duration-500
            dark:brightness-75
          "
        />
        <div className="absolute inset-0 bg-black/10 dark:bg-black/40" />
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { getMyStudentProfile, MyStudentProfile } from './students.service';

/**
 * Hook del alumno: trae su perfil real (legajo, DNI, estado).
 * Si falla, `profile` queda en null y la pantalla usa los datos de la sesión.
 */
export function useMyStudentProfile() {
  const [profile, setProfile] = useState<MyStudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getMyStudentProfile()
      .then((data) => {
        if (isMounted) setProfile(data);
      })
      .catch(() => {
        // Sin perfil: se muestran los datos guardados en la sesión
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return { profile, isLoading };
}

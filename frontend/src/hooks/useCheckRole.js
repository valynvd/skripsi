import { useEffect, useState } from 'react';
import useAuth from './useAuth';

export const useCheckRole = () => {
  const [role, setRole] = useState({
    admin: false,
    facultyMember: false,
    kaprodi: false,
  });
  const { auth } = useAuth();

  useEffect(() => {
    let tempRole = {};

    if (
      auth?.userData?.role === 'Admin' ||
      auth?.userData?.role === 'Superadmin'
    ) {
      tempRole = { ...tempRole, admin: true };
    } else {
      tempRole = { ...tempRole, admin: false };
    }

    if (auth?.userData?.role === 'Faculty Member') {
      tempRole = { ...tempRole, facultyMember: true };
    } else {
      tempRole = { ...tempRole, facultyMember: false };
    }

    if (auth?.userData?.jabatan === 'Kaprodi') {
      tempRole = { ...tempRole, kaprodi: true };
    } else {
      tempRole = { ...tempRole, kaprodi: false };
    }

    setRole(tempRole);
  }, [auth]);

  return role;
};

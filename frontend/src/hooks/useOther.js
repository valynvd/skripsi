import { useContext } from 'react';
import OtherContext from '../context/OtherProvider';

const useOther = () => {
  return useContext(OtherContext);
};

export default useOther;

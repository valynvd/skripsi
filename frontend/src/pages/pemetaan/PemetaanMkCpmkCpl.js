import React, { useState } from 'react';
import {
  useDeleteMataKuliah,
  useMataKuliahData,
} from '../../hooks/useMataKuliah';
import ModalDelete from '../../components/ModalDelete';
import PemetaanMkCpmkCplTable from './components/PemetaanMkCpmkCplTable';

// const filterMKWithoutCPMK = (data) => {
//   return data.filter(item => item.cpmk_detail.length === 0)
//              .map(item => ({ mk: item.kode, nama: item.name }));
// };

const PemetaanMkCpmkCpl = () => {
  const {
    data: responseData,
    isLoading,
    refetch: mataKuliahDataRefetch,
  } = useMataKuliahData();
  const { mutate: deleteMataKuliahData } = useDeleteMataKuliah();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // const mkWithoutCPMK = useMemo(() => filterMKWithoutCPMK(responseData?.data || []), [responseData]);

  return (
    <>
      <section id="pemetaan-mk-cpmk-cpl" className="section-container">
        <ModalDelete
          title="Mata Kuliah"
          isOpen={openModalDelete}
          setIsOpen={setOpenModalDelete}
          deleteFunc={() =>
            deleteMataKuliahData(selectedItem, {
              onSuccess: () => {
                mataKuliahDataRefetch();
                setOpenModalDelete(false);
              },
            })
          }
        />
        <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
          <p className="font-semibold text-lg">Pemetaan MK-CPL-CPMK</p>
        </div>
        <div className="mt-8 w-full rounded-t-lg">
          <PemetaanMkCpmkCplTable
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
            loading={isLoading}
            data={responseData?.data ?? []}
          />
        </div>
      </section>
    </>
  );
};

export default PemetaanMkCpmkCpl;

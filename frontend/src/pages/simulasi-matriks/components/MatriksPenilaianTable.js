/* eslint-disable no-unused-vars */
import React from 'react';
import { BiPlusCircle, BiSolidDownArrow } from 'react-icons/bi';
import { DeleteIcon, EditIcon } from '../../../components/IconButton';
import { TooltipInfo } from '../../../components/Tooltip';

const MatriksPenilaianTable = ({
  setOpenModalDeleteKriteria,
  setOpenModalDelete,
  criteriaState,
  setCriteriaState,
  matriksPenilaianData,
  setSelectedKriteria,
  openPoinPenilaianModalForm,
  setOpenPoinPenilaianModalForm,
  setSelectedPoinPenilaian,
  openKriteriaModalForm,
  setOpenKriteriaModalForm,
}) => {
  const TableTh = ({ children, className }) => {
    return (
      <th className={`font-semibold border-r border-gray-300 p-3 ${className}`}>
        {children}
      </th>
    );
  };
  const TableTd = ({ children, className }) => {
    return (
      <td className={`border-gray-300 border-t border-r p-3 ${className}`}>
        {children}
      </td>
    );
  };

  return (
    <table className="w-full">
      <thead className="table table-fixed w-full relative">
        <tr>
          <TableTh className="w-20">Jenis</TableTh>
          <TableTh className="w-20">No. Urut</TableTh>
          <TableTh className="w-20">No. Butir</TableTh>
          <TableTh className="w-20">Bobot dari 400</TableTh>
          <TableTh className="w-[15%]">Elemen Penilaian LAM</TableTh>
          <TableTh>Deskriptor</TableTh>
          <TableTh className="w-16">1</TableTh>
          <TableTh className="w-16">2</TableTh>
          <TableTh className="w-16">3</TableTh>
          <TableTh className="w-16">4</TableTh>
          <TableTh className="w-24 border-r-0">Aksi</TableTh>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan="9" className="h-1 bg-primary-400 rounded"></td>
        </tr>
      </tbody>

      {matriksPenilaianData?.map((item) => {
        let matriksList = [];

        if (item.nama !== 'Kriteria 0') {
          matriksList.push(
            <tbody key={item.id}>
              <tr className="relative">
                <td
                  onClick={() =>
                    setCriteriaState((prev) => {
                      let criteriaState2 = { ...prev };

                      criteriaState2[item.nama] = !criteriaState2[item.nama];
                      localStorage.setItem(
                        'criteriaState2',
                        JSON.stringify(criteriaState2)
                      );
                      return criteriaState2;
                    })
                  }
                  className="w-[calc(100%-6rem)] py-3 my-0.5 px-6 bg-primary-400 rounded-lg text-white flex justify-between items-center relative cursor-pointer"
                >
                  <p>
                    {item.nama} {item.deskripsi}
                  </p>
                  <BiSolidDownArrow
                    size={13}
                    className={`duration-200 ${
                      criteriaState[item.nama] ? 'rotate-0' : 'rotate-180'
                    }`}
                  />
                </td>
                <div className="flex justify-center space-x-2 absolute top-2 right-3">
                  <EditIcon
                    onClick={() => {
                      setSelectedKriteria(item);
                      setOpenKriteriaModalForm(true);
                    }}
                  />
                  <DeleteIcon
                    onClick={() => {
                      setSelectedKriteria(item);
                      setOpenModalDeleteKriteria(true);
                    }}
                  />
                </div>
              </tr>
            </tbody>
          );
        }
        matriksList.push(
          <tbody
            key={item.nama + ' child'}
            className={`w-full table-fixed ${
              criteriaState[item.nama] ? 'block' : 'hidden'
            }`}
          >
            {item.poin_penilaian_detail.map((item2) => (
              <tr className="w-full" key={item2.order_number}>
                <TableTd className="text-center w-20">{item2.type}</TableTd>
                <TableTd className="text-center w-20">
                  {item2.order_number}
                </TableTd>
                <TableTd className="text-center w-20">
                  {item2.item_number}
                </TableTd>
                <TableTd className="text-center w-20">
                  {item2.max_score}
                </TableTd>
                <TableTd className="w-[15%]">{item2.element}</TableTd>
                <TableTd>{item2.description}</TableTd>
                <TableTd className="relative w-16">
                  <div className="flex justify-center">
                    <TooltipInfo>{item2.description_grade_1}</TooltipInfo>
                  </div>
                </TableTd>
                <TableTd className="relative w-16">
                  <div className="flex justify-center">
                    <TooltipInfo>{item2.description_grade_2}</TooltipInfo>
                  </div>
                </TableTd>
                <TableTd className="relative w-16">
                  <div className="flex justify-center">
                    <TooltipInfo>{item2.description_grade_3}</TooltipInfo>
                  </div>
                </TableTd>
                <TableTd className="relative w-16">
                  <div className="flex justify-center">
                    <TooltipInfo>{item2.description_grade_4}</TooltipInfo>
                  </div>
                </TableTd>
                <TableTd className="border-r-0 relative w-24">
                  <div className="flex justify-center space-x-2">
                    <EditIcon
                      onClick={() => {
                        setSelectedPoinPenilaian(item2);
                        setOpenPoinPenilaianModalForm(true);
                      }}
                    />
                    <DeleteIcon
                      onClick={() => {
                        setSelectedPoinPenilaian(item2);
                        setOpenModalDelete(true);
                      }}
                    />
                  </div>
                </TableTd>
              </tr>
            ))}
            <tr>
              <td colSpan="11" className="">
                <button
                  onClick={() => {
                    setSelectedPoinPenilaian(null);
                    setOpenPoinPenilaianModalForm(true);
                    setSelectedKriteria(item.id);
                  }}
                  className="my-2 flex items-center justify-center space-x-2 border-primary-400 font-semibold text-primary-400 border-2 rounded-lg p-2 w-full"
                >
                  <p>Tambah Poin Penilaian</p>
                  <BiPlusCircle size={22} />
                </button>
              </td>
            </tr>
          </tbody>
        );

        return matriksList;
      })}

      <tbody>
        <tr>
          <td colSpan="11" className="">
            <button
              onClick={() => {
                setSelectedKriteria(null);
                setOpenKriteriaModalForm(true);
                // setSelectedPoinPenilaian(null);
                // setOpenPoinPenilaianModalForm(true);
              }}
              className="my-2 flex items-center justify-center space-x-2 border-primary-400 font-semibold text-primary-400 border-2 rounded-lg p-2 w-full"
            >
              <p>Tambah Kriteria</p>
              <BiPlusCircle size={22} />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default MatriksPenilaianTable;

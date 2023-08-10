/* eslint-disable no-unused-vars */
import React, {useState , useEffect} from 'react'
import BreadCrumbs from '../../components/BreadCrumbs';
import CRUInput from '../../components/CRUInput';
import CRUTextAreaInput from '../../components/CRUTextAreaInput';
import { socket } from '../../socket';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useForm } from 'react-hook-form';
import { AlertError } from '../../components/Alert';
import { useDataMahasiswaData } from '../../hooks/useDataMahasiswa';
import { useAssignMahasiswatoGrupData } from '../../hooks/useAssignMahasiswatoGrup1';
import { useGrupMahasiswaData } from '../../hooks/useGrupMahasiswa';
import { MultiSelect } from "react-multi-select-component";
import { CircularProgressbar } from 'react-circular-progressbar';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import 'react-circular-progressbar/dist/styles.css';

const BroadCastPesanForm = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
      } = useForm();

    const [phonenumbers, setPhoneNumbers] = useState([]);
    const [message, setMessage] = useState('');
    const [nama, setNama] = useState('');
    const [grupselected, setGrupselected] = useState([])
    const [percent, setPercent] = useState('');
    const [jadwal, setJadwal] = useState(new Date());

    const { data: grupMahasiswa, isSuccess: grupMahasiswaSuccess } = 
    useGrupMahasiswaData ({
        select: (response) => {
            const formatUserData = response.data.map (({id, namagrup}) => {
                return{
                    value: id,
                    label: namagrup,
                };
            });
            return formatUserData;
        }
    })

    const { data: dataMahasiswabygrup, isSuccess: dataMahasiswabygrupSuccess } = 
    useAssignMahasiswatoGrupData ({
        select: (response) => {
            const formatUserData1 = response.data.map (({nama_mahasiswa, nama_grup}) => {
                return{
                    value: nama_mahasiswa.telephone,
                    label: nama_mahasiswa.nama,
                    namagrup: nama_grup.namagrup
                };
            });
            return formatUserData1;
        }
    })

    useEffect(() => {
        socket.on('sendsuccess', (nama) => {
            console.log(nama)
            setNama((nama))
        })
        socket.on('percen', (percent) => {
            setPercent((percent))
        })
    }, []);

    useEffect(() => {
        if(grupselected.length !== 0){
            const selectedDataMahasiswa = []

            dataMahasiswabygrup.forEach((item) => {
                
                grupselected.forEach((item2) => {
                    if(item.namagrup === item2.label){
                        selectedDataMahasiswa.push(item)
                    }
                })
            })

            setPhoneNumbers(selectedDataMahasiswa)
        }
    }, [grupselected])

    useEffect(() => {
        console.log(phonenumbers)
    }, [phonenumbers])

    const handleSubmitBroadcast = (event) => {
        event.preventDefault();
        if (message && phonenumbers) {
          socket.emit('broadcast', {phonenumbers, message, jadwal});
          setPhoneNumbers([]);
          setMessage('');
        }
      };
    
  return (
    <>
        <section id="broadcast-pesan-form" className="section-container">
            <BreadCrumbs
                links={[
                    {
                        name: 'List Broadcast Pesan',
                        link: '/stem-chatbot/broadcast-pesan',
                    },
                    { 
                        name: 'Buat'
                    },
                ]}
            />
            <p className="text-lg font-semibold">
                Buat Pesan Broadcast
            </p>
            <form onSubmit={handleSubmitBroadcast} className="mt-8 space-y-4">         
                <CRUInput
                    register={register}
                    name="Judul Pesan Broadcast"
                    required
                    registeredName="title"
                />
                <div>
                    <p>Penerima Pesan Broadcast</p>
                    <MultiSelect    className='focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]'
                        options={grupMahasiswaSuccess ? grupMahasiswa : []}
                        labelledBy="Penerima"
                        value={grupselected}
                        onChange={setGrupselected}
                    />
                </div>
               
                
               <div>
                    <p>Jadwal Broadcast</p>
                    <DateTimePicker className='focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]'
                        value={jadwal} 
                        onChange={setJadwal}
                    />
                </div>

                <textarea className='focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]' type="text" value={message} rows={4} cols={40} placeholder="Your message" onChange={(event) => setMessage(event.target.value)} />
                
                {/* <button type="submit">Send</button> */}
                <PrimaryButton type='submit'>
                    Kirim Pesan
                </PrimaryButton>
             </form>
             <p>Success send to {nama}</p>
             <div style={{ width: 200, height: 200 }}>
                <CircularProgressbar value={percent} maxValue={100} text={percent} />
             </div>
             
        </section>
    </>
  )
}

export default BroadCastPesanForm
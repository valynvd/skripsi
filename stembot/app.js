const { Client, LocalAuth, MessageMedia, MessageAck } = require('whatsapp-web.js');
const mongoose = require('mongoose');
require('dotenv').config();

const qrcode = require('qrcode-terminal');
const puppeteer = require('puppeteer')
const PERTANYAAN_UMUM = require('./data/pertanyaanUmum');
const TIMELINE_AKADEMIK = require('./data/timelineAkademik');
const PERIODE_PEMBAYARAN = require('./data/periodePembayaran');
const SEPUTAR_SAP = require('./data/seputarSAP');
const SEPUTAR_LMS = require('./data/seputarLMS');

const progresswa = require('./model/progress_wa');
const pertanyaanumum = require('./model/pertanyaan_umum')
const timelineakademik = require('./model/timeline_akademik')
const periodepembayaran = require('./model/periode_pembayaran')
const seputarlms = require('./model/seputar_lms')
const seputarsap = require('./model/seputar_sap')

const backtomenu = '0. Kembali ke menu utama';

let kalimatAwal = 'Silahkan pilih salah satu layanan yang anda inginkan: ';
let pilihantimeline = 'Berikut ini pertanyaan seputar TimeLine Akademik:';
let pilihanpembayaran = 'Berikut ini pertanyaan seputar Pembayaran:';
let pilihansap = 'Berikut ini pertanyaan seputar SAP:';
let pilihanlms = 'Berikut ini pertanyaan seputar LMS';


let contactnumber;

const databaseUrl = process.env.DATABASE_URL;
mongoose.connect(databaseUrl);
const database = mongoose.connection;



database.once("connected", () => {
    console.log("connected to MongoDB database")
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer : {headless : false},
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('authenticated', (session) => {
    console.log('Authenticated');
  });

client.on('ready', () => {
    console.log('Client is ready!');
 
});



client.on('message', async (message) => {
    contactnumber = message.from;
    console.log(contactnumber);
    console.log(message.body);

    const query = progresswa.findOne({ nohp : contactnumber});
    query.then(async (data) => {
        console.log('Data:', data);
        if(!data || data.status == false){
            if ((message.body).toLowerCase().includes('halo stembot')){
                // if(message.body == "Halo STEMBot"){
                if (!data){
                    kalimatAwal = 'Silahkan pilih salah satu layanan yang anda inginkan: ';
                    const pertanyaan = pertanyaanumum.find({});
                    pertanyaan.then((data) => {
                        data.forEach((item, index) => {
                            kalimatAwal += `\n${index + 1}. ${item.pertanyaan}`;
                        })
                    })
                    const newData = new progresswa({
                        nohp : contactnumber,
                        layanan : "Begin",
                        status : true,
                    });
                    newData.save()
                    .then(() => {
                        client.sendMessage(message.from, 'Halo, Selamat Datang di layanan Akademik STEM Prasetiya Mulya');
                        client.sendMessage(message.from, kalimatAwal); 
                    })
                    .catch((err) => {
                        console.error(err);
                    });
                } else if (data.status == false){
                    kalimatAwal = 'Silahkan pilih salah satu layanan yang anda inginkan: ';
                    const pertanyaan = pertanyaanumum.find({});
                    pertanyaan.then((data) => {
                        data.forEach((item, index) => {
                            kalimatAwal += `\n${index + 1}. ${item.pertanyaan}`;
                        })
                    })
                    progresswa.updateOne(
                        {nohp : contactnumber},
                        { $set : {layanan : "Begin", status : true} },
                    ) .then(() => {
                        client.sendMessage(message.from, 'Halo, Selamat Datang di layanan Akademik STEM Prasetiya Mulya');
                        client.sendMessage(message.from, kalimatAwal); 
                    })
                    .catch((err) => {
                        console.error(err);
                    });
                }
            } else {
                client.sendMessage(message.from, "Anda dapat memanggil ChatBot STEM dengan mengirimkan pesan: Halo STEMBot ")
            }
        }
        else if (data.layanan == "Begin"){
            console.log(data.layanan)
            const pertanyaan = pertanyaanumum.find({});
            let shouldSkip = false;
            let norespon = false;
            pertanyaan.then((data) => {
                data.forEach((item, index) => {
                    if(shouldSkip){
                        return;
                    }
                    if (message.body == index+1){
                        norespon = false;
                        shouldSkip = true;
                        message.reply(item.jawaban);
                        if(message.body == 1){
                            pilihantimeline = 'Berikut ini pertanyaan seputar TimeLine Akademik:';
                            const timeline = timelineakademik.find({});
                            timeline.then((data) => {
                                
                                data.forEach((item, index) => {
                                    pilihantimeline += `\n${index + 1}. ${item.pertanyaan}`;
                                })
                            })
                            norespon = false;
                            shouldSkip = true;
                            progresswa.updateOne(
                                {nohp : contactnumber},
                                { $set : {layanan : "TimeLine"} },
                            ) .then(() => {
                                client.sendMessage(message.from, pilihantimeline + '\n' + backtomenu);
                            })
                            .catch((err) => {
                                console.error(err);
                            });
                        }
                        else if(message.body == 2){
                            pilihanpembayaran = 'Berikut ini pertanyaan seputar Pembayaran:';
                            const pembayaran = periodepembayaran.find({});
                            pembayaran.then((data) => {
                                data.forEach((item, index) => {
                                    pilihanpembayaran += `\n${index + 1}. ${item.pertanyaan}`;
                                })
                            })
                            norespon = false;
                            shouldSkip = true;
                            // localStorage.setItem(contact.number, "Pembayaran")
                            progresswa.updateOne(
                                {nohp : contactnumber},
                                { $set : {layanan : "Pembayaran"} },
                            ) .then(() => {
                                client.sendMessage(message.from, pilihanpembayaran+ '\n' + backtomenu);
                            })
                            .catch((err) => {
                                console.error(err);
                            });
                        }
                        else if(message.body == 3){
                            norespon = false;
                            shouldSkip = true;
                            // localStorage.setItem(contact.number, "Ending")
                            progresswa.updateOne(
                                {nohp : contactnumber},
                                { $set : {layanan : "Ending"} },
                            ).then(() => {
                                client.sendMessage(message.from, 'Apakah ada yang bisa dibantu lagi? \n\nBalas dengan Ya atau Tidak');
                            })
                            .catch((err) => {
                                console.error(err);
                            });  
                        }  
                        else if(message.body == 4){
                            pilihansap = 'Berikut ini pertanyaan seputar SAP:';
                            const sap = seputarsap.find({});
                            sap.then((data) => {
                                data.forEach((item, index) => {
                                    pilihansap += `\n${index + 1}. ${item.pertanyaan}`;
                                })
                            })
                            norespon = false;
                            shouldSkip = true;
                            // localStorage.setItem(contact.number, "SAP")
                            progresswa.updateOne(
                                {nohp : contactnumber},
                                { $set : {layanan : "SAP"} },
                            ).then(() => {
                                client.sendMessage(message.from, pilihansap+ '\n' + backtomenu);
                            })
                            .catch((err) => {
                                console.error(err);
                            });  
                        }
                        else if(message.body == 5){
                            pilihanlms = 'Berikut ini pertanyaan seputar LMS';
                            const lms = seputarlms.find({});
                            lms.then((data) => {
                                data.forEach((item, index) => {
                                    pilihanlms += `\n${index + 1}. ${item.pertanyaan}`;
                                })
                            })
                            norespon = false;
                            shouldSkip = true;
                            // localStorage.setItem(contact.number, "LMS")
                            progresswa.updateOne(
                                {nohp : contactnumber},
                                { $set : {layanan : "LMS"} },
                            ).then(() => {
                                client.sendMessage(message.from, pilihanlms+ '\n' + backtomenu);
                            })
                            .catch((err) => {
                                console.error(err);
                            }); 
                        }
                        else if(message.body == 6){
                            norespon = false;
                            shouldSkip = true;
                            // localStorage.setItem(contact.number, "Ending")
                            progresswa.updateOne(
                                {nohp : contactnumber},
                                { $set : {layanan : "Ending"} },
                            ).then(() => {
                                client.sendMessage(message.from, 'Apakah ada yang bisa dibantu lagi? \n\nBalas dengan Ya atau Tidak');
                            })
                            .catch((err) => {
                                console.error(err);
                            }); 
                        }  
                        else if(message.body == 7){
                            norespon = false;
                            shouldSkip = true;
                            // localStorage.setItem(contact.number, "Ending")
                            progresswa.updateOne(
                                {nohp : contactnumber},
                                { $set : {layanan : "Ending"} },
                            ).then(() => {
                                client.sendMessage(message.from, 'Apakah ada yang bisa dibantu lagi? \n\nBalas dengan Ya atau Tidak');
                            })
                            .catch((err) => {
                                console.error(err);
                            }); 
                        }
                    }
                    else {
                        console.log("masuk sini")
                        norespon = true;
                    }
                });
                if(norespon == true){
                    norespon = false;
                    client.sendMessage(message.from, 'Mohon maaf kami tidak memahami respon anda.');
                    client.sendMessage(message.from, kalimatAwal);
                }
            });

        }
        // else if (localStorage.getItem(contact.number) == "TimeLine"){
        else if (data.layanan == "TimeLine" && data.status == true){
            if (message.body == '0'){
                kalimatAwal = 'Silahkan pilih salah satu layanan yang anda inginkan: ';
                    const pertanyaan = pertanyaanumum.find({});
                    pertanyaan.then((data) => {
                        data.forEach((item, index) => {
                            kalimatAwal += `\n${index + 1}. ${item.pertanyaan}`;
                        })
                    })
                progresswa.updateOne(
                    {nohp : contactnumber},
                    { $set : {layanan : "Begin"} },
                ).then(() => {
                    norespon = false;
                    client.sendMessage(message.from, kalimatAwal);
                })
                .catch((err) => {
                    console.error(err);
                }); 
            } else {
                let shouldSkip = false;
                let norespon = false;
                const timeline = timelineakademik.find({});
                timeline.then((data) => {
                    data.forEach((item, index) => {
                        if (shouldSkip) {
                            return;
                        }
                        if(message.body == index+1){
                            norespon = false;
                            shouldSkip = true;
                                                
                            progresswa.updateOne(
                                {nohp : contactnumber},
                                { $set : {layanan : "Ending"} },
                            ).then(() => {
                                client.sendMessage(message.from, item.jawaban);
                                client.sendMessage(message.from, 'Apakah ada yang bisa dibantu lagi? \n\nBalas dengan Ya atau Tidak');
                            })
                            .catch((err) => {
                                console.error(err);
                            }); 
                        }
                        else {
                            norespon = true;
                            console.log(norespon)
                        }
                    });
                    if (norespon == true){
                        norespon = false;
                        client.sendMessage(message.from, 'Mohon maaf kami tidak memahami respon anda. \nSilahkan kembali memilih berdasarkan pilihan tersebut:');
                        client.sendMessage(message.from, pilihantimeline + '\n' + backtomenu);
                    }
                });
            }
        }
    
        // else if (localStorage.getItem(contact.number) == "Pembayaran"){
        else if (data.layanan == "Pembayaran" && data.status == true){
            if (message.body == '0'){
                kalimatAwal = 'Silahkan pilih salah satu layanan yang anda inginkan: ';
                    const pertanyaan = pertanyaanumum.find({});
                    pertanyaan.then((data) => {
                        data.forEach((item, index) => {
                            kalimatAwal += `\n${index + 1}. ${item.pertanyaan}`;
                        })
                    })
                // localStorage.setItem(contact.number, "Begin")
                progresswa.updateOne(
                    {nohp : contactnumber},
                    { $set : {layanan : "Begin"} },
                ).then (() => {
                    norespon = false;
                    client.sendMessage(message.from, kalimatAwal);
                    
                })
                .catch((err) => {
                    console.error(err);
                }); 
                
            } else {
                let shouldSkip = false;
                let norespon = false;
                const pembayaran = periodepembayaran.find({});
                pembayaran.then((data) => {
                    data.forEach((item, index) => {
                        if (shouldSkip) {
                            return;
                        }
                        if(message.body == index+1){
                            norespon = false;
                            shouldSkip = true;
                            progresswa.updateOne(
                                {nohp : contactnumber},
                                { $set : {layanan : "Ending"} },
                            ).then(() => {
                                client.sendMessage(message.from, item.jawaban);
                                client.sendMessage(message.from, 'Apakah ada yang bisa dibantu lagi? \n\nBalas dengan Ya atau Tidak');
                            })
                            .catch((err) => {
                                console.error(err);
                            }); 
                        }
                        else {
                            norespon = true;
                        }
                    });
                    if (norespon === true){
                        norespon = false;
                        client.sendMessage(message.from, 'Mohon maaf kami tidak memahami respon anda. \nSilahkan kembali memilih berdasarkan pilihan tersebut:');
                        client.sendMessage(message.from, pilihanpembayaran + '\n' + backtomenu);
                    }
                });

            }
        }
    
        // else if (localStorage.getItem(contact.number) == "SAP"){
        else if (data.layanan == "SAP" && data.status == true){
            if (message.body == '0'){
                kalimatAwal = 'Silahkan pilih salah satu layanan yang anda inginkan: ';
                    const pertanyaan = pertanyaanumum.find({});
                    pertanyaan.then((data) => {
                        data.forEach((item, index) => {
                            kalimatAwal += `\n${index + 1}. ${item.pertanyaan}`;
                        })
                    })
                // localStorage.setItem(contact.number, "Begin")
                progresswa.updateOne(
                    {nohp : contactnumber},
                    { $set : {layanan : "Begin"} },
                ).then(() => {
                    client.sendMessage(message.from, kalimatAwal);
                    norespon = false;
                })
                .catch((err) => {
                    console.error(err);
                });
            } else {
                let shouldSkip = false;
                let norespon = false;
                const sap = seputarsap.find({});
                sap.then((data) => {
                    data.forEach((item, index) => {
                        if (shouldSkip) {
                            return;
                        }
                        if(message.body == index+1){
                            norespon = false;
                            shouldSkip = true;
                            // localStorage.setItem(contact.number, "Ending")
                            progresswa.updateOne(
                                {nohp : contactnumber},
                                { $set : {layanan : "Ending"} },
                            ).then(() => {
                                client.sendMessage(message.from, item.jawaban);
                                client.sendMessage(message.from, 'Apakah ada yang bisa dibantu lagi? \n\nBalas dengan Ya atau Tidak'); 
                            })
                            .catch((err) => {
                                console.error(err);
                            });
                        }
                        else {
                            norespon = true;
                        }
                    });
                    if (norespon == true){
                        norespon = false;
                        client.sendMessage(message.from, 'Mohon maaf saya tidak memahami respon anda.\nSilahkan kembali memilih berdasarkan pilihan tersebut:');
                        client.sendMessage(message.from, pilihansap + '\n' + backtomenu);
                    }
                });
            }
        }
        else if (data.layanan == "LMS" && data.status == true){
            if (message.body == '0'){
                kalimatAwal = 'Silahkan pilih salah satu layanan yang anda inginkan: ';
                    const pertanyaan = pertanyaanumum.find({});
                    pertanyaan.then((data) => {
                        data.forEach((item, index) => {
                            kalimatAwal += `\n${index + 1}. ${item.pertanyaan}`;
                        })
                    })
                progresswa.updateOne(
                    {nohp : contactnumber},
                    { $set : {layanan : "Begin"} },
                ).then(() => {
                    norespon = false;
                    client.sendMessage(message.from, kalimatAwal);
                })
                .catch((err) => {
                    console.error(err);
                });
            } else {
                let shouldSkip = false;
                let norespon = false;
                const lms = seputarlms.find({});
                lms.then((data) => {
                    data.forEach((item, index) => {
                        if (shouldSkip) {
                            return;
                        }
                        if(message.body == index+1){
                            shouldSkip = true;
                            norespon = false;
                            progresswa.updateOne(
                                {nohp : contactnumber},
                                { $set : {layanan : "Ending"} },
                            ).then(() => {
                                client.sendMessage(message.from, item.jawaban);
                                client.sendMessage(message.from, 'Apakah ada yang bisa dibantu lagi? \n\nBalas dengan Ya atau Tidak');
                            })
                            .catch((err) => {
                                console.error(err);
                            });
                        }
                        else {
                            norespon = true;
                        }
                    });
                    if (norespon == true){
                        norespon = false;
                        client.sendMessage(message.from, 'Mohon maaf saya tidak memahami respon anda.\nSilahkan kembali memilih berdasarkan pilihan tersebut:');
                        client.sendMessage(message.from, pilihanlms + '\n' + backtomenu);
                    }
                });
            }
        }
    
        // else if(localStorage.getItem(contact.number) == "Ending"){
        else if (data.layanan == "Ending" && data.status == true){
            if ((message.body).toLowerCase().includes('ya')){
                kalimatAwal = 'Silahkan pilih salah satu layanan yang anda inginkan: ';
                    const pertanyaan = pertanyaanumum.find({});
                    pertanyaan.then((data) => {
                        data.forEach((item, index) => {
                            kalimatAwal += `\n${index + 1}. ${item.pertanyaan}`;
                        })
                    })
                // localStorage.setItem(contact.number, "Begin")
                progresswa.updateOne(
                    {nohp : contactnumber},
                    { $set : {layanan : "Begin"} },
                ).then(() => {
                    client.sendMessage(message.from, kalimatAwal);
                })
                .catch((err) => {
                    console.error(err);
                });
            }
            else if ((message.body).toLowerCase().includes('tidak')){
                
                // localStorage.removeItem(contact.number)
                progresswa.updateOne(
                    {nohp : contactnumber},
                    { $set : {status : false} },
                ).then(()=> {
                    client.sendMessage(message.from, 'Terima kasih sudah menghubungi layanan Akademik STEM Prasetiya Mulya');
                })
                .catch((err) => {
                    console.error(err);
                });
            } else {
                client.sendMessage(message.from, 'Mohon maaf saya tidak memahami respon anda.\nSilahkan kembali memilih berdasarkan pilihan tersebut:');
                client.sendMessage(message.from, 'Apakah ada yang bisa dibantu lagi? \n\nBalas dengan Ya atau Tidak');
            }
        }
       
    })
        .catch((err) => {
            console.error(err);
    });
});
 
client.on('disconnected', (reason) => {
    console.log('disconnet whatsapp-bot', reason);
});

client.initialize();
 
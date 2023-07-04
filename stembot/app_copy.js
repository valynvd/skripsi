const { Client, LocalAuth, MessageMedia, MessageAck, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const uri = "mongodb+srv://gaizkavalencia1:hHDOLtwJd5cwQYqE@cluster0.p0ajoom.mongodb.net/databasewa?retryWrites=true&w=majority";

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
let pilihantimeline = '';
let pilihanpembayaran = '';
let pilihansap = '';
let pilihanlms = '';


let contactnumber;

const databaseUrl = uri;


mongoose.connect(databaseUrl).then(() => {
    const store = new MongoStore({ mongoose: mongoose });
    const database = mongoose.connection;
    database.once("connected", () => {
        console.log("connected to MongoDB database")
        const pertanyaan = pertanyaanumum.find({});
        pertanyaan.then((data) => {
            data.forEach((item, index) => {
                kalimatAwal += `\n${index + 1}. ${item.pertanyaan}`;
            })
        })
    
        const timeline = timelineakademik.find({});
        timeline.then((data) => {
            
            data.forEach((item, index) => {
                pilihantimeline += `${index + 1}. ${item.pertanyaan}\n`;
            })
        })
        const pembayaran = periodepembayaran.find({});
        pembayaran.then((data) => {
            data.forEach((item, index) => {
                pilihanpembayaran += `${index + 1}. ${item.pertanyaan}\n`;
            })
        })
    
        const sap = seputarsap.find({});
        sap.then((data) => {
            data.forEach((item, index) => {
                pilihansap += `${index + 1}. ${item.pertanyaan}\n`;
            })
        })
    
        const lms = seputarlms.find({});
        lms.then((data) => {
            data.forEach((item, index) => {
                pilihanlms += `${index + 1}. ${item.pertanyaan}\n`;
            })
        })
    });
    
    // const client = new Client({
    //     authStrategy: new LocalAuth(),
    //     puppeteer : {headless : false},
    // });

    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        }),
        puppeteer : {headless : false},
    });

    client.initialize();

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
        // try {
        //     // Get the contact information from the message
        //     const contact = await message.getContact();
        //     contactnumber = contact.number;
        //     // Log the contact information
        //     console.log(contactnumber);
        //   } catch (error) {
        //     console.error('Error retrieving contact information:', error);
        // }
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

    client.on('auth_failure', (session) => {
        console.log('Authentication failure');
        // Handle authentication failure
      });

    client.on('disconnected', (reason) => {
        console.log('disconnet whatsapp-bot', reason);
    });

    client.on('remote_session_saved', () => {
        // Do stuff after the remote session is saved
        console.log('Remote session saved');
      });
    
    // await store.save({ session: "yoursessionname" });

});







 

 
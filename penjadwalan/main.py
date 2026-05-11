from data import *
from penjadwalan import generate_jadwal

jadwal = generate_jadwal(matakuliah, ruangan, waktu, dosen, kelas_khusus)

for j in jadwal:
    print(j)

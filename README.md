# Casa Grosso Restaurant - Website

## Instalare și configurare

### Cerințe preliminare
- Node.js
- MongoDB Community Server

### Pași de instalare
1. Clonați repository-ul: `git clone [url]`
2. Adăugați fișierul `.env` în folderul `/backend` (conținutul este specificat mai jos)
3. Instalați dependențele:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install  # folosiți --force dacă apar erori
   ```

### Configurare MongoDB
1. Deschideți MongoDB Compass
2. Creați o bază de date cu numele `restaurantDB` și collection-ul `products`
   - Notă: Poate fi necesară crearea folderului `c:\data\db`
3. Importați baza de date:
   ```bash
   mongorestore --db restaurantDB ./db_backup
   ```
   - Notă: Poate fi necesară instalarea pachetelor mongotools CLI pentru mongodump/mongorestore și adăugarea folderului bin mongotools în PATH

### Pornirea aplicației
1. Porniți serverul backend:
   ```bash
   cd proj/backend
   npm run dev  # La succes va apărea mesajul "Server pornit pe portul 5555"
   ```
2. Porniți aplicația frontend:
   ```bash
   cd proj/frontend
   npm run dev
   ```
3. Accesați aplicația în browser la link-ul afișat (de obicei `localhost:5173`)

### Conținut fișier `.env`
```
PORT=5555
MONGO_URI=mongodb://127.0.0.1:27017/restaurantDB
JWT_SECRET=3b5b902d2c44603d61979b53c25f93c90badc7b8eb944c3393fcdf375821145c
```

### Notă privind afișarea
Unele website-uri pot afecta preferințele browser-ului dark mode/light mode. În cazul în care site-ul nu se afișează corect (roșul de pe butoane devine palid sau toppingurile nu se văd), ștergeți cache-ul browserului. Aplicația impune light mode, dar pot exista cazuri excepționale.

## Prezentarea site-ului

### Descriere generală
Am creat un site pentru restaurantul Casa Grosso care oferă următoarele funcționalități:
- Rezervări în restaurant
- Comenzi online
- Feedback
- Panel de administrare (admin)
- Funcții de administrare pentru utilizatori/produse
- Pagină pentru preluare comenzi (curieri)

### Roluri în aplicație
Site-ul gestionează 3 roluri:
- Client (logat/nelogat)
- Admin
- Curier

### Conturi predefinite pentru testare
| Utilizator | Parolă | Rol |
|------------|--------|-----|
| admin      | admin  | admin |
| razva      | razva  | client |
| badea      | badea  | curier |

### Navigare în aplicație

#### Prima utilizare
1. Site-ul se deschide pe Landing Page
2. Click pe "Alătură-te experienței!" pentru a accesa MainPage
3. În MainPage se navighează folosind bara superioară:
   - Butonul "Coș" - vizualizarea produselor din coș și finalizare comandă
   - Butonul "Lacăt" - login

#### Funcționalități pentru clienți
- În tab-ul **Oferte** se regăsesc diverse vouchere pentru coș sau categorii specifice de produse
- În dreapta jos există un buton pentru feedback
- În tab-urile cu produse (burgeri/pizza/paste) există topping-uri accesibile prin butonul verde +
- Flow comandă:
  1. Adăugați produse în coș
  2. Aplicați un voucher pentru reducere (opțional)
  3. Click pe "Coș" și apoi "Comandă"
  4. După logare, completați câmpurile pentru comandă
  5. Adresa se va scrie în formatul: `strada iedului 4, bucuresti` pentru o estimare corectă a timpului de livrare
  6. După trimiterea comenzii veți primi o alertă cu timpul estimat de livrare
- Din modul logat se poate accesa pagina de User (dreapta sus, iconița User):
  - Schimbare nume și parolă
  - Vizualizare informații cont
  - Istoricul comenzilor (pending și delivered)
- În tab-ul restaurant se pot face rezervări completând formularul

#### Funcționalități pentru admin
Interfața este similară cu cea de client, dar cu modificări:
- În tab-ul restaurant se pot șterge rezervările clienților
- În tab-urile oferte/băuturi/pizza/etc. se pot adăuga/șterge produse/vouchere
- În dreapta jos, butonul roșu de Chat deschide panoul de feedback de la clienți
- În dreapta sus:
  - Butonul user+ permite adăugarea de utilizatori noi (curieri/alți admini)
  - Butonul rotiță "Control" duce spre pagina de Control unde se pot:
    - Vizualiza comenzile și utilizatorii
    - Schimba rolul unui utilizator
    - Șterge utilizatori

#### Funcționalități pentru curier
- După logare ca curier se deschide panoul de comenzi
- Curierii pot marca comanda ca livrată apăsând butonul de livrare

### Funcționalități speciale
- **Logica de rezervări**: Restaurantul poate servi maximum 50 de clienți pe oră
- **Top produse**: În meniul Noutăți se poate observa un tabel cu cele mai vândute produse, actualizat în timp real
- **Responsive design**: Implementat prin Drawere, accesate din meniul hamburger din navbar
- **Gestionarea sesiunilor**: Implementată prin JavaWebToken și LocalStorage
- **Geolocation**: Folosind serviciul Nominatim pentru calcularea timpului de livrare bazat pe distanța dintre restaurantul situat la ATM și adresa de livrare

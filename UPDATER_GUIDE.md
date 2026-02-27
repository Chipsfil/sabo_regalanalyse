# Guida Sistema di Aggiornamento OTA

## 📋 Panoramica

Il sistema di aggiornamento OTA (Over-The-Air) permette agli utenti di ricevere automaticamente nuove versioni dell'app tramite GitHub Releases.

## 🚀 Come Funziona

### Per l'Utente

1. **Controllo Automatico**: All'avvio dell'app, dopo 3 secondi viene controllato automaticamente se ci sono aggiornamenti
2. **Stato Visibile**: Nell'header viene mostrato lo stato degli aggiornamenti
3. **Controllo Manuale**: Dopo 5 secondi dall'avvio appare il bottone "Controlla Aggiornamenti" per verifiche manuali
4. **Download**: Se disponibile, appare il bottone "Scarica Aggiornamento"
5. **Installazione**: Dopo il download, appare "Installa e Riavvia"

### Stati dell'Updater

- 🔵 **Controllo in corso...** - L'app sta verificando la presenza di aggiornamenti
- 🟢 **Aggiornato ✓** - Nessun aggiornamento disponibile
- 🟢 **Nuovo aggiornamento: v1.2.5** - Aggiornamento trovato e pronto per il download
- 🔵 **Download in corso...** - Download dell'aggiornamento in corso (con barra di progresso)
- 🟢 **Aggiornamento v1.2.5 pronto!** - Download completato, pronto per l'installazione
- 🔴 **Errore...** - Problema durante il controllo/download

## 🛠️ Come Pubblicare un Nuovo Aggiornamento

### Prerequisiti

1. **Token GitHub**: Crea un GitHub Personal Access Token
   - Vai su: https://github.com/settings/tokens
   - Genera nuovo token (classic)
   - Seleziona scope: `repo` (accesso completo al repository)
   - Copia il token

2. **Imposta Variabile d'Ambiente**:
   
   **Windows (PowerShell)**:
   ```powershell
   $env:GH_TOKEN="IL_TUO_TOKEN_GITHUB"
   ```
   
   **Windows (CMD)**:
   ```cmd
   set GH_TOKEN=IL_TUO_TOKEN_GITHUB
   ```
   
   **macOS/Linux**:
   ```bash
   export GH_TOKEN=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
   ```

### Passaggi per Pubblicare

#### 1. Aggiorna la Versione

Modifica `package.json`:
```json
{
  "version": "1.2.5"  // Incrementa la versione
}
```

#### 2. Installa Dipendenze (se necessario)

```bash
npm install
```

#### 3. Testa l'Applicazione

```bash
npm start
```

#### 4. Costruisci e Pubblica

```bash
npm run publish
```

Questo comando:
- Compila l'app per tutte le piattaforme (Windows, macOS, Linux)
- Crea un draft release su GitHub
- Carica automaticamente i file di installazione

#### 5. Pubblica la Release su GitHub

1. Vai su: https://github.com/Chipsfil/sabo_regalanalyse/releases
2. Troverai una "Draft" release
3. Modifica il draft:
   - Aggiungi note di rilascio (changelog)
   - Descrivi le nuove funzionalità
   - Elenca le correzioni bug
4. Clicca "Publish Release"

### Esempio Note di Rilascio

```markdown
## Novità v1.2.5

### ✨ Nuove Funzionalità
- Aggiunto sistema di aggiornamento automatico OTA
- Nuovo indicatore di stato aggiornamenti nell'header

### 🐛 Bug Fix
- Risolto problema con il filtro prezzi
- Corretta visualizzazione immagini prodotti

### 🔧 Miglioramenti
- Ottimizzate performance filtri con debouncing
- Migliorata gestione errori caricamento Excel
```

## 📦 Struttura File Generati

Dopo `npm run publish`, vengono generati:

```
dist/
├── Sabo Regalanalyse Setup 1.2.5.exe        # Windows installer
├── Sabo Regalanalyse-1.2.5.dmg              # macOS installer
├── Sabo-Regalanalyse-1.2.5.AppImage         # Linux installer
├── latest.yml                                # Metadata Windows
├── latest-mac.yml                            # Metadata macOS
└── latest-linux.yml                          # Metadata Linux
```

## 🔍 Debug e Troubleshooting

### Log di Aggiornamento

I log vengono salvati in:

**Windows**:
```
%USERPROFILE%\AppData\Roaming\Sabo Regalanalyse\logs\
```

**macOS**:
```
~/Library/Logs/Sabo Regalanalyse/
```

**Linux**:
```
~/.config/Sabo Regalanalyse/logs/
```

### Problemi Comuni

#### ❌ "No published versions on GitHub"

**Causa**: Nessuna release pubblicata su GitHub  
**Soluzione**: Pubblica almeno una release su GitHub

#### ❌ "Cannot download differentially"

**Causa**: Prima installazione o versione molto diversa  
**Soluzione**: Normale, verrà scaricato l'installer completo

#### ❌ "Error: HttpError: Not Found"

**Causa**: Token GitHub non valido o repository privato  
**Soluzione**: 
1. Verifica che il repo sia pubblico OPPURE
2. Usa un token con permessi corretti

## 🔐 Sicurezza

- Gli aggiornamenti vengono scaricati solo da GitHub Releases ufficiali
- L'app verifica la firma digitale degli aggiornamenti
- Gli utenti devono confermare l'installazione

## ⚙️ Configurazione Avanzata

### Disabilitare Aggiornamenti Automatici

In `main.js`, modifica:
```javascript
// Rimuovi o commenta questa sezione
// setTimeout(() => {
//   if (mainWindow && !mainWindow.isDestroyed()) {
//     autoUpdater.checkForUpdates()
//   }
// }, 3000)
```

### Modificare Intervallo di Controllo

Cambia il timeout (in millisecondi):
```javascript
setTimeout(() => {
  autoUpdater.checkForUpdates()
}, 3000) // 3 secondi -> modifica questo valore
```

### Download Automatico

In `main.js`, cambia:
```javascript
autoUpdater.autoDownload = true  // Cambia da false a true
```

## 📊 Monitoraggio

Puoi vedere quanti utenti hanno scaricato ogni versione:
https://github.com/Chipsfil/sabo_regalanalyse/releases

GitHub mostra automaticamente:
- Numero di download per ogni file
- Data di rilascio
- Dimensione file

## 🆘 Supporto

Per problemi o domande:
1. Controlla i log dell'applicazione
2. Verifica le release su GitHub
3. Controlla la console del browser (F12)

---

**Versione Documento**: 1.0  
**Ultima Modifica**: Febbraio 2026

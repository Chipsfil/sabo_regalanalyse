# 🚀 Comandi Rapidi - Sistema Aggiornamento OTA

## Primo Setup (SOLO UNA VOLTA)

### 1. Installa le nuove dipendenze
```bash
npm install
```

### 2. Configura Token GitHub

**Windows (PowerShell)** - Apri PowerShell e esegui:
```powershell
$env:GH_TOKEN="IL_TUO_TOKEN_GITHUB_QUI"
```

**Windows (CMD)** - Apri CMD e esegui:
```cmd
set GH_TOKEN=IL_TUO_TOKEN_GITHUB_QUI
```

**macOS/Linux** - Apri il terminale e esegui:
```bash
export GH_TOKEN=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
```

### Come Ottenere il Token GitHub:
1. Vai su https://github.com/settings/tokens
2. Clicca "Generate new token (classic)"
3. Seleziona lo scope `repo`
4. Copia il token generato

---

## Per Pubblicare un Aggiornamento

### Passo 1: Aggiorna la versione in package.json
```json
{
  "version": "1.2.5"  // <- Cambia questo numero
}
```

### Passo 2: Imposta il Token (se non già impostato in questa sessione)
```bash
# Vedi comandi sopra per il tuo sistema operativo
```

### Passo 3: Testa l'app localmente
```bash
npm start
```

### Passo 4: Pubblica su GitHub
```bash
npm run publish
```

**Questo comando:**
- ✅ Compila l'app per Windows, macOS e Linux
- ✅ Crea una release su GitHub (in modalità draft)
- ✅ Carica automaticamente tutti i file di installazione

### Passo 5: Pubblica la Release
1. Vai su https://github.com/Chipsfil/sabo_regalanalyse/releases
2. Troverai un "Draft" (bozza)
3. Clicca "Edit"
4. Aggiungi le note di rilascio (cosa è nuovo/corretto)
5. Clicca "Publish release"

✅ **FATTO!** Gli utenti riceveranno la notifica di aggiornamento all'avvio dell'app

---

## Test in Locale

### Avvia l'app in modalità sviluppo:
```bash
npm start
```

### Compila senza pubblicare:
```bash
npm run dist
```

I file compilati saranno in: `dist/`

---

## Verifica Sistema Aggiornamenti

Dopo aver pubblicato una release, apri l'app e verifica:

1. ✅ All'avvio viene mostrato "Controllo aggiornamenti..."
2. ✅ Dopo qualche secondo appare il bottone "Controlla Aggiornamenti"
3. ✅ Cliccando il bottone, l'app verifica nuove versioni
4. ✅ Se c'è un aggiornamento, appare "Scarica Aggiornamento"
5. ✅ Durante il download, viene mostrata la barra di progresso
6. ✅ Dopo il download, appare "Installa e Riavvia"

---

## Troubleshooting

### ❌ Errore: "GH_TOKEN is not set"
**Soluzione**: Imposta la variabile d'ambiente GH_TOKEN (vedi sopra)

### ❌ Errore: "Cannot find module electron-log"
**Soluzione**: 
```bash
npm install
```

### ❌ L'app non trova aggiornamenti
**Verifica**:
1. Hai pubblicato la release su GitHub? (non solo draft)
2. La versione su GitHub è superiore a quella installata?
3. Il repository è pubblico OPPURE hai impostato il token correttamente?

### 🔍 Controlla i Log
I log dell'updater sono salvati in:
- **Windows**: `%USERPROFILE%\AppData\Roaming\Sabo Regalanalyse\logs\`
- **macOS**: `~/Library/Logs/Sabo Regalanalyse/`
- **Linux**: `~/.config/Sabo Regalanalyse/logs/`

---

## 📚 Documentazione Completa

Per maggiori dettagli, vedi: `UPDATER_GUIDE.md`

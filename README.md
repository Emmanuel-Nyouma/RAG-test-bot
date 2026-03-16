# 🚀 NexGen AI - Premium Chatbot Interface

**NexGen AI** est une interface de chatbot moderne, élégante et performante conçue avec **React 19** et **Tailwind CSS**. Elle est optimisée pour offrir une expérience utilisateur fluide ("Premium") tout en étant connectée à des workflows d'IA puissants via des webhooks (n8n, LangChain, etc.).

![License](https://img.shields.io/badge/license-ISC-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

---

## ✨ Fonctionnalités

- 🎨 **Interface Ultra-Moderne** : Design sombre (Dark Mode) avec des effets de flou (Glassmorphism) et des animations fluides.
- 💬 **Gestion Multi-conversations** : Créez, renommez et supprimez plusieurs fils de discussion.
- 💾 **Persistance Locale** : Vos conversations sont sauvegardées automatiquement dans le `localStorage`.
- 🤖 **Intelligence RAG-Ready** : Connecté via Webhook à un moteur d'IA (actuellement configuré pour n8n).
- 📱 **Responsive Design** : Barre latérale rétractable et interface adaptée aux mobiles.
- 📄 **Support Markdown** : Rendu propre des blocs de code et du texte enrichi.
- 💎 **Expérience Premium** : Profil utilisateur avec indicateur de plan et interface épurée.

---

## 🛠️ Stack Technique

- **Frontend** : React 19, Vite
- **Styling** : Tailwind CSS 4.0
- **Icônes** : Lucide React
- **Rendu** : React Markdown
- **Intégration** : Webhook API (n8n)

---

## 🚀 Installation et Lancement

### 1. Cloner le projet
```bash
git clone https://github.com/Emmanuel-Nyouma/RAG-test-bot.git
cd RAG-test-bot
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer le Webhook
Ouvre le fichier `src/App.jsx` et remplace la variable `WEBHOOK_URL` par l'URL de ton propre workflow (n8n, Make, ou backend personnalisé) :

```javascript
const WEBHOOK_URL = 'TON_URL_WEBHOOK_ICI';
```

### 4. Lancer en mode développement
```bash
npm run dev
```
L'application sera disponible sur `http://localhost:5173`.

---

## 🧠 Configuration du Workflow (n8n)

Le chatbot envoie un objet JSON structuré comme suit :
```json
{
  "chatInput": "Le message de l'utilisateur",
  "sessionId": "session-unique-id",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

Pour une réponse optimale, votre workflow n8n doit retourner un objet contenant une clé `output`, `text` ou `message`.

---

## 📅 Roadmap

- [ ] Ajout de l'authentification (Firebase/Supabase).
- [ ] Upload de fichiers (PDF, Images) pour analyse.
- [ ] Export des conversations en PDF/Markdown.
- [ ] Mode vocal (Text-to-Speech & Speech-to-Text).

---

## 📄 Licence

Ce projet est sous licence **ISC**.

---
*Développé avec ❤️ par [Emmanuel Nyouma](https://github.com/Emmanuel-Nyouma)*

# EcoLuzApp

Aplicativo de monitoramento de consumo energético residencial utilizando Supabase e React Native com Expo.

## 🚀 Tecnologias utilizadas

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Supabase](https://supabase.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit)

## ⚙️ Requisitos

- Node.js >= 18.x
- Expo CLI (`npm install -g expo-cli`)
- Conta no [Supabase](https://supabase.com/)

## 🔧 Instalação

```bash
git clone https://github.com/seu-usuario/ecoluzapp.git
cd ecoluzapp
npm install
```

## 📦 Configuração

Crie um arquivo `.env` na raiz com o seguinte conteúdo:

```
SUPABASE_URL=https://<sua-instancia>.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
```

Certifique-se de que seu arquivo `app.config.js` esteja expondo as variáveis do `.env` corretamente:

```js
import 'dotenv/config';

export default {
  expo: {
    name: 'EcoLuzApp',
    slug: 'ecoluzapp',
    extra: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    },
  },
};
```

## ▶️ Executando

```bash
npx expo start --clear
```

## 📁 Estrutura de diretórios

```
src/
├── components/
├── hooks/
├── services/
│   └── supabaseClient.ts
└── styles/
```

---

Feito com 💡 por [Seu Nome]
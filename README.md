Telenet RakuRaku : project that is developed using React.js, that uses Next.js (https://nextjs.org/).

# Web Application for Admin

Web application for Admin, Organization Admin to handle

# Folder Structure

.  
├── public......................# Public contains icons, favicons, background images  
├── src.........................# Project's source code  
│ ├── app.....................# Routes with lading pages  
│ │ ├── contact  
│ │ │ └── page.js  
│ │ ├── emp  
│ │ │ └── page.js  
│ │ ├── forgot  
│ │ │ └── page.js  
│ │ ├── group  
│ │ │ └── page.js  
│ │ ├── help  
│ │ │ └── page.js  
│ │ ├── log  
│ │ │ └── page.js  
│ │ ├── login  
│ │ │ └── page.js  
│ │ ├── org  
│ │ │ └── page.js  
│ │ ├── reset  
│ │ │ └── page.js  
│ │ └── role  
│ │ └── page.js  
│ ├── components..............# Contains Components used the project  
│ ├── hooks...................# Helper react hooks  
│ ├── middleware..............# Contains redux saga config  
│ │ ├── features  
│ │ └── rootSaga.js  
│ ├── redux...................# Contains store, redux logics  
│ │ ├── features  
│ │ ├── hooks.js  
│ │ ├── provider.js  
│ │ ├── rootReduce  
│ │ └── store.js  
│ └── utils...................# Projects js lib  
├── .eslintrc.json..............# To define the configuration structure  
├── .gitignore..................# Specifies intentionally untracked files to ignore  
├── package.json................# npm uses to install dependencies, run scripts  
├── postcss.config.js...........# PostCSS is a tool for transforming styles with JSplugins
├── tailwind.config.............# configure the paths.
└── README.md

## Please follow the below steps

1. Clone the repository from git using the below command

```bash
git clone https://github.com/Nichi-In-Dev-Dept-1/telenet_ptalk_web_fe_admin_nextjs.git
```

2. Install packages from package.json

```bash
npm i
# or
npm install
```

If there is any obstruction in package installation, please check for Node version which supports Next.js.

## Development Mode

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with the browser to see the result.
If there is any obstruction in starting the node server, please check for Node version which supports Next.js.

## Production Mode

1. To generate the build run the below command

```bash
npm run build-export
```

2. Folder by name "out" will be created at the root level of the project directory.
3. Deploy the "out" folder as static export build in the server.

## Cypress Test

1. To Run the cypress

```bash
npm run cypress
```

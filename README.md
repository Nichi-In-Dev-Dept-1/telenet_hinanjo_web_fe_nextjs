# 避難所管理システム

It's a web application developed using Next.js to manage evacuation centers, featuring various roles such as Admin, Staff, User, and HQ-Staff, along with other associated responsibilities.

# ReactJS

React is an open-source JavaScript library used for building user interfaces and UI components. You can find its documentation at https://reactjs.org/.

# NextJS

Next.js is a popular open-source framework/extension built on top of React. It is used for building server-rendered React applications and static websites. For more information, you can refer to its documentation at https://nextjs.org/docs.

# Project Structure
    .
    ├── public                      # Public contains fonts, layout -> images, locales, themes
    ├── src                         # Project's source code  
    │ ├── components                # Components used in the project    
    │ ├── helper                    # Helper functions    
    │ ├── layout                    # Project layout with configuration    
    │ ├── middleware                # Contains redux saga config    
    │ └── pages                     # Contains all pages/file system routing information used in project   
    │  ├── _app.js                  # Entry point of the application   
    │  ├── document.js              # Document structure of the application / Contains -> Stylesheets, Fonts, Scripts, SEO, SSR, GSM   
    │  ├── _404.js                  # Not found  
    │  ├── _index.js                # Default route page of the application   
    │  ├── admin                    # Contains all admin related pages   
    │  ├── staff                    # Contains all staff related pages   
    │  └── user                     # Contains all user related pages 
    │ └── redux                     # Redux information & configuration  
    │  ├── auth                     # Contains authentication related redux logics
    │  ├── features                 # Contains features related redux logics  
    │  ├── hooks.js                 # Redux custom hooks
    │  ├── provider.js              # Redux provider  
    │  ├── redux-persist-config.js  # Redux persist
    │  ├── rootReducer.js           # Redux root reducer
    │  └── store.js                 # Redux store
    │ └── services                  # Global services  
    │  └── authn_authz.services.js  # Contains authentication & authorization related global services 
    │ └── styles                    # Project styles
    │  ├── components               # Components styles  
    │  ├── layout                   # Layout styles
    │  └── pages                    # Pages styles
    │ └── utils                     # Project utils/utilities information's
    │  ├── js                       # Global/Custom js files  
    │  ├── api.js                   # Global api/axios configuration
    │  └── constant.js              # Contains static/dummy content
    │ └── validation                # Project global validation
    │  └── validationPattern.js     # Contains validation patterns
    ├── .env.local                  # Project environment variables    
    ├── .env.local.example          # Example environment variables file   
    ├── .eslintrc.json              # Eslint configuration
    ├── .gitignore                  # Specifies intentionally untracked files to ignore    
    ├── next.config.js              # NextJS configuration file    
    ├── package.json                # Project dependenices & details file    
    ├── postcss.config.js           # PostCSS is a tool for transforming styles with JSplugins    
    └── README.md

## Please follow the below steps

1. Clone the repository from git using the below command

```bash
git clone https://github.com/Nichi-In-Dev-Dept-1/hitachi_fe.git
```

2. Copy .env.local.example -> .env.local & Update environments variables

3. Install packages from package.json

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
If there is any obstruction in starting the node server, please check for Node version which supports Next.js or port which application is  running.

## Production Mode

1. To generate the build run the below command

```bash
npm run build
```

2. Folder by name "out" will be created at the root level of the project directory.

3. Run "out" folder in local, Try

```bash
npx serve@latest out
```

4. Deploy the "out" folder as static export build in the server.

## Cypress Test

1. To Run the cypress

```bash
npm run cypress
```

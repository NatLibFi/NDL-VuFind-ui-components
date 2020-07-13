# Finna UI Component Library Proto
## Cloning the repository
```
git clone git@github.com:mikkojamG/ui-component-library-proto.git
```

## Installation

Running the script installs development dependencies, Pattern Lab and as a default creates symbolic link from the component library source to your working theme directory.

```
yarn
```

or

```
npm install
```

## Scripts

### Development

Start the development server with hot reloading

```
yarn dev
```

or

```
npm run dev
```

### Build theme
Create a distributable components from the source directory.

```
yarn build:theme
```

or

```
npm run build:theme
```

### Link theme
Create a symbolic links between distributable components and working theme directory.
```
yarn link:theme
```
or
```
npm run link:theme
```

### Copy theme
Alternative to linking theme, copy distributable components to working theme.
```
yarn copy:theme
```
or
```
npm run copy:theme
```

## engine-phtml
[https://github.com/aleksip/engine-phtml](https://github.com/aleksip/engine-phtml)

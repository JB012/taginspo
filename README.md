# TagInspo

TagInspo is an image gallery where users can attach custom tags to images for an easy search access.  

Get started: https://taginspo.com

## Installation
Install [ngrok](https://ngrok.com/download/windows)  

In a terminal, enter the following command:
```
ngrok http 3000
```
Open a new terminal and enter the commands below:
```
git clone https://github.com/JB012/taginspo.git
cd taginspo
npm run server
```
In another terminal, enter the following commands:
```
cd taginspo
npm run client
```
Then, click on the following link:
```
http://localhost:5173
```

## Background

The purpose of TagInspo is for users to organize and retrieve images through customizable tags, removing the need for folders. Users can find images based on searching
or clicking on the attached tag, which contains some sort of description. If a user wants to find images of natural scenery, they can attach
tags to the images such as "nature" or "landscape". The tag customization allows users such as designers and artists to speed up their workflows
for gathering and retrieving images, while adding on to their image references.

## Built With
- React
- TypeScript
- Express.js
- PostgreSQL
- TailwindCSS

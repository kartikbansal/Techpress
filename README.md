# Techpress
An online collaborative platform that allow users to share information and learn about varoius
computer languages and frameworks. It delivers content in the form of reviews written by the users only.  

## Pre-requisites

1. [MongoDB](https://www.mongodb.com/)
2. [Nodejs](https://nodejs.org/en/)

Note: Since you'll be running this app locally, therefore some data needs to be inserted in mongodb before running the app. In order to do that  

## To run:

Open your terminal and enter following commands

    git clone https://github.com/kartikbansal/Techpress.git
    cd Techpress
    npm install

**Note**: Since you'll be running this app locally, therefore some data needs to be inserted in mongodb before running the app. In order to do that open new terminal window enter the following commands

    mongo
    use techpress
    db.technologies.insert({image: "/images/NodejsImage.png", name: "NodeJs"})
    db.technologies.insert({image: "/images/AngularImage.png", name: "AngularJs"})
    db.technologies.insert({image: "/images/MeteorImage.png", name: "MeteorJs"})
    db.technologies.insert({image: "/images/ReactImage.png", name: "ReactJs"})
    db.technologies.insert({image: "/images/DjangoImage.png", name: "Django"})
    db.technologies.insert({image: "/images/SpringImage.png", name: "Spring"})
    db.technologies.insert({image: "/images/JSImage.png", name: "JavaScript"})
    db.technologies.insert({image: "/images/JavaImage.png", name: "Java"})
    db.technologies.insert({image: "/images/PythonImage.png", name: "Python"})
    db.technologies.insert({image: "/images/VueImage.png", name: "VueJs"})
    db.technologies.insert({image: "/images/CSharpImage.png", name: "C#"})
    db.technologies.insert({image: "/images/C++Image.png", name: "C++"})
    exit

Now to run the app go back to your previous terminal window and enter following command

    npm start

Now visit ```localhost:3000``` on your browser.

**Note:** Since this app is running locally, therefore there'll be no data. You have to register and enter the data by yourself. **Please add atleast one review/article at the beginning for proper functioning**  

**Disclaimer:** In order to add login/signup functoinality using facebook create your own application on facebook and then copy and paste the **app id** at **line 290** in the file ```angularApp.js``` which is located at ```/public/javascripts```. After that follow the steps below
+ In file ```/public/javascripts/angularApp.js``` uncomment all code from **line 288 to line 304**
+ In file ```/public/javascripts/services.js``` uncomment all code from **line 62 to line 80**

To make this site live on **aws** follow [this](https://scotch.io/tutorials/deploying-a-mean-app-to-amazon-ec2-part-1) tutorial step by step.

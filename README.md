# **Blog-for-friends**

## **App description:**

This is small blogging SPA app, where people can write their posts.
Each user can write, edit and delete posts, comment, like and upload images. 
There is a search by the number of views and by tags.
There is registration and authorization. Users can log in to have more options.

The frontend part is deployed on **vercel.com**, backend - **heroku.com**.

The application is based on **MERN stack**.
All user data is stored in the **MongoDB** database. It is managed through the **mongoose** library.
The frontend part is done using **React**, the backend - using **Node.js (Express.js)**.
The main UI part was made by using **materialUI** lib.

### **reg and auth page**

![Screenshot of the registration modal](/src/assets/screenshots/regpage.png)

All new users receive unique id using **_JWT_**, and the password is securely encrypted using the **_bcrypt_** library.
All actions that require user registration go through the verification of the user's token.
During authorization, the hashed user password is compared with the password in the database.
Each field has an easy validation check.

### **homepage**

![Screenshot of the main page](/src/assets/screenshots/homepage.png)

All user posts are rendered here.
Each post has a list of tags, the number of views, comments and likes.
Any post can be edited or deleted by a user who has access (**JWT** must be valid).
There are tabs for sorting posts (by number of views and date).
The most popular tags are placed to the right of the posts (selected from all existing tags). You can show posts with a specific tag.
There is a block of recent comments under the list of tags.
All post's data is stored in database and redux toolkit.
Uploaded images (avatars and pictures of posts) are uploaded to the Yandex Object Storage via API (**_aws-sdk_** and **_multer_** lib used) and stored there.

### **full post page**

![Screenshot of the product fullpost page](/src/assets/screenshots/fullpage.png)

By clicking on any post, you can get to its own page, where you can see the entire information - whole image, message's text and list of comments where you can write your own comment.
Only users with access can leave comments (**JWT** must be valid).

### **creating post page**

![Screenshot of the cart page](/src/assets/screenshots/addpostpage.png)

All registered users can create their own posts.
Each field has an easy validation check.

## **The following basic skills have been worked out:**

**Frontend**
1. Using React as frontend language;
2. Using the useState, useEffect, useRef and other hooks;
3. Using onClick and onSubmit events on elements;
4. Using conditional rendering with the ternary operator;
5. Working with props;
6. Using scss modules;
7. Using "axios" for page routing with endpoints, sorting and searching for items and data fetching;
8. Using "Redux Toolkit" for state management;
9. Using "materialUi" lib;
10. Making adaptations for different screen's sizes;
11. Using a <Skeleton/> components as a content loader;

**Backend**
1. Using Node.js (Express.js) as backend language;
2. Сreating routes for queries, models and controllers as well as middleware for validation and verification of user authorization;
3. Working with database "mongoDB" for storing web-site data;
4. Working with "JWT" lib;
5. Working with "multer" lib;
6. Working with "aws-sdk" lib for Yandex Object Storage API;

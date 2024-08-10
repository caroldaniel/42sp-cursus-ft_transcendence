<h1 align=center>
	<b>ft_transcendence</b>
</h1>

<h2 align=center>
	 <i>42cursus' project #14</i>
</h2>

<p align=center>
	Finally, the <strong>last</strong> 42cursus' common core project. The biggest one so far - and also the most challenging. The goal is to create a website that will allow users to play a game of Pong against each other. The project is divided into several parts, and each part has its own requirements. Now, let's gather everything we've learned so far and put it into practice. 


---
<div align=center>
<h2>
	Final score
</h2>
<img src="https://github.com/caroldaniel/caroldaniel-utils/blob/40915cb92b2edc1c3aafe46059398ac60b0d8b3c/ft_transcendence_grade.png" alt="cado-car's 42Project Score"/>
<h4>Completed + Bonus</h4>
<img src="https://github.com/caroldaniel/caroldaniel-utils/blob/40915cb92b2edc1c3aafe46059398ac60b0d8b3c/ft_transcendencem.png" alt="cado-car's 42Project Badge"/>
</div>

---

<h3 align=center>
Minimal requirements
</h3>
<h4 align=center> 
These requirements are mandatory and correspond to 30% of the final grade. The other 70% shall be composed by 7 major modules, as seen below.
</h4>

> <i> For the <b>mandatory</b> part, you must follow these rules: </i>
> - You are free to develop the site, with or without a backend. If you choose to include a backend, it must be written in pure Ruby. However, this requirement can be overridden by the **Framework module**. If your backend or framework uses a database, you must follow the constraints of the **Database module**.
> - The frontend should be developed using pure *vanilla Javascript*. However, this requirement can be altered through the **FrontEnd module**.
> - Your website must be a **single-page application**. The user should be able to use the Back and Forward buttons of the browser.
> - Your website must be compatible with the latest stable up-to-date version of **Google Chrome**.
> - The user should encounter no unhandled errors and no warnings when browsing the website.
> - Everything must be launched with a single command line to run an autonomous container provided by Docker. Example: `docker-compose up --build`
> - Users must have the ability to participate in a **live Pong game** against another player directly on the website. Both players will use the *same keyboard*. The **Remote players module** can enhance this functionality with remote players.
> - A player must be able to play against another player, but it should also be possible to propose a **tournament**.
> - A registration system is required: at the start of a tournament, each player must input their alias name. The aliases will be reset when a new tournament begins. However, this requirement can be modified using the **Standard User Management module**.
> - There must be a **matchmaking system**: the tournament system organize the matchmaking of the participants, and announce the next fight.
> - All players must adhere to the same rules, which includes having identical paddle speed.
> - The game itself must be developed in accordance with the default frontend constraints (as outlined above), or you may choose to utilize the **FrontEnd module**, or you have the option to override it with the **Graphics module**. While the visual aesthetics can vary, it must still capture the essence of the original Pong (1972).
> - Any password stored in your database, if applicable, must be **hashed**.
> - Your website must be **protected against SQL injections/XSS**.
> - If you have a backend or any other features, it is mandatory to enable an **HTTPS** connection for all aspects.
> - You must implement some form of **validation** for forms and any user input, either within the base page if no backend is used or on the server side if a backend is employed.

<h3 align=center>
Modules
</h3>
<h4 align=center> 
Each minor module correspond to 2 major modules.
</h4>

> **Web Modules**
> - **[Major module]** Use a Framework as backend - Django.
> - **[Minor module]** Use a front-end framework or toolkit - Bootstrap.
> - **[Minor module]** Use a database for the backend - PostgreSQL.

> **User Management Modules**
> - **[Major module]** Standard user management, authentication, users across tournaments.
> - **[Major module]** Implementing a remote authentication.

> **Gameplay and user experience Modules**
> - **[Major module]** Live chat.

> **Graphics Modules**
> - **[Major module]** Use of advanced 3D techniques - ThreeJS/WebGL.

> **Accessibility Modules**
> - **[Minor module]** Support on all devices.
> - **[Minor module]** Expanding Browser Compatibility.
> - **[Minor module]** Multiple language supports.
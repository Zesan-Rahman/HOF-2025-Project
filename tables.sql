create table logins(
    username VARCHAR(100),
    password VARCHAR(100) NOT NULL,
    PRIMARY KEY(username)
);

create table app_data(
    username VARCHAR(100),
    app_name VARCHAR(100),
    time_spent INT NOT NULL,
    PRIMARY KEY(app_name),
    FOREIGN KEY(username) references logins(username)
);

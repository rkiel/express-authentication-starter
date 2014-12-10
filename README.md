Inspired by Randall Degges presentation

"Everything You Ever Wanted to Know about Node Authentication in Node.js"

* [Youtube] (https://www.youtube.com/watch?v=FkPqcIJvEPk)
* [Speakerdeck] (https://speakerdeck.com/rdegges/everything-you-ever-wanted-to-know-about-authentication-in-node-dot-js)


Check in with mongodb

    mongo --host 192.168.33.30
    use testdb
    db.users.insert({email: 'r@kiel.com', password: 'bob'});
    db.users.find();

Sessions

    Cookies are just strings

    HTTP request -- body & headers

    headers is just key/value pairs

    {
      "User-Agent" : "curl/1.2.3",
      "Cookie" : "session=email@ah.com;"
    }

    Setting a cookie
    {
      "Set-Cookie" : "session=rkiel@pobox.com;"
    }



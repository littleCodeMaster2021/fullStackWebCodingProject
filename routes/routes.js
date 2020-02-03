/* eslint-disable no-unused-vars, no-useless-escape */
const express = require('express');

const router = express();
const path = require('path');
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const fileupload = require('express-fileupload');

router.use(fileupload());

const mongodb = require('mongodb');

const { MongoClient } = mongodb;


const cookieParser = require('cookie-parser');

router.use(cookieParser());

const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const cors = require('cors');

/* GET home page. */
router.get('/index', (req, res) => {
  if (req.session !== undefined && req.session.user !== undefined) {
    req.session.cookie.expires = false;
  } else {
    res.sendFile(path.join(__dirname, '../', 'views', 'homepage.html'));
  }
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'registration.html'));
});

router.get('/resetPassword', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'resetPassword.html'));
});

const checkToken = (req, res, next) => {
  const header = req.cookies.Authorization;
  // //console.log(header);

  if (typeof header !== 'undefined') {
    // const bearer = header.split(' ');
    // const token = bearer[1];
    //
    // //console.log(token === header);
    req.token = header.token;
    req.loginUser = header.username;
    next();
  } else if (typeof header === 'undefined') {
    // If header is undefined return Forbidden (403)
    res.sendStatus(403);
  }
};
/* eslint-disable callback-return */
/* eslint-disable require-jsdoc */
/* eslint-disable func-style */
/* eslint-disable consistent-return */
/* eslint-disable no-process-env */
/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */

async function validEmail(email) {
  const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  if (!client) { return; }

  try {
    const db = client.db('photoShare');
    const collection = db.collection('userInfo');
    const query = { email };
    const res = await collection.find(query).toArray();
    return res;
  } catch (e) {
    // //console.log(e);
  } finally {
    client.close();
  }
}

router.post('/register', async (req, res) => {
  /* Firstly, check the checkbox for privacy term. */
  // console.log(req.body);
  if (req.body.agreeTerm !== true) {
    res.status(403).json('Please consent to the privacy term firstly!');
    return;
  }
  /* GET information from the submitted form. */
  const { name } = req.body;
  const { email } = req.body;
  const password = req.body.pass;
  const { rePass } = req.body;
  // //console.log(`${name}  ${email}  ${password}`);

  if (name == null || email === null || password === null || rePass === null) {
    res.status(422).json('Please input all the information.');
    return;
  }

  if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(name))) {
    res.status(409).json('Please input the email of correct format');
    return;
  }

  if (email === null) {
    res.status(409).json('Please enter the required user name field ');
    return;
  }
  /**
     * Since we only allow 1 unique email to finish registration,
     * here we need to use do the validation operation firstly
     */
  const isValid = await validEmail(email);
  // console.log(isValid);
  if (isValid.length > 0) {
    res.status(409).json('This email has already registered, please check!');
    /* Directly exit the current function. */
    return;
  }

  if (password !== rePass) {
    res.status(401).json('Unauthorized user with wrong password!');
    return;
  }

  const data = {
    email,
    name,
    password,
    followed: [],
  };
  MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }, (err, db) => {
    if (err) {
      // //console.log('Unable to connect db');
      res.status(400).json({ error: err.message });
    } else {
      // //console.log('connection established');
      db.db('photoShare').collection('userInfo')
        . insertOne(data, (err, collection) => {
          if (err) {
            res.status(400).json({ error: err.message });
          } else {
            db.close();
          }
        });
    }
  });
  const imgData = {
    email,
    imageSrc: req.body.imageSrc,
    fullName: name,
  };
  MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }, (err, db) => {
    if (err) {
      // console.log('Unable to connect db');
      res.status(400).json({ error: err.message });
    } else {
      // console.log('connection established');
      db.db('photoShare').collection('userFile')
        . insertOne(imgData, (err, collection) => {
          if (err) { throw err; } else {
            // console.log('Record inserted Successfully');
          }
          db.close();
        });
    }
  });
  res.status(200).json('Succeed!');
});

async function validPassword(email, password) {
  const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  if (!client) { return; }

  try {
    const db = client.db('photoShare');
    const collection = db.collection('userInfo');
    const query = { email };
    const res = await collection.find(query).toArray();
    return res;
  } catch (e) {
    // console.log(e);
  } finally {
    client.close();
  }
}

router.get('/getPassword/:name', (req, res) => {
  try {
    MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }, (err, db) => {
      if (err) {
        // console.log('Unable to connect db');
        res.status(404).json({ error: err.message });
      } else {
        console.log('connection established');
        const data = db.db('photoShare').collection('userInfo');
        data.find({
          email: req.params.name,
        }).toArray((err, items) => {
          if (err) {
            res.status(404).json({ error: err.message });
          } else {
            // console.log(items);
            res.status(200).json(items);
            db.close();
          }
        });
      }
    });
  } catch (e) { // console.log(e);
  }
});

router.post('/signIn', async (req, res) => {
  const { userName } = req.body;
  const { password } = req.body;

  if (userName === null) {
    res.status(409).json('Please input the user name field');
    return;
  }

  const isValid = await validPassword(userName, password);
  // console.log(isValid[0].password + "  " + password);

  if (isValid.length === 0 || isValid[0].password !== password) {
    res.status(403).json('Password not match!');
  } else if (isValid[0].locked !== undefined || isValid[0].locked != null) {
    const time = new Date();
    const originTime = new Date(isValid[0].locked);

    // if (time < originTime + 30) {
    //   res.status(422).json('Account has been locked, please try after 30 minutes!');
    // }
    res.status(422).json('Account has been locked, please try after 30 minutes!');
  }

  if (req.session !== undefined) req.session.user = userName;
  const token = jwt.sign({
    name: userName,
  }, 'this_is_a_secret', { expiresIn: '1h' });
  res.cookie('Authorization', {
    token,
    username: req.body.userName,
  });
  res.send(token);
});

router.get('/signIn', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'homepage.html'));
});

router.get('/updateProfile', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'userUpdateInfo.html'));
});

router.get('/updateProfile/:email', checkToken, (req, res) => {
  const user = req.params.email;
  jwt.verify(req.token, 'this_is_a_secret', (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.email) {
      // console.log('Incorrect User');
      res.status(403).json('Incorrect User');
    } else if (req.loginUser === req.params.email) {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(404).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userFile');
            data.find({ email: user }).toArray((err, items) => {
              if (err) {
                res.status(404).json({ error: err.message });
              } else {
                res.status(200).json(items);
                db.close();
              }
            });
          }
        });
      } catch (e) {
        // console.log(e);
      }
    }
  });
});

router.post('/changePassword/:email', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', (err, authorizedData) => {
    if (err) {
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.email) {
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.email) {
      const user = req.params.email;
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            res.status(400).json({ error: err.message });
          } else {
            db.db('photoShare').collection('userInfo').updateOne(
              { email: user },
              { $set: { password: req.body.newPassword } },
              (err, post) => {
                if (err) {
                  res.status(404).send({ error: err.message });
                } else {
                  res.status(200).send('edit password');
                  db.close();
                }
              },
            );
          }
        });
      } catch (e) {
      // console.log(e);
      }
    }
  });
});

router.post('/changeUsername', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', (err, authorizedData) => {
    if (err) {
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.body.oldUserName) {
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.body.oldUserName) {
      const user = req.body.oldUserName;
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            res.status(400).json({ error: err.message });
          } else {
            db.db('photoShare').collection('userInfo').updateOne(
              { email: user },
              { $set: { email: req.body.newUsername } },
              (err, post) => {
                if (err) {
                  res.status(404).send({ error: err.message });
                } else {
                  res.status(200).send('edit user name');
                  db.close();
                }
              },
            );
            db.db('photoShare').collection('userFile').updateOne(
              { email: user },
              { $set: { email: req.body.newUsername } },
              (err, post) => {
                if (err) {
                  res.status(404).send({ error: err.message });
                } else {
                  res.status(200).send('edit user name');
                  db.close();
                }
              },
            );
          }
        });
      } catch (e) {
      // console.log(e);
      }
    }
  });
});

router.post('/updateProfile/:email', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.email) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.email) {
      /*
      Firstly, GET information from html page and temporarily store.
       */
      const fullName = req.body.userName;
      const birth = req.body.DateOfBirth;
      const gender = req.body.Gender;
      const marriage = req.body.marriageStatus;
      const country = req.body.selectedCountry;
      const { state } = req.body;
      const { area } = req.body;
      const { street } = req.body;
      const { phone } = req.body;
      const { email } = req.body;
      const { company } = req.body;
      const { college } = req.body;
      const { selfIntro } = req.body;
      const { imageSrc } = req.body;

      const data = {
        fullName,
        birth,
        gender,
        marriage,
        country,
        state,
        area,
        street,
        phone,
        email,
        company,
        college,
        selfIntro,
        imageSrc,
      };

      const user = req.params.email;
      // //console.log(data);
      /*
      If client update the phone number here, we need to update the
      log in information since we allow users to use
      either email or phone number to log in.
       */
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            res.status(400).json({ error: err.message });
          } else {
            /**
               * The mongodb rule for this operation is as the follow:
               db.products.update(
               { _id: 100 },
               { $set:
                  {
                      quantity: 500,
                      details: { model: "14Q3", make: "xyz" },
                      tags: [ "coats", "outerwear", "clothing" ]
                     }
               }) */
            db.db('photoShare').collection('userInfo')
              . updateOne(
                { email },
                { $set: { phoneNumber: phone } },
              );
            res.status(200).json('success');
            db.close();
          }
        });
      } catch (e) {
        // console.log(e);
      }

      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log('connection established');
            /* Delete the original record of the current users firstly. */
            db.db('photoShare').collection('userFile')
              . remove(
                { email: user },
              );
            /* Then insert into the updated information now! */
            db.db('photoShare').collection('userFile')
              . insertOne(data, (err, collection) => {
                if (err) { throw err; }
                // console.log('Record inserted Successfully');
                res.send();
                db.close();
                // //console.log(data);
              });
          }
        });
      } catch (e) {
        // console.log(e);
      }
    }
  });
});

/** =======================================================
 * delete picture
=========================================================== */

router.post('/deletePicture/:postid', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userPost');

            data.updateOne({ postid: req.params.postid },
              { $set: { image: '' } },
              (err, post) => {
                if (err) {
                  res.status(404).json({ error: err.message });
                } else {
                  res.status(200).json('Delete Succeed');
                  db.close();
                }
              });
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

/** =======================================================
 * Edit picture
=========================================================== */
router.post('/editImage/:postid', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else {
      // //console.log(req.params.postid);
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userPost');
            // console.log('new picture');
            // //console.log(req.body.imageSrcNew);
            if (req.body.imageSrcNew !== undefined) {
              // //console.log(req.body.imageSrcNew);
              data.updateOne({ postid: req.params.postid },
                { $set: { image: req.body.imageSrcNew } },
                (err, post) => {
                  if (err) {
                    res.status(404).send({ error: err.message });
                  } else {
                    res.status(200).send('edit picture');
                    // console.log('success in changing');
                    db.close();
                  }
                });
            }
          }
        });
      } catch (e) {
        // console.log(e);
      }
    }
  });
});

router.get('/signOut', checkToken, (req, res) => {
  // console.log(req.loginUser + "  " + req.query.user);
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.query.user) {
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.query.user) {
      req.session.destroy((err) => {});
      res.clearCookie('Authorization');
      res.status(200).json('Log out successfully');
    }
  });
});

router.get('/signIn/:user/lock', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.user) {
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.user) {
      // console.log('here');
      MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }, (err, db) => {
        if (err) {
          // console.log('Unable to connect db');
          res.status(404).json({ error: res.message });
        } else {
          // console.log('connection established');
          const data = db.db('photoShare').collection('userInfo');
          const time = new Date();
          // const timeStamp = 60 * 60 * time.getHours()
          //   + 60 * (time.getMinutes() + 30) + time.getSeconds();
          data.updateOne({ email: req.params.user }, { $set: { locked: time } });
        }
      });
    }
  });
});

router.get('/session/destroy', (req, res) => {
  if (req.session !== undefined) req.session.destroy();
  res.status(200).send('ok');
});

// Default response for any other request
router.use((_req, res) => {
  res.status(404);
});

module.exports = router;

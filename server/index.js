require('dotenv').config(); 
const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY; 
const port = 3001;

if (!SECRET_KEY) {1
  console.error('SECRET_KEY is not defined. Please set it in the .env file.');
  process.exit(1); // หยุดการทำงานของแอปหากไม่มี SECRET_KEY
}

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "honeypot"
})
db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['x-access-token'];
  if (authHeader) {
      jwt.verify(authHeader, SECRET_KEY, (err, user) => {
          if (err) {
              console.error('Token verification failed:', err);
              return res.sendStatus(403); // Forbidden
          }
          req.user = user;
          next();
      });
  } else {
      res.sendStatus(401); // Unauthorized
  }
};

app.get('/',(req,res) => {
  res.sendFile(__dirname + '/myWeb.html');
});

app.get('/user',authenticateJWT, (req, res) => {
  const id = req.query.id; 
  if (id !== undefined) {
    db.query("SELECT * FROM user WHERE id = ?", [id], (err, result) => { 
      if (err) {
        console.log(err);
        res.status(500).send('Error retrieving data');
      } else {
        res.send(result);
      }
    });
  } else {
    db.query("SELECT * FROM user", (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error retrieving data');
      } else {
        res.send(result);
      }
    });
  }
});

app.get('/line',authenticateJWT, (req, res) => {
  const {id} = req.query; 
  
  if(id !== undefined){
    db.query("SELECT * FROM line WHERE id = ?", [id], (err, result) => { 
      if (err) {
        console.log(err);
        res.status(500).send('Error retrieving data');
      } else {
        res.send(result);
      }
    });
  } else {
    db.query("SELECT * FROM line", (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error retrieving data');
      } else {
        res.send(result);
      }
    });
  }
});
app.get('/line/honeypot',authenticateJWT, (req, res) => {
  const {h_id} = req.query; 
  const sql = `SELECT l.id, l.name, l.image, l.profile, l.token, l.description 
    FROM line AS l
    INNER JOIN line_group AS g ON l.id = g.l_id 
    INNER JOIN honeypot AS h ON g.h_id = h.id 
    WHERE h.id = ?`;

  db.query(sql, [h_id], (err, result) => { 
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving data');
    } else {
      res.send(result);
    }
  });
});
app.get('/honeypot', authenticateJWT, (req, res) => {
  const id = req.query.id; 
  if (id !== undefined) {
    db.query("SELECT * FROM honeypot WHERE id = ?", [id], (err, result) => { 
      if (err) {
        console.log(err);
        res.status(500).send('Error retrieving data');
      } else {
        res.send(result);
      }
    });
  } else {
    db.query("SELECT * FROM honeypot", (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error retrieving data');
      } else {
        res.send(result);
      }
    });
  }
});

app.get('/logs',authenticateJWT, (req, res) => {
  const h_id = req.query.h_id; 
  if (h_id !== undefined) {
    db.query("SELECT * FROM log WHERE honeypot_id = ?", [h_id], (err, result) => { 
      if (err) {
        console.log(err);
        res.status(500).send('Error retrieving data');
      } else {
        res.send(result);
      }
    });
  } else {
    db.query("SELECT * FROM log", (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error retrieving data');
      } else {
        res.send(result);
      }
    });
  }
});

app.get('/port',authenticateJWT, (req, res) => {
  const id = req.query.id; 
  
  if (id !== undefined) {
    db.query("SELECT * FROM port WHERE honeypot_id = ?", [id], (err, result) => { 
      if (err) {
        console.log(err);
        res.status(500).send('Error retrieving data');
      } else {
        res.send(result);
      }
    });
  } else {
    db.query("SELECT * FROM port", (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error retrieving data');
      } else {
        res.send(result);
      }
    });
  }
});

app.post('/create',authenticateJWT, async (req, res) => {
  const { email, password, roleID, phone,description, profile, line_token } = req.body;

  if (!email || !password || !roleID || !phone) {
    return res.status(400).send('ต้องกรอกข้อมูลทุกช่อง');
  }

  try {
    // แฮชรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    const sqlInsert = 'INSERT INTO user (email, password, roleID, phone, description, profile, line_token) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sqlInsert, [email, hashedPassword, roleID, phone, description, profile, line_token], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Error inserting data');
      } else {
        console.log('Data inserted:', result);
        console.log(result);
        res.status(201).send('User created');
      }
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).send('Error hashing password');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // ตรวจสอบข้อมูลที่ส่งมา
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // ค้นหาผู้ใช้งานจากฐานข้อมูล
    const sqlSelect = 'SELECT * FROM user WHERE email = ?';
    db.query(sqlSelect, [email], async (err, results) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Error fetching user' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = results[0];

      // เปรียบเทียบรหัสผ่านที่ใส่เข้ามากับรหัสผ่านที่ถูกเข้ารหัสไว้ในฐานข้อมูล
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        // สร้าง JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1d' });

        // ส่งข้อมูลผลลัพธ์รวมทั้ง token
        res.json({
          result: "success",
          token: token,
          user: {
            id: user.id,
            email: user.email,
            password: user.password,
            roleID: user.roleID,
            phone: user.phone,
            description: user.description,
            profile: user.profile,
            line_token: user.line_token
          }
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login error' });
  }
});


app.put('/update',authenticateJWT, async (req,res) =>{
  const {id, email, password, roleID, phone, description, profile, line_token } = req.body;


  let hashedPassword = password;
  
  if (!password.startsWith('$')) {
    hashedPassword = await bcrypt.hash(password, 10);
  } 
  const sqlupdate ="UPDATE user SET email = ?, password = ?, roleID = ?, phone = ?, description = ?, profile = ?, line_token = ? WHERE id = ?";
  db.query(sqlupdate, [email, hashedPassword, roleID, phone, description, profile, line_token, id], (err, result) =>{
    if(err){
      console.log(err);
    }else{
      res.send(result);
    }
  });
});

app.put('/line/update',authenticateJWT, async (req,res) =>{
  const {id, name, description, profile, image ,token} = req.body;
  
  const sqlupdate ="UPDATE line SET name = ?, description = ?, profile = ?, image = ?, token = ? WHERE id = ?";
  db.query(sqlupdate, [name, description, profile, image, token, id], (err, result) =>{
    if(err){
      console.log(err);
    }else{
      res.send(result);
      
    }
  });
});
app.post('/line/newGroup', authenticateJWT, async (req, res) => {
  const { h_id } = req.body;
  
  if (!h_id) {
    return res.status(400).send('ไม่พบ Honeypot Node');  // Respond with an error if h_id is not provided.
  }
  
  try {
    const sql = 'INSERT INTO `line`(`name`, `image`, `token`, `description`, `profile`) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, ['', '', '', '', ''], (err, result) => {
      if(err){
        console.log(err);
      }else{
        // Get the ID of the newly inserted row
        const newId = result.insertId;
        
        // Insert the newId and h_id into the `groub` table
        const sqlGroup = 'INSERT INTO line_group (l_id, h_id) VALUES (?, ?)';
        db.query(sqlGroup, [newId, h_id], (err, result) => {
          if (err) {
            console.log(err);
          }else {
            console.log('Data inserted into Group');
            res.status(201).send('newGroup created');
          }
        });
        
      }
      
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return res.status(500).send('Server error');  // Send server error response
  }

  // try {
  //   const sqlInsert = 'INSERT INTO groub (h_id) VALUES (?)';
    
  //   db.query(sqlInsert, [h_id], (err, result) => {
  //     if (err) {
  //       console.error('Error inserting data:', err);
  //       return res.status(500).send('Error inserting data');  // Send error response and exit
  //     } else {
  //       console.log('Data inserted:', result);
  //       return res.status(201).send('newGroub created');  // Send success response and exit
  //     }
  //   });
  // } catch (error) {
  //   console.error('Error creating group:', error);
  //   return res.status(500).send('Server error');  // Send server error response
  // }
});
app.delete('/line/delete', authenticateJWT, (req, res) => {
  const { id } = req.query; 

  const sql = `DELETE FROM line WHERE id = ? `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      return res.status(500).send({ error: 'Failed to delete data' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ error: 'No records found with the specified id' });
    }

    res.status(200).send({ message: "Success" });
  });
});


app.delete('/delete/user', authenticateJWT, (req, res) => {
  const userId = req.query.id;

  console.log(userId);
  db.query("DELETE FROM user WHERE id = ?",[userId],(err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error deleting user');
    } else {
      res.send('User deleted successfully');
    }
  });
});
app.delete('/delete/log',authenticateJWT, (req, res) => {
  const {id , h_id} = req.query; 
  console.log(id , h_id);
  
  if (id !== undefined) {
    db.query("DELETE FROM log WHERE id = ?", [id], (err, result) => { 
      if (err) {
        console.error(err);
        res.status(500).send('Error deleting log');
      } else {
        res.send('log deleted successfully');
      }
    });
  } else if (h_id) {
    db.query("DELETE FROM log WHERE honeypot_id = ?", [h_id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error deleting log');
      } else {
        res.send('log deleted successfully');
      }
    });
  }
});
app.delete('/delete/honeypot', authenticateJWT, (req, res) => {
  const id = req.query.id;
  console.log("id:   ",id);
  
  db.query('DELETE FROM honeypot WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error executing DELETE FROM honeypot: ' + err.message });
    }
    res.status(200).json({ message: 'deleted successfully.' });
  });
});

app.get('/permission',authenticateJWT, (req, res) => {
  const id = req.query.id;
  const sql = `SELECT p.id,u.id AS user_id,u.profile as profile, u.email, h.id AS h_id 
    FROM user AS u 
    INNER JOIN permission AS p ON u.id = p.u_id 
    INNER JOIN honeypot AS h ON p.h_id = h.id 
    WHERE h.id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving data');
    } else {
      res.send(result);
    }
  });
});

app.post('/permission',authenticateJWT, (req, res) => {
  const { u_id, h_id } = req.body;
  const sql = `
      INSERT INTO permission (u_id, h_id) 
      VALUES (?, ?)
  `;

  db.query(sql, [u_id, h_id], (err, result) => {
      if (err) {
          console.error('Error inserting data:', err);
          res.status(500).send('Failed to insert data');
          return;
      }
      res.status(200).send({ message: "Success" });
  });
});

app.delete('/permission/delete', authenticateJWT, (req, res) => {
  const { h_id , u_id} = req.query; 

  if (!h_id) {
    return res.status(400).send({ error: "h_id is required" });
  }
  if (!u_id) {
    return res.status(400).send({ error: "u_id is required" });
  }

  const sql = `DELETE FROM permission WHERE u_id = ? AND h_id = ?`;

  db.query(sql, [u_id, h_id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      return res.status(500).send({ error: 'Failed to delete data' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ error: 'No records found with the specified h_id' });
    }

    res.status(200).send({ message: "Success" });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
  
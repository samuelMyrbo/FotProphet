const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;









/**
 * 
 * Check Login
*/
const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;

  if(!token) {
    return res.status(401).json( { message: 'Unauthorized'} );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch(error) {
    res.status(401).json( { message: 'Unauthorized'} );
  }
}










/**
 * GET /
 * Admin - Login Page
*/
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});












/**
 * GET /
 * Admin - Login Page
*/
router.get('/register', async (req, res) => {
  try {
    const locals = {
      title: "Register",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    res.render('admin/register', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});











/**
 * POST /
 * Admin - Check Login
*/

var currentUsername = ""

router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne( { username } );

    if(!user) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }


    const token = jwt.sign({ userId: user._id, username: user.username}, jwtSecret );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
});












/**
 * GET /
 * Admin Dashboard
*/
router.get('/dashboard', authMiddleware, async (req, res) => {

  

console.log('hello')
  try {

    
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
      username: req.username
    }

    console.log(req.username)

    const data = await Post.find();
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});









/**
 * GET /
 * Admin - Create New Post
*/
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find();
    res.render('admin/add-post', {
      locals,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});












/**
 * POST /
 * Admin - Create New Post
*/
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body
      });

      await Post.create(newPost);

      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }

  } catch (error) {
    console.log(error);
  }

});













/**
 * GET /
 * Admin - Create New Post
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Edit Post",
      description: "Free NodeJs User Management System",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout
    })

  } catch (error) {
    console.log(error);
  }

});














/**
 * PUT /
 * Admin - Create New Post
*/
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect(`/edit-post/${req.params.id}`);

  } catch (error) {
    console.log(error);
  }

});









// router.post('/admin', async (req, res) => {
//   try {
//     const { username, password } = req.body;
    
//     if(req.body.username === 'admin' && req.body.password === 'password') {
//       res.send('You are logged in.')
//     } else {
//       res.send('Wrong username or password');
//     }

//   } catch (error) {
//     console.log(error);
//   }
// });











/**
 * POST /
 * Admin - Register
*/
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password:hashedPassword });
      res.status(201).json({ message: 'User Created', user });
    } catch (error) {
      if(error.code === 11000) {
        res.status(409).json({ message: 'User already in use'});
      }
      res.status(500).json({ message: 'Internal server error'})
    }

  } catch (error) {
    console.log(error);
  }
});








/**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

  try {
    await Post.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }

});










/**
 * GET /
 * Admin Logout
*/
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/register');
});









// Route to submit predictions
router.post('/submit-predictions', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Parse predictions from the form data

    // MÅ OPPDATERE DATA HERIFRA PÅ HVER KAMP I TABLE
    const predictions = [];
    const matchData = [
      { home: 'Tottenham', away: 'Arsenal' },
      { home: 'Newcastle', away: 'Brighton' },
      { home: 'Chelsea', away: 'Norwich' }

    ];

    matchData.forEach(match => {
      const homeScore = req.body[`${match.home}_H`];
      const awayScore = req.body[`${match.away}_A`];

      if (homeScore !== undefined && awayScore !== undefined) {
        const matchId = `${match.home}_vs_${match.away}`;
        predictions.push({
          matchId: matchId,
          predictedScore: `${homeScore}-${awayScore}`
        });
      }
    });

    // Overwrite the user's predictions with the new ones
    user.predictions = predictions;

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: 'Predictions submitted successfully', user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});







router.post('/add-player', authMiddleware, async (req, res) => {
  try {
    const { position, name, team, points, price, username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if adding this player would exceed the maximum squad size
    if (user.fullSquad.length >= 15) {
      return res.status(400).json({ message: 'Maximum squad size (15 players) reached' });
    }

    // Check if adding this player would exceed the maximum allowed for their position
    const positionCounts = {
      'GK': 0,
      'DEF': 0,
      'MID': 0,
      'ATT': 0
    };

    user.fullSquad.forEach(player => {
      if (player.position in positionCounts) {
        positionCounts[player.position]++;
      }
    });

    // Check if adding the new player would exceed the position limits
    switch (position) {
      case 'GK':
        if (positionCounts['GK'] >= 2) {
          return res.status(400).json({ message: 'Maximum number of goalkeepers (GK) reached' });
        }
        break;
      case 'DEF':
        if (positionCounts['DEF'] >= 5) {
          return res.status(400).json({ message: 'Maximum number of defenders (DEF) reached' });
        }
        break;
      case 'MID':
        if (positionCounts['MID'] >= 5) {
          return res.status(400).json({ message: 'Maximum number of midfielders (MID) reached' });
        }
        break;
      case 'ATT':
        if (positionCounts['ATT'] >= 3) {
          return res.status(400).json({ message: 'Maximum number of attackers (ATT) reached' });
        }
        break;
    }

    // Check if a player with the same name already exists in the user's team
    const playerExists = user.fullSquad.some(player => player.name === name);
    if (playerExists) {
      return res.status(400).json({ message: 'Player with the same name already exists in the team' });
    }

    const newPlayer = {
      position: position,
      name: name,
      team: team,
      points: points,
      price: price
    };

    user.fullSquad.push(newPlayer);
    await user.save();

    res.status(200).json({ message: 'Player added successfully', player: newPlayer });
  } catch (error) {
    console.error('Error details:', error); // Log the error details
    res.status(500).json({ error: 'An error occurred' });
  }
});




router.get('/adminPredictor',authMiddleware,(req,res) => {
  const locals = {
    username: req.username,
    layout: adminLayout
  }
  res.render("admin/adminPredictor",locals);
});


router.get('/adminHome',authMiddleware,(req,res) => {
  const locals = {
    username: req.username,
    layout: adminLayout
  }
  res.render("admin/adminHome",locals);
});


router.get('/adminEuromanager',authMiddleware,async(req,res) => {
  try {
    const users = await User.find({}).lean(); // Fetch all users and their players
    let players = [];

    // Aggregate players from all users
    users.forEach(user => {
      if (user.fullSquad && user.fullSquad.length > 0) {
        players = players.concat(user.fullSquad);
      }
    });

    const locals = {
      username: req.username,
      layout: adminLayout,
      players:players,
    }

    res.render("admin/adminEuromanager", locals); // Pass players to the view
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});



router.get('/adminIndex',authMiddleware,(req,res) => {
  const locals = {
    username: req.username,
    layout: adminLayout
  }
  res.render("admin/adminIndex",locals);
});




router.get('/adminPoints',authMiddleware,async (req,res) => {
  const locals = {
    username: req.username,
    layout: adminLayout
  }
  try {
    const users = await User.find({}).lean(); // Fetch all users and their players
    let players = [];

    // Aggregate players from all users
    users.forEach(user => {
      if (user.fullSquad && user.fullSquad.length > 0) {
        players = players.concat(user.fullSquad);
      }
    });

    res.render("admin/adminPoints", { players }); // Pass players to the view
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});





router.get('/adminStandings',authMiddleware,(req,res) => {
  const locals = {
    username: req.username,
    layout: adminLayout
  }
  res.render("admin/adminStandings",locals);
});

router.get('/adminStandingsPredictor',authMiddleware,(req,res) => {
  const locals = {
    username: req.username,
    layout: adminLayout
  }
  res.render("admin/adminStandingsPredictor",locals);
});




router.get('/adminTransfers',authMiddleware,async (req,res) => {
  
  try {
    const users = await User.find({}).lean(); // Fetch all users and their players
    let players = [];

    // Aggregate players from all users
    users.forEach(user => {
      if (user.fullSquad && user.fullSquad.length > 0) {
        players = players.concat(user.fullSquad);
      }
    });

    const locals = {
      username: req.username,
      layout: adminLayout,
      players:players,
    }

    res.render("admin/adminTransfers", locals); // Pass players to the view
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});





router.get('/adminHistory',authMiddleware,(req,res) => {
  const locals = {
    username: req.username,
    layout: adminLayout
  }
  res.render("admin/adminHistory",locals);
});







module.exports = router;
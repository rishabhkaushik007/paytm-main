const express = require("express");
const zod = require("zod");
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } =require("../config");
const router = express.Router();
const { authMiddleware } = require("../middleware")

const signupBody = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

router.post("/signup" , async(req, res) => {
    try{
        const { success } = signupBody.safeParse(req.body);
    if(!success) {
        return res.status(411).json({message: "Email already taken / Incorrect inputs"});
    }
    const existingUser = await User.findOne({
        username: req.body.username
    })
    if(existingUser) {
        return res.status(411).json({ message: "Email already taken/ Incorrect inputs"})
    }
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    })
    const userid = user._id;

    await Account.create({
        userid, 
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({userid}, JWT_SECRET);

    res.status(200).json({
        message: "User created successfully",
        token: token
    });
    }
    catch(err) {
        return res.status(500).json({message:"Internal Server Issue"})
    }
})

const signinBody = zod.object({
    username: zod.string(),
    password: zod.string()
})

router.post("/signin", async (req,res) => {
    try{
            const { success } = signinBody.safeParse(req.body);
        if(!success) {
            return res.status(411).json({message: "Error while signing in"});
        }
        const user = await User.findOne({
            username: req.body.username,
            password: req.body.password
        })
        if(user) {
            const token = jwt.sign({userid: user._id}, JWT_SECRET);
            res.status(200).json({token: token});
            return;
        }
        res.status(411).json({message: "Error while logging in"})
    }
    catch(err) {
        return res.status(500).json({message: "Internal Server Issue"})
    }
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.put("/", authMiddleware , async (req, res) => {
    const { success } = zod.safeParse(req.body);
    if(!success) {
        return res.status(411).json({message: "Error while updating information"})
    }
    await User.updateOne(req.body, {
        id: req.userid
    })
    res.status(200).json({message: "Updated Successfully"});
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;
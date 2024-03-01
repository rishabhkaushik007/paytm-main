const express = require("express");
const { authMiddleware } = require("../middleware");
const router = express.Router();
const { default: mongoose } = require("mongoose");
const { Account } = require("../db");

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
});

router.post("/transfer", authMiddleware , async (req, res) => {
    try{
        const session = await mongoose.startSession();
        session.startTransaction();
        const { amount, to } = req.body;

        const account = await Account.findOne({userid: req.userid}).session(session);

        if(!account || account.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({message:"Insufficient balance"})
        }

        const toAccount = await Account.findOne({userid: to}).session(session);

        if(!toAccount) {
            await session.abortTransaction();
            return res.status(400).json({message: "Invalid Account"});
        }

        await Account.updateOne({userid: req.userid}, {$inc: {balance: -amount}}).session(session);
        await Account.updateOne({userid: to}, {$inc: {balance: amount}}).session(session);

        await session.commitTransaction();
        res.status(200).json({message: "Transfer Successful"});
    }
    catch(err) {
        res.status(500).json({message: "Internal Server Issue"});
    }    
})

module.exports = router;


    

    
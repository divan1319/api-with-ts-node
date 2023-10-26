import express,{ Request,Response } from "express";
import {UnitUser,User} from "./user.interface"
import { StatusCodes } from "http-status-codes";
import * as db from "./user.database"

export const userRouter = express.Router()

userRouter.get("/users", async (req: Request, res: Response) =>{
    try {
        const allUsers: UnitUser[] = await db.findAll()
        
        if(!allUsers) return res.status(StatusCodes.NOT_FOUND).json({msg:'Aun no hay usuarios'})

        return res.status(StatusCodes.OK).json({total_user: allUsers.length, allUsers})

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

userRouter.get("/user/:id",async (req: Request, res: Response)=>{
    try {
        const user:UnitUser = await db.findOne(req.params.id)
        if(!user) return res.status(StatusCodes.NOT_FOUND).json({msg:'Usuario no encontrado'})

        return res.status(StatusCodes.OK).json({user})
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

userRouter.post("/register",async (req: Request, res: Response)=>{
    try {
        const { username, email, password } = req.body
        
        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : `Please provide all the required parameters..`})
        }

        const user = await db.findByEmail(email) 

        if (user) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : `This email has already been registered..`})
        }

        const newUser = await db.create(req.body)

        return res.status(StatusCodes.CREATED).json({newUser})

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

userRouter.post("/login", async (req : Request, res : Response) => {
    try {
        const {email, password} = req.body
        
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : "Please provide all the required parameters.."})
        }

        const user = await db.findByEmail(email)

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({error : "No user exists with the email provided.."})
        }

        const comparePassword = await db.comparePassword(email, password)

        if (!comparePassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({error : `Incorrect Password!`})
        }

        return res.status(StatusCodes.OK).json({user})

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

userRouter.put('/user/:id', async (req : Request, res : Response) => {

    try {

        const {username, email, password} = req.body

        const getUser = await db.findOne(req.params.id)
        console.log(email)
        if (!username || !email ) {
            return res.status(401).json({error : `Please provide all the required parameters..`})
        }

        if (!getUser) {
            return res.status(404).json({error : `No user with id ${req.params.id}`})
        }

        const updateUser = await db.update(req.params.id, req.body)

        return res.status(201).json({updateUser})
    } catch (error) {
        console.log(error) 
        return res.status(500).json({error})
    }
})

userRouter.delete("/user/:id", async (req : Request, res : Response) => {
    try {
        const id = (req.params.id)

        const user = await db.findOne(id)

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({error : `User does not exist`})
        }

        await db.remove(id)

        return res.status(StatusCodes.OK).json({msg : "User deleted"})
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error})
    }
})

import {User,UnitUser,Users} from "./user.interface"
import bycrypt from "bcryptjs"
import {v4 as random} from "uuid"
import fs from "fs"

let users: Users = loadUsers()

function loadUsers():Users{
    try {
         const data = fs.readFileSync("./users.json","utf8")
         return JSON.parse(data)
    } catch (error) {
        console.log(error)
        return {}
    }
}

function saveUsers(){
    try {
        fs.writeFileSync("./users.json",JSON.stringify(users),"utf8")
        console.log('Usuario registrado')
    } catch (error) {
        console.log(`Error : ${error}`)
    }
}

export const findAll = async () : Promise<UnitUser[]> => Object.values(users)
export const findOne = async (id:string) : Promise<UnitUser> => users[id]

export const create = async (userData:UnitUser): Promise<UnitUser | null> => {
    
    let id  = random()
    let check_user = await findOne(id)

    while(check_user){
        id= random()
        check_user = await findOne(id)
    }

    const salt = await bycrypt.genSalt(10)
    const hashedPassword = await bycrypt.hash(userData.password,salt)

    const user : UnitUser = {
        id:id,
        username:userData.username,
        email:userData.email,
        password:hashedPassword
    }

    users[id] = user

    saveUsers()

    return user;
}

export const findByEmail = async(user_email:string): Promise<null| UnitUser> =>{

    const allUsers = await findAll()
    const getUser = allUsers.find(res=> user_email == res.email)

    if(!getUser){
        return null
    }

    return getUser
}

export const comparePassword =async (email:string,supplied_pass:string): Promise<null | UnitUser> => {
    
    const user = await findByEmail(email)

    const decryptPassword = await bycrypt.compare(supplied_pass,user!.password)

    if(!decryptPassword) return null

    return user
}

export const update = async (id:string,updateValues:User): Promise<UnitUser | null> => {

    const userExist = await findOne(id)

    if(!userExist) return null

    if(updateValues.password){
        const salt = await bycrypt.genSalt(10)
        const newPass = await bycrypt.hash(updateValues.password,salt)
        updateValues.password = newPass
    }

    users[id] = {
        ...userExist,
        ...updateValues
    }

    saveUsers()

    return users[id]
}

export const remove =async (id:string): Promise<null|void> => {
    const user = await findOne(id)

    if(!user) return null

    delete users[id]

    saveUsers()
}
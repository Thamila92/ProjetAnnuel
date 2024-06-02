import { compare, hash } from "bcrypt";
import express, { Request, Response } from "express";
import { AppDataSource } from "../database/database";
import { createOtherValidation,listUsersValidation, loginOtherValidation, updateUserValidation, userIdValidation } from "./validators/user-validator";
import { generateValidationErrorMessage } from "./validators/generate-validation-message";
import { User } from "../database/entities/user";
import { Status } from "../database/entities/status";
import { createStatusValidation } from "./validators/status-validator";
import { sign } from "jsonwebtoken";
import { Token } from "../database/entities/token";
import { createAdminValidation } from "./validators/user-validator";
import { UserUsecase } from "../domain/user-usecase";
import { normalMiddleware } from "./middleware/normal-middleware";
import { adminMiddleware } from "./middleware/admin-middleware";
import { authMiddleware } from "./middleware/combMiddleware";
import { Donation } from "../database/entities/donation";
import { benefactorMiddleware } from "./middleware/benefactor-middleware";
import { createDonationValidation } from "./validators/donation-validator";
import { Expenditures } from "../database/entities/expenditure";
import { ExpenditureUsecase } from "../domain/expenditure-usecase";
import { listExpendituresValidation } from "./validators/expenditure-validator";
const paypal =require("./paypal")
// const open = require('open');






export const initRoutes = (app: express.Express) => { 
    //la route utilisee pour creer les statuts est bloquee volontairement

    // app.post('/status',async(req:Request,res: Response)=>{
    //     try {
    //         const validationResult = createStatusValidation.validate(req.body)
    //         if (validationResult.error) {
    //             res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
    //             return
    //         }
    //         const createStatusRequest = validationResult.value
    //         const statusRepository = AppDataSource.getRepository(Status)
    //         if(createStatusRequest.key){
    //             const key = await hash(createStatusRequest.key, 10);

    //             const status = await statusRepository.save({
    //                 description:createStatusRequest.description,
    //                 key:key
    //             });
    //             res.status(201).json(status)  
    //         }else{
    //             const keyy="No key"
    //             const key = await hash(keyy, 10);

    //             const status = await statusRepository.save({
    //                 description:createStatusRequest.description,
    //                 key:key
    //             }); 
    //             res.status(201).json(status) 
    //         }
    //         return
    //     } catch (error) { 
    //         console.log(error) 
    //         res.status(500).json({ "error": "internal error retry later" }) 
    //         return
    //     }  
    // })



    

    /*
    Listing de tous les utilisateurs, on peut passer le type d'utilisateur qu'on veut avoir en Query Param
    */
    app.get('/users',authMiddleware,async(req: Request, res: Response)=>{
        const validation = listUsersValidation.validate(req.query)

        if (validation.error) {
            res.status(400).json(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listUserRequest = validation.value
        let limit = 10
        if (listUserRequest.limit) {
            limit = listUserRequest.limit
        }

        let type=""
        if (listUserRequest.type) {
            type = listUserRequest.type
        }

        const page = listUserRequest.page ?? 1

        try {
            const userUsecase = new UserUsecase(AppDataSource);
            const listusers = await userUsecase.listUser({ ...listUserRequest, page, limit , type })
            res.status(200).json(listusers)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })

    //Listing des infos du profil d'un utilisateur quelconque
    app.get("/users/:id",authMiddleware,async (req: Request, res: Response) => {
        try {
            const validationResult = userIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const userId = validationResult.value

            const userRepository = AppDataSource.getRepository(User)
            const user = await userRepository.findOneBy({ id: userId.id , isDeleted: false})
            if (user === null) {
                res.status(404).json({ "error": `user ${userId.id} not found` })
                return
            }
            res.status(200).json(user)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })




    app.post('/expenditure',adminMiddleware,async (req: Request, res: Response) => {
        try{
            const validationResult = createDonationValidation.validate(req.body)
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const createDonationRequest = validationResult.value

            const authHeader = req.headers['authorization'];
            if (!authHeader) return res.status(401).json({ "error": "Unauthorized" });

            const token = authHeader.split(' ')[1];
            if (token === null) return res.status(401).json({ "error": "Unauthorized" });

            const tokenRepo = AppDataSource.getRepository(Token);
            const tokenFound = await tokenRepo.findOne({ where: { token }, relations: ['user'] });

            if (!tokenFound) {
                return res.status(403).json({ "error": "Access Forbidden" });
            }

            if (!tokenFound.user) {
                return res.status(500).json({ "error": "Internal server error u"});
            }

            const userRepo = AppDataSource.getRepository(User);
            const userFound = await userRepo.findOne({ where: { id:tokenFound.user.id }});

            if (!userFound) {
                return res.status(500).json({ "error": "Internal server error stat "});
            }

            const expenditureRepository = AppDataSource.getRepository(Expenditures);
            const newExpenditure = expenditureRepository.create({
                amount:createDonationRequest.amount,
                user:userFound,
                description:createDonationRequest.description
            });

            await expenditureRepository.save(newExpenditure);

            // const url=await paypal.createPayout(createDonationRequest.amount,'EUR')
            // console.log(url)
            // res.redirect(url)
            // res.status(200).json({ ...url });
            if(await paypal.createPayout(createDonationRequest.amount,'EUR')){
                res.status(200).json({
                    message: "Expenditure successfully registered and the amount of "+createDonationRequest.amount+"€ has been transfered",
                    CheckThemAllHere: "http:localhost:3000/expenditures"
                })
            }
            // await open(url);
        }catch(error){
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })

    app.get('/expenditures',adminMiddleware,async(req: Request, res: Response)=>{
        const validation = listExpendituresValidation.validate(req.query)

        if (validation.error) {
            res.status(400).json(generateValidationErrorMessage(validation.error.details))
            return
        }

        const listExpenditureRequest = validation.value
        let limit = 10
        if (listExpenditureRequest.limit) {
            limit = listExpenditureRequest.limit
        }

        let id=0
        if (listExpenditureRequest.id) {
            id = listExpenditureRequest.id
        }

        const page = listExpenditureRequest.page ?? 1

        try {
            const expenditureUsecase = new ExpenditureUsecase(AppDataSource);
            const listusers = await expenditureUsecase.listExpenditure({ ...listExpenditureRequest, page, limit , id })
            res.status(200).json(listusers)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })

    app.get("/expenditures/:id",adminMiddleware,async (req: Request, res: Response) => {
        try {
            const validationResult = userIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const expenditureId = validationResult.value

            const userRepository = AppDataSource.getRepository(Expenditures)
            const user = await userRepository.findOneBy({ id: expenditureId.id})
            if (user === null) {
                res.status(404).json({ "error": `Expenditure ${expenditureId.id} not found` })
                return
            }
            res.status(200).json(user)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })




    app.post('/Donation',benefactorMiddleware,async (req: Request, res: Response) => {
        try{
            const validationResult = createDonationValidation.validate(req.body)
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const createDonationRequest = validationResult.value

            const authHeader = req.headers['authorization'];
            if (!authHeader) return res.status(401).json({ "error": "Unauthorized" });

            const token = authHeader.split(' ')[1];
            if (token === null) return res.status(401).json({ "error": "Unauthorized" });

            const tokenRepo = AppDataSource.getRepository(Token);
            const tokenFound = await tokenRepo.findOne({ where: { token }, relations: ['user'] });

            if (!tokenFound) {
                return res.status(403).json({ "error": "Access Forbidden" });
            }

            if (!tokenFound.user) {
                return res.status(500).json({ "error": "Internal server error u"});
            }

            const userRepo = AppDataSource.getRepository(User);
            const userFound = await userRepo.findOne({ where: { id:tokenFound.user.id }});

            if (!userFound) {
                return res.status(500).json({ "error": "Internal server error stat "});
            }

            const donationRepository = AppDataSource.getRepository(Donation);
            const newDonation = donationRepository.create({
                amount:createDonationRequest.amount,
                description:createDonationRequest.description,
                remaining:createDonationRequest.amount,
                benefactor:userFound
            });

            await donationRepository.save(newDonation);

            const url=await paypal.createOrder(createDonationRequest.description, createDonationRequest.amount)
            // console.log(url)
            // res.redirect(url)
            res.status(200).json({ message: "open this on your current navigator: "+url });
            // await open(url);
        }catch(error){
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    });

    app.get('/validateDonation',async(req: Request, res: Response) => {
        try{
            await paypal.capturePayment(req.query.token)

            res.status(200).json({ 
                message:"Donation perfectly done",
                CheckThemAllHeres: "http:localhost:3000/donations"
            })
        }catch(error){
            res.send("Error: "+error)
        }
    })

    app.get('/cancelDonation',async(req: Request, res: Response) => {
        try{
            const donationRepository = AppDataSource.getRepository(Donation);

            const latestDonation = await donationRepository.findOne({
                where: {
                    isCanceled: false
                },
                order: {
                    createdAt: 'DESC'
                }
            })
            if(latestDonation){
                latestDonation.isCanceled=true
                await donationRepository.save(latestDonation)
            }
            res.status(200).json({
                message: "Donation successfully canceled",
                CheckThemAllHeres: "http:localhost:3000/donations"
            })
        }catch(error){
            res.send("Error: "+error)
        }
    })

    app.get('/donations',async(req: Request, res: Response)=>{
        const query = AppDataSource.getRepository(Donation)
            .createQueryBuilder('donation')
            .where('donation.isCanceled= false')
        const [donation, totalCount] = await query.getManyAndCount();
        res.status(200).json({
            donation,
            totalCount
        })
    })

    app.get("/donations/:id",async (req: Request, res: Response) => {
        try {
            const validationResult = userIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const expenditureId = validationResult.value

            const userRepository = AppDataSource.getRepository(Donation)
            const user = await userRepository.findOneBy({ id: expenditureId.id, isCanceled: false})
            if (user === null) {
                res.status(404).json({ "error": `Donation ${expenditureId.id} not found` })
                return
            }
            res.status(200).json(user)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })







    app.post('/signup', async (req: Request, res: Response) => {
        try {
            const validationResult = createOtherValidation.validate(req.body)
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const createOtherRequest = validationResult.value
            const hashedPassword = await hash(createOtherRequest.password, 10);

            const userRepository = AppDataSource.getRepository(User)
            const status= await AppDataSource
            .getRepository(Status)
            .createQueryBuilder("status")
            .where("status.description = \"NORMAL\"")
            .getOne()
            if (status!=null){
                const other = await userRepository.save({
                    name:createOtherRequest.name,
                    email: createOtherRequest.email,
                    password: hashedPassword,
                    status:status
                });
                res.status(201).json(other)
            }else{
                return res.status(201).json({"Erreur":"So you are coming out of nowhere"})
            }
        } catch (error) { 
            console.log(error)
            res.status(500).json({ "error": "internal error retry later" })
            return
        } 
    })

    app.post('/login', async (req: Request, res: Response) => {
        try {

            const validationResult = loginOtherValidation.validate(req.body)
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const loginOtherRequest = validationResult.value

            // valid other exist
            const other = await AppDataSource.getRepository(User).findOne({
                where: {
                    email: loginOtherRequest.email,
                    isDeleted: false
                },
                relations: ["status"]
            })
            
            if (!other) {
                res.status(400).json({ error: "user not found" })
                return
            }

            // valid password for this other
            const isValid = await compare(loginOtherRequest.password, other.password);
            if (!isValid) {
                res.status(400).json({ error: "email or password not valid" })
                return
            }
            const status=await AppDataSource.getRepository(Status).findOneBy({
                id: other.status.id
            })

            if(!status || (status && status.description!="NORMAL")){
                res.status(400).json({ error: "user not recognised" })
                return
            }
            
            const secret = process.env.JWT_SECRET ?? "NoNotThis"
            //console.log(secret)
            // generate jwt
            const token = sign({ otherId: other.id, email: other.email }, secret, { expiresIn: '1d' });
            // store un token pour un other
            await AppDataSource.getRepository(Token).save({ token: token,user:other })
            res.status(200).json({ other, token , message: "authenticated ✅" });
        } catch (error) {
            console.log(error)
            res.status(500).json({ "error": "internal error retry later" })
            return
        }
    })

    app.patch("/users/:id",normalMiddleware,async (req: Request, res: Response) => {
        const validation = updateUserValidation.validate({...req.body,...req.params})

        if (validation.error) {
            res.status(400).json(generateValidationErrorMessage(validation.error.details))
            return
        }
        const updateUserRequest = validation.value

        try {
            const userUsecase = new UserUsecase(AppDataSource);
            const updatedUser = await userUsecase.updateUser(updateUserRequest.id,{...updateUserRequest})
            if (updatedUser === null) {
                res.status(404).json({ "error": `user ${updateUserRequest.id} not found` })
                return
            }
            res.status(200).json(updatedUser)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })

    app.delete("/users/:id",authMiddleware,async (req: Request, res: Response) => {
        try {
            const validationResult = updateUserValidation.validate({ ...req.params, ...req.body });
    
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }
    
            const userProto = validationResult.value;
            const userRepository = AppDataSource.getRepository(User);
            

            const user = await userRepository.findOneBy({ id: userProto.id,isDeleted:false });
            if (!user) {
                res.status(404).json({ error: `User ${userProto.id} not found` });
                return;
            }
    
            const isValid = await compare(userProto.actual_password, user.password);
    
            if (!isValid) {
                res.status(400).json({ error: "Actual password incorrect" });
                return;
            }

            user.isDeleted = true;
            const userDeleted = await userRepository.save(user);
            res.status(200).json(userDeleted);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal error" });
        }
    });
    




    //Pour creer un admin , une cle sera demandee , la retrouver dans le readme
    app.post('/admin/signup', async (req: Request, res: Response) => {
        try {
            const validationResult = createAdminValidation.validate(req.body)
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const createOtherRequest = validationResult.value
            const hashedPassword = await hash(createOtherRequest.password, 10);

            const status = await AppDataSource.getRepository(Status)
            .createQueryBuilder("status")
            .where("status.description = :description", { description: "ADMIN" })
            .getOne();

        if (!status) {
            res.status(500).json({ error: "Status not found" });
            return;
        }

        if (!createOtherRequest.key) {
            res.status(400).json({ error: "Key is required" });
            return;
        }

        const isKeyValid = await compare(createOtherRequest.key, status.key);
        if (!isKeyValid) {
            res.status(400).json({ error: "Invalid key" });
            return;
        }

        // Save the new user to the database
        const userRepository = AppDataSource.getRepository(User);
        const newUser = userRepository.create({
            name:createOtherRequest.name,
            email: createOtherRequest.email,
            password: hashedPassword,
            status: status
        });

        await userRepository.save(newUser);

        res.status(201).json(newUser);

        } catch (error) { 
            console.log(error)
            res.status(500).json({ "error": "internal error retry later" })
            return
        } 
    })

    app.post('/admin/login', async (req: Request, res: Response) => {
        try {

            const validationResult = loginOtherValidation.validate(req.body)
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const loginAdminRequest = validationResult.value

            // valid other exist
            const admin = await AppDataSource.getRepository(User).findOne({
                where:{
                    email: loginAdminRequest.email,
                    isDeleted: false
                }, 
                relations: ["status"]

            });
            
            if (!admin) {
                res.status(400).json({ error: "email or password not valid" })
                return
            }

            // valid password for this other
            const isValid = await compare(loginAdminRequest.password, admin.password);
            if (!isValid) {
                res.status(400).json({ error: "email or password not valid" })
                return
            }

            const status=await AppDataSource.getRepository(Status).findOneBy({
                id: admin.status.id
            })

            if(!status || (status && status.description!="ADMIN")){
                res.status(400).json({ error: "user not recognised" })
                return
            }
            
            const secret = process.env.JWT_SECRET ?? "NoNotThiss"
            //console.log(secret)
            // generate jwt
            const token = sign({ adminId: admin.id, email: admin.email }, secret, { expiresIn: '1d' });
            // store un token pour un other
            await AppDataSource.getRepository(Token).save({ token: token,user:admin })
            res.status(200).json({ admin, token , message: "authenticated ✅" });
        } catch (error) {
            console.log(error)
            res.status(500).json({ "error": "internal error retry later" })
            return
        }
    })

    app.patch("/admins/:id",adminMiddleware,async (req: Request, res: Response) => {
        const validation = updateUserValidation.validate({...req.body,...req.params})

        if (validation.error) {
            res.status(400).json(generateValidationErrorMessage(validation.error.details))
            return
        }
        const updateUserRequest = validation.value

        try {
            const userUsecase = new UserUsecase(AppDataSource);
            const updatedUser = await userUsecase.updateAdmin(updateUserRequest.id,{...updateUserRequest})
            if (updatedUser === null) {
                res.status(404).json({ "error": `user ${updateUserRequest.id} not found` })
                return
            }
            res.status(200).json(updatedUser)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })

    app.delete("/admins/:id",adminMiddleware,async (req: Request, res: Response) => {
        try {
            const validationResult = updateUserValidation.validate({...req.params,...req.body})

            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const userProto = validationResult.value

            const userRepository = AppDataSource.getRepository(User)
            const user = await userRepository.findOneBy({ id: userProto.id,isDeleted: false })
            if (user === null) {
                res.status(404).json({ "error": `user ${userProto.id} not found` })
                return
            }
            const isValid =await compare(userProto.actual_password,user.password)
            if (!isValid) {
            return "Actual password incorrect !!!";
            }
            // const userDeleted = await userRepository.remove(user)
            user.isDeleted = true
            const userDeleted = await userRepository.save(user);
            res.status(200).json(userDeleted)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })




    app.post('/benefactor/signup', async (req: Request, res: Response) => {
        try {
            const validationResult = createOtherValidation.validate(req.body)
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const createOtherRequest = validationResult.value
            const hashedPassword = await hash(createOtherRequest.password, 10);

            const status = await AppDataSource.getRepository(Status)
            .createQueryBuilder("status")
            .where("status.description = :description", { description: "BENEFACTOR" })
            .getOne();

        if (!status) {
            res.status(500).json({ error: "Status not found" });
            return;
        }

        // Save the new user to the database
        const userRepository = AppDataSource.getRepository(User);
        const newUser = userRepository.create({
            name:createOtherRequest.name,
            email: createOtherRequest.email,
            password: hashedPassword,
            status: status
        });

        await userRepository.save(newUser);

        res.status(201).json(newUser);

        } catch (error) { 
            console.log(error)
            res.status(500).json({ "error": "internal error retry later" })
            return
        } 
    })

    app.post('/benefactor/login',async (req: Request, res: Response) => {
        try {

            const validationResult = loginOtherValidation.validate(req.body)
            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const loginOtherRequest = validationResult.value

            // valid other exist
            const other = await AppDataSource.getRepository(User).findOne({
                where: {
                    email: loginOtherRequest.email,
                    isDeleted: false
                },
                relations: ["status"]
            })
            
            if (!other) {
                res.status(400).json({ error: "user not found" })
                return
            }

            // valid password for this other
            const isValid = await compare(loginOtherRequest.password, other.password);
            if (!isValid) {
                res.status(400).json({ error: "email or password not valid" })
                return
            }
            const status=await AppDataSource.getRepository(Status).findOneBy({
                id: other.status.id
            })

            if(!status || (status && status.description!="BENEFACTOR")){
                res.status(400).json({ error: "user not recognised" })
                return
            }
            
            const secret = process.env.JWT_SECRET ?? "NoNotThisss"
            //console.log(secret)
            // generate jwt
            const token = sign({ otherId: other.id, email: other.email }, secret, { expiresIn: '1d' });
            // store un token pour un other
            await AppDataSource.getRepository(Token).save({ token: token,user:other })
            res.status(200).json({ other, token , message: "authenticated ✅" });
        } catch (error) {
            console.log(error)
            res.status(500).json({ "error": "internal error retry later" })
            return
        }
    })

    app.patch("/benefactors/:id",benefactorMiddleware,async (req: Request, res: Response) => {
        const validation = updateUserValidation.validate({...req.body,...req.params})

        if (validation.error) {
            res.status(400).json(generateValidationErrorMessage(validation.error.details))
            return
        }
        const updateUserRequest = validation.value

        try {
            const userUsecase = new UserUsecase(AppDataSource);
            const updatedUser = await userUsecase.updateBenefactor(updateUserRequest.id,{...updateUserRequest})
            if (updatedUser === null) {
                res.status(404).json({ "error": `user ${updateUserRequest.id} not found` })
                return
            }
            res.status(200).json(updatedUser)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })

    app.delete("/benefactors/:id",benefactorMiddleware,async (req: Request, res: Response) => {
        try {
            const validationResult = updateUserValidation.validate({...req.params,...req.body})

            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const userProto = validationResult.value

            const userRepository = AppDataSource.getRepository(User)
            const user = await userRepository.findOneBy({ id: userProto.id,isDeleted: false })
            if (user === null) {
                res.status(404).json({ "error": `user ${userProto.id} not found` })
                return
            }
            const isValid =await compare(userProto.actual_password,user.password)
            if (!isValid) {
            return "Actual password incorrect !!!";
            }
            user.isDeleted = true
            const userDeleted = await userRepository.save(user);
            res.status(200).json(userDeleted)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })
    




} 
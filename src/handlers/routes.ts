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
import { MissionUsecase } from "../domain/mission-usecase";
import { EvenementUsecase } from "../domain/evenement-usecase";
import { ProjetUsecase } from "../domain/projet-usecase";
import { StepUsecase } from "../domain/step-usecase";
import { ListMissionRequest, MissionRequest, listMissionValidation, missionUpdateValidation, missionValidation } from "./validators/mission-validator";
import { EvenementRequest, ListEvenementRequest, evenementUpdateValidation, evenementValidation } from "./validators/evenement-validator";
import { ListProjetRequest, ProjetRequest, listProjetValidation, projetUpdateValidation, projetValidation } from "./validators/projet-validator";
import { ListStepRequest, StepRequest, listStepValidation, stepUpdateValidation, stepValidation } from "./validators/step-validator";
import { ReviewUsecase } from "../domain/review-usecase";
import { ReviewRequest, reviewValidation } from "./validators/review-validator";
import { ComplianceUsecase } from "../domain/compliance-usecase";
import { ComplianceRequest, ListComplianceRequest, complianceValidation, listComplianceValidation } from "./validators/compliance-validator";
import { Evenement } from "../database/entities/evenement";
import { SubjectUsecase } from "../domain/subject-usecase";
import { createSubjectValidation, updateSubjectValidation } from "./validators/subjectValidator";
import { VoteUsecase } from "../domain/vote-usecase";
import { ResponseUsecase } from "../domain/response-usecase";
import { DocumentUsecase } from "../domain/document-usecase";
import { createVoteValidation, updateVoteValidation } from "./validators/voteValidator";
import { createDocumentValidation, updateDocumentValidation } from "./validators/documentValidator";
import { createResponseValidation, updateResponseValidation } from "./validators/responseValidator";



const paypal =require("./paypal")
// const open = require('open');






export const initRoutes = (app: express.Express) => { 
    const missionUsecase = new MissionUsecase(AppDataSource);
    const evenementUsecase = new EvenementUsecase(AppDataSource);
    const projetUsecase = new ProjetUsecase(AppDataSource);
    const stepUsecase = new StepUsecase(AppDataSource);
    const reviewUsecase = new ReviewUsecase(AppDataSource);
    const complianceUsecase = new ComplianceUsecase(AppDataSource);
    const subjectUsecase = new SubjectUsecase(AppDataSource);
    const voteUsecase = new VoteUsecase(AppDataSource)
    const responseUsecase = new ResponseUsecase(AppDataSource);
    const documentUsecase = new DocumentUsecase(AppDataSource);

    //la route utilisee pour creer les statuts est bloquee volontairement

   app.post('/status',async(req:Request,res: Response)=>{
      try {
           const validationResult = createStatusValidation.validate(req.body)
           if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
               return
             }
           const createStatusRequest = validationResult.value
              const statusRepository = AppDataSource.getRepository(Status)
          if(createStatusRequest.key){
                const key = await hash(createStatusRequest.key, 10);

                const status = await statusRepository.save({
                     description:createStatusRequest.description,
                   key:key
              });
                  res.status(201).json(status)  
        }else{
                const keyy="No key"
               const key = await hash(keyy, 10);

                const status = await statusRepository.save({
                    description:createStatusRequest.description,
                     key:key
               }); 
                res.status(201).json(status) 
            }
            return
         } catch (error) { 
             console.log(error) 
           res.status(500).json({ "error": "internal error retry later" }) 
            return
       }  
      })



    

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
    
 


 
    /*
    Thamila addings
    */

    app.post("/evenements",adminMiddleware,async (req: Request, res: Response) => {
        try {
            const validation = evenementValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }
            const ev = validation.value;
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
            const evRepository = AppDataSource.getRepository(Evenement);
            const conflictingEvents = await evRepository.createQueryBuilder('event')
            .where(':starting < event.ending AND :ending > event.starting', { starting: ev.starting, ending: ev.ending })
            .getMany();

            if (conflictingEvents.length > 0) {
                return res.status(409).json({ "error": "Conflicting event exists" });
            }

            if(ev.type=="AG" && !ev.quorum){
                res.status(201).json({"message":"Quorum non indicated"});
            }else if(ev.type!="AG"){
                ev.quorum=0
            }
            const newEvent = evRepository.create({
                user:userFound,
                type:ev.type,
                description:ev.description,
                quorum:ev.quorum,
                starting:ev.starting,
                ending:ev.ending,
                location:ev.location
            });

            await evRepository.save(newEvent);

            res.status(201).json(newEvent);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/evenements", async (req: Request, res: Response) => {
        const validation = listMissionValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { page = 1, limit = 10 }: ListEvenementRequest = validation.value;
        try {
            const result = await evenementUsecase.listEvenements({ page, limit });
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/evenements/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const evenement = await evenementUsecase.getEvenement(id);
            if (!evenement) {
                res.status(404).send({ error: "Evenement not found" });
                return;
            }
            res.status(200).send(evenement);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.patch("/evenements/:id",adminMiddleware,async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        // const validation = evenementValidation.validate(req.body);
        // if (validation.error) {
        //     res.status(400).send(generateValidationErrorMessage(validation.error.details));
        //     return;
        try {
            const validation = evenementUpdateValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }
            const ev = validation.value;
            const evenement = await evenementUsecase.updateEvenement(id,ev);
            if (!evenement) {
                res.status(404).send({ error: "Evenement not found" });
                return;
            }
            res.status(200).send(evenement);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.delete("/evenements/:id", adminMiddleware, async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const result = await evenementUsecase.deleteEvenement(id);
            if (typeof result === 'string') {
                return res.status(404).send({ error: result });
            }
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });









    app.post("/missions",adminMiddleware,async (req: Request, res: Response) => {
        const validation = missionValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { starting, ending, description,eventId }: MissionRequest = validation.value;
        try {
            const missionCreated = await missionUsecase.createMission(starting, ending, description,eventId);
            res.status(201).send(missionCreated);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/missions", async (req: Request, res: Response) => {
        const validation = listMissionValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { page = 1, limit = 10 }: ListMissionRequest = validation.value;
        try {
            const result = await missionUsecase.listMissions({ page, limit });
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/missions/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const mission = await missionUsecase.getMission(id);
            if (!mission) {
                res.status(404).send({ error: "Mission not found" });
                return;
            }
            res.status(200).send(mission);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.patch("/missions/:id",adminMiddleware,async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const validation = missionUpdateValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }

            const { starting, ending, description }: MissionRequest = validation.value;
            
            const mission = await missionUsecase.updateMission(id, { starting, ending, description });
            if (!mission) {
                res.status(404).send({ error: "Mission not found" });
            }
            res.status(200).send(mission);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.delete("/missions/:id",adminMiddleware,async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const success = await missionUsecase.deleteMission(id);
            if (!success) {
                res.status(404).send({ error: "Mission not found" });
                return;
            }
            res.status(200).send(success);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });








    app.post("/projets", adminMiddleware, async (req: Request, res: Response) => {
        console.log("Request body:", req.body);
        const validation = projetValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }
        const project = validation.value;
        project.userId = (req as any).userId;   
    
        console.log("Project data with user ID:", project);
    
        try {
            const projetCreated = await projetUsecase.createProjet(project);
            res.status(201).send(projetCreated);
        } catch (error) {
            console.log("Error creating project:", error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.get("/projets", async (req: Request, res: Response) => {
        const validation = listProjetValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { page = 1, limit = 10 }: ListProjetRequest = validation.value;
        try {
            const result = await projetUsecase.listProjets({ page, limit });
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.get("/projets/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const projet = await projetUsecase.getProjet(id);
            if (!projet) {
                res.status(404).send({ error: "Projet not found" });
                return;
            }
            res.status(200).send(projet);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.patch("/projets/:id",adminMiddleware,async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const validation = projetUpdateValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const proj= validation.value;
        try {
            const projet = await projetUsecase.updateProjet(id, { ...proj });
            if (!projet) {
                res.status(404).send({ error: "Projet not found" });
                return;
            }
            res.status(200).send(projet);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.delete("/projets/:id",adminMiddleware,async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const success = await projetUsecase.deleteProjet(id);
            if (!success) {
                res.status(404).send({ error: "Projet not found" });
                return;
            }
            res.status(200).send(success);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    








    app.post("/steps",adminMiddleware,async (req: Request, res: Response) => {
        const validation = stepValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { state, description, starting, ending, projetId}: StepRequest = validation.value;
        try {
            const stepCreated = await stepUsecase.createStep(state, description, starting, ending, projetId);
            res.status(201).send(stepCreated);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.get("/steps", async (req: Request, res: Response) => {
        const validation = listStepValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { page = 1, limit = 10 }: ListStepRequest = validation.value;
        try {
            const result = await stepUsecase.listSteps({ page, limit });
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.get("/steps/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const step = await stepUsecase.getStep(id);
            if (!step) {
                res.status(404).send({ error: "Step not found" });
                return;
            }
            res.status(200).send(step);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.patch("/steps/:id",adminMiddleware,async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const validation = stepUpdateValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { state, description, starting, ending, projetId}: StepRequest = validation.value;
        try {
            const step = await stepUsecase.updateStep(id, { state, description, starting, ending, projetId});
            if (!step) {
                res.status(404).send({ error: "Step not found" });
                return;
            }
            res.status(200).send(step);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.delete("/steps/:id",adminMiddleware,async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const success = await stepUsecase.deleteStep(id);
            if (!success) {
                res.status(404).send({ error: "Step not found" });
                return;
            }
            res.status(200).send(success);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });




    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    app.post("/comments", async (req: Request, res: Response) => {
        const validation = reviewValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { content, createdAt, missionId, userId }: ReviewRequest = validation.value;
        try {
            const reviewCreated = await reviewUsecase.createReview(content, createdAt, missionId, userId);
            res.status(201).send(reviewCreated);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.get("/comments/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const review = await reviewUsecase.getReview(id);
            if (!review) {
                res.status(404).send({ error: "Review not found" });
                return;
            }
            res.status(200).send(review);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.patch("/comments/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const validation = reviewValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { content }: ReviewRequest = validation.value;
        try {
            const review = await reviewUsecase.updateReview(id, { content });
            if (!review) {
                res.status(404).send({ error: "Review not found" });
                return;
            }
            res.status(200).send(review);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.delete("/comments/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const success = await reviewUsecase.deleteReview(id);
            if (!success) {
                res.status(404).send({ error: "Review not found" });
                return;
            }
            res.status(204).send();
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });




    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



    app.post("/compliances", async (req: Request, res: Response) => {
        const validation = complianceValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { description, status, userId, missionId }: ComplianceRequest = validation.value;
        try {
            const complianceCreated = await complianceUsecase.createCompliance(description, status, userId, missionId);
            res.status(201).send(complianceCreated);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.get("/compliances/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const compliance = await complianceUsecase.getCompliance(id);
            if (!compliance) {
                res.status(404).send({ error: "Compliance not found" });
                return;
            }
            res.status(200).send(compliance);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.patch("/compliances/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const validation = complianceValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { description, status }: ComplianceRequest = validation.value;
        try {
            const compliance = await complianceUsecase.updateCompliance(id, { description, status });
            if (!compliance) {
                res.status(404).send({ error: "Compliance not found" });
                return;
            }
            res.status(200).send(compliance);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.delete("/compliances/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const success = await complianceUsecase.deleteCompliance(id);
            if (!success) {
                res.status(404).send({ error: "Compliance not found" });
                return;
            }
            res.status(204).send();
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.get("/compliances", async (req: Request, res: Response) => {
        const validation = listComplianceValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { page = 1, limit = 10 }: ListComplianceRequest = validation.value;
        try {
            const result = await complianceUsecase.listCompliances({ page, limit });
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   
    // Routes for Subject
    app.post("/subjects", async (req: Request, res: Response) => {
        const validation = createSubjectValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        try {
            const subjectCreated = await subjectUsecase.createSubject(validation.value);
            res.status(201).send(subjectCreated);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/subjects", async (req: Request, res: Response) => {
        const { page = 1, limit = 10 } = req.query;
        try {
            const result = await subjectUsecase.listSubjects({ page: Number(page), limit: Number(limit) });
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/subjects/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const subject = await subjectUsecase.getSubject(id);
            if (!subject) {
                res.status(404).send({ error: "Subject not found" });
                return;
            }
            res.status(200).send(subject);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.patch("/subjects/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const validation = updateSubjectValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        try {
            const subject = await subjectUsecase.updateSubject(id, validation.value);
            if (!subject) {
                res.status(404).send({ error: "Subject not found" });
                return;
            }
            res.status(200).send(subject);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.delete("/subjects/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const success = await subjectUsecase.deleteSubject(id);
            if (!success) {
                res.status(404).send({ error: "Subject not found" });
                return;
            }
            res.status(200).send(success);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    // Routes for Vote
    app.post("/votes", async (req: Request, res: Response) => {
        const validation = createVoteValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        try {
            const voteCreated = await voteUsecase.createVote(validation.value);
            res.status(201).send(voteCreated);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/votes", async (req: Request, res: Response) => {
        const { page = 1, limit = 10 } = req.query;
        try {
            const result = await voteUsecase.listVotes({ page: Number(page), limit: Number(limit) });
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/votes/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const vote = await voteUsecase.getVote(id);
            if (!vote) {
                res.status(404).send({ error: "Vote not found" });
                return;
            }
            res.status(200).send(vote);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.patch("/votes/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const validation = updateVoteValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        try {
            const vote = await voteUsecase.updateVote(id, validation.value);
            if (!vote) {
                res.status(404).send({ error: "Vote not found" });
                return;
            }
            res.status(200).send(vote);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.delete("/votes/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const success = await voteUsecase.deleteVote(id);
            if (!success) {
                res.status(404).send({ error: "Vote not found" });
                return;
            }
            res.status(200).send(success);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/votes/subject/:subjectId", async (req: Request, res: Response) => {
        const subjectId = parseInt(req.params.subjectId);
        try {
            const votes = await voteUsecase.getVotesBySubject(subjectId);
            res.status(200).send(votes);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    // Routes for Response
    app.post("/responses", async (req: Request, res: Response) => {
        const validation = createResponseValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        try {
            const responseCreated = await responseUsecase.createResponse(validation.value);
            res.status(201).send(responseCreated);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/responses", async (req: Request, res: Response) => {
        const { page = 1, limit = 10 } = req.query;
        try {
            const result = await responseUsecase.listResponses({ page: Number(page), limit: Number(limit) });
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/responses/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const response = await responseUsecase.getResponse(id);
            if (!response) {
                res.status(404).send({ error: "Response not found" });
                return;
            }
            res.status(200).send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.patch("/responses/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const validation = updateResponseValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        try {
            const response = await responseUsecase.updateResponse(id, validation.value);
            if (!response) {
                res.status(404).send({ error: "Response not found" });
                return;
            }
            res.status(200).send(response);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.delete("/responses/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const success = await responseUsecase.deleteResponse(id);
            if (!success) {
                res.status(404).send({ error: "Response not found" });
                return;
            }
            res.status(200).send(success);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/responses/user/:userId", async (req: Request, res: Response) => {
        const userId = parseInt(req.params.userId);
        try {
            const responses = await responseUsecase.getResponsesByUser(userId);
            res.status(200).send(responses);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    // Routes for Document
    app.post("/documents", async (req: Request, res: Response) => {
        const validation = createDocumentValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        try {
            const documentCreated = await documentUsecase.createDocument(validation.value);
            res.status(201).send(documentCreated);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/documents", async (req: Request, res: Response) => {
        const { page = 1, limit = 10 } = req.query;
        try {
            const result = await documentUsecase.listDocuments({ page: Number(page), limit: Number(limit) });
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/documents/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const document = await documentUsecase.getDocument(id);
            if (!document) {
                res.status(404).send({ error: "Document not found" });
                return;
            }
            res.status(200).send(document);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.patch("/documents/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const validation = updateDocumentValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        try {
            const document = await documentUsecase.updateDocument(id, validation.value);
            if (!document) {
                res.status(404).send({ error: "Document not found" });
                return;
            }
            res.status(200).send(document);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.delete("/documents/:id", async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const success = await documentUsecase.deleteDocument(id);
            if (!success) {
                res.status(404).send({ error: "Document not found" });
                return;
            }
            res.status(200).send(success);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });

    app.get("/documents/user/:userId", async (req: Request, res: Response) => {
        const userId = parseInt(req.params.userId);
        try {
            const documents = await documentUsecase.getDocumentsByUser(userId);
            res.status(200).send(documents);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    });
};

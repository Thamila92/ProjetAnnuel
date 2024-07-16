import { compare, hash } from "bcrypt";
import express, { Request, Response } from "express";
import { AppDataSource } from "../database/database";
import { createOtherValidation, listUsersValidation, loginOtherValidation, updateUserValidation, userIdValidation } from "./validators/user-validator";
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
import multer from 'multer';
import { Readable } from 'stream';
import { DocumentUsecase } from "../domain/document-usecase";
import { createDocumentValidation, updateDocumentValidation } from "./validators/documentValidator";
import { OAuth2Client } from "google-auth-library";
import { UserDocument } from "../database/entities/document";
import { voteValidation } from "./validators/vote-validator";
import { VoteUsecase } from "../domain/vote-usecase";
import { roundValidation } from "./validators/round-validator";
import { RoundUsecase } from "../domain/round-usecase";
import { choiceValidation, propositionValidation } from "./validators/proposition-validator";
import { Proposition } from "../database/entities/proposition";
import { PropositionUsecase } from "../domain/proposition-usecase";
import { Round } from "../database/entities/round";
import { repetitivity , eventtype} from "../database/entities/evenement";
import { VoteRecord } from "../database/entities/vote-record";
import { Location } from "../database/entities/location";
import { AttendeeRole } from "../database/entities/evenement-attendee";
import { Notification } from "../database/entities/notification";

const upload = multer();



const paypal = require("./paypal")
// const open = require('open');






export const initRoutes = (app: express.Express, documentUsecase: DocumentUsecase) => {
    const missionUsecase = new MissionUsecase(AppDataSource);
    const evenementUsecase = new EvenementUsecase(AppDataSource);
    const projetUsecase = new ProjetUsecase(AppDataSource);
    const stepUsecase = new StepUsecase(AppDataSource);
    const reviewUsecase = new ReviewUsecase(AppDataSource);
    const complianceUsecase = new ComplianceUsecase(AppDataSource);
    const roundUsecase=new RoundUsecase(AppDataSource);
    const voteUsecase= new VoteUsecase(AppDataSource);
    const propositionUsecase=new PropositionUsecase(AppDataSource);




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
    app.get('/users', authMiddleware, async (req: Request, res: Response) => {
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

        let type = ""
        if (listUserRequest.type) {
            type = listUserRequest.type
        }

        const page = listUserRequest.page ?? 1

        try {
            const userUsecase = new UserUsecase(AppDataSource);
            const listusers = await userUsecase.listUser({ ...listUserRequest, page, limit, type })
            res.status(200).json(listusers)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })

    //Listing des infos du profil d'un utilisateur quelconque
    app.get("/users/:id", authMiddleware, async (req: Request, res: Response) => {
        try {
            const validationResult = userIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const userId = validationResult.value

            const userRepository = AppDataSource.getRepository(User)
            const user = await userRepository.findOneBy({ id: userId.id, isDeleted: false })
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




    app.post('/expenditure', adminMiddleware, async (req: Request, res: Response) => {
        try {
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
                return res.status(500).json({ "error": "Internal server error u" });
            }

            const userRepo = AppDataSource.getRepository(User);
            const userFound = await userRepo.findOne({ where: { id: tokenFound.user.id } });

            if (!userFound) {
                return res.status(500).json({ "error": "Internal server error stat " });
            }

            const expenditureRepository = AppDataSource.getRepository(Expenditures);
            const newExpenditure = expenditureRepository.create({
                amount: createDonationRequest.amount,
                user: userFound,
                description: createDonationRequest.description
            });

            await expenditureRepository.save(newExpenditure);

            // const url=await paypal.createPayout(createDonationRequest.amount,'EUR')
            // console.log(url)
            // res.redirect(url)
            // res.status(200).json({ ...url });
            if (await paypal.createPayout(createDonationRequest.amount, 'EUR')) {
                res.status(200).json({
                    message: "Expenditure successfully registered and the amount of " + createDonationRequest.amount + "€ has been transfered",
                    CheckThemAllHere: "http:localhost:3000/expenditures"
                })
            }
            // await open(url);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })

    app.get('/expenditures', adminMiddleware, async (req: Request, res: Response) => {
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

        let id = 0
        if (listExpenditureRequest.id) {
            id = listExpenditureRequest.id
        }

        const page = listExpenditureRequest.page ?? 1

        try {
            const expenditureUsecase = new ExpenditureUsecase(AppDataSource);
            const listusers = await expenditureUsecase.listExpenditure({ ...listExpenditureRequest, page, limit, id })
            res.status(200).json(listusers)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    })

    app.get("/expenditures/:id", adminMiddleware, async (req: Request, res: Response) => {
        try {
            const validationResult = userIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const expenditureId = validationResult.value

            const userRepository = AppDataSource.getRepository(Expenditures)
            const user = await userRepository.findOneBy({ id: expenditureId.id })
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





    app.post('/Donation', benefactorMiddleware, async (req: Request, res: Response) => {
        try {
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
                return res.status(500).json({ "error": "Internal server error u" });
            }

            const userRepo = AppDataSource.getRepository(User);
            const userFound = await userRepo.findOne({ where: { id: tokenFound.user.id } });

            if (!userFound) {
                return res.status(500).json({ "error": "Internal server error stat " });
            }

            const donationRepository = AppDataSource.getRepository(Donation);
            const newDonation = donationRepository.create({
                amount: createDonationRequest.amount,
                description: createDonationRequest.description,
                remaining: createDonationRequest.amount,
                benefactor: userFound
            });

            await donationRepository.save(newDonation);

            const url = await paypal.createOrder(createDonationRequest.description, createDonationRequest.amount)
            // console.log(url)
            // res.redirect(url)
            res.status(200).json({ message: "open this on your current navigator: " + url });
            // await open(url);
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Internal error" })
        }
    });

    app.get('/validateDonation', async (req: Request, res: Response) => {
        try {
            await paypal.capturePayment(req.query.token)

            res.status(200).json({
                message: "Donation perfectly done",
                CheckThemAllHeres: "http:localhost:3000/donations"
            })
        } catch (error) {
            res.send("Error: " + error)
        }
    })

    app.get('/cancelDonation', async (req: Request, res: Response) => {
        try {
            const donationRepository = AppDataSource.getRepository(Donation);

            const latestDonation = await donationRepository.findOne({
                where: {
                    isCanceled: false
                },
                order: {
                    createdAt: 'DESC'
                }
            })
            if (latestDonation) {
                latestDonation.isCanceled = true
                await donationRepository.save(latestDonation)
            }
            res.status(200).json({
                message: "Donation successfully canceled",
                CheckThemAllHeres: "http:localhost:3000/donations"
            })
        } catch (error) {
            res.send("Error: " + error)
        }
    })

    app.get('/donations', async (req: Request, res: Response) => {
        const query = AppDataSource.getRepository(Donation)
            .createQueryBuilder('donation')
            .where('donation.isCanceled= false')
        const [donation, totalCount] = await query.getManyAndCount();
        res.status(200).json({
            donation,
            totalCount
        })
    })

    app.get("/donations/:id", async (req: Request, res: Response) => {
        try {
            const validationResult = userIdValidation.validate(req.params)

            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const expenditureId = validationResult.value

            const userRepository = AppDataSource.getRepository(Donation)
            const user = await userRepository.findOneBy({ id: expenditureId.id, isCanceled: false })
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
            const status = await AppDataSource
                .getRepository(Status)
                .createQueryBuilder("status")
                .where("status.description = \"NORMAL\"")
                .getOne()
            if (status != null) {
                const other = await userRepository.save({
                    name: createOtherRequest.name,
                    email: createOtherRequest.email,
                    password: hashedPassword,
                    status: status
                });
                res.status(201).json(other)
            } else {
                return res.status(201).json({ "Erreur": "So you are coming out of nowhere" })
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
            const status = await AppDataSource.getRepository(Status).findOneBy({
                id: other.status.id
            })

            if (!status || (status && status.description != "NORMAL")) {
                res.status(400).json({ error: "user not recognised" })
                return
            }

            const secret = process.env.JWT_SECRET ?? "NoNotThis"
            //console.log(secret)
            // generate jwt
            const token = sign({ otherId: other.id, email: other.email }, secret, { expiresIn: '1d' });
            // store un token pour un other
            await AppDataSource.getRepository(Token).save({ token: token, user: other })
            res.status(200).json({ other, token, message: "authenticated ✅" });
        } catch (error) {
            console.log(error)
            res.status(500).json({ "error": "internal error retry later" })
            return
        }
    })

    app.patch("/users/:id", normalMiddleware, async (req: Request, res: Response) => {
        const validation = updateUserValidation.validate({ ...req.body, ...req.params })

        if (validation.error) {
            res.status(400).json(generateValidationErrorMessage(validation.error.details))
            return
        }
        const updateUserRequest = validation.value

        try {
            const userUsecase = new UserUsecase(AppDataSource);
            const updatedUser = await userUsecase.updateUser(updateUserRequest.id, { ...updateUserRequest })
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

    app.delete("/users/:id", authMiddleware, async (req: Request, res: Response) => {
        try {
            const validationResult = updateUserValidation.validate({ ...req.params, ...req.body });

            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details));
                return;
            }

            const userProto = validationResult.value;
            const userRepository = AppDataSource.getRepository(User);


            const user = await userRepository.findOneBy({ id: userProto.id, isDeleted: false });
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
                name: createOtherRequest.name,
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
                where: {
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

            const status = await AppDataSource.getRepository(Status).findOneBy({
                id: admin.status.id
            })

            if (!status || (status && status.description != "ADMIN")) {
                res.status(400).json({ error: "user not recognised" })
                return
            }

            const secret = process.env.JWT_SECRET ?? "NoNotThiss"
            //console.log(secret)
            // generate jwt
            const token = sign({ adminId: admin.id, email: admin.email }, secret, { expiresIn: '1d' });
            // store un token pour un other
            await AppDataSource.getRepository(Token).save({ token: token, user: admin })
            res.status(200).json({ admin, token, message: "authenticated ✅" });
        } catch (error) {
            console.log(error)
            res.status(500).json({ "error": "internal error retry later" })
            return
        }
    })

    app.patch("/admins/:id", adminMiddleware, async (req: Request, res: Response) => {
        const validation = updateUserValidation.validate({ ...req.body, ...req.params })

        if (validation.error) {
            res.status(400).json(generateValidationErrorMessage(validation.error.details))
            return
        }
        const updateUserRequest = validation.value

        try {
            const userUsecase = new UserUsecase(AppDataSource);
            const updatedUser = await userUsecase.updateAdmin(updateUserRequest.id, { ...updateUserRequest })
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

    app.delete("/admins/:id", adminMiddleware, async (req: Request, res: Response) => {
        try {
            const validationResult = updateUserValidation.validate({ ...req.params, ...req.body })

            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const userProto = validationResult.value

            const userRepository = AppDataSource.getRepository(User)
            const user = await userRepository.findOneBy({ id: userProto.id, isDeleted: false })
            if (user === null) {
                res.status(404).json({ "error": `user ${userProto.id} not found` })
                return
            }
            const isValid = await compare(userProto.actual_password, user.password)
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
                name: createOtherRequest.name,
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

    app.post('/benefactor/login', async (req: Request, res: Response) => {
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
            const status = await AppDataSource.getRepository(Status).findOneBy({
                id: other.status.id
            })

            if (!status || (status && status.description != "BENEFACTOR")) {
                res.status(400).json({ error: "user not recognised" })
                return
            }

            const secret = process.env.JWT_SECRET ?? "NoNotThisss"
            //console.log(secret)
            // generate jwt
            const token = sign({ otherId: other.id, email: other.email }, secret, { expiresIn: '1d' });
            // store un token pour un other
            await AppDataSource.getRepository(Token).save({ token: token, user: other })
            res.status(200).json({ other, token, message: "authenticated ✅" });
        } catch (error) {
            console.log(error)
            res.status(500).json({ "error": "internal error retry later" })
            return
        }
    })

    app.patch("/benefactors/:id", benefactorMiddleware, async (req: Request, res: Response) => {
        const validation = updateUserValidation.validate({ ...req.body, ...req.params })

        if (validation.error) {
            res.status(400).json(generateValidationErrorMessage(validation.error.details))
            return
        }
        const updateUserRequest = validation.value

        try {
            const userUsecase = new UserUsecase(AppDataSource);
            const updatedUser = await userUsecase.updateBenefactor(updateUserRequest.id, { ...updateUserRequest })
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

    app.delete("/benefactors/:id", benefactorMiddleware, async (req: Request, res: Response) => {
        try {
            const validationResult = updateUserValidation.validate({ ...req.params, ...req.body })

            if (validationResult.error) {
                res.status(400).json(generateValidationErrorMessage(validationResult.error.details))
                return
            }
            const userProto = validationResult.value

            const userRepository = AppDataSource.getRepository(User)
            const user = await userRepository.findOneBy({ id: userProto.id, isDeleted: false })
            if (user === null) {
                res.status(404).json({ "error": `user ${userProto.id} not found` })
                return
            }
            const isValid = await compare(userProto.actual_password, user.password)
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

    
    
     
    

    









    app.post("/missions", adminMiddleware, async (req: Request, res: Response) => {
        const validation = missionValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { starting, ending, description, eventId }: MissionRequest = validation.value;
        try {
            const missionCreated = await missionUsecase.createMission(starting, ending, description, eventId);
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

    app.patch("/missions/:id", adminMiddleware, async (req: Request, res: Response) => {
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

    app.delete("/missions/:id", adminMiddleware, async (req: Request, res: Response) => {
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



    app.post("/evenements", adminMiddleware, async (req: Request, res: Response) => {
        try {
            // Validate request body
            const validation = evenementValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }
            const ev = validation.value as EvenementRequest; // Explicitly casting to EvenementRequest
    
            // Authorization check
            const authHeader = req.headers["authorization"];
            if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    
            const token = authHeader.split(" ")[1];
            if (token === null) return res.status(401).json({ error: "Unauthorized" });
    
            const tokenRepo = AppDataSource.getRepository(Token);
            const tokenFound = await tokenRepo.findOne({
                where: { token },
                relations: ["user"],
            });
    
            if (!tokenFound) {
                return res.status(403).json({ error: "Access Forbidden" });
            }
    
            if (!tokenFound.user) {
                return res.status(500).json({ error: "Internal server error" });
            }
    
            const userRepo = AppDataSource.getRepository(User);
            const userFound = await userRepo.findOne({
                where: { id: tokenFound.user.id },
            });
    
            if (!userFound) {
                return res.status(500).json({ error: "Internal server error" });
            }
    
            const locRepo = AppDataSource.getRepository(Location);
            const locFound = await locRepo.findOne({
                where: { id: ev.location },
            });
    
            if (!locFound) {
                return res.status(500).json({ error: "Location not found" });
            }
    
            // Collect all attendees
            const attFound: { user: User; role: AttendeeRole }[] = [];
            for (const attendee of ev.attendees) {
                try {
                    const user = await userRepo.findOne({ where: { id: attendee.userId, isDeleted: false } });
                    if (user) {
                        attFound.push({ user, role: attendee.role });
                    } else {
                        return res.status(500).json({ error: `User with ID ${attendee.userId} not found.` });
                    }
                } catch (error) {
                    return res.status(500).json({ error: `User with ID ${attendee.userId} not found.` });
                }
            }
    
            // Validate event configuration
            if (ev.type == "AG" && (!ev.quorum || ev.quorum <= 0 || !ev.repetitivity || ev.repetitivity === repetitivity.NONE)) {
                res.status(400).json({ message: "AG not well configured" });
                return;
            } else if (ev.type !="AG") {
                ev.quorum = 0;
                ev.repetitivity = repetitivity.NONE;
            }
    
            // Additional custom validation
            if (ev.type =="AG" && attFound.length === 0) {
                return res.status(500).json({ error: "AG type event must have at least one attendee." });
            }
    
            const importantAttendeesCount = attFound.filter(attendee => attendee.role === AttendeeRole.IMPORTANT).length;
            if (importantAttendeesCount > ev.quorum) {
                return res.status(500).json({ error: "Number of important attendees cannot exceed quorum." });
            }
    
            // Check for conflicting events
            const evRepository = AppDataSource.getRepository(Evenement);
            const conflictingEvents = await evRepository
                .createQueryBuilder("event")
                .where(":starting < event.ending AND :ending > event.starting", {
                    starting: ev.starting,
                    ending: ev.ending,
                })
                .getMany();
    
            if (conflictingEvents.length > 0) {
                return res.status(409).json({ error: "Conflicting event exists" });
            }
    
            if (ev.isVirtual && !ev.virtualLink) {
                return res.status(409).json({ error: "Veuillez precisez le lien de reunion" });
            } else {
                ev.virtualLink = "";
            }
    
            // Create notifications for each attendee
            const notificationRepo = AppDataSource.getRepository(Notification);
            for (const attendee of attFound) {
                const notification = notificationRepo.create({
                    description: `Mr/Mme. ${attendee.user.name} est convié(e) à l'assemblée générale du ${ev.starting}`,
                    users: [attendee.user],
                });
                await notificationRepo.save(notification);
            }
    
            // Create and save the new event
            const newEvent = evRepository.create({
                typee: ev.type as unknown as eventtype,
                description: ev.description,
                quorum: ev.quorum,
                isVirtual: ev.isVirtual,
                virtualLink: ev.virtualLink,
                starting: new Date(ev.starting),
                ending: new Date(ev.ending),
                repetitivity: ev.repetitivity,
                user: userFound,
                attendees: attFound.map(att => att.user), // Only user objects are saved in attendees
                location: [locFound], // Assign location as an array
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

    
    
    





    app.post("/projets", adminMiddleware, async (req: Request, res: Response) => {
        const validation = projetValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }
        const project = validation.value;
        try {
            const projetCreated = await projetUsecase.createProjet(project);
            res.status(201).send(projetCreated);
        } catch (error) {
            console.log(error);
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
    app.patch("/projets/:id", adminMiddleware, async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const validation = projetUpdateValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const proj = validation.value;
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
    app.delete("/projets/:id", adminMiddleware, async (req: Request, res: Response) => {
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








    app.post('/vote', adminMiddleware, async (req, res) => {
        try {
            const validation = voteValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }
    
            const vote = validation.value;
            const voteCreated = await voteUsecase.createVotee(vote,req.headers['authorization']?.split(' ')[1]);
            res.status(201).send(voteCreated);
        } catch (error) {
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.get("/votes",async(req,res)=>{
        const validation = listProjetValidation.validate(req.query);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { page = 1, limit = 10 }: ListProjetRequest = validation.value;
        try {
            const result = await voteUsecase.listVotes({ page, limit });
            res.status(200).send(result);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    })
    app.delete("/vote:id",async(req,res)=>{
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
    })




    app.post('/round', adminMiddleware, async (req, res) => {
        try {
            const validation = roundValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }
    
            const round = validation.value;
            const roundCreated = await roundUsecase.createRound(
                round.description,
                round.starting,
                round.ending,
                round.voteId
            ); 
            res.status(201).send(roundCreated);
        } catch (error) {
            if (error === 'Vote not found' || 
                error === 'Round dates must be within the vote dates' ||
                error === 'There is already a round planned for the same vote during this period' ||
                error === 'A round with the same starting and ending dates already exists for this vote') {
                res.status(400).send({ error: error });
            } else {
                res.status(500).send({ error: error });
            }
        } 
    }); 
    app.get('/rounds/:voteId',async (req, res) => {
        const id = parseInt(req.params.voteId);
        try {
            const rounds = await roundUsecase.getRounds(id);
            if (!rounds) {
                res.status(404).send({ error: "Rounds not found" });
                return;
            }
            res.status(200).send(rounds);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    })
    app.delete('/rounds/:roundId',async (req, res) => {
        const id = parseInt(req.params.roundId);
        try {
            const round = await roundUsecase.deleteRound(id);
            if (!round) {
                res.status(404).send({ error: "Round not found" });
                return;
            }
            res.status(200).send(round);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        } 
    })



    app.post('/proposition', adminMiddleware, async (req, res) => {
        try {
            const validation = propositionValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }
    
            const proposition = validation.value;
            const propositionCreated = await propositionUsecase.createProposition(proposition);
            res.status(201).send(propositionCreated);
        } catch (error) {
            res.status(500).send({ error: "Internal error" });
        }
    });
    app.get('/propositions/:roundId', adminMiddleware, async (req, res) => {
        const id = parseInt(req.params.roundId);
        try {
            const propositions = await propositionUsecase.getPropositions(id);
            if (!propositions) {
                res.status(404).send({ error: "Rounds not found" });
                return;
            }
            res.status(200).send(propositions);
        } catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        } 
    })
    app.delete('/proposition/:id', adminMiddleware, async (req, res) => {
        try {
            const propositionId = parseInt(req.params.id, 10);
            const result = await propositionUsecase.deleteProposition(propositionId);
    
            if (result === "Proposition deleted successfully") {
                res.status(200).send(result);
            } else {
                res.status(404).send(result);
            }
        } catch (error) {
            res.status(500).send({ error: "Internal error" });
        }
    });


    app.post('/choice', async (req, res) => {
        try {
            const validation = choiceValidation.validate(req.body);
            if (validation.error) {
                res.status(400).send(generateValidationErrorMessage(validation.error.details));
                return;
            }
    
            const { choice, roundId } = validation.value;
            const token = req.headers['authorization']?.split(' ')[1];

            if (!token) return res.status(401).json({ "error": "Unauthorized" });
    
            // Trouver le token dans le référentiel des tokens avec la relation utilisateur
            const tokenRepo = AppDataSource.getRepository(Token);
            const tokenFound = await tokenRepo.findOne({ where: { token }, relations: ['user'] });
    
            if (!tokenFound) {
                return res.status(403).json({ "error": "Access Forbidden" });
            }
    
            if (!tokenFound.user) {
                return res.status(500).json({ "error": "Internal server error" });
            }
    
            // Trouver l'utilisateur associé au token
            const userRepo = AppDataSource.getRepository(User);
            const userFound = await userRepo.findOne({ where: { id: tokenFound.user.id } });
    
            if (!userFound) {
                return res.status(500).json({ "error": "Internal server error" });
            }
    
            const userId = userFound.id; // Assuming you have user authentication and user ID is available in req.user
    
            const voteRecordRepository = AppDataSource.getRepository(VoteRecord);
            const propositionRepository = AppDataSource.getRepository(Proposition);
    
            // Check if the user has already voted in this round
            const existingVote = await voteRecordRepository.findOne({
                where: {
                    user: { id: userId },
                    round: { id: roundId }
                }
            });
    
            if (existingVote) {
                res.status(400).send({ error: "You have already voted in this round." });
                return;
            }
    
            // Search for the proposition
            const proposition = await propositionRepository.findOne({
                where: {
                    description: choice,
                    round: { id: roundId }
                },
                relations: ['round']
            });
    
            if (!proposition) {
                res.status(404).send({ error: "Proposition not found" });
                return;
            }
    
            // Update the proposition if needed
            proposition.voices += 1;
            await propositionRepository.save(proposition);
    
            // Create a new vote record
            const voteRecord = new VoteRecord();
            voteRecord.user = { id: userId } as any; // Replace with actual user entity if needed
            voteRecord.round = { id: roundId } as any; // Replace with actual round entity if needed
            voteRecord.choice = choice;
            await voteRecordRepository.save(voteRecord);
    
            res.status(201).send(proposition);
        } catch (error) {
            console.error("Internal error:", error);
            res.status(500).send({ error: "Internal error" });
        }
    });
    
    

    








    app.post("/steps", adminMiddleware, async (req: Request, res: Response) => {
        const validation = stepValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { state, description, starting, ending, projetId }: StepRequest = validation.value;
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
    app.patch("/steps/:id", adminMiddleware, async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const validation = stepUpdateValidation.validate(req.body);
        if (validation.error) {
            res.status(400).send(generateValidationErrorMessage(validation.error.details));
            return;
        }

        const { state, description, starting, ending, projetId }: StepRequest = validation.value;
        try {
            const step = await stepUsecase.updateStep(id, { state, description, starting, ending, projetId });
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
    app.delete("/steps/:id", adminMiddleware, async (req: Request, res: Response) => {
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






    app.post('/upload', upload.single('file'), async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const buffer = Buffer.from(file.buffer);
            const readableStream = new Readable();
            readableStream._read = () => { }; // No-op
            readableStream.push(buffer);
            readableStream.push(null);

            const fileId = await documentUsecase.uploadFileToGoogleDrive(file.originalname, file.mimetype, readableStream);

            const docRepo = AppDataSource.getRepository(UserDocument);
            const token = req.headers['authorization']?.split(' ')[1];

            if (!token) return res.status(401).json({ "error": "Unauthorized" });
    
            // Trouver le token dans le référentiel des tokens avec la relation utilisateur
            const tokenRepo = AppDataSource.getRepository(Token);
            const tokenFound = await tokenRepo.findOne({ where: { token }, relations: ['user'] });
    
            if (!tokenFound) {
                return res.status(403).json({ "error": "Access Forbidden" });
            }
    
            if (!tokenFound.user) {
                return res.status(500).json({ "error": "Internal server error" });
            }
    
            // Trouver l'utilisateur associé au token
            const userRepo = AppDataSource.getRepository(User);
            const userFound = await userRepo.findOne({ where: { id: tokenFound.user.id } });
    
            if (!userFound) {
                return res.status(500).json({ "error": "Internal server error" });
            }
            
            const newDocument = docRepo.create({
                title: file.originalname,
                description: "...",
                type: file.mimetype,
                fileId:fileId ,
                user: userFound
            });
            docRepo.save(newDocument);
            res.json({ newDocument });
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'An unknown error occurred' });
            }
        }
    });

    app.get('/download/:fileId', async (req, res) => {
        try {
            const { fileId } = req.params;
            const fileStream = await documentUsecase.getGoogleDriveFile(fileId);
            fileStream.pipe(res);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'An unknown error occurred' });
            }
        }
    });

    app.get('/document', authMiddleware, async (req, res) => {
        try {
            // Récupérer le token d'autorisation des en-têtes de la requête
            const token = req.headers['authorization']?.split(' ')[1];
            if (!token) return res.status(401).json({ "error": "Unauthorized" });
    
            // Trouver le token dans le référentiel des tokens avec la relation utilisateur
            const tokenRepo = AppDataSource.getRepository(Token);
            const tokenFound = await tokenRepo.findOne({ where: { token }, relations: ['user'] });
    
            if (!tokenFound) {
                return res.status(403).json({ "error": "Access Forbidden" });
            }
    
            if (!tokenFound.user) {
                return res.status(500).json({ "error": "Internal server error" });
            }
    
            // Trouver l'utilisateur associé au token
            const userRepo = AppDataSource.getRepository(User);
            const userFound = await userRepo.findOne({ where: { id: tokenFound.user.id } });
    
            if (!userFound) {
                return res.status(500).json({ "error": "Internal server error" });
            }
    
            // Trouver tous les documents associés à l'utilisateur trouvé
            const docRepo = AppDataSource.getRepository(UserDocument);
            const docs = await docRepo.find({ where: { user: { id: userFound.id } } });
    
            // Retourner les documents trouvés
            return res.send(docs);
        } catch (error) {
            // Gestion des erreurs inattendues
            console.error('An unexpected error occurred:', error);
            return res.status(500).json({ "error": "Internal server error" });
        }
    });
    






    
} 

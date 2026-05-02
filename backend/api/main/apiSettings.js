const express = require('express');
const router = express.Router();
const database = require('#sql/main/databaseSettings.js');
const databaseLogs = require('#sql/admin/databaseLogs.js');
const auth = require('../../utils/auth.js');
const fs = require('fs/promises');
const { body, query } = require("express-validator");
const sharp = require('sharp');
const { sendDeleteEmail, sendChangeEmail, sendPasswordChangeEmail } = require('../../utils/mails.js');
const { validate } = require('../../utils/validate.js');
const AppError = require('#utils/app-error.js');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');
const { UPLOAD_ROOT } = require('#config/mapdatas-upload-config.js');
const { uploadMemory: upload } = require('#config/profile-pic-upload-config.js');

//Endpoints - settings

router.get('/users/me', auth.checkAuth, async (request, response) => {
    try {
        let users = await database.getUser(request.session.userid);
        let userData = users[0];
        if (userData) {
            if (userData.role && userData.role !== request.session.role) {
                request.session.role = userData.role;
            } else if (!userData.role) {
                userData.role = request.session.role;
            }
        }
        response.status(200).json({ users: userData });
    } catch (error) {
        response.status(500).json({ error: request.t('main:apiSettings.getUserData.error') });
    }
})

router.put('/users/me', auth.checkAuth,
    [
        body("username")
            .optional({ nullable: true })
            .not().isEmail().withMessage((value, { req }) => req.t('main:apiSettings.updateUser.validation_username_no_email'))
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/).withMessage((value, { req }) => req.t('main:apiSettings.updateUser.validation_username_invalid_chars'))
            .isLength({ min: 1, max: 20 }).withMessage((value, { req }) => req.t('main:apiSettings.updateUser.validation_username_length')),
        body("email")
            .optional({ nullable: true })
            .isEmail().withMessage((value, { req }) => req.t('main:apiSettings.updateUser.validation_email_format'))
            .isLength({ min: 5, max: 254 }).withMessage((value, { req }) => req.t('main:apiSettings.updateUser.validation_email_length')),
        body("language")
            .optional({ values: "null" })
            .isString().withMessage((value, { req }) => req.t('main:apiSettings.updateUser.validation_language_format'))
            .isIn(['en', 'hu']).withMessage((value, { req }) => req.t('main:apiSettings.updateUser.validation_language_values')),

        body("darkmode")
            .optional({ values: "null" })
            .isBoolean().withMessage((value, { req }) => req.t('main:apiSettings.updateUser.validation_darkmode_boolean'))
    ], validate, async (request, response) => {
        try {
            let { username, email, language, darkmode } = request.body;
            let result = await database.updateUser(request.session.userid, username, email, language, darkmode);
            if (result == 1) {
                if (language) request.session.userLanguage = language;
                await databaseLogs.addLog(request.session.userid, 'User update');
                response.status(200).json({ message: request.t('main:apiSettings.updateUser.success') });
                // await sendChangeEmail(email, username);
            }
            else {
                response.status(200).json({ message: request.t('main:apiSettings.updateUser.no_change') });
            }
        } catch (error) {
            if (error instanceof AppError) {
                response.status(error.statusCode).json({ error: error.message });
            } else {
                response.status(500).json({ error: request.t('main:apiSettings.updateUser.error') });
            }
        }
    })

router.put("/users/me/password", auth.checkAuth,
    [
        body("oldPass")
            .isLength({ min: 8, max: 60 }).withMessage((value, { req }) => req.t('main:apiSettings.updatePassword.validation_old_password_length')),
        body("newPass")
            .isLength({ min: 8, max: 60 }).withMessage((value, { req }) => req.t('main:apiSettings.updatePassword.validation_new_password_length'))
            .matches(/\d/).withMessage((value, { req }) => req.t('main:apiSettings.updatePassword.validation_new_password_digit'))
            .matches(/[A-Z]/).withMessage((value, { req }) => req.t('main:apiSettings.updatePassword.validation_new_password_uppercase'))
    ], validate,
    async (request, response) => {
        try {
            let { oldPass, newPass } = request.body;
            let { email, username } = await database.updatePassword(request.session.userid, oldPass, newPass);
            await databaseLogs.addLog(request.session.userid, 'Password update');
            // await sendPasswordChangeEmail(email, username);
            response.status(200).json({ message: request.t('main:apiSettings.updatePassword.success') });
        } catch (error) {
            response.status(500).json({ error: request.t('main:apiSettings.updatePassword.error') });
        }
    })

router.delete("/users/me", auth.checkAuth, async (request, response) => {
    try {
        let userid = request.session.userid;
        let { email, username } = await database.userToInactive(userid);
        request.session.destroy(async (error) => {
            if (error) {
                response.status(500).json({ success: false, error: error });
            }
            else {
                await databaseLogs.addLog(userid, 'User delete');
                response.clearCookie('geo.sid');
                // await sendDeleteEmail(email, username);
                response.status(200).json({ success: true, message: request.t('main:apiSettings.inactiveUser.success') });
            }
        });

    } catch (error) {
        if (error instanceof AppError) {
            response.status(error.statusCode).json({ error: error.message });
        } else {
            response.status(500).json({ error: request.t('main:apiSettings.inactiveUser.error') });
        }
    }
})

router.put('/users/me/profile-picture', auth.checkAuth, upload.single('profilePic'), async (request, response) => {
    let originalFile;
    let newFilePath;
    try {
        if (request.fileValidationError) {
            response.status(400).json({ error: request.t('main:apiSettings.updateProfilePic.invalid_file_type') });
        }
        else {
            if (!request.file) {
                response.status(400).json({ error: request.t('main:apiSettings.updateProfilePic.no_image') });
            }
            else {
                originalFile = request.file.path;
                let newFileName = `processed-${Date.now()}.webp`;
                newFilePath = path.join('uploads', newFileName);

                //Kép tömöritése
                sharp.cache(false);
                const metadata = await sharp(originalFile)
                    .rotate()
                    .resize(400, 400, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .toFormat('webp')
                    .toFile(newFilePath);

                let { width, height } = metadata;
                let finalUrl = `${newFileName}`;
                let lastPfp = await database.uploadProfilePic(finalUrl, width, height, request.session.userid);

                await fs.unlink(originalFile).catch(() => { });

                if (lastPfp) {
                    let lastPfpPath = path.join(__dirname, '..', 'uploads', lastPfp);
                    await fs.unlink(lastPfpPath).catch((err) => {
                        console.error("Régi kép törlése sikertelen:", err.path);
                    });
                }
                await databaseLogs.addLog(request.session.userid, 'Profile picture update');
                response.status(201).json({ success: true, message: request.t('main:apiSettings.updateProfilePic.success') });
            }
        }
    } catch (error) {
        if (originalFile) {
            await fs.unlink(originalFile).catch(() => { });
        }
        if (newFilePath) {
            await fs.unlink(newFilePath).catch(() => { });
        }
        if (error instanceof AppError) {
            response.status(error.statusCode).json({ error: error.message });
        } else {
            response.status(500).json({ error: request.t('main:apiSettings.updateProfilePic.error') });
        }
    }
})

router.delete('/users/me/profile-picture', auth.checkAuth, async (request, response) => {
    try {
        let lastPfp = await database.deleteProfilePic(request.session.userid);
        if (!lastPfp) {
            response.status(200).json({ success: true, message: request.t('main:apiSettings.deleteProfilePic.already_default') });
        }
        else {
            let lastPfpPath = path.join(__dirname, '..', 'uploads', lastPfp);
            try {
                await fs.unlink(lastPfpPath);
            } catch (error) {
                console.log("a kép nincs a szerveren!" + error);
            }
            await databaseLogs.addLog(request.session.userid, 'Profile picture delete');
            response.status(201).json({ success: true, message: request.t('main:apiSettings.deleteProfilePic.success') });
        }
    } catch (error) {
        if (error instanceof AppError) {
            response.status(error.statusCode).json({ error: error.message });
        } else {
            response.status(500).json({ error: request.t('main:apiSettings.deleteProfilePic.error') });
        }
    }
})

router.get('/users/profile-picture', auth.checkAuth,
    [
        query("route").matches(/^[a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+$/).withMessage((value, { req }) => req.t('main:apiSettings.getProfilePic.validation_invalid_filename'))
    ], validate, (request, response) => {
        try {
            let pfproute = request.query.route;
            const root = path.join(__dirname, '..', 'uploads');

            response.sendFile(pfproute, { root: root }, (err) => {
                if (err) {
                    console.log("Hiba a fájl küldéskor:", err);
                    response.status(err.status || 404).send();
                }
            });
        } catch (error) {
            response.status(500).json({ error: request.t('main:apiSettings.getProfilePic.error') })
        }
    })

module.exports = router;
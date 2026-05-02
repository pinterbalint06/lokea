const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const bcrypt = require('bcrypt');
const { body, query, param, validationResult } = require('express-validator');
const sharp = require('sharp');
const { sendWelcomeEmail, sendChangeEmail, sendDeleteEmail } = require('#utils/mails.js');
const { validate } = require('#utils/validate.js');

//?SQL
const databaseUsers = require('#sql/admin/databaseUsers.js');
const databaseLogs = require('#sql/admin/databaseLogs.js');

//!Multer
const multer = require('multer'); //?npm install multer
const path = require('path');
const { UPLOAD_ROOT } = require('#config/mapdatas-upload-config.js');
const { uploadMemory: upload } = require('#config/profile-pic-upload-config.js');

//API endpoints

//GET

router.get('/users', async (request, response) => {
    try {
        let users = await databaseUsers.getUsers();
        response.status(200).json({ users: users.rows, total: users.total, message: request.t('admin:usersApi.fetch_success') });
    } catch (error) {
        response.status(500).json({ error: request.t('admin:usersApi.fetch_all_error') });
    }
})

router.get('/users/sorted', [
    query('mireKeresek')
        .optional({ values: 'null' })
        .isIn(['user_id', 'username', 'email']).withMessage((value, { req }) => req.t('admin:usersApi.validation_search_type_invalid')),
    query('mit')
        .optional({ values: 'null' })
        .matches(/^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű0-9@._-]*$/).withMessage((value, { req }) => req.t('admin:usersApi.validation_search_value_invalid_chars'))
        .isLength({ max: 254 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_search_value_length')),
    query('status')
        .isIn(['statusActive', 'statusDeleted', 'statusAny']).withMessage((value, { req }) => req.t('admin:usersApi.validation_status_invalid')),
    query('adminChecked')
        .isBoolean().withMessage((value, { req }) => req.t('admin:usersApi.validation_admin_checked_boolean')),
    query('modChecked')
        .isBoolean().withMessage((value, { req }) => req.t('admin:usersApi.validation_mod_checked_boolean')),
    query('userChecked')
        .isBoolean().withMessage((value, { req }) => req.t('admin:usersApi.validation_user_checked_boolean')),
    query('lordChecked')
        .isBoolean().withMessage((value, { req }) => req.t('admin:usersApi.validation_user_checked_boolean')),
    query('page')
        .isInt({ min: 1 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_page_number_invalid'))
        .toInt()
], validate,
    async (request, response) => {
        try {
            let { mireKeresek, mit, status, adminChecked, modChecked, userChecked, lordChecked, page } = request.query;

            let users = await databaseUsers.sortedUsers(
                mireKeresek,
                mit,
                status,
                adminChecked,
                modChecked,
                userChecked,
                lordChecked,
                page
            );

            response.status(200).json({ users: users.rows, total: users.total, message: request.t('admin:usersApi.fetch_success') });
        } catch (error) {
            response.status(500).json({ error: request.t('admin:usersApi.fetch_sorted_error') });
        }
    });

router.get('/users/:id',
    [
        param('id')
            .isInt({ min: 1 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_user_id_invalid'))
            .toInt()
    ], validate,
    async (request, response) => {
        try {
            let params = request.params.id;
            let users = await databaseUsers.getUser(params);
            if (!users || users.length === 0) {
                response.status(404).json({ error: request.t('admin:usersApi.not_found') });
            }
            else {
                response.status(200).json({ message: request.t('admin:usersApi.fetch_success'), user: users[0] });
            }
        } catch (error) {
            response.status(500).json({ error: request.t('admin:usersApi.fetch_one_error') });
        }
    })

//POST

router.post("/users",
    [
        body("username")
            .not().isEmail().withMessage((value, { req }) => req.t('admin:usersApi.validation_username_no_email'))
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]*$/).withMessage((value, { req }) => req.t('admin:usersApi.validation_username_invalid_chars'))
            .isLength({ min: 1, max: 20 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_username_length')),
        body("email")
            .isEmail().withMessage((value, { req }) => req.t('admin:usersApi.validation_email_format'))
            .isLength({ min: 5, max: 254 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_email_length')),
        body("password")
            .isLength({ min: 8, max: 50 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_password_length'))
            .matches(/\d/).withMessage((value, { req }) => req.t('admin:usersApi.validation_password_digit'))
            .matches(/[A-Z]/).withMessage((value, { req }) => req.t('admin:usersApi.validation_password_uppercase')),
        body("role")
            .isIn(['user', 'MOD', 'ADMIN', 'LORD']).withMessage((value, { req }) => req.t('admin:usersApi.validation_role_invalid')),
    ], validate,
    async (request, response) => {
        try {
            const { username, email, password, role } = request.body;
            if ((role === 'ADMIN' || role === 'LORD') && request.session.role !== 'LORD') {
                return response.status(403).json({ error: request.t('admin:usersApi.permission_denied') });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            let insert = await databaseUsers.newUserFromAdmin(username, email, hashedPassword, role);
            if (insert.success) {
                await databaseLogs.addLog(request.session.userid, 'Sign up (A)', insert.insertId);
                sendWelcomeEmail(email, username).catch(err => console.log("Email hiba:", err.message));
                response.status(201).json({
                    success: true,
                    message: request.t('admin:usersApi.signup_success')
                });
            }
            else {
                if (insert.error === 'User exists') {
                    response.status(409).json({ error: request.t('admin:usersApi.error_user_exists') });
                }
                else {
                    throw new Error(request.t('admin:usersApi.signup_failed_generic'));
                }
            }
        } catch (error) {
            response.status(500).json({ error: request.t('admin:usersApi.signup_error') });
        }
    }
);

router.post('/users/exports',
    [
        body('mireKeresek')
            .optional({ values: 'null' })
            .isIn(['user_id', 'username', 'email']).withMessage((value, { req }) => req.t('admin:usersApi.validation_search_type_invalid')),
        body('mit')
            .optional({ values: 'null' })
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_.@-]*$/).withMessage((value, { req }) => req.t('admin:usersApi.validation_search_value_invalid_chars'))
            .isLength({ max: 254 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_search_value_length')),
        body('status')
            .isIn(['statusActive', 'statusDeleted', 'statusAny']).withMessage((value, { req }) => req.t('admin:usersApi.validation_status_invalid')),
        body('adminChecked')
            .isBoolean().withMessage((value, { req }) => req.t('admin:usersApi.validation_admin_checked_boolean')),
        body('modChecked')
            .isBoolean().withMessage((value, { req }) => req.t('admin:usersApi.validation_mod_checked_boolean')),
        body('userChecked')
            .isBoolean().withMessage((value, { req }) => req.t('admin:usersApi.validation_user_checked_boolean')),
        body('lordChecked')
            .isBoolean().withMessage((value, { req }) => req.t('admin:usersApi.validation_user_checked_boolean')),
    ], validate,
    async (request, response) => {
        try {
            let { mireKeresek, mit, status, adminChecked, modChecked, userChecked, lordChecked } = request.body;
            let users = (await databaseUsers.sortedUsers(mireKeresek, mit, status, adminChecked, modChecked, userChecked, lordChecked, 1, 999999)).rows;

            let csvContent = "\uFEFFID;Username;Email;Status;Role\n";

            users.forEach(user => {
                let statusText = user.deleted_at ? "Deleted" : "Active";
                csvContent += `${user.user_id};${user.username};${user.email};${statusText};${user.role}\n`;
            });

            response.setHeader('Content-Type', 'text/csv; charset=utf-8');
            response.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');

            response.status(200).send(csvContent);

        } catch (error) {
            console.error(error.message);
            response.status(500).json({ error: request.t('admin:usersApi.export_error') });
        }
    });

//PUT

router.put('/users/self',
    [
        body("username")
            .optional({ values: 'null' })
            .not().isEmail().withMessage((value, { req }) => req.t('admin:usersApi.validation_username_no_email'))
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/).withMessage((value, { req }) => req.t('admin:usersApi.validation_username_invalid_chars'))
            .isLength({ min: 1, max: 20 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_username_length')),
        body("email")
            .optional({ values: 'null' })
            .isEmail().withMessage((value, { req }) => req.t('admin:usersApi.validation_email_format'))
            .isLength({ min: 5, max: 254 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_email_length')),
    ], validate,
    async (request, response) => {
        try {
            let { username, email } = request.body;

            let targetUser = await databaseUsers.getUser(request.session.userid);
            if (!targetUser || targetUser.length === 0) {
                response.status(404).json({ error: request.t('admin:usersApi.update_not_found_or_inactive') });
            }
            else {
                let success = await databaseUsers.updateUserByAdmin(request.session.userid, username, email);
                if (success === 'User exists') {
                    response.status(409).json({ error: request.t('admin:usersApi.error_user_exists') });
                }
                else {
                    if (success == 1) {
                        await databaseLogs.addLog(request.session.userid, 'User update');
                        let targetEmail = email || targetUser[0].email;
                        let targetUsername = username || targetUser[0].username;
                        sendChangeEmail(targetEmail, targetUsername).catch(err => console.log("Email hiba:", err.message));
                        response.status(200).json({ message: request.t('admin:usersApi.update_success') });
                    }
                    else {
                        response.status(404).json({ error: request.t('admin:usersApi.update_not_found_or_inactive') });
                    }
                }
            }
        } catch (error) {
            response.status(500).json({ error: request.t('admin:usersApi.update_error') });
        }
    })

router.put('/users/:id',
    [
        param("id")
            .isInt({ min: 1 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_user_id_invalid'))
            .toInt(),
        body("username")
            .optional({ values: 'null' })
            .not().isEmail().withMessage((value, { req }) => req.t('admin:usersApi.validation_username_no_email'))
            .matches(/^[a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+$/).withMessage((value, { req }) => req.t('admin:usersApi.validation_username_invalid_chars'))
            .isLength({ min: 1, max: 20 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_username_length')),
        body("email")
            .optional({ values: 'null' })
            .isEmail().withMessage((value, { req }) => req.t('admin:usersApi.validation_email_format'))
            .isLength({ min: 5, max: 254 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_email_length')),
        body("role")
            .optional({ values: 'null' })
            .isIn(['user', 'MOD', 'ADMIN', 'LORD']).withMessage((value, { req }) => req.t('admin:usersApi.validation_role_invalid')),
    ], validate,
    async (request, response) => {
        try {
            let user_id = request.params.id;
            let { username, email, role } = request.body;
            let targetUser = await databaseUsers.getUser(user_id);
            if (!targetUser || targetUser.length === 0) {
                return response.status(404).json({ error: request.t('admin:usersApi.not_found') });
            }
            let targetRole = targetUser[0].role;
            if ((targetRole === 'ADMIN' || targetRole === 'LORD') && request.session.role !== 'LORD') {
                return response.status(403).json({ error: request.t('admin:usersApi.permission_denied') });
            }
            if (role && (role === 'ADMIN' || role === 'LORD') && request.session.role !== 'LORD') {
                return response.status(403).json({ error: request.t('admin:usersApi.permission_denied') });
            }
            let success = await databaseUsers.updateUserByAdmin(user_id, username, email, role);
            if (success === 'User exists') {
                return response.status(409).json({ error: request.t('admin:usersApi.error_user_exists') });
            }
            if (success == 1) {
                await databaseLogs.addLog(request.session.userid, 'User update (A)', user_id);
                let targetEmail = email || targetUser[0].email;
                let targetUsername = username || targetUser[0].username;
                sendChangeEmail(targetEmail, targetUsername).catch(err => console.log("Email hiba:", err.message));
                response.status(200).json({ message: request.t('admin:usersApi.update_success') });
            }
            else {
                response.status(404).json({ error: request.t('admin:usersApi.update_not_found_or_inactive') });
            }
        } catch (error) {
            response.status(500).json({ error: request.t('admin:usersApi.update_error') });
        }
    })

router.put('/users/:id/profile-picture',
    (request, response, next) => {
        upload.single('profilePic')(request, response, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    request.fileValidationError = 'A fájl túl nagy! Maximum 5 MB engedélyezett.';
                } else {
                    request.fileValidationError = `Feltöltési hiba: ${err.message}`;
                }
            } else if (err) {
                return response.status(500).json({ error: 'Rendszerhiba a feltöltés során.' });
            }
            next();
        });
    },
    [
        param("id")
            .isInt({ min: 1 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_user_id_invalid'))
            .toInt()
    ], validate,
    async (request, response) => {
        let newFilePath = null;
        try {
            if (request.fileValidationError) {
                return response.status(400).json({ error: request.fileValidationError });
            }
            if (!request.file) {
                return response.status(400).json({ error: request.t('admin:usersApi.no_image_provided') });
            }

            let user_id = request.params.id;

            let newFileName = `processed-${Date.now()}.webp`;
            newFilePath = path.join(UPLOAD_ROOT, newFileName);

            sharp.cache(false);

            const metadata = await sharp(request.file.buffer)
                .rotate()
                .resize(400, 400, {
                    fit: 'cover',
                    position: 'center'
                })
                .toFormat('webp')
                .toFile(newFilePath);

            let { width, height } = metadata;
            let lastPfp = await databaseUsers.uploadProfilePic(newFileName, width, height, user_id);

            if (lastPfp) {
                let lastPfpPath = path.join(UPLOAD_ROOT, lastPfp);
                await fs.unlink(lastPfpPath).catch(() => { });
            }

            await databaseLogs.addLog(request.session.userid, 'Profile picture update (A)', user_id);
            return response.status(201).json({ success: true, message: request.t('admin:usersApi.profile_pic_update_success') });
        } catch (error) {
            console.error("Hiba a képfeldolgozás során:", error);
            if (newFilePath) await fs.unlink(newFilePath).catch(() => { });
            response.status(500).json({ error: request.t('admin:usersApi.profile_pic_update_error') });
        }
    }
);

//DELETE

router.delete('/users/:id',
    [
        body("role")
            .isIn(['user', 'MOD', 'ADMIN', 'LORD']).withMessage((value, { req }) => req.t('admin:usersApi.validation_role_invalid')),
        body("deleted")
            .isBoolean().withMessage((value, { req }) => req.t('admin:usersApi.validation_deleted_boolean')),
    ], validate,
    async (request, response) => {
        try {
            let userId = request.params.id;

            let targetUser = await databaseUsers.getUser(userId);
            if (!targetUser || targetUser.length === 0) {
                return response.status(404).json({ error: request.t('admin:usersApi.not_found') });
            }
            let targetRole = targetUser[0].role;

            if ((targetRole === 'ADMIN' || targetRole === 'LORD') && request.session.role !== 'LORD') {
                return response.status(403).json({ error: request.t('admin:usersApi.permission_denied') });
            }
            let result = await databaseUsers.userToInactive(userId);
            if (result.affectedRows === 0) {
                response.status(200).json({ message: request.t('admin:usersApi.deactivate_already_inactive') })
            }
            else {
                await databaseLogs.addLog(request.session.userid, 'User delete (A)', userId);
                sendDeleteEmail(result.email, result.username).catch(err => console.log("Email hiba:", err.message));
                response.status(200).json({ message: request.t('admin:usersApi.update_success') });
            }
        } catch (error) {
            response.status(500).json({ error: request.t('admin:usersApi.deactivate_error') });
        }
    })

router.delete('/users/:id/profile-picture',
    [
        param("id")
            .isInt({ min: 1 }).withMessage((value, { req }) => req.t('admin:usersApi.validation_user_id_invalid'))
            .toInt()
    ], validate,
    async (request, response) => {
        try {
            let user_id = request.params.id;
            let lastPfp = await databaseUsers.deleteProfilePic(user_id);

            if (!lastPfp) {
                response.status(200).json({ success: true, message: request.t('admin:usersApi.profile_pic_already_default') });
            }
            else {
                let lastPfpPath = path.join(UPLOAD_ROOT, lastPfp);
                await fs.unlink(lastPfpPath).catch(() => { });

                await databaseLogs.addLog(request.session.userid, 'Profile picture delete (A)', user_id);
                response.status(200).json({ success: true, message: request.t('admin:usersApi.profile_pic_delete_success') });
            }
        } catch (error) {
            response.status(500).json({ error: request.t('admin:usersApi.profile_pic_delete_error') });
        }
    });

module.exports = router;

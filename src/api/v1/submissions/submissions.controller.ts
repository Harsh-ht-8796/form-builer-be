import { NextFunction } from 'express';
import { ObjectId } from 'mongoose';
import {
    Authorized,
    Body,
    CurrentUser,
    Get,
    HttpCode,
    JsonController,
    Param,
    Post,
    QueryParam,
    QueryParams,
    UseBefore,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { IUserSchema } from '@models/users.model';
import { FormService } from '@services/v1';
import { SubmissionService } from '@services/v1/submission.service';
import { ISubmission } from '@models/submission.model';
import {
    SubmissionBodyDto,
    SubmissionDto,
    SubmissionResponseSchema,
    SubmissionSummaryResponseSchema,
    SubmissionSummaryQueryDto,
    SubmissionSummaryQueryIndivialDto,
    FieldQueryDto,
    FieldResponseSchema,
} from './dto/sumission.dto';
import conditionalAuth from '@middlewares/conditional.auth';
import auth from '@middlewares/auth.middleware';
import { UserRole } from '@common/types/roles';
import { IFormField } from '@models/form.model';

@JsonController('/v1/submissions', { transformResponse: false })
export class SubmissionController {
    private readonly submissionService = new SubmissionService();
    private readonly formService = new FormService();

    @Post('/form/:formId')
    @HttpCode(201)
    @OpenAPI({ summary: 'Submit a form', responses: SubmissionResponseSchema })
    @ResponseSchema(ISubmission)
    //@UseBefore(validationMiddleware(SubmissionBodyDto, 'body'))
    //@UseBefore(validationMiddleware(SubmissionParamsDto, 'params'))
    @UseBefore(conditionalAuth('formId'))
    async submitForm(
        @Param('formId') formId: ObjectId,
        @Body() submissionData: SubmissionBodyDto,
        @CurrentUser() user?: IUserSchema,
        next?: NextFunction
    ) {
        try {
            console.log('Submitting form withID:', formId, 'and data:', submissionData);
            const submissionPayload: SubmissionDto = {
                ...submissionData,
                formId,
                ...(user && user._id ? { submittedBy: user._id as ObjectId, orgId: user.orgId as ObjectId } : {}),
            };
            const submission = await this.submissionService.create(submissionPayload);

            const form = await this.formService.getById(formId);
            if (!form) {
                throw new Error('Form not found');
            }

            if (
                form?.settings &&
                form?.settings?.emailNotifications &&
                form?.settings?.emailNotifications?.length > 0
            ) {
                const emailData = {
                    to: form?.settings?.emailNotifications,
                    subject: `New submission for form ${form._id}`,
                    body: JSON.stringify(submission.data),
                };
                try {
                    await fetch(process.env.NODE_RED_URL!, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(emailData),
                    });
                } catch (error) {
                    console.error('Error sending email notification:', error);
                }
            }

            return submission;
        } catch (err) {
            next!(err);
        }
    }

    @Get('/summary')
    @OpenAPI({ summary: 'Get submission summary', responses: SubmissionSummaryResponseSchema })
    @UseBefore(auth())
    @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN])
    @ResponseSchema(ISubmission)
    async getSubmissionSummary(
        @CurrentUser() userDetails: IUserSchema,
        @QueryParams() query: SubmissionSummaryQueryDto
    ) {
        try {
            const summary = await this.submissionService.getSubmissionSummary(
                userDetails,
                query
            );
            return { summary };
        } catch (err) {
            console.error(err);
            throw new Error('Error fetching submission summary');
        }
    }


    @Get("/overview-cards")
    @UseBefore(auth())
    @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN])
    async getOverViewCard(@CurrentUser() userDetails: IUserSchema) {
        const overviewCards = await this.submissionService.getOverViewCard(userDetails)
        return { overviewCards }
    }

    @Get('/:id/individual')
    @OpenAPI({ summary: 'Get a submission by ID', responses: SubmissionResponseSchema })
    @ResponseSchema(ISubmission)
    async getSubmissionByFormId(
        @Param("id") id: ObjectId,
        @QueryParams() query: SubmissionSummaryQueryIndivialDto
    ) {

        const { limit, page } = query
        try {
            const submission = await this.submissionService.findAll({
                formId: id
            }, Number(limit),
                Number(page));
            if (!submission) {
                throw new Error('Submission not found');
            }
            return submission;
        } catch (err) {

            throw new Error('Submission something goes wrong');
        }
    }


    @Get('/:id/submitted-by/question')
    @OpenAPI({ summary: 'Get a submission by ID', responses: SubmissionResponseSchema })
    @ResponseSchema(ISubmission)
    async getSubmissionByQuestion(
        @Param("id") id: ObjectId,
        @QueryParams() query: SubmissionSummaryQueryIndivialDto
    ) {

        const { limit, page } = query
        try {
            const submission = await this.submissionService.findAll({
                formId: id
            }, Number(limit),
                Number(page));
            if (!submission) {
                throw new Error('Submission not found');
            }
            return submission;
        } catch (err) {

            throw new Error('Submission something goes wrong');
        }
    }

    @Get('/form/:formId')
    @OpenAPI({ summary: 'Get submissions by form ID', responses: SubmissionResponseSchema })
    @ResponseSchema(ISubmission, { isArray: true })
    @UseBefore(conditionalAuth())
    async getSubmissions(
        @Param('formId') formId: ObjectId,
        @QueryParam('limit') limit?: number,
        @QueryParam('skip') skip?: number
    ) {
        return this.submissionService.findSubmissionsByFormId(formId, { limit, page: skip });
    }



    @Get('/:id')
    @OpenAPI({ summary: 'Get a submission by ID', responses: SubmissionResponseSchema })
    @ResponseSchema(ISubmission)
    @UseBefore(conditionalAuth())
    async getSubmission(@Param('id') id: ObjectId, next: NextFunction) {
        try {
            const submission = await this.submissionService.getById(id);
            if (!submission) {
                throw new Error('Submission not found');
            }
            return submission;
        } catch (err) {
            next(err);
        }
    }

    @Get('/form/:formId/fields/summary/short-answer')
    @OpenAPI({ summary: 'Get specific form fields by IDs with pagination', responses: FieldResponseSchema })
    @ResponseSchema(IFormField, { isArray: true })
    @UseBefore(auth())
    @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN])
    async getFormFields(
        @Param('formId') formId: ObjectId,
        @QueryParams() query: FieldQueryDto,
        next: NextFunction
    ) {
        try {
            const { fieldIds, page, limit } = query;
            const result = await this.submissionService.getFieldAnswers(formId, {
                fieldIds: fieldIds || [], // Default to empty array if fieldIds is undefined
                page,
                limit
            });
            return result;
        } catch (err) {
            next(err);
        }
    }


    @Get('/form/:formId/fields/question')
    @OpenAPI({ summary: 'Get specific form fields by IDs with pagination', responses: FieldResponseSchema })
    @ResponseSchema(IFormField, { isArray: true })
    @UseBefore(auth())
    @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN])
    async getResponseAnswerWisewithUser(
        @Param('formId') formId: ObjectId,
        @QueryParams() query: FieldQueryDto,
    ) {
        try {
            const { fieldIds, page, limit } = query;
            const result = await this.submissionService.getFieldAnswersWithUsers(formId, {
                fieldIds: fieldIds || [], // Default to empty array if fieldIds is undefined
                page,
                limit
            });
            return result;
        } catch (err) {
            return { messge: "Some thing goees worng" };
        }
    }


    @Get('/form/:formId/field/:fieldId/answers')
    @OpenAPI({ summary: 'Get answers for a specific form field by formId and fieldId', responses: FieldResponseSchema })
    @ResponseSchema(IFormField, { isArray: true })
    @UseBefore(auth())
    @Authorized([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN])
    async getFieldAnswersByFieldId(
        @Param('formId') formId: ObjectId,
        @Param('fieldId') fieldId: string,
        @QueryParams() query: FieldQueryDto,
    ) {
        try {
            const result = await this.submissionService.getFieldAnswersByFieldId(formId, fieldId, query);
            return result;
        } catch (err) {
            return { message: 'Something went wrong' };
        }
    }


}
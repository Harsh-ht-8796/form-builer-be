import { NextFunction } from 'express';
import { ObjectId } from 'mongoose';
import { Authorized, Body, CurrentUser, Get, HttpCode, JsonController, Param, Post, QueryParam, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { IUserSchema } from '@models/users.model';
import { FormService } from '@services/v1';
import { SubmissionService } from '@services/v1/submission.service';
import { ISubmission } from '@models/submission.model';
import { SubmissionBodyDto, SubmissionDto, SubmissionParamsDto, SubmissionResponseSchema, SubmissionSummaryResponseSchema } from './dto/sumission.dto';
import conditionalAuth from '@middlewares/conditional.auth';

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
            console.log('Submitting form with ID:', formId, 'and data:', submissionData);
            const submissionPayload: SubmissionDto = {
                ...submissionData,
                formId,
                ...(user && user._id ? { submittedBy: user._id as ObjectId } : {})
            };
            const submission = await this.submissionService.create(submissionPayload);

            const form = await this.formService.getById(formId);
            if (!form) {
                throw new Error('Form not found');
            }

            if (form?.settings && form?.settings?.emailNotifications && form?.settings?.emailNotifications?.length > 0) {
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
    @ResponseSchema(ISubmission)
    async getSubmissionSummary(@QueryParam('accessibility') accessibility?: string) {
        try {
            const summary = await this.submissionService.getSubmissionSummary(accessibility);
            return { summary };
        } catch (err) {
            throw new Error('Error fetching submission summary');
        }
    }
    @Get('/form/:formId')
    @OpenAPI({ summary: 'Get submissions by form ID', responses: SubmissionResponseSchema })
    @ResponseSchema(ISubmission, { isArray: true })
    @UseBefore(conditionalAuth())
    async getSubmissions(
        @Param('formId') formId: ObjectId,
        // @QueryParam('filter') filter?: string,
        @QueryParam('limit') limit?: number,
        @QueryParam('skip') skip?: number,
        // @QueryParam('sort') sort?: string
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


}
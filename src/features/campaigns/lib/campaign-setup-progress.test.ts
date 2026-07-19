import { describe, expect, it } from 'vitest';

import {
  deriveCampaignSetupProgress,
  isValidContactList,
  isValidEmailTemplate,
  isValidSurveyForm,
  resolveCampaignSetupQueryState
} from '@/features/campaigns/lib/campaign-setup-progress';
import { EmailListStatusEnum } from '@/lib/api/generated/model/emailListStatusEnum';
import { EmailTemplateStatusEnum } from '@/lib/api/generated/model/emailTemplateStatusEnum';
import { Status37cEnum } from '@/lib/api/generated/model/status37cEnum';

describe('campaign setup progress', () => {
  it('marks contact list as current when user has no resources', () => {
    const progress = deriveCampaignSetupProgress({
      validContactListsCount: 0,
      validSurveyFormsCount: 0,
      validEmailTemplatesCount: 0,
      campaignsCount: 0
    });

    expect(progress.currentStepKey).toBe('contact-list');
    expect(progress.steps.map((step) => step.status)).toEqual([
      'current',
      'pending',
      'pending',
      'blocked'
    ]);
    expect(progress.progressPercent).toBe(0);
    expect(progress.canCreateCampaign).toBe(false);
  });

  it('marks step 1 completed and step 2 as current when list exists', () => {
    const progress = deriveCampaignSetupProgress({
      validContactListsCount: 1,
      validSurveyFormsCount: 0,
      validEmailTemplatesCount: 0,
      campaignsCount: 0
    });

    expect(progress.currentStepKey).toBe('survey-form');
    expect(progress.steps[0]?.status).toBe('completed');
    expect(progress.steps[1]?.status).toBe('current');
    expect(progress.steps[3]?.status).toBe('blocked');
  });

  it('marks step 3 as current when list and form exist', () => {
    const progress = deriveCampaignSetupProgress({
      validContactListsCount: 1,
      validSurveyFormsCount: 1,
      validEmailTemplatesCount: 0,
      campaignsCount: 0
    });

    expect(progress.currentStepKey).toBe('email-template');
    expect(progress.steps[0]?.status).toBe('completed');
    expect(progress.steps[1]?.status).toBe('completed');
    expect(progress.steps[2]?.status).toBe('current');
    expect(progress.steps[3]?.status).toBe('blocked');
  });

  it('enables campaign creation when all dependencies exist', () => {
    const progress = deriveCampaignSetupProgress({
      validContactListsCount: 1,
      validSurveyFormsCount: 1,
      validEmailTemplatesCount: 1,
      campaignsCount: 0
    });

    expect(progress.canCreateCampaign).toBe(true);
    expect(progress.currentStepKey).toBe('campaign');
    expect(progress.steps[3]?.status).toBe('current');
  });

  it('marks roadmap as completed when dependencies and campaign exist', () => {
    const progress = deriveCampaignSetupProgress({
      validContactListsCount: 3,
      validSurveyFormsCount: 2,
      validEmailTemplatesCount: 4,
      campaignsCount: 1
    });

    expect(progress.currentStepKey).toBeNull();
    expect(progress.isRoadmapCompleted).toBe(true);
    expect(progress.steps.every((step) => step.status === 'completed')).toBe(true);
    expect(progress.progressPercent).toBe(100);
  });

  it('recalculates dependencies when a previously existing resource is removed', () => {
    const progress = deriveCampaignSetupProgress({
      validContactListsCount: 0,
      validSurveyFormsCount: 1,
      validEmailTemplatesCount: 1,
      campaignsCount: 1
    });

    expect(progress.currentStepKey).toBe('contact-list');
    expect(progress.hasContactList).toBe(false);
    expect(progress.steps[0]?.status).toBe('current');
    expect(progress.steps[3]?.status).toBe('completed');
  });

  it('returns loading state when any query is pending', () => {
    const state = resolveCampaignSetupQueryState({
      isListsLoading: false,
      isFormsLoading: true,
      isTemplatesLoading: false,
      isCampaignsLoading: false,
      listsError: null,
      formsError: null,
      templatesError: null,
      campaignsError: null
    });

    expect(state.isLoading).toBe(true);
    expect(state.hasError).toBe(false);
  });

  it('returns error state when any query fails', () => {
    const state = resolveCampaignSetupQueryState({
      isListsLoading: false,
      isFormsLoading: false,
      isTemplatesLoading: false,
      isCampaignsLoading: false,
      listsError: null,
      formsError: new Error('network'),
      templatesError: null,
      campaignsError: null
    });

    expect(state.isLoading).toBe(false);
    expect(state.hasError).toBe(true);
  });

  it('accepts only active contact lists', () => {
    expect(isValidContactList({ status: EmailListStatusEnum.ACTIVE } as never)).toBe(true);
    expect(isValidContactList({ status: EmailListStatusEnum.INACTIVE } as never)).toBe(false);
  });

  it('accepts only active survey forms', () => {
    expect(isValidSurveyForm({ status: Status37cEnum.ACTIVE } as never)).toBe(true);
    expect(isValidSurveyForm({ status: Status37cEnum.DRAFT } as never)).toBe(false);
    expect(isValidSurveyForm({ status: Status37cEnum.ARCHIVED } as never)).toBe(false);
  });

  it('accepts only active email templates', () => {
    expect(isValidEmailTemplate({ status: EmailTemplateStatusEnum.ACTIVE } as never)).toBe(true);
    expect(isValidEmailTemplate({ status: EmailTemplateStatusEnum.DRAFT } as never)).toBe(false);
    expect(isValidEmailTemplate({ status: EmailTemplateStatusEnum.INACTIVE } as never)).toBe(false);
  });
});

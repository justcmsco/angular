import { InjectionToken } from '@angular/core';

export interface JustCmsConfig {
  apiToken: string;
  projectId: string;
}

export const JUST_CMS_CONFIG = new InjectionToken<JustCmsConfig>('JUST_CMS_CONFIG');

/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { coreConfig } from './app/core/core.config';
import { Core } from './app/core/core';

bootstrapApplication(Core, coreConfig).catch((err) => console.error(err));

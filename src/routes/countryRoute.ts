import { Router } from 'express';
import * as countryController from '../controllers/countryController.ts';

const router = Router();
router.post('/countries/refresh', countryController.refreshCountries);
router.get('/countries', countryController.getCountries);
router.get('/countries/image', countryController.getSummaryImage);
router.get('/countries/:name', countryController.getCountryByName);
router.delete('/countries/:name', countryController.deleteCountry);
router.get('/status', countryController.getStatus);

export default router;

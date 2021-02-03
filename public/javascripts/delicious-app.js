import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomplete from './modules/autocomplete';

// Get the address, lat, lng fields from the page
autocomplete( $('#address'), $('#lat'), $('#lng') );

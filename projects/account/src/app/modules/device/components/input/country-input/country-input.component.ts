/*! *****************************************************************************
SPDX-License-Identifier: Apache-2.0


Copyright (c) Mycroft AI Inc. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import { map, startWith, tap } from 'rxjs/operators';

import { Country } from '@account/models/country.model';
import { GeographyService } from '@account/http/geography_service';
import { Observable } from 'rxjs';

@Component({
    selector: 'account-country-input',
    templateUrl: './country-input.component.html',
    styleUrls: ['./country-input.component.scss']
})
export class CountryInputComponent implements OnInit {
    private countries: Country[];
    @Input() countryControl: AbstractControl;
    @Output() countrySelected = new EventEmitter<Country>();
    public filteredCountries$: Observable<Country[]>;
    @Input() required: boolean;

    constructor(private geoService: GeographyService) { }

    ngOnInit() {
        this.geoService.getCountries().subscribe(
            (countries) => {
                this.countries = countries;
                this.countryControl.validator = this.countryValidator();
                this.filteredCountries$ = this.countryControl.valueChanges.pipe(
                    startWith(''),
                    map((value) => this.filterCountries(value)),
                    tap(() => { this.emitSelectedCountry(); })
                );
            }
        );
    }

    // getCountries() {
    //     if (!this.countries) {
    //         this.geoService.getCountries().subscribe(
    //             (countries) => {
    //                 this.countries = countries;
    //                 this.countryControl.validator = this.countryValidator();
    //                 this.filteredCountries$ = this.countryControl.valueChanges.pipe(
    //                     startWith(''),
    //                     map((value) => this.filterCountries(value)),
    //                     tap(() => { this.emitSelectedCountry(); })
    //                 );
    //             }
    //         );
    //     }
    // }

    private filterCountries(value: string): Country[] {
        const filterValue = value.toLowerCase();
        let filteredCountries: Country[];

        if (this.countries) {
            filteredCountries = this.countries.filter(
                (country) => country.name.toLowerCase().includes(filterValue)
            );
        } else {
            filteredCountries = [];
        }

        return filteredCountries;
    }

    countryValidator(): ValidatorFn {
        return (countryControl: AbstractControl) => {
            let valid = true;
            if (countryControl.value) {
                const foundCountry = this.countries.find(
                    (country) => country.name === countryControl.value
                );
                if (!foundCountry) {
                    valid = false;
                }
            }
            return valid ? null : {countryNotFound: true};

        };
    }

    emitSelectedCountry() {
        if (this.countryControl.valid) {
            if (this.countryControl.value) {
                const foundCountry = this.countries.find(
                    (country) => country.name === this.countryControl.value
                );
                this.countrySelected.emit(foundCountry);
            } else {
                this.countrySelected.emit(null);
            }
        } else {
            this.countrySelected.emit(null);
        }
    }

}

// createElement is what we'll use to create our component under test
import { createElement } from 'lwc';

// Import module under test by convention <namespace>/<moduleName>
import RelatedList from 'c/relatedList';

import { registerLdsTestWireAdapter } from '@salesforce/wire-service-jest-util';

//Wires used in relatedList.js that need to be tested.
import { getListUi } from 'lightning/uiListApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

const mockDescribe = require('./data/fieldDescribe.json');
const mockListView = require('./data/listView.json');

describe('related-list', () => {
    const describeAdapter = registerLdsTestWireAdapter(getObjectInfo);
    const listViewAdapter = registerLdsTestWireAdapter(getListUi);

    // Disconnect the component to reset the adapter. It is also
    // a best practice to clean up after each test.
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('displays data from list view correctly', () => {
        const relatedListComponent = createElement('c-related-list',{
            is : RelatedList,
            objectApiName : 'Account',
            listViewName : 'AllAccounts'
        });
        document.body.appendChild(relatedListComponent);
        describeAdapter.emit(mockDescribe);
        listViewAdapter.emit(mockListView);

        return Promise.resolve().then(() => {

            let p = new Promise(function(resolve) {
                if (relatedListComponent.records && relatedListComponent.fieldDescribes) {
                    expect(relatedListComponent.rows.length).toBe(1);
                    expect(relatedListComponent.columns.length).toBe(1);
                   resolve();
                }
             });
        });
    });
});

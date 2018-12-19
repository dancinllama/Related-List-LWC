//relatedList Lightning Web Component
//Author: James Loghry (Demand Chain)
//Date: 12/17/2018
//Description: Display a lightning data table based on sobjects and list views.
import { LightningElement, wire, api, track } from 'lwc';
import { getListUi } from 'lightning/uiListApi'; //Used for A) obtaining the records or data coming back and B) determining which fields to display.
import { getObjectInfo } from 'lightning/uiObjectInfoApi'; //Used for describe calls (e.g. is a field editable, and what type of data is coming back in fields)

//This will grow, but some of the types that come back (e.g. from the Schema.DisplayType enum) don't quite
//Match up with what the lightning data table component likes, so this is just a mapping between the two types.
const DESCRIBE_TO_DATA_TABLE_MAP = {
    "String" : "text"
};

//The logic for displaying a lightnig data table based on a list view and describe information (No Apex calls involved!)
export default class RelatedList extends LightningElement {
    @api objectApiName; //Configured via Lightning App Builder, String of the API name to show
    @api listViewName; //Configured via Lightniung App Builder (see meta.xml), String of the list view to show.
    @track error; //Not really used yet.
    records = []; //Array of records returned by the list view API wire
    fieldDescribes = []; //Array of describe information populated by the getObjectInfo wire.

    //The getObjectInfo is a part of the user interface API and is chalk full of describe information, including field level describes.
    //This example uses a function "wire" to handle the result of the call to the object info / user interface API.
    //Documentation on wires can be found here, including the function example: https://gs0.lightning.force.com/docs/component-library/documentation/lwc/lwc.data_wire_service_about
    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    handleDescribe({ error, data }){
        //This method is called when the wire returns for the getObjectInfo call.
        var field = null;
        var fieldApiName = null;
        this.fieldDescribes = [];
        if (data) {
            //Logic to run on success.
            //Mapping the describe results to a map of fields (for use when generating the data table columns)
            for(field of Object.keys(data.fields)){
                fieldApiName = data.fields[field].apiName;
                this.fieldDescribes[fieldApiName] = data.fields[field];
            }
        }else if(error){
            //Here's where error logic for the describe would take place.
        }
    }

    //Uses the List View API? to fetch field info and records from the list view as defined in the Lightning App Builder.
    //The wire / list view API is documented here: https://gs0.lightning.force.com/docs/component-library/documentation/lwc/lwc.reference_get_list_ui
    @wire(getListUi, { objectApiName: '$objectApiName', listViewApiName: '$listViewName' })
    records;

    //This is a getter and is called anytime that the lightning data table should be rerendered (I think, anyway ;-))
    //The method converts the records from the list view API format into the format needed by the lightning data table component.
    get rows(){
        //Bah, I hate declaring variables up here, but gotta do what ya gotta do.
        var rows = [];
        var record = null;
        var row = null;
        var column = null;
        var currentField = null;

        //Map the list view output to the lightning data table format output.
        if(!isEmpty(this.records) && !isEmpty(this.records.data)){
            //Iterate through the list view records and map them to a friendlier data table-esque format.
            for(record of this.records.data.records.records){
                row = {};
                for(  column of this.columns){
                    currentField = record.fields[column.fieldName];
                    if(!isEmpty(currentField)){
                        row[column.fieldName] = currentField.value;
                    }
                }
                rows.push(row);
            }
        }
        return rows;
    }

    //This is a getter for fetching the columns used in the data table (Only really referenced in the .html filed).
    //This converts from the list view API into the data table format, but also applies describe information,
    //Such as determining if a column is editable, determines the label that is displayed, and also what data type to pass to the data table.
    get columns(){
        var columns = [];
        var displayColumn = null;
        var fieldDescribe;
        var dataType = null;

        //This will grow, but some of the types that come back (e.g. from the Schema.DisplayType enum) don't quite
        //Match up with what the lightning data table component likes, so this is just a mapping between the two types.
        var describeToDataTableMap = {
            "String" : "text"
        };

        //Map the list view output to the lightning data table format output.
        if(!isEmpty(this.records) && !isEmpty(this.records.data) && !isEmpty(this.records.data.info)){
            for(displayColumn of this.records.data.info.displayColumns){
                fieldDescribe = this.fieldDescribes[displayColumn.fieldApiName];
                if(!isEmpty(fieldDescribe)){
                    dataType = describeToDataTableMap[fieldDescribe.dataType];
                    if(isEmpty(dataType)){
                        dataType = 'text';
                    }

                    columns.push({
                        fieldName: displayColumn.fieldApiName,
                        label : displayColumn.label,
                        sortable : displayColumn.sortable,
                        editable : fieldDescribe.createable,
                        type : dataType.toLowerCase()
                    });
                }
            }
            return columns;
        }
        return columns;
    }
}
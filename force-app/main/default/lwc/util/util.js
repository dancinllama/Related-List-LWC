//util Lightning Web Component
//Author: James Loghry (Demand Chain)
//Date: 12/17/2018
//Description: This is a utility file containing various utility methods.
//To add a method, add a new const (see the structure below), and also add the method name to the export object.
//The refer to it in other lightning web components by calling: import { <methodname1>,<methodname2> } from 'c/util'; //Custom utility module
const isEmpty = (val) => {
    return typeof val === 'undefined' || val === null || val === '' || val.length === 0;
};

//Remember to add new methods here:
export { isEmpty};
import { Component } from './component'
import { Infrastructure } from './infrastructure';
import { cna_modeling_tosca_profile } from '../totypa/parsedProfiles/cna_modeling_tosca_profile'

/**
 * The module for aspects related to a Component quality model Entity.
 * @module entities/service
 */

const SERVICE_TOSCA_EQUIVALENT = cna_modeling_tosca_profile.node_types["cna.qualityModel.entities.SoftwareComponent.Service"];

/**
 * Class representing a Service entity.
 * @class
 * @extends Component A {@link Component} entity
 */
class Service extends Component {

    /**
     * Create a Service entity.
     * @param {string} name The name of the Service entity. 
     * @param {modelId} modelId The ID, the respective entity representation has in the joint.dia.Graph model.
     * @param {Infrastructure} hostingInfrastructure The {@link Infrastructure} entity that hosts this Service entity.
     */
    constructor(name: string, modelId: string, hostingInfrastructure: Infrastructure) {
        super(name, modelId, hostingInfrastructure)
    }

    /**
     * Transforms the Service object into a String. 
     * @returns {string}
     */
    toString() {
        return "Service " + JSON.stringify(this);
    }
}

export { Service, SERVICE_TOSCA_EQUIVALENT };
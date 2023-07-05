import { Component } from './component'
import { Infrastructure } from './infrastructure'
import { tosca_simple_profile_for_yaml_v1_3 } from '../../totypa/parsedProfiles/tosca_simple_profile_for_yaml_v1_3'


/**
 * The module for aspects related to a Deployment Mapping quality model entity.
 * @module entities/deploymentMapping
 */
const DEPLOYMENT_MAPPING_TOSCA_KEY = "tosca.relationships.HostedOn";
const DEPLOYMENT_MAPPING_TOSCA_EQUIVALENT = tosca_simple_profile_for_yaml_v1_3.relationship_types[DEPLOYMENT_MAPPING_TOSCA_KEY];

/**
 * Class representing a Deployment Mapping entity.
 * @class
 */
class DeploymentMapping {

    #id: string;
    
    #deployedEntity: Component | Infrastructure;

    #underlyingInfrastructure: Infrastructure;

    /**
     * Create a Deployment Mapping entity. Represents the connection between either {@link Component} - {@link Infrastructure} or {@link Infrastructure} - {@link Infrastructure}. 
     * @param {string} id The unique id for this entity.
     * @param {Component|Service|BackingService|StorageBackingService|Infrastructure} deployedEntity The entity that is being deployed.
     * @param {Infrastructure} underlyingInfrastructure The Infrastructure entity, which deploys the other entity.
     * @throws {TypeError} If a wrong entity type is being provided.
     * @throws {Error} If the deployedEntity and the underylingInfrastructure are the same.
     */
    constructor(id: string, deployedEntity: Component | Infrastructure, underlyingInfrastructure: Infrastructure) {
        if (deployedEntity.getId === underlyingInfrastructure.getId) {
            const errorMessage = "The entities for which the DeploymentMapping is defined have to be distinguishable.";
            throw new Error(errorMessage);
        }

        if (!(deployedEntity instanceof Component || deployedEntity instanceof Infrastructure)) {
            const errorMessage = "Wrong entity type provided. Only Component, Service, BackingService, StorageBackingService or Infrastructure entities can be deployed by an underlying Infrastructure. However, the provided entity was: " + Object.getPrototypeOf(deployedEntity) + JSON.stringify(deployedEntity);
            throw new TypeError(errorMessage);
        }

        if (!(underlyingInfrastructure instanceof Infrastructure)) {
            const errorMessage = "Wrong entity type provided. Only an Infrastructure entity is able to deploy other entities. However, the provided entity was: " + Object.getPrototypeOf(underlyingInfrastructure) + JSON.stringify(underlyingInfrastructure);
            throw new TypeError(errorMessage);
        }

        this.#id = id;
        this.#deployedEntity = deployedEntity;
        this.#underlyingInfrastructure = underlyingInfrastructure;
    }

    /**
     * Returns the ID of this Deployment Mapping entity.
     * @returns {string}
     */
    get getId() {
        return this.#id;
    }

    /**
     * Returns the {@link Component} entity included in this DeploymentMapping.
     * @returns {Component}
     */
    get getDeployedEntity() {
        return this.#deployedEntity;
    }

    /**
     * Change the deployedEntity. 
     * @param {Component|Service|BackingService|StorageBackingService|Infrastructure} newDeployedEntity The entity that is being deployed.
     * @throws {TypeError} If a wrong entity type is being provided.
     * @throws {Error} If the newDeployedEntity and the underylingInfrastructure are the same.
     */
    set setDeployedEntity(newDeployedEntity: Component | Infrastructure) {
        if (!(newDeployedEntity instanceof Component || newDeployedEntity instanceof Infrastructure)) {
            const errorMessage = "Wrong entity type provided. Only Component, Service, BackingService, StorageBackingService or Infrastructure entities can be deployed by an underlying Infrastructure. However, the provided entity was: " + Object.getPrototypeOf(newDeployedEntity) + JSON.stringify(newDeployedEntity);
            throw new TypeError(errorMessage);
        }

        if (JSON.stringify(newDeployedEntity) === JSON.stringify(this.#underlyingInfrastructure)) {
            const errorMessage = "The entity is already included as the underyling infrastructure.";
            throw new Error(errorMessage);
        }

        this.#deployedEntity = newDeployedEntity;
    }

    /**
     * Returns the {@link Infrastructure} entity included in this DeploymentMapping.
     * @returns {Infrastructure}
     */
    get getUnderlyingInfrastructure() {
        return this.#underlyingInfrastructure;
    }

    /**
    * Change the underlyingInfrastructure. 
    * @param {Infrastructure} newUnderlyingInfrastructure The Infrastructure entity, which deploys the entity provided in the deployedEntity element.
    * @throws {TypeError} If a wrong entity type is being provided.
    * @throws {Error} If the newUnderlyingInfrastructure and the deployedEntity are the same.
    */
    set setUnderlyingInfrastructure(newUnderlyingInfrastructure: Infrastructure) {

        if (JSON.stringify(newUnderlyingInfrastructure) === JSON.stringify(this.#deployedEntity)) {
            const errorMessage = "The entity is already included as being deployed on this infrastructure";
            throw new Error(errorMessage);
        }

        this.#underlyingInfrastructure = newUnderlyingInfrastructure;
    }

    /**
     * Transforms the DeploymentMapping object into a String. 
     * @returns {string}
     */
    toString() {
        return "DeploymentMapping " + JSON.stringify(this);
    }
}

export { DeploymentMapping, DEPLOYMENT_MAPPING_TOSCA_KEY };
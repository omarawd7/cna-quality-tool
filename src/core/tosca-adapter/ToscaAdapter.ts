import * as yaml from 'js-yaml';
import * as Entities from '../entities'
import ComputeInfrastructure, { DBMSInfrastructure } from './node/compute.infrastructure';
import ToscaDataAggregate from './node/toscaDataAggregate';
import ToscaBackingData from './node/toscaBackingData';
import ConnectsToLink from './relationship/connectsTo.link';
import HostedOn from "./relationship/hostedOn"
import ToscaServiceTemplate from "./ServiceTemplate";
import RootComponent from './node/root.component';
import SoftwareComponentService from './node/softwareComponent.service';
import DatabaseStorageBackingService from './node/database.storageBackingService';
import ToscaBackingService from './node/toscaBackingService';
import ToscaRequestTrace from './node/toscaRequestTrace';
import { TOSCA_Node_Template, TOSCA_Service_Template, TOSCA_Topology_Template } from '@/totypa/tosca-types/template-types';
import { UniqueKeyManager } from './UniqueKeyManager';
import { BACKING_DATA_TOSCA_KEY } from '../entities/backingData';
import { flatMetaData } from '../common/entityDataTypes';
import { DATA_AGGREGATE_TOSCA_KEY } from '../entities/dataAggregate';

const TOSCA_DEFINITIONS_VERSION = "tosca_simple_yaml_1_3"

const MATCH_WHITESPACES = new RegExp(/\s/g);
const MATCH_UNWANTED_CHARACTERS = new RegExp(/[#>\-\.]/g);
const MATCH_MULTIPLE_UNDERSCORES = new RegExp(/_+/g);


export function convertToServiceTemplate(systemEntity: Entities.System): TOSCA_Service_Template {

    const uniqueKeyManager = new UniqueKeyManager();
    const keyToIdMapping = new Map<string, string>();

    let serviceTemplate: TOSCA_Service_Template = {
        tosca_definitions_version: TOSCA_DEFINITIONS_VERSION,
        metadata: {
            template_author: "CNA modeling tool",
            template_name: systemEntity.getSystemName,
            template_version: "0.1.0" // TODO customize
        },
        description: "Service template generated by the CNA modeling tool"
    }

    let topologyTemplate: TOSCA_Topology_Template = {
        description: "Topology template generated by the CNA modeling tool",
        node_templates: {}
    };

    for (const [id, dataAggregate] of systemEntity.getDataAggregateEntities.entries()) {
        let nodeKey: string = uniqueKeyManager.ensureUniqueness(transformToYamlKey(dataAggregate.getName));
        let node = dataAggregateToTemplate(dataAggregate);
        keyToIdMapping.set(nodeKey, id);
        topologyTemplate.node_templates[nodeKey] = node;
    }

    for (const [id, backingData] of systemEntity.getBackingDataEntities.entries()) {
        let nodeKey: string = uniqueKeyManager.ensureUniqueness(transformToYamlKey(backingData.getName));
        let node = backingDataToTemplate(backingData);
        keyToIdMapping.set(nodeKey, id);
        topologyTemplate.node_templates[nodeKey] = node;
    }


    // TODO all other entities

    serviceTemplate.topology_template = topologyTemplate;
    return serviceTemplate;
}

function transformToYamlKey(name: string) {

    // 1. no leading or trailing whitespaces 
    // 2. replace whitespaces with underscore
    // 3. replace # > - . with underscore
    // 4. ensure no subsequent underscores

    return name.trim()
        .replace(MATCH_WHITESPACES, "_")
        .replace(MATCH_UNWANTED_CHARACTERS, "_")
        .replace(MATCH_MULTIPLE_UNDERSCORES, "_")
        .toLocaleLowerCase();
}


function dataAggregateToTemplate(dataAggregate: Entities.DataAggregate): TOSCA_Node_Template {
    return {
        type: DATA_AGGREGATE_TOSCA_KEY,
        metadata: flatMetaData(dataAggregate.getMetaData),
    }
}


function backingDataToTemplate(backingData: Entities.BackingData): TOSCA_Node_Template {

    let template: TOSCA_Node_Template = {
        type: BACKING_DATA_TOSCA_KEY,
        metadata: flatMetaData(backingData.getMetaData),
    }

    if (backingData.getIncludedData) {
        let includedData = {};
        for (const data of backingData.getIncludedData) {
            includedData[data.key] = data.value;
        }
        template.properties = {
            "includedData": includedData
        }
    }

    return template;
}




class ToscaConverter {

    #systemEntity;

    #nodeTemplates = {};

    #relationshipTemplates = {};

    constructor(systemEntity) {
        this.#systemEntity = systemEntity;
    }

    convert() {
        this.convertComponent();
        this.convertInfrastructure();
        this.convertDataAggregate();
        this.convertBackingData();
        this.convertRequestTrace();
        this.convertLink();
        this.convertDeploymentMapping();


        const serviceTemplate = new ToscaServiceTemplate(this.#systemEntity.getSystemName, this.#nodeTemplates, this.#relationshipTemplates);
        const serviceTemplateYaml = yaml.dump(serviceTemplate, {
            styles: {
                '!!null': 'empty'
            }
        });

        // download created yaml taken from https://stackoverflow.com/a/22347908
        let downloadElement = document.createElement("a");
        downloadElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(serviceTemplateYaml));
        downloadElement.setAttribute('download', `${this.#systemEntity.getSystemName}.tosca`);
        downloadElement.click();
    }

    convertComponent() {
        const componentEntities = this.#systemEntity.getComponentEntities;

        for (const componentEntity of componentEntities.values()) {
            let componentHost = { infrastructure: componentEntity.getHostedBy.getName, deploymentMapping: componentEntity.getHostedBy.getName + "_host_" + componentEntity.getName };
            let endpointLinks = componentEntity.getIncludedLinkEntities.map((entity) => {
                return {
                    targetEntity: this.#ensureNoWhiteSpace(entity.getTargetEntity.getParentName),
                    linkName: this.#ensureNoWhiteSpace(this.#createLinkNameKey(entity))
                }
            });
            let usesDataItems = componentEntity.getDataAggregateEntities.map((entity) => {
                return this.#ensureNoWhiteSpace(entity.getName);
            });
            let usesBackingDataItems = componentEntity.getBackingDataEntities.map((entity) => {
                return this.#ensureNoWhiteSpace(entity.getName);
            });
            let endpoints = componentEntity.getEndpointEntities.map((entity) => {
                let endpoint = {};
                endpoint["metadata"] = {
                    position: entity.position,
                    size: entity.size,
                    label: entity.label
                };
                let endpointType = entity.getProperties().find(property => property.getKey === "endpointType").value;
                let endpointPath = entity.getProperties().find(property => property.getKey === "endpointPath").value;
                let endpointPort = entity.getProperties().find(property => property.getKey === "endpointPort").value;

                endpoint["protocol"] = endpointType.toLowerCase().includes("topic") ? "udp" : "http";
                endpoint["port"] = endpointPort;
                endpoint["path"] = this.#createEndpointPathName(endpointType, endpointPath);
                return endpoint;
            });
            let externalEndpoints = componentEntity.getExternalEndpointEntities.map((entity) => {
                let endpoint = {};
                endpoint["metadata"] = {
                    position: entity.position,
                    size: entity.size,
                    label: entity.label
                };
                let endpointType = entity.getProperties().find(property => property.getKey === "endpointType").value;
                let endpointPath = entity.getProperties().find(property => property.getKey === "endpointPath").value;
                let endpointPort = entity.getProperties().find(property => property.getKey === "endpointPath").value;

                endpoint["protocol"] = endpointType.toLowerCase().includes("topic") ? "udp" : "http";
                endpoint["port"] = endpointPort;
                endpoint["path"] = this.#createEndpointPathName(endpointType, endpointPath);
                return endpoint;
            });
            let persistedData = ""; // TODO

            if (componentEntity instanceof Entities.Service) {
                this.#nodeTemplates[this.#ensureNoWhiteSpace(componentEntity.getName)] = new SoftwareComponentService(componentEntity.getId, componentHost, endpointLinks, usesDataItems, usesBackingDataItems, endpoints, externalEndpoints, persistedData, componentEntity["position"], componentEntity["size"]);
            } else if (componentEntity instanceof Entities.BackingService) {
                this.#nodeTemplates[this.#ensureNoWhiteSpace(componentEntity.getName)] = new ToscaBackingService(componentEntity.getId, componentHost, endpointLinks, usesDataItems, usesBackingDataItems, endpoints, externalEndpoints, persistedData, componentEntity.getProperties(), componentEntity["position"], componentEntity["size"]);
            } else if (componentEntity instanceof Entities.StorageBackingService) {
                this.#nodeTemplates[this.#ensureNoWhiteSpace(componentEntity.getName)] = new DatabaseStorageBackingService(componentEntity.getId, componentHost, endpointLinks, usesDataItems, usesBackingDataItems, endpoints, externalEndpoints, persistedData, componentEntity.getProperties(), componentEntity["position"], componentEntity["size"]);
            } else {
                this.#nodeTemplates[this.#ensureNoWhiteSpace(componentEntity.getName)] = new RootComponent(componentEntity.getModelId, componentHost, endpointLinks, usesDataItems, usesBackingDataItems, endpoints, externalEndpoints, persistedData, componentEntity.position, componentEntity.size);
            }
        }
    }

    convertInfrastructure() {
        const infrastructureEntities = this.#systemEntity.getInfrastructureEntities;

        for (const infrastructureEntity of infrastructureEntities.values()) {
            const usesBackingDataItems = infrastructureEntity.getBackingDataEntities.map((entity) => {
                return this.#ensureNoWhiteSpace(entity.getName);
            });

            if (infrastructureEntity.getInfrastructureType === Entities.InfrastructureTypes.DBMS) {
                this.#nodeTemplates[this.#ensureNoWhiteSpace(infrastructureEntity.getName)] = new DBMSInfrastructure(infrastructureEntity.getModelId, this.#ensureNoWhiteSpace(infrastructureEntity.getHostedBy), usesBackingDataItems, infrastructureEntity.position, infrastructureEntity.size);
            } else {
                this.#nodeTemplates[this.#ensureNoWhiteSpace(infrastructureEntity.getName)] = new ComputeInfrastructure(infrastructureEntity.getModelId, this.#ensureNoWhiteSpace(infrastructureEntity.getHostedBy), usesBackingDataItems, infrastructureEntity.position, infrastructureEntity.size);
            }
        }
    }

    convertDataAggregate() {
        const dataAggregateEntities = this.#systemEntity.getDataAggregateEntities;

        for (const dataAggregateEntity of dataAggregateEntities.values()) {
            const persistedBy = dataAggregateEntity.getPersistedBy.map((name) => {
                return this.#ensureNoWhiteSpace(name);
            })
            this.#nodeTemplates[this.#ensureNoWhiteSpace(dataAggregateEntity.getName)] = new ToscaDataAggregate(dataAggregateEntity.getModelId, persistedBy);
        }
    }

    convertBackingData() {
        const backingDataEntities = this.#systemEntity.getBackingDataEntities;

        for (const backingDataEntity of backingDataEntities.values()) {
            this.#nodeTemplates[this.#ensureNoWhiteSpace(backingDataEntity.getName)] = new ToscaBackingData(backingDataEntity.getModelId, backingDataEntity.getIncludedData);
        }
    }

    convertRequestTrace() {
        const requestTraceEntities = this.#systemEntity.getRequestTraceEntities;

        for (const requestTraceEntity of requestTraceEntities.values()) {
            const key = `RT_${this.#ensureNoWhiteSpace(requestTraceEntity.getExternalEndpoint.getEndpointType)}_${this.#ensureNoWhiteSpace(requestTraceEntity.getExternalEndpoint.getNameId())}`;
            let involvedLinks = requestTraceEntity.getLinkEntities.map((entity) => {
                return this.#ensureNoWhiteSpace(this.#createLinkNameKey(entity));
            });
            let externalEndpointType = requestTraceEntity.getExternalEndpoint.getProperties().find(property => property.getKey === "endpointType").value;
            let externalEndpointPath = requestTraceEntity.getExternalEndpoint.getProperties().find(property => property.getKey === "endpointPath").value;
            this.#nodeTemplates[this.#ensureNoWhiteSpace(key)] = new ToscaRequestTrace(requestTraceEntity.getModelId, this.#ensureNoWhiteSpace(requestTraceEntity.getExternalEndpoint.getParentName), this.#createEndpointPathName(externalEndpointType, externalEndpointPath), involvedLinks, requestTraceEntity.position, requestTraceEntity.size, requestTraceEntity.getName);
        }
    }

    convertLink() {
        const linkEntities = this.#systemEntity.getLinkEntities;

        for (const linkEntity of linkEntities.values()) {
            const key = this.#createLinkNameKey(linkEntity);
            const targetEndpointName = linkEntity.getTargetEntity.getEndpointType?.toLowerCase().includes("topic") ? `${linkEntity.getTargetEntity.getEndpointName} ${linkEntity.getTargetEntity.getEndpointType}` : `${linkEntity.getTargetEntity.getEndpointType} ${linkEntity.getTargetEntity.getEndpointName}`;
            this.#relationshipTemplates[this.#ensureNoWhiteSpace(key)] = new ConnectsToLink(linkEntity.getModelId, targetEndpointName, linkEntity.getRelationType);
        }
    }

    convertDeploymentMapping() {
        const deploymentMappingEntities = this.#systemEntity.getDeploymentMappingEntities;

        for (const deploymentMappingEntity of deploymentMappingEntities.values()) {
            const key = deploymentMappingEntity.getUnderlyingInfrastructure.getName + "_host_" + deploymentMappingEntity.getDeployedEntity.getName;
            this.#relationshipTemplates[this.#ensureNoWhiteSpace(key)] = new HostedOn(deploymentMappingEntity.getModelId);
        }
    }

    #ensureNoWhiteSpace(text) {
        if (!text || !(text.trim())) {
            return text;
        }

        return text.replace(/\s+/g, '');
    }

    #createLinkNameKey(linkEntity) {
        return linkEntity.getSourceEntity.getName + "_connects-to_" + linkEntity.getTargetEntity.getNameId();
    }

    #createEndpointPathName(endpointType, endpointName) {
        return endpointType?.toLowerCase().includes("topic") ? `${endpointName} ${endpointType}` : `${endpointType} ${endpointName}`
    }
}

export default ToscaConverter;
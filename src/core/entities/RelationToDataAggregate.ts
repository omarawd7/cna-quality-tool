import { EntityProperty, SelectEntityProperty, loadAllProperties } from '../common/entityProperty'
import { cna_modeling_tosca_profile } from '../../totypa/parsedProfiles/cna_modeling_tosca_profile'
import { MetaData } from '../common/entityDataTypes'

/**
 * The module for aspects related to the relationship between a component and a data aggregate
 * @module relationships/componentToDataAggregate
 */

const ATTACHES_TO_TOSCA_KEY = "cna.qualityModel.relationships.AttachesTo.Data";
const ATTACHES_TO_EQUIVALENT = cna_modeling_tosca_profile.relationship_types[ATTACHES_TO_TOSCA_KEY];


function getDataAggregateRelationshipProperties(): EntityProperty[] {
    let parsed = loadAllProperties(ATTACHES_TO_EQUIVALENT);

    return parsed.map((prop) => {
        switch (prop.getKey) {
            case "usage_relation":
                let changedProp = new SelectEntityProperty(prop.getKey,
                    prop.getName,
                    prop.getDescription,
                    prop.getExample,
                    prop.getRequired,
                    [
                        {
                            text: "Usage",
                            value: "usage"
                        },
                        {
                            text: "Persistence",
                            value: "persistence"
                        }
                    ],
                    prop.getDefaultValue,
                    prop.value)
                return changedProp;
            default:
                return prop;
        }
    }).filter(prop => prop.getKey !== "location");

}



/**
 * Class representing the relationship between a component and data aggregate
 * @class
 */
class RelationToDataAggregate {

    #id: string;

    #metaData: MetaData;

    #properties: EntityProperty[] = new Array();

    /**
     * Create a Backing Service entity.
     * @param {string} id The unique id for this relationship.
     * @param {MetaData} metaData The meta data for this entity, needed for displaying it in a diagram. 
     */
    constructor(id: string, metaData: MetaData) {
        this.#id = id,
            this.#metaData = metaData;
        this.#properties = getDataAggregateRelationshipProperties();
    }

    /**
 * Returns the ID of this relationship.
 * @returns {string}
 */
    get getId() {
        return this.#id;
    }

    /**
     * Return the meta data for this relationship.
     * @returns {MetaData}
     */
    get getMetaData() {
        return this.#metaData;
    }

    /**
 * Returns all properties of this relationship
 * @returns {EntityProperty[]}
 */
    getProperties() {
        return this.#properties;
    }

    setPropertyValue(propertyKey: string, propertyValue: any) {
        let propertyToSet = (this.#properties.find(property => property.getKey === propertyKey))
        if (propertyToSet) {
            propertyToSet.value = propertyValue
        } else {
            throw new Error(`Property with key ${propertyKey} not found in ${this.constructor}`)
        }
    }

    /**
     * Transforms the relationship into a String. 
     * @returns {string}
     */
    toString() {
        return "Data Aggregate Relationship " + JSON.stringify(this);
    }
}

export { RelationToDataAggregate, ATTACHES_TO_TOSCA_KEY, getDataAggregateRelationshipProperties };
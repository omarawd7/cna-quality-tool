/* 
   Caution!!! This code is generated!!!! Do not modify, but instead regenerate it based on the .yaml Profile descriptions 
*/

import { TOSCA_Service_Template } from '../tosca-types/template-types.js';

export const cna_modeling_tosca_profile: TOSCA_Service_Template = {
  "tosca_definitions_version": "tosca_simple_yaml_1_3",
  "namespace": "http://docs.oasis-open.org/tosca/ns/simple/yaml/1.3",
  "metadata": {
    "template_name": "cna-modeling-tosca-profile",
    "template_author": "Distributed Systems Group",
    "template_version": "0.1.0"
  },
  "description": "This TOSCA definitions document contains the CNA Modeling TOSCA profile",
  "dsl_definitions": "",
  "repositories": {},
  "artifact_types": {},
  "data_types": {},
  "capability_types": {
    "cna.qualityModel.capabilities.DataStorage": {
      "derived_from": "tosca.capabilities.Root",
      "description": "When included, the Node is able to store Data Aggregate entities"
    }
  },
  "interface_types": {},
  "relationship_types": {
    "cna.qualityModel.entities.ConnectsTo.Link": {
      "derived_from": "tosca.relationships.ConnectsTo",
      "description": "Relationship Type to model Link entities",
      "properties": {
        "relation_type": {
          "type": "string",
          "required": true,
          "description": "Type of relation, e.g. subscribes to or calls"
        },
        "timeout": {
          "type": "integer",
          "description": "If a timeout is applied for this link, specify it's length here. If no timeout is applied, use 0.",
          "default": 0,
          "required": true
        }
      },
      "valid_target_types": [
        "tosca.capabilities.Endpoint",
        "tosca.capabilities.Endpoint.Public"
      ]
    },
    "cna.qualityModel.relationships.Provides.Endpoint": {
      "derived_from": "tosca.relationships.Root",
      "description": "Relationship Type to connect Endpoints to the Components which provide them",
      "valid_target_types": [
        "tosca.capabilities.Endpoint",
        "tosca.capabilities.Endpoint.Public"
      ]
    },
    "cna.qualityModel.relationships.AttachesTo.DataAggregate": {
      "derived_from": "tosca.relationships.AttachesTo",
      "valid_target_types": [
        "tosca.capabilities.Attachment"
      ],
      "properties": {
        "location": {
          "required": false
        },
        "usage_relation": {
          "type": "string",
          "required": true,
          "description": "Describes how a component uses attached data, that means whether it just uses (reads) it for its functionality or if it also updates and persists (writes) it; possible values are usage and persistence"
        },
        "sharding_level": {
          "type": "integer",
          "required": true,
          "default": 0,
          "description": "Only applicable if data is persisted by a component; If a component persists data, the sharding level describes the number of shards used; 0 acts as a placeholder if data is not persisted; 1 is the default meaning that no sharding is used; >1 is the number of shards"
        }
      }
    },
    "cna.qualityModel.relationships.AttachesTo.BackingData": {
      "derived_from": "tosca.relationships.AttachesTo",
      "valid_target_types": [
        "tosca.capabilities.Attachment"
      ],
      "properties": {
        "location": {
          "required": false
        },
        "usage_relation": {
          "type": "string",
          "required": true,
          "description": "Describes how a component uses attached data, that means whether it just uses (reads) it for its functionality or if it also updates and persists (writes) it; possible values are usage and persistence"
        }
      }
    }
  },
  "node_types": {
    "cna.qualityModel.entities.Root.Component": {
      "derived_from": "tosca.nodes.Root",
      "description": "Node Type to model Component entities",
      "properties": {
        "managed": {
          "type": "boolean",
          "description": "A component is managed if it is exclusively operated by someone else, e.g. a cloud provider and the source code of the component instance is inaccessible. If the source code of a component can be changed by yourself, the component is not managed",
          "required": true
        },
        "software_type": {
          "type": "string",
          "description": "The type of the software in the sense of who developed it. If it is a self-written component use \"custom\", if it is an existing open-source solution which is not customized (apart from configuration) use \"open-source\". If it is licensed proprietary software, use \"proprietary\".",
          "default": "custom",
          "required": true
        },
        "stateless": {
          "type": "boolean",
          "description": "True if this component is stateless, that means it requires no disk storage space where data is persisted between executions. That means it can store data to disk, but should not rely on this data to be available for following executions. Instead it should be able to restore required data after a restart in a different environment.",
          "default": true,
          "required": true
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "tosca.capabilities.Compute",
            "relationship": "tosca.relationships.HostedOn",
            "occurrences": [
              1,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_endpoint": {
            "capability": "tosca.capabilities.Endpoint",
            "relationship": "cna.qualityModel.relationships.Provides.Endpoint",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "tosca.capabilities.Endpoint.Public",
            "relationship": "cna.qualityModel.relationships.Provides.Endpoint",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "tosca.capabilities.Endpoint",
            "node": "cna.qualityModel.entities.Endpoint",
            "relationship": "cna.qualityModel.relationships.ConnectsTo.Link",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.DataAggregate",
            "relationship": "cna.qualityModel.relationships.AttachesTo.DataAggregate",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.BackingData",
            "relationship": "cna.qualityModel.relationships.AttachesTo.BackingData",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ]
    },
    "cna.qualityModel.entities.SoftwareComponent.Service": {
      "derived_from": "tosca.nodes.SoftwareComponent",
      "description": "Node Type to model Service entities",
      "properties": {
        "replicas": {
          "type": "integer",
          "description": "The minimum number of replicated instances for this service when it is running",
          "required": true,
          "default": 1
        }
      },
      "requirements": [
        {
          "provides_endpoint": {
            "capability": "tosca.capabilities.Endpoint",
            "relationship": "cna.qualityModel.relationships.Provides.Endpoint",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "tosca.capabilities.Endpoint.Public",
            "relationship": "cna.qualityModel.relationships.Provides.Endpoint",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "tosca.capabilities.Endpoint",
            "node": "cna.qualityModel.entities.Endpoint",
            "relationship": "cna.qualityModel.relationships.ConnectsTo.Link",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.DataAggregate",
            "relationship": "cna.qualityModel.relationships.AttachesTo.DataAggregate",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.BackingData",
            "relationship": "cna.qualityModel.relationships.AttachesTo.BackingData",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ]
    },
    "cna.qualityModel.entities.BackingService": {
      "derived_from": "tosca.nodes.Root",
      "description": "Node Type to model Backing Service entities",
      "properties": {
        "providedFunctionality": {
          "type": "string",
          "description": "A short description of the provided functionality.",
          "required": false
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "tosca.capabilities.Compute",
            "relationship": "tosca.relationships.HostedOn",
            "occurrences": [
              1,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_endpoint": {
            "capability": "tosca.capabilities.Endpoint",
            "relationship": "cna.qualityModel.relationships.Provides.Endpoint",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "provides_external_endpoint": {
            "capability": "tosca.capabilities.Endpoint.Public",
            "relationship": "cna.qualityModel.relationships.Provides.Endpoint",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "endpoint_link": {
            "capability": "tosca.capabilities.Endpoint",
            "node": "cna.qualityModel.entities.Endpoint",
            "relationship": "cna.qualityModel.relationships.ConnectsTo.Link",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.DataAggregate",
            "relationship": "cna.qualityModel.relationships.AttachesTo.DataAggregate",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.BackingData",
            "relationship": "cna.qualityModel.relationships.AttachesTo.BackingData",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ]
    },
    "cna.qualityModel.entities.Endpoint": {
      "derived_from": "tosca.nodes.Root",
      "description": "Endpoint type to explicitly model endpoints as entities",
      "capabilities": {
        "endpoint": {
          "type": "tosca.capabilities.Endpoint",
          "occurrences": [
            1,
            1
          ]
        }
      }
    },
    "cna.qualityModel.entities.Endpoint.External": {
      "derived_from": "tosca.nodes.Root",
      "description": "Endpoint type to explicitly model endpoints as entities",
      "capabilities": {
        "external_endpoint": {
          "type": "tosca.capabilities.Endpoint.Public",
          "occurrences": [
            1,
            1
          ]
        }
      }
    },
    "cna.qualityModel.entities.Compute.Infrastructure": {
      "derived_from": "tosca.nodes.Compute",
      "description": "Node Type to model Infrastructure entities",
      "properties": {
        "managed": {
          "type": "boolean",
          "description": "Infrastructure is managed if it is exclusively operated by someone else, e.g. a cloud provider and the source code of the infrastructure instance is inaccessible. If the source code of an infrastructure can be changed by yourself, the infrastructure is not managed.",
          "required": true,
          "default": false
        },
        "availability_zone": {
          "type": "string",
          "required": true,
          "description": "The name of the availability zone in which this infrastructure is provided. If it is running in multiple availability zones, provide their names as a comma-separated list.",
          "default": "default-zone"
        },
        "region": {
          "type": "string",
          "required": true,
          "description": "The name of the region in which this infrastructure is provided.",
          "default": "default-region"
        }
      },
      "requirements": [
        {
          "host": {
            "capability": "tosca.capabilities.Compute",
            "relationship": "tosca.relationships.HostedOn",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.BackingData",
            "relationship": "cna.qualityModel.relationships.AttachesTo.BackingData",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ]
    },
    "cna.qualityModel.entities.BackingData": {
      "derived_from": "tosca.nodes.Root",
      "description": "Node Type to model Backing Data entities",
      "properties": {
        "included_data": {
          "type": "map",
          "required": true,
          "key_schema": {
            "type": "string",
            "description": "The name specifying the individual Backing Data element"
          },
          "entry_schema": {
            "type": "string",
            "description": "The value of the individual Backing Data element"
          }
        }
      },
      "capabilities": {
        "provides_data": {
          "type": "tosca.capabilities.Attachment",
          "valid_source_types": [
            "cna.qualityModel.entities.Root.Component",
            "cna.qualityModel.entities.SoftwareComponent.Service",
            "cna.qualityModel.entities.BackingService",
            "cna.qualityModel.entities.DBMS.StorageService",
            "cna.qualityModel.entities.Compute.Infrastructure"
          ],
          "occurrences": [
            1,
            "UNBOUNDED"
          ]
        }
      }
    },
    "cna.qualityModel.entities.DataAggregate": {
      "derived_from": "tosca.nodes.Root",
      "description": "Node Type to model Data Aggregate entities",
      "requirements": [
        {
          "persistence": {
            "capability": "cna.qualityModel.capabilities.DataStorage",
            "node": "cna.qualityModel.entities.DBMS.StorageService",
            "relationship": "cna.qualityModel.relationships.AttachesTo.Data",
            "occurrences": [
              1,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "capabilities": {
        "provides_data": {
          "type": "tosca.capabilities.Attachment",
          "valid_source_types": [
            "cna.qualityModel.entities.Root.Component",
            "cna.qualityModel.entities.SoftwareComponent.Service",
            "cna.qualityModel.entities.BackingService",
            "cna.qualityModel.entities.DBMS.StorageService"
          ],
          "occurrences": [
            1,
            "UNBOUNDED"
          ]
        }
      }
    },
    "cna.qualityModel.entities.DBMS.StorageService": {
      "derived_from": "tosca.nodes.DBMS",
      "description": "Node Type to model Storage Backing Service entities",
      "properties": {
        "name": {
          "type": "string",
          "description": "the logical name of the database",
          "required": true
        },
        "stateless": {
          "type": "boolean",
          "description": "Storage Backing Service are per default stateful (not stateless)",
          "default": false,
          "required": true
        },
        "replicas": {
          "type": "integer",
          "description": "The minimum number of replicated instances for this storage service when it is running",
          "required": true,
          "default": 1
        },
        "shards": {
          "type": "integer",
          "description": "The number of shards this storage service is configured with, the default of 1 means no sharding is used.",
          "required": true,
          "default": 1
        }
      },
      "requirements": [
        {
          "endpoint_link": {
            "capability": "tosca.capabilities.Endpoint",
            "node": "cna.qualityModel.entities.Endpoint",
            "relationship": "cna.qualityModel.relationships.ConnectsTo.Link",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.DataAggregate",
            "relationship": "cna.qualityModel.relationships.AttachesTo.DataAggregate",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        },
        {
          "uses_backing_data": {
            "capability": "tosca.capabilities.Attachment",
            "node": "cna.qualityModel.entities.BackingData",
            "relationship": "cna.qualityModel.relationships.AttachesTo.BackingData",
            "occurrences": [
              0,
              "UNBOUNDED"
            ]
          }
        }
      ],
      "capabilities": {
        "endpoint": {
          "type": "tosca.capabilities.Endpoint",
          "occurrences": [
            0,
            "UNBOUNDED"
          ]
        },
        "external_endpoint": {
          "type": "tosca.capabilities.Endpoint.Public",
          "occurrences": [
            0,
            "UNBOUNDED"
          ]
        },
        "persist_data": {
          "type": "cna.qualityModel.capabilities.DataStorage",
          "description": "The ability to persist Data Aggregates like Business Objects",
          "valid_source_types": [
            "cna.qualityModel.entities.DataAggregate"
          ],
          "occurrences": [
            1,
            "UNBOUNDED"
          ]
        }
      }
    },
    "cna.qualityModel.entities.RequestTrace": {
      "derived_from": "tosca.nodes.Root",
      "description": "Node Type to model Request Trace entities",
      "properties": {
        "referred_endpoint": {
          "type": "string",
          "required": true
        },
        "nodes": {
          "type": "list",
          "required": false,
          "entry_schema": {
            "description": "An existing Component, Service, Backing Service or Storage Backing Service entity which is part of this Request Trace entity",
            "type": "string"
          }
        },
        "involved_links": {
          "type": "list",
          "required": true,
          "entry_schema": {
            "description": "An existing Link entity which is part of this Request Trace entity",
            "type": "string"
          }
        }
      },
      "requirements": [
        {
          "external_endpoint": {
            "capability": "tosca.capabilities.Endpoint.Public",
            "relationship": "tosca.relationships.ConnectsTo",
            "occurrences": [
              1,
              1
            ]
          }
        }
      ]
    }
  },
  "policy_types": {}
};
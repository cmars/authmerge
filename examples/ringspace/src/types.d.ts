declare namespace Components {
    namespace Schemas {
        export type ActorId = string; // uuid
        export interface AppendDocChangesAttributes {
            changes: string /* byte */[];
        }
        export interface AppendDocChangesRequest {
            data: AppendDocChangesRequestData;
        }
        export interface AppendDocChangesRequestData {
            type: "changes";
            attributes: AppendDocChangesAttributes;
        }
        export interface AppendDocChangesResponse {
            meta: AppendDocChangesResponseMeta;
        }
        export interface AppendDocChangesResponseMeta {
            changes_added?: number;
        }
        export interface ConsumeInviteResponse {
            data: ConsumeInviteResponseData;
            links: {
                changes: string; // uri
            };
        }
        export interface ConsumeInviteResponseData {
            id: ResourceId /* uuid */;
            type: "invites";
        }
        export interface CreateDocRequest {
            data: CreateDocRequestData;
        }
        export interface CreateDocRequestData {
            type: "docs";
            attributes: {
                actor_id: ActorId /* uuid */;
                changes: string /* byte */[];
            };
        }
        export interface CreateDocResponse {
            data: CreateDocResponseData;
            links: SelfLinks;
        }
        export interface CreateDocResponseData {
            id: ResourceId /* uuid */;
            type: "docs";
            attributes: {
                actor_id?: ActorId /* uuid */;
                token: string; // byte
            };
        }
        export interface CreateInviteRequest {
            data: CreateInviteRequestData;
        }
        export interface CreateInviteRequestAttributes {
            note?: string;
            roles: string[];
        }
        export interface CreateInviteRequestData {
            type: "invites";
            attributes: CreateInviteRequestAttributes;
        }
        export interface CreateInviteResponse {
            data: CreateInviteResponseData;
            links: {
                consume: string; // uri
            };
        }
        export interface CreateInviteResponseAttributes {
            note?: string;
            roles: string[];
            uses?: number;
        }
        export interface CreateInviteResponseData {
            id: ResourceId /* uuid */;
            type: "invites";
            attributes: CreateInviteResponseAttributes;
        }
        export interface Error {
            status: string;
            title: string;
            detail?: string;
            source?: {
                pointer?: string;
                parameter?: string;
            };
        }
        export interface ErrorResponse {
            errors: Error[];
        }
        export type Link = string; // uri
        export type ResourceId = string; // uuid
        export interface SelfLinks {
            self: Link /* uri */;
        }
    }
}
declare namespace Paths {
    namespace AppendDocChanges {
        namespace Parameters {
            export type DocId = Components.Schemas.ResourceId /* uuid */;
        }
        export interface PathParameters {
            doc_id: Parameters.DocId;
        }
        export type RequestBody = Components.Schemas.AppendDocChangesRequest;
        namespace Responses {
            export type $200 = Components.Schemas.AppendDocChangesResponse;
            export type $400 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.ErrorResponse;
        }
    }
    namespace ConsumeDocInvite {
        namespace Parameters {
            export type DocId = Components.Schemas.ResourceId /* uuid */;
            export type InviteId = Components.Schemas.ResourceId /* uuid */;
            export type Nonce = string; // byte
        }
        export interface PathParameters {
            doc_id: Parameters.DocId;
            invite_id: Parameters.InviteId;
        }
        export interface QueryParameters {
            nonce: Parameters.Nonce /* byte */;
        }
        namespace Responses {
            export type $200 = Components.Schemas.ConsumeInviteResponse;
        }
    }
    namespace CreateDoc {
        export type RequestBody = Components.Schemas.CreateDocRequest;
        namespace Responses {
            export type $201 = Components.Schemas.CreateDocResponse;
            export type $400 = Components.Schemas.ErrorResponse;
        }
    }
    namespace CreateDocInvite {
        namespace Parameters {
            export type DocId = Components.Schemas.ResourceId /* uuid */;
        }
        export interface PathParameters {
            doc_id: Parameters.DocId;
        }
        export type RequestBody = Components.Schemas.CreateInviteRequest;
        namespace Responses {
            export type $201 = Components.Schemas.CreateInviteResponse;
        }
    }
    namespace GetDocChanges {
        namespace Parameters {
            export type DocId = Components.Schemas.ResourceId /* uuid */;
            export type Offset = number;
        }
        export interface PathParameters {
            doc_id: Parameters.DocId;
        }
        export interface QueryParameters {
            offset: Parameters.Offset;
        }
        namespace Responses {
            export type $400 = Components.Schemas.ErrorResponse;
            export type $404 = Components.Schemas.ErrorResponse;
        }
    }
}

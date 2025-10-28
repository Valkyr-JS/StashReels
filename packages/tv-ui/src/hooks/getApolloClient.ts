import { ApolloClient, InMemoryCache } from "@apollo/client";
import { getClient } from "stash-ui/dist/src/core/StashService";
import hashObject from 'object-hash';
import { Modifiers } from "@apollo/client/cache";

export function getApolloClient() {
    const originalClient = getClient()
    // The "config" property on the cache is not officially documented or typed but it exists in practice.
    const originalCacheConfig = 'config' in originalClient.cache ? originalClient.cache.config as NonNullable<ConstructorParameters<typeof InMemoryCache>[0]> : {}
    const newCache = new InMemoryCache({
        ...originalCacheConfig,
        typePolicies: {
            ...originalCacheConfig.typePolicies,
            Query: {
                ...originalCacheConfig.typePolicies?.Query,
                fields: {
                    ...originalCacheConfig.typePolicies?.Query.fields,
                    findScenes: {
                        ...originalCacheConfig.typePolicies?.Query.fields?.findScenes,
                        keyArgs: (variables) => hashObject({
                            ...variables,
                            filter: {
                                ...variables?.filter,
                                page: undefined,
                                per_page: undefined,    
                            }
                        }),
                        merge(
                            existing: { scenes: {__ref: string}[] } = { scenes: [] },
                            incoming: { scenes: {__ref: string}[] }
                        ) {
                            return {
                                ...existing,
                                ...incoming,
                                scenes: [
                                    ...existing.scenes,
                                    ...incoming.scenes
                                        .filter(incomingScene => !existing.scenes
                                            .some(existingScene => existingScene.__ref === incomingScene.__ref)
                                        ),
                                ],
                            }
                        }
                    },
                    findSceneMarkers: {
                        ...originalCacheConfig.typePolicies?.Query.fields?.findSceneMarkers,
                        keyArgs: (variables) => hashObject({
                            ...variables,
                            filter: {
                                ...variables?.filter,
                                page: undefined,
                                per_page: undefined,    
                            }
                        }),
                        merge(
                            existing: { scene_markers: {__ref: string}[] } = { scene_markers: [] },
                            incoming: { scene_markers: {__ref: string}[] }
                        ) {
                            return {
                                ...existing,
                                ...incoming,
                                scene_markers: [
                                    ...existing.scene_markers,
                                    ...incoming.scene_markers
                                        .filter(incomingSceneMarker => !existing.scene_markers
                                            .some(existingSceneMarker => existingSceneMarker.__ref === incomingSceneMarker.__ref)
                                        ),
                                ],
                            }
                        }
                    }
                }
            },
        }
    });
    const newClient = new ApolloClient({
        link: originalClient.link,
        cache: newCache,
    });
    
    // When playing the stash player will update the video's watched time occasionally
    // (https://github.com/stashapp/stash/blob/2ed9e5332d7bfeb08877e38af5bd633ba0fd3a37/ui/v2.5/src/core/StashService.ts#L908).
    // When it does it also clears the apollo cache and reloads. We don't want this because if we've loaded many pages we'll lose them all. To get
    // around this we wrap the cache modification function and specifically ignore any requests to delete scenes from
    // the cache.
    const oldModify = newCache.modify
    newCache.modify = (firstArg, ...otherArgs) => { 
        const {fields = {}} = firstArg as {fields: Modifiers}
        if ('findScenes' in fields && typeof fields.findScenes === 'function') {
            const originalModFn = fields.findScenes
            fields.findScenes = (...modFnArgs) => {
                const [originalValue, { DELETE }] = modFnArgs
                const result = originalModFn(...modFnArgs);
                if (result === DELETE) {
                    return originalValue
                }
                return result
            }
             
        }
        // @ts-expect-error - We're doing a fairly hacking thing here by wrapping the modify function but we're trying
        // to avoid modifying the source of stash's ui.
        return oldModify.apply(newCache, [firstArg, ...otherArgs]); 
    }
    return newClient;
}
import { supabase } from '../client';
import type { Database, Tables } from '../types/database';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Generic table names type
type TableName = keyof Database['public']['Tables'];

// Subscription event types
export type DatabaseEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// Subscription callback types
export type SubscriptionCallback<T extends { [key: string]: any }> = (payload: RealtimePostgresChangesPayload<T>) => void;

// Subscription options
export interface SubscriptionOptions {
  event?: DatabaseEvent;
  schema?: string;
  filter?: string;
}

// Channel manager to keep track of active channels
const activeChannels = new Map<string, RealtimeChannel>();

/**
 * Basic Real-time Subscriptions
 */

// Create a subscription to table changes
export function subscribeToTable<T extends TableName>(
  table: T,
  callback: SubscriptionCallback<Tables<T>>,
  options: SubscriptionOptions = {}
): RealtimeChannel {
  const {
    event = '*',
    schema = 'public',
    filter,
  } = options;

  const channelName = `table:${table}:${event}:${filter || 'all'}`;
  
  // Check if channel already exists
  if (activeChannels.has(channelName)) {
    console.warn(`Channel ${channelName} already exists. Returning existing channel.`);
    return activeChannels.get(channelName)!;
  }

  try {
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema,
          table,
          filter,
        } as any,
        callback as any
      )
      .subscribe();

    // Store the channel for management
    activeChannels.set(channelName, channel);

    return channel;
  } catch (error) {
    console.error(`Error subscribing to table ${table}:`, error);
    throw error;
  }
}

// Subscribe to INSERT events
export function subscribeToInserts<T extends TableName>(
  table: T,
  callback: SubscriptionCallback<Tables<T>>,
  filter?: string
): RealtimeChannel {
  return subscribeToTable(table, callback, { event: 'INSERT', filter });
}

// Subscribe to UPDATE events
export function subscribeToUpdates<T extends TableName>(
  table: T,
  callback: SubscriptionCallback<Tables<T>>,
  filter?: string
): RealtimeChannel {
  return subscribeToTable(table, callback, { event: 'UPDATE', filter });
}

// Subscribe to DELETE events
export function subscribeToDeletes<T extends TableName>(
  table: T,
  callback: SubscriptionCallback<Tables<T>>,
  filter?: string
): RealtimeChannel {
  return subscribeToTable(table, callback, { event: 'DELETE', filter });
}

/**
 * Filtered Subscriptions
 */

// Subscribe to changes for a specific record
export function subscribeToRecord<T extends TableName>(
  table: T,
  recordId: string,
  callback: SubscriptionCallback<Tables<T>>,
  event: DatabaseEvent = '*'
): RealtimeChannel {
  return subscribeToTable(table, callback, {
    event,
    filter: `id=eq.${recordId}`,
  });
}

// Subscribe to changes for records owned by a specific user
export function subscribeToUserRecords<T extends TableName>(
  table: T,
  userId: string,
  callback: SubscriptionCallback<Tables<T>>,
  userColumn: string = 'author_id',
  event: DatabaseEvent = '*'
): RealtimeChannel {
  return subscribeToTable(table, callback, {
    event,
    filter: `${userColumn}=eq.${userId}`,
  });
}

// Subscribe to changes for records with specific status
export function subscribeToRecordsByStatus<T extends TableName>(
  table: T,
  status: string,
  callback: SubscriptionCallback<Tables<T>>,
  statusColumn: string = 'status',
  event: DatabaseEvent = '*'
): RealtimeChannel {
  return subscribeToTable(table, callback, {
    event,
    filter: `${statusColumn}=eq.${status}`,
  });
}

/**
 * Specialized Subscriptions for Your Schema
 */

// Subscribe to posts changes
export function subscribeToPosts(
  callback: SubscriptionCallback<Tables<'posts'>>,
  options?: {
    authorId?: string;
    status?: 'draft' | 'published' | 'archived';
    event?: DatabaseEvent;
  }
): RealtimeChannel {
  const { authorId, status, event = '*' } = options || {};
  
  let filter: string | undefined;
  if (authorId && status) {
    filter = `author_id=eq.${authorId},status=eq.${status}`;
  } else if (authorId) {
    filter = `author_id=eq.${authorId}`;
  } else if (status) {
    filter = `status=eq.${status}`;
  }

  return subscribeToTable('posts', callback, { event, filter });
}

// Subscribe to comments changes
export function subscribeToComments(
  callback: SubscriptionCallback<Tables<'comments'>>,
  options?: {
    postId?: string;
    authorId?: string;
    status?: 'pending' | 'approved' | 'rejected';
    event?: DatabaseEvent;
  }
): RealtimeChannel {
  const { postId, authorId, status, event = '*' } = options || {};
  
  let filter: string | undefined;
  const filters: string[] = [];
  
  if (postId) filters.push(`post_id=eq.${postId}`);
  if (authorId) filters.push(`author_id=eq.${authorId}`);
  if (status) filters.push(`status=eq.${status}`);
  
  if (filters.length > 0) {
    filter = filters.join(',');
  }

  return subscribeToTable('comments', callback, { event, filter });
}

// Subscribe to profiles changes
export function subscribeToProfiles(
  callback: SubscriptionCallback<Tables<'profiles'>>,
  options?: {
    userId?: string;
    event?: DatabaseEvent;
  }
): RealtimeChannel {
  const { userId, event = '*' } = options || {};
  
  const filter = userId ? `id=eq.${userId}` : undefined;

  return subscribeToTable('profiles', callback, { event, filter });
}

// Subscribe to categories changes
export function subscribeToCategories(
  callback: SubscriptionCallback<Tables<'categories'>>,
  options?: {
    parentId?: string;
    event?: DatabaseEvent;
  }
): RealtimeChannel {
  const { parentId, event = '*' } = options || {};
  
  const filter = parentId ? `parent_id=eq.${parentId}` : undefined;

  return subscribeToTable('categories', callback, { event, filter });
}

/**
 * Presence Subscriptions
 */

// Track user presence in a room
export function subscribeToPresence(
  roomName: string,
  options: {
    onJoin?: (payload: any) => void;
    onLeave?: (payload: any) => void;
    onSync?: () => void;
  }
): RealtimeChannel {
  const channelName = `presence:${roomName}`;
  
  // Check if channel already exists
  if (activeChannels.has(channelName)) {
    console.warn(`Presence channel ${channelName} already exists. Returning existing channel.`);
    return activeChannels.get(channelName)!;
  }

  try {
    const channel = supabase.channel(channelName);

    if (options.onJoin) {
      channel.on('presence' as any, { event: 'join' } as any, options.onJoin);
    }
    
    if (options.onLeave) {
      channel.on('presence' as any, { event: 'leave' } as any, options.onLeave);
    }
    
    if (options.onSync) {
      channel.on('presence' as any, { event: 'sync' } as any, options.onSync);
    }

    channel.subscribe();

    // Store the channel for management
    activeChannels.set(channelName, channel);

    return channel;
  } catch (error) {
    console.error(`Error subscribing to presence in room ${roomName}:`, error);
    throw error;
  }
}

// Track user presence and send updates
export function trackPresence(
  channel: RealtimeChannel,
  userId: string,
  metadata: Record<string, any> = {}
): void {
  try {
    channel.track({
      user_id: userId,
      online_at: new Date().toISOString(),
      ...metadata,
    });
  } catch (error) {
    console.error('Error tracking presence:', error);
    throw error;
  }
}

// Stop tracking presence
export function untrackPresence(channel: RealtimeChannel): void {
  try {
    channel.untrack();
  } catch (error) {
    console.error('Error untracking presence:', error);
    throw error;
  }
}

// Get current presence state
export function getPresenceState(channel: RealtimeChannel): Record<string, any> {
  try {
    return channel.presenceState();
  } catch (error) {
    console.error('Error getting presence state:', error);
    return {};
  }
}

/**
 * Broadcast Subscriptions
 */

// Subscribe to broadcast messages
export function subscribeToBroadcast(
  channelName: string,
  eventName: string,
  callback: (payload: any) => void
): RealtimeChannel {
  const fullChannelName = `broadcast:${channelName}`;
  
  // Check if channel already exists
  if (activeChannels.has(fullChannelName)) {
    console.warn(`Broadcast channel ${fullChannelName} already exists. Returning existing channel.`);
    return activeChannels.get(fullChannelName)!;
  }

  try {
    const channel = supabase
      .channel(fullChannelName)
      .on('broadcast', { event: eventName }, callback)
      .subscribe();

    // Store the channel for management
    activeChannels.set(fullChannelName, channel);

    return channel;
  } catch (error) {
    console.error(`Error subscribing to broadcast ${channelName}:${eventName}:`, error);
    throw error;
  }
}

// Send broadcast message
export function sendBroadcast(
  channel: RealtimeChannel,
  eventName: string,
  payload: any
): void {
  try {
    channel.send({
      type: 'broadcast',
      event: eventName,
      payload,
    });
  } catch (error) {
    console.error('Error sending broadcast:', error);
    throw error;
  }
}

/**
 * Channel Management
 */

// Unsubscribe from a channel
export function unsubscribe(channel: RealtimeChannel): void {
  try {
    const channelName = channel.topic;
    
    channel.unsubscribe();
    
    // Remove from active channels
    activeChannels.delete(channelName);
  } catch (error) {
    console.error('Error unsubscribing from channel:', error);
    throw error;
  }
}

// Unsubscribe from all channels
export function unsubscribeAll(): void {
  try {
    activeChannels.forEach((channel) => {
      channel.unsubscribe();
    });
    
    activeChannels.clear();
  } catch (error) {
    console.error('Error unsubscribing from all channels:', error);
    throw error;
  }
}

// Get all active channels
export function getActiveChannels(): Map<string, RealtimeChannel> {
  return new Map(activeChannels);
}

// Check if a channel is active
export function isChannelActive(channelName: string): boolean {
  return activeChannels.has(channelName);
}

/**
 * Utility Functions
 */

// Create a typed callback wrapper
export function createTypedCallback<T extends TableName>(
  callback: (
    eventType: DatabaseEvent,
    record: Tables<T>,
    old?: Tables<T>
  ) => void
): SubscriptionCallback<Tables<T>> {
  return (payload: RealtimePostgresChangesPayload<Tables<T>>) => {
    callback(
      payload.eventType as DatabaseEvent,
      payload.new as Tables<T>,
      payload.old as Tables<T>
    );
  };
}

// Create a debounced callback to prevent rapid fire events
export function createDebouncedCallback<T>(
  callback: T,
  delay: number = 300
): T {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      (callback as any)(...args);
    }, delay);
  }) as any;
}

/**
 * Higher-level Subscription Helpers
 */

// Subscribe to all changes for a user's content
export function subscribeToUserContent(
  userId: string,
  callbacks: {
    onPostChange?: SubscriptionCallback<Tables<'posts'>>;
    onCommentChange?: SubscriptionCallback<Tables<'comments'>>;
    onProfileChange?: SubscriptionCallback<Tables<'profiles'>>;
  }
): RealtimeChannel[] {
  const channels: RealtimeChannel[] = [];

  if (callbacks.onPostChange) {
    channels.push(
      subscribeToUserRecords('posts', userId, callbacks.onPostChange)
    );
  }

  if (callbacks.onCommentChange) {
    channels.push(
      subscribeToUserRecords('comments', userId, callbacks.onCommentChange)
    );
  }

  if (callbacks.onProfileChange) {
    channels.push(
      subscribeToRecord('profiles', userId, callbacks.onProfileChange)
    );
  }

  return channels;
}

// Subscribe to post-related changes (post + comments)
export function subscribeToPostActivity(
  postId: string,
  callbacks: {
    onPostChange?: SubscriptionCallback<Tables<'posts'>>;
    onCommentChange?: SubscriptionCallback<Tables<'comments'>>;
  }
): RealtimeChannel[] {
  const channels: RealtimeChannel[] = [];

  if (callbacks.onPostChange) {
    channels.push(
      subscribeToRecord('posts', postId, callbacks.onPostChange)
    );
  }

  if (callbacks.onCommentChange) {
    channels.push(
      subscribeToComments(callbacks.onCommentChange, { postId })
    );
  }

  return channels;
}
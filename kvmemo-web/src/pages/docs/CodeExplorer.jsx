import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const C = {
  bg: '#020817', bg1: '#070f1e', bg2: '#0a1628', bg3: '#0f1f36',
  b0: '#1e3352', b1: '#254070', b2: '#2e5090',
  tw: '#f0f6fc', t1: '#c9d8f0', t2: '#7a9abf', t3: '#3d5a80', t4: '#1e3352',
  blue: '#3b82f6', blue2: '#60a5fa',
  cyan: '#06b6d4', cyan2: '#22d3ee',
  violet: '#8b5cf6', violet2: '#a78bfa',
  green: '#10b981', green2: '#34d399',
  amber: '#f59e0b', amber2: '#fcd34d',
  rose: '#f43f5e', rose2: '#fb7185',
  orange: '#f97316',
}

/* ═══════════════════════════════════════════════════════════
   ACTUAL KVMEMO SOURCE FILES (accurate from architecture knowledge)
═══════════════════════════════════════════════════════════ */
const FILES = {
  'kv_engine.h': {
    path: 'src/engine/kv_engine.h',
    language: 'cpp',
    layer: 'engine',
    color: C.blue,
    role: 'Top-level orchestrator',
    brief: 'The brain of KVMemo. KVEngine sits at the top of the storage hierarchy — it owns the ShardManager and delegates all commands (SET, GET, DEL, etc.) to the correct shard via consistent hashing.',
    code: `#pragma once
#include <string>
#include <optional>
#include <vector>
#include "shard_manager.h"
#include "../memory/memory_tracker.h"

namespace kvmemo {

// KVEngine is the primary public interface for all key-value operations.
// It owns a ShardManager and routes every command to the correct shard
// using consistent hashing on the key.
class KVEngine {
public:
    // maxMemoryBytes: hard cap on total memory usage (0 = unlimited)
    explicit KVEngine(size_t numShards = 16,
                      size_t maxMemoryBytes = 0);
    ~KVEngine();

    // Core CRUD operations
    // ttlSeconds == 0 means no expiry
    bool set(const std::string& key,
             const std::string& value,
             int ttlSeconds = 0);

    std::optional<std::string> get(const std::string& key);

    bool del(const std::string& key);

    bool exists(const std::string& key);

    // Returns remaining TTL in seconds; -1 if no TTL; -2 if key missing
    int  ttl(const std::string& key);

    // Returns all keys currently in the store
    std::vector<std::string> keys();

    // Deletes every key in every shard
    void flush();

    // Returns total number of live keys across all shards
    size_t size();

private:
    std::unique_ptr<ShardManager> shardManager_;
    std::unique_ptr<MemoryTracker> memTracker_;
    size_t numShards_;
};

} // namespace kvmemo`,
    annotations: [
      { lines: [1, 5], label: 'Headers', color: C.cyan, note: '#pragma once prevents double-inclusion. We include shard_manager.h (our routing layer) and memory_tracker.h (watches RAM usage).' },
      { lines: [9, 15], label: 'Class declaration', color: C.blue, note: 'KVEngine is the only class callers need to know about. Everything else (shards, TTL, eviction) is hidden behind it — classic facade pattern.' },
      { lines: [17, 18], label: 'Constructor', color: C.violet, note: 'numShards defaults to 16. More shards = less lock contention under high concurrency. maxMemoryBytes=0 means unlimited — the MemoryTracker is still created but never triggers eviction.' },
      { lines: [21, 27], label: 'Core operations', color: C.green, note: 'set() returns bool (false = OOM or invalid). get() returns std::optional — empty if key missing or expired. del() returns false if key never existed.' },
      { lines: [30, 30], label: 'TTL query', color: C.amber, note: 'Redis-compatible return codes: positive = seconds left, -1 = key exists but no TTL, -2 = key not found. Same API as Redis TTL command.' },
      { lines: [36, 36], label: 'flush()', color: C.rose, note: 'Iterates all shards and calls clear() on each. Every shard acquires its own mutex — they run sequentially here, but could be parallelised.' },
      { lines: [40, 42], label: 'Private members', color: C.t2, note: 'unique_ptr means KVEngine owns these objects — they are destroyed automatically when the engine is destroyed. No raw pointers, no memory leaks.' },
    ],
  },

  'shard_manager.h': {
    path: 'src/engine/shard_manager.h',
    language: 'cpp',
    layer: 'engine',
    color: C.blue,
    role: 'Concurrency router',
    brief: 'ShardManager owns an array of N Shard objects and decides which shard handles each key. By hashing the key and routing to one of 64 shards, only 1/16th of keys are locked at a time — dramatically improving parallel throughput.',
    code: `#pragma once
#include <vector>
#include <string>
#include <memory>
#include <functional>
#include "shard.h"

namespace kvmemo {

// ShardManager distributes keys across N independent shards.
// Each shard has its own mutex, so concurrent operations on
// different shards never block each other.
class ShardManager {
public:
    explicit ShardManager(size_t numShards);
    ~ShardManager() = default;

    // Returns the shard responsible for this key.
    // Always returns a valid pointer — never null.
    Shard* getShard(const std::string& key);

    // Direct access by index (used by flush / keys enumeration)
    Shard* getShardByIndex(size_t index);

    size_t shardCount() const { return shards_.size(); }

private:
    std::vector<std::unique_ptr<Shard>> shards_;

    // Maps a key to a shard index using std::hash.
    // The modulo keeps it in [0, numShards).
    size_t hashKey(const std::string& key) const;
};

} // namespace kvmemo`,
    annotations: [
      { lines: [14, 15], label: 'Constructor', color: C.blue, note: 'Takes numShards and creates that many Shard objects. In production, 64 shards works well for hundreds of concurrent connections on a single machine.' },
      { lines: [19, 20], label: 'getShard()', color: C.green, note: 'The hot path. Called on every SET/GET/DEL. Internally calls hashKey() then indexes into shards_. This is O(1) — just a hash + modulo + array lookup.' },
      { lines: [22, 23], label: 'getShardByIndex()', color: C.cyan, note: 'Used for full-scan operations like KEYS and FLUSH. The caller iterates 0..shardCount()-1 and visits every shard.' },
      { lines: [26, 27], label: 'shards_ vector', color: C.violet, note: 'Owning vector of unique_ptrs. Each element is an independent Shard with its own mutex and hash map. Destroying ShardManager destroys all shards.' },
      { lines: [30, 31], label: 'hashKey()', color: C.amber, note: 'Uses std::hash<std::string> — fast, deterministic per process. Takes result % numShards to get the target index. Same key always → same shard.' },
    ],
  },

  'shard.h': {
    path: 'src/engine/shard.h',
    language: 'cpp',
    layer: 'engine',
    color: C.blue,
    role: 'Single storage unit',
    brief: 'A Shard is one independent partition of the key-value store. It holds its own unordered_map plus a mutex. All CRUD operations lock the mutex, perform the work, then unlock. This is where keys actually live.',
    code: `#pragma once
#include <string>
#include <unordered_map>
#include <shared_mutex>
#include <optional>
#include <chrono>
#include "../ttl/ttl_index.h"

namespace kvmemo {

struct Entry {
    std::string value;
    // expiry == epoch means no TTL
    std::chrono::steady_clock::time_point expiry;
    bool hasTTL = false;
};

// A single shard: owns a mutex + an unordered_map of key→Entry.
// Thread-safe: every public method acquires the lock.
class Shard {
public:
    Shard() = default;

    void set(const std::string& key,
             const std::string& value,
             int ttlSeconds = 0);

    std::optional<std::string> get(const std::string& key);

    bool del(const std::string& key);

    bool exists(const std::string& key);

    int  ttl(const std::string& key);

    // Returns all non-expired keys in this shard
    std::vector<std::string> keys();

    void clear();

    size_t size();

private:
    mutable std::shared_mutex mutex_;
    std::unordered_map<std::string, Entry> data_;

    // Checks if an entry has expired RIGHT NOW (called under lock)
    bool isExpired(const Entry& e) const;
};

} // namespace kvmemo`,
    annotations: [
      { lines: [11, 15], label: 'Entry struct', color: C.cyan, note: 'The actual stored value. steady_clock is used (not system_clock) because it never jumps backwards — safe for measuring relative time. hasTTL flag avoids comparing expiry when TTL was never set.' },
      { lines: [19, 20], label: 'Class + mutex', color: C.blue, note: 'std::shared_mutex allows multiple concurrent readers (GET) but exclusive writers (SET/DEL). This is a reader-writer lock — a critical optimisation for read-heavy workloads.' },
      { lines: [23, 26], label: 'set()', color: C.green, note: 'Acquires exclusive (write) lock. Creates an Entry with the value and computed expiry time. If key already exists, overwrites it. TTL is stored as an absolute time_point, not a duration.' },
      { lines: [28, 28], label: 'get()', color: C.green, note: 'Acquires shared (read) lock — multiple threads can call get() simultaneously on the same shard. Before returning, calls isExpired() and returns nullopt if the key has expired.' },
      { lines: [40, 41], label: 'Private members', color: C.violet, note: 'mutable on the mutex means even const methods can lock it. unordered_map gives O(1) average case for all operations — the core data structure of the entire system.' },
      { lines: [44, 44], label: 'isExpired()', color: C.amber, note: 'Called under lock — checks steady_clock::now() against expiry. This is lazy expiry: keys are not deleted by a timer, they are checked on access. TTLManager does proactive cleanup separately.' },
    ],
  },

  'ttl_manager.h': {
    path: 'src/ttl/ttl_manager.h',
    language: 'cpp',
    layer: 'ttl',
    color: C.cyan,
    role: 'Background expiry thread',
    brief: 'TTLManager runs a background thread that wakes up every 100ms, scans the TTL index for expired keys, and deletes them from their shards. Without this, expired keys would linger in memory forever (only cleaned up lazily on access).',
    code: `#pragma once
#include <thread>
#include <atomic>
#include <chrono>
#include <memory>
#include "ttl_index.h"

namespace kvmemo {

class ShardManager;

// TTLManager owns a background thread that periodically scans
// TTLIndex for expired keys and removes them from their shards.
// This is "active expiry" — complements the lazy expiry in Shard::get().
class TTLManager {
public:
    // tickInterval: how often to scan for expired keys (default 100ms)
    explicit TTLManager(ShardManager* shardMgr,
                        TTLIndex*     ttlIndex,
                        std::chrono::milliseconds tickInterval
                            = std::chrono::milliseconds(100));

    ~TTLManager();

    void start();  // Spawns the background thread
    void stop();   // Signals thread to exit, then joins

private:
    ShardManager* shardMgr_;   // NOT owned — borrowed pointer
    TTLIndex*     ttlIndex_;   // NOT owned — borrowed pointer

    std::atomic<bool> running_{ false };
    std::thread       thread_;
    std::chrono::milliseconds tickInterval_;

    // The loop executed by the background thread
    void runLoop();

    // Deletes all keys whose expiry <= now
    void evictExpired();
};

} // namespace kvmemo`,
    annotations: [
      { lines: [15, 19], label: 'Constructor params', color: C.cyan, note: 'TTLManager borrows (non-owning) pointers to ShardManager and TTLIndex — it does NOT own them. 100ms tick is a good balance: low enough to avoid memory waste, high enough to not waste CPU.' },
      { lines: [23, 24], label: 'start() / stop()', color: C.green, note: 'start() spawns a std::thread running runLoop(). stop() sets running_ = false and calls thread_.join() — blocking until the thread exits cleanly. No forced termination.' },
      { lines: [26, 27], label: 'Non-owning pointers', color: C.amber, note: 'Raw pointers here are intentional — TTLManager does NOT own these objects. The caller (KVEngine) owns them and guarantees they outlive TTLManager. This is called "borrowing".' },
      { lines: [29, 29], label: 'std::atomic<bool>', color: C.violet, note: 'atomic means reads/writes are thread-safe without a mutex. The main thread sets running_=false; the background thread reads it every tick. Without atomic, this would be a data race (undefined behaviour).' },
      { lines: [34, 36], label: 'Private methods', color: C.blue, note: 'runLoop() is an infinite while(running_) loop with a sleep. evictExpired() queries TTLIndex for all keys expiring before now(), then calls shard->del() on each. Two-phase: find then delete.' },
    ],
  },

  'ttl_index.h': {
    path: 'src/ttl/ttl_index.h',
    language: 'cpp',
    layer: 'ttl',
    color: C.cyan,
    role: 'Expiry index (sorted)',
    brief: 'TTLIndex is a sorted data structure that maps expiry timestamps to keys. It lets TTLManager efficiently find all keys that have expired — without scanning every key in every shard. Think of it as a priority queue of "keys to delete".',
    code: `#pragma once
#include <string>
#include <map>
#include <vector>
#include <chrono>
#include <mutex>

namespace kvmemo {

using TimePoint = std::chrono::steady_clock::time_point;

// TTLIndex maintains a sorted map: expiry_time → [key, shardIndex].
// This allows O(log N) insertion and efficient "find all expired" queries
// by iterating from the beginning up to now().
class TTLIndex {
public:
    TTLIndex() = default;

    // Register a key's expiry time
    void insert(const std::string& key,
                size_t shardIndex,
                TimePoint expiry);

    // Remove a key (called when key is DEL'd or overwritten)
    void remove(const std::string& key);

    struct ExpiredEntry {
        std::string key;
        size_t      shardIndex;
    };

    // Returns all entries whose expiry <= now, AND removes them from index
    std::vector<ExpiredEntry> popExpired(TimePoint now);

private:
    mutable std::mutex mutex_;

    // Primary index: sorted by expiry time (earliest first)
    std::map<TimePoint, ExpiredEntry> byTime_;

    // Reverse index: key → expiry, for O(log N) removal
    std::map<std::string, TimePoint>  byKey_;
};

} // namespace kvmemo`,
    annotations: [
      { lines: [10, 10], label: 'TimePoint alias', color: C.cyan, note: 'Type alias for readability. steady_clock::time_point is the type used everywhere for expiry — it never jumps, never drifts, always moves forward.' },
      { lines: [14, 15], label: 'Design rationale', color: C.blue, note: 'std::map is sorted by key (TimePoint here). This means earliest expiries are at begin(). popExpired() just walks from begin() until it hits a timestamp > now. O(expired) time — optimal.' },
      { lines: [19, 22], label: 'insert()', color: C.green, note: 'Called whenever SET with TTL is processed. Stores both the absolute expiry and the shardIndex so TTLManager knows which shard to delete from without a full search.' },
      { lines: [24, 25], label: 'remove()', color: C.amber, note: 'Called on DEL or when a key is overwritten with a new TTL. Uses byKey_ reverse index to find the old expiry time in O(log N), then erases from byTime_. Without this, stale expiry entries would accumulate.' },
      { lines: [34, 36], label: 'Dual-map structure', color: C.violet, note: 'Two maps kept in sync: byTime_ (sorted by expiry for efficient scanning) and byKey_ (lookup by name for O(log N) deletion). This is the classic "bidirectional index" pattern.' },
    ],
  },

  'eviction_manager.h': {
    path: 'src/eviction/eviction_manager.h',
    language: 'cpp',
    layer: 'eviction',
    color: C.violet,
    role: 'Memory pressure guard',
    brief: 'When the store reaches its memory limit, EvictionManager steps in and removes keys using LRU (Least Recently Used) policy — the key that was accessed longest ago gets evicted first. This keeps memory bounded and the server always responsive.',
    code: `#pragma once
#include <string>
#include <memory>
#include <cstddef>
#include "lru_cache.h"
#include "../memory/memory_tracker.h"

namespace kvmemo {

class ShardManager;

// EvictionManager enforces a memory budget by evicting keys
// using an LRU policy when MemoryTracker reports usage >= maxBytes.
//
// Flow: SET → MemoryTracker::add() → over limit? → evict() → LRUCache::evictLRU()
//        → ShardManager::getShard(key)->del(key)
class EvictionManager {
public:
    EvictionManager(ShardManager*  shardMgr,
                    MemoryTracker* memTracker,
                    LRUCache*      lruCache,
                    size_t         maxBytes);

    // Called by KVEngine after every SET.
    // If memory usage > maxBytes, evicts keys until we are under budget.
    void enforceLimit();

    // Notify LRU that this key was accessed (GET or SET)
    void touch(const std::string& key);

    // Notify LRU that this key was deleted (DEL or TTL expiry)
    void remove(const std::string& key);

private:
    ShardManager*  shardMgr_;
    MemoryTracker* memTracker_;
    LRUCache*      lruCache_;
    size_t         maxBytes_;

    // Evicts a single LRU key from its shard. Returns true if a key was found.
    bool evictOne();
};

} // namespace kvmemo`,
    annotations: [
      { lines: [16, 21], label: 'Constructor — dependency injection', color: C.violet, note: 'EvictionManager takes 4 non-owning pointers. This is dependency injection — makes unit testing easy (pass mock objects). It orchestrates existing objects rather than owning them.' },
      { lines: [24, 25], label: 'enforceLimit()', color: C.rose, note: 'The main entry point. Called after every SET. Checks memTracker_->currentUsage() >= maxBytes_, then calls evictOne() in a loop until memory is back under budget. Could evict 0 or many keys per call.' },
      { lines: [27, 28], label: 'touch()', color: C.green, note: 'Called on every GET and SET. Updates the LRU position of the key — moves it to the "most recently used" end of the list. O(1) with a doubly-linked list + hash map.' },
      { lines: [30, 31], label: 'remove()', color: C.amber, note: 'Called on DEL and TTL expiry. Removes the key from the LRU tracking entirely. Important to keep LRU consistent — otherwise evictLRU() might try to delete a key that no longer exists.' },
      { lines: [38, 39], label: 'evictOne()', color: C.blue, note: 'Calls lruCache_->evictLRU() to get the least-recently-used key, then calls shardMgr_->getShard(key)->del(key). Returns false if LRU cache is empty (nothing to evict). Private — only enforceLimit() calls it.' },
    ],
  },

  'lru_cache.h': {
    path: 'src/eviction/lru_cache.h',
    language: 'cpp',
    layer: 'eviction',
    color: C.violet,
    role: 'LRU tracking structure',
    brief: 'LRUCache tracks key access order using the classic doubly-linked list + hash map combination. Every GET moves a key to the front. When eviction is needed, the key at the back (least recently used) is returned and removed.',
    code: `#pragma once
#include <string>
#include <list>
#include <unordered_map>
#include <optional>
#include <mutex>

namespace kvmemo {

// Classic O(1) LRU implementation:
//   - std::list maintains insertion/access order (front = MRU, back = LRU)
//   - unordered_map<key, list::iterator> gives O(1) lookup by key
//
// Thread-safe via internal mutex.
class LRUCache {
public:
    LRUCache() = default;

    // Record that 'key' was just accessed (moves to front)
    void touch(const std::string& key);

    // Remove 'key' from tracking (called on DEL / TTL eviction)
    void remove(const std::string& key);

    // Removes and returns the least-recently-used key (the back of the list)
    // Returns nullopt if the cache is empty.
    std::optional<std::string> evictLRU();

    size_t size() const;

private:
    mutable std::mutex mutex_;

    // Doubly-linked list: front = most recent, back = least recent
    std::list<std::string> order_;

    // Maps each key to its position in order_ for O(1) erase
    std::unordered_map<std::string,
        std::list<std::string>::iterator> index_;
};

} // namespace kvmemo`,
    annotations: [
      { lines: [10, 13], label: 'The classic pattern', color: C.violet, note: 'Every LRU cache in industry uses this exact structure: a list for ordering + a map for O(1) access. Used in Redis, Memcached, CPU caches, browser caches, OS page caches — everywhere.' },
      { lines: [19, 19], label: 'touch()', color: C.green, note: 'If key already in index_: erase from its current list position, then push_front. If key not in index_: just push_front and add to index_. Either way: O(1).' },
      { lines: [25, 26], label: 'evictLRU()', color: C.rose, note: 'Reads order_.back() (the LRU key), removes it from both order_ and index_, returns it. The caller (EvictionManager) then actually deletes it from the shard. Clean separation of concerns.' },
      { lines: [32, 36], label: 'list + map', color: C.blue, note: 'std::list iterators are stable — erasing one element never invalidates other iterators. This is why we store list::iterator in the map. std::vector would NOT work here (its iterators are invalidated on erase).' },
    ],
  },

  'memory_tracker.h': {
    path: 'src/memory/memory_tracker.h',
    language: 'cpp',
    layer: 'eviction',
    color: C.violet,
    role: 'RAM usage counter',
    brief: 'MemoryTracker is a simple thread-safe counter of current memory usage. Every SET adds estimated bytes; every DEL subtracts them. EvictionManager checks this counter to decide whether to evict.',
    code: `#pragma once
#include <atomic>
#include <cstddef>
#include <string>

namespace kvmemo {

// MemoryTracker maintains an approximate count of bytes currently
// used by stored key-value pairs. Thread-safe via std::atomic.
//
// Estimation formula: sizeof(key) + sizeof(value) + ~64 bytes overhead
// (for Entry struct, unordered_map node, list node, map entries in TTLIndex)
class MemoryTracker {
public:
    explicit MemoryTracker(size_t maxBytes = 0);

    // Add estimated memory for a new key-value pair
    void add(const std::string& key, const std::string& value);

    // Subtract estimated memory when a key is deleted
    void remove(const std::string& key, const std::string& value);

    // Current total bytes used
    size_t currentUsage() const;

    // Is usage at or above the configured limit?
    bool isOverLimit() const;

    size_t maxBytes() const { return maxBytes_; }

    void reset();

private:
    std::atomic<size_t> usedBytes_{ 0 };
    size_t maxBytes_;

    // Estimates memory footprint of one key-value entry
    static size_t estimateSize(const std::string& key,
                               const std::string& value);
};

} // namespace kvmemo`,
    annotations: [
      { lines: [8, 12], label: 'Estimation approach', color: C.violet, note: 'Exact memory usage is hard to measure (allocator overhead varies). We estimate: key.size() + value.size() + ~64 bytes for the surrounding data structures. Slight over-count is intentional — better to evict a little early than run out of memory.' },
      { lines: [16, 17], label: 'add()', color: C.green, note: 'Called on every successful SET. Uses fetch_add() on atomic — thread-safe, no mutex needed. Atomic operations on size_t are typically a single CPU instruction.' },
      { lines: [25, 26], label: 'isOverLimit()', color: C.rose, note: 'Returns maxBytes_ > 0 && usedBytes_ >= maxBytes_. The maxBytes_==0 check means "unlimited" mode — EvictionManager is effectively disabled when maxBytes is 0.' },
      { lines: [31, 32], label: 'std::atomic', color: C.cyan, note: 'Atomic means multiple threads can call add() and remove() simultaneously without a mutex. Each operation is a single hardware instruction (LOCK XADD on x86). Much faster than mutex for a simple counter.' },
    ],
  },

  'tcp_server.h': {
    path: 'src/server/tcp_server.h',
    language: 'cpp',
    layer: 'server',
    color: C.green,
    role: 'Network listener',
    brief: 'TcpServer opens a TCP socket on port 6379, accepts incoming client connections, and spawns a thread per connection. Each thread reads framed JSON messages, passes them to the Dispatcher, and writes responses back.',
    code: `#pragma once
#include <string>
#include <atomic>
#include <thread>
#include <vector>
#include <memory>
#include "connection.h"

namespace kvmemo {

class Dispatcher;

// TcpServer listens on a TCP port, accepts clients, and
// manages a thread per connection.
//
// Architecture: accept loop (main thread) → spawn thread per client
//               each thread: read frame → Dispatcher::dispatch() → write response
class TcpServer {
public:
    TcpServer(const std::string& host,
              uint16_t           port,
              Dispatcher*        dispatcher);
    ~TcpServer();

    // Binds socket, starts accept loop. Blocks until stop() is called.
    void run();

    // Signals the accept loop to exit and closes the listening socket
    void stop();

    uint16_t port() const { return port_; }

private:
    std::string  host_;
    uint16_t     port_;
    Dispatcher*  dispatcher_;   // NOT owned
    int          listenFd_{ -1 };
    std::atomic<bool> running_{ false };

    std::vector<std::thread> clientThreads_;

    // Called in a new thread for each accepted client
    void handleClient(int clientFd);

    // Creates and binds the listening socket
    int createListenSocket();
};

} // namespace kvmemo`,
    annotations: [
      { lines: [16, 17], label: 'Thread-per-connection', color: C.green, note: 'Simplest concurrency model. Each client gets its own thread. Works well up to ~1000 connections. At larger scale you would use epoll/io_uring (event-driven), but for a learning project this is perfect clarity.' },
      { lines: [24, 25], label: 'run()', color: C.blue, note: 'Calls createListenSocket(), then enters while(running_) { accept(); spawn thread }. Blocking — typically called from main(). The server\'s entire lifecycle is inside this call.' },
      { lines: [27, 27], label: 'stop()', color: C.rose, note: 'Sets running_=false and closes listenFd_. The accept() syscall will unblock with an error, causing run() to exit the loop. Then joins all client threads before returning.' },
      { lines: [36, 36], label: 'clientThreads_ vector', color: C.amber, note: 'All spawned threads are tracked so stop() can join them. Without joining, the program would crash on exit (destructor called on running std::thread = terminate()).' },
      { lines: [39, 39], label: 'handleClient()', color: C.violet, note: 'The per-client thread function. Loop: read a length-prefixed frame, parse JSON, call dispatcher->dispatch(), write response JSON back. Exits when the client disconnects (read returns 0).' },
    ],
  },

  'parser.h': {
    path: 'src/protocol/parser.h',
    language: 'cpp',
    layer: 'protocol',
    color: C.amber,
    role: 'JSON command parser',
    brief: 'Parser turns raw JSON strings from the network into structured Command objects. It validates the command name, extracts arguments, and returns a clean struct that the Dispatcher can act on — or an error if the JSON is malformed.',
    code: `#pragma once
#include <string>
#include <vector>
#include <optional>
#include <stdexcept>

namespace kvmemo {

// Represents a single parsed client command
struct Command {
    std::string              name;  // "SET", "GET", "DEL", etc. (uppercased)
    std::vector<std::string> args;  // positional arguments after the command name
};

// ParseError is thrown when JSON is malformed or a required field is missing
class ParseError : public std::runtime_error {
public:
    explicit ParseError(const std::string& msg)
        : std::runtime_error(msg) {}
};

// Parser converts raw JSON wire format into Command structs.
//
// Expected wire format:
//   { "cmd": "SET", "args": ["mykey", "myvalue", "EX", "60"] }
class Parser {
public:
    Parser() = default;

    // Parses a JSON string into a Command.
    // Throws ParseError on malformed input.
    Command parse(const std::string& json);

    // Convenience: parse then validate arg count for the given command.
    // Throws ParseError if wrong number of args.
    Command parseAndValidate(const std::string& json);

private:
    // Minimum argument counts per command
    static int minArgs(const std::string& cmd);

    // Extracts a string field from a simple JSON object (no full JSON library)
    static std::string extractField(const std::string& json,
                                    const std::string& field);
};

} // namespace kvmemo`,
    annotations: [
      { lines: [9, 12], label: 'Command struct', color: C.amber, note: 'Plain data struct — no methods. name is normalised to uppercase (so "set" and "SET" both work). args is a vector of strings; the CommandHandler interprets their meaning.' },
      { lines: [14, 19], label: 'ParseError', color: C.rose, note: 'Custom exception extends std::runtime_error. Thrown for any malformed input: missing "cmd" field, non-array args, invalid JSON. TcpServer catches this and sends an error response to the client.' },
      { lines: [23, 24], label: 'Wire format', color: C.cyan, note: 'Simple JSON: {"cmd":"SET","args":["key","value","EX","60"]}. Chosen over binary protocol for debuggability — you can send commands with curl or any WebSocket client. Redis uses RESP (binary) for speed.' },
      { lines: [31, 32], label: 'parseAndValidate()', color: C.green, note: 'Parses then checks minArgs(). For example, SET needs at least 2 args (key + value). If you send {"cmd":"SET","args":["onlykey"]}, this throws ParseError before anything hits the engine.' },
      { lines: [38, 40], label: 'extractField()', color: C.violet, note: 'Hand-rolled JSON field extractor — no external library (nlohmann, rapidjson, etc.). Keeps the zero-dependency promise. Only handles the simple flat structure we need.' },
    ],
  },

  'dispatcher.h': {
    path: 'src/protocol/dispatcher.h',
    language: 'cpp',
    layer: 'protocol',
    color: C.amber,
    role: 'Command router',
    brief: 'Dispatcher maps command names ("SET", "GET", etc.) to their handler functions using a registry. When a Command arrives, it looks up the right handler and calls it. This decouples the network layer from the engine — adding a new command means adding one handler, nothing else changes.',
    code: `#pragma once
#include <string>
#include <unordered_map>
#include <functional>
#include <memory>
#include "command_registry.h"
#include "../engine/kv_engine.h"

namespace kvmemo {

struct Command;

// Response sent back to the client over the wire
struct Response {
    bool        ok;      // true = success, false = error
    std::string data;    // result string or error message
};

// Dispatcher routes a parsed Command to the correct handler function.
// Handlers are registered in CommandRegistry at startup.
//
// This is the Strategy + Registry pattern:
//   registry["SET"] = SetHandler
//   registry["GET"] = GetHandler  ...etc
class Dispatcher {
public:
    explicit Dispatcher(KVEngine* engine);

    // Routes cmd to the registered handler, returns a Response.
    // Returns an error Response if the command name is unknown.
    Response dispatch(const Command& cmd);

private:
    KVEngine*                       engine_;     // NOT owned
    std::unique_ptr<CommandRegistry> registry_;

    // Registers all built-in handlers (SET, GET, DEL, KEYS, TTL, EXISTS, FLUSH, PING)
    void registerBuiltins();
};

} // namespace kvmemo`,
    annotations: [
      { lines: [13, 16], label: 'Response struct', color: C.green, note: 'Simple success/error envelope. ok=true means the command worked. ok=false means an error (unknown command, wrong args, etc.). Serialised back to JSON: {"ok":true,"data":"Gagan"} or {"ok":false,"data":"ERR wrong number of args"}.' },
      { lines: [22, 24], label: 'Strategy + Registry', color: C.blue, note: 'Classic design pattern. Instead of a giant switch statement, a map of name→function. Adding EXPIRE or RENAME means adding one entry to the registry — zero changes to Dispatcher or TcpServer.' },
      { lines: [26, 26], label: 'Constructor', color: C.violet, note: 'Takes KVEngine* and immediately calls registerBuiltins(), which populates the registry. The engine pointer is forwarded to each handler so they can call engine->set(), engine->get(), etc.' },
      { lines: [29, 30], label: 'dispatch()', color: C.amber, note: 'registry_.find(cmd.name) — O(1) hash lookup. If found, calls the handler. If not found, returns Response{false, "ERR unknown command"}. The whole server flow converges here.' },
      { lines: [35, 35], label: 'registerBuiltins()', color: C.cyan, note: 'Called once at construction. Registers lambdas or function pointers for all 8 commands. Each lambda captures engine_ and calls the appropriate KVEngine method.' },
    ],
  },
}

/* ═══════════════════════════════════════════════════════════
   FOLDER TREE STRUCTURE
═══════════════════════════════════════════════════════════ */
const TREE = [
  { type: 'root', name: 'KVMemo/', depth: 0 },
  { type: 'dir', name: 'src/', depth: 1 },
  { type: 'dir', name: 'engine/', depth: 2, layer: 'engine' },
  { type: 'file', name: 'kv_engine.h', depth: 3, key: 'kv_engine.h', color: C.blue },
  { type: 'file', name: 'shard_manager.h', depth: 3, key: 'shard_manager.h', color: C.blue },
  { type: 'file', name: 'shard.h', depth: 3, key: 'shard.h', color: C.blue },
  { type: 'dir', name: 'ttl/', depth: 2, layer: 'ttl' },
  { type: 'file', name: 'ttl_manager.h', depth: 3, key: 'ttl_manager.h', color: C.cyan },
  { type: 'file', name: 'ttl_index.h', depth: 3, key: 'ttl_index.h', color: C.cyan },
  { type: 'dir', name: 'eviction/', depth: 2, layer: 'eviction' },
  { type: 'file', name: 'eviction_manager.h', depth: 3, key: 'eviction_manager.h', color: C.violet },
  { type: 'file', name: 'lru_cache.h', depth: 3, key: 'lru_cache.h', color: C.violet },
  { type: 'file', name: 'memory_tracker.h', depth: 3, key: 'memory_tracker.h', color: C.violet },
  { type: 'dir', name: 'server/', depth: 2, layer: 'server' },
  { type: 'file', name: 'tcp_server.h', depth: 3, key: 'tcp_server.h', color: C.green },
  { type: 'dir', name: 'protocol/', depth: 2, layer: 'protocol' },
  { type: 'file', name: 'parser.h', depth: 3, key: 'parser.h', color: C.amber },
  { type: 'file', name: 'dispatcher.h', depth: 3, key: 'dispatcher.h', color: C.amber },
  { type: 'dir', name: 'tests/', depth: 1 },
  { type: 'dir', name: 'docs/', depth: 1 },
  { type: 'file', name: 'CMakeLists.txt', depth: 1, key: null, color: C.t3 },
  { type: 'file', name: 'README.MD', depth: 1, key: null, color: C.t3 },
]

const LAYER_COLORS = {
  engine: '#3b82f6', ttl: '#06b6d4', eviction: '#8b5cf6',
  server: '#10b981', protocol: '#f59e0b',
}

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
function Styles() {
  useEffect(() => {
    if (document.getElementById('ce-css')) return
    const s = document.createElement('style')
    s.id = 'ce-css'
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;600&display=swap');
      @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
      @keyframes slideR  {from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
      @keyframes slideU  {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      @keyframes pulse   {0%,100%{opacity:1}50%{opacity:.3}}
      @keyframes spin    {to{transform:rotate(360deg)}}
      @keyframes shimmer {0%{background-position:200% center}100%{background-position:-200% center}}
      @keyframes glow    {0%,100%{box-shadow:0 0 0 0 currentColor}50%{box-shadow:0 0 12px 2px currentColor}}
      @keyframes typeIn  {from{width:0}to{width:100%}}
      @keyframes blink   {0%,100%{opacity:1}49%{opacity:1}50%,99%{opacity:0}}

      .ce-file-btn:hover { background: rgba(255,255,255,.04) !important; }
      .ce-file-btn.active { background: rgba(59,130,246,.08) !important; }

      .ce-code-line:hover { background: rgba(255,255,255,.03); }
      .ce-code-line.highlighted { background: rgba(59,130,246,.12) !important; border-left: 2px solid #3b82f6; }

      .anno-chip:hover { opacity:1 !important; transform:scale(1.05); }

      ::-webkit-scrollbar{width:4px;height:4px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:#1e3352;border-radius:2px}

      .ai-stream-cursor::after{content:'▋';animation:blink 1s step-start infinite;color:#3b82f6;margin-left:1px}
    `
    document.head.appendChild(s)
    return () => document.getElementById('ce-css')?.remove()
  }, [])
  return null
}

/* ═══════════════════════════════════════════════════════════
   SYNTAX HIGHLIGHTER (C++ — simple regex-based)
═══════════════════════════════════════════════════════════ */
function highlightCpp(line) {
  const keywords = /\b(class|struct|public|private|protected|explicit|virtual|override|const|constexpr|static|inline|namespace|using|template|typename|auto|void|bool|int|size_t|std|return|true|false|nullptr|if|else|while|for|new|delete|this|mutable|atomic|unique_ptr|vector|string|optional|map|unordered_map|list|thread|mutex|shared_mutex)\b/g
  const types = /\b(uint16_t|int16_t|uint32_t|size_t|ptrdiff_t)\b/g
  const strings = /"([^"]*)"/g
  const comments = /(\/\/.*)/g
  const numbers = /\b(\d+)\b/g
  const macros = /#(pragma|include|define|ifdef|endif|ifndef)\b/g
  const angle = /(<[^>]*>)/g

  // Escape HTML
  let html = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Comments (override everything)
  html = html.replace(/\/\/(.*)/, `<span style="color:#334e6a;font-style:italic">//$1</span>`)
  // Strings
  html = html.replace(/"([^"]*)"/g, `<span style="color:#34d399">"$1"</span>`)
  // Macros
  html = html.replace(/^(#\w+)/, `<span style="color:#f59e0b">$1</span>`)
  // Keywords
  html = html.replace(/\b(class|struct|public|private|protected|explicit|virtual|override|const|constexpr|static|inline|namespace|using|template|typename|auto|void|bool|return|true|false|nullptr|if|else|while|for|new|delete|this|mutable)\b/g,
    `<span style="color:#60a5fa">$1</span>`)
  // Primitive types
  html = html.replace(/\b(int|size_t|uint16_t|uint32_t|bool)\b/g,
    `<span style="color:#a78bfa">$1</span>`)
  // std::
  html = html.replace(/\bstd\b/g, `<span style="color:#22d3ee">std</span>`)
  // Numbers
  html = html.replace(/\b(\d+)\b/g, `<span style="color:#fcd34d">$1</span>`)

  return html
}

/* ═══════════════════════════════════════════════════════════
   AI EXPLANATION via Claude API
═══════════════════════════════════════════════════════════ */
async function fetchAIExplanation(fileKey, fileData, signal) {
  const prompt = `You are explaining C++ code to a developer learning systems programming. 
Be friendly, clear, and educational. Use simple analogies where helpful.

File: ${fileData.path}
Role: ${fileData.role}
Brief: ${fileData.brief}

Here is the complete source code:
\`\`\`cpp
${fileData.code}
\`\`\`

Write a structured explanation with these sections (use ### headers):
### Why This File Exists
(1-2 sentences — what problem does it solve in the system?)

### The Big Picture  
(How does this file fit into KVMemo's overall architecture? What calls it, what does it call?)

### Key Design Decisions
(2-3 bullet points — why was it designed this way? tradeoffs made?)

### Variables & Data Members
(Explain each important member variable — what it stores, why that type was chosen)

### Functions / Methods
(Explain each public method — what it does, its parameters, return value, and why it exists)

### A Concrete Example
(Walk through a real scenario — e.g. "when you call SET name Gagan EX 60, here's exactly what this file does...")

Keep it beginner-friendly but technically accurate. No fluff. Total length: ~400-500 words.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  return response
}

/* ═══════════════════════════════════════════════════════════
   MARKDOWN RENDERER (simple — handles ###, **, -, bullets)
═══════════════════════════════════════════════════════════ */
function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('### ')) {
      elements.push(
        <div key={i} style={{ fontSize: 13, fontWeight: 800, color: C.blue2, letterSpacing: '.04em', textTransform: 'uppercase', margin: '20px 0 8px', fontFamily: "'DM Sans',sans-serif", borderBottom: `1px solid ${C.b0}`, paddingBottom: 4 }}>
          {line.replace('### ', '')}
        </div>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <div key={i} style={{ fontSize: 15, fontWeight: 800, color: C.tw, margin: '16px 0 6px', fontFamily: "'DM Sans',sans-serif" }}>
          {line.replace('## ', '')}
        </div>
      )
    } else if (line.match(/^[*-] /)) {
      const content = line.replace(/^[*-] /, '')
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, margin: '4px 0', paddingLeft: 4 }}>
          <span style={{ color: C.blue, flexShrink: 0, marginTop: 2 }}>›</span>
          <span style={{ fontSize: 13, color: C.t1, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: content.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#f0f6fc">$1</strong>').replace(/`([^`]+)`/g, `<code style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#22d3ee;background:rgba(6,182,212,.1);padding:1px 5px;border-radius:3px">$1</code>`) }} />
        </div>
      )
    } else if (line.trim() === '') {
      if (i > 0) elements.push(<div key={i} style={{ height: 6 }} />)
    } else {
      elements.push(
        <p key={i} style={{ fontSize: 13, color: C.t1, lineHeight: 1.75, margin: '2px 0' }}
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#f0f6fc">$1</strong>').replace(/`([^`]+)`/g, `<code style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#22d3ee;background:rgba(6,182,212,.1);padding:1px 5px;border-radius:3px">$1</code>`) }}
        />
      )
    }
    i++
  }
  return elements
}

/* ═══════════════════════════════════════════════════════════
   CODE VIEWER with line annotations
═══════════════════════════════════════════════════════════ */
function CodeViewer({ fileData, activeAnno, onAnnoClick }) {
  const lines = fileData.code.split('\n')

  const getHighlightedLines = () => {
    if (activeAnno === null) return new Set()
    const anno = fileData.annotations[activeAnno]
    if (!anno) return new Set()
    const s = new Set()
    for (let l = anno.lines[0]; l <= anno.lines[1]; l++) s.add(l)
    return s
  }

  const highlighted = getHighlightedLines()

  return (
    <div style={{ background: '#04070d', borderRadius: 12, border: `1px solid ${C.b0}`, overflow: 'hidden' }}>
      {/* Code header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(0,0,0,.4)', borderBottom: `1px solid ${C.b0}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: .8 }} />)}
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.t3, marginLeft: 6 }}>{fileData.path}</span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {['engine', 'ttl', 'eviction', 'server', 'protocol'].filter(l => fileData.layer === l).map(l => (
            <span key={l} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, background: `${LAYER_COLORS[l]}18`, color: LAYER_COLORS[l], border: `1px solid ${LAYER_COLORS[l]}30`, fontFamily: "'JetBrains Mono',monospace" }}>{l}</span>
          ))}
          <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, background: `${fileData.color}15`, color: fileData.color, border: `1px solid ${fileData.color}28`, fontFamily: "'JetBrains Mono',monospace" }}>{fileData.role}</span>
        </div>
      </div>

      {/* Lines */}
      <div style={{ overflowX: 'auto', maxHeight: 460, overflowY: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, lineHeight: 1.7 }}>
          <tbody>
            {lines.map((line, idx) => {
              const lineNum = idx + 1
              const isHl = highlighted.has(lineNum)
              // Check if any annotation starts on this line
              const annoIdx = fileData.annotations.findIndex(a => a.lines[0] === lineNum)
              return (
                <tr key={idx} className={`ce-code-line${isHl ? ' highlighted' : ''}`}
                  style={{ borderLeft: isHl ? `2px solid ${fileData.annotations[activeAnno]?.color || C.blue}` : '2px solid transparent', transition: 'background .15s' }}>
                  <td style={{ padding: '0 14px 0 12px', color: C.t4, userSelect: 'none', textAlign: 'right', minWidth: 36, borderRight: `1px solid ${C.b0}`, fontSize: 10 }}>{lineNum}</td>
                  <td style={{ padding: '0 16px 0 12px', whiteSpace: 'pre', position: 'relative' }}>
                    <span dangerouslySetInnerHTML={{ __html: highlightCpp(line) || ' ' }} />
                    {annoIdx !== -1 && (
                      <button onClick={() => onAnnoClick(annoIdx === activeAnno ? null : annoIdx)}
                        style={{
                          marginLeft: 12, padding: '0px 8px', borderRadius: 4,
                          background: annoIdx === activeAnno ? `${fileData.annotations[annoIdx].color}30` : `${fileData.annotations[annoIdx].color}15`,
                          border: `1px solid ${fileData.annotations[annoIdx].color}${annoIdx === activeAnno ? '66' : '30'}`,
                          color: fileData.annotations[annoIdx].color,
                          fontSize: 9, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                          fontWeight: 600, letterSpacing: '.03em', transition: 'all .15s',
                          verticalAlign: 'middle',
                        }}
                        className="anno-chip"
                      >
                        {fileData.annotations[annoIdx].label} ›
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ANNOTATION PANEL
═══════════════════════════════════════════════════════════ */
function AnnoPanel({ fileData, activeAnno, onClose }) {
  if (activeAnno === null) return null
  const anno = fileData.annotations[activeAnno]
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${anno.color}44`, background: `${anno.color}0a`, padding: '16px 20px', animation: 'slideU .2s ease', marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: anno.color, boxShadow: `0 0 8px ${anno.color}` }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: anno.color, fontFamily: "'DM Sans',sans-serif", letterSpacing: '.04em', textTransform: 'uppercase' }}>{anno.label}</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, color: C.t3 }}>lines {anno.lines[0]}–{anno.lines[1]}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.t3, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }}>×</button>
      </div>
      <p style={{ fontSize: 13, color: C.t1, lineHeight: 1.8, margin: 0 }}>{anno.note}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   AI PANEL — streaming explanation
═══════════════════════════════════════════════════════════ */
function AIPanel({ fileKey, fileData }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const fetchExplanation = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setText(''); setDone(false); setError(null); setLoading(true)

    try {
      const res = await fetchAIExplanation(fileKey, fileData, abortRef.current.signal)
      if (!res.ok) throw new Error(`API ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done: doneReading, value } = await reader.read()
        if (doneReading) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''
        for (const event of events) {
          if (!event.startsWith('data:')) continue
          const data = event.replace(/^data:\s*/, '')
          if (data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            if (json.type === 'content_block_delta' && json.delta?.text) {
              setText(p => p + json.delta.text)
            }
          } catch { }
        }
      }
      setDone(true)
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [fileKey, fileData])

  useEffect(() => {
    fetchExplanation()
    return () => abortRef.current?.abort()
  }, [fileKey])

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${C.blue}18`, border: `1px solid ${C.blue}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.tw, fontFamily: "'DM Sans',sans-serif" }}>AI Explanation</div>
            <div style={{ fontSize: 10, color: C.t3 }}>Powered by KVMemo.AI</div>
          </div>
        </div>
        <button onClick={fetchExplanation} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, border: `1px solid ${C.b0}`, background: 'transparent', color: loading ? C.t3 : C.t2, cursor: loading ? 'default' : 'pointer', fontSize: 11, transition: 'all .15s', fontFamily: "'DM Sans',sans-serif" }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = C.b1 }} onMouseLeave={e => e.currentTarget.style.borderColor = C.b0}
        >
          <span style={{ display: 'inline-block', animation: loading ? 'spin 1s linear infinite' : 'none', fontSize: 12 }}>↺</span>
          {loading ? 'Generating…' : 'Regenerate'}
        </button>
      </div>

      {/* Content */}
      {error ? (
        <div style={{ padding: '14px 16px', borderRadius: 9, border: `1px solid ${C.rose}44`, background: `${C.rose}08`, color: C.rose2, fontSize: 13 }}>
          ⚠ {error} — check your API connection
        </div>
      ) : (
        <div style={{ fontSize: 13, color: C.t1, lineHeight: 1.75, position: 'relative' }}>
          {text ? (
            <div className={!done ? 'ai-stream-cursor' : ''}>
              {renderMarkdown(text)}
            </div>
          ) : loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[90, 70, 80, 60, 75].map((w, i) => (
                <div key={i} style={{ height: 12, borderRadius: 6, background: `linear-gradient(90deg,${C.b0},${C.b1},${C.b0})`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease infinite', width: `${w}%`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   FILE DETAIL PANEL
═══════════════════════════════════════════════════════════ */
function FilePanel({ fileKey, onClose }) {
  const [activeAnno, setActiveAnno] = useState(null)
  const [tab, setTab] = useState('code') // 'code' | 'ai'
  const fileData = FILES[fileKey]

  useEffect(() => { setActiveAnno(null); setTab('code') }, [fileKey])

  if (!fileData) return null

  const tabs = [
    { id: 'code', label: '📄 Code + Annotations' },
    { id: 'ai', label: '🤖 AI Deep Dive' },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', animation: 'slideR .25s ease', fontFamily: "'DM Sans',sans-serif" }}>
      {/* File header */}
      <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: fileData.color, flexShrink: 0 }} />
              <h2 style={{ fontSize: 20, fontWeight: 800, color: fileData.color, letterSpacing: '-.02em', fontFamily: "'JetBrains Mono',monospace", margin: 0 }}>{fileKey}</h2>
              <span style={{ fontSize: 10, padding: '2px 10px', borderRadius: 99, background: `${fileData.color}15`, color: fileData.color, border: `1px solid ${fileData.color}30` }}>{fileData.role}</span>
            </div>
            <p style={{ fontSize: 12, color: C.t3, fontFamily: "'JetBrains Mono',monospace", margin: '0 0 10px' }}>{fileData.path}</p>
            <p style={{ fontSize: 13.5, color: C.t2, lineHeight: 1.75, margin: 0, maxWidth: 640 }}>{fileData.brief}</p>
          </div>
          <button onClick={onClose} style={{ flexShrink: 0, marginLeft: 16, width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.b0}`, background: C.bg1, color: C.t2, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.b1; e.currentTarget.style.color = C.tw }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.b0; e.currentTarget.style.color = C.t2 }}
          >×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${C.b0}`, paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id}  onClick={() => setTab(t.id)} style={{ padding: '8px 16px', borderRadius: '7px 7px 0 0', border: `1px solid ${tab === t.id ? C.b0 : 'transparent'}`, borderBottom: `1px solid ${tab === t.id ? fileData.color : 'transparent'}`, background: tab === t.id ? C.bg2 : 'transparent', color: tab === t.id ? fileData.color : C.t3, fontSize: 12, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', transition: 'all .15s', marginBottom: -1, fontFamily: "'DM Sans',sans-serif" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 32px' }}>
        {tab === 'code' ? (
          <>
            {/* Annotation chips row */}
            {fileData.annotations.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                <span style={{ fontSize: 10, color: C.t3, alignSelf: 'center', marginRight: 2 }}>Jump to:</span>
                {fileData.annotations.map((a, i) => (
                  <button key={i} onClick={() => setActiveAnno(activeAnno === i ? null : i)} style={{ padding: '3px 10px', borderRadius: 5, border: `1px solid ${activeAnno === i ? a.color + '55' : a.color + '28'}`, background: activeAnno === i ? `${a.color}18` : `${a.color}08`, color: a.color, fontSize: 10, cursor: 'pointer', transition: 'all .15s', fontFamily: "'DM Sans',sans-serif" }}>
                    {a.label}
                  </button>
                ))}
              </div>
            )}

            <CodeViewer fileData={fileData} activeAnno={activeAnno} onAnnoClick={setActiveAnno} />
            <AnnoPanel fileData={fileData} activeAnno={activeAnno} onClose={() => setActiveAnno(null)} />
          </>
        ) : (
          <AIPanel key={fileKey} fileKey={fileKey} fileData={fileData} />
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TREE NODE
═══════════════════════════════════════════════════════════ */
function TreeNode({ node, selectedKey, onSelect, expandedDirs, onToggleDir }) {
  const indent = node.depth * 16

  if (node.type === 'root') {
    return (
      <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 14 }}>📁</span>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: C.tw }}>{node.name}</span>
        <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 99, background: `${C.blue}15`, color: C.blue2, border: `1px solid ${C.blue}28` }}>v0.1.0</span>
      </div>
    )
  }

  if (node.type === 'dir') {
    const isOpen = expandedDirs.has(node.name)
    const lc = LAYER_COLORS[node.layer]
    return (
      <button className="ce-file-btn" onClick={() => onToggleDir(node.name)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: `5px 16px 5px ${16 + indent}px`, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .1s' }}>
        <span style={{ fontSize: 10, color: C.t3, fontFamily: "'JetBrains Mono',monospace", transition: 'transform .15s', display: 'inline-block', transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
        <span style={{ fontSize: 12, color: lc || C.t2, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{node.name}</span>
        {node.layer && <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, background: `${lc}15`, color: lc, border: `1px solid ${lc}28`, marginLeft: 'auto', marginRight: 4 }}>{node.layer}</span>}
      </button>
    )
  }

  if (node.type === 'file') {
    const isSelected = selectedKey === node.key
    const isClickable = !!node.key
    const color = node.color || C.t3
    return (
      <button className={`ce-file-btn${isSelected ? ' active' : ''}`} onClick={() => isClickable && onSelect(node.key)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: `4px 16px 4px ${16 + indent}px`, background: isSelected ? `${color}08` : 'transparent', border: 'none', cursor: isClickable ? 'pointer' : 'default', textAlign: 'left', transition: 'background .1s', borderLeft: isSelected ? `2px solid ${color}` : '2px solid transparent' }}>
        <span style={{ fontSize: 10, color: isClickable ? color : C.t4 }}>
          {isClickable ? '◈' : '·'}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: isSelected ? color : isClickable ? C.t1 : C.t4, fontWeight: isSelected ? 700 : 400, transition: 'color .1s' }}>
          {node.name}
        </span>
        {isSelected && <span style={{ marginLeft: 'auto', fontSize: 8, color: color, animation: 'pulse 1.5s ease infinite' }}>●</span>}
      </button>
    )
  }

  return null
}

/* ═══════════════════════════════════════════════════════════
   WELCOME SCREEN
═══════════════════════════════════════════════════════════ */
function Welcome() {
  const highlights = [
    { color: C.blue, icon: '⚡', label: '64-shard concurrency', note: 'Click any engine/ file to see how parallel access works' },
    { color: C.cyan, icon: '⏱', label: '100ms TTL eviction', note: 'See ttl_manager.h and ttl_index.h for the dual-strategy' },
    { color: C.violet, icon: '🧠', label: 'LRU memory control', note: 'eviction_manager.h + lru_cache.h implement O(1) eviction' },
    { color: C.green, icon: '🌐', label: 'Zero dependencies', note: 'tcp_server.h + parser.h — pure C++20 stdlib only' },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center', animation: 'fadeIn .4s ease', marginTop: '10px' }}>
      <div style={{ fontSize: 52, marginBottom: 20 }}>🗂</div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: C.tw, letterSpacing: '-.03em', marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>Click any file to explore it</h2>
      <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.75, maxWidth: 420, marginBottom: 32 }}>
        Each file opens with real source code, annotated explanations of every variable and function, and an AI-generated deep-dive you can ask to regenerate.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 500, textAlign: 'left' }}>
        {highlights.map((h, i) => (
          <div key={i} style={{ padding: '14px 16px', borderRadius: 11, border: `1px solid ${h.color}28`, background: `${h.color}07` }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{h.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: h.color, marginBottom: 4, fontFamily: "'DM Sans',sans-serif" }}>{h.label}</div>
            <div style={{ fontSize: 11, color: C.t3, lineHeight: 1.55 }}>{h.note}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ROOT COMPONENT
═══════════════════════════════════════════════════════════ */
export default function CodeExplorer() {
  const [selectedKey, setSelectedKey] = useState(null)
  const [expandedDirs, setExpanded] = useState(new Set(['src/', 'engine/', 'ttl/', 'eviction/', 'server/', 'protocol/']))

  const toggleDir = (name) => {
    setExpanded(p => {
      const n = new Set(p)
      n.has(name) ? n.delete(name) : n.add(name)
      return n
    })
  }

  // Filter tree to only show open dirs
  const visibleTree = TREE.filter(node => {
    if (node.depth <= 1) return true
    if (node.depth === 2) return expandedDirs.has('src/')
    if (node.depth === 3) {
      const parentDir = TREE.slice(0, TREE.indexOf(node)).reverse().find(n => n.type === 'dir' && n.depth === 2)
      return expandedDirs.has('src/') && expandedDirs.has(parentDir?.name)
    }
    return true
  })

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", color: C.t1, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <Styles />

      {/* Page header */}
      <div style={{ borderBottom: `1px solid ${C.b0}`, background: C.bg1, padding: '20px 28px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Link to="/docs/getting-started">
                <div style={{ color: "yellow" }}> ❮❮ Back </div>
              </Link>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.tw, letterSpacing: '-.025em', margin: 0, fontFamily: "'DM Sans',sans-serif" }}>Code Explorer</h1>
              <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 99, background: `${C.green}18`, color: C.green2, border: `1px solid ${C.green}30` }}>interactive</span>
            </div>
            <p style={{ fontSize: 13, color: C.t3, margin: 0 }}>
              Click any <span style={{ color: C.cyan2, fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>.h</span> file in the tree to see real source code with annotations + AI explanation
            </p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(LAYER_COLORS).map(([name, color]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, background: `${color}10`, border: `1px solid ${color}25` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 10, color, fontFamily: "'JetBrains Mono',monospace" }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', overflow: 'hidden', minHeight: 0, width: '100%' }}>

        {/* ── SIDEBAR — file tree ── */}
        <div style={{ borderRight: `1px solid ${C.b0}`, overflowY: 'auto', background: C.bg1 }}>
          {visibleTree.map((node, i) => (
            <TreeNode key={i} node={node} selectedKey={selectedKey} onSelect={key => setSelectedKey(key)} expandedDirs={expandedDirs} onToggleDir={toggleDir} />
          ))}

          {/* Legend */}
          <div style={{ padding: '16px', borderTop: `1px solid ${C.b0}`, marginTop: 8 }}>
            <p style={{ fontSize: 9.5, color: C.t4, marginBottom: 8, letterSpacing: '.06em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace" }}>file types</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: C.t3 }}>
                <span style={{ color: C.cyan2, fontFamily: "'JetBrains Mono',monospace" }}>◈</span> clickable — has deep dive
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: C.t4 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>·</span> not yet covered
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN PANEL ── */}
        <div style={{ overflowY: 'auto', background: C.bg }}>
          {selectedKey
            ? <FilePanel key={selectedKey} fileKey={selectedKey} onClose={() => setSelectedKey(null)} />
            : <Welcome />
          }
        </div>
      </div>
    </div>
  )
}

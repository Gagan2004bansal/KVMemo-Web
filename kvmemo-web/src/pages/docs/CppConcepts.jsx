import { useState, useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const C = {
  bg: '#020817', bg1: '#070f1e', bg2: '#0b1525', bg3: '#0f1f36',
  b0: '#1e3352', b1: '#254070', b2: '#2e5090',
  tw: '#f0f6fc', t1: '#c9d8f0', t2: '#7a9abf', t3: '#3d5a80', t4: '#1e3352',
  blue:   '#3b82f6', blue2:   '#60a5fa', blue3: '#93c5fd',
  cyan:   '#06b6d4', cyan2:   '#22d3ee',
  violet: '#8b5cf6', violet2: '#a78bfa',
  green:  '#10b981', green2:  '#34d399',
  amber:  '#f59e0b', amber2:  '#fcd34d',
  rose:   '#f43f5e', rose2:   '#fb7185',
  orange: '#f97316', orange2: '#fdba74',
  teal:   '#14b8a6', teal2:   '#2dd4bf',
  pink:   '#ec4899', pink2:   '#f472b6',
  lime:   '#84cc16', lime2:   '#a3e635',
}

/* ═══════════════════════════════════════════════════════════
   C++ CONCEPTS DATA — JSON-driven, easy to extend
═══════════════════════════════════════════════════════════ */
const CATEGORIES = [
  { id: 'preprocessor', label: 'Preprocessor',  color: C.amber  },
  { id: 'modern',       label: 'Modern C++20',   color: C.violet },
  { id: 'memory',       label: 'Memory & RAII',  color: C.blue   },
  { id: 'concurrency',  label: 'Concurrency',    color: C.cyan   },
  { id: 'stdlib',       label: 'STL & Streams',  color: C.green  },
  { id: 'oop',          label: 'OOP Patterns',   color: C.rose   },
]

const CONCEPTS = [
  // ── PREPROCESSOR ──────────────────────────────────────────
  {
    id: 'pragma-once',
    category: 'preprocessor',
    title: '#pragma once',
    badge: 'Include Guard',
    color: C.amber,
    difficulty: 'beginner',
    emoji: '🛡️',
    tagline: 'Prevents a header from being included twice in the same compilation',
    snippet: `// Every .h file in KVMemo starts with this
#pragma once

#include <string>
#include <vector>

class KVEngine { ... };`,
    why: 'When multiple .cpp files include the same header, the compiler would see duplicate class/function definitions — causing "redefinition" errors.',
    withoutIt: 'kv_engine.h included by both tcp_server.cpp and dispatcher.cpp → compiler sees KVEngine defined twice → fatal error: redefinition of class KVEngine.',
    howItHelps: 'The compiler marks the file on first inclusion. Every subsequent #include of the same file is silently skipped. One line. Zero effort. Zero bugs.',
    kvmemoFile: 'Every .h file in src/',
    standard: 'Non-standard but universally supported (GCC, Clang, MSVC)',
    proTip: 'The alternative is the old-school #ifndef HEADER_H / #define HEADER_H / #endif pattern. #pragma once is shorter and has no risk of name collision.',
  },
  {
    id: 'include',
    category: 'preprocessor',
    title: '#include',
    badge: 'Copy-Paste',
    color: C.amber,
    difficulty: 'beginner',
    emoji: '📋',
    tagline: 'Literally copy-pastes another file\'s contents at this exact point',
    snippet: `// Angle brackets = search system paths
#include <string>
#include <unordered_map>
#include <chrono>

// Quotes = search relative to current file
#include "kv_engine.h"
#include "../eviction/lru_cache.h"`,
    why: 'C++ compiles one .cpp file at a time. To use a class defined in another file, you must declare it first. #include brings in that declaration.',
    withoutIt: 'Writing KVEngine* engine in dispatcher.h without including kv_engine.h → compiler error: unknown type name KVEngine.',
    howItHelps: 'The preprocessor runs before the compiler. It finds the file, copies its text verbatim, then the compiler sees one big merged source. That\'s the whole trick.',
    kvmemoFile: 'Every source file',
    standard: 'C++98 and beyond',
    proTip: 'Every #include adds compile time. KVMemo avoids including heavy headers in .h files by using forward declarations (class ShardManager;) where possible.',
  },

  // ── MODERN C++20 ──────────────────────────────────────────
  {
    id: 'nodiscard',
    category: 'modern',
    title: '[[nodiscard]]',
    badge: 'C++17 Attribute',
    color: C.violet,
    difficulty: 'intermediate',
    emoji: '🚫',
    tagline: 'Forces the caller to use the return value — the compiler warns if they ignore it',
    snippet: `class KVEngine {
public:
  // Caller MUST check the bool.
  // Silently ignoring whether SET succeeded is a bug.
  [[nodiscard]] bool set(const std::string& key,
                         const std::string& value,
                         int ttlSeconds = 0);

  [[nodiscard]] std::optional<std::string> get(
      const std::string& key);
};

// ✅ Correct usage
if (!engine.set("name", "Gagan")) {
  // handle OOM or error
}

// ❌ This now produces a compiler warning:
engine.set("name", "Gagan"); // warning: ignoring return value`,
    why: 'set() returns false when memory is full or input is invalid. If you call engine.set() and ignore the return, you silently lose data with no indication anything went wrong.',
    withoutIt: 'Developer calls engine.set("key", bigValue) in a loop, never checks the bool. Memory fills up, all sets start returning false, keys are silently lost. Bug found 3 weeks later in production.',
    howItHelps: 'The compiler now emits a warning (treated as error with -Werror) if the return value is discarded. You literally cannot forget to handle the result.',
    kvmemoFile: 'src/core/kv_engine.h',
    standard: 'C++17 — works in GCC 7+, Clang 3.9+, MSVC 2017+',
    proTip: 'You can add a reason: [[nodiscard("memory may be full — check return value")]]. The message shows up in the compiler warning, making the intent crystal clear.',
  },
  {
    id: 'noexcept',
    category: 'modern',
    title: 'noexcept',
    badge: 'C++11 Specifier',
    color: C.violet,
    difficulty: 'intermediate',
    emoji: '🔒',
    tagline: 'Promises this function will never throw an exception — unlocks compiler optimisations',
    snippet: `class LRUCache {
public:
  // Moving a cache is cheap & can never throw
  LRUCache(LRUCache&& other) noexcept;

  // Size is just reading an atomic — never throws
  [[nodiscard]] size_t size() const noexcept;

  // This CAN throw (memory allocation) — no noexcept
  void touch(const std::string& key);
};

// The compiler uses noexcept info to optimise:
// std::vector<LRUCache> v;
// v.push_back(cache); // uses MOVE (fast) because move is noexcept
//                     // would use COPY (slow) if move wasn't noexcept`,
    why: 'Exception handling code has overhead. When the compiler knows a function can\'t throw, it can skip generating stack-unwinding code and make smarter decisions about moving vs copying objects.',
    withoutIt: 'std::vector<LRUCache> falls back to copying instead of moving when resizing (C++ standard requirement for exception safety). Copies are much slower than moves for large containers.',
    howItHelps: 'Two benefits: (1) compiler generates faster code with no exception tables, (2) STL containers use move instead of copy for noexcept move constructors — a huge performance win.',
    kvmemoFile: 'src/eviction/lru_cache.h, src/core/shard.h',
    standard: 'C++11. The noexcept operator (not specifier) can query at compile time: static_assert(noexcept(x.size()))',
    proTip: 'If a noexcept function actually throws, std::terminate() is called immediately — no unwinding. So only mark functions noexcept when you truly guarantee no exception.',
  },
  {
    id: 'optional',
    category: 'modern',
    title: 'std::optional<T>',
    badge: 'C++17',
    color: C.violet,
    difficulty: 'intermediate',
    emoji: '📦',
    tagline: 'A value that might or might not exist — the modern alternative to returning nullptr or -1',
    snippet: `// Returns the value, or "nothing" if key is missing/expired
[[nodiscard]] std::optional<std::string> get(
    const std::string& key);

// Usage — forces you to handle the "not found" case:
auto result = engine.get("username");

if (result.has_value()) {
  std::cout << result.value(); // safe
}

// Shorthand with value_or:
std::string name = engine.get("username")
                         .value_or("anonymous");

// ❌ The old way — caller might forget to check!
// std::string* get(const std::string& key); // nullptr = not found`,
    why: 'GET must express "key found" vs "key missing". The old approaches — returning an empty string, a null pointer, or a sentinel value — are all ambiguous or unsafe.',
    withoutIt: 'Returning "" for a missing key is wrong (empty string is a valid value). Returning nullptr requires raw pointers — memory management nightmare. Returning a bool + output parameter is ugly.',
    howItHelps: 'std::optional<string> is self-documenting: the absence of a value IS the "not found" result. It lives on the stack (no heap allocation). The caller is forced by the API to consider both cases.',
    kvmemoFile: 'src/core/kv_engine.h, src/core/shard.h',
    standard: 'C++17. Header: <optional>',
    proTip: 'optional<T> uses in-place storage — no heap allocation for small types. It\'s essentially a bool + an aligned byte buffer the size of T.',
  },
  {
    id: 'structured-bindings',
    category: 'modern',
    title: 'Structured Bindings',
    badge: 'C++17',
    color: C.violet,
    difficulty: 'intermediate',
    emoji: '🔗',
    tagline: 'Unpack a pair, tuple, or struct into named variables in one line',
    snippet: `// Iterating a map in KVMemo's shard:
for (const auto& [key, entry] : data_) {
  if (!isExpired(entry)) {
    result.push_back(key);
  }
}

// Without structured bindings (C++14 and below):
for (const auto& pair : data_) {
  const std::string& key   = pair.first;
  const Entry&       entry = pair.second;
  if (!isExpired(entry)) {
    result.push_back(key);
  }
}

// Also works for returning multiple values:
auto [success, message] = tryInsert(key, value);`,
    why: 'Maps store std::pair<const Key, Value>. Accessing .first and .second everywhere makes code verbose and unclear. You lose track of what "first" means.',
    withoutIt: 'pair.first vs pair.second everywhere. When you have nested maps or complex types, this becomes: it->second.first.second.first — completely unreadable.',
    howItHelps: 'Names make intent clear. [key, entry] instantly tells you what each part is. The compiler generates the same code — zero overhead, maximum readability.',
    kvmemoFile: 'src/core/shard.cpp, src/eviction/lru_cache.cpp',
    standard: 'C++17. Works with pairs, tuples, arrays, and structs with public members.',
    proTip: 'auto& gives a reference (no copy). const auto& for read-only iteration. auto&& for forwarding references in generic code.',
  },
  {
    id: 'auto',
    category: 'modern',
    title: 'auto keyword',
    badge: 'C++11 / C++14',
    color: C.violet,
    difficulty: 'beginner',
    emoji: '🤖',
    tagline: 'Lets the compiler deduce the type — eliminates redundancy without losing safety',
    snippet: `// Without auto — type repeated twice, verbose:
std::unordered_map<std::string, Entry>::iterator it
    = data_.find(key);

// With auto — compiler knows the type from find():
auto it = data_.find(key);

// Lambda with auto parameter (C++14 generic lambda):
auto handler = [](const auto& cmd) {
  return dispatch(cmd);
};

// Range-for with auto:
for (auto& [k, v] : data_) { ... }

// auto NEVER loses type safety — it's still strongly typed
// This would still be a compile error:
// auto x = engine.get("key") + 1; // optional + int is illegal`,
    why: 'Writing std::unordered_map<std::string, Entry>::iterator every time is error-prone, hard to read, and couples the code to the container type unnecessarily.',
    withoutIt: 'Changing a container type (e.g. map → unordered_map) requires updating the iterator type everywhere. Long type names make lines too wide to read.',
    howItHelps: 'auto deduces the exact type at compile time — full type safety, zero runtime cost. If you change the container, all auto variables adapt automatically.',
    kvmemoFile: 'Throughout all source files',
    standard: 'C++11 for variables, C++14 for return type deduction and generic lambdas.',
    proTip: 'Avoid auto when the type isn\'t obvious from context. auto x = getEngine() is fine. auto x = compute() is confusing if you don\'t know what compute returns.',
  },

  // ── MEMORY & RAII ──────────────────────────────────────────
  {
    id: 'unique-ptr',
    category: 'memory',
    title: 'std::unique_ptr<T>',
    badge: 'RAII / C++11',
    color: C.blue,
    difficulty: 'intermediate',
    emoji: '🎯',
    tagline: 'Owns a heap object exclusively — automatically destroys it when the owner is destroyed',
    snippet: `class KVEngine {
private:
  // KVEngine exclusively OWNS these objects.
  // When KVEngine is destroyed, these are automatically freed.
  std::unique_ptr<ShardManager> shardManager_;
  std::unique_ptr<MemoryTracker> memTracker_;
};

// Creation — heap allocation but ownership is clear:
auto engine = std::make_unique<KVEngine>(16);

// Transfer of ownership (move semantics):
auto engine2 = std::move(engine);
// engine is now null — engine2 owns the KVEngine

// ❌ This doesn't compile — unique_ptr is non-copyable:
// auto engine3 = engine; // error: use of deleted function`,
    why: 'KVEngine needs to create ShardManager on the heap (large object, dynamic size). Raw new/delete means you must manually call delete everywhere — including in every error path and exception handler.',
    withoutIt: 'A raw pointer member: if the constructor throws after new ShardManager() but before new MemoryTracker(), ShardManager leaks forever. With 12 components, managing this manually is a nightmare.',
    howItHelps: 'RAII: Resource Acquisition Is Initialisation. unique_ptr calls delete automatically in its destructor — no matter how the owning object is destroyed (normal exit, exception, early return). Zero leaks.',
    kvmemoFile: 'src/core/kv_engine.h, src/server/tcp_server.h',
    standard: 'C++11. Header: <memory>. Always prefer make_unique<T>() over new T().',
    proTip: 'unique_ptr has zero overhead compared to raw pointer — the destructor call is inlined and optimised away. It\'s not a "smart pointer tax" — it\'s the same speed with safety for free.',
  },
  {
    id: 'move-semantics',
    category: 'memory',
    title: 'Move Semantics',
    badge: 'C++11',
    color: C.blue,
    difficulty: 'advanced',
    emoji: '🚀',
    tagline: 'Transfer ownership of resources instead of copying them — dramatically faster for large objects',
    snippet: `// Response is returned from dispatch() — this is a MOVE:
Response dispatch(const Command& cmd) {
  Response res;
  res.data = buildResponse(cmd); // string built in-place
  return res; // NRVO or move — no copy of the string
}

// Strings in KVMemo use move when inserting into map:
void Shard::set(const std::string& key,
                std::string value) { // value passed by value
  data_[key] = std::move(value); // MOVE into map — no copy
}

// The difference:
// Copy: allocate new buffer, memcpy N bytes, free old buffer
// Move: swap 3 pointers (ptr, size, capacity) — O(1) always`,
    why: 'Copying a large string or vector means allocating new memory and copying every byte. For a key-value store handling thousands of operations per second, this overhead adds up fast.',
    withoutIt: 'Returning a std::vector<std::string> from keys() without moves would copy every string twice — once into the vector, once out of the function. For 10,000 keys, that\'s 20,000 allocations.',
    howItHelps: 'Move "steals" the internal buffer pointer from the source object instead of copying data. Moving a 1MB string takes the same time as moving a 1-byte string — just pointer swaps.',
    kvmemoFile: 'src/core/shard.cpp, src/protocol/response_builder.cpp',
    standard: 'C++11. std::move() casts to rvalue reference. The actual move happens in the move constructor/operator.',
    proTip: 'After std::move(x), x is in a "valid but unspecified state". Don\'t use it after moving. The compiler will warn you in most cases.',
  },
  {
    id: 'emplace',
    category: 'memory',
    title: 'emplace / emplace_back',
    badge: 'C++11',
    color: C.blue,
    difficulty: 'intermediate',
    emoji: '📌',
    tagline: 'Construct an object directly inside the container — skips the copy/move entirely',
    snippet: `// ❌ push_back: construct Entry here, then MOVE it into map
Entry e;
e.value = value;
e.hasTTL = true;
data_.emplace(key, std::move(e)); // still 1 construction + 1 move

// ✅ emplace: construct Entry DIRECTLY in the map's memory
// No separate construction, no move — one step
data_.emplace(
  std::piecewise_construct,
  std::forward_as_tuple(key),
  std::forward_as_tuple(value, expiry, true)
);

// For vectors — same principle:
result.reserve(data_.size());
for (auto& [k, _] : data_) {
  result.emplace_back(k); // construct string in-place in vector
}`,
    why: 'push_back(Entry{...}) constructs the Entry, then moves it into the container. emplace constructs it directly at the final memory location — one step instead of two.',
    withoutIt: 'In the KEYS command, which returns all key strings, using push_back copies every key string. With emplace_back, strings are constructed directly in the result vector.',
    howItHelps: 'Reduces construction count from 2 to 1. For objects without cheap move constructors (rare in modern C++, but possible with custom types), this can be a significant win.',
    kvmemoFile: 'src/core/shard.cpp, src/eviction/lru_cache.cpp',
    standard: 'C++11 for emplace_back, C++11 for unordered_map::emplace',
    proTip: 'emplace forwards arguments as constructor arguments. emplace_back(1, 2, 3) calls T(1, 2, 3) in-place. But if T\'s constructor is not constexpr, there\'s little reason to prefer emplace for simple types.',
  },

  // ── CONCURRENCY ──────────────────────────────────────────
  {
    id: 'shared-mutex',
    category: 'concurrency',
    title: 'std::shared_mutex',
    badge: 'C++17 / Reader-Writer Lock',
    color: C.cyan,
    difficulty: 'advanced',
    emoji: '🔐',
    tagline: 'Multiple threads can read simultaneously, but writing is exclusive — perfect for read-heavy stores',
    snippet: `class Shard {
private:
  mutable std::shared_mutex mutex_;
  std::unordered_map<std::string, Entry> data_;

public:
  // READ operation: multiple threads OK simultaneously
  std::optional<std::string> get(const std::string& key) {
    std::shared_lock lock(mutex_); // shared = read lock
    auto it = data_.find(key);
    if (it == data_.end()) return std::nullopt;
    return isExpired(it->second) ? std::nullopt
                                 : std::make_optional(it->second.value);
  }

  // WRITE operation: exclusive — only one thread at a time
  void set(const std::string& key, const std::string& val) {
    std::unique_lock lock(mutex_); // exclusive = write lock
    data_[key] = Entry{val, ...};
  }
};`,
    why: 'A KV store is typically 80-95% reads. Using a regular mutex for GET would force all threads to queue up even though concurrent reads are perfectly safe.',
    withoutIt: '100 concurrent GET requests on the same shard would queue up one by one, even though they\'re all just reading. Throughput: 1x instead of 100x.',
    howItHelps: 'shared_lock allows N simultaneous readers. unique_lock kicks all readers out and blocks new ones. SET waits for readers to finish, then gets exclusive access. Correct AND fast.',
    kvmemoFile: 'src/core/shard.h',
    standard: 'C++17. std::shared_lock for reading, std::unique_lock for writing.',
    proTip: 'The mutable keyword on mutex_ lets const member functions lock a mutable mutex — get() is logically const (doesn\'t change the map) but physically must acquire a lock.',
  },
  {
    id: 'atomic',
    category: 'concurrency',
    title: 'std::atomic<T>',
    badge: 'C++11 / Lock-free',
    color: C.cyan,
    difficulty: 'intermediate',
    emoji: '⚛️',
    tagline: 'Thread-safe read/write of a single value without any mutex — maps to a single CPU instruction',
    snippet: `class MemoryTracker {
private:
  std::atomic<size_t> usedBytes_{ 0 };

public:
  void add(size_t bytes) {
    usedBytes_.fetch_add(bytes, std::memory_order_relaxed);
    // ^ single x86 instruction: LOCK XADD
    // No mutex, no blocking, no context switch
  }

  bool isOverLimit() const {
    return maxBytes_ > 0
        && usedBytes_.load() >= maxBytes_;
    // ^ reads are also atomic — no torn reads
  }
};

// TTLManager's running_ flag:
std::atomic<bool> running_{ true };
// Main thread writes: running_.store(false)
// Worker thread reads: while (running_.load()) { ... }`,
    why: 'MemoryTracker is called from multiple shard threads simultaneously (every SET adds bytes). A mutex here would be a bottleneck — the lock is acquired and released thousands of times per second.',
    withoutIt: 'Without atomic, two threads doing usedBytes_ += bytes simultaneously would cause a data race — undefined behaviour in C++. The counter could corrupt to nonsense values.',
    howItHelps: 'On x86, atomic<size_t> compiles to a single LOCK XADD instruction — hardware-level atomicity. No mutex, no blocking, no overhead. 10-100x faster than a mutex for a simple counter.',
    kvmemoFile: 'src/eviction/memory_tracker.h, src/server/tcp_server.h',
    standard: 'C++11. Header: <atomic>. Works for integral types and pointers.',
    proTip: 'memory_order_relaxed is safe for a counter where you only need the final value, not ordering guarantees. For a flag (running_), memory_order_seq_cst (default) is safer.',
  },
  {
    id: 'thread',
    category: 'concurrency',
    title: 'std::thread',
    badge: 'C++11',
    color: C.cyan,
    difficulty: 'intermediate',
    emoji: '🧵',
    tagline: 'Launch a function as a concurrent OS thread — the foundation of KVMemo\'s parallelism',
    snippet: `class TTLManager {
private:
  std::thread thread_;
  std::atomic<bool> running_{ false };

public:
  void start() {
    running_ = true;
    // Launch runLoop() as a separate thread
    thread_ = std::thread([this] { runLoop(); });
  }

  void stop() {
    running_ = false;
    if (thread_.joinable()) {
      thread_.join(); // wait for thread to finish cleanly
    }
  }

  void runLoop() {
    while (running_) {
      evictExpired();
      std::this_thread::sleep_for(
          std::chrono::milliseconds(100)); // tick every 100ms
    }
  }
};`,
    why: 'TTL expiry needs to happen continuously in the background — every 100ms, without blocking the main server from accepting connections.',
    withoutIt: 'TTL would only be checked lazily (on GET). Keys would stay in memory until someone asks for them. A 10-second TTL key could live in RAM for minutes if nobody reads it.',
    howItHelps: 'std::thread runs runLoop() concurrently. The server handles connections on the main thread while TTLManager silently cleans up expired keys every 100ms.',
    kvmemoFile: 'src/server/tcp_server.h, src/core/ttl_manager.h',
    standard: 'C++11. Header: <thread>. Always call join() or detach() before the thread object is destroyed.',
    proTip: 'A joinable thread that is destroyed without join()/detach() calls std::terminate() — instant crash. TTLManager::~TTLManager() calls stop() which calls join() to prevent this.',
  },

  // ── STL & STREAMS ──────────────────────────────────────────
  {
    id: 'ostringstream',
    category: 'stdlib',
    title: 'std::ostringstream',
    badge: 'String Builder',
    color: C.green,
    difficulty: 'beginner',
    emoji: '🖊️',
    tagline: 'Build a string piece by piece using the familiar << operator — no manual concatenation',
    snippet: `#include <sstream>

// KVMemo's response builder for the KEYS command:
std::string buildKeysResponse(
    const std::vector<std::string>& keys) {

  std::ostringstream oss;
  oss << keys.size() << " key(s):\\n";

  for (size_t i = 0; i < keys.size(); ++i) {
    oss << (i + 1) << ") " << keys[i] << "\\n";
  }
  return oss.str(); // extract as std::string
}

// Output: "3 key(s):\n1) name\n2) age\n3) city\n"

// ❌ The naive way — O(N²) due to string reallocation:
// std::string result = "";
// result += "3 key(s):\n";   // allocates new buffer
// result += "1) name\n";     // allocates again, copies all
// result += "2) age\n";      // allocates again...`,
    why: 'Building a response string by concatenating with += is O(N²) — each += may allocate a new larger buffer and copy all previous data. With 1000 keys, that\'s ~500,000 unnecessary byte copies.',
    withoutIt: 'Naive string += in a loop for 10,000 keys: each concatenation copies all previous content. What should take 10ms takes 1 second. Users notice.',
    howItHelps: 'ostringstream maintains an internal buffer that grows geometrically (like vector). All << operations append to the same buffer. str() at the end makes exactly one final string.',
    kvmemoFile: 'src/protocol/response_builder.cpp, src/metrics/metrics.cpp',
    standard: 'C++98. Header: <sstream>. For performance-critical code, consider fmt::format (C++20) or std::format.',
    proTip: 'To reuse an oss, call oss.str("") to clear it and oss.clear() to reset error flags. Or just declare a new one — it\'s stack-allocated so construction is nearly free.',
  },
  {
    id: 'chrono',
    category: 'stdlib',
    title: 'std::chrono',
    badge: 'Time Library / C++11',
    color: C.green,
    difficulty: 'intermediate',
    emoji: '⏱️',
    tagline: 'Type-safe time and duration — the compiler prevents you from accidentally mixing seconds and milliseconds',
    snippet: `#include <chrono>
using namespace std::chrono;

// Storing TTL expiry in a Shard entry:
struct Entry {
  std::string value;
  steady_clock::time_point expiry; // absolute point in time
  bool hasTTL = false;
};

// Setting a 60-second TTL:
void Shard::set(const std::string& key,
                const std::string& val, int ttlSecs) {
  Entry e;
  e.value = val;
  if (ttlSecs > 0) {
    e.expiry = steady_clock::now()
             + seconds(ttlSecs); // type-safe duration
    e.hasTTL = true;
  }
  data_[key] = std::move(e);
}

// Checking expiry — compiler prevents unit confusion:
bool isExpired(const Entry& e) {
  return e.hasTTL && steady_clock::now() > e.expiry;
}`,
    why: 'Time handling is notoriously bug-prone. Is that number milliseconds or seconds? Signed or unsigned? What happens when the system clock changes? These are real bugs in production systems.',
    withoutIt: 'Using plain int for TTL: storing epoch + ttlSeconds. System clock adjustment (NTP sync, daylight saving) could cause keys to expire immediately or never expire. Race conditions when int overflows.',
    howItHelps: 'steady_clock never goes backwards (unlike system_clock). Duration types prevent unit errors: seconds(60) + milliseconds(100) compiles; seconds(60) + int(100) does not.',
    kvmemoFile: 'src/core/shard.h, src/core/ttl_manager.h, src/core/ttl_index.h',
    standard: 'C++11. Header: <chrono>. Always prefer steady_clock for durations, system_clock only for wall-clock display.',
    proTip: 'duration_cast<milliseconds>(steady_clock::now() - start) gives elapsed time. C++14 adds literals: 100ms, 60s, 1h — much more readable than milliseconds(100).',
  },
  {
    id: 'unordered-map',
    category: 'stdlib',
    title: 'std::unordered_map',
    badge: 'Hash Table / O(1)',
    color: C.green,
    difficulty: 'intermediate',
    emoji: '🗄️',
    tagline: 'O(1) average lookup by key — the core data structure powering every GET and SET',
    snippet: `class Shard {
private:
  // The actual store: key → Entry
  // O(1) average find, insert, erase
  std::unordered_map<std::string, Entry> data_;

public:
  std::optional<std::string> get(const std::string& key) {
    auto it = data_.find(key); // O(1) — hash the key, find bucket
    if (it == data_.end()) return std::nullopt;
    return it->second.value;
  }

  void set(const std::string& k, const std::string& v) {
    data_[k] = Entry{v}; // O(1) insert or update
  }
};

// vs std::map (sorted, red-black tree) = O(log N):
// For 1,000,000 keys: map = ~20 comparisons, unordered_map = ~1 hash`,
    why: 'A KV store\'s entire value proposition is fast lookup. Using a sorted std::map would give O(log N) — acceptable, but unordered_map gives O(1) average with a simple hash function.',
    withoutIt: 'std::map with 1M keys: every GET does ~20 string comparisons (tree traversal). unordered_map: 1 hash computation + 1-2 comparisons. At 1M ops/sec, that\'s millions of extra comparisons per second.',
    howItHelps: 'Hash the key string → compute bucket index → look in that bucket. Average 1 comparison. Worst case O(N) with hash collisions, but essentially never happens with a good hash function.',
    kvmemoFile: 'src/core/shard.h — the central data store',
    standard: 'C++11. Header: <unordered_map>. Custom hash functions via std::hash<T> specialisation.',
    proTip: 'Call data_.reserve(expectedSize) at construction to pre-allocate buckets and avoid rehashing. Rehashing copies every element — expensive for large maps.',
  },

  // ── OOP PATTERNS ──────────────────────────────────────────
  {
    id: 'explicit',
    category: 'oop',
    title: 'explicit constructor',
    badge: 'Implicit Conversion Guard',
    color: C.rose,
    difficulty: 'beginner',
    emoji: '🚧',
    tagline: 'Prevents the compiler from silently using a constructor as an automatic type converter',
    snippet: `// WITHOUT explicit — dangerous!
class KVEngine {
public:
  KVEngine(size_t numShards); // implicit!
};

void startServer(const KVEngine& engine) { ... }

// These would SILENTLY compile:
startServer(16);       // 16 → KVEngine(16) implicitly
startServer(true);     // true → 1 → KVEngine(1) implicitly!
startServer(nullptr);  // ??? undefined behaviour

// ✅ WITH explicit — these are now compile errors:
class KVEngine {
public:
  explicit KVEngine(size_t numShards);
};
startServer(16);   // ❌ error: no implicit conversion
startServer(KVEngine(16)); // ✅ must be intentional`,
    why: 'A constructor that takes one argument can be accidentally used by the compiler to convert types. This leads to subtle bugs where a wrong type is silently accepted.',
    withoutIt: 'A function expecting a KVEngine could accidentally accept an integer literal 0 (treated as null pointer, coerced to size_t). These bugs are invisible at the call site.',
    howItHelps: 'explicit forces the caller to write KVEngine(16) explicitly. The intent is clear, accidental conversions are impossible, and the compiler catches mistakes immediately.',
    kvmemoFile: 'src/core/kv_engine.h, src/server/tcp_server.h, src/eviction/memory_tracker.h',
    standard: 'C++98. C++11 extends it to conversion operators: explicit operator bool().',
    proTip: 'Rule of thumb: make all single-argument constructors explicit unless you specifically want implicit conversion (e.g. std::string(const char*) — intentionally implicit for convenience).',
  },
  {
    id: 'const-ref',
    category: 'oop',
    title: 'const & parameters',
    badge: 'Best Practice',
    color: C.rose,
    difficulty: 'beginner',
    emoji: '📎',
    tagline: 'Pass large objects by const reference — avoids copying while preventing accidental modification',
    snippet: `// 3 ways to pass a string to a function:

// 1. By value — COPIES the string (expensive for long strings!)
bool set(std::string key, std::string value);

// 2. By const reference — NO copy, read-only access
bool set(const std::string& key,  // & = reference = no copy
         const std::string& value); // const = can't modify

// 3. By pointer — old C style, don't use in modern C++
bool set(const std::string* key, const std::string* value);

// KVMemo uses const& everywhere for input parameters:
std::optional<std::string> get(const std::string& key);
bool del(const std::string& key);
bool exists(const std::string& key);

// sizeof(std::string) ≈ 24 bytes on 64-bit systems
// Passing by value copies those 24 bytes + heap content
// Passing by const& copies 8 bytes (just a pointer)`,
    why: 'std::string is not a simple int. It contains a heap-allocated buffer. Passing by value copies the entire string content — for a 1KB value, that\'s 1KB of unnecessary allocation + memcpy.',
    withoutIt: 'Every GET call would copy the key string just to look it up. For 100,000 GET/sec with average 20-byte keys: 2MB of unnecessary copying per second, plus allocator pressure.',
    howItHelps: 'const& passes a pointer (8 bytes on 64-bit) instead of copying. const prevents accidental modification. The compiler enforces both — you literally cannot accidentally modify a const ref.',
    kvmemoFile: 'Every function signature in the codebase',
    standard: 'C++98. The foundation of efficient C++ API design.',
    proTip: 'For small trivially-copyable types (int, bool, char, pointers), pass by value — it\'s cheaper than a reference indirection. For anything bigger: const& for input, & for output, && for move.',
  },
  {
    id: 'namespace',
    category: 'oop',
    title: 'namespace',
    badge: 'Name Organisation',
    color: C.rose,
    difficulty: 'beginner',
    emoji: '📁',
    tagline: 'Groups related names together and prevents conflicts with other libraries',
    snippet: `// All KVMemo code lives inside namespace kvmemo:
namespace kvmemo {

class KVEngine { ... };
class ShardManager { ... };
struct Entry { ... };

} // namespace kvmemo

// Outside the namespace, you need the prefix:
kvmemo::KVEngine engine(16);

// Or bring specific names in:
using kvmemo::KVEngine;
KVEngine engine(16); // now works

// Without namespace, if you include a library that
// also defines "Entry", the compiler has no idea which one:
// error: ambiguous reference to 'Entry'`,
    why: 'Large projects include dozens of headers. Without namespaces, all class and function names compete globally — any two libraries with a class named "Entry" or "Parser" would conflict.',
    withoutIt: 'KVMemo defines Parser. You add a JSON library that also defines Parser. Catastrophic naming conflict — one must be renamed, affecting all callers.',
    howItHelps: 'kvmemo::Parser and json::Parser coexist peacefully. The :: prefix makes it clear which library each type comes from — self-documenting code.',
    kvmemoFile: 'Every source file — namespace kvmemo { ... }',
    standard: 'C++98. C++17 adds nested namespace shorthand: namespace a::b::c { } instead of namespace a { namespace b { namespace c { }}}',
    proTip: 'Never write using namespace std; in a header file. It forces all includers to pull in all of std:: into global scope — exactly the problem namespaces exist to prevent.',
  },
  {
    id: 'default-delete',
    category: 'oop',
    title: '= default / = delete',
    badge: 'Rule of Five',
    color: C.rose,
    difficulty: 'intermediate',
    emoji: '🎛️',
    tagline: 'Explicitly control which special member functions exist — prevents accidental copies of objects that shouldn\'t be copied',
    snippet: `class TTLManager {
public:
  // Destructor: explicitly default — compiler generates it
  ~TTLManager() = default;

  // Move constructor: OK to move a TTLManager
  TTLManager(TTLManager&&) noexcept = default;

  // Copy constructor: DELETED — you can't copy a TTLManager
  // (it owns a thread — what would "copy a thread" even mean?)
  TTLManager(const TTLManager&) = delete;

  // Copy assignment: also deleted
  TTLManager& operator=(const TTLManager&) = delete;
};

// Now these compile-time checks work:
TTLManager a(shardMgr, ttlIndex);
TTLManager b = std::move(a); // ✅ move is fine
TTLManager c = a;            // ❌ error: use of deleted function`,
    why: 'TTLManager owns a std::thread. "Copying a thread" has no meaningful definition. Without = delete, the compiler would either generate a broken copy or silently share state between instances.',
    withoutIt: 'Passing TTLManager by value to a function accidentally copies it. The copy has a dangling thread. Behaviour: crash, data races, or silent corruption depending on timing.',
    howItHelps: '= delete makes the copy constructor a compile-time error. = default explicitly opts into compiler-generated code. Both self-document the intent: "this type is move-only, no copies allowed."',
    kvmemoFile: 'src/core/ttl_manager.h, src/server/tcp_server.h',
    standard: 'C++11. Part of the "Rule of Five": destructor, copy constructor, copy assignment, move constructor, move assignment.',
    proTip: 'If you declare ANY of the five special members, the compiler won\'t generate the others automatically. Always be explicit about all five — it prevents subtle bugs when your class grows.',
  },
  {
    id: 'lambda',
    category: 'oop',
    title: 'Lambda expressions',
    badge: 'C++11 / Anonymous Functions',
    color: C.rose,
    difficulty: 'intermediate',
    emoji: 'λ',
    tagline: 'Anonymous functions defined inline — perfect for command handlers, callbacks, and short algorithms',
    snippet: `// KVMemo's Dispatcher registers handlers as lambdas:
void Dispatcher::registerBuiltins() {

  // Lambda captures engine_ by pointer, takes Command, returns Response
  registry_["SET"] = [this](const Command& cmd) -> Response {
    if (cmd.args.size() < 2)
      return {false, "ERR wrong number of arguments"};

    int ttl = 0;
    if (cmd.args.size() >= 4 && cmd.args[2] == "EX")
      ttl = std::stoi(cmd.args[3]);

    bool ok = engine_->set(cmd.args[0], cmd.args[1], ttl);
    return {ok, ok ? "OK" : "ERR out of memory"};
  };

  registry_["PING"] = [](const Command&) -> Response {
    return {true, "PONG"};
  };
}

// Lambda anatomy: [capture](params) -> ReturnType { body }
// [this] = capture the current object's pointer
// [&]   = capture all by reference
// [=]   = capture all by value`,
    why: 'Each command (SET, GET, DEL, PING…) needs its own handler function. Defining 8 separate named functions and registering them is verbose. Lambdas let you define and register in one place.',
    withoutIt: 'Without lambdas: 8 static member functions or free functions, passed as function pointers. All the logic scattered across the file instead of co-located with the registration.',
    howItHelps: 'The handler\'s code lives right next to its registration. Adding a new command is adding one lambda in one place. The compiler generates an efficient functor object — zero overhead.',
    kvmemoFile: 'src/protocol/dispatcher.cpp, src/server/tcp_server.cpp',
    standard: 'C++11 for basic lambdas. C++14 for generic lambdas (auto params). C++20 for template lambdas.',
    proTip: 'Capturing [this] in a lambda stores the pointer — be careful about object lifetimes! If the object is destroyed and the lambda is called later, that\'s a dangling pointer crash.',
  },
]

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
function Styles() {
  useEffect(() => {
    if (document.getElementById('cc-css')) return
    const s = document.createElement('style')
    s.id = 'cc-css'
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
      @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
      @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
      @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.3} }
      @keyframes glow     { 0%,100%{box-shadow:0 0 0px currentColor} 50%{box-shadow:0 0 16px currentColor} }
      @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      @keyframes spark    { 0%{opacity:0;transform:scale(0) rotate(0deg)} 50%{opacity:1;transform:scale(1.2) rotate(180deg)} 100%{opacity:0;transform:scale(0) rotate(360deg)} }
      @keyframes scanLine { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
      @keyframes titleGlow{ 0%,100%{text-shadow:0 0 20px rgba(59,130,246,0)} 50%{text-shadow:0 0 30px rgba(59,130,246,.4),0 0 60px rgba(139,92,246,.2)} }
      @keyframes borderSpin{ to{--angle:360deg} }
      @keyframes ripple   { 0%{transform:scale(0);opacity:.6} 100%{transform:scale(3);opacity:0} }

      .concept-card {
        transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease;
        cursor: pointer;
      }
      .concept-card:hover {
        transform: translateY(-4px) scale(1.015);
      }
      .concept-card.expanded {
        transform: none;
      }

      .filter-btn { transition: all .18s ease; }
      .filter-btn:hover { transform: translateY(-1px); }

      .shimmer-text {
        background: linear-gradient(90deg,#c9d8f0 0%,#f0f6fc 28%,#60a5fa 45%,#a78bfa 55%,#f0f6fc 72%,#c9d8f0 100%);
        background-size: 200% auto;
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        animation: shimmer 5s linear infinite;
      }

      .title-flash { animation: titleGlow 3s ease infinite; }

      .difficulty-pip {
        display:inline-block; width:7px; height:7px; border-radius:50%;
        margin-right:3px;
      }

      ::-webkit-scrollbar{width:4px;height:4px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:#1e3352;border-radius:2px}

      .search-input::placeholder { color: #3d5a80; }
      .search-input:focus { outline: none; }
    `
    document.head.appendChild(s)
    return () => document.getElementById('cc-css')?.remove()
  }, [])
  return null
}

/* ═══════════════════════════════════════════════════════════
   SYNTAX HIGHLIGHT — token-based, no double-processing
═══════════════════════════════════════════════════════════ */
const KEYWORDS = new Set(['class','struct','public','private','protected',
  'explicit','virtual','override','const','constexpr','static','inline',
  'namespace','using','template','typename','auto','void','return',
  'true','false','nullptr','if','else','while','for','new','delete',
  'this','mutable','noexcept'])
const TYPES = new Set(['int','size_t','uint16_t','uint32_t','bool','std'])

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

function highlightLine(raw) {
  if (!raw.trim()) return '\u00a0'
  const trimmed = raw.trimStart()
  const indent  = raw.slice(0, raw.length - trimmed.length)

  // Whole-line comment
  if (trimmed.startsWith('//')) {
    return escHtml(indent) + '<span style="color:#3d5a80;font-style:italic">' + escHtml(trimmed) + '</span>'
  }

  // Split inline comment (only if outside a string — count preceding quotes)
  let codePart = raw, commentPart = ''
  const ci = raw.indexOf('//')
  if (ci !== -1) {
    const quotesBefore = (raw.slice(0, ci).match(/"/g) || []).length
    if (quotesBefore % 2 === 0) {
      codePart = raw.slice(0, ci)
      commentPart = raw.slice(ci)
    }
  }

  // Preprocessor line
  const pm = codePart.match(/^(\s*)(#\w+)(.*)$/)
  if (pm) {
    return escHtml(pm[1]) +
      '<span style="color:#f59e0b">' + escHtml(pm[2]) + '</span>' +
      escHtml(pm[3]) +
      (commentPart ? '<span style="color:#3d5a80;font-style:italic">' + escHtml(commentPart) + '</span>' : '')
  }

  // Tokenise
  const tokens = []
  let i = 0, s = codePart
  while (i < s.length) {
    // [[attribute]]
    if (s[i] === '[' && s[i+1] === '[') {
      const e = s.indexOf(']]', i)
      if (e !== -1) { tokens.push({t:'attr', v: s.slice(i, e+2)}); i = e+2; continue }
    }
    // String literal
    if (s[i] === '"') {
      let j = i+1
      while (j < s.length && s[j] !== '"') { if (s[j]==='\\') j++; j++ }
      tokens.push({t:'str', v: s.slice(i, j+1)}); i = j+1; continue
    }
    // Word
    if (/[a-zA-Z_]/.test(s[i])) {
      let j = i
      while (j < s.length && /\w/.test(s[j])) j++
      tokens.push({t:'word', v: s.slice(i,j)}); i = j; continue
    }
    // Number
    if (/\d/.test(s[i]) && (i===0 || !/\w/.test(s[i-1]))) {
      let j = i
      while (j < s.length && /[\d.]/.test(s[j])) j++
      tokens.push({t:'num', v: s.slice(i,j)}); i = j; continue
    }
    tokens.push({t:'other', v: s[i]}); i++
  }

  const rendered = tokens.map(tok => {
    if (tok.t === 'attr')   return '<span style="color:#a78bfa">' + escHtml(tok.v) + '</span>'
    if (tok.t === 'str')    return '<span style="color:#34d399">' + escHtml(tok.v) + '</span>'
    if (tok.t === 'num')    return '<span style="color:#fcd34d">' + escHtml(tok.v) + '</span>'
    if (tok.t === 'word') {
      if (KEYWORDS.has(tok.v)) return '<span style="color:#60a5fa">' + escHtml(tok.v) + '</span>'
      if (TYPES.has(tok.v))    return '<span style="color:#93c5fd">' + escHtml(tok.v) + '</span>'
    }
    return escHtml(tok.v)
  }).join('')

  return rendered + (commentPart
    ? '<span style="color:#3d5a80;font-style:italic">' + escHtml(commentPart) + '</span>'
    : '')
}

function SyntaxLine({ line }) {
  return <span dangerouslySetInnerHTML={{ __html: highlightLine(line) }} />
}
/* ═══════════════════════════════════════════════════════════
   DIFFICULTY BADGE
═══════════════════════════════════════════════════════════ */
const DIFF_CONFIG = {
  beginner:     { label: 'Beginner',     color: C.green,  pips: 1 },
  intermediate: { label: 'Intermediate', color: C.amber,  pips: 2 },
  advanced:     { label: 'Advanced',     color: C.rose,   pips: 3 },
}
function DiffBadge({ level }) {
  const { label, color, pips } = DIFF_CONFIG[level] || DIFF_CONFIG.beginner
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:2, fontSize:9.5, color, padding:'2px 7px', borderRadius:99, background:`${color}14`, border:`1px solid ${color}28`, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
      {Array.from({length:3}).map((_,i) => (
        <span key={i} className="difficulty-pip" style={{ background: i < pips ? color : C.b0, width:5, height:5 }} />
      ))}
      {label}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════
   CONCEPT CARD
═══════════════════════════════════════════════════════════ */
function ConceptCard({ concept, index }) {
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab]           = useState('why')
  const cardRef                 = useRef(null)

  const cat = CATEGORIES.find(c => c.id === concept.category)
  const { color, title, badge, emoji, tagline, snippet, why, withoutIt, howItHelps, kvmemoFile, standard, proTip, difficulty } = concept

  const toggleExpanded = () => {
    if (!expanded && cardRef.current) {
      setTimeout(() => cardRef.current.scrollIntoView({ behavior:'smooth', block:'nearest' }), 60)
    }
    setExpanded(p => !p)
    setTab('why')
  }

  const TABS = [
    { id:'why',    label:'Why use it',        content: why },
    { id:'without',label:'Without it',         content: withoutIt },
    { id:'how',    label:'In KVMemo',          content: howItHelps },
  ]

  return (
    <div ref={cardRef} className={`concept-card${expanded?' expanded':''}`}
      style={{
        borderRadius:16,
        border:`1px solid ${expanded ? color+'60' : color+'22'}`,
        background: expanded ? `${color}07` : C.bg1,
        overflow:'hidden',
        boxShadow: expanded
          ? `0 0 0 1px ${color}22, 0 8px 40px ${color}14, 0 2px 8px rgba(0,0,0,.4)`
          : `0 2px 12px rgba(0,0,0,.3)`,
        animation: `fadeUp .4s ${index * .04}s ease both`,
        position:'relative',
      }}
    >
      {/* Top accent line */}
      <div style={{ height:2.5, background:`linear-gradient(90deg, ${color}00 0%, ${color} 30%, ${color}cc 70%, ${color}00 100%)` }} />

      {/* Card header — always visible */}
      <div onClick={toggleExpanded} style={{ padding:'18px 20px 16px', cursor:'pointer', userSelect:'none' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>

          {/* Category indicator — typographic, no emoji */}
          <div style={{
            width:44, height:44, borderRadius:11, flexShrink:0,
            background:`${color}14`, border:`1.5px solid ${color}38`,
            display:'flex', alignItems:'center', justifyContent:'center',
            position:'relative', overflow:'hidden',
          }}>
            <span style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:13, fontWeight:700, color,
              letterSpacing:'-.02em', zIndex:1,
              userSelect:'none',
            }}>
              {title.replace(/[^A-Z#[\]!]/g,'').slice(0,3) || title.slice(0,2).toUpperCase()}
            </span>
            <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 30% 30%, ${color}18, transparent 70%)` }} />
          </div>

          {/* Title block */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:7, marginBottom:5 }}>
              {/* TITLE — the highlight with glow */}
              <h3 className="title-flash" style={{
                margin:0, fontSize:15.5, fontWeight:800,
                color: color,
                fontFamily:"'JetBrains Mono',monospace",
                letterSpacing:'-.01em',
              }}>{title}</h3>
              <span style={{ fontSize:9, padding:'2px 8px', borderRadius:5, background:`${color}14`, color, border:`1px solid ${color}28`, fontFamily:"'JetBrains Mono',monospace", fontWeight:600 }}>{badge}</span>
              <DiffBadge level={difficulty} />
            </div>
            <p style={{ margin:0, fontSize:12.5, color: expanded ? C.t1 : C.t2, lineHeight:1.65 }}>{tagline}</p>

            {/* Meta row */}
            <div style={{ display:'flex', gap:12, marginTop:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:10, color:C.t3, display:'flex', alignItems:'center', gap:4 }}>
                {cat?.label}
              </span>
              <span style={{ fontSize:10, color:C.t3 }}>in: {kvmemoFile}</span>
            </div>
          </div>

          {/* Expand chevron */}
          <div style={{ flexShrink:0, width:28, height:28, borderRadius:8, border:`1px solid ${expanded?color+'44':C.b0}`, background:expanded?`${color}10`:C.bg2, display:'flex', alignItems:'center', justifyContent:'center', color:expanded?color:C.t3, transition:'all .2s', fontSize:12 }}>
            <span style={{ display:'inline-block', transition:'transform .2s', transform:expanded?'rotate(180deg)':'none' }}>▾</span>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ animation:'fadeIn .25s ease', borderTop:`1px solid ${color}20` }}>

          {/* Code snippet */}
          <div style={{ background:'#030810', borderBottom:`1px solid ${C.b0}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderBottom:`1px solid rgba(255,255,255,.04)` }}>
              {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{width:9,height:9,borderRadius:'50%',background:c,opacity:.75}}/>)}
              <span style={{ marginLeft:8, fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.t4 }}>{title} — live example from KVMemo</span>
            </div>
            <pre style={{ margin:0, padding:'14px 18px', fontSize:11, lineHeight:1.85, overflowX:'auto', fontFamily:"'JetBrains Mono',monospace" }}>
              {snippet.split('\n').map((line, i) => (
                <div key={i} style={{ minHeight:'1em' }}>
                  <SyntaxLine line={line} />
                </div>
              ))}
            </pre>
          </div>

          {/* 3-tab explanation section */}
          <div style={{ padding:'16px 20px 20px' }}>
            {/* Tabs */}
            <div style={{ display:'flex', gap:4, marginBottom:16, borderBottom:`1px solid ${C.b0}`, paddingBottom:0 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={e=>{e.stopPropagation();setTab(t.id)}} style={{
                  padding:'7px 14px', borderRadius:'7px 7px 0 0',
                  border:`1px solid ${tab===t.id?color+'44':'transparent'}`,
                  borderBottom:`2px solid ${tab===t.id?color:'transparent'}`,
                  background:tab===t.id?`${color}10`:'transparent',
                  color:tab===t.id?color:C.t3,
                  fontSize:11.5, fontWeight:tab===t.id?700:400,
                  cursor:'pointer', marginBottom:-1, transition:'all .15s',
                  fontFamily:"'DM Sans',sans-serif",
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <p key={tab} style={{ margin:0, fontSize:13.5, color:C.t1, lineHeight:1.8, animation:'fadeIn .2s ease' }}>
              {TABS.find(t=>t.id===tab)?.content}
            </p>

            {/* Bottom metadata row */}
            <div style={{ display:'flex', gap:16, marginTop:16, paddingTop:14, borderTop:`1px solid ${C.b0}`, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:200 }}>
                <p style={{ margin:'0 0 4px', fontSize:9.5, color:C.t3, letterSpacing:'.08em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>Standard</p>
                <p style={{ margin:0, fontSize:12, color:C.t2 }}>{standard}</p>
              </div>
              <div style={{ flex:2, minWidth:200 }}>
                <p style={{ margin:'0 0 4px', fontSize:9.5, color:C.t3, letterSpacing:'.08em', textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>Pro tip</p>
                <p style={{ margin:0, fontSize:12, color:C.t2, lineHeight:1.7 }}>{proTip}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   SEARCH BAR
═══════════════════════════════════════════════════════════ */
function SearchBar({ value, onChange }) {
  return (
    <div style={{ position:'relative', flex:1, maxWidth:380 }}>
      <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.t3, fontSize:13, pointerEvents:'none', fontFamily:"'JetBrains Mono',monospace" }}>&#x2315;</span>
      <input
        className="search-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search concepts (e.g. atomic, RAII, optional)"
        style={{
          width:'100%', padding:'9px 12px 9px 32px',
          borderRadius:10, border:`1px solid ${C.b0}`,
          background:C.bg1, color:C.t1,
          fontSize:13, fontFamily:"'DM Sans',sans-serif",
          transition:'border-color .15s',
        }}
        onFocus={e => e.target.style.borderColor = C.b2}
        onBlur={e => e.target.style.borderColor = C.b0}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STATS BAR
═══════════════════════════════════════════════════════════ */
function StatsBar({ total, showing }) {
  const byDiff = {
    beginner:     CONCEPTS.filter(c=>c.difficulty==='beginner').length,
    intermediate: CONCEPTS.filter(c=>c.difficulty==='intermediate').length,
    advanced:     CONCEPTS.filter(c=>c.difficulty==='advanced').length,
  }
  return (
    <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap', padding:'10px 0', fontSize:12, color:C.t3 }}>
      <span>{showing < total ? `${showing} of ` : ''}<strong style={{color:C.t1}}>{total}</strong> concepts</span>
      <span style={{color:C.b1}}>·</span>
      {Object.entries(byDiff).map(([d, n]) => {
        const {color, label} = DIFF_CONFIG[d]
        return (
          <span key={d} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{width:7,height:7,borderRadius:'50%',background:color,display:'inline-block'}}/>
            <span style={{color:C.t3}}>{n} {label.toLowerCase()}</span>
          </span>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <div style={{ padding:'52px 28px 36px', position:'relative', overflow:'hidden', borderBottom:`1px solid ${C.b0}` }}>
      {/* bg orbs */}
      <div aria-hidden style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,.06) 0%,transparent 65%)', top:-300, left:'5%' }} />
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,.05) 0%,transparent 65%)', top:-200, right:'10%' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(circle,rgba(30,51,82,.5) 1px,transparent 1px)`, backgroundSize:'38px 38px', maskImage:'radial-gradient(ellipse 90% 80% at 50% 0%,black 30%,transparent 100%)', WebkitMaskImage:'radial-gradient(ellipse 90% 80% at 50% 0%,black 30%,transparent 100%)' }} />
      </div>

      <div style={{ position:'relative', zIndex:1, maxWidth:900, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'4px 14px', borderRadius:99, border:`1px solid ${C.b1}`, background:`${C.blue}0d` }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:C.green, boxShadow:`0 0 6px ${C.green}`, animation:'pulse 2s ease infinite' }}/>
            <span style={{ fontSize:11, color:C.t2, letterSpacing:'.04em' }}>From the KVMemo codebase · C++20</span>
          </div>
        </div>

        <h1 style={{ fontSize:'clamp(28px,4.5vw,52px)', fontWeight:900, letterSpacing:'-.04em', lineHeight:1.08, marginBottom:14, fontFamily:"'DM Sans',sans-serif", color:C.tw }}>
          C++ Concepts you'll{' '}
          <span className="shimmer-text">actually use</span>
        </h1>
        <p style={{ fontSize:15, color:C.t2, lineHeight:1.8, maxWidth:560, marginBottom:0 }}>
          Every concept here appears in KVMemo's real source code. Click any card to see <strong style={{color:C.t1}}>why it was used</strong>, <strong style={{color:C.t1}}>what breaks without it</strong>, and <strong style={{color:C.t1}}>how it solves the problem</strong> — with actual code examples.
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
export default function CppConcepts() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch]                 = useState('')
  const [diffFilter, setDiffFilter]         = useState('all')

  const filtered = CONCEPTS.filter(c => {
    const matchCat  = activeCategory === 'all' || c.category === activeCategory
    const matchDiff = diffFilter === 'all' || c.difficulty === diffFilter
    const q = search.toLowerCase()
    const matchSearch = !q
      || c.title.toLowerCase().includes(q)
      || c.tagline.toLowerCase().includes(q)
      || c.badge.toLowerCase().includes(q)
      || c.why.toLowerCase().includes(q)
      || c.category.toLowerCase().includes(q)
    return matchCat && matchDiff && matchSearch
  })

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", color:C.t1, minHeight:'100%' }}>
      <Styles />
      <Hero />

      {/* Controls */}
      <div style={{ position:'sticky', top:56, zIndex:100, background:`${C.bg}f0`, backdropFilter:'blur(12px)', borderBottom:`1px solid ${C.b0}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'12px 28px' }}>
          {/* Category filters */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
            <button className="filter-btn" onClick={()=>setActiveCategory('all')} style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${activeCategory==='all'?C.blue+'55':C.b0}`, background:activeCategory==='all'?`${C.blue}14`:C.bg1, color:activeCategory==='all'?C.blue2:C.t2, fontSize:12, fontWeight:activeCategory==='all'?700:400, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              All ({CONCEPTS.length})
            </button>
            {CATEGORIES.map(cat => {
              const count = CONCEPTS.filter(c=>c.category===cat.id).length
              const active = activeCategory === cat.id
              return (
                <button key={cat.id} className="filter-btn" onClick={()=>setActiveCategory(cat.id)}
                  style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${active?cat.color+'55':C.b0}`, background:active?`${cat.color}14`:C.bg1, color:active?cat.color:C.t2, fontSize:12, fontWeight:active?700:400, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  {cat.label} <span style={{opacity:.55}}>({count})</span>
                </button>
              )
            })}
          </div>

          {/* Search + difficulty */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <SearchBar value={search} onChange={setSearch} />
            <div style={{ display:'flex', gap:4 }}>
              {['all','beginner','intermediate','advanced'].map(d => {
                const cfg = d === 'all' ? { label:'All levels', color:C.t2 } : DIFF_CONFIG[d]
                return (
                  <button key={d} onClick={()=>setDiffFilter(d)} style={{ padding:'7px 12px', borderRadius:8, border:`1px solid ${diffFilter===d?(cfg.color+'55'):C.b0}`, background:diffFilter===d?`${cfg.color}12`:C.bg1, color:diffFilter===d?cfg.color:C.t3, fontSize:11, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:diffFilter===d?700:400 }}>
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 28px 80px' }}>
        <StatsBar total={CONCEPTS.length} showing={filtered.length} />

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px', color:C.t3 }}>
            
            <p style={{ fontSize:16, color:C.t2 }}>No concepts match "{search}"</p>
            <button onClick={()=>{setSearch('');setActiveCategory('all');setDiffFilter('all')}} style={{ marginTop:12, padding:'8px 20px', borderRadius:8, border:`1px solid ${C.b0}`, background:C.bg1, color:C.t2, cursor:'pointer', fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:18, alignItems:'start' }}>
            {filtered.map((concept, i) => (
              <ConceptCard key={concept.id} concept={concept} index={i} />
            ))}
          </div>
        )}

        {/* Add more hint */}
        {/* <div style={{ marginTop:48, padding:'20px 24px', borderRadius:14, border:`1px dashed ${C.b0}`, background:`${C.bg1}88`, display:'flex', alignItems:'center', gap:16 }}>
          
          <div>
            <p style={{ margin:'0 0 4px', fontSize:13, fontWeight:700, color:C.t1, fontFamily:"'DM Sans',sans-serif", letterSpacing:'-.01em' }}>Extend with a new concept</p>
            <p style={{ margin:0, fontSize:12.5, color:C.t3, lineHeight:1.6 }}>
              Open <code style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C.cyan2, background:`${C.cyan}12`, padding:'1px 6px', borderRadius:4 }}>CppConcepts.jsx</code> and add one object to the <code style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C.violet2, background:`${C.violet}12`, padding:'1px 6px', borderRadius:4 }}>CONCEPTS</code> array. The card appears automatically — no other changes needed.
            </p>
          </div>
        </div> */}
      </div>
    </div>
  )
}

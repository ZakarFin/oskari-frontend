# Oskari Frontend Repository Description

This repository is the core frontend platform for Oskari-based applications. It provides the runtime framework, modular feature bundles, shared UI components, public frontend API structures, and the build/test tooling used to assemble and run Oskari applications.

## Purpose

Oskari is a framework for building feature-rich web map applications. This repository contains the frontend side of that ecosystem, including:

- Core frontend framework code
- Reusable bundles and plugins for application functionality
- Webpack-based build pipeline for Oskari applications
- Testing, localization, and maintenance tooling

## Main Contents

### 1. Core runtime framework

The core runtime is under the src folder and includes application bootstrapping, configuration handling, language and locale setup, user and theme wiring, and runtime service infrastructure.

Key responsibilities include:

- Loading application setup and environment configuration
- Starting bundle startup sequences
- Managing global frontend state and utilities
- Providing extension points for Oskari-based apps

### 2. Bundle library

Most end-user functionality is implemented as modular bundles, grouped by domain such as:

- framework
- mapping
- admin
- catalogue
- statistics
- service

These bundles act as building blocks for composing complete Oskari applications, including map tools, layer handling, search, analytics, publishing, and domain-specific UI features.

### 3. Public API structure and changelog

The api folder documents and organizes frontend API-level entities by domain, including framework and mapping related APIs.

The API changelog tracks additions, modifications, removals, RPC impact, and breaking changes, helping integrators and developers manage version upgrades safely.

### 4. UI component layer

Shared React-based UI components are in the React UI folder and are designed around Ant Design. This provides reusable UI primitives and common frontend patterns for bundle and app development.

### 5. Build and packaging system

The repository includes a full Webpack toolchain and supporting scripts for building app-specific frontend outputs.

Build logic includes:

- Generating entries per application setup
- Copying static resources and assets
- Producing distributable JS/CSS bundles
- Supporting both development and production workflows

### 6. Resources and included libraries

Shared static assets are maintained under resources, and bundled third-party libraries are included for compatibility and controlled usage in Oskari environments.

### 7. Testing and tooling

Testing infrastructure is based on Jest, with utilities for component and runtime testing. Additional scripts and tools support:

- Localization extraction and injection
- Bundle and locale validation
- Development mode helpers
- Diagnostics and tracing

## Architectural Summary

At a high level:

- src is the frontend kernel/runtime
- bundles provides modular feature implementations
- api defines and tracks public contract changes
- webpack and root configs drive build/distribution
- tests and tools support quality and maintainability

Together, these make this repository the central frontend framework and component/bundle library for building JavaScript applications on top of Oskari.

## Layered architecture diagram

```mermaid
flowchart TB
    %% Layers (top to bottom)
    APP[Application Configuration Layer]
    BUILD[Build and Packaging Layer]
    BUNDLE[Bundle Composition Layer]
    RUNTIME[Core Runtime Layer]
    PLATFORM[Browser and Oskari Environment]

    %% Layer details
    APP --> APP1[appsetup and environment config]
    APP --> APP2[domain feature selection]
    APP --> APP3[locales and theme choices]

    BUILD --> BUILD1[webpack configs and loaders]
    BUILD --> BUILD2[entry generation per app]
    BUILD --> BUILD3[asset copy and output bundles]

    BUNDLE --> B1[framework bundles]
    BUNDLE --> B2[mapping bundles]
    BUNDLE --> B3[admin and catalogue bundles]
    BUNDLE --> B4[statistics and service bundles]

    RUNTIME --> R1[application bootstrap]
    RUNTIME --> R2[bundle manager and lifecycle]
    RUNTIME --> R3[i18n, theming, events, utilities]
    RUNTIME --> R4[API and RPC integration points]

    PLATFORM --> P1[DOM, browser APIs, networking]
    PLATFORM --> P2[map libs and third-party dependencies]
    PLATFORM --> P3[static resources: icons, css, images]

    %% Flow between layers
    APP --> BUILD
    BUILD --> BUNDLE
    BUNDLE --> RUNTIME
    RUNTIME --> PLATFORM

    %% Cross-cutting concerns
    TESTS[Testing and Tooling]
    TESTS --> T1[Jest tests and setup]
    TESTS --> T2[RPC test harness]
    TESTS --> T3[localization and diagnostics scripts]

    TESTS -. validates .-> BUILD
    TESTS -. validates .-> BUNDLE
    TESTS -. validates .-> RUNTIME
```

## Startup sequence diagram

```mermaid
sequenceDiagram
    autonumber
    participant User as Browser User
    participant App as Oskari App Entry
    participant Loader as Runtime Loader
    participant API as AppSetup Source
    participant BM as Bundle Manager
    participant Bundles as Feature Bundles
    participant UI as React UI Components
    participant Map as Map and External Libs

    User->>App: Open application URL
    App->>Loader: Initialize frontend runtime
    Loader->>API: Request appsetup and env config
    API-->>Loader: Return startupSequence + configuration + env

    Loader->>Loader: Set language, locales, theme, user, urls
    Loader->>BM: Register bundle definitions
    BM-->>Loader: Bundle definitions installed

    loop For each startup bundle in sequence
        Loader->>BM: Create bundle and instance
        BM->>Bundles: Instantiate selected feature bundle
        Bundles-->>BM: Bundle instance ready
        BM-->>Loader: Instance created
        Loader->>Bundles: Start/process with config
        Bundles->>UI: Mount or update UI where needed
        Bundles->>Map: Attach map plugins/tools as needed
    end

    Loader-->>App: Startup complete
    App-->>User: Interactive Oskari application ready
```

## Bundle communication

```mermaid
sequenceDiagram
    autonumber
    participant A as Feature Bundle A
    participant S as Oskari Sandbox
    participant B as Feature Bundle B
    participant C as Feature Bundle C
    participant M as MapModule Service

    Note over A,C: Bundles do not call each other directly
    Note over A,C: Communication is routed through the Sandbox

    rect rgb(240, 248, 255)
    Note over A,S: 1) Request flow (command-style)
    A->>S: postRequestByName("AddMapLayerRequest", [layerId])
    S->>M: handleRequest(request)
    M-->>S: request handled
    S-->>A: (optional response / side effects visible via events)
    end

    rect rgb(245, 255, 245)
    Note over B,S: 2) Event flow (publish-subscribe)
    B->>S: registerForEventByName(this, "MapLayerEvent")
    S-->>B: subscription active

    A->>S: notifyAll("MapLayerEvent", eventData)
    S->>B: onEvent(MapLayerEvent)
    S->>C: onEvent(MapLayerEvent) if subscribed
    end

    rect rgb(255, 250, 240)
    Note over C,S: 3) Service flow (shared capability)
    C->>S: registerService(myService)
    S-->>C: service registered

    A->>S: getService("MyBundle.MyService")
    S-->>A: service instance
    A->>C: call service API through returned instance
    end

    Note over A,C: Typical pattern:
    Note over A,C: Request triggers state change -> service updates model -> sandbox emits events
```

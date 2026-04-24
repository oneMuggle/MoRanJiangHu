# Settings Panel Desktop-Mobile Unification Spec

## ADDED Requirements

### Requirement: Mobile Settings SHALL include all desktop Settings tabs

The mobile Settings modal MUST include all setting tabs available in the desktop version to ensure feature parity across devices.

#### Scenario: Mobile Settings shows IntegratedModelSettings tab

- **WHEN** mobile user navigates to Settings and selects "integrated_models" tab
- **THEN** mobile displays IntegratedModelSettings panel with complete configuration options

#### Scenario: Mobile Settings shows NpcManager tab

- **WHEN** mobile user navigates to Settings and selects "npc" tab  
- **THEN** mobile displays NpcManager panel for NPC CRUD operations

### Requirement: Mobile and Desktop Settings SHALL share identical Props API

The props interface for SettingsModal and MobileSettingsModal MUST be identical to ensure consistent data flow.

#### Scenario: Both modals receive same onSaveApi prop

- **WHEN** desktop Settings calls onSaveApi with API config
- **AND** mobile Settings calls onSaveApi with API config  
- **THEN** both receive identical prop signatures

### Requirement: SaveLoad modal SHALL be unified across devices

The SaveLoad functionality SHOULD use a single component with responsive layout instead of separate desktop/mobile implementations.

#### Scenario: SaveLoad uses responsive component

- **WHEN** user opens SaveLoad modal on either desktop or mobile
- **THEN** the same component renders with device-appropriate layout
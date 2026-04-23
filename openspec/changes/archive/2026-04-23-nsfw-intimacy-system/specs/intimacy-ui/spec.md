# Intimacy UI Specification

## ADDED Requirements

### Requirement: Intimacy interaction panel
The system SHALL display a panel for selecting intimate interactions.

#### Scenario: Player opens intimacy panel
- **WHEN** player clicks intimacy button on NPC panel
- **THEN** system SHALL display available interactions based on intimacy level

### Requirement: Interaction card display
The system SHALL show interaction options as selectable cards.

#### Scenario: Interactions displayed
- **WHEN** intimacy panel renders
- **THEN** interactions SHALL display as cards with name, description, required level

### Requirement: Locked interaction indication
The system SHALL show locked interactions with lock indicator.

#### Scenario: Locked interaction shown
- **WHEN** interaction requires higher intimacy level than current
- **THEN** interaction card SHALL show lock icon and required level

### Requirement: Mobile compatibility
The system SHALL support touch interactions on mobile devices.

#### Scenario: Mobile interaction
- **WHEN** player uses mobile device
- **THEN** intimacy panel SHALL be touch-friendly with appropriate sizing
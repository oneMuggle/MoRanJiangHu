# Intimacy System Specification

## ADDED Requirements

### Requirement: NPC intimacy data structure
The system SHALL maintain intimacy data for each NPC including favorability score (0-100) and intimacy level (1-5).

#### Scenario: New NPC created
- **WHEN** a new NPC enters the game
- **THEN** intimacy data SHALL be initialized with default values: favorability=0, level=1

#### Scenario: Favorability updated
- **WHEN** favorability value changes
- **THEN** intimacy level SHALL auto-calculate: level = floor(favorability / 20) + 1 (capped at 5)

### Requirement: Intimacy level display
The system SHALL display intimacy level (1-5) in the NPC panel.

#### Scenario: NPC panel rendered
- **WHEN** NPC panel displays
- **THEN** intimacy level SHALL be shown alongside favorability score

### Requirement: Intimacy unlock threshold
The system SHALL determine available interactions based on intimacy level.

#### Scenario: Player initiates interaction
- **WHEN** player selects an interaction at intimacy level N
- **THEN** system SHALL allow if NPC intimacy level >= N, otherwise deny with message
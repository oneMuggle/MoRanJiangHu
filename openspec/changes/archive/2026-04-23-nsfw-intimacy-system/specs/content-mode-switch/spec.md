# Content Mode Switch Specification

## ADDED Requirements

### Requirement: Content mode setting
The system SHALL allow users to switch between SFW and NSFW content modes.

#### Scenario: User toggles content mode
- **WHEN** user changes content mode in settings
- **THEN** system SHALL update mode and persist setting

### Requirement: Mode-appropriate content display
The system SHALL filter displayed content based on content mode.

#### Scenario: SFW mode active
- **WHEN** content mode is SFW
- **THEN** system SHALL only show non-intimate interactions (Lv1-2)

#### Scenario: NSFW mode active
- **WHEN** content mode is NSFW
- **THEN** system SHALL show all intimacy levels

### Requirement: Default mode
The system SHALL default to SFW mode for new players.

#### Scenario: New player starts game
- **WHEN** player creates new save
- **THEN** content mode SHALL default to SFW
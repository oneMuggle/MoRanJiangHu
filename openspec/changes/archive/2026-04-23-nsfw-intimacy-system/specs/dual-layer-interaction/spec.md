# Dual Layer Interaction Specification

## ADDED Requirements

### Requirement: Surface layer interaction
The system SHALL support non-intimate interactions available to all players.

#### Scenario: Surface interaction
- **WHEN** player selects surface interaction (聊天、散步、切磋武艺)
- **THEN** system SHALL allow without intimacy level requirement

### Requirement: Intimate layer interaction
The system SHALL support intimate interactions locked behind intimacy level.

#### Scenario: Intimate interaction requested
- **WHEN** player selects intimate interaction
- **THEN** system SHALL verify NPC intimacy level >= interaction required level before allowing

### Requirement: Dual layer prompt injection
The system SHALL inject appropriate prompts based on interaction layer.

#### Scenario: Interaction sent to AI
- **WHEN** interaction is sent to AI for generation
- **THEN** prompts SHALL include intimacy level context and layer-specific formatting
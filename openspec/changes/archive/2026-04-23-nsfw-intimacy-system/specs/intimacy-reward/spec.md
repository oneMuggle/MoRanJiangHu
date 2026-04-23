# Intimacy Reward Specification

## ADDED Requirements

### Requirement: Attribute reward from intimate interaction
The system SHALL grant attribute rewards when intimate interaction successfully completes.

#### Scenario: Intimate interaction completes
- **WHEN** intimate interaction (Lv3+) completes successfully
- **THEN** system SHALL award attribute points (力量/敏捷/体质/根骨/悟性福源随机一种 +1~3)

### Requirement: Kungfu insight reward
The system SHALL grant kungfu insight when high-level intimate interaction triggers.

#### Scenario: Lv4+ intimate interaction
- **WHEN** intimacy level 4 or 5 interaction completes
- **THEN** system MAY grant kungfu insight or inner power progress

### Requirement: Reward notification
The system SHALL display reward notifications to player.

#### Scenario: Reward granted
- **WHEN** intimacy reward is granted
- **THEN** system SHALL show notification with reward details
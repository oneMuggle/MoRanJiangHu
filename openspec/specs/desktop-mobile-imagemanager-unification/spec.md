# ImageManager Desktop-Mobile Unification Spec

## ADDED Requirements

### Requirement: Mobile ImageManager SHALL include all preset management features

The mobile ImageManager modal MUST include all preset management features available in the desktop version.

#### Scenario: Mobile manages Artist Presets

- **WHEN** mobile user manages artist presets in ImageManager
- **THEN** mobile supports create, edit, delete operations for artist presets

#### Scenario: Mobile manages Model Converter Presets

- **WHEN** mobile user manages model converter presets in ImageManager
- **THEN** mobile supports create, edit, delete operations for model converter presets

#### Scenario: Mobile manages Prompt Converter Presets

- **WHEN** mobile user manages prompt converter presets in ImageManager
- **THEN** mobile supports create, edit, delete operations for prompt converter presets

### Requirement: Mobile and Desktop ImageManager SHALL share identical preset APIs

The preset management functions in mobile and desktop ImageManager MUST use identical function signatures.

#### Scenario: Both platforms call onSaveArtistPreset

- **WHEN** desktop ImageManager saves artist preset
- **AND** mobile ImageManager saves artist preset
- **THEN** both use identical function signature: (preset: 画师串预设结构) => Promise<void>
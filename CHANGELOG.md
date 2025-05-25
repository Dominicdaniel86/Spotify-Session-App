# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0-beta.1] - 2025-05-25

## Added

- Option to disconnect the Spotify account again
- Provide more feedback for the user about the current Spotify account state
- Ensure smooth transitions between the different Spotify account states

## Changed

- Improved multiple aspects of the session management

## [1.1.2-beta.1] - 2025-05-24

## Changed

- Use backend API calls instead of cookies to determine the correct admin page view

## [1.1.1-beta.1] - 2025-05-24

### Changed

- Improved code quality, including the use of multiple enum values
- Standardized reading of environment variables

## [1.1.0-beta.1] - 2025-05-23

### Added

- Additional UI elements, such as popups, during the registration process

### Changed

- Enhanced stability and logging throughout the registration process
- Refactored and standardized various parts of the codebase

## [1.0.0-beta.1] - 2025-05-22

### Changed

- Updated the frontend to integrate with the new backend
- Stabilized core features for the initial official beta release

## [1.1.2-alpha.4] - 2025-05-20

## Added

- Very basic version of the algorithm

## [1.1.2-alpha.3] - 2025-05-20

## Added

- New APIs for the Admin to open and close music sessions
- New APIs for Guests to join or leave a music session

## Changed

- Updated the Admin control APIs to support the new authentication system

## [1.1.2-alpha.2] - 2025-05-19

## Added

- Own authentication and user management systems.

## Changed

- Adjusted the Spotify authentication, to match the new own authentication system.
- Implemented some features in the frontend. Some not, which might break some UI features.

## [1.1.2-alpha.1] - 2025-05-17

### Changed

- Major improvements to the frontend code.
- Better error handling and standardize the code.

## [1.1.1-alpha.1] - 2025-05-16

### Changed

- Major improvements to the backend code.
- Better error handling and standardize the code.

## [1.1.0-alpha.1] - 2025-05-16

### Added

- Improved CDK deployment and CDK related automation tasks
- Extended wiki pages for CDK and development related topics

### Fixed

- Fixed broken EC2 deployment (required updated packages & images)

## [1.0.1-alpha.2] - 2025-05-11

### Changed

- Updates multiple npm dependencies

## [1.0.1-alpha.1] - 2025-05-11

### Added

- Integrated Git hooks to automate pre-commit and pre-push checks.
- Added multiple automation scripts to the Makefile for improved workflow efficiency.
- Enhanced the wiki with detailed entries on development-related topics.

## [1.0.0-alpha.2] - 2025-05-11

### Added

- Added ESLint integration for consistent code quality and style enforcement.
- Added Prettier integration for automatic code formatting.
- Added Makefile for streamlined automation of development tasks.

### Changed

- Updated multiple commands and dependencies in the package.json

## [1.0.0-alpha.1] - 2025-05-07

### Added

- Introduced semantic versioning for the project, starting with 1.0.0-alpha.1.

### Changed

- Changed all version references to 1.0.0-alpha.1

## AWS Elemental Live

Control the AWS Elemental Live encoder.

## Configuration

- Enter the encoder's IP address in the module settings
- If user authentication is enabled on the encoder, check **Enable API Authentication** and enter the username and API key
  - The API key is not the user's password. An administrator can generate one in the encoder's web interface under **Settings > User Profile**
  - Authentication uses a timestamp, so the Companion machine's clock must be in sync with the encoder's (use NTP)

## Actions

- Start Live Event
- Stop Live Event
- Cancel Live Event
- Archive Live Event
- Reset Live Event
- Mute/Unmute Audio
- Set Audio Gain
- Insert SCTE35

## Feedback

- Live Event Status

## Variables

- event\__id_\_name
- event\__id_\_status
- event\__id_\_average_fps

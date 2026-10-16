## AWS Elemental Live

Control the AWS Elemental Live encoder.

## Configuration

- Enter the encoder's IP address in the module settings
- If user authentication is enabled on the encoder, check **Enable API Authentication** and enter the username and API key

  - The API key is not the user's password. An administrator can generate one in the encoder's web interface under **Settings > User Profile**
  - Authentication uses a timestamp, so the Companion machine's clock must be in sync with the encoder's (use NTP)

- The module polls only the events that buttons use in an action or feedback, every **Poll Interval** (default 500 ms). If a button only shows an event's variables, add that event to **Also Monitor Events**, or select **All Events** to poll every event. Status variables exist only for polled events.
- The module refreshes the event list and system status every 5 seconds.

## Actions

- Start / Stop / Cancel / Archive / Reset Live Event
- Mute/Unmute Audio
- Set Audio Gain
- Switch Input (by input label or ID, on a running event)
- Prepare Input
  - Decodes an input before you switch to it, so the switch happens faster. The encoder has two preparation slots, and each slot can be cancelled
- Image Overlay - Show / Hide
  - The event must have REST image insertion enabled, and the image (32-bit BMP, PNG or TGA, smaller than the output) must be on the encoder. The encoder ships an example at `/opt/elemental_se/web/public/example_files/Elemental_logo.png`
- Motion Overlay - Show / Hide
  - The event must have a motion image inserter with REST control enabled. Show takes a MOV file, the first file of a PNG sequence, or an HTML5 URL. Leave the path empty to replay the current motion overlay
- SCTE-35 - Insert Avail (Cue Out), Return to Network, Cancel Avail, Insert Time Signal
- Output - Start/Stop/Pause/Unpause
- Output Group - Start/Stop/Pause/Unpause (by group ID or name)

Event options list the events found on the encoder, and also accept a typed-in event ID.

## Feedback

- Live Event Status
- Live Event Has Alerts
- Audio Muted
  - The encoder does not report mute state, so this only reflects mute/gain changes sent from Companion
- Active Input
- Output Status
- System Status

## Variables

- system_status, system_cpu, system_memory, system_gpu
- event\__id_\_name
- event\__id_\_status
- event\__id_\_average_fps
- event\__id_\_duration (elapsed time, HH:MM:SS)
- event\__id_\_active_input
- event\__id_\_audio_level
- event\__id_\_alert_count
- event\__id_\_last_alert
- event\__id_\_output\__output id_\_status

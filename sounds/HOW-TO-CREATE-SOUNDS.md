# Creating Test Sound Files

Since you don't have sound files yet, here are quick ways to add them:

## Option 1: Quick Test Files (Silence)

Run these PowerShell commands in the `sounds/` folder to create silent WAV files for testing:

```powershell
cd sounds
# Create 1-second silent WAV files (44100 Hz, 16-bit, mono)
$header = [byte[]](0x52,0x49,0x46,0x46,0x24,0xAC,0x00,0x00,0x57,0x41,0x56,0x45,0x66,0x6D,0x74,0x20,0x10,0x00,0x00,0x00,0x01,0x00,0x01,0x00,0x44,0xAC,0x00,0x00,0x88,0x58,0x01,0x00,0x02,0x00,0x10,0x00,0x64,0x61,0x74,0x61,0x00,0xAC,0x00,0x00)
$silence = [byte[]](0x00) * 44100 * 2
$header + $silence | Set-Content -Path "sound1.wav" -Encoding Byte
$header + $silence | Set-Content -Path "sound2.wav" -Encoding Byte
$header + $silence | Set-Content -Path "sound3.wav" -Encoding Byte
$header + $silence | Set-Content -Path "sound4.wav" -Encoding Byte
$header + $silence | Set-Content -Path "sound5.wav" -Encoding Byte
$header + $silence | Set-Content -Path "sound6.wav" -Encoding Byte
```

## Option 2: Use Text-to-Speech (Windows)

Create actual test sounds using Windows TTS:

```powershell
cd sounds
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToWaveFile("sound1.wav")
$synth.Speak("Sound one")
$synth.SetOutputToWaveFile("sound2.wav")
$synth.Speak("Sound two")
$synth.SetOutputToWaveFile("sound3.wav")
$synth.Speak("Sound three")
$synth.SetOutputToWaveFile("sound4.wav")
$synth.Speak("Sound four")
$synth.SetOutputToWaveFile("sound5.wav")
$synth.Speak("Sound five")
$synth.SetOutputToWaveFile("sound6.wav")
$synth.Speak("Sound six")
$synth.Dispose()
```

## Option 3: Download Free Sounds

Visit these sites for free sound effects:
- [FreeSound.org](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)
- [SoundBible](https://soundbible.com/)

Download WAV files and rename them to sound1.wav, sound2.wav, etc.

## Option 4: Convert Existing Audio

Use FFmpeg or any audio converter to convert MP3/OGG to WAV:

```powershell
ffmpeg -i yourfile.mp3 sound1.wav
```

## Then Test!

After creating sound files:
1. Refresh the browser
2. Click the sound buttons
3. Test the audio output device selection

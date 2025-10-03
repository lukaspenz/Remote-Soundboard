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

Write-Host "Created 6 test sound files!" -ForegroundColor Green

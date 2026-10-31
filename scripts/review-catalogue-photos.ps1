$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
node scripts/review-photo-manifest.mjs
if ($LASTEXITCODE -ne 0) { throw 'Could not prepare photo review manifest.' }
$records = Get-Content -LiteralPath artifacts/catalogue-expansion/review-ready.json -Raw | ConvertFrom-Json
$font = New-Object System.Drawing.Font 'Arial',10
for ($start = 0; $start -lt $records.Count; $start += 5) {
  $count = [Math]::Min(5, $records.Count-$start)
  $sheet = New-Object System.Drawing.Bitmap 1400,($count*220)
  $graphics = [System.Drawing.Graphics]::FromImage($sheet)
  $graphics.Clear([System.Drawing.Color]::White)
  try {
    for ($row=0; $row -lt $count; $row++) {
      $record = $records[$start+$row]
      for ($column=0; $column -lt $record.photos.Count; $column++) {
        $photo = $record.photos[$column]
        $source = [System.Drawing.Image]::FromFile((Join-Path $projectRoot $photo.path))
        try { $graphics.DrawImage($source,$column*280,$row*220,280,187) } finally { $source.Dispose() }
        $graphics.DrawString(($record.id + ' / ' + $photo.name),$font,[System.Drawing.Brushes]::Black,$column*280+4,$row*220+189)
      }
    }
    $file = 'artifacts/catalogue-expansion/finish-review-' + ([int]($start/5)+1) + '.jpg'
    $sheet.Save((Join-Path $projectRoot $file),[System.Drawing.Imaging.ImageFormat]::Jpeg)
    Write-Output $file
  } finally {
    $graphics.Dispose()
    $sheet.Dispose()
  }
}
$font.Dispose()


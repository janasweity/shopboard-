$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
node scripts/review-page-images.mjs
if ($LASTEXITCODE -ne 0) { throw 'Could not prepare gallery image review.' }
$records = Get-Content -LiteralPath artifacts/page-imagery/gallery-review-ready.json -Raw | ConvertFrom-Json
$font = New-Object System.Drawing.Font 'Arial',10
for ($start=0; $start -lt $records.Count; $start+=5) {
  $count = [Math]::Min(5,$records.Count-$start)
  $sheet = New-Object System.Drawing.Bitmap 1280,($count*240)
  $graphics = [System.Drawing.Graphics]::FromImage($sheet)
  $graphics.Clear([System.Drawing.Color]::White)
  try {
    for ($row=0; $row -lt $count; $row++) {
      $record = $records[$start+$row]
      for ($column=0; $column -lt $record.photos.Count; $column++) {
        $photo = $record.photos[$column]
        $source = [System.Drawing.Image]::FromFile((Join-Path $projectRoot $photo.path))
        try { $graphics.DrawImage($source,$column*320,$row*240,320,213) } finally { $source.Dispose() }
        $graphics.DrawString(($record.id+' / '+$photo.name),$font,[System.Drawing.Brushes]::Black,$column*320+3,$row*240+215)
      }
    }
    $path = 'artifacts/page-imagery/gallery-review-' + ([int]($start/5)+1) + '.jpg'
    $sheet.Save((Join-Path $projectRoot $path),[System.Drawing.Imaging.ImageFormat]::Jpeg)
    Write-Output $path
  } finally { $graphics.Dispose(); $sheet.Dispose() }
}
$font.Dispose()

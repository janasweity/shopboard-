$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
$photos = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'accepted-page-photos.json') -Raw | ConvertFrom-Json
foreach ($folder in @('editorial','galleries')) { New-Item -ItemType Directory -Force -Path (Join-Path $projectRoot ('public/images/'+$folder)) | Out-Null }
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -EQ 'image/jpeg'
$parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
$parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 90L
foreach ($photo in $photos) {
  $target = Join-Path $projectRoot $photo.target
  if (Test-Path -LiteralPath $target) { continue }
  $source = [System.Drawing.Bitmap]::FromFile((Join-Path $projectRoot $photo.source))
  $canvas = New-Object System.Drawing.Bitmap 1536,1024
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  try {
    $graphics.Clear($source.GetPixel(0,0))
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $scale = [Math]::Min(1536/$source.Width,1024/$source.Height)
    $width = [int][Math]::Round($source.Width*$scale)
    $height = [int][Math]::Round($source.Height*$scale)
    $graphics.DrawImage($source,[int]((1536-$width)/2),[int]((1024-$height)/2),$width,$height)
    $canvas.Save($target,$encoder,$parameters)
  } finally { $graphics.Dispose(); $canvas.Dispose(); $source.Dispose() }
}
$parameters.Dispose()
Write-Output ('Prepared '+$photos.Count+' locally saved page and gallery images.')

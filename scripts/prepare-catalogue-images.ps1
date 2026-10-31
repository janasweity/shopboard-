# Run after generated source PNGs have been copied into public/images/curated.
# Fit, rather than crop or stretch, so every supplied product remains visible.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$records = node --input-type=module -e "import {products} from './src/data/catalog.js'; const images=products.flatMap(p=>p.variants.map(v=>({id:p.id,variant:v.id,image:v.image}))); console.log(JSON.stringify(images))" | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'Could not load the product image manifest.' }
$destination = Join-Path $projectRoot 'public/images/catalogue'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -EQ 'image/jpeg'
$parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
$parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 90L
foreach ($record in $records) {
  $sourcePath = Join-Path $projectRoot ('public' + $record.image)
  $target = Join-Path $destination ($record.id + '-' + $record.variant + '.jpg')
  if ([System.IO.Path]::GetFullPath($sourcePath) -eq [System.IO.Path]::GetFullPath($target)) { continue }
  $source = [System.Drawing.Bitmap]::FromFile($sourcePath)
  $canvas = New-Object System.Drawing.Bitmap 1536,1024
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  try {
    $graphics.Clear($source.GetPixel(0,0))
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $scale = [Math]::Min(1536 / $source.Width, 1024 / $source.Height)
    $width = [int][Math]::Round($source.Width * $scale)
    $height = [int][Math]::Round($source.Height * $scale)
    $graphics.DrawImage($source, [int]((1536-$width)/2), [int]((1024-$height)/2), $width, $height)
    $canvas.Save($target, $encoder, $parameters)
  } finally {
    $graphics.Dispose()
    $canvas.Dispose()
    $source.Dispose()
  }
}
$parameters.Dispose()
Write-Output ('Prepared ' + $records.Count + ' product photographs at 1536 x 1024.')

Get-ChildItem -Path src -Recurse -Include *.css,*.tsx,*.ts | ForEach-Object {
  $content = Get-Content $_.FullName -Raw
  $content = $content -replace '#ff6a00', '#1e40af'
  $content = $content -replace '#e55a00', '#1d4ed8'
  $content = $content -replace '#ffb380', '#93c5fd'
  $content = $content -replace 'rgba\(255,106,0', 'rgba(30,64,175'
  Set-Content $_.FullName $content
}
Write-Host "Done!"

Add-Type -Assembly 'System.IO.Compression.FileSystem'

$src = 'c:\Users\Dell\.gemini\antigravity-ide\scratch\gharseva'
$dest = 'c:\Users\Dell\Desktop\GharSeva.zip'
$exclude = @('node_modules', '.git', 'dist')

if (Test-Path $dest) { Remove-Item $dest }

$zip = [System.IO.Compression.ZipFile]::Open($dest, 'Create')

$files = Get-ChildItem -Path $src -Recurse -File | Where-Object {
    $rel = $_.FullName.Substring($src.Length + 1)
    $parts = $rel -split '\\'
    $skip = $false
    foreach ($p in $parts) {
        if ($exclude -contains $p) { $skip = $true; break }
    }
    -not $skip
}

foreach ($f in $files) {
    $entryName = 'gharseva/' + $f.FullName.Substring($src.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f.FullName, $entryName) | Out-Null
    Write-Host "Added: $entryName"
}

$zip.Dispose()

$info = Get-Item $dest
Write-Host ""
Write-Host "Done! GharSeva.zip saved to Desktop"
Write-Host ("Size: " + [math]::Round($info.Length / 1MB, 2) + " MB")

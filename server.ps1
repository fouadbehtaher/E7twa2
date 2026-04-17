$Port = 3000
$HostName = "0.0.0.0"
$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path

if ($env:PORT) {
    $Port = [int]$env:PORT
}

if ($env:HOST) {
    $HostName = $env:HOST
}

$MimeTypes = @{
    ".css"  = "text/css; charset=utf-8"
    ".gif"  = "image/gif"
    ".html" = "text/html; charset=utf-8"
    ".ico"  = "image/x-icon"
    ".jpeg" = "image/jpeg"
    ".jpg"  = "image/jpeg"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".txt"  = "text/plain; charset=utf-8"
}

function Send-Response {
    param(
        [System.Net.Sockets.NetworkStream]$Stream,
        [int]$StatusCode,
        [string]$StatusText,
        [byte[]]$Body,
        [string]$ContentType = "text/plain; charset=utf-8"
    )

    $headerText = @(
        "HTTP/1.1 $StatusCode $StatusText"
        "Content-Type: $ContentType"
        "Content-Length: $($Body.Length)"
        "Connection: close"
        "Access-Control-Allow-Origin: *"
        "Access-Control-Allow-Methods: GET, OPTIONS"
        "Access-Control-Allow-Headers: Content-Type"
        ""
        ""
    ) -join "`r`n"

    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerText)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    if ($Body.Length -gt 0) {
        $Stream.Write($Body, 0, $Body.Length)
    }
}

function Resolve-RequestPath {
    param([string]$RawPath)

    $requestPath = $RawPath.Split("?")[0]
    if ([string]::IsNullOrWhiteSpace($requestPath) -or $requestPath -eq "/") {
        return Join-Path $RootPath "index.html"
    }

    $decodedPath = [System.Uri]::UnescapeDataString($requestPath.TrimStart("/")) -replace "/", "\"
    $fullPath = [System.IO.Path]::GetFullPath((Join-Path $RootPath $decodedPath))
    $rootFullPath = [System.IO.Path]::GetFullPath($RootPath)

    if (-not $fullPath.StartsWith($rootFullPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $null
    }

    return $fullPath
}

function Get-LocalIPv4Addresses {
    $networkInterfaces = [System.Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces() |
        Where-Object { $_.OperationalStatus -eq [System.Net.NetworkInformation.OperationalStatus]::Up }

    $addresses = foreach ($networkInterface in $networkInterfaces) {
        foreach ($address in $networkInterface.GetIPProperties().UnicastAddresses) {
            if ($address.Address.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork) {
                continue
            }

            $ip = $address.Address.IPAddressToString
            if ($ip -like "127.*" -or $ip -like "169.254.*") {
                continue
            }

            $ip
        }
    }

    return $addresses | Select-Object -Unique
}

function Get-BindAddress {
    param([string]$RequestedHost)

    if ([string]::IsNullOrWhiteSpace($RequestedHost) -or $RequestedHost -eq "0.0.0.0" -or $RequestedHost -eq "*" -or $RequestedHost -eq "+") {
        return [System.Net.IPAddress]::Any
    }

    if ($RequestedHost -eq "localhost") {
        return [System.Net.IPAddress]::Loopback
    }

    try {
        return [System.Net.IPAddress]::Parse($RequestedHost)
    }
    catch {
        $resolvedAddress = [System.Net.Dns]::GetHostAddresses($RequestedHost) |
            Where-Object { $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork } |
            Select-Object -First 1

        if (-not $resolvedAddress) {
            throw "Could not resolve host '$RequestedHost'."
        }

        return $resolvedAddress
    }
}

$bindAddress = Get-BindAddress -RequestedHost $HostName
$listener = [System.Net.Sockets.TcpListener]::new($bindAddress, $Port)
$listener.Start()

Write-Host ""
Write-Host "============================================================"
Write-Host "Ehtewaa local server is running"
Write-Host "============================================================"
Write-Host "Local device: http://localhost:$Port/index.html"

if ($bindAddress.Equals([System.Net.IPAddress]::Any)) {
    $networkUrls = Get-LocalIPv4Addresses | ForEach-Object { "http://$_:$Port/index.html" }
    if ($networkUrls) {
        Write-Host "Recommended for other devices: $($networkUrls[0])"
        if ($networkUrls.Count -gt 1) {
            Write-Host "Additional network adapters:"
            foreach ($url in $networkUrls | Select-Object -Skip 1) {
                Write-Host "  $url"
            }
        }
    }
    else {
        Write-Host "Other devices can open the app using this computer IP and port."
    }
}
elseif (-not $bindAddress.Equals([System.Net.IPAddress]::Loopback)) {
    Write-Host "Other devices can open:"
    Write-Host "  http://$HostName:$Port/index.html"
}
else {
    Write-Host "LAN access is disabled. Set HOST=0.0.0.0 to allow other devices."
}

Write-Host "Host binding: $HostName:$Port"
Write-Host "============================================================"
Write-Host "Press Ctrl+C to stop"
Write-Host "============================================================"
Write-Host ""

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)

            $requestLine = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                continue
            }

            while (-not [string]::IsNullOrEmpty($reader.ReadLine())) { }

            $parts = $requestLine.Split(" ")
            if ($parts.Length -lt 2) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Bad Request")
                Send-Response -Stream $stream -StatusCode 400 -StatusText "Bad Request" -Body $body
                Write-Host "[400] $requestLine"
                continue
            }

            $method = $parts[0].ToUpperInvariant()
            $requestPath = $parts[1]

            if ($method -eq "OPTIONS") {
                Send-Response -Stream $stream -StatusCode 204 -StatusText "No Content" -Body ([byte[]]@())
                Write-Host "[204] $requestPath"
                continue
            }

            if ($method -ne "GET") {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed")
                Send-Response -Stream $stream -StatusCode 405 -StatusText "Method Not Allowed" -Body $body
                Write-Host "[405] $requestPath"
                continue
            }

            $filePath = Resolve-RequestPath -RawPath $requestPath
            if (-not $filePath) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
                Send-Response -Stream $stream -StatusCode 403 -StatusText "Forbidden" -Body $body
                Write-Host "[403] $requestPath"
                continue
            }

            if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 - Not Found</h1>")
                Send-Response -Stream $stream -StatusCode 404 -StatusText "Not Found" -Body $body -ContentType "text/html; charset=utf-8"
                Write-Host "[404] $requestPath"
                continue
            }

            $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
            $contentType = $MimeTypes[$extension]
            if (-not $contentType) {
                $contentType = "application/octet-stream"
            }

            $body = [System.IO.File]::ReadAllBytes($filePath)
            Send-Response -Stream $stream -StatusCode 200 -StatusText "OK" -Body $body -ContentType $contentType
            Write-Host "[200] $requestPath"
        }
        catch {
            Write-Host "[500] $($_.Exception.Message)"
        }
        finally {
            if ($reader) {
                $reader.Dispose()
            }
            if ($stream) {
                $stream.Dispose()
            }
            $client.Close()
            $reader = $null
            $stream = $null
        }
    }
}
finally {
    $listener.Stop()
}
